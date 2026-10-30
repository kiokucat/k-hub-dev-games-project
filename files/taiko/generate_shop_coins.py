import os
import json
import zipfile

# 読み込み元フォルダと出力設定
SHOP_SONGS_DIR = "medalshop"
OUTPUT_FILE = "shop_songs.json"

def parse_tja_content(tja_text):
    """TJAテキストから曲名、ジャンル、難易度、ノーツ数を解析"""
    title = "Unknown"
    genre = "ポップス"
    difficulty = 5
    notes_count = 0

    lines = tja_text.splitlines()
    in_course = False

    for line in lines:
        line = line.strip()
        if not line or line.startswith("//"):
            continue

        if line.startswith("TITLE:"):
            title = line.replace("TITLE:", "").strip()
        elif line.startswith("GENRE:"):
            genre = line.replace("GENRE:", "").strip()
        elif line.startswith("COURSE:"):
            in_course = True
        elif line.startswith("LEVEL:"):
            try:
                difficulty = int(line.replace("LEVEL:", "").strip())
            except ValueError:
                pass
        
        if in_course and not line.startswith("#"):
            notes_count += sum(1 for char in line if char in "1234")

    return title, genre, difficulty, max(notes_count, 100)

def calculate_price(difficulty, notes):
    """難易度とノーツ数からメダル価格を自動計算（500〜2500メダル）"""
    base_price = 500
    diff_factor = difficulty * 100
    notes_factor = int(notes * 0.8)
    price = base_price + diff_factor + notes_factor
    # 50メダル単位で四捨五入
    return round(price / 50) * 50

def generate_shop_songs():
    print(f"--- メダルショップ用JSON生成 実行開始 ---")
    print(f"現在の作業フォルダ: {os.getcwd()}")
    
    if not os.path.exists(SHOP_SONGS_DIR):
        print(f"[エラー] {SHOP_SONGS_DIR} フォルダが見つかりません。")
        print("親フォルダ（index.htmlのある場所）で実行しているか確認してください。")
        return

    files = os.listdir(SHOP_SONGS_DIR)
    songs_data = []

    for file_name in files:
        if not file_name.lower().endswith(".zip"):
            continue

        zip_path = os.path.join(SHOP_SONGS_DIR, file_name)
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as z:
                tja_files = [f for f in z.namelist() if f.lower().endswith(".tja")]
                if not tja_files:
                    print(f"スキップ (.tjaなし): {file_name}")
                    continue
                
                with z.open(tja_files[0]) as f:
                    content = f.read().decode('utf-8', errors='ignore')
                    title, genre, diff, notes = parse_tja_content(content)

                # 相対パスを "medalshop/ファイル名.zip" に自動設定
                relative_path = f"medalshop/{file_name}"
                price = calculate_price(diff, notes)

                songs_data.append({
                    "id": file_name,
                    "title": title if title != "Unknown" else os.path.splitext(file_name)[0],
                    "genre": genre,
                    "difficulty": diff,
                    "notes": notes,
                    "price": price,
                    "path": relative_path,  # 自動付与された相対パス
                    "is_unlocked": False    # ショップ購入前は未解禁
                })
                print(f"[成功] 解析完了: {file_name} -> {title} (価格: 🪙{price} / Path: {relative_path})")

        except Exception as e:
            print(f"[エラー] 解析失敗 ({file_name}): {e}")

    if songs_data:
        # ルート直下に shop_songs.json を生成（旧 songs.json から移行）
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(songs_data, f, ensure_ascii=False, indent=2)
        print(f"\n成功: ルート直下に {OUTPUT_FILE} を生成しました！（計 {len(songs_data)} 曲）")
    else:
        print("\n[警告] 有効な曲データが取得できませんでした。")

if __name__ == "__main__":
    generate_shop_songs()