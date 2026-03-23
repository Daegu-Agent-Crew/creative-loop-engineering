"""
SwarmMind - Multi-agent Swarm Intelligence Prediction Engine
"""

__version__ = "0.1.0"
__author__ = "SwarmMind Team"

from swarm_mind.core.simulation import SwarmMind, SimulationEngine
from swarm_mind.core.orchestrator import Orchestrator
from swarm_mind.agents.base import BaseAgent, create_agent
from swarm_mind.agents.profiles import AgentProfile, AgentArchetype
from swarm_mind.report.analyzer import ResultAnalyzer
from swarm_mind.report.generator import ReportGenerator

__all__ = [
    "SwarmMind",
    "SimulationEngine",
    "Orchestrator", 
    "BaseAgent",
    "create_agent",
    "AgentProfile",
    "AgentArchetype",
    "ResultAnalyzer",
    "ReportGenerator",
]
