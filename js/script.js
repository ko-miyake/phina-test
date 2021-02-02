import { C } from './conf.js';

// グローバルに展開
phina.globalize();

const SCREEN_WIDTH = C.SCREEN_WIDTH;
const SCREEN_HEIGHT = C.SCREEN_HEIGHT;
const PLAYER_SIZE = C.PLAYER_SIZE;  // プレイヤーのサイズ
let BulletGroup = null;
let EnemyGroup = null;
let PlayerGroup=null;
let DisplayGroup=null;

// 
let maxBullet=2;

//引継ぎ変数


// アセット
var ASSETS = {
  // 画像
  image: {
    // 背景画像
    'bg1':"./images/background.png",
    // 地面
    'ground': './images/Ground.png',
    // プレイヤー
    'ghost1': './images/pipo-halloweenchara2016_15.png',
    'ghost2': './images/teki2.png',
    'ghost3': './images/teki3.png',

    'player': './images/player.png',
    'bullet':"./images/tama.png",

    // 城画像
    'Castle':'./images/castle.png',

  },
  // フレームアニメーション情報
  spritesheet: {
    'tomapiko_ss': 'https://rawgit.com/phi-jp/phina.js/develop/assets/tmss/tomapiko.tmss',
    'ghost': './animation/ghost.ss',
  },
};

let Scenes = [
  {
    label: 'MainScene',
    className: 'MainScene',
    nextLabel: '',
  },
  {
    label: 'MyPauseScene',
    className: 'MyPauseScene',
    nextLabel: 'MainScene',
  },
  ];


phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function (param) {
    // 親クラス初期化
    this.superInit({
      // 画面サイズ指定
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });


    
    // group作成
    // GameObjとかで纏めたい

    this.bgGroup = DisplayElement().addChildTo(this);
    DisplayGroup=DisplayElement().addChildTo(this);

    BulletGroup = DisplayElement().addChildTo(this);
    EnemyGroup=DisplayElement().addChildTo(this);
    PlayerGroup=DisplayElement().addChildTo(this);
    
    
    // 背景色
    this.backgroundColor = 'black';

   
    var bg = Sprite('bg1').addChildTo(this.bgGroup);
    bg.setPosition(this.gridX.center(), this.gridY.center());
    
    var ground = Sprite('ground').addChildTo(this.bgGroup);
    ground.setPosition(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
    
    var self = this;

    // ポーズボタン
    Button({
      text: 'Esc for Pause',
      fontSize:14,
      width:105,
      height:30,
      color:"gray",
    }).addChildTo(this)
      .setPosition(SCREEN_WIDTH-60, 25)
      .onpush = function() {
        // ポーズシーンをpushする
        self.app.pushScene(MyPauseScene());    
      };

    


    // プレイヤー作成
    this.player = Player().addChildTo(this)
      .setPosition(300, 200).addChildTo(PlayerGroup);
    this.castle=Castle().addChildTo(this).setPosition(64,SCREEN_HEIGHT/2-25).addChildTo(DisplayGroup);

    // 敵系初期化
    this.enemyManager = EnemyManager();
    this.enemyCounter = 0;
    this.enemyMaxCount = 4;
    this.pop=0;

    // 変数の引継ぎ
    console.log(param.hoge);
    if(param.next==1){
      self.enemyMaxCount = param.MaxCount;
    }



    // クリア時用
    this.cLabel=Label({
      text: 'STAGE CLEAR',
      fontSize: 64,
      fill:"red",
      fontWeight:"bold",
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center()-40);
    
    this.cBtn=Button({
      text: 'NEXT STAGE',
      fontSize:34,
      width:250,
      height:60,
      color:"black",
      fill:"gray",
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center()+50).onpush = function() {
      self.exit("MainScene",{
        hoge:"hoge",
        next:1,
        MaxCount:self.enemyMaxCount+2
      }); 
    };
    this.cLabel.alpha = 0;
    console.log(this.cBtn.alpha);

    
    // ゲームオーバー用
    this.gLabel=Label({
      text: 'GAME OVER',
      fontSize: 64,
      fill:"blue",
      fontWeight:"bold",
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center()-40);

    // this.gBtn=Button({
    //   text: 'TITLE',
    //   fontSize:34,
    //   width:250,
    //   height:60,
    //   color:"black",
    //   fill:"gray",
    // }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center()+50).onpush = function() {
    //     self.app.pushScene(MyPauseScene());    
    // };
    this.gLabel.alpha = 0;
    // this.gBtn.alpha = 0;



    
  },
  update: function (app) {

    let self=this;
    let key = app.keyboard;

    // 一時停止
    if(key.getKeyDown(27)){
      self.app.pushScene(MyPauseScene());    
    }
    if(key.getKey("c")){
      self.exit("MyPauseScene"); 
    }
    if(key.getKey("e")){
      this.enemyManager.CheckEnemy();
    }
    
    // 湧き処理
    if (this.pop == 0 && this.enemyCounter < this.enemyMaxCount) {
      let minPos = 30;
      let maxPos = SCREEN_HEIGHT;
      let ramdomPos = Math.floor(Math.random() *
        (maxPos + 1 - minPos)) + minPos;
      setTimeout(function(){
        self.enemyManager.CreateEnemy(SCREEN_WIDTH,ramdomPos);
        self.pop=0;
      }, 3000);
      self.enemyCounter += 1;
      self.pop=1;
    }
    
    // ステージクリア
    if(this.enemyCounter>=this.enemyMaxCount && EnemyGroup.children.length==0){
      this.cLabel.tweener.fadeIn(2000).play();
    }

    // 画面外処理
    BulletGroup.children.each(function(bullet) {
      if(bullet.x>=SCREEN_WIDTH){
        bullet.remove();
        console.log("bullet remove");
      }
    });
    
    // あたり判定
    this.allCollision();

    
    //スマフォ処理 
    // if(phina.isMobile()){

    // }
  },



  allCollision:function(){
    // プレイヤーとエネミーのあたり判定
    EnemyGroup.children.each(function(enemy) {
      PlayerGroup.children.each(function(player) {
        // 当たり判定用の矩形
        var r1 = enemy.collider.getAbsoluteRect();
        var r2 = player.collider.getAbsoluteRect();
        // ヒットなら
        if (Collision.testRectRect(r1, r2)) {

        }
      });
    });

    EnemyGroup.children.each(function(enemy) {
      BulletGroup.children.each(function(bullet) {
        // 当たり判定用の矩形
        var r1 = enemy.collider.getAbsoluteRect();
        var r2 = bullet.collider.getAbsoluteRect();
        // ヒットなら
        if (Collision.testRectRect(r1, r2)) {
          bullet.remove();
          enemy.remove();
        }
      });
    });

    EnemyGroup.children.each(function(enemy) {
      DisplayGroup.children.each(function(castle) {
        // 当たり判定用の矩形
        var r1 = enemy.collider.getAbsoluteRect();
        var r2 = castle.collider.getAbsoluteRect();
        // ヒットなら
        if (Collision.testRectRect(r1, r2)) {
          enemy.delete();
          castle.damage(10);
        }
      });
    });
  }

});

// 

//プレイヤークラス
phina.define("Player", {
  // 継承
  superClass: 'Sprite',
  // コンストラクタ
  init: function () {
    // 親クラス初期化
    this.superInit('player', PLAYER_SIZE, PLAYER_SIZE);
    // スプライトにフレームアニメーションをアタッチ
    // FrameAnimation('ghost').attachTo(this).gotoAndPlay('explosion');
    this.speed = C.PLAYER_SPEED;
    this.canShoot=true;
    this.cooldown=3000;
    

    // あたり判定
    this.collider = Collider({
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
    }).addChildTo(this);
  },

  shoot: function () {
    var self=this;
    if(this.canShoot){
      let bullet=Bullet().addChildTo(BulletGroup).setPosition(this.x, this.y);
      self.canShoot=false;
      setTimeout(function(){self.canShoot=true;}, 1000);
    }
    

  },
  // update:function(app){
  //   let key=app.keyboard;
  //   let self=this;

  //   // キー操作
  //   // そのうち綺麗にコード書く
  //   if (key.getKey('left')) {
  //     this.x-=this.speed;
  //   }

  //   if (key.getKey('right')) {
  //     this.x+=this.speed;
  //   }

  //   if (key.getKey('up')) {
  //     this.y-=this.speed;
  //   }

  //   if (key.getKey('down')) {
  //     this.y+=this.speed;
  //   }
  //   if (key.getKey('enter')) {
  //     this.shoot();
  //   }


  // }
  update: function (app) {
    // 移動する向きを求める
    var direction = app.keyboard.getKeyDirection();

    // 移動する向きとスピードを代入する
    this.moveBy(direction.x * this.speed, direction.y * this.speed);

    // 射撃
    var key = app.keyboard;
    if (key.getKeyDown('enter')||key.getKeyDown('q')) {
      this.shoot();
    }
    // 
  },

});

//城クラス
phina.define("Castle", {
  // 継承
  superClass: 'Sprite',
  // コンストラクタ
  init: function () {

    // 親クラス初期化
    // this.superInit();
    this.maxHP=100;
    this.value=100;
    this.superInit('Castle', 164, SCREEN_HEIGHT);

    this.collider = Collider({
      width: 164,
      height: SCREEN_HEIGHT,
    }).addChildTo(this);

    let self=this;
    this.gauge= Gauge({
      x: -5, y: -120,        // x,y座標
      width: 100,            // 横サイズ
      height: 20,            // 縦サイズ
      cornerRadius: 10,      // 角丸み
      maxValue: self.maxHP,         // ゲージ最大値
      value: self.value,         // ゲージ初期値
      fill: 'white',         // 後ろの色
      gaugeColor: 'red', // ゲージ色
      stroke: 'silver',      // 枠色
      strokeWidth: 5,        // 枠太さ
    }).addChildTo(this);
  },
  update:function(){

  },

  damage:function(damege){
    let hp=this.value-=damege;
    this.gauge.value=hp;
    this.value=hp;

    if(this.value<=0){
      // ゲームエンド
    }
  }
});

// 弾
phina.define("Bullet", {
  // 継
  superClass: 'DisplayElement',
  // 初期化
  init: function () {
    // 親クラス初期化
    this.superInit();
    // スピード
    var speed = 10;
    var self = this;

    Sprite('bullet', 10, 10).addChildTo(self).setPosition(self.x, self.y);

    this.physical.velocity.x = +speed;


    this.collider = Collider({
      width: 10,
      height: 10,
    }).addChildTo(this);
  },
});


//// エネミー関連
// 弾
phina.define("Enemy", {
  // 継
  superClass: 'DisplayElement',
  // 初期化
  init: function () {
    // 親クラス初期化
    this.superInit();
    

    // スピード
    var speed = 5;
    var self = this;
    this.time=0;    
    this.collider = Collider({
      width: 32,
      height: 32,
    }).addChildTo(this);

    var min = 0;
    var max = 2;
    let myNum = Math.floor(Math.random() *
      (max + 1 - min)) + min;

    let type = [1, 2, 3];
    // console.log(type[myNum]);
    let str="ghost"+String(type[myNum]);
    console.log(str);

    let sp=Sprite(str, 32, 32).addChildTo(self).setPosition(self.x, self.y);
    FrameAnimation('ghost').attachTo(sp).gotoAndPlay('walk');
    this.myType=type[myNum];



  },

  update: function () {
    // this.physical.velocity.y = +this.speed;
    
    this.y = this.popY+(3.14*2/120*this.time).sin()*50;
    this.x-=1;
    // console.log(this.y);
    this.time += 1;
    
  },

  delete:function(){
    this.remove();
  }

});
// 弾
phina.define("EnemyManager", {
  // 継
  superClass: 'DisplayElement',
  // 初期化
  init: function () {
    // 親クラス初期化
    this.superInit();
    this.max = 20;
    this.num = 0;
    this.hp=10;
  },
  CreateEnemy: function (x, y) {
    let enemy=Enemy().addChildTo(EnemyGroup).setPosition(x, y);
    enemy.popY=y;
    console.log(EnemyGroup);
  },
  update: function () {
    console.log("hige");
  },
  CheckEnemy: function(){
    console.log(EnemyGroup.children.length);
  }
});
/*
 * 地面クラス
 */
phina.define("Ground", {
  // 継承
  superClass: 'Sprite',
  // コンストラクタ
  init: function () {
    // 親クラス初期化
    this.superInit('ground');
    // 原点を左上に
    this.origin.set(0, 0);
  },
});


// あたり判定
phina.define("Collider", {
  // 継承
  superClass: 'RectangleShape',
  // 初期化
  init: function(param) {
    // 親クラス初期化
    this.superInit({
      width: param.width,
      height: param.height,
      fill: null,
      stroke: 'red',
    });
    // 非表示
    this.hide();
  },
  // コライダーの絶対座標の矩形
  getAbsoluteRect: function() {
    var x = this.left + this.parent.x;
    var y = this.top + this.parent.y;
    return Rect(x, y, this.width, this.height);
  },
});

/*
 * ポーズシーン
 */
phina.define("MyPauseScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景を半透明化
    this.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    var self = this;
    // ポーズ解除ボタン    
    Button({
      text: 'Resume',
      fontSize:20,
      width:20,
    }).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center(-3))
      .onpush = function() {
        // 自身を取り除く
        self.exit();    
      };
  },
  update: function (app) {
    let self=this;
    let key = app.keyboard;
    // 一時停止
    if(key.getKeyDown(27)){
      self.exit("MainScene"); 
    }
  },
});

