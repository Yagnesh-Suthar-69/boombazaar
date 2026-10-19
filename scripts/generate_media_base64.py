import cv2
import numpy as np
import base64
import os
import math
import random
import json
import sqlite3
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ARTIFACT_DIR = r"C:\Users\yagnesh.suthar\.gemini\antigravity-ide\brain\9e2ad7ab-bb13-4468-820d-94187f374f60"
DB_PATH = os.path.join(os.getcwd(), ".data", "boombazaar.sqlite")

def file_to_base64_image(filepath, max_size=(640, 480), quality=80):
    img = Image.open(filepath)
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    import io
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality, optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return f"data:image/jpeg;base64,{b64}"

def create_synthetic_firework_photo(title, main_color, style="box"):
    width, height = 640, 480
    img = Image.new("RGB", (width, height), (12, 14, 22))
    draw = ImageDraw.Draw(img)
    
    # Festive bokeh ambient background
    random.seed(abs(hash(title)) % 10000)
    for _ in range(40):
        bx = random.randint(0, width)
        by = random.randint(0, height)
        br = random.randint(15, 60)
        alpha_col = random.choice([(255, 180, 40), (220, 40, 60), (255, 120, 20), (255, 230, 100)])
        draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(alpha_col[0]//6, alpha_col[1]//6, alpha_col[2]//6))
    
    img = img.filter(ImageFilter.GaussianBlur(10))
    draw = ImageDraw.Draw(img)
    
    # Floor / table shadow
    draw.polygon([(0, 360), (width, 360), (width, height), (0, height)], fill=(18, 22, 34))
    
    # Draw product box or cracker setup
    if style == "box":
        box_left, box_top, box_right, box_bottom = 170, 140, 470, 380
        # Shadow
        draw.rectangle([box_left + 10, box_bottom - 5, box_right + 15, box_bottom + 15], fill=(8, 10, 16))
        # 3D Box front
        draw.rectangle([box_left, box_top, box_right, box_bottom], fill=main_color)
        # Gold foil border
        draw.rectangle([box_left + 8, box_top + 8, box_right - 8, box_bottom - 8], outline=(255, 215, 0), width=3)
        # Festive diya & label
        draw.text((box_left + 25, box_top + 30), "BOOM BAZAAR", fill=(255, 240, 180))
        draw.text((box_left + 25, box_top + 60), title[:26], fill=(255, 255, 255))
        draw.text((box_left + 25, box_top + 95), "100% Green Safe Firework", fill=(100, 255, 150))
        # Golden burst sparkles radiating
        for _ in range(35):
            sx = random.randint(box_left - 30, box_right + 30)
            sy = random.randint(box_top - 40, box_bottom)
            slen = random.randint(4, 12)
            draw.line([(sx - slen, sy), (sx + slen, sy)], fill=(255, 230, 100), width=2)
            draw.line([(sx, sy - slen), (sx, sy + slen)], fill=(255, 230, 100), width=2)
            
    elif style == "burst":
        # Full sky burst
        bcx, bcy = width // 2, 200
        for i in range(80):
            ang = random.uniform(0, 2 * math.pi)
            dist = random.uniform(40, 180)
            ex = int(bcx + math.cos(ang) * dist)
            ey = int(bcy + math.sin(ang) * dist)
            col = random.choice([main_color, (255, 220, 80), (255, 255, 255)])
            draw.line([(bcx, bcy), (ex, ey)], fill=col, width=2)
            draw.ellipse([ex - 3, ey - 3, ex + 3, ey + 3], fill=(255, 255, 255))
            
    import io
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85, optimize=True)
    return f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"

