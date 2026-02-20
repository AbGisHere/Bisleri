# Bisleri AI

AI backend for the rural women entrepreneurship marketplace. Three services: product detection, demand insights, and smart pricing.

Built with FastAPI + PyTorch + Kimi K2.5 (via OpenRouter).

## Setup

```bash
cd ai
uv sync
cp .env.example .env
```

Add your [OpenRouter API key](https://openrouter.ai/settings/keys) to `.env`.

## Run

```bash
uv run python main.py
```

Server starts at `http://localhost:8000`. Docs at `/docs`.

## Services

### 1. Product Detection

Upload a product image, get object detections and auto-suggested categories.

Uses YOLOv8 with 20 rural product categories: handicraft, textile, pottery, jewelry, food_grain, spice, pickle, oil, basket_weaving, embroidery, leather_craft, metal_craft, wood_craft, bamboo_craft, jute_product, honey, dairy_product, organic_produce, herbal_product, handloom.

```bash
curl -X POST http://localhost:8000/api/detect/ \
  -F "file=@product.jpg"

curl http://localhost:8000/api/detect/categories
```

### 2. Demand Insights

AI-powered demand analysis using Kimi K2.5 with tool calling. The model autonomously searches the web, checks competitor listings, and analyzes seasonal patterns before generating its analysis.

**Tools available to the model:**
- `web_search` -- DuckDuckGo search for market trends and news
- `get_competitor_prices` -- scrapes Amazon.in, Flipkart, IndiaMART
- `get_seasonal_info` -- India-specific festival/seasonal demand data

```bash
# JSON response
curl -X POST http://localhost:8000/api/demand/ \
  -H "Content-Type: application/json" \
  -d '{"product_name": "handloom cotton saree", "category": "textile", "location": "Assam"}'

# SSE stream (real-time progress updates)
curl -X POST http://localhost:8000/api/demand/stream \
  -H "Content-Type: application/json" \
  -d '{"product_name": "handloom cotton saree"}'
```

### 3. AI Pricing

Smart pricing suggestions after competitor analysis. The model scrapes live prices, calculates margins, and recommends optimal pricing strategy.

**Tools available to the model:**
- `web_search` -- pricing research across the web
- `fetch_page` -- read full webpage content for detailed data
- `get_competitor_prices` -- multi-marketplace price scraping
- `calculate_margin` -- profit margin calculator with platform fees and shipping

```bash
# JSON response
curl -X POST http://localhost:8000/api/pricing/ \
  -H "Content-Type: application/json" \
  -d '{"product_name": "hand-embroidered cushion cover", "cost_price": 150, "category": "embroidery"}'

# SSE stream
curl -X POST http://localhost:8000/api/pricing/stream \
  -H "Content-Type: application/json" \
  -d '{"product_name": "hand-embroidered cushion cover"}'
```

## Training

### Download datasets

Pulls 7 Kaggle datasets and converts them to YOLO format.

```bash
uv sync --dev
uv run python training/download_datasets.py
```

### Train the model

```bash
uv run python training/train_product_detector.py \
  --data datasets/products/dataset.yaml \
  --epochs 50 \
  --batch 16
```

Trained weights are saved to `models/product_detector.pt` and loaded automatically on next server start.

## Project Structure

```
ai/
├── main.py                 # FastAPI entrypoint
├── config.py               # Settings (env vars)
├── pyproject.toml           # uv dependencies
├── routers/
│   ├── detection.py         # POST /api/detect/
│   ├── demand.py            # POST /api/demand/ + /api/demand/stream
│   └── pricing.py           # POST /api/pricing/ + /api/pricing/stream
├── services/
│   ├── llm_client.py        # OpenRouter client with tool calling loop + SSE streaming
│   ├── object_detection.py  # YOLOv8 product detector
│   ├── demand_insights.py   # Demand analysis (Kimi K2.5 + tools)
│   └── ai_pricing.py        # Pricing engine (Kimi K2.5 + tools)
├── scrapers/
│   ├── web_search.py        # DuckDuckGo/Google web search
│   └── marketplace.py       # Amazon.in, Flipkart, IndiaMART scrapers
├── training/
│   ├── download_datasets.py # Kaggle dataset downloader + YOLO converter
│   └── train_product_detector.py
├── models/                  # Trained weights (gitignored)
└── datasets/                # Raw + processed data (gitignored)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | -- | Required for demand/pricing services |
| `LLM_MODEL` | `moonshotai/kimi-k2.5` | Model ID on OpenRouter |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `YOLO_MODEL_PATH` | `models/product_detector.pt` | Path to trained YOLO weights |
| `YOLO_CONFIDENCE` | `0.25` | Detection confidence threshold |

## Cost

Kimi K2.5 via OpenRouter: **$0.50/M input tokens, $2.80/M output tokens**. A typical demand or pricing request with tool calls costs around $0.002-0.005.
