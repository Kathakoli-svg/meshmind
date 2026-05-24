"""
SocLoop item detection pipeline:
1. YOLOv8 detection  → fast, accurate for 80 COCO classes
2. YOLOv8 classification → 1000 ImageNet classes fallback
3. CLIP zero-shot → classifies ANYTHING directly into SocLoop categories

Returns a plain string — the most specific category detected:
  "Shoes", "Shirts / Tops", "Pants / Bottoms", "Jackets / Coats",
  "Dresses", "Accessories", "Books", "Electronics",
  "School Supplies", "Utility Items"
"""

import io
from PIL import Image
from ultralytics import YOLO

# Default category when all detection methods fail or an error occurs
FALLBACK_CATEGORY = "Utility Items"

# ── Models (loaded once at startup) ─────────────────────────────────────────
_det_model = None
_cls_model = None
_clip_pipe = None


def _get_det_model():
    global _det_model
    if _det_model is None:
        _det_model = YOLO("yolov8n.pt")
    return _det_model


def _get_cls_model():
    global _cls_model
    if _cls_model is None:
        _cls_model = YOLO("yolov8n-cls.pt")
    return _cls_model


def _get_clip():
    global _clip_pipe
    if _clip_pipe is None:
        from transformers import pipeline
        _clip_pipe = pipeline(
            "zero-shot-image-classification",
            model="openai/clip-vit-base-patch32",
        )
    return _clip_pipe


# ── COCO detection → granular category ───────────────────────────────────────
DETECTION_MAP: dict[str, str] = {
    # Books
    "book":             "Books",

    # Shoes
    "shoe":             "Shoes",
    "boot":             "Shoes",
    "sandal":           "Shoes",
    "sneaker":          "Shoes",

    # Shirts / Tops
    "shirt":            "Shirts / Tops",
    "sweater":          "Shirts / Tops",
    "hoodie":           "Shirts / Tops",

    # Pants / Bottoms
    "pants":            "Pants / Bottoms",
    "shorts":           "Pants / Bottoms",
    "skirt":            "Pants / Bottoms",
    "jeans":            "Pants / Bottoms",

    # Jackets / Coats
    "jacket":           "Jackets / Coats",
    "coat":             "Jackets / Coats",

    # Dresses
    "dress":            "Dresses",

    # Accessories
    "tie":              "Accessories",
    "suitcase":         "Accessories",
    "handbag":          "Accessories",
    "backpack":         "Accessories",
    "hat":              "Accessories",
    "cap":              "Accessories",
    "helmet":           "Accessories",
    "glasses":          "Accessories",
    "sunglasses":       "Accessories",
    "scarf":            "Accessories",
    "glove":            "Accessories",
    "mitten":           "Accessories",
    "watch":            "Accessories",
    "belt":             "Accessories",
    "sock":             "Accessories",

    # Electronics
    "laptop":           "Electronics",
    "tv":               "Electronics",
    "cell phone":       "Electronics",
    "remote":           "Electronics",
    "keyboard":         "Electronics",
    "mouse":            "Electronics",
    "microwave":        "Electronics",
    "oven":             "Electronics",
    "toaster":          "Electronics",
    "refrigerator":     "Electronics",
    "monitor":          "Electronics",
    "tablet":           "Electronics",
    "camera":           "Electronics",
    "headphones":       "Electronics",
    "earphone":         "Electronics",
    "speaker":          "Electronics",
    "radio":            "Electronics",
    "printer":          "Electronics",
    "projector":        "Electronics",
    "game controller":  "Electronics",

    # School Supplies
    "scissors":         "School Supplies",
    "pen":              "School Supplies",
    "pencil":           "School Supplies",
    "ruler":            "School Supplies",
    "eraser":           "School Supplies",
    "calculator":       "School Supplies",
    "crayon":           "School Supplies",

    # Utility Items
    "bottle":           "Utility Items",
    "cup":              "Utility Items",
    "bowl":             "Utility Items",
    "vase":             "Utility Items",
    "clock":            "Utility Items",
    "chair":            "Utility Items",
    "couch":            "Utility Items",
    "umbrella":         "Utility Items",
    "bed":              "Utility Items",
    "dining table":     "Utility Items",
    "sink":             "Utility Items",
    "sports ball":      "Utility Items",
    "tennis racket":    "Utility Items",
    "skateboard":       "Utility Items",
    "bicycle":          "Utility Items",
    "bench":            "Utility Items",
    "knife":            "Utility Items",
    "fork":             "Utility Items",
    "spoon":            "Utility Items",
    "pot":              "Utility Items",
    "pan":              "Utility Items",
    "mug":              "Utility Items",
    "plate":            "Utility Items",
    "lamp":             "Utility Items",
    "pillow":           "Utility Items",
    "blanket":          "Utility Items",
    "towel":            "Utility Items",
    "bag":              "Utility Items",
    "box":              "Utility Items",
    "bucket":           "Utility Items",
    "broom":            "Utility Items",
    "basket":           "Utility Items",
}


