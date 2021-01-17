// グローバルに展開
phina.globalize();

const SCREEN_WIDTH=650;
const SCREEN_HEIGHT=400;


// 定数
var CIRCLE_RADIUS = 32;
var GRAVITY = 0.98;
var FLOOR_HEIGHT = 400;

/*
 * サークルクラス
 */
phina.define('Circle', {
  superClass: 'CircleShape',

  init: function(options) {
    options = (options || {}).$safe({
      fill: 'red',  // 塗りつぶし色
      stroke: null, // ストローク色
      radius: CIRCLE_RADIUS, // 半径
    });
    this.superInit(options);

    this.blendMode = 'lighter';
    // 下への移動値
    this.vy = 0;
  },

  update: function() {
    // 下に移動
    this.vy += GRAVITY;
    this.y += this.vy;

    // 地面に着いたら反発する
    if (this.bottom > FLOOR_HEIGHT) {
      this.bottom = FLOOR_HEIGHT;
      this.vy *= -1;
    }
  },
});


/*
 * メインシーン
 */
phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',

  // 初期化
  init: function() {
    // super init
    this.superInit({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });

    // 背景色
    this.backgroundColor = '#222';

    // ラベルを生成
    var label = Label('touch me!').addChildTo(this);
    label.x = this.gridX.center(); // x 軸
    label.y = this.gridY.center(6); // y 軸
    label.fill = '#eee';  // 塗りつぶし色

    // デフォルトでいくつか生成
    (12).times(function() {
      var x = Math.randint(0, this.gridX.width);
      var y = Math.randint(0, this.gridY.width);
      this.addCircle(x, y);
    }, this);
  },

  // タッチイベント
  onpointmove: function(e) {
    var p = e.pointer;
    this.addCircle(p.x, p.y);
    console.log(p.x, p.y);
  },

  // サークルを追加
  addCircle: function(x, y) {
    var color = "hsla({0}, 75%, 50%, 0.75)".format(Math.randint(0, 360));
    // サークルを生成
    var circle = Circle({
      fill: color,
      x: x,
      y: y,
    }).addChildTo(this);
  },
});

  
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    title: '当り判定(円)',
    // fit:false,
    width:SCREEN_WIDTH,
    height:SCREEN_HEIGHT,
    domElement: document.getElementById('phina-canvas'),
    // fps: 60,
    // MainScene から開始
    //startLabel: 'main'
    // assets: ASSETS,
    // アセット読み込み

    backgroundColor: 'skyblue',
  });

  
//   let appended_canvas = app.canvas.domElement.style;
  

  // fps表示
  // app.enableStats();
  // 実行
  app.run();
});