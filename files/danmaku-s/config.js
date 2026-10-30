523// config.js ― 8bit風の音（audio-8bit.zip）を、ファイルから読み込む設定です。
// ゲームのHTMLと同じフォルダに、この config.js と audio フォルダを置いてください。
// ※ HTMLにも同じ音を内蔵しているので、これは「音を差し替えたいとき」の見本です。
window.CONFIG = {
  chara: {
    // reimu / marisa / kaguya / boss01〜boss30 と、末尾 _b（バトル絵）。詳しくは README.md
    reimu: "img/reimu.png",        // 霊夢の立ち絵
    marisa: "img/marisa.png",        // 霊夢の立ち絵
    boss1: "img/boss1.png",  
    boss2: "img/boss2.png",  
    boss3: "img/boss3.png",  
    boss4: "img/boss4.png",
    boss5: "img/boss5.png",    
    boss6: "img/boss6.png",
    boss7: "img/boss7.png",
    boss8: "img/boss8.png",  
    boss9: "img/boss9.png",  
    boss10: "img/boss10.png",  
    boss11: "img/boss11.png",
    boss12: "img/boss12.png",    
    boss13: "img/boss13.png",
    boss14: "img/boss14.png",
    boss15: "img/boss15.png",  
    boss16: "img/boss16.png",  
    boss17: "img/boss17.png",  
    boss18: "img/boss18.png",
    boss19: "img/boss19.png",    
    boss20: "img/boss20.png",
    boss21: "img/boss21.png",
    boss22: "img/boss22.png",  
    boss23: "img/boss23.png",  
    boss24: "img/boss24.png",  
    boss25: "img/boss25.png",
    boss26: "img/boss26.png",    
    boss27: "img/boss27.png",
    boss28: "img/boss28.png",
    boss29: "img/boss29.png",
    boss30: "img/boss30.png",

    boss1_b: "img/boss1.png",  
    boss2_b: "img/boss2.png",  
    boss3_b: "img/boss3.png",  
    boss4_b: "img/boss4.png",
    boss5_b: "img/boss5.png",    
    boss6_b: "img/boss6.png",
    boss7_b: "img/boss7.png",
    boss8_b: "img/boss8.png",  
    boss9_b: "img/boss9.png",  
    boss10_b: "img/boss10.png",  
    boss11_b: "img/boss11.png",
    boss12_b: "img/boss12.png",    
    boss13_b: "img/boss13.png",
    boss14_b: "img/boss14.png",
    boss15_b: "img/boss15.png",  
    boss16_b: "img/boss16.png",  
    boss17_b: "img/boss17.png",  
    boss18_b: "img/boss18.png",
    boss19_b: "img/boss19.png",    
    boss20_b: "img/boss20.png",
    boss21_b: "img/boss21.png",
    boss22_b: "img/boss22.png",  
    boss23_b: "img/boss23.png",  
    boss24_b: "img/boss24.png",  
    boss25_b: "img/boss25.png",
    boss26_b: "img/boss26.png",    
    boss27_b: "img/boss27.png",
    boss28_b: "img/boss28.png",
    boss29_b: "img/boss29.png",
    boss30_b: "img/boss30.png",
  },
  audio: {
    // ───── BGM ─────
    // 個別に指定するときは、次の名前でパスを書きます（空欄なら上の共通BGMを使います）。
    //   第N章の道中 "field01"〜"field30"　　　第N章のボス戦 "boss01"〜"boss30"
    //   オリジナルシナリオ "field_os1"〜"field_os3" / "boss_os1"〜"boss_os3"
    //   カスタムステージ（スロット1〜4） "field_c1"〜"field_c4" / "boss_c1"〜"boss_c4"
    // 例:  "boss05": "audio/bgm/sakuya.mp3",
    bgm: {
      "op": "audio/bgm/op.mp3",   // オープニング（約40秒）
      "title": "audio/bgm/title.mp3",   // タイトル画面
      "field": "audio/bgm/field.mp3",   // 道中（全章・全ステージ共通）
      "boss": "audio/bgm/boss.mp3",   // ボス戦（全章・全ステージ共通）
      "ending": "",   // ボス撃破後の会話（未指定なら道中の曲が続く）
      "clear": "",   // クリア画面（1回だけ再生）
      "over": ""   // ゲームオーバー画面（1回だけ再生）
    },

    // ───── 効果音 ─────
    // 未指定の項目は、内蔵の8bit音を使います。
    // item / clear / menu / save だけを書くと、仲間の効果音（power・point・bombget・life / phase・spellclear・bossdown / pause・unpause・cancel・move / load）も同じ音になります。
    se: {
      "shot": "audio/se/shot.wav",   // ショット（連射中に一定間隔で鳴る）
      "graze": "audio/se/graze.wav",   // かすり（グレイズ）
      "kill": "audio/se/kill.wav",   // 雑魚を倒した
      "hit": "audio/se/hit.wav",   // 被弾
      "bomb": "audio/se/bomb.wav",   // ボム
      "spell": "audio/se/spell.wav",   // スペルカード開始
      "boss": "audio/se/boss.wav",   // ボス登場
      "item": "audio/se/item.wav",   // アイテム取得（まとめ）
      "clear": "audio/se/clear.wav",   // クリア（まとめ）
      "over": "audio/se/over.wav",   // ゲームオーバー
      "save": "audio/se/save.wav",   // セーブ
      "menu": "audio/se/menu.wav",   // メニュー決定（まとめ）
      "text": "audio/se/text.wav",   // 会話の文字送り
      "stop": "audio/se/stop.wav",   // 時が止まる
      "resume": "audio/se/resume.wav",   // 時が動き出す
      "knife": "audio/se/knife.wav",   // ナイフを置く
      "nobomb": "audio/se/nobomb.wav",   // ボム不足（ボムが0のときにボムボタン）
      "pause": "audio/se/pause.wav",   // ポーズを開く
      "unpause": "audio/se/unpause.wav",   // ポーズを閉じる
      "move": "audio/se/move.wav",   // メニューのカーソル移動
      "cancel": "audio/se/cancel.wav",   // もどる／タイトルへ
      "start": "audio/se/start.wav",   // ゲーム・チャプター開始
      "load": "audio/se/load.wav",   // ロード
      "phase": "audio/se/phase.wav",   // 通常攻撃を破った
      "spellclear": "audio/se/spellclear.wav",   // スペルカードを破った
      "bossdown": "audio/se/bossdown.wav",   // ボス撃破
      "timeout": "audio/se/timeout.wav",   // 時間切れ
      "power": "audio/se/power.wav",   // Pアイテム取得
      "point": "audio/se/point.wav",   // 点アイテム取得
      "bombget": "audio/se/bombget.wav",   // ボムアイテム取得
      "life": "audio/se/life.wav",   // 残機アイテム取得
      "bosshit": "audio/se/bosshit.wav"   // ボスに弾が当たる
    }
  }
};