# ── ImageNet classification → granular category ───────────────────────────────
IMAGENET_MAP: dict[str, str] = {
    # Shoes
    "sandal":           "Shoes",
    "shoe":             "Shoes",
    "boot":             "Shoes",
    "sneaker":          "Shoes",
    "running_shoe":     "Shoes",
    "tennis_shoe":      "Shoes",
    "athletic_shoe":    "Shoes",
    "loafer":           "Shoes",
    "clog":             "Shoes",
    "moccasin":         "Shoes",
    "platform_shoe":    "Shoes",
    "stiletto":         "Shoes",
    "high_heel":        "Shoes",
    "slipper":          "Shoes",

    # Shirts / Tops
    "jersey":           "Shirts / Tops",
    "pullover":         "Shirts / Tops",
    "sweatshirt":       "Shirts / Tops",
    "cardigan":         "Shirts / Tops",
    "brassiere":        "Shirts / Tops",
    "bikini":           "Shirts / Tops",
    "maillot":          "Shirts / Tops",
    "pajama":           "Shirts / Tops",
    "vestment":         "Shirts / Tops",

    # Pants / Bottoms
    "jean":             "Pants / Bottoms",
    "jeans":            "Pants / Bottoms",
    "miniskirt":        "Pants / Bottoms",
    "skirt":            "Pants / Bottoms",
    "sock":             "Pants / Bottoms",
    "stocking":         "Pants / Bottoms",
    "diaper":           "Pants / Bottoms",
    "sarong":           "Pants / Bottoms",

    # Jackets / Coats
    "coat":             "Jackets / Coats",
    "suit":             "Jackets / Coats",
    "trench_coat":      "Jackets / Coats",
    "fur_coat":         "Jackets / Coats",
    "poncho":           "Jackets / Coats",
    "cloak":            "Jackets / Coats",
    "kimono":           "Jackets / Coats",
    "abaya":            "Jackets / Coats",

    # Dresses
    "gown":             "Dresses",
    "dress":            "Dresses",

    # Accessories
    "hat":              "Accessories",
    "cap":              "Accessories",
    "scarf":            "Accessories",
    "mitten":           "Accessories",
    "glove":            "Accessories",
    "helmet":           "Accessories",
    "glasses":          "Accessories",
    "sunglass":         "Accessories",
    "tie":              "Accessories",
    "watch":            "Accessories",
    "belt":             "Accessories",
    "handbag":          "Accessories",
    "purse":            "Accessories",
    "wallet":           "Accessories",
    "backpack":         "Accessories",
    "suitcase":         "Accessories",
    "apron":            "Accessories",

    # Books
    "book":             "Books",
    "notebook":         "Books",
    "magazine":         "Books",
    "book_jacket":      "Books",
    "comic_book":       "Books",
    "textbook":         "Books",
    "novel":            "Books",

    # Electronics
    "laptop":           "Electronics",
    "desktop_computer": "Electronics",
    "monitor":          "Electronics",
    "keyboard":         "Electronics",
    "mouse":            "Electronics",
    "hard_disk":        "Electronics",
    "printer":          "Electronics",
    "camera":           "Electronics",
    "phone":            "Electronics",
    "television":       "Electronics",
    "radio":            "Electronics",
    "headphone":        "Electronics",
    "earphone":         "Electronics",
    "speaker":          "Electronics",
    "remote_control":   "Electronics",
    "tablet":           "Electronics",
    "projector":        "Electronics",
    "game_controller":  "Electronics",
    "joystick":         "Electronics",

    # School Supplies
    "pencil":           "School Supplies",
    "pen":              "School Supplies",
    "eraser":           "School Supplies",
    "ruler":            "School Supplies",
    "calculator":       "School Supplies",
    "crayon":           "School Supplies",
    "scissors":         "School Supplies",
    "stapler":          "School Supplies",
    "sharpener":        "School Supplies",
    "highlighter":      "School Supplies",
    "marker":           "School Supplies",
    "compass":          "School Supplies",
    "protractor":       "School Supplies",

    # Utility Items
    "bottle":           "Utility Items",
    "cup":              "Utility Items",
    "mug":              "Utility Items",
    "bowl":             "Utility Items",
    "plate":            "Utility Items",
    "vase":             "Utility Items",
    "clock":            "Utility Items",
    "lamp":             "Utility Items",
    "chair":            "Utility Items",
    "table":            "Utility Items",
    "umbrella":         "Utility Items",
    "bucket":           "Utility Items",
    "basket":           "Utility Items",
    "broom":            "Utility Items",
    "pot":              "Utility Items",
    "pan":              "Utility Items",
    "knife":            "Utility Items",
    "fork":             "Utility Items",
    "spoon":            "Utility Items",
    "pillow":           "Utility Items",
    "blanket":          "Utility Items",
    "towel":            "Utility Items",
    "box":              "Utility Items",
    "candle":           "Utility Items",
    "mirror":           "Utility Items",
    "hanger":           "Utility Items",
    "lock":             "Utility Items",
    "key":              "Utility Items",
}


