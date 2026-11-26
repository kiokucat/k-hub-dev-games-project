# 開拓！マイコンビニDX ヘルプ

`my_conbini_xp.html` に追加した機能の使い方です。

## ファイル構成

```
my_conbini_xp.html
help.md
skin/
  image/        ← ここに画像を入れるとアイコンが差し替わります
```

---

## 1. 店舗（〇号店）

- 上部の「🏬新店」で新しい店を建てられます。費用は店が増えるごとに倍になります。
- 店の切り替えリストには **「看板の名前 - 〇号店」** と表示されます。
  - 例: `🏪 MY MART - 1号店`
- 看板は 📜メニュー →「⚙ 設定・セーブ」→「🪧 看板を編集」で変えられます。看板を変えるとリストの表示も変わります。
- 看板は店ごとに保存されます。

## 2. スロット

### スロット名の変更
- スロット画面の「✏ 名前変更」ボタン（どのモードでも使えます）
- 上部の `📁` スロット表示をクリック（使用中のスロット名を変更）
- 保存モードでは、名前欄に入力して保存してもOK

### ファイルから読み込み
1. 「📥 ファイルから読み込み」を押してセーブファイルを選びます。
2. **置き換え先のスロット**を選ぶウィンドウが出ます。ページ（1〜10）を切り替えて選べます。
3. データのあるスロットは、上書きの確認が出ます。

### メニューバー（ファイル / 編集 / 表示 / ヘルプ）
| メニュー | 内容 |
|---|---|
| ファイル | 新しいゲーム、開始/つづきから、保存モード、ファイルから読み込み、ファイルに書き出し、閉じる |
| 編集 | 名前変更、コピー、移動、削除 |
| 表示 | 前/次のページ、1ページ目へ、更新、スロット管理モード |
| ヘルプ | 使い方、バージョン情報 |

マウスを隣のメニューに動かすと、開くメニューが切り替わります。外をクリックするか Esc で閉じます。

### ウィンドウの移動
青いタイトルバーをドラッグすると動かせます（スロット画面、確認ダイアログ、決算レポート）。ウィンドウが画面の外に完全には出ないよう制限されています。スロット画面は閉じると中央に戻ります。

## 3. 建築

### ブロック（37種類追加）
- 動くブロック: 水、炎、虹、雷、雪、桜、歯車、ネオン、オーロラ、銀河 など
- 大きさ違い: 低い塀、小石、石柱、ネオン塔、黄金の塔 など
- 大きさは見た目だけです。置くマス数はすべて1マスです。
- ランクが上がると高ランクのブロックが解放されます。

### 機械（8種類追加）
ガチャガチャ、コインロッカー、証明写真機、花の自販機、クレーン機、ラーメン自販機、ペットロボ、宇宙旅行シミュ

## 4. 店の拡張

### 本店の拡張
拡張すると、右にあるお隣の店やブロックは**消えずに右へずれます**（以前のように返金して撤去されることはありません）。

### お隣の店の拡張
1. お隣の店（または店の中の内装設備）をクリックして選びます。
2. ポップアップの「🔨 お店を拡張」を押します。
3. **最大3回**まで拡張できます。1回ごとに右へ2マス広がります。上のマスが空いていれば奥へ1マスも広がります。
4. 右側にあるお店やブロックは、増えた幅の分だけ右へずれます。

## 5. 3D視点（店長視点）

「👁3D」ボタン、または V キーで切り替えます。

- 空（雲・夕焼け・星空）、床の光だまり、壁の陰影、レンガ模様
- ブルーム、時間帯の色味、ビネット、舞う埃、歩きの揺れ
- 解像度は 800×500 です。動作が重いときはお知らせください。調整できます。

## 6. スマホ表示

- 決算レポートは**左上**に小さく出ます（縦・横画面とも）。「□」で大きさを切り替えられます。
- 📜メニューの「純利益のグラフ（月ごと）」は**線グラフ**です。「今月」の部分だけ点線で、人件費を引く前の途中経過を示します。