# Video Generator functions that return Base64 string directly
def generate_base64_video(kind):
    tmp_path = f"tmp_{kind}_{random.randint(1000, 9999)}.mp4"
    width, height = 320, 240
    fps = 18
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(tmp_path, fourcc, fps, (width, height))
    random.seed(42)
    
    if kind == "sparkler":
        cx, cy = 160, 130
        sparks = []
        for f in range(36):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.line(frame, (cx, cy), (cx, height), (100, 100, 110), 2)
            cv2.circle(frame, (cx, cy), 5, (220, 240, 255), -1)
            for _ in range(9):
                ang = random.uniform(0, 2 * math.pi)
                spd = random.uniform(2, 6)
                sparks.append([cx, cy, math.cos(ang)*spd, math.sin(ang)*spd, 12, 12])
            new_s = []
            for s in sparks:
                s[0] += s[2]; s[1] += s[3]; s[4] -= 1
                if s[4] > 0:
                    a = s[4]/s[5]
                    px, py = int(s[0]), int(s[1])
                    if 0 <= px < width and 0 <= py < height:
                        cv2.line(frame, (int(s[0]-s[2]), int(s[1]-s[3])), (px, py), (int(40*a), int(190*a), int(255*a)), 2)
                    new_s.append(s)
            sparks = new_s
            out.write(frame)
            
    elif kind == "aerial":
        cx, cy = 160, 85
        sparks = []
        for f in range(40):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            if f < 12: # rocket rising
                y = int(height - (f/12.0)*(height - cy))
                cv2.line(frame, (cx, y+15), (cx, y), (80, 140, 255), 2)
                cv2.circle(frame, (cx, y), 3, (255, 255, 255), -1)
            elif f == 12: # burst flash
                cv2.circle(frame, (cx, cy), 45, (220, 240, 255), -1)
                for _ in range(80):
                    ang = random.uniform(0, 2*math.pi)
                    spd = random.uniform(1.5, 6.0)
                    is_red = random.random() > 0.35
                    sparks.append([cx, cy, math.cos(ang)*spd, math.sin(ang)*spd, is_red, 26, 26])
            else:
                new_s = []
                for s in sparks:
                    s[0] += s[2]; s[1] += s[3]; s[3] += 0.08; s[5] -= 1
                    if s[5] > 0:
                        a = s[5]/s[6]
                        px, py = int(s[0]), int(s[1])
                        if 0 <= px < width and 0 <= py < height:
                            col = (int(50*a), int(40*a), int(255*a)) if s[4] else (int(30*a), int(210*a), int(255*a))
                            cv2.circle(frame, (px, py), 2, col, -1)
                        new_s.append(s)
                sparks = new_s
            out.write(frame)
            
    elif kind == "flowerpot":
        cx, base_y = 160, 215
        sparks = []
        for f in range(36):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.ellipse(frame, (cx, base_y), (16, 9), 0, 0, 360, (50, 70, 170), -1)
            for _ in range(14):
                ang = random.uniform(-math.pi*0.78, -math.pi*0.22)
                spd = random.uniform(5, 11)
                sparks.append([cx, base_y-6, math.cos(ang)*spd*0.4, math.sin(ang)*spd, 16, 16])
            new_s = []
            for s in sparks:
                s[0] += s[2]; s[1] += s[3]; s[3] += 0.42; s[4] -= 1
                if s[4] > 0:
                    a = s[4]/s[5]
                    px, py = int(s[0]), int(s[1])
                    if 0 <= px < width and 0 <= py < height:
                        cv2.circle(frame, (px, py), 1, (int(60*a), int(220*a), int(255*a)), -1)
                    new_s.append(s)
            sparks = new_s
            out.write(frame)
            
    elif kind == "spinner":
        cx, cy = 160, 120
        sparks = []
        for f in range(36):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            ang = f * 0.5
            cv2.circle(frame, (cx, cy), 14, (30, 120, 255), -1)
            for arm in [0, math.pi*0.66, math.pi*1.33]:
                a = ang + arm
                tx = cx + math.cos(a)*18
                ty = cy + math.sin(a)*18
                spd = random.uniform(3, 7)
                sparks.append([tx, ty, math.cos(a+1.5)*spd, math.sin(a+1.5)*spd, 12, 12])
            new_s = []
            for s in sparks:
                s[0] += s[2]; s[1] += s[3]; s[4] -= 1
                if s[4] > 0:
                    alpha = s[4]/s[5]
                    px, py = int(s[0]), int(s[1])
                    if 0 <= px < width and 0 <= py < height:
                        cv2.circle(frame, (px, py), 1, (int(30*alpha), int(160*alpha), int(255*alpha)), -1)
                    new_s.append(s)
            sparks = new_s
            out.write(frame)
            
    elif kind == "rocket":
        cx, cy = 160, 90
        sparks = []
        for f in range(36):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            if f < 10:
                y = int(height - (f/10.0)*(height - cy))
                cv2.line(frame, (cx, y+20), (cx, y), (50, 100, 255), 2)
            elif f == 10:
                cv2.circle(frame, (cx, cy), 35, (255, 255, 255), -1)
                for _ in range(60):
                    a = random.uniform(0, 2*math.pi)
                    s = random.uniform(2, 6)
                    sparks.append([cx, cy, math.cos(a)*s, math.sin(a)*s, 22, 22])
            else:
                new_s = []
                for s in sparks:
                    s[0] += s[2]; s[1] += s[3]; s[3] += 0.09; s[4] -= 1
                    if s[4] > 0:
                        alpha = s[4]/s[5]
                        px, py = int(s[0]), int(s[1])
                        if 0 <= px < width and 0 <= py < height:
                            cv2.circle(frame, (px, py), 2, (int(255*alpha), int(100*alpha), int(255*alpha)), -1)
                        new_s.append(s)
                sparks = new_s
            out.write(frame)
            
    elif kind == "sound_lad":
        sparks = []
        for f in range(36):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            # String of red crackers
            cv2.line(frame, (60, 120), (260, 120), (30, 30, 220), 4)
            # Intermittent crackle pops
            pop_x = random.randint(70, 250)
            cv2.circle(frame, (pop_x, 120), random.randint(10, 25), (200, 240, 255), -1)
            for _ in range(8):
                a = random.uniform(0, 2*math.pi)
                sp = random.uniform(2, 5)
                sparks.append([pop_x, 120, math.cos(a)*sp, math.sin(a)*sp, 8, 8])
            new_s = []
            for s in sparks:
                s[0] += s[2]; s[1] += s[3]; s[4] -= 1
                if s[4] > 0:
                    alpha = s[4]/s[5]
                    px, py = int(s[0]), int(s[1])
                    if 0 <= px < width and 0 <= py < height:
                        cv2.circle(frame, (px, py), 1, (int(40*alpha), int(220*alpha), int(255*alpha)), -1)
                    new_s.append(s)
            sparks = new_s
            out.write(frame)
            
    else: # gift box / finale
        sparks = []
        for f in range(40):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            # Multiple bursts simultaneously
            if f in [5, 12, 18]:
                bx = random.randint(80, 240)
                by = random.randint(60, 120)
                for _ in range(40):
                    a = random.uniform(0, 2*math.pi)
                    s = random.uniform(1.5, 5)
                    sparks.append([bx, by, math.cos(a)*s, math.sin(a)*s, 20, 20])
            new_s = []
            for s in sparks:
                s[0] += s[2]; s[1] += s[3]; s[3] += 0.08; s[4] -= 1
                if s[4] > 0:
                    alpha = s[4]/s[5]
                    px, py = int(s[0]), int(s[1])
                    if 0 <= px < width and 0 <= py < height:
                        cv2.circle(frame, (px, py), 2, (int(40*alpha), int(190*alpha), int(255*alpha)), -1)
                    new_s.append(s)
            sparks = new_s
            out.write(frame)
            
    out.release()
    with open(tmp_path, "rb") as f:
        video_b64 = base64.b64encode(f.read()).decode("utf-8")
    os.remove(tmp_path)
    return f"data:video/mp4;base64,{video_b64}"

