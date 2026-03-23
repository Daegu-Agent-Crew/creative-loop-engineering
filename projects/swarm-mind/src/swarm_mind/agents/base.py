"""
Base Agent - Core agent class with LLM integration
"""

from abc import ABC, abstractmethod
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import openai
import uuid
from datetime import datetime

from swarm_mind.config import get_settings
from swarm_mind.agents.profiles import AgentProfile, AgentArchetype


class AgentAction(BaseModel):
    """Record of an agent's action in simulation"""
    agent_id: str
    round_number: int
    action_type: str  # "analyze", "respond", "vote", etc.
    content: str
    sentiment: str = "neutral"  # positive, negative, neutral
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentMemory(BaseModel):
    """Agent's memory of simulation events"""
    actions: List[AgentAction] = []
    observations: List[str] = []
    interactions: Dict[str, List[str]] = {}  # agent_id -> messages
    
    def add_action(self, action: AgentAction) -> None:
        """Add an action to memory"""
        self.actions.append(action)
    
    def add_observation(self, observation: str) -> None:
        """Add an observation"""
        self.observations.append(observation)
    
    def add_interaction(self, other_agent_id: str, message: str) -> None:
        """Record interaction with another agent"""
        if other_agent_id not in self.interactions:
            self.interactions[other_agent_id] = []
        self.interactions[other_agent_id].append(message)


class BaseAgent(ABC):
    """
    Base class for all agents in the simulation.
    
    Handles LLM communication, memory management, and action execution.
    Uses openai<1.0 sync API for compatibility.
    """
    
    def __init__(self, profile: AgentProfile):
        self.profile = profile
        self.agent_id = profile.agent_id
        self.memory = AgentMemory()
        
        # Initialize LLM client (openai<1.0 style)
        settings = get_settings()
        openai.api_key = settings.llm_api_key
        openai.api_base = settings.llm_base_url
        self.model = settings.llm_model_name
    
    def think(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a response using the LLM (sync version).
        
        Args:
            prompt: The prompt to send to the LLM
            context: Additional context for the agent
            
        Returns:
            Generated response
        """
        # Build system message from profile
        system_message = self.profile.system_prompt
        
        # Add personality context
        personality = self.profile.personality
        personality_context = f"""
Your personality traits (0-1 scale):
- Openness: {personality.openness:.2f} (curiosity, creativity)
- Conscientiousness: {personality.conscientiousness:.2f} (organization, dependability)
- Extraversion: {personality.extraversion:.2f} (sociability, assertiveness)
- Agreeableness: {personality.agreeableness:.2f} (cooperation, trust)
- Neuroticism: {personality.neuroticism:.2f} (emotional stability)
"""
        
        # Build messages
        messages = [
            {"role": "system", "content": system_message + personality_context}
        ]
        
        # Add memory context if available
        if self.memory.observations:
            recent_obs = self.memory.observations[-5:]
            messages.append({
                "role": "user",
                "content": f"Recent observations:\n" + "\n".join(recent_obs)
            })
        
        # Add the main prompt
        messages.append({"role": "user", "content": prompt})
        
        # Call LLM (openai<1.0 style)
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            return f"[Error in thinking: {str(e)}]"
    
    def analyze_scenario(self, scenario: str, round_number: int) -> AgentAction:
        """
        Analyze a scenario and produce an action.
        
        Args:
            scenario: The scenario to analyze
            round_number: Current simulation round
            
        Returns:
            AgentAction with analysis results
        """
        prompt = f"""
Please analyze the following scenario from your perspective as a {self.profile.archetype}:

SCENARIO:
{scenario}

Provide your analysis including:
1. Your initial reaction
2. Key factors you consider important
3. Potential outcomes you foresee
4. Your confidence level

Keep your response concise (2-3 paragraphs).
"""
        
        response = self.think(prompt)
        
        # Determine sentiment
        sentiment = self._detect_sentiment(response)
        
        action = AgentAction(
            agent_id=self.agent_id,
            round_number=round_number,
            action_type="analyze",
            content=response,
            sentiment=sentiment
        )
        
        self.memory.add_action(action)
        return action
    
    def respond_to_agent(
        self,
        other_agent_id: str,
        other_agent_message: str,
        round_number: int
    ) -> AgentAction:
        """
        Respond to another agent's message.
        
        Args:
            other_agent_id: ID of the other agent
            other_agent_message: Message from the other agent
            round_number: Current simulation round
            
        Returns:
            AgentAction with response
        """
        prompt = f"""
Another agent ({other_agent_id}) said:

"{other_agent_message}"

As a {self.profile.archetype}, what is your response?
Consider your expertise: {', '.join(self.profile.expertise)}

Keep your response brief and focused.
"""
        
        response = self.think(prompt)
        sentiment = self._detect_sentiment(response)
        
        action = AgentAction(
            agent_id=self.agent_id,
            round_number=round_number,
            action_type="respond",
            content=response,
            sentiment=sentiment,
            metadata={"responding_to": other_agent_id}
        )
        
        self.memory.add_interaction(other_agent_id, response)
        self.memory.add_action(action)
        
        return action
    
    def observe(self, observation: str) -> None:
        """Add an observation to memory"""
        self.memory.add_observation(observation)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of the agent's state"""
        sentiments = [a.sentiment for a in self.memory.actions]
        
        return {
            "agent_id": self.agent_id,
            "archetype": self.profile.archetype,
            "total_actions": len(self.memory.actions),
            "sentiment_distribution": {
                "positive": sentiments.count("positive"),
                "negative": sentiments.count("negative"),
                "neutral": sentiments.count("neutral")
            },
            "recent_actions": [
                {
                    "round": a.round_number,
                    "type": a.action_type,
                    "sentiment": a.sentiment
                }
                for a in self.memory.actions[-5:]
            ]
        }
    
    def _detect_sentiment(self, text: str) -> str:
        """Simple sentiment detection"""
        text_lower = text.lower()
        
        positive_words = [
            "positive", "good", "great", "excellent", "optimistic",
            "growth", "success", "increase", "improve", "beneficial",
            "좋", "긍정", "성장", "성공", "희망"
        ]
        
        negative_words = [
            "negative", "bad", "poor", "terrible", "pessimistic",
            "decline", "fail", "decrease", "worse", "risk",
            "나쁘", "부정", "위험", "실패", "감소"
        ]
        
        positive_count = sum(1 for w in positive_words if w in text_lower)
        negative_count = sum(1 for w in negative_words if w in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def __repr__(self) -> str:
        return f"Agent({self.profile.archetype}, id={self.agent_id[:8]})"


def create_agent(
    archetype: AgentArchetype,
    domain: str = "general",
    agent_id: Optional[str] = None
) -> BaseAgent:
    """Factory function to create an agent"""
    
    if agent_id is None:
        agent_id = str(uuid.uuid4())
    
    profile = generate_agent_profile(agent_id, archetype, domain)
    
    class GenericAgent(BaseAgent):
        """Generic agent implementation"""
        pass
    
    return GenericAgent(profile)


# Import here to avoid circular imports
from swarm_mind.agents.profiles import generate_agent_profile
