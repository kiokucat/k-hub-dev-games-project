/**
 * MultiPadControl v2.2.0 - Host Authoritative Input Manager
 * Standard Gamepad + Keyboard + Mouse + Custom Keybinds
 */

class GamepadManager {
  static STANDARD_BUTTONS = {
    A: 0, B: 1, X: 2, Y: 3,
    L: 4, R: 5, ZL: 6, ZR: 7,
    SELECT: 8, START: 9,
    LEFT_STICK: 10, RIGHT_STICK: 11,
    DPAD_UP: 12, DPAD_DOWN: 13, DPAD_LEFT: 14, DPAD_RIGHT: 15
  };

  static DEFAULT_KEYBOARD_MAPPING = {
    'w': { leftStickY: -1 }, 'arrowup': { leftStickY: -1 },
    's': { leftStickY: 1 }, 'arrowdown': { leftStickY: 1 },
    'a': { leftStickX: -1 }, 'arrowleft': { leftStickX: -1 },
    'd': { leftStickX: 1 }, 'arrowright': { leftStickX: 1 },
    'z': { A: true }, 'x': { B: true },
    'c': { X: true }, 'v': { Y: true },
    'q': { L: true }, 'e': { INVENTORY: true },
    'shift': { ZL: 1.0 }, 'control': { ZR: 1.0 },
    'enter': { START: true },
    'o': { OPTIONS: true },
  };

  constructor() {
    this.playerAssignments = new Map();
    this.playerGamepads = new Map();
    this.gamepadPrevState = new Map();
    this.connectedGamepads = new Set();
    this.localPlayerNums = [1];
    this.keyboardState = {};
    this.mouseLeftDown = false;
    this.mouseRightDown = false;
    this.mouseAltDown = false;
    this.mouseSensitivity = 0.004;
    this.mouseRightStickX = 0;
    this.mouseRightStickY = 0;
    this.mouseDecay = 5.0;
    this.mouseWheelDelta = 0;
    this.registrationMode = true;
    this.debugMode = false;
    this.deltaTime = 0;
    this.lastUpdateTime = performance.now();
    this.keyBindings = this.loadKeyBindings();
    this.setupEventListeners();
    this.setupKeyboardMouseListeners();
    this.updateLoop();
  }