---

## 7. スキン（画像でアイコンを差し替え）

`skin/image/` に画像を入れると、アイコンが画像になります。ドット絵もくっきり表示されます。

### ファイル名
| 差し替える対象 | ファイル名 | 例 |
|---|---|---|
| 設備・ブロック・機械・お隣の店・内装 | `種類名.png` | `shelf_onigiri.png` / `block_brick.png` / `machine_vr.png` / `tenant_cafe.png` / `fx_crane.png` |
| 商品（メニュー側の表示） | `商品ID.png` | `onigiri.png` |

- `png` のほか `webp`、`gif` も使えます。
- 全ファイル名の一覧は、📜メニュー →「⚙ 設定・セーブ」の「🎨 スキン」→「📋 ファイル名の一覧を見る」で確認できます。読み込み済みには ✅ が付きます。
- 画像を差し替えたら、ページを再読み込みしてください。

### 画像のサイズ
- 通常の設備: 正方形（例: 32×32、64×64）
- お隣の店: 8×7マスの縦横比（例: 256×224）
- 背の高いブロック（石柱、塔など）: 縦長の画像でもOK

### 画像のない項目
今までの絵文字のままです。一部だけ差し替えても問題ありません。

### うまく表示されないとき
- HTMLファイルを直接開くとブラウザによって画像を読み込めないことがあります。その場合は、フォルダで `python -m http.server` を実行して `http://localhost:8000/my_conbini_xp.html` を開いてください。
- ファイル名は大文字小文字を区別します。
- 画像のない項目の読み込みエラーが開発者ツールに出ますが、動作には影響しません。

### 注意
- 商品アイコンの差し替えは、メニュー側の表示だけです。マップ上の棚の絵は `shelf_○○.png` で差し替えてください。

---

## 8. スキンで置き換えられる要素とID一覧

ファイル名は `ID.png`（webp / gif も可）です。`skin/image/` に入れてください。

### 🛒 商品棚（1マス） — 15個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `shelf_onigiri.png` | おにぎり棚 | 🍙 |
| `shelf_drink.png` | 飲料クーラー | 🥤 |
| `shelf_snack.png` | お菓子ラック | 🍪 |
| `shelf_bento.png` | お弁当ケース | 🍱 |
| `shelf_chicken.png` | 揚げ物ケース | 🍗 |
| `shelf_ice.png` | アイス冷凍庫 | 🍦 |
| `shelf_magazine.png` | 雑誌ラック | 📚 |
| `shelf_daily.png` | 日用品棚 | 🧴 |
| `shelf_noodle.png` | カップ麺棚 | 🍜 |
| `shelf_sandwich.png` | サンド冷蔵棚 | 🥪 |
| `shelf_coffee.png` | コーヒーマシン台 | ☕ |
| `shelf_oden.png` | おでんケース | 🍢 |
| `shelf_salad.png` | サラダ冷蔵棚 | 🥗 |
| `shelf_cake.png` | ケーキ冷蔵棚 | 🍰 |
| `shelf_vending.png` | 自動販売機 | 🧃 |

### 🏧 レジ（1マス） — 1個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `register.png` | レジカウンター | 💳 |

### 🏧 イートイン（1マス） — 1個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `eatin.png` | イートイン席 | 🪑 |

### 🏧 ATM（1マス） — 1個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `atm.png` | マルチATM | 🏧 |

### 📦 バックヤード（1マス） — 1個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `backyard.png` | バックヤード | 📦 |