# ── CLIP candidate labels → granular category ─────────────────────────────────
CLIP_LABELS: dict[str, list[str]] = {
    "Shoes": [
        "a pair of shoes", "sneakers", "boots", "sandals",
        "athletic shoes", "high heels", "footwear", "a pair of Air Jordans",
        "running shoes", "loafers", "slippers", "a shoe",
    ],
    "Shirts / Tops": [
        "a shirt", "a t-shirt", "a blouse", "a sweater",
        "a hoodie", "a sweatshirt", "a tank top", "a polo shirt",
        "a crop top", "a jersey", "a pullover",
    ],
    "Pants / Bottoms": [
        "jeans", "trousers", "pants", "shorts", "a skirt",
        "leggings", "sweatpants", "a miniskirt", "joggers",
        "cargo pants", "chinos",
    ],
    "Jackets / Coats": [
        "a jacket", "a coat", "a blazer", "a hoodie jacket",
        "a windbreaker", "a trench coat", "a puffer jacket",
        "a leather jacket", "a raincoat", "a cardigan",
    ],
    "Dresses": [
        "a dress", "a gown", "a sundress", "a maxi dress",
        "a mini dress", "a wedding dress", "an evening gown",
        "a floral dress",
    ],
    "Accessories": [
        "a bag", "a handbag", "a backpack", "a hat", "a cap",
        "sunglasses", "a watch", "a scarf", "a belt", "a wallet",
        "a purse", "jewelry", "a necklace", "a bracelet",
        "a hair accessory",
    ],
    "Books": [
        "a book", "a stack of books", "textbooks", "novels",
        "a magazine", "a comic book", "reading material",
        "a paperback", "a hardcover book",
    ],
    "Electronics": [
        "a laptop", "a smartphone", "a television", "a tablet",
        "a camera", "headphones", "a keyboard and mouse",
        "a gaming controller", "a speaker", "earphones",
        "a smartwatch", "a monitor", "a printer",
    ],
    "School Supplies": [
        "school supplies", "pencils and pens", "stationery items",
        "notebooks and rulers", "art supplies", "a pencil case",
        "a calculator", "crayons", "markers", "a stapler", "scissors",
    ],
    "Utility Items": [
        "household items", "kitchen utensils", "furniture",
        "tools and equipment", "bottles and cups",
        "home appliances", "cleaning supplies",
        "a mug", "a bowl", "a vase", "a clock",
        "a lamp", "a pillow", "a blanket", "a pot",
    ],
}


