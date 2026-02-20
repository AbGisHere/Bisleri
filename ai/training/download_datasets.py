"""Download and prepare datasets from Kaggle for product detection training.

Prerequisites:
    Set up ~/.kaggle/kaggle.json with your API credentials

Usage:
    uv run python training/download_datasets.py
    uv run python training/download_datasets.py --skip-download
"""

import argparse
import os
import sys
import shutil
import random
import zipfile
from pathlib import Path

from PIL import Image
from loguru import logger
from tqdm import tqdm

DATASETS_DIR = Path("datasets/raw")
OUTPUT_DIR = Path("datasets/products")

KAGGLE_DATASETS = {
    "fashion_products": {
        "slug": "paramaggarwal/fashion-product-images-dataset",
        "categories": {
            "Saree": "handloom", "Kurta": "textile", "Dupatta": "textile",
            "Lehenga Choli": "textile", "Tops": "textile",
            "Dresses": "textile", "Shirts": "textile",
        },
    },
    "textile": {
        "slug": "saurabhshahane/textile-dataset",
        "categories": {
            "cotton": "textile", "silk": "handloom", "wool": "textile",
            "polyester": "textile", "denim": "textile",
        },
    },
    "clothing": {
        "slug": "agrigorev/clothing-dataset-full",
        "categories": {
            "Dress": "textile", "T-Shirt": "textile", "Shirt": "textile",
            "Shorts": "textile", "Skirt": "textile",
        },
    },
    "ten_fabrics": {
        "slug": "saharshakir/ten-fabrics-dataset-tfd",
        "categories": {"*": "handloom"},
    },
    "traditional_decor": {
        "slug": "olgabelitskaya/traditional-decor-patterns",
        "categories": {"*": "embroidery"},
    },
    "dress_patterns": {
        "slug": "nguyngiabol/dress-pattern-dataset",
        "categories": {"*": "embroidery"},
    },
    "indian_food": {
        "slug": "l33tc0d3r/indian-food-classification",
        "categories": {
            "dal": "food_grain", "rice": "food_grain", "chapati": "food_grain",
            "pickle": "pickle", "chutney": "pickle",
            "ladoo": "food_grain", "jalebi": "food_grain", "samosa": "food_grain",
        },
    },
    "indian_food_images": {
        "slug": "iamsouravbanerjee/indian-food-images-dataset",
        "categories": {
            "dal_makhani": "food_grain", "kadai_paneer": "food_grain",
            "pakode": "food_grain",
        },
    },
    "spices": {
        "slug": "jchymdvok/spices",
        "categories": {"*": "spice"},
    },
    "indonesian_spices": {
        "slug": "albertnathaniel12/indonesian-spices-dataset",
        "categories": {"*": "spice"},
    },
    "fruits_vegetables": {
        "slug": "kritikseth/fruit-and-vegetable-image-recognition",
        "categories": {"*": "organic_produce"},
    },
    "grocery": {
        "slug": "validmodel/grocery-store-dataset",
        "categories": {
            "Juice": "organic_produce", "Milk": "dairy_product",
            "Yoghurt": "dairy_product", "Cheese": "dairy_product",
            "Fruit": "organic_produce", "Vegetables": "organic_produce",
        },
    },
    "pottery": {
        "slug": "harasysodi/iranian-pottery",
        "categories": {"*": "pottery"},
    },
    "tanishq_jewelry": {
        "slug": "sapnilpatel/tanishq-jewellery-dataset",
        "categories": {"*": "jewelry"},
    },
    "jewelry": {
        "slug": "shauryachichra5/jewellery-dataset",
        "categories": {"*": "jewelry"},
    },
    "jewelry_db": {
        "slug": "harshjangid0015/jewelry-database",
        "categories": {"*": "jewelry"},
    },
    "handbags": {
        "slug": "dataclusterlabs/handbag-image-dataset-luggage-dataset",
        "categories": {"*": "leather_craft"},
    },
    "bags": {
        "slug": "ravirajsinh45/bags-classification",
        "categories": {"*": "leather_craft"},
    },
    "shoes": {
        "slug": "utkarshsaxenadn/shoes-classification-dataset-13k-images",
        "categories": {"*": "leather_craft"},
    },
    "medicinal_leaves": {
        "slug": "aryashah2k/indian-medicinal-leaves-dataset",
        "categories": {"*": "herbal_product"},
    },
    "medicinal_plants": {
        "slug": "warcoder/indian-medicinal-plant-image-dataset",
        "categories": {"*": "herbal_product"},
    },
    "ayurvedic": {
        "slug": "kagglekirti123/ayurgenixai-ayurvedic-dataset",
        "categories": {"*": "herbal_product"},
    },
    "bottles_cans": {
        "slug": "moezabid/bottles-and-cans",
        "categories": {"*": "oil"},
    },
    "bottles_cups": {
        "slug": "dataclusterlabs/bottles-and-cups-dataset",
        "categories": {"*": "oil"},
    },
    "product_images": {
        "slug": "freshersstaff/product-images-dataset",
        "categories": {"*": "handicraft"},
    },
}