print("Connecting to local database...")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check and add video column if missing
cols = [c[1] for c in cursor.execute("PRAGMA table_info(products)").fetchall()]
if "video" not in cols:
    cursor.execute("ALTER TABLE products ADD COLUMN video TEXT;")
    conn.commit()

# Product mappings with simple, clear English and generated Base64 assets
# 1. Sparklers
sparklers_img = os.path.join(ARTIFACT_DIR, "sparklers_photo_1792046828878.jpg")
sparklers_b64 = file_to_base64_image(sparklers_img) if os.path.exists(sparklers_img) else create_synthetic_firework_photo("Golden Sparklers", (200, 30, 50))
sparklers_vid = generate_base64_video("sparkler")

# 2. Aerial Cake
aerial_img = os.path.join(ARTIFACT_DIR, "aerial_cake_photo_1792046851757.jpg")
aerial_b64 = file_to_base64_image(aerial_img) if os.path.exists(aerial_img) else create_synthetic_firework_photo("50 Sky Shots Cake", (180, 20, 40), "burst")
aerial_vid = generate_base64_video("aerial")

# 3. Flower Pot Anar
flower_img = os.path.join(ARTIFACT_DIR, "flower_pot_photo_1792046870492.jpg")
flower_b64 = file_to_base64_image(flower_img) if os.path.exists(flower_img) else create_synthetic_firework_photo("Big Flower Pot Anar", (190, 40, 40))
flower_vid = generate_base64_video("flowerpot")

