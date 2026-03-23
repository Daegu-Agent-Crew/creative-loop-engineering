"""
Simulation Engine - High-level simulation runner (sync version)
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

from swarm_mind.core.orchestrator import Orchestrator, SimulationResult
from swarm_mind.core.seed_parser import SeedParser, ParsedSeed
from swarm_mind.report.generator import ReportGenerator


class SimulationConfig(BaseModel):
    """Configuration for simulation"""
    num_agents: int = Field(default=30, ge=1, le=500)
    num_rounds: int = Field(default=5, ge=1, le=50)
    verbose: bool = True
    generate_report: bool = True
    report_format: str = "markdown"  # markdown, json, html


class SwarmMind:
    """
    Main entry point for SwarmMind engine (sync version).
    
    Simple API for running swarm intelligence simulations.
    """
    
    def __init__(
        self,
        llm_api_key: Optional[str] = None,
        llm_base_url: str = "https://api.openai.com/v1",
        llm_model: str = "gpt-4o-mini"
    ):
        """
        Initialize SwarmMind engine.
        
        Args:
            llm_api_key: OpenAI-compatible API key
            llm_base_url: Base URL for LLM API
            llm_model: Model name to use
        """
        import os
        
        self.llm_api_key = llm_api_key or os.getenv("LLM_API_KEY")
        self.llm_base_url = llm_base_url or os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        self.llm_model = llm_model or os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")
    
    def predict(
        self,
        seed_text: str,
        num_agents: int = 30,
        rounds: int = 5,
        verbose: bool = True
    ) -> SimulationResult:
        """
        Run a prediction simulation.
        
        Args:
            seed_text: The prediction question or scenario
            num_agents: Number of agents to spawn
            rounds: Number of simulation rounds
            verbose: Print progress information
            
        Returns:
            SimulationResult with predictions and analysis
        """
        config = SimulationConfig(
            num_agents=num_agents,
            num_rounds=rounds,
            verbose=verbose
        )
        
        return self._run(seed_text, config)
    
    def _run(self, seed_text: str, config: SimulationConfig) -> SimulationResult:
        """Sync simulation runner"""
        
        # Parse seed
        parser = SeedParser()
        parsed_seed = parser.parse(seed_text)
        
        # Create orchestrator
        orchestrator = Orchestrator(
            num_agents=config.num_agents,
            num_rounds=config.num_rounds,
            verbose=config.verbose
        )
        
        # Run simulation
        result = orchestrator.run_simulation(
            seed_text=seed_text,
            parsed_seed=parsed_seed
        )
        
        # Generate report if requested
        if config.generate_report:
            report_gen = ReportGenerator(result)
            result = report_gen.enhance_result(result, parsed_seed)
        
        return result
    
    def simulate(
        self,
        scenario: str,
        agents: int = 30,
        rounds: int = 10,
        output_file: Optional[str] = None
    ) -> SimulationResult:
        """
        Run a detailed simulation.
        
        Args:
            scenario: The scenario to simulate
            agents: Number of agents
            rounds: Number of rounds
            output_file: Optional file to save results
            
        Returns:
            SimulationResult
        """
        result = self.predict(
            seed_text=scenario,
            num_agents=agents,
            rounds=rounds,
            verbose=True
        )
        
        if output_file:
            self.save_result(result, output_file)
        
        return result
    
    @staticmethod
    def save_result(result: SimulationResult, filepath: str) -> None:
        """Save simulation result to file"""
        
        import json
        
        data = result.model_dump()
        data["started_at"] = data["started_at"].isoformat()
        data["completed_at"] = data["completed_at"].isoformat()
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    @staticmethod
    def load_result(filepath: str) -> SimulationResult:
        """Load simulation result from file"""
        
        import json
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        data["started_at"] = datetime.fromisoformat(data["started_at"])
        data["completed_at"] = datetime.fromisoformat(data["completed_at"])
        
        return SimulationResult(**data)


class SimulationEngine(SwarmMind):
    """Alias for SwarmMind for compatibility"""
    pass