CATEGORY_TO_ID = {
    "handicraft": 0, "textile": 1, "pottery": 2, "jewelry": 3,
    "food_grain": 4, "spice": 5, "pickle": 6, "oil": 7,
    "basket_weaving": 8, "embroidery": 9, "leather_craft": 10,
    "metal_craft": 11, "wood_craft": 12, "bamboo_craft": 13,
    "jute_product": 14, "honey": 15, "dairy_product": 16,
    "organic_produce": 17, "herbal_product": 18, "handloom": 19,
}


def _get_dataset_size(api, slug: str) -> int | None:
    try:
        datasets = api.dataset_list(search=slug.split("/")[-1])
        for ds in datasets:
            if str(ds) == slug:
                return ds.totalBytes
    except Exception:
        pass
    return None


def _download_with_progress(api, slug: str, dest: Path):
    dest.mkdir(parents=True, exist_ok=True)
    zip_path = dest / f"{slug.split('/')[-1]}.zip"

    total_bytes = _get_dataset_size(api, slug)
    size_str = f" ({total_bytes / 1024 / 1024:.1f} MB)" if total_bytes else ""
    logger.info(f"Downloading {slug}{size_str}")

    api.dataset_download_files(slug, path=str(dest), quiet=False)

    zips = list(dest.glob("*.zip"))
    if zips:
        for zf in zips:
            logger.info(f"Extracting {zf.name}...")
            with zipfile.ZipFile(zf, "r") as z:
                members = z.namelist()
                for member in tqdm(members, desc="Extracting", unit="file", leave=False):
                    z.extract(member, dest)
            zf.unlink()


def download_datasets():
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
    except ImportError:
        logger.error("kaggle not installed. Run: uv pip install kaggle")
        return False

    api = KaggleApi()
    try:
        api.authenticate()
    except Exception:
        logger.error("Kaggle auth failed. Place your kaggle.json at ~/.kaggle/kaggle.json")
        logger.error("Get it from: https://www.kaggle.com/settings -> API -> Create New Token")
        return False

    DATASETS_DIR.mkdir(parents=True, exist_ok=True)
    total = len(KAGGLE_DATASETS)

    for i, (name, info) in enumerate(KAGGLE_DATASETS.items(), 1):
        dest = DATASETS_DIR / name
        if dest.exists() and any(dest.iterdir()):
            logger.info(f"[{i}/{total}] Skipping {name} (already exists)")
            continue

        logger.info(f"[{i}/{total}] {name}")
        try:
            _download_with_progress(api, info["slug"], dest)
            logger.info(f"[{i}/{total}] Done: {name}")
        except Exception as e:
            logger.error(f"[{i}/{total}] Failed {name}: {e}")

    return True


def find_images(directory: Path) -> list[Path]:
    exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    images = []
    for ext in exts:
        images.extend(directory.rglob(f"*{ext}"))
        images.extend(directory.rglob(f"*{ext.upper()}"))
    return images