  loadKeyBindings() {
    try {
      const saved = localStorage.getItem('survival_keybindings');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return JSON.parse(JSON.stringify(GamepadManager.DEFAULT_KEYBOARD_MAPPING));
  }

  saveKeyBindings() {
    localStorage.setItem('survival_keybindings', JSON.stringify(this.keyBindings));
  }

  resetKeyBindings() {
    this.keyBindings = JSON.parse(JSON.stringify(GamepadManager.DEFAULT_KEYBOARD_MAPPING));
    this.saveKeyBindings();
  }

  setKeyBinding(action, keys) {
    // action: { action: 'A' | 'B' | 'X' | 'Y' | 'L' | 'R' | 'ZL' | 'ZR' | 'START' | 'INVENTORY' | 'leftStickX' | 'leftStickY' | 'OPTIONS', value: ... }
    // シンプル化: キー文字列 -> マッピングオブジェクト
    this.keyBindings = keys;
    this.saveKeyBindings();
  }

  setupEventListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      this.connectedGamepads.add(e.gamepad.index);
    });
    window.addEventListener('gamepaddisconnected', (e) => {
      const idx = e.gamepad.index;
      this.connectedGamepads.delete(idx);
      for (const [pn, gi] of this.playerAssignments) {
        if (gi === idx) { this.playerAssignments.delete(pn); this.playerGamepads.delete(pn); break; }
      }
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Delete') { this.debugMode = !this.debugMode; this.updateDebugPanel(); }
    });
  }

  setupKeyboardMouseListeners() {
    window.addEventListener('keydown', (e) => { this.keyboardState[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', (e) => { this.keyboardState[e.key.toLowerCase()] = false; });
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseLeftDown = true;
      if (e.button === 2) { this.mouseRightDown = true; e.preventDefault(); }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseLeftDown = false;
      if (e.button === 2) this.mouseRightDown = false;
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousemove', (e) => {
      if (this.mouseAltDown) {
        this.mouseRightStickX += e.movementX * this.mouseSensitivity;
        this.mouseRightStickY += e.movementY * this.mouseSensitivity;
        this.mouseRightStickX = Math.max(-1, Math.min(1, this.mouseRightStickX));
        this.mouseRightStickY = Math.max(-1, Math.min(1, this.mouseRightStickY));
      }
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Alt') { this.mouseAltDown = true; e.preventDefault(); } });
    window.addEventListener('keyup', (e) => { if (e.key === 'Alt') this.mouseAltDown = false; });
    window.addEventListener('wheel', (e) => { this.mouseWheelDelta += e.deltaY; e.preventDefault(); }, { passive: false });
  }

  getKeyboardInput() {
    const input = {
      A: false, B: false, X: false, Y: false,
      L: false, R: false, ZL: 0, ZR: 0,
      leftStickX: 0, leftStickY: 0,
      rightStickX: 0, rightStickY: 0,
      leftStickPress: false, rightStickPress: false,
      dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false,
      START: false, INVENTORY: false, OPTIONS: false,
    };
    let moveX = 0, moveY = 0;
    for (const [key, map] of Object.entries(this.keyBindings)) {
      if (this.keyboardState[key]) {
        if (map.leftStickX !== undefined) moveX += map.leftStickX;
        if (map.leftStickY !== undefined) moveY += map.leftStickY;
        if (map.A) input.A = true;
        if (map.B) input.B = true;
        if (map.X) input.X = true;
        if (map.Y) input.Y = true;
        if (map.L) input.L = true;
        if (map.R) input.R = true;
        if (map.ZL !== undefined) input.ZL = map.ZL;
        if (map.ZR !== undefined) input.ZR = map.ZR;
        if (map.START) input.START = true;
        if (map.INVENTORY) input.INVENTORY = true;
        if (map.OPTIONS) input.OPTIONS = true;
      }
    }
    const len = Math.hypot(moveX, moveY);
    if (len > 1) { moveX /= len; moveY /= len; }
    input.leftStickX = moveX;
    input.leftStickY = moveY;
    input.rightStickX = this.mouseRightStickX;
    input.rightStickY = this.mouseRightStickY;
    if (this.mouseLeftDown) input.ZR = 1.0;
    if (this.mouseRightDown) input.ZL = 1.0;
    if (this.mouseWheelDelta > 30) { input.R = true; this.mouseWheelDelta = 0; }
    else if (this.mouseWheelDelta < -30) { input.L = true; this.mouseWheelDelta = 0; }
    this.mouseWheelDelta *= 0.9;
    return input;
  }

  getStandardInput(gamepad) {
    if (!gamepad) {
      return { A: false, B: false, X: false, Y: false, L: false, R: false, ZL: 0, ZR: 0,
        leftStickX: 0, leftStickY: 0, rightStickX: 0, rightStickY: 0,
        leftStickPress: false, rightStickPress: false,
        dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false, START: false, OPTIONS: false };
    }
    const B = GamepadManager.STANDARD_BUTTONS;
    return {
      A: gamepad.buttons[B.A]?.pressed || false,
      B: gamepad.buttons[B.B]?.pressed || false,
      X: gamepad.buttons[B.X]?.pressed || false,
      Y: gamepad.buttons[B.Y]?.pressed || false,
      L: gamepad.buttons[B.L]?.pressed || false,
      R: gamepad.buttons[B.R]?.pressed || false,
      ZL: gamepad.buttons[B.ZL]?.value || 0,
      ZR: gamepad.buttons[B.ZR]?.value || 0,
      leftStickX: gamepad.axes[0] || 0,
      leftStickY: gamepad.axes[1] || 0,
      rightStickX: gamepad.axes[2] || 0,
      rightStickY: gamepad.axes[3] || 0,
      leftStickPress: gamepad.buttons[B.LEFT_STICK]?.pressed || false,
      rightStickPress: gamepad.buttons[B.RIGHT_STICK]?.pressed || false,
      dpadUp: gamepad.buttons[B.DPAD_UP]?.pressed || false,
      dpadDown: gamepad.buttons[B.DPAD_DOWN]?.pressed || false,
      dpadLeft: gamepad.buttons[B.DPAD_LEFT]?.pressed || false,
      dpadRight: gamepad.buttons[B.DPAD_RIGHT]?.pressed || false,
      START: gamepad.buttons[B.START]?.pressed || false,
      OPTIONS: false,
    };
  }

  mergeInputs(a, b) {
    return {
      A: a.A || b.A, B: a.B || b.B, X: a.X || b.X, Y: a.Y || b.Y,
      L: a.L || b.L, R: a.R || b.R,
      ZL: Math.max(a.ZL || 0, b.ZL || 0), ZR: Math.max(a.ZR || 0, b.ZR || 0),
      leftStickX: a.leftStickX || b.leftStickX, leftStickY: a.leftStickY || b.leftStickY,
      rightStickX: a.rightStickX || b.rightStickX, rightStickY: a.rightStickY || b.rightStickY,
      leftStickPress: a.leftStickPress || b.leftStickPress,
      rightStickPress: a.rightStickPress || b.rightStickPress,
      dpadUp: a.dpadUp || b.dpadUp, dpadDown: a.dpadDown || b.dpadDown,
      dpadLeft: a.dpadLeft || b.dpadLeft, dpadRight: a.dpadRight || b.dpadRight,
      START: a.START || b.START,
      OPTIONS: a.OPTIONS || b.OPTIONS,
    };
  }

  getGamepad(index) {
    const gamepads = navigator.getGamepads?.() || [];
    return gamepads[index] || null;
  }

  handleRegistration(gamepadIndex) {
    const gamepad = this.getGamepad(gamepadIndex);
    if (!gamepad) return;
    const B = GamepadManager.STANDARD_BUTTONS;
    const cur = this.getStandardInput(gamepad);
    if (!this.gamepadPrevState.has(gamepadIndex)) this.gamepadPrevState.set(gamepadIndex, {});
    const prev = this.gamepadPrevState.get(gamepadIndex);
    if (cur.A && !prev[B.A]) {
      for (const [_, gi] of this.playerAssignments) if (gi === gamepadIndex) return;
      for (let pn = 1; pn <= 4; pn++) {
        if (!this.playerAssignments.has(pn)) {
          this.playerAssignments.set(pn, gamepadIndex);
          if (!this.localPlayerNums.includes(pn)) this.localPlayerNums.push(pn);
          return;
        }
      }
    }
    prev[B.A] = cur.A;
  }

  update() {
    const now = performance.now();
    this.deltaTime = Math.min((now - this.lastUpdateTime) / 1000, 0.05);
    this.lastUpdateTime = now;
    if (!this.mouseAltDown) {
      this.mouseRightStickX *= Math.max(0, 1 - this.mouseDecay * this.deltaTime);
      this.mouseRightStickY *= Math.max(0, 1 - this.mouseDecay * this.deltaTime);
      if (Math.abs(this.mouseRightStickX) < 0.01) this.mouseRightStickX = 0;
      if (Math.abs(this.mouseRightStickY) < 0.01) this.mouseRightStickY = 0;
    }
    if (this.registrationMode) {
      if (this.keyboardState['x'] && !this._prevKeyboardX) {
        for (const pNum of this.localPlayerNums) {
          if (!this.playerAssignments.has(pNum)) {
            this.playerAssignments.set(pNum, 'keyboard');
            break;
          }
        }
      }
      this._prevKeyboardX = this.keyboardState['x'];
      for (const index of this.connectedGamepads) {
        const gamepad = this.getGamepad(index);
        if (gamepad) this.handleRegistration(index);
      }
    }
    const kbInput = this.getKeyboardInput();
    for (const [playerNum, gpIndex] of this.playerAssignments) {
      let input;
      if (gpIndex === 'keyboard') input = kbInput;
      else {
        const gamepad = this.getGamepad(gpIndex);
        input = this.getStandardInput(gamepad);
      }
      if (this.localPlayerNums.includes(playerNum)) input = this.mergeInputs(input, kbInput);
      this.playerGamepads.set(playerNum, input);
    }
    for (const pNum of this.localPlayerNums) {
      if (!this.playerAssignments.has(pNum)) this.playerGamepads.set(pNum, kbInput);
    }
    if (this.debugMode) this.updateDebugPanel();
  }

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
    let html = '<div class="debug-version">MultiPadControl v2.2.0</div>';
    for (let p = 1; p <= 4; p++) {
      html += `<div class="debug-player"><div class="debug-player-title">P${p}</div>`;
      const inputs = this.playerGamepads.get(p);
      const gpIndex = this.playerAssignments.get(p);
      if (inputs) {
        const isKb = gpIndex === 'keyboard';
        html += `<div class="debug-player-meta">${isKb ? 'Keyboard' : `GP${gpIndex}`}</div>`;
        html += `<div class="debug-info">A:${inputs.A?'ON':'OFF'} B:${inputs.B?'ON':'OFF'} X:${inputs.X?'ON':'OFF'} Y:${inputs.Y?'ON':'OFF'}</div>`;
        html += `<div class="debug-info">LX:${inputs.leftStickX.toFixed(2)} LY:${inputs.leftStickY.toFixed(2)}</div>`;
        html += `<div class="debug-info">RX:${inputs.rightStickX.toFixed(2)} RY:${inputs.rightStickY.toFixed(2)}</div>`;
        html += `<div class="debug-info">ZL:${inputs.ZL.toFixed(2)} ZR:${inputs.ZR.toFixed(2)}</div>`;
      } else html += `<div class="debug-info">未参加</div>`;
      html += `</div>`;
    }
    content.innerHTML = html;
    panel.classList.add('active');
  }

  getPlayerInput(playerNum) {
    if (this.localPlayerNums.includes(playerNum)) {
      const kbInput = this.getKeyboardInput();
      const gpInput = this.playerGamepads.get(playerNum);
      if (gpInput) return this.mergeInputs(gpInput, kbInput);
      return kbInput;
    }
    return this.playerGamepads.get(playerNum) || null;
  }

  isPlayerConnected(playerNum) {
    if (this.localPlayerNums.includes(playerNum)) return true;
    const gpIndex = this.playerAssignments.get(playerNum);
    if (gpIndex === undefined) return false;
    if (gpIndex === 'keyboard') return true;
    return this.connectedGamepads.has(gpIndex);
  }

  reset() {
    this.playerAssignments.clear();
    this.playerGamepads.clear();
    this.gamepadPrevState.clear();
    this.registrationMode = true;
    this.localPlayerNums = [1];
  }

  log(message, type = 'info') {
    const logEl = document.getElementById('detectionLog');
    if (!logEl) { console.log(`[${type.toUpperCase()}] ${message}`); return; }
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logEl.insertBefore(entry, logEl.firstChild);
    while (logEl.children.length > 50) logEl.removeChild(logEl.lastChild);
  }

  updateLoop() {
    this.update();
    requestAnimationFrame(() => this.updateLoop());
  }
}

export { GamepadManager };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamepadManager;
}
