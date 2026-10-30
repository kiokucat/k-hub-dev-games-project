/**
 * MultiPadControl v1.0.1
 * Standard Gamepad管理コアライブラリ
 * 
 * ============================================
 * 使用方法（ES Module - 推奨）
 * ============================================
 * 
 * HTML:
 *   <script type="module">
 *     import { GamepadManager } from './multipad.js';
 *     const gamepadManager = new GamepadManager();
 *   </script>
 * 
 * 使用例:
 *   const input = gamepadManager.getPlayerInput(playerNum);
 *   if (input?.A) { ... }
 *   if (input?.leftStickX > 0.5) { ... }
 * 
 * ============================================
 * Standard Input API
 * ============================================
 * 
 *   input.A, input.B, input.X, input.Y       // boolean
 *   input.L, input.R                         // boolean
 *   input.ZL, input.ZR                       // 0.0 ~ 1.0 (アナログ)
 *   input.leftStickX, input.leftStickY       // -1.0 ~ 1.0
 *   input.rightStickX, input.rightStickY     // -1.0 ~ 1.0
 *   input.leftStickPress, input.rightStickPress  // boolean
 *   input.dpadUp, input.dpadDown             // boolean
 *   input.dpadLeft, input.dpadRight          // boolean
 * 
 * ============================================
 * DEBUG モード
 * ============================================
 * 
 * Delete キーを押すと、画面左上に DEBUG パネルが表示されます。
 * すべてのボタン・スティックの入力状態をリアルタイムで確認できます。
 */

