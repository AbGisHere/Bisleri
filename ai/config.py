from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openrouter_api_key: str = ""
    llm_model: str = "moonshotai/kimi-k2.5"
    host: str = "0.0.0.0"
    port: int = 8000

    # Object detection
    yolo_model_path: str = "models/product_detector.pt"
    yolo_confidence: float = 0.25

    model_config = {"env_file": ".env"}


settings = Settings()
