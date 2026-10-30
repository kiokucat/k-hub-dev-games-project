import os
import zipfile

# ============================================================
# 曲zip作成スクリプト (圧縮率 0% / ZIP_STORED)
# ------------------------------------------------------------
# 【なぜ圧縮率0%か】
#   圧縮(DEFLATE)で作成したzipをゲーム側(JSZip)で展開する際、
#   TJA譜面の連続する「0」(空白音符)がスキップされてしまう問題が
#   報告されているため、圧縮せず格納(ZIP_STORED = 圧縮率0%)で
#   作成することを前提とする。
#
# 【使い方】
#   1. 曲データ(.tja + 音声ファイル)を曲ごとのフォルダに入れる
#        src_opensongs/<曲名>/曲名.tja
#        src_opensongs/<曲名>/曲名.ogg
#        src_medalshop/<曲名>/...
#   2. このスクリプトを index.html と同じ場所で実行
#        python create_song_zips.py
#   3. opensongs/ medalshop/ に 圧縮率0%のzipが生成される
#   4. 続けて opensong_creator.py / generate_shop_coins.py を実行して
#      opensongs.json / shop_songs.json を再生成する
# ============================================================

CONFIG = [
    ("src_opensongs", "opensongs"),   # (入力フォルダ, 出力フォルダ)
    ("src_medalshop", "medalshop"),
]

AUDIO_EXTS = (".ogg", ".mp3", ".wav")

def find_song_files(folder):
    """フォルダ内の .tja と音声ファイルを返す"""
    tja = None
    audio = []
    for f in sorted(os.listdir(folder)):
        full = os.path.join(folder, f)
        if not os.path.isfile(full):
            continue
        lower = f.lower()
        if lower.endswith(".tja"):
            tja = full
        elif lower.endswith(AUDIO_EXTS):
            audio.append(full)
    return tja, audio

def create_zip(src_dir, out_dir):
    if not os.path.exists(src_dir):
        print(f"[スキップ] {src_dir} フォルダが存在しません。")
        return
    os.makedirs(out_dir, exist_ok=True)
    made = 0
    for name in sorted(os.listdir(src_dir)):
        folder = os.path.join(src_dir, name)
        if not os.path.isdir(folder):
            continue
        tja, audio = find_song_files(folder)
        if not tja:
            print(f"[スキップ] .tja が見つかりません: {folder}")
            continue
        if not audio:
            print(f"[スキップ] 音声ファイルが見つかりません: {folder}")
            continue
        zip_path = os.path.join(out_dir, name + ".zip")
        # 圧縮率0% (ZIP_STORED) で書き出し
        with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_STORED) as z:
            z.write(tja, os.path.join(name, os.path.basename(tja)))
            for a in audio:
                z.write(a, os.path.join(name, os.path.basename(a)))
        size = os.path.getsize(zip_path)
        print(f"[作成] {zip_path}  (圧縮率0%, {size/1024/1024:.1f} MB, 音声{len(audio)}件)")
        made += 1
    print(f"--> {out_dir}: {made} 曲のzipを生成しました")

if __name__ == "__main__":
    print("--- 曲zip作成 (圧縮率0% / ZIP_STORED) ---")
    for src, out in CONFIG:
        create_zip(src, out)
    print("完了。続けて opensong_creator.py / generate_shop_coins.py を実行してください。")
