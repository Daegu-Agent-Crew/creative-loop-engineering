"""
Orchestrator - Spawn and manage agents, coordinate simulation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
import random

from swarm_mind.agents.base import BaseAgent, AgentAction, create_agent
from swarm_mind.agents.profiles import AgentArchetype, get_diverse_archetypes
from swarm_mind.core.seed_parser import ParsedSeed
from swarm_mind.core.knowledge_graph import KnowledgeGraph


class SimulationState(BaseModel):
    """Current state of the simulation"""
    round_number: int = 0
    total_rounds: int = 10
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    agent_count: int = 0
    total_actions: int = 0
    status: str = "initialized"  # initialized, running, completed, failed


class SimulationResult(BaseModel):
    """Results from a completed simulation"""
    simulation_id: str
    seed_question: str
    started_at: datetime
    completed_at: datetime
    duration_seconds: float
    total_rounds: int
    total_agents: int
    total_actions: int
    sentiment_distribution: Dict[str, int] = Field(default_factory=dict)
    top_narratives: List[str] = Field(default_factory=list)
    emerging_trends: List[str] = Field(default_factory=list)
    agent_summaries: List[Dict[str, Any]] = Field(default_factory=list)
    actions_log: List[Dict[str, Any]] = Field(default_factory=list)


class Orchestrator:
    """
    Main orchestrator for swarm simulation (sync version).
    
    Manages agent spawning, simulation execution, and result collection.
    """
    
    def __init__(
        self,
        num_agents: int = 30,
        num_rounds: int = 5,
        verbose: bool = True
    ):
        self.num_agents = num_agents
        self.num_rounds = num_rounds
        self.verbose = verbose
        self.console = Console() if verbose else None
        
        self.agents: List[BaseAgent] = []
        self.state = SimulationState(total_rounds=num_rounds)
        self.knowledge_graph = KnowledgeGraph()
        self.actions: List[AgentAction] = []
        self.parsed_seed: Optional[ParsedSeed] = None
    
    def spawn_agents(self, domain: str = "general") -> None:
        """Spawn diverse agents for simulation"""
        
        if self.console:
            self.console.print(f"[bold blue]Spawning {self.num_agents} agents...[/bold blue]")
        
        # Get diverse archetypes
        archetypes = get_diverse_archetypes(self.num_agents)
        
        # Create agents
        for i, archetype in enumerate(archetypes):
            agent = create_agent(
                archetype=archetype,
                domain=domain,
                agent_id=str(uuid.uuid4())
            )
            self.agents.append(agent)
            
            if self.console and i % 10 == 0:
                self.console.print(f"  Created agent {i+1}/{self.num_agents}: {archetype.value}")
        
        self.state.agent_count = len(self.agents)
        
        if self.console:
            self.console.print(f"[green]✓ Spawned {len(self.agents)} agents[/green]")
    
    def run_simulation(
        self,
        seed_text: str,
        parsed_seed: Optional[ParsedSeed] = None
    ) -> SimulationResult:
        """
        Run the complete simulation (sync version).
        
        Args:
            seed_text: Raw seed text for simulation
            parsed_seed: Pre-parsed seed data (optional)
            
        Returns:
            SimulationResult with all outputs
        """
        self.state.started_at = datetime.now()
        self.state.status = "running"
        
        # Parse seed if not provided
        if parsed_seed:
            self.parsed_seed = parsed_seed
        else:
            from swarm_mind.core.seed_parser import SeedParser
            parser = SeedParser()
            self.parsed_seed = parser.parse(seed_text)
        
        # Spawn agents
        domain = self.parsed_seed.context.domain
        self.spawn_agents(domain)
        
        if self.console:
            self.console.print(f"\n[bold]Starting simulation[/bold]")
            self.console.print(f"  Question: {self.parsed_seed.prediction_question}")
            self.console.print(f"  Domain: {domain}")
            self.console.print(f"  Agents: {len(self.agents)}")
            self.console.print(f"  Rounds: {self.num_rounds}\n")
        
        # Run simulation rounds
        try:
            self._run_rounds()
            self.state.status = "completed"
        except Exception as e:
            self.state.status = "failed"
            if self.console:
                self.console.print(f"[red]Simulation failed: {e}[/red]")
            raise
        
        self.state.completed_at = datetime.now()
        
        # Generate result
        result = self._generate_result()
        
        if self.console:
            self._print_summary(result)
        
        return result
    
    def _run_rounds(self) -> None:
        """Execute all simulation rounds"""
        
        for round_num in range(1, self.num_rounds + 1):
            self.state.round_number = round_num
            
            if self.console:
                self.console.print(f"\n[bold cyan]━━━ Round {round_num}/{self.num_rounds} ━━━[/bold cyan]")
            
            # Each agent analyzes the scenario
            self._run_round(round_num)
            
            self.state.total_actions = len(self.actions)
    
    def _run_round(self, round_num: int) -> None:
        """Run a single simulation round"""
        
        # Build scenario context for this round
        scenario = self._build_scenario(round_num)
        
        # Process agents in batches
        batch_size = 5
        for i in range(0, len(self.agents), batch_size):
            batch = self.agents[i:i+batch_size]
            
            for agent in batch:
                try:
                    action = agent.analyze_scenario(scenario, round_num)
                    self.actions.append(action)
                    
                    # Update knowledge graph
                    self.knowledge_graph.update_from_simulation([
                        {
                            "agent_id": action.agent_id,
                            "round": action.round_number,
                            "content": action.content[:100],
                            "sentiment": action.sentiment
                        }
                    ])
                except Exception as e:
                    if self.console:
                        self.console.print(f"[yellow]Agent error: {e}[/yellow]")
        
        # Some agents interact with each other
        self._run_interactions(round_num)
    
    def _run_interactions(self, round_num: int) -> None:
        """Run agent-to-agent interactions"""
        
        if len(self.agents) < 2:
            return
        
        num_interactions = min(5, len(self.agents) // 2)
        
        for _ in range(num_interactions):
            # Pick two random agents
            agent1, agent2 = random.sample(self.agents, 2)
            
            # Get agent1's recent action
            if agent1.memory.actions:
                recent_action = agent1.memory.actions[-1]
                
                try:
                    # Agent2 responds
                    response = agent2.respond_to_agent(
                        agent1.agent_id,
                        recent_action.content,
                        round_num
                    )
                    self.actions.append(response)
                except Exception as e:
                    if self.console:
                        self.console.print(f"[yellow]Interaction error: {e}[/yellow]")
    
    def _build_scenario(self, round_num: int) -> str:
        """Build scenario text for current round"""
        
        base_scenario = self.parsed_seed.prediction_question
        
        # Add context
        context_parts = [
            f"Round {round_num} of {self.num_rounds}",
            f"Domain: {self.parsed_seed.context.domain}",
        ]
        
        # Add recent insights from previous rounds
        if round_num > 1:
            recent_actions = [
                a for a in self.actions 
                if a.round_number == round_num - 1
            ][:5]
            
            if recent_actions:
                context_parts.append("\nRecent insights from previous round:")
                for action in recent_actions:
                    agent = next(
                        (a for a in self.agents if a.agent_id == action.agent_id),
                        None
                    )
                    if agent:
                        context_parts.append(
                            f"- {agent.profile.archetype}: {action.content[:100]}..."
                        )
        
        return f"{base_scenario}\n\nContext:\n" + "\n".join(context_parts)
    
    def _generate_result(self) -> SimulationResult:
        """Generate final result from simulation"""
        
        # Calculate sentiment distribution
        sentiments = [a.sentiment for a in self.actions]
        sentiment_distribution = {
            "positive": sentiments.count("positive"),
            "negative": sentiments.count("negative"),
            "neutral": sentiments.count("neutral")
        }
        
        # Extract narratives (simplified)
        top_narratives = self._extract_narratives()
        emerging_trends = self._extract_trends()
        
        # Get agent summaries
        agent_summaries = [agent.get_summary() for agent in self.agents]
        
        # Actions log
        actions_log = [
            {
                "agent_id": a.agent_id,
                "round": a.round_number,
                "type": a.action_type,
                "sentiment": a.sentiment,
                "content_preview": a.content[:100]
            }
            for a in self.actions
        ]
        
        duration = (self.state.completed_at - self.state.started_at).total_seconds()
        
        return SimulationResult(
            simulation_id=str(uuid.uuid4()),
            seed_question=self.parsed_seed.prediction_question,
            started_at=self.state.started_at,
            completed_at=self.state.completed_at,
            duration_seconds=duration,
            total_rounds=self.num_rounds,
            total_agents=len(self.agents),
            total_actions=len(self.actions),
            sentiment_distribution=sentiment_distribution,
            top_narratives=top_narratives,
            emerging_trends=emerging_trends,
            agent_summaries=agent_summaries,
            actions_log=actions_log
        )
    
    def _extract_narratives(self) -> List[str]:
        """Extract key narratives from actions (simplified)"""
        
        narratives = []
        
        # Get most common positive and negative themes
        positive_actions = [a for a in self.actions if a.sentiment == "positive"]
        negative_actions = [a for a in self.actions if a.sentiment == "negative"]
        
        if positive_actions:
            narratives.append(f"Optimistic outlook: {len(positive_actions)} positive analyses")
        
        if negative_actions:
            narratives.append(f"Cautionary signals: {len(negative_actions)} negative analyses")
        
        # Add some sample insights
        sample_actions = self.actions[:5]
        for action in sample_actions:
            if len(action.content) > 50:
                narratives.append(action.content[:100] + "...")
        
        return narratives[:5]
    
    def _extract_trends(self) -> List[str]:
        """Extract emerging trends (simplified)"""
        
        trends = []
        
        # Check sentiment shift across rounds
        round_sentiments = {}
        for action in self.actions:
            round_num = action.round_number
            if round_num not in round_sentiments:
                round_sentiments[round_num] = {"positive": 0, "negative": 0, "neutral": 0}
            round_sentiments[round_num][action.sentiment] += 1
        
        # Detect trends
        if len(round_sentiments) >= 2:
            rounds = sorted(round_sentiments.keys())
            first_round = round_sentiments[rounds[0]]
            last_round = round_sentiments[rounds[-1]]
            
            if last_round["positive"] > first_round["positive"]:
                trends.append("Increasing optimism over time")
            elif last_round["negative"] > first_round["negative"]:
                trends.append("Increasing concern over time")
        
        return trends
    
    def _print_summary(self, result: SimulationResult) -> None:
        """Print simulation summary"""
        
        if not self.console:
            return
        
        self.console.print("\n" + "="*60)
        self.console.print("[bold green]SIMULATION COMPLETE[/bold green]")
        self.console.print("="*60)
        
        self.console.print(f"\n[bold]Summary:[/bold]")
        self.console.print(f"  Question: {result.seed_question}")
        self.console.print(f"  Duration: {result.duration_seconds:.1f} seconds")
        self.console.print(f"  Agents: {result.total_agents}")
        self.console.print(f"  Rounds: {result.total_rounds}")
        self.console.print(f"  Actions: {result.total_actions}")
        
        self.console.print(f"\n[bold]Sentiment Distribution:[/bold]")
        for sentiment, count in result.sentiment_distribution.items():
            bar = "█" * (count // 2)
            self.console.print(f"  {sentiment:8s}: {bar} ({count})")
        
        self.console.print(f"\n[bold]Top Narratives:[/bold]")
        for i, narrative in enumerate(result.top_narratives[:3], 1):
            self.console.print(f"  {i}. {narrative}")
        
        if result.emerging_trends:
            self.console.print(f"\n[bold]Emerging Trends:[/bold]")
            for trend in result.emerging_trends:
                self.console.print(f"  • {trend}")