class GamepadManager {
  // ============================================
  // Standard Gamepad ボタン定義
  // ============================================
  static STANDARD_BUTTONS = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    L: 4,
    R: 5,
    ZL: 6,              // LT (Left Trigger)
    ZR: 7,              // RT (Right Trigger)
    SELECT: 8,
    START: 9,
    LEFT_STICK: 10,
    RIGHT_STICK: 11,
    DPAD_UP: 12,
    DPAD_DOWN: 13,
    DPAD_LEFT: 14,
    DPAD_RIGHT: 15
  };

  constructor() {
    // プレイヤー割り当て Map<playerNum, gamepadIndex>
    this.playerAssignments = new Map();
    // プレイヤー入力データ Map<playerNum, standardInput>
    this.playerGamepads = new Map();
    // 前フレーム状態 Map<gamepadIndex, previousInputState>
    this.gamepadPrevState = new Map();
    // 接続ゲームパッド Set
    this.connectedGamepads = new Set();
    
    // 登録モード フラグ
    this.registrationMode = true;
    // デバッグモード フラグ
    this.debugMode = false;
    // デルタ時間
    this.deltaTime = 0;
    // 前フレーム時刻
    this.lastUpdateTime = performance.now();
    
    // イベントリスナー登録
    this.setupEventListeners();
    
    // 更新ループ開始
    this.updateLoop();
  }

  /**
   * イベントリスナー登録
   */
  setupEventListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      const index = e.gamepad.index;
      this.connectedGamepads.add(index);
      this.log(`[GP${index}] 接続: ${e.gamepad.id || 'Unknown'}`);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      const index = e.gamepad.index;
      this.connectedGamepads.delete(index);
      
      // 割り当てられたプレイヤーを解除
      for (const [playerNum, gpIndex] of this.playerAssignments) {
        if (gpIndex === index) {
          this.playerAssignments.delete(playerNum);
          this.playerGamepads.delete(playerNum);
          this.log(`[P${playerNum}] 切断`);
          break;
        }
      }
    });

    // DEBUG モード切り替え（Delete キー）
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete') {
        this.debugMode = !this.debugMode;
        this.log(`DEBUG モード: ${this.debugMode ? 'ON' : 'OFF'}`);
        this.updateDebugPanel();
      }
    });
  }

  /**
   * Standard Input オブジェクトを取得
   * @param {Gamepad} gamepad - Gamepad API の Gamepad オブジェクト
   * @returns {Object} Standard Input
   */
  getStandardInput(gamepad) {
    if (!gamepad) {
      return {
        A: false, B: false, X: false, Y: false,
        L: false, R: false, ZL: 0, ZR: 0,
        leftStickX: 0, leftStickY: 0,
        rightStickX: 0, rightStickY: 0,
        leftStickPress: false, rightStickPress: false,
        dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false,
      };
    }

    const BUTTONS = GamepadManager.STANDARD_BUTTONS;

    return {
      // ボタン（boolean）
      A: gamepad.buttons[BUTTONS.A]?.pressed || false,
      B: gamepad.buttons[BUTTONS.B]?.pressed || false,
      X: gamepad.buttons[BUTTONS.X]?.pressed || false,
      Y: gamepad.buttons[BUTTONS.Y]?.pressed || false,
      L: gamepad.buttons[BUTTONS.L]?.pressed || false,
      R: gamepad.buttons[BUTTONS.R]?.pressed || false,

      // トリガー（0.0～1.0の値）
      ZL: gamepad.buttons[BUTTONS.ZL]?.value || 0,
      ZR: gamepad.buttons[BUTTONS.ZR]?.value || 0,

      // アナログスティック（-1.0～1.0）
      leftStickX: gamepad.axes[0] || 0,
      leftStickY: gamepad.axes[1] || 0,
      rightStickX: gamepad.axes[2] || 0,
      rightStickY: gamepad.axes[3] || 0,

      // スティック押し込み
      leftStickPress: gamepad.buttons[BUTTONS.LEFT_STICK]?.pressed || false,
      rightStickPress: gamepad.buttons[BUTTONS.RIGHT_STICK]?.pressed || false,

      // 十字キー
      dpadUp: gamepad.buttons[BUTTONS.DPAD_UP]?.pressed || false,
      dpadDown: gamepad.buttons[BUTTONS.DPAD_DOWN]?.pressed || false,
      dpadLeft: gamepad.buttons[BUTTONS.DPAD_LEFT]?.pressed || false,
      dpadRight: gamepad.buttons[BUTTONS.DPAD_RIGHT]?.pressed || false,
    };
  }

  /**
   * ゲームパッドを取得
   * @param {number} index - ゲームパッドのインデックス
   * @returns {Gamepad|null}
   */
  getGamepad(index) {
    const gamepads = navigator.getGamepads?.() || [];
    return gamepads[index] || null;
  }

  /**
   * Aボタンで参加処理
   * @param {number} gamepadIndex - ゲームパッドのインデックス
   */
  handleRegistration(gamepadIndex) {
    const gamepad = this.getGamepad(gamepadIndex);
    if (!gamepad) return;

    const BUTTONS = GamepadManager.STANDARD_BUTTONS;
    const currentInput = this.getStandardInput(gamepad);
    const aButtonPressed = currentInput.A;

    // 前フレーム状態を取得
    if (!this.gamepadPrevState.has(gamepadIndex)) {
      this.gamepadPrevState.set(gamepadIndex, {});
    }
    const prevState = this.gamepadPrevState.get(gamepadIndex);
    const prevAButtonState = prevState[BUTTONS.A] || false;

    // Aボタンの立ち上がりを検出
    if (aButtonPressed && !prevAButtonState) {
      // 既に割り当てられていないか確認
      for (const [_, gpIndex] of this.playerAssignments) {
        if (gpIndex === gamepadIndex) {
          return; // 既に参加済み
        }
      }

      // 空いているプレイヤースロットを探す
      for (let playerNum = 1; playerNum <= 4; playerNum++) {
        if (!this.playerAssignments.has(playerNum)) {
          this.playerAssignments.set(playerNum, gamepadIndex);
          this.log(`[P${playerNum}] 登録完了 (GP${gamepadIndex}: ${gamepad.id || 'Unknown'})`);
          return;
        }
      }
    }

    prevState[BUTTONS.A] = aButtonPressed;
  }

  /**
   * メイン更新関数
   */
  update() {
    const now = performance.now();
    this.deltaTime = (now - this.lastUpdateTime) / 1000;
    this.deltaTime = Math.min(this.deltaTime, 0.05); // 上限処理
    this.lastUpdateTime = now;

    // 登録モード中：Aボタン入力を監視
    if (this.registrationMode) {
      for (const index of this.connectedGamepads) {
        const gamepad = this.getGamepad(index);
        if (gamepad) {
          this.handleRegistration(index);
        }
      }
    }

    // すべての登録済みプレイヤーの入力を更新
    for (const [playerNum, gpIndex] of this.playerAssignments) {
      const gamepad = this.getGamepad(gpIndex);
      const input = this.getStandardInput(gamepad);
      this.playerGamepads.set(playerNum, input);
    }

    // DEBUG パネルを更新
    if (this.debugMode) {
      this.updateDebugPanel();
    }
  }

  /**
   * DEBUG パネルを更新
   */
  updateDebugPanel() {
    let panel = document.getElementById('debugPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'debugPanel';
      panel.className = 'debug-panel';
      const content = document.createElement('div');
      content.id = 'debugContent';
      panel.appendChild(content);
      document.body.appendChild(panel);
    }

    const content = document.getElementById('debugContent');
    let html = '<div class="debug-version">MultiPadControl v1.0.1</div>';

    for (let p = 1; p <= 4; p++) {
      html += `<div class="debug-player">`;
      html += `<div class="debug-player-title">P${p}</div>`;

      if (this.playerAssignments.has(p)) {
        const gpIndex = this.playerAssignments.get(p);
        const gamepad = this.getGamepad(gpIndex);
        const inputs = this.playerGamepads.get(p);

        if (gamepad) {
          html += `<div class="debug-player-meta">Connected: YES</div>`;
          html += `<div class="debug-player-meta">Index: ${gpIndex}</div>`;
          html += `<div class="debug-player-meta">ID: ${gamepad.id || 'Unknown'}</div>`;
          html += `<div class="debug-player-meta">Mapping: ${gamepad.mapping || 'standard'}</div>`;

          if (inputs) {
            html += `<div class="debug-section">BUTTONS</div>`;
            html += `<div class="debug-info">A ${inputs.A ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">B ${inputs.B ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">X ${inputs.X ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">Y ${inputs.Y ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">L ${inputs.L ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">R ${inputs.R ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">ZL ${inputs.ZL > 0 ? `<span class="debug-on">${inputs.ZL.toFixed(2)}</span>` : '0.00'}</div>`;
            html += `<div class="debug-info">ZR ${inputs.ZR > 0 ? `<span class="debug-on">${inputs.ZR.toFixed(2)}</span>` : '0.00'}</div>`;

            html += `<div class="debug-section">STICKS</div>`;
            html += `<div class="debug-info">LX: ${inputs.leftStickX.toFixed(2)}</div>`;
            html += `<div class="debug-info">LY: ${inputs.leftStickY.toFixed(2)}</div>`;
            html += `<div class="debug-info">RX: ${inputs.rightStickX.toFixed(2)}</div>`;
            html += `<div class="debug-info">RY: ${inputs.rightStickY.toFixed(2)}</div>`;

            html += `<div class="debug-section">OTHER</div>`;
            html += `<div class="debug-info">LS ${inputs.leftStickPress ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">RS ${inputs.rightStickPress ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">D↑ ${inputs.dpadUp ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">D↓ ${inputs.dpadDown ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">D← ${inputs.dpadLeft ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
            html += `<div class="debug-info">D→ ${inputs.dpadRight ? '<span class="debug-on">ON</span>' : 'OFF'}</div>`;
          }
        } else {
          html += `<div class="debug-error">Connected: NO</div>`;
        }
      } else {
        html += `<div class="debug-info">未参加</div>`;
      }

      html += `</div>`;
    }

    html += `<div style="margin-top: 6px; color: #888; font-size: 8px;">ΔTime: ${(this.deltaTime * 1000).toFixed(2)}ms</div>`;

    content.innerHTML = html;
    panel.classList.add('active');
  }

  /**
   * プレイヤーの入力データを取得
   * @param {number} playerNum - プレイヤー番号（1-4）
   * @returns {Object|null}
   */
  getPlayerInput(playerNum) {
    return this.playerGamepads.get(playerNum) || null;
  }

  /**
   * プレイヤーに割り当てられたゲームパッドのインデックスを取得
   * @param {number} playerNum - プレイヤー番号（1-4）
   * @returns {number|null}
   */
  getPlayerGamepadIndex(playerNum) {
    return this.playerAssignments.get(playerNum) || null;
  }

  /**
   * プレイヤーが接続しているか確認
   * @param {number} playerNum - プレイヤー番号（1-4）
   * @returns {boolean}
   */
  isPlayerConnected(playerNum) {
    const gpIndex = this.playerAssignments.get(playerNum);
    if (gpIndex === undefined) return false;
    return this.connectedGamepads.has(gpIndex);
  }

  /**
   * リセット（すべてのプレイヤーを削除）
   */
  reset() {
    this.playerAssignments.clear();
    this.playerGamepads.clear();
    this.gamepadPrevState.clear();
    this.registrationMode = true;
    this.log('リセット完了');
  }

  /**
   * ログ出力
   * @param {string} message - メッセージ
   * @param {string} type - ログタイプ('info', 'warn', 'error')
   */
  log(message, type = 'info') {
    const logEl = document.getElementById('detectionLog');
    if (!logEl) {
      console.log(`[${type.toUpperCase()}] ${message}`);
      return;
    }

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    logEl.insertBefore(entry, logEl.firstChild);

    while (logEl.children.length > 50) {
      logEl.removeChild(logEl.lastChild);
    }
  }

  /**
   * 更新ループ
   */
  updateLoop() {
    this.update();
    requestAnimationFrame(() => this.updateLoop());
  }
}

// ============================================
// Export（ES Module & CommonJS 互換）
// ============================================

// ES Module export
export { GamepadManager };

// CommonJS export（ Node.js 互換性）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamepadManager;
}
