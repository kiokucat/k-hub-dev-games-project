8bit風の音 ― 収録内容
====================
矩形波2ch + 三角波 + ノイズの構成で作りました（32kHz・モノラル）。ゲームのHTMLにも同じ音を内蔵しています。

BGM（audio/bgm）
  op.mp3     オープニング 約40秒  Aマイナー → Cメジャー。砕ける瞬間(5.5秒)・ボス紹介(23秒)・ロゴ(34.6秒)に合わせた構成
  title.mp3  タイトル   BPM84   Aマイナー（ループ）
  field.mp3  道中       BPM150  Dマイナー（ループ）
  boss.mp3   ボス戦     BPM168  Aハーモニックマイナー（ループ）

効果音（audio/se）32種
  shot graze kill hit bomb spell boss item clear over save menu text stop resume knife
  nobomb pause unpause move cancel start load phase spellclear bossdown timeout power point bombget life bosshit
  （config.js の audio.se のキーと同じ名前です。意味は config.js のコメントを見てください）

使い方
  1. ゲームのHTMLと同じフォルダに、config.js と audio フォルダを置く
  2. HTMLを開く
  内蔵の音が不要なときや、別の音に変えたいときは、config.js のパスを書き換えてください。
  BGMは章やステージごとに個別に指定できます（config.js のコメント参照）。

このゲーム用に作った曲と効果音です。ゲームの中でご自由にお使いください。
