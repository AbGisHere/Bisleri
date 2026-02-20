# Bisleri AI

AI backend for the rural women entrepreneurship marketplace. Three services: product detection, demand insights, and smart pricing.

Built with FastAPI + PyTorch + MiniMax M2.5 (via OpenRouter).

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
# Detect products in an image
curl -X POST http://localhost:8000/api/detect/ \
  -F "file=@product.jpg"

# List all categories
curl http://localhost:8000/api/detect/categories
```

```json
{
  "detections": [
    {
      "class": "vase",
      "product_category": "pottery",
      "confidence": 0.87,
      "bbox": [12.0, 45.0, 380.0, 410.0]
    }
  ],
  "suggested_categories": ["pottery"],
  "object_count": 1
}
```

### 2. Demand Insights

AI-powered demand analysis using MiniMax M2.5 with tool calling. The model autonomously searches the web, checks competitor listings, and analyzes seasonal patterns before generating its analysis.

**Tools available to the model:**
- `web_search` -- DuckDuckGo search for market trends and news
- `get_competitor_prices` -- scrapes Amazon.in, Flipkart, IndiaMART
- `get_seasonal_info` -- India-specific festival/seasonal demand data

```bash
curl -X POST http://localhost:8000/api/demand/ \
  -H "Content-Type: application/json" \
  -d '{"product_name": "handloom cotton saree", "category": "textile", "location": "Assam"}'
```

### 3. AI Pricing

Smart pricing suggestions after competitor analysis. The model scrapes live prices, calculates margins, and recommends optimal pricing strategy.

**Tools available to the model:**
- `web_search` -- pricing research across the web
- `fetch_page` -- read full webpage content for detailed data
- `get_competitor_prices` -- multi-marketplace price scraping
- `calculate_margin` -- profit margin calculator with platform fees and shipping

```bash
curl -X POST http://localhost:8000/api/pricing/ \
  -H "Content-Type: application/json" \
  -d '{"product_name": "hand-embroidered cushion cover", "cost_price": 150, "category": "embroidery"}'
```

## Training

### Download datasets

Pulls 7 Kaggle datasets and converts them to YOLO format.

```bash
# Set up Kaggle credentials first
# https://www.kaggle.com/settings -> API -> Create New Token -> save to ~/.kaggle/kaggle.json

uv sync --dev
uv run python training/download_datasets.py
```

**Datasets used:**

| Source | Kaggle Slug | Categories |
|--------|-------------|------------|
| Fashion Product Images | `paramaggarwal/fashion-product-images-dataset` | textile |
| Textile Dataset | `saurabhshahane/textile-dataset` | textile |
| Indian Food Classification | `l33tc0d3r/indian-food-classification` | food_grain, pickle |
| Indian Food Images | `iamsouravbanerjee/indian-food-images-dataset` | food_grain |
| Grocery Store | `validmodel/grocery-store-dataset` | dairy_product, organic_produce |
| Iranian Pottery | `harasysodi/iranian-pottery` | pottery |
| Clothing Dataset Full | `agrigorev/clothing-dataset-full` | textile |

### Train the model

```bash
uv run python training/train_product_detector.py \
  --data datasets/products/dataset.yaml \
  --epochs 50 \
  --batch 16
```

Trained weights are saved to `models/product_detector.pt` and loaded automatically on next server start.

Change the device in `training/train_product_detector.py` to `cuda` (NVIDIA) or `cpu` if not on Apple Silicon.

## Project Structure

```
ai/
├── main.py                 # FastAPI entrypoint
├── config.py               # Settings (env vars)
├── pyproject.toml           # uv dependencies
├── routers/
│   ├── detection.py         # POST /api/detect/
│   ├── demand.py            # POST /api/demand/
│   └── pricing.py           # POST /api/pricing/
├── services/
│   ├── llm_client.py        # OpenRouter client with tool calling loop
│   ├── object_detection.py  # YOLOv8 product detector
│   ├── demand_insights.py   # Demand analysis (MiniMax + tools)
│   └── ai_pricing.py        # Pricing engine (MiniMax + tools)
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
| `MINIMAX_MODEL` | `minimax/minimax-m2.5` | Model ID on OpenRouter |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `YOLO_MODEL_PATH` | `models/product_detector.pt` | Path to trained YOLO weights |
| `YOLO_CONFIDENCE` | `0.25` | Detection confidence threshold |

## Cost

MiniMax M2.5 via OpenRouter: **$0.30/M input tokens, $1.20/M output tokens**. A typical demand or pricing request with tool calls costs around $0.001-0.003.