### 🎰 機械（1マス） — 24個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `machine_gacha.png` | ガチャガチャ | 🎁 |
| `machine_copy.png` | コピー機 | 🖨️ |
| `machine_claw.png` | クレーン機 | 🧸 |
| `machine_locker.png` | コインロッカー | 🔐 |
| `machine_photo.png` | 証明写真機 | 📷 |
| `machine_fortune.png` | おみくじ機 | 🔮 |
| `machine_ticket.png` | 食券機 | 🎫 |
| `machine_change.png` | 両替機 | 💴 |
| `machine_massage.png` | マッサージチェア | 💺 |
| `machine_charge.png` | 充電スタンド | 🔋 |
| `machine_scale.png` | ヘルスメーター | ⚖ |
| `machine_coffeevm.png` | カップコーヒー機 | ☕ |
| `machine_icecream.png` | ソフトクリーム機 | 🍦 |
| `machine_sticker.png` | シール印刷機 | 🖼 |
| `machine_lottery.png` | くじ引き機 | 🎟 |
| `machine_laundry.png` | コインランドリー | 🧺 |
| `machine_karaoke.png` | ミニカラオケ | 🎤 |
| `machine_vr.png` | VR体験機 | 🥽 |
| `machine_robot.png` | ロボットバリスタ | 🤖 |
| `machine_drone.png` | ドローン配送ポート | 🚁 |
| `machine_flower.png` | 花の自販機 | 💐 |
| `machine_ramen.png` | ラーメン自販機 | 🍜 |
| `machine_petbot.png` | ペットロボ | 🐶 |
| `machine_rocket.png` | 宇宙旅行シミュ | 🚀 |

### 🌿 装飾（1マス） — 5個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `plant.png` | 観葉植物 | 🌿 |
| `flower.png` | 花壇 | 🌷 |
| `tree.png` | シンボルツリー | 🌳 |
| `lamp.png` | 街灯 | 💡 |
| `bench.png` | ベンチ | 🛋️ |

### 🧱 ブロック（背の高いブロックは縦長でもOK） — 51個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `block_brick.png` | レンガブロック | 🧱 |
| `block_stone.png` | 石ブロック | ⬜ |
| `block_wood.png` | 木ブロック | 🟫 |
| `block_glass.png` | ガラスブロック | 🔷 |
| `block_window.png` | 仕切り窓 | 🪟 |
| `block_hedge.png` | 生垣ブロック | 🟩 |
| `block_concrete.png` | コンクリブロック | 🧱 |
| `block_mossy.png` | 苔むした石 | 🧱 |
| `block_bamboo.png` | 竹垣ブロック | 🧱 |
| `block_iron.png` | 鉄柵ブロック | 🧱 |
| `block_ice.png` | 氷ブロック | 🧱 |
| `block_marble.png` | 大理石ブロック | 🧱 |
| `block_neon.png` | ネオンブロック | 🧱 |
| `block_gold.png` | 黄金ブロック | 🧱 |
| `block_aqua.png` | アクアブロック | 🌊 |
| `block_hazard.png` | 警戒ブロック | ⚠️ |
| `block_snow.png` | 雪ブロック | ❄️ |
| `block_crate.png` | 木箱 | 📦 |
| `block_barrel.png` | 樽 | 🛢️ |
| `block_stud.png` | 小石 | 🪨 |
| `block_lowwall.png` | 低い塀 | 🧱 |
| `block_lowhedge.png` | 低い生垣 | 🌿 |
| `block_neonpink.png` | ネオンピンク | 🩷 |
| `block_bubble.png` | バブルブロック | 🫧 |
| `block_conveyor.png` | ベルトブロック | ➡️ |
| `block_sakura.png` | 桜ブロック | 🌸 |
| `block_candy.png` | キャンディ | 🍬 |
| `block_slime.png` | スライム | 🟢 |
| `block_cloud.png` | 雲ブロック | ☁️ |
| `block_bigconc.png` | 極太コンクリ | ⬛ |
| `block_pillar.png` | 石柱 | 🏛️ |
| `block_lava.png` | 溶岩ブロック | 🌋 |
| `block_star.png` | 星屑ブロック | ⭐ |
| `block_gear.png` | 歯車ブロック | ⚙️ |
| `block_led.png` | LED電光 | 💡 |
| `block_clock.png` | 時計ブロック | 🕒 |
| `block_lantern.png` | 石灯籠 | 🏮 |
| `block_icepillar.png` | 氷柱 | 🧊 |
| `block_rainbow.png` | レインボー | 🌈 |
| `block_glitch.png` | グリッチ | 👾 |
| `block_tv.png` | テレビ壁 | 📺 |
| `block_marblepillar.png` | 大理石の柱 | 🏛️ |
| `block_firetower.png` | 篝火の柱 | 🔥 |
| `block_thunder.png` | 雷ブロック | ⚡ |
| `block_crystal.png` | 水晶ブロック | 💎 |
| `block_emerald.png` | エメラルド | 💚 |
| `block_neontower.png` | ネオン塔 | 🗼 |
| `block_aurora.png` | オーロラ | 🌌 |
| `block_galaxy.png` | 銀河ブロック | 🪐 |
| `block_magmatower.png` | 溶岩の塔 | 🌋 |
| `block_goldtower.png` | 黄金の塔 | 👑 |

### 🏘️ お隣の店（8×7マス分の画像） — 5個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `tenant_bakery.png` | パン屋さん | 🥖 |
| `tenant_cafe.png` | カフェ | 🍵 |
| `tenant_salon.png` | 美容室 | 💇 |
| `tenant_drug.png` | ドラッグストア | 💊 |
| `tenant_game.png` | ゲームセンター | 🎮 |

### 🛠️ お隣の店の内装（お隣の店の中の1マス） — 19個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `fx_crane.png` | クレーンゲーム | 🧸 |
| `fx_arcade.png` | アーケード筐体 | 🕹️ |
| `fx_medal.png` | メダルゲーム | 🪙 |
| `fx_rhythm.png` | リズムゲーム | 🥁 |
| `fx_photo.png` | プリクラ機 | 📸 |
| `fx_table.png` | テーブル席 | 🪑 |
| `fx_counter.png` | カウンター席 | ☕ |
| `fx_showcase.png` | ケーキショーケース | 🍰 |
| `fx_piano.png` | グランドピアノ | 🎹 |
| `fx_breadrack.png` | パン棚 | 🥖 |
| `fx_oven.png` | 石窯オーブン | 🔥 |
| `fx_chair.png` | カット台 | 💺 |
| `fx_wash.png` | シャンプー台 | 🚿 |
| `fx_sofa.png` | 待合ソファ | 🛋️ |
| `fx_medshelf.png` | 医薬品棚 | 💊 |
| `fx_cosme.png` | コスメ棚 | 💄 |
| `fx_regdrug.png` | 専用レジ | 💳 |
| `fx_plant.png` | 観葉植物 | 🌿 |
| `fx_poster.png` | ポスター | 🖼️ |

### 🍙 商品アイコン（メニュー側の表示用） — 14個

| ID（ファイル名） | 名前 | 今のアイコン |
|---|---|---|
| `onigiri.png` | おにぎり | 🍙 |
| `drink.png` | ドリンク | 🥤 |
| `snack.png` | お菓子 | 🍪 |
| `bento.png` | 特製お弁当 | 🍱 |
| `chicken.png` | ホットチキン | 🍗 |
| `ice.png` | アイス | 🍦 |
| `magazine.png` | 雑誌・マンガ | 📚 |
| `daily.png` | 日用品 | 🧴 |
| `noodle.png` | カップ麺 | 🍜 |
| `sandwich.png` | サンドイッチ | 🥪 |
| `coffee.png` | いれたてコーヒー | ☕ |
| `oden.png` | おでん | 🍢 |
| `salad.png` | サラダ | 🥗 |
| `cake.png` | ケーキ | 🍰 |

※ 商品アイコンはメニュー（カード・一覧）の表示だけに使われます。マップ上の棚の絵は、商品棚の `shelf_○○.png` で差し替えます。
※ 設備のIDと商品のIDは別です（例: 棚は `shelf_onigiri.png`、商品は `onigiri.png`）。