# 4. Rockets
rocket_b64 = create_synthetic_firework_photo("Whistling Sky Rockets (Pack of 10)", (170, 30, 30))
rocket_vid = generate_base64_video("rocket")

# 5. Ground Chakkars
spinner_b64 = create_synthetic_firework_photo("Ground Spinner Chakkars (10 Pcs)", (220, 50, 30))
spinner_vid = generate_base64_video("spinner")

# 6. Sound Garland Lad
sound_b64 = create_synthetic_firework_photo("Red Garland 1000 Crackers", (210, 20, 30))
sound_vid = generate_base64_video("sound_lad")

# 7. Gift Box
gift_b64 = create_synthetic_firework_photo("Diwali Family Cracker Box (45 Items)", (180, 30, 50))
gift_vid = generate_base64_video("gift")

# 8. Emerald Willow Aerial
emerald_b64 = create_synthetic_firework_photo("Emerald Green 25 Sky Shots", (20, 140, 60), "burst")
emerald_vid = generate_base64_video("aerial")

products_data = [
    {
        "id": "prod_01",
        "name": "Golden Sparklers (Pack of 10)",
        "slug": "golden-sparklers-pack-of-10",
        "description": "Safe, extra-long hand sparklers for kids and family. Burns with bright golden sparks for more than 90 seconds with very low smoke.",
        "sound_level": "Low Sound",
        "altitude": "Handheld",
        "burst_effect": "Bright golden sparks and star shower",
        "safety_instructions": "Hold at arm length away from body. Put used hot wires into a bucket of water. Adult supervision required.",
        "images": json.dumps([sparklers_b64]),
        "video": sparklers_vid,
    },
    {
        "id": "prod_02",
        "name": "50 Sky Shots Big Celebration Cake",
        "slug": "50-sky-shots-big-celebration-cake",
        "description": "50 high-altitude shots bursting in the sky one after another. Shows bright red, gold, and green glowing stars with loud celebration sound.",
        "sound_level": "Loud Thunder",
        "altitude": "200 feet High Sky",
        "burst_effect": "50 sky bursts with gold willow and red flowers",
        "safety_instructions": "Place flat on open ground. Keep minimum 25 meters distance. Light fuse and step back quickly.",
        "images": json.dumps([aerial_b64]),
        "video": aerial_vid,
    },
    {
        "id": "prod_03",
        "name": "Giant Flower Pot Anar (Pack of 5)",
        "slug": "giant-flower-pot-anar-pack-of-5",
        "description": "Traditional Diwali flower pot that shoots a tall, glowing 15-foot fountain of gold and silver sparks. Beautiful and safe.",
        "sound_level": "Low Sound",
        "altitude": "15 feet Fountain",
        "burst_effect": "Tall silver and gold fountain shower",
        "safety_instructions": "Place upright on flat ground. Light with a sparkler and step back 5 meters.",
        "images": json.dumps([flower_b64]),
        "video": flower_vid,
    },
    {
        "id": "prod_04",
        "name": "Whistling Sky Rockets (Pack of 10)",
        "slug": "whistling-sky-rockets-pack-of-10",
        "description": "Rockets that fly high into the sky with a loud whistle sound, then burst into bright purple and gold twinkling stars.",
        "sound_level": "Loud Whistle & Burst",
        "altitude": "150 feet Sky",
        "burst_effect": "Whistling climb with starburst explosion",
        "safety_instructions": "Put rocket stick loosely into an empty bottle or launch tube. Never hold in hand. Aim straight up.",
        "images": json.dumps([rocket_b64]),
        "video": rocket_vid,
    },
    {
        "id": "prod_05",
        "name": "Ground Spinner Chakkars (Pack of 10)",
        "slug": "ground-spinner-chakkars-pack-of-10",
        "description": "Fast spinning ground wheel that makes a glowing circular ring of gold and red fire sparks on the floor.",
        "sound_level": "Low Sound",
        "altitude": "On Ground",
        "burst_effect": "Fast spinning gold and orange wheel of sparks",
        "safety_instructions": "Light on smooth flat concrete ground. Keep 4 meters distance.",
        "images": json.dumps([spinner_b64]),
        "video": spinner_vid,
    },
    {
        "id": "prod_06",
        "name": "Red 1000 Crackers Garland (Lad)",
        "slug": "red-1000-crackers-garland-lad",
        "description": "Classic festival long string of red sound crackers. Gives fast, non-stop rhythmic bursting sounds with a loud finale finish.",
        "sound_level": "Very Loud",
        "altitude": "On Ground",
        "burst_effect": "1000 fast popping bursts with bright flashes",
        "safety_instructions": "Unroll completely in a straight line on open ground away from cars and buildings. Light and move 15m away.",
        "images": json.dumps([sound_b64]),
        "video": sound_vid,
    },
    {
        "id": "prod_07",
        "name": "Diwali Family Gift Box (45 Crackers)",
        "slug": "diwali-family-gift-box-45-crackers",
        "description": "Complete family celebration box with sparklers, flower pots, ground chakkars, rockets, and sound crackers. Packed in a safe gift box.",
        "sound_level": "All Levels",
        "altitude": "Ground and Sky Assorted",
        "burst_effect": "Full family festival cracker pack",
        "safety_instructions": "Store in a cool dry place. Follow individual safety instructions on each item.",
        "images": json.dumps([gift_b64]),
        "video": gift_vid,
    },
    {
        "id": "prod_08",
        "name": "Green Willow 25 Sky Shots",
        "slug": "green-willow-25-sky-shots",
        "description": "25 shots of slow falling bright emerald green and golden willow sparkles in the night sky. Very smooth and quiet.",
        "sound_level": "Normal Sound",
        "altitude": "150 feet Sky",
        "burst_effect": "Emerald green and gold willow trails",
        "safety_instructions": "Outdoor open sky use only. Keep water bucket ready.",
        "images": json.dumps([emerald_b64]),
        "video": emerald_vid,
    },
]