def _clip_classify(image: Image.Image) -> str:
    """Use CLIP zero-shot to classify image into a granular category."""
    clip = _get_clip()

    all_labels = []
    label_to_category: dict[str, str] = {}
    for category, phrases in CLIP_LABELS.items():
        for phrase in phrases:
            all_labels.append(phrase)
            label_to_category[phrase] = category

    results = clip(image, candidate_labels=all_labels)
    top_label = results[0]["label"]
    top_score = results[0]["score"]
    category = label_to_category[top_label]
    print(f"[CLIP] '{top_label}' score={top_score:.3f} → {category}")
    return category


def detect_category(image_bytes: bytes) -> str:
    """
    Returns a plain string — the most specific category detected.
    e.g. "Shoes", "Shirts / Tops", "Electronics", "Books" etc.
    Never raises — always returns a string.
    """

    # ── Open image safely ────────────────────────────────────────────────────
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        print(f"[ERROR] Could not open image: {e}")
        return "Utility Items"

    # ── Step 1: YOLO object detection ────────────────────────────────────────
    try:
        det_model = _get_det_model()
        det_results = det_model(image, verbose=False)

        detections: list[tuple[str, float]] = []
        for result in det_results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                cls_name = det_model.names[cls_id].lower()
                conf = float(box.conf[0])
                detections.append((cls_name, conf))
                print(f"[YOLO DET] '{cls_name}' conf={conf:.2f}")

        detections.sort(key=lambda x: x[1], reverse=True)

        for cls_name, conf in detections:
            if cls_name in DETECTION_MAP:
                category = DETECTION_MAP[cls_name]
                print(f"[RESULT] YOLO det → '{cls_name}' ({conf:.2f}) → {category}")
                return category

        if detections:
            print(f"[YOLO DET] No map match: {[d[0] for d in detections]}")

    except Exception as e:
        print(f"[ERROR] YOLO detection failed: {e}")

    # ── Step 2: YOLO image classification ───────────────────────────────────
    try:
        cls_model = _get_cls_model()
        cls_results = cls_model(image, verbose=False)

        for result in cls_results:
            top5_idx = result.probs.top5
            top5_names = [cls_model.names[i].lower().replace(" ", "_") for i in top5_idx]
            print(f"[YOLO CLS] top5: {top5_names}")

            for class_name in top5_names:
                # Direct key match
                if class_name in IMAGENET_MAP:
                    category = IMAGENET_MAP[class_name]
                    print(f"[RESULT] YOLO cls exact → '{class_name}' → {category}")
                    return category
                # Partial / substring match
                for key, category in IMAGENET_MAP.items():
                    if key in class_name or class_name in key:
                        print(f"[RESULT] YOLO cls partial → '{class_name}' ~ '{key}' → {category}")
                        return category

    except Exception as e:
        print(f"[ERROR] YOLO classification failed: {e}")

    # ── Step 3: CLIP zero-shot ───────────────────────────────────────────────
    try:
        category = _clip_classify(image)
        print(f"[RESULT] CLIP → {category}")
        return category
    except Exception as e:
        print(f"[ERROR] CLIP failed: {e}")

    # ── Step 4: Safe fallback ────────────────────────────────────────────────
    print("[RESULT] All methods failed — defaulting to 'Utility Items'")
    return "Utility Items"