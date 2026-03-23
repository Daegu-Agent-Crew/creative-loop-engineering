"""Simple config loader"""

import os

class Config:
    def __init__(self):
        self._load_env()
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        self.model = os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")
        self.max_rounds = int(os.getenv("MAX_SOCRATIC_ROUNDS", "10"))
    
    def _load_env(self):
        for env_file in [".env", "../.env", "../../.env"]:
            if os.path.exists(env_file):
                with open(env_file) as f:
                    for line in f:
                        if "=" in line and not line.startswith("#"):
                            k, v = line.strip().split("=", 1)
                            os.environ.setdefault(k, v)

config = Config()
