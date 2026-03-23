"""Configuration management for SwarmMind."""

from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

load_dotenv()


class LLMConfig(BaseModel):
    """LLM provider configuration."""
    api_key: str = Field(default_factory=lambda: os.getenv("LLM_API_KEY", ""))
    base_url: str = Field(default_factory=lambda: os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"))
    model_name: str = Field(default_factory=lambda: os.getenv("LLM_MODEL_NAME", "gpt-4o-mini"))


class SimulationConfig(BaseModel):
    """Simulation parameters."""
    max_agents: int = Field(default_factory=lambda: int(os.getenv("MAX_AGENTS", "500")))
    default_rounds: int = Field(default_factory=lambda: int(os.getenv("DEFAULT_ROUNDS", "10")))
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))


class AppConfig(BaseModel):
    """Top-level application config."""
    llm: LLMConfig = Field(default_factory=LLMConfig)
    simulation: SimulationConfig = Field(default_factory=SimulationConfig)


def get_config() -> AppConfig:
    """Load and return application configuration."""
    return AppConfig()
