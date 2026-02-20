"""Fine-tune YOLOv8 on rural product categories.

Usage:
    uv run python training/train_product_detector.py --data dataset.yaml --epochs 50

Dataset structure expected:
    datasets/products/
      images/train/  images/val/
      labels/train/  labels/val/
      dataset.yaml
"""

import argparse
import shutil
from pathlib import Path

from ultralytics import YOLO


PRODUCT_CLASSES = [
    "handicraft", "textile", "pottery", "jewelry", "food_grain",
    "spice", "pickle", "oil", "basket_weaving", "embroidery",
    "leather_craft", "metal_craft", "wood_craft", "bamboo_craft",
    "jute_product", "honey", "dairy_product", "organic_produce",
    "herbal_product", "handloom",
]


def create_dataset_yaml(data_dir: Path) -> Path:
    yaml_path = data_dir / "dataset.yaml"
    if yaml_path.exists():
        return yaml_path

    content = f"""path: {data_dir.resolve()}
train: images/train
val: images/val

nc: {len(PRODUCT_CLASSES)}
names: {PRODUCT_CLASSES}
"""
    yaml_path.write_text(content)
    print(f"Created dataset config at {yaml_path}")
    return yaml_path


def train(data_path: str, epochs: int = 50, imgsz: int = 640, batch: int = 16):
    model = YOLO("yolov8n.pt")

    results = model.train(
        data=data_path,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        name="bisleri_products",
        project="runs",
        patience=10,
        save=True,
        plots=True,
        device="mps",
    )

    best_model = Path("runs/bisleri_products/weights/best.pt")
    target = Path("models/product_detector.pt")
    target.parent.mkdir(exist_ok=True)

    if best_model.exists():
        shutil.copy2(best_model, target)
        print(f"Best model saved to {target}")

    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, required=True, help="Path to dataset.yaml")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--create-yaml", type=str, help="Create dataset.yaml in given directory")
    args = parser.parse_args()

    if args.create_yaml:
        create_dataset_yaml(Path(args.create_yaml))
        return

    train(args.data, args.epochs, args.imgsz, args.batch)


if __name__ == "__main__":
    main()
