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
    'shopbg':"./images/shop.png",
    'tittlebg':"./images/tittle.png",
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
    {
      label: 'ClearScene',
      className: 'ClearScene',
      nextLabel: 'MainScene',
    },
    {
      label: 'GameOverScene',
      className: 'GameOverScene',
      nextLabel: 'MainScene',
    },
    {
      label: 'TittleScene',
      className: 'TittleScene',
      nextLabel: '',
    },
    {
      label: 'ShopScene',
      className: 'ShopScene',
      nextLabel: '',
    },
    
  ];

  phina.define("TittleScene", {
    
    superClass: 'DisplayScene',
    
    init: function() {
    
      this.superInit({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      
      this.bgGroup = DisplayElement().addChildTo(this);
      var bg = Sprite('tittlebg').addChildTo(this.bgGroup);
      bg.setPosition(this.gridX.center(), this.gridY.center());

      let self=this;
    Button({
      text: 'GAME START',
      fontSize:34,
      width:250,
      height:60,
      color:"black",
      fill:"gray",
    }).addChildTo(this)
      .setPosition(SCREEN_WIDTH-200, SCREEN_HEIGHT/2+SCREEN_HEIGHT/8)
      .onpush = function() {
        // ポーズシーンをpushする
        self.exit("MainScene",{
          next:0
        });    
      };
      
    }
   
  });

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
    this.spriteGroup=DisplayElement().addChildTo(this);
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

    

    // プレイヤー作成
    this.player = Player().addChildTo(this)
      .setPosition(300, 200).addChildTo(PlayerGroup);
    this.castle=Castle().addChildTo(this).setPosition(64,SCREEN_HEIGHT/2-25).addChildTo(DisplayGroup);

    this.stage=1;
    // 敵系初期化
    this.enemyManager = EnemyManager();
    this.enemyCounter = 0;
    this.enemyMaxCount = 4;
    this.pop=0;
    this.popTime=3000;
    
    console.log(param);
    // 変数の引継ぎ
    if(param.next==1){
      self.enemyMaxCount = param.enemyMaxCount;
      self.castle.gauge.value=param.castleHP;
      self.stage=param.stage;
      self.player.hp=param.playHP;
      self.popTime=500>=3000-(self.stage*150)?500:3000-(self.stage*150);
    }



    // ステージ数表示
    let stageLabel=Label({
      text: 'STAGE'+self.stage,
      fontSize: 64,
      fill:"green",
      fontWeight:"bold",
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    stageLabel.tweener.fadeOut(2000).play();

    this.drawUi();
  },
  update: function (app) {

    let self=this;
    let key = app.keyboard;

    // 一時停止
    if(key.getKeyDown(27)){
      self.app.pushScene(MyPauseScene());    
    }

    if(key.getKey("e")){
      this.enemyManager.CheckEnemy();
    }
    
    // 湧き処理
    if (this.pop == 0 && this.enemyCounter < this.enemyMaxCount) {
      let minPos = 90;
      let maxPos = SCREEN_HEIGHT-100;
      let ramdomPos = Math.floor(Math.random() *
        (maxPos + 1 - minPos)) + minPos;
      
        // console.log(ramdomPos);
      setTimeout(function(){
        self.enemyManager.CreateEnemy(SCREEN_WIDTH,ramdomPos,self.stage);
        self.enemyCounter += 1;
        self.pop=0;
        console.log(ramdomPos);
     
      }, self.popTime);
     
      self.pop=1;
    }

    if(this.castle.value>0 && this.player.isAlive==1){
      // ステージクリア
      if(self.enemyCounter>=self.enemyMaxCount && EnemyGroup.children.length==0){

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
          //変数引継ぎ 
          self.exit("MainScene",{
            next:1,
            enemyMaxCount:self.enemyMaxCount+2,
            castleHP:self.castle.value,
            stage:self.stage+1,
            playHP:self.player.hp,
          }); 

        };    
      }
    }else{
        // ゲームオーバー用
        this.GameOver();
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


// 初期画像表示用
  drawUi:function(){
    let self=this;
    // ポーズボタン
    Button({
      text: 'Esc for Pause',
      fontSize:14,
      width:105,
      height:30,
      color:"gray",
    }).addChildTo(this).setPosition(SCREEN_WIDTH-60, 25).onpush = function() {
        self.app.pushScene(MyPauseScene());    
    };

    //playerHP
    (this.player.hp) .times(function(i){
      // var bg = Sprite('bg1').addChildTo(this.bgGroup);
      // bg.setPosition(this.gridX.center(), this.gridY.center());
      let playerIcon = Sprite('player', PLAYER_SIZE-10, PLAYER_SIZE-10).addChildTo(self.spriteGroup).setPosition(30+(i*40), 30);
      // playerIcon.
      
    });
  },

// あたり判定
  allCollision:function(){
    let self=this;
    // プレイヤーとエネミーのあたり判定
    EnemyGroup.children.each(function(enemy) {
      PlayerGroup.children.each(function(player) {
        // 当たり判定用の矩形
        var r1 = enemy.collider.getAbsoluteRect();
        var r2 = player.collider.getAbsoluteRect();
        // ヒットなら
        if (Collision.testRectRect(r1, r2)) {
          // let isDamage=;
          if(player.isDamage==1 || player.isAlive==0)return;
          player.damage(1);
          enemy.remove();
          self.spriteGroup.children.last.remove();
          if(player.hp<=0){
            self.GameOver();
          }
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
          enemy.damege();
          castle.damage(10);
        }
      });
    });
  },

  GameOver:function(){
    let self=this;
    this.gLabel=Label({
      text: 'STAGE'+self.stage+'\n'+'GAME OVER',
      fontSize: 64,
      fill:"blue",
      fontWeight:"bold",
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center()-60);

    this.gBtn=Button({
      text: 'TITLE',
      fontSize:34,
      width:250,
      height:60,
      color:"black",
      fill:"gray",
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center()+50).onpush = function() {
        self.exit("TittleScene");
    };
  },

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
    this.hp=3;
    this.isDamage=0;
    this.isAlive=1;

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
      setTimeout(function(){self.canShoot=true;}, 500);
    }
    

  },

  update: function (app) {
    // 移動する向きを求める
    var direction = app.keyboard.getKeyDirection();

    if(this.isDamage==0){
      // 移動する向きとスピードを代入する
      this.moveBy(direction.x * this.speed, direction.y * this.speed);
    }

    // 射撃
    var key = app.keyboard;
    if (key.getKeyDown('enter')||key.getKeyDown('q')) {
      this.shoot();
    }

    if (key.getKeyDown('w')) {
      console.log(self.isDamage);
    }
    //画面外処理
    if(this.x<=0){
      this.x=0;
    }else if(this.x>=SCREEN_WIDTH){
      this.x=SCREEN_WIDTH;
    }
    if(this.y<=0){
      this.y=0;
    }else if(this.y>=SCREEN_HEIGHT){
      this.y=SCREEN_HEIGHT;
    }
  },

  damage:function(param){
    let self=this;
    let blinkTween = Tweener().clear().fadeOut(100).fadeIn(100).setLoop(true);
    blinkTween.attachTo(this);
    this.isDamage=1;
    let timerTween = Tweener().clear()
    .wait(1000)
    .call(function() {
      self.alpha = 1.0;
      blinkTween.stop();
      self.isDamage=0;
    }, this);
    timerTween.attachTo(this);                     
    
    this.hp-=param;
    if(this.hp<=0){
      this.isAlive=0;
    }

  }

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
      x: 0, y: -90,        // x,y座標
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
    var speed = 5;
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
    this.hp=2;
    this.speed = 1.5;
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
    // console.log(str);

    let sp=Sprite(str, 32, 32).addChildTo(self).setPosition(self.x, self.y);
    FrameAnimation('ghost').attachTo(sp).gotoAndPlay('walk');
    this.myType=type[myNum];
    
    if(this.myType==2){
      if(this.y>=SCREEN_HEIGHT-50){
        this.y=SCREEN_HEIGHT-70;
      }

      // if(this.y>=50){
      //   this.y=60;
      // }
    }



  },

  update: function () {
    // this.physical.velocity.y = +this.speed;
    let self=this;
    
    if(this.myType==1){
      self.x-=self.speed;
    }
    else if(this.myType==2){
      self.y = this.popY+(3.14*2/120*this.time).sin()*50;
      self.x-=this.speed/2;
      self.time += 1;
    }else{
      PlayerGroup.children.each(function(player) {

        let direction =Vector2(player.x-self.x,player.y-self.y).normalize();
        // console.log(direction);
        self.x += direction.x * self.speed*1.5;
        self.y += direction.y * self.speed*1.5;
      });
      
    }
    
  },
  damege:function(){
    let self=this;
    this.hp-=1;
    if(this.hp>=0){
      self.remove();
    }
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
  CreateEnemy: function (x, y,stage) {
    let enemy=Enemy().addChildTo(EnemyGroup).setPosition(x, y);
    enemy.popY=y;
    let speed=enemy.speed+(0.25*stage)>=5?5:enemy.speed+(0.25*stage);
    enemy.speed=speed;
    // console.log(EnemyGroup);
    // ステージごとスピード早める
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

phina.define("Boss", {
  // 継
  superClass: 'DisplayElement',
  // 初期化
  init: function () {
    // 親クラス初期化
    this.superInit();
    
    this.hp=2;
    this.speed = 1.5;
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
    // console.log(str);

    let sp=Sprite(str, 32, 32).addChildTo(self).setPosition(self.x, self.y);
    FrameAnimation('ghost').attachTo(sp).gotoAndPlay('walk');
    this.myType=type[myNum];
    
    if(this.myType==2){
      if(this.y>=SCREEN_HEIGHT-50){
        this.y=SCREEN_HEIGHT-70;
      }

      // if(this.y>=50){
      //   this.y=60;
      // }
    }



  },

  update: function () {

    
  },
  damege:function(){
    let self=this;
    this.hp-=1;
    if(this.hp>=0){
      self.remove();
    }
  },
  delete:function(){
    this.remove();
  }

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
    this.superInit({
       // 画面サイズ指定
       width: SCREEN_WIDTH,
       height: SCREEN_HEIGHT,
    });
    // 背景を半透明化
    this.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    var self = this;
    // ポーズ解除ボタン    
    Button({
      text: 'Resume',
      fontSize:20,
      width:200,
      fill:"gray"
    }).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.center()+100)
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
    this.superInit({
      // 画面サイズ指定
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    this.bgGroup = DisplayElement().addChildTo(this);
    var bg = Sprite('shopbg').addChildTo(this.bgGroup);
    bg.setPosition(this.gridX.center(), this.gridY.center());


    // ボタン

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
 * CLEAR
 */
phina.define("GameOverScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit({
      // 画面サイズ指定
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    // 背景を半透明化
    this.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    var self = this;


  },
  update: function () {

  },
});

phina.main(function () {
  // アプリケーションを生成
  var app = GameApp({
    startLabel: 'TittleScene',
    // fit:false,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    domElement: document.getElementById('phina-canvas'),
    fps: 60,
    // MainScene から開始
    //startLabel: 'main'
    

    scenes: Scenes,

    assets: ASSETS,
    
  });


  //   let appended_canvas = app.canvas.domElement.style;


  // fps表示
  // app.enableStats();
  // 実行
  app.run();

});