def create_yolo_label(class_id: int, output_path: Path):
    cx, cy = 0.5, 0.5
    bw = random.uniform(0.85, 0.95)
    bh = random.uniform(0.85, 0.95)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(f"{class_id} {cx:.4f} {cy:.4f} {bw:.4f} {bh:.4f}\n")


def _collect_image_jobs(info: dict, raw_dir: Path) -> list[tuple[Path, int, str]]:
    jobs = []
    if "*" in info["categories"]:
        target_category = list(info["categories"].values())[0]
        class_id = CATEGORY_TO_ID[target_category]
        for img_path in find_images(raw_dir):
            jobs.append((img_path, class_id, target_category))
    else:
        for folder_name, target_category in info["categories"].items():
            class_id = CATEGORY_TO_ID[target_category]
            matching_dirs = list(raw_dir.rglob(folder_name))
            if not matching_dirs:
                for d in raw_dir.rglob("*"):
                    if d.is_dir() and folder_name.lower() in d.name.lower():
                        matching_dirs.append(d)
            for match_dir in matching_dirs:
                if not match_dir.is_dir():
                    continue
                for img_path in find_images(match_dir):
                    jobs.append((img_path, class_id, target_category))
    return jobs


def prepare_dataset(train_split: float = 0.8):
    for split in ["train", "val"]:
        (OUTPUT_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
        (OUTPUT_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)

    stats = {cat: 0 for cat in CATEGORY_TO_ID}

    for dataset_name, info in KAGGLE_DATASETS.items():
        raw_dir = DATASETS_DIR / dataset_name
        if not raw_dir.exists():
            logger.warning(f"Skipping {dataset_name} (not downloaded)")
            continue

        jobs = _collect_image_jobs(info, raw_dir)
        if not jobs:
            logger.warning(f"No images found in {dataset_name}")
            continue

        for img_path, class_id, target_category in tqdm(
            jobs, desc=f"Processing {dataset_name}", unit="img"
        ):
            _place_image(img_path, class_id, target_category, train_split, stats)

    logger.info("Dataset stats:")
    for cat, count in sorted(stats.items(), key=lambda x: -x[1]):
        if count > 0:
            logger.info(f"  {cat}: {count} images")
    logger.info(f"  Total: {sum(stats.values())} images")

    _write_dataset_yaml()


def _place_image(img_path: Path, class_id: int, category: str, train_split: float, stats: dict):
    split = "train" if random.random() < train_split else "val"
    idx = stats[category]
    filename = f"{category}_{idx:05d}{img_path.suffix.lower()}"

    dest_img = OUTPUT_DIR / "images" / split / filename
    dest_lbl = OUTPUT_DIR / "labels" / split / (filename.rsplit(".", 1)[0] + ".txt")

    try:
        with Image.open(img_path) as img:
            if img.mode != "RGB":
                img = img.convert("RGB")
            img = img.resize((640, 640), Image.LANCZOS)
            img.save(dest_img, quality=90)
    except Exception as e:
        logger.warning(f"Failed to process {img_path}: {e}")
        return

    create_yolo_label(class_id, dest_lbl)
    stats[category] += 1


def _write_dataset_yaml():
    names_list = [name for name, _ in sorted(CATEGORY_TO_ID.items(), key=lambda x: x[1])]
    yaml_content = f"""path: {OUTPUT_DIR.resolve()}
train: images/train
val: images/val

nc: {len(CATEGORY_TO_ID)}
names: {names_list}
"""
    (OUTPUT_DIR / "dataset.yaml").write_text(yaml_content)
    logger.info(f"Dataset config written to {OUTPUT_DIR / 'dataset.yaml'}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-download", action="store_true")
    parser.add_argument("--train-split", type=float, default=0.8)
    args = parser.parse_args()

    if not args.skip_download:
        if not download_datasets():
            return

    prepare_dataset(train_split=args.train_split)
    logger.info("Done! Train with:")
    logger.info("  uv run python training/train_product_detector.py --data datasets/products/dataset.yaml")


if __name__ == "__main__":
    main()