/*
 * ショップシーン
 */
phina.define("ShopScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景を半透明化
    this.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    var self = this;
    // ポーズ解除ボタン    
    Button({
      text: 'Resume',
      fontSize:20,
      width:20,
    }).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center(-3))
      .onpush = function() {
        // 自身を取り除く
        self.exit();    
      };
  },
  update: function (app) {
    let self=this;
    let key = app.keyboard;
    // 一時停止
    if(key.getKeyDown(27)){
      self.exit("MainScene"); 
    }
  },
});

phina.main(function () {
  // アプリケーションを生成
  var app = GameApp({
    startLabel: 'MainScene',
    // fit:false,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    domElement: document.getElementById('phina-canvas'),
    // fps: 60,
    // MainScene から開始
    //startLabel: 'main'
    
    // アセット読み込み

    // // backgroundColor: 'skyblue',

    // scenes: [
    //   {
    //     className: 'main',
    //     label: 'main',
    //     nextLabel: 'MyPauseScene',
    //   },

    //   {
    //     className: 'MyPauseScene',
    //     label: 'MyPauseScene',
    //     nextLabel: 'main',
    //   },
    // ],
    scenes: Scenes,

    assets: ASSETS,
    
  });


  //   let appended_canvas = app.canvas.domElement.style;


  // fps表示
  // app.enableStats();
  // 実行
  app.run();

});