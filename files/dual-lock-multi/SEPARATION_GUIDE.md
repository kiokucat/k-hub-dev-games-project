# MultiPadControl v1.0.1 - JavaScriptライブラリ分離ガイド

## 📁 ファイル構成

```
MultiPadControl v1.0.1/
├── multipad.js                      ← ゲームパッド管理コアライブラリ（ES Module対応）
│                                      ├─ export { GamepadManager }
│                                      └─ CommonJS 互換性も実装
│
├── MultiPadControl_v1_0_1.html      ← デモページ（ES Module採用）
│                                      └─ import { GamepadManager } from './multipad.js'
│
└── SEPARATION_GUIDE.md              ← このファイル
```

### ✨ v1.0.1 での改善

| 項目 | v1.0.0 | v1.0.1 |
|------|--------|--------|
| **モジュール形式** | 通常のスクリプト | ES Module |
| **再利用性** | 低い | 高い（import可能） |
| **互換性** | グローバル汚染 | スコープ安全 |
| **バンドラー対応** | 別途対応必要 | 標準対応 |

---

## 🎯 分離のメリット

### ✅ Before（v1.0.0）
```
MultiPadControl_v1_0_1.html
└── <script>
    ├── GamepadManager クラス（全コード）
    ├── TestGame クラス（デモ用）
    └── UI初期化コード
```
❌ HTMLとJavaScriptが混在  
❌ 他プロジェクトで再利用しにくい  
❌ ゲームパッド管理とUIが密結合

### ✅ After（v1.0.1）
```
multipad.js
├── GamepadManager クラス
└── Standard Input API

MultiPadControl_v1_0_1.html
├── <link rel="stylesheet">
├── <style> （CSSのみ）
├── <script src="multipad.js">
└── <script>
    ├── TestGame クラス（デモ用）
    └── UI初期化コード
```
✓ 関心の分離  
✓ 他プロジェクトで再利用可能  
✓ ゲームパッド管理をモジュール化

---

## 📚 multipad.js - GamepadManager ライブラリ

### クラス

#### `GamepadManager`

ゲームパッド入力を統一APIで管理するコアクラス。

**主要プロパティ**
```javascript
// 動作状態
.registrationMode: boolean      // 登録モード中か
.debugMode: boolean             // DEBUG モード中か
.deltaTime: number              // フレーム間隔（秒）

// 内部管理
.playerAssignments: Map         // プレイヤー割り当て
.playerGamepads: Map            // プレイヤー入力データ
.connectedGamepads: Set         // 接続中ゲームパッド
```

### Standard Input API

全プレイヤーで統一された入力フォーマット。

#### 取得方法
```javascript
const gamepadManager = new GamepadManager();

// ゲームのupdate関数内
for (let p = 1; p <= 4; p++) {
  const input = gamepadManager.getPlayerInput(p);
  if (!input) continue;  // 未接続
  
  // Standard Input API を使用
  console.log(input.A);           // boolean
  console.log(input.leftStickX);  // -1.0 ~ 1.0
}
```

#### Standard Input オブジェクト形式

```javascript
{
  // ボタン（boolean）
  A: boolean,
  B: boolean,
  X: boolean,
  Y: boolean,
  L: boolean,          // 左ショルダー
  R: boolean,          // 右ショルダー

  // トリガー（0.0 ~ 1.0）
  ZL: number,          // LT （左トリガー）アナログ
  ZR: number,          // RT （右トリガー）アナログ

  // アナログスティック（-1.0 ~ 1.0）
  leftStickX: number,
  leftStickY: number,
  rightStickX: number,
  rightStickY: number,

  // スティック押し込み
  leftStickPress: boolean,
  rightStickPress: boolean,

  // 十字キー
  dpadUp: boolean,
  dpadDown: boolean,
  dpadLeft: boolean,
  dpadRight: boolean,
}
```

---

## 🔌 使い方

### 1. HTMLでの読み込み（ES Module方式）

```html
<!-- ES Module として読み込む（推奨） -->
<script type="module">
  import { GamepadManager } from './multipad.js';

  // 以下のコードを記述
</script>
```

### 1-2. 従来方式での読み込み（レガシー互換性）

```html
<!-- グローバル変数として読み込む（非推奨） -->
<script src="multipad.js"></script>
<script>
  // multipad.js が GlobalScope に GamepadManager を登録
</script>
```

### 2. 初期化

```javascript
// GamepadManager インスタンスを作成
const gamepadManager = new GamepadManager();

// 自動的に:
// - gamepadconnected/gamepaddisconnected イベントをリッスン
// - Deleteキーで DEBUG モード切り替え
// - 毎フレーム自動更新
```

### 3. ゲーム側での使用（ES Module）

```javascript
import { GamepadManager } from './multipad.js';

class MyGame {
  constructor() {
    this.gamepadManager = new GamepadManager();
  }

  update(deltaTime) {
    // プレイヤー1の入力を取得
    const input = this.gamepadManager.getPlayerInput(1);
    
    if (!input) {
      console.log('プレイヤー1は未接続');
      return;
    }

    // 左スティックで移動
    this.player.vx = input.leftStickX * 100 * deltaTime;
    this.player.vy = input.leftStickY * 100 * deltaTime;

    // ボタン入力
    if (input.A) { this.player.jump(); }
    if (input.B) { this.player.attack(); }
    if (input.X) { this.player.defend(); }
    if (input.Y) { this.player.interact(); }

    // トリガー入力（アナログ）
    if (input.ZL > 0.5) { this.player.aimLT(); }
    if (input.ZR > 0.5) { this.player.aimRT(); }

    // 十字キー
    if (input.dpadUp) { this.player.menuUp(); }
    if (input.dpadDown) { this.player.menuDown(); }
  }
}

// ゲーム開始
const game = new MyGame();
```

---

## 🛠️ GamepadManager API リファレンス

### 公開メソッド

#### `getPlayerInput(playerNum: number): Object|null`
指定プレイヤーの Standard Input を取得。
```javascript
const input = gamepadManager.getPlayerInput(1);
if (input?.A) { /* Aボタンが押されている */ }
```

#### `getPlayerGamepadIndex(playerNum: number): number|null`
プレイヤーに割り当てられたゲームパッドのインデックスを取得。
```javascript
const gpIndex = gamepadManager.getPlayerGamepadIndex(1);
console.log(`P1 uses Gamepad${gpIndex}`);
```

#### `isPlayerConnected(playerNum: number): boolean`
プレイヤーが接続しているか確認。
```javascript
if (gamepadManager.isPlayerConnected(1)) {
  console.log('P1 is connected');
}
```

#### `getGamepad(index: number): Gamepad|null`
低レベル Gamepad API へのアクセス（必要に応じて）。
```javascript
const gamepad = gamepadManager.getGamepad(0);
// 標準Gamepad APIで直接操作可能
```

#### `getStandardInput(gamepad: Gamepad): Object`
Gamepad オブジェクトを Standard Input に変換。
```javascript
const gamepad = navigator.getGamepads()[0];
const input = gamepadManager.getStandardInput(gamepad);
```

#### `reset()`
すべてのプレイヤーを未登録状態にリセット。
```javascript
gamepadManager.reset();
```

#### `log(message: string, type?: string): void`
ログ出力（HTMLの `#detectionLog` 要素に表示）。
```javascript
gamepadManager.log('Player 1 joined!', 'info');
gamepadManager.log('Connection error', 'error');
```

---

## ⚠️ ES Module での注意点

### CORS 制限について

ES Module は CORS ポリシーが適用されます。以下の環境での動作が異なります：

**✅ 動作する環境**
```
- ローカルファイル: file:// プロトコル（最新ブラウザ）
- Webサーバー: http:// / https://
- npm + バンドラー（Vite, Webpack等）
```

**❌ 動作しない環境**
```
- クロスオリジン読み込み（別ドメイン）
- 単純に <script> タグで multipad.js をロードした場合
```

### ローカルテスト方法

```bash
# Python 3.x を使用
python -m http.server 8000

# または Node.js を使用
npx http-server

# ブラウザで開く
http://localhost:8000/MultiPadControl_v1_0_1.html
```

### グローバル変数としての使用

ES Module スコープ内では、通常のグローバル変数は作成されません。

```javascript
// ❌ これはできない（ES Module スコープ外）
window.GamepadManager // undefined

// ✅ import を使用
import { GamepadManager } from './multipad.js';
const manager = new GamepadManager();
```

### CommonJS との混在

同じプロジェクト内で ES Module と CommonJS を混在させる場合は注意が必要です。

```javascript
// ESM ファイル（.mjs または package.json の "type": "module"）
import { GamepadManager } from './multipad.js';

// CommonJS ファイル（.js）
const { GamepadManager } = require('./multipad.js');
```

---

## 🧪 DEBUG モード

### 起動方法

HTMLファイルを開いて、**Delete キーを押す**

```
┌─────────────────────────────────────┐
│  MultiPadControl v1.0.1             │
│  ───────────────────────────────    │
│  P1                                 │
│  Connected: YES                     │
│  Index: 0                           │
│  ID: HORIPAD S                      │
│  Mapping: standard                  │
│                                     │
│  BUTTONS                            │
│  A OFF                              │
│  B OFF                              │
│  ...                                │
│                                     │
│  STICKS                             │
│  LX: 0.00                           │
│  LY: 0.00                           │
│  RX: 0.50                           │
│  RY: -0.30                          │
│  ...                                │
└─────────────────────────────────────┘
```

### DEBUG パネルの見方

| 表示項目 | 説明 |
|---------|------|
| Connected | ゲームパッドの接続状態（YES/NO） |
| Index | ゲームパッドのインデックス |
| ID | ゲームパッドの識別子 |
| Mapping | Standard か Standard以外か |
| A～Y | デジタルボタン（ON/OFF） |
| ZL/ZR | アナログトリガー（0.00～1.00） |
| LX/LY | 左スティック（-1.0～1.0） |
| RX/RY | 右スティック（-1.0～1.0） |
| LS/RS | スティック押し込み（ON/OFF） |
| D↑/D↓/D←/D→ | 十字キー（ON/OFF） |
| ΔTime | フレーム間隔（ミリ秒） |

---

## 🎮 他プロジェクトでの使用例

### パターン1: シンプルな2Dゲーム（ES Module）

```html
<!DOCTYPE html>
<html>
<head>
  <title>Simple 2D Game with GamepadManager</title>
</head>
<body>
  <canvas id="canvas" width="640" height="480"></canvas>
  
  <script type="module">
    import { GamepadManager } from './multipad.js';

    const gamepadManager = new GamepadManager();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let playerX = 100, playerY = 100;

    function gameLoop() {
      // 全プレイヤーを処理
      for (let p = 1; p <= 4; p++) {
        const input = gamepadManager.getPlayerInput(p);
        if (!input) continue;

        // プレイヤー1 の入力処理
        if (p === 1) {
          playerX += input.leftStickX * 3;
          playerY += input.leftStickY * 3;

          if (input.A) {
            ctx.fillStyle = 'red';
          }
        }
      }

      // 描画
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'blue';
      ctx.fillRect(playerX, playerY, 32, 32);

      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  </script>
</body>
</html>
```

### パターン2: ES Module での名前付きimport

```javascript
// 名前付き import
import { GamepadManager } from './multipad.js';

const gamepadManager = new GamepadManager();
// ゲーム側のコードを記述
```

### パターン3: NPM/バンドラー環境での使用

```javascript
// Vite, Webpack, Parcel等を使用する場合
import { GamepadManager } from './multipad.js';

// または npm package化した場合
// import { GamepadManager } from 'multipad';

const gamepadManager = new GamepadManager();
export { gamepadManager };
```

---

## 🔄 W3C Standard Gamepad マッピング

`multipad.js` が対応する Standard Gamepad ボタン配置：

| # | ボタン | 説明 |
|---|--------|------|
| 0 | A | 青ボタン |
| 1 | B | 赤ボタン |
| 2 | X | 黄ボタン |
| 3 | Y | 緑ボタン |
| 4 | L | 左ショルダー |
| 5 | R | 右ショルダー |
| 6 | ZL | 左トリガー |
| 7 | ZR | 右トリガー |
| 8 | SELECT/BACK | - |
| 9 | START | - |
| 10 | LS | 左スティック押し込み |
| 11 | RS | 右スティック押し込み |
| 12 | D↑ | 十字キー上 |
| 13 | D↓ | 十字キー下 |
| 14 | D← | 十字キー左 |
| 15 | D→ | 十字キー右 |

**Axes（アナログ軸）**

| # | 軸 | 範囲 |
|---|----|----|
| 0 | 左スティック X | -1.0 ～ 1.0 |
| 1 | 左スティック Y | -1.0 ～ 1.0 |
| 2 | 右スティック X | -1.0 ～ 1.0 |
| 3 | 右スティック Y | -1.0 ～ 1.0 |

---

## 📖 イベント実装済み

GamepadManager は以下のネイティブイベントを自動的にハンドルしています：

```javascript
window.addEventListener('gamepadconnected', (e) => {
  // ゲームパッド接続時
  // GamepadManager が自動でハンドル
});

window.addEventListener('gamepaddisconnected', (e) => {
  // ゲームパッド切断時
  // GamepadManager が自動で割り当てを解除
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Delete') {
    // DEBUG モード切り替え（自動ハンドル）
  }
});
```

独自のイベントハンドリングが必要な場合は、`GamepadManager` を拡張してください。

---

## 🚀 パフォーマンス

- **フレームレート**: 60FPS 対応（requestAnimationFrame ベース）
- **遅延**: < 16ms（1フレーム分）
- **メモリ**: Map/Set で効率的に管理
- **ポーリング**: Gamepad API (navigator.getGamepads) を毎フレーム呼び出し

---

## 📝 最小限のHTMLサンプル

### Hello World

```html
<!DOCTYPE html>
<html>
<head>
  <title>GamepadManager Test</title>
</head>
<body>
  <h1>GamepadManager Test</h1>
  <p>コントローラーのAボタンを押してください</p>
  <div id="output"></div>

  <script type="module">
    import { GamepadManager } from './multipad.js';

    const gamepadManager = new GamepadManager();
    const output = document.getElementById('output');

    setInterval(() => {
      let text = '';
      for (let p = 1; p <= 4; p++) {
        const input = gamepadManager.getPlayerInput(p);
        if (input) {
          text += `P${p}: A=${input.A} LX=${input.leftStickX.toFixed(2)} <br>`;
        }
      }
      output.innerHTML = text || 'コントローラーを接続してください';
    }, 100);
  </script>
</body>
</html>
```

### Delete キーでDEBUGモード起動

```html
<!DOCTYPE html>
<html>
<body>
  <h1>GamepadManager Debug Panel</h1>
  <p>Delete キーを押して DEBUG パネルを表示</p>

  <script type="module">
    import { GamepadManager } from './multipad.js';
    new GamepadManager();  // DEBUG モード内蔵
  </script>
</body>
</html>
```

---

## ⚙️ カスタマイズ例

### カスタムログシステムの統合

```javascript
const gamepadManager = new GamepadManager();

// log メソッドをオーバーライド
gamepadManager.log = (message, type) => {
  // 独自のログシステムに送信
  myCustomLogger.send({
    message: message,
    type: type,
    timestamp: new Date().toISOString()
  });
};
```

### イベントシステムの追加

```javascript
class ExtendedGamepadManager extends GamepadManager {
  constructor() {
    super();
    this.listeners = {};
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(cb => cb(data));
    }
  }

  update() {
    super.update();

    // プレイヤー参加時にイベント発火
    for (let p = 1; p <= 4; p++) {
      if (this.playerAssignments.has(p) && !this.prevPlayerCount?.has(p)) {
        this.emit('playerJoined', { playerNum: p });
      }
    }
  }
}

// 使用例
const manager = new ExtendedGamepadManager();
manager.on('playerJoined', ({ playerNum }) => {
  console.log(`Player ${playerNum} joined!`);
});
```

---

## 🐛 トラブルシューティング

### ❓ コントローラーが認識されない

1. **ゲームパッドがブラウザに認識されているか確認**
   ```javascript
   console.log(navigator.getGamepads());
   ```

2. **コントローラーのボタン配置を確認（DEBUG モード）**
   - Delete キー → DEBUG モード起動
   - 各ボタンを押してマッピングを確認

3. **ブラウザの互換性確認**
   - Chrome/Firefox/Safari で Gamepad API をサポート

### ❓ 入力がラグる

1. **フレームレート確認**
   - DEBUG パネルの ΔTime を確認（理想: 16ms = 60FPS）

2. **ゲーム側の処理を最適化**
   - 不要な計算を削除
   - 大量のゲームオブジェクト処理を削減

### ❓ 複数コントローラーが混在する

multipad.js は Standard Gamepad 仕様に完全準拠しているため、多くのコントローラーで動作します。

もし非標準のコントローラーを使用している場合は、別途マッピングを実装してください。

---

## 📄 ライセンス

MultiPadControl v1.0.1 はオープンソースです。自由に改変・配布できます。

---

## 📞 サポート

問題が発生した場合は DEBUG モード（Delete キー）を起動して、以下を確認してください：

1. ゲームパッドが接続されているか
2. Standard Gamepad マッピングに対応しているか
3. 各ボタンの値が正しく取得されているか

