"""
Seed Parser - Parse seed text into structured simulation data
"""

from pydantic import BaseModel, Field
from typing import List, Optional
import re


class SeedEntity(BaseModel):
    """Entity extracted from seed text"""
    name: str
    entity_type: str = "unknown"
    relevance: float = Field(default=0.5, ge=0.0, le=1.0)
    description: Optional[str] = None


class SeedEvent(BaseModel):
    """Event extracted from seed text"""
    description: str
    actors: List[str] = []
    impact: str = "neutral"  # positive, negative, neutral
    probability: float = Field(default=0.5, ge=0.0, le=1.0)


class SeedContext(BaseModel):
    """Context information from seed text"""
    domain: str = "general"
    time_frame: str = "short-term"
    geography: str = "global"
    key_factors: List[str] = []


class ParsedSeed(BaseModel):
    """Parsed seed data ready for simulation"""
    raw_text: str
    entities: List[SeedEntity] = []
    events: List[SeedEvent] = []
    context: SeedContext = SeedContext()
    prediction_question: str = ""
    key_terms: List[str] = []


class SeedParser:
    """
    Parse seed text into structured simulation data.
    
    Simple heuristic-based parser for MVP. Can be enhanced with
    NLP/LLM-based extraction in future versions.
    """
    
    # Domain keywords
    DOMAIN_KEYWORDS = {
        "finance": ["주식", "시장", "금융", "투자", "stock", "market", "finance", "bitcoin", "crypto"],
        "technology": ["AI", "기술", "기계", "로봇", "technology", "software", "algorithm"],
        "politics": ["정책", "규제", "법", "정부", "policy", "regulation", "government", "election"],
        "society": ["사회", "여론", "사람", "시민", "society", "public", "opinion"],
        "environment": ["환경", "기후", "온난화", "environment", "climate", "carbon"],
    }
    
    # Impact keywords
    POSITIVE_KEYWORDS = ["성장", "증가", "발전", "growth", "increase", "success", "positive", "좋"]
    NEGATIVE_KEYWORDS = ["감소", "위기", "실패", "decrease", "crisis", "fail", "negative", "나쁘"]
    
    def __init__(self):
        pass
    
    def parse(self, seed_text: str) -> ParsedSeed:
        """Parse seed text into structured data"""
        
        # Extract prediction question (usually the input)
        prediction_question = self._extract_question(seed_text)
        
        # Extract entities
        entities = self._extract_entities(seed_text)
        
        # Extract events
        events = self._extract_events(seed_text)
        
        # Determine context
        context = self._extract_context(seed_text)
        
        # Extract key terms
        key_terms = self._extract_key_terms(seed_text)
        
        return ParsedSeed(
            raw_text=seed_text,
            entities=entities,
            events=events,
            context=context,
            prediction_question=prediction_question,
            key_terms=key_terms
        )
    
    def _extract_question(self, text: str) -> str:
        """Extract or formulate prediction question"""
        # If it's already a question, return as-is
        if "?" in text:
            return text
        
        # Otherwise, formulate as prediction question
        return f"{text}에 대한 예측"
    
    def _extract_entities(self, text: str) -> List[SeedEntity]:
        """Extract entities from text using heuristics"""
        entities = []
        
        # Simple capitalization-based entity extraction (English)
        capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        for name in capitalized[:10]:  # Limit to 10 entities
            entities.append(SeedEntity(
                name=name,
                entity_type="named_entity",
                relevance=0.6
            ))
        
        # Korean noun extraction (simplified)
        korean_words = re.findall(r'[\uac00-\ud7a3]+', text)
        for word in korean_words[:10]:
            if len(word) >= 2:  # Skip single characters
                entities.append(SeedEntity(
                    name=word,
                    entity_type="korean_term",
                    relevance=0.5
                ))
        
        return entities
    
    def _extract_events(self, text: str) -> List[SeedEvent]:
        """Extract events from text"""
        events = []
        
        # Split by sentence-like structures
        sentences = re.split(r'[.!?]', text)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Determine impact
            impact = "neutral"
            if any(kw in sentence.lower() for kw in self.POSITIVE_KEYWORDS):
                impact = "positive"
            elif any(kw in sentence.lower() for kw in self.NEGATIVE_KEYWORDS):
                impact = "negative"
            
            events.append(SeedEvent(
                description=sentence,
                impact=impact,
                probability=0.5
            ))
        
        return events[:20]  # Limit to 20 events
    
    def _extract_context(self, text: str) -> SeedContext:
        """Extract context information"""
        text_lower = text.lower()
        
        # Determine domain
        domain_scores = {}
        for domain, keywords in self.DOMAIN_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            domain_scores[domain] = score
        
        domain = max(domain_scores, key=domain_scores.get) if any(domain_scores.values()) else "general"
        
        # Determine time frame
        time_frame = "short-term"
        if any(kw in text_lower for kw in ["2025", "2026", "2027", "미래", "future", "long"]):
            time_frame = "long-term"
        elif any(kw in text_lower for kw in ["곧", "이번", "내년", "soon", "this year"]):
            time_frame = "short-term"
        
        return SeedContext(
            domain=domain,
            time_frame=time_frame,
            geography="global"
        )
    
    def _extract_key_terms(self, text: str) -> List[str]:
        """Extract key terms from text"""
        # Simple extraction - words with 3+ characters
        terms = re.findall(r'\b\w{3,}\b', text.lower())
        
        # Remove common words
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "be", "been", "being"}
        terms = [t for t in terms if t not in stop_words]
        
        # Return unique terms, limited
        return list(dict.fromkeys(terms))[:15]