print("Updating products in database with Base64 photos, Base64 videos, and simple English text...")
for p in products_data:
    cursor.execute("""
        UPDATE products SET 
            name = ?, 
            slug = ?, 
            description = ?, 
            sound_level = ?, 
            altitude = ?, 
            burst_effect = ?, 
            safety_instructions = ?, 
            images = ?, 
            video = ?
        WHERE id = ?;
    """, (
        p["name"],
        p["slug"],
        p["description"],
        p["sound_level"],
        p["altitude"],
        p["burst_effect"],
        p["safety_instructions"],
        p["images"],
        p["video"],
        p["id"],
    ))

# Also update category images to base64
categories_data = [
    ("cat_sparklers", "Sparklers", "sparklers", "Safe golden hand sparklers for kids and family celebrations.", sparklers_b64),
    ("cat_aerial", "Sky Shots", "aerial-shots", "Multi-shot sky cakes that burst high in the night sky.", aerial_b64),
    ("cat_pots", "Flower Pots", "flower-pots", "Ground fountains that shoot bright showers of gold and silver sparks.", flower_b64),
    ("cat_rockets", "Sky Rockets", "rockets", "Whistling rockets that fly high and burst with colorful stars.", rocket_b64),
    ("cat_spinners", "Ground Wheels", "ground-spinners", "Fast spinning wheels of red and gold fire on the ground.", spinner_b64),
    ("cat_sound", "Sound Crackers", "sound-crackers", "Traditional red paper crackers and loud celebration strings.", sound_b64),
    ("cat_gift", "Family Gift Boxes", "gift-boxes", "Assorted gift boxes with all types of crackers for family Diwali.", gift_b64),
]

for cat in categories_data:
    cursor.execute("""
        UPDATE categories SET
            name = ?,
            slug = ?,
            description = ?,
            image = ?
        WHERE id = ?;
    """, (cat[1], cat[2], cat[3], cat[4], cat[0]))

conn.commit()
conn.close()
print("Database successfully updated with Base64 images and Base64 videos!")
