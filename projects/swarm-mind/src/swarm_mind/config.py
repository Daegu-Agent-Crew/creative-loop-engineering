"""
Configuration management for SwarmMind (pydantic v1 compatible)
"""

import os
from typing import Optional
from functools import lru_cache


class Settings:
    """Application settings loaded from environment"""
    
    def __init__(self):
        # Load from .env file if exists
        self._load_env_file()
        
        # LLM Configuration
        self.llm_api_key = os.getenv("LLM_API_KEY", "")
        self.llm_base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        self.llm_model_name = os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")
        
        # Optional Settings
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.max_agents = int(os.getenv("MAX_AGENTS", "500"))
        self.default_rounds = int(os.getenv("DEFAULT_ROUNDS", "10"))
    
    def _load_env_file(self):
        """Load .env file if it exists"""
        env_path = os.path.join(os.getcwd(), ".env")
        if not os.path.exists(env_path):
            # Try project root
            env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, value = line.split("=", 1)
                        os.environ[key.strip()] = value.strip()


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
