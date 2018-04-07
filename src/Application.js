import ui.TextView as TextView;

import device;
import ui.StackView as StackView;

import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;
//import src.Board as Board;

exports = Class(GC.Application, function () {

  //Init global variables
  //this.initGlobalVars();

  this.initUI = function () {
    //this.WIDTH = 576;
    //this.HEIGHT = device.height * (this.WIDTH / device.width);

    // Board.FOUNDHEIGHT = device.height * (Board.BASEWIDTH / device.width);

    //   this.tvHelloWorld = new TextView({
    //     superview: this.view,
    //     text: 'Hello, world!',
    //     color: 'white',
    //     x: 0,
    //     y: 100,
    //     width: this.view.style.width,
    //     height: 100
    //   });
    //Init global variables
    this.initGlobalVars();

    var titleScreen = new TitleScreen(),
      gameScreen = new GameScreen();

    var rootView = new StackView({
      superview: this,
      x: 0,
      y: 0,
      // width: this.WIDTH,
      // height: this.HEIGHT,
      width: GLOBAL.BASEWIDTH,
      height: GLOBAL.FOUNDHEIGHT,
      clip: true,
      scale: device.width / GLOBAL.BASEWIDTH
    });

    rootView.push(titleScreen);

    titleScreen.on('TitleScreen:Start', function () {
      gameScreen.emit('GameScreen:Start');
      rootView.push(gameScreen);
    });

  };

  this.initGlobalVars = function () {

    //Init application variables
    if (GLOBAL.BASEWIDTH == null)
      GLOBAL.BASEWIDTH = 576;

    if (GLOBAL.BASEHEIGHT == null)
      GLOBAL.BASEHEIGHT = 1024;

    if (GLOBAL.FOUNDHEIGHT == null)
      GLOBAL.FOUNDHEIGHT = device.height * (GLOBAL.BASEWIDTH / device.width);

    //Init GameState
    if (GLOBAL.STATE_NONE == null)
      GLOBAL.STATE_NONE = -2;
    if (GLOBAL.STATE_INVALID == null)
      GLOBAL.STATE_INVALID = -1;
    if (GLOBAL.STATE_CHECKVALID == null)
      GLOBAL.STATE_CHECKVALID = 0;
    if (GLOBAL.STATE_REMOVE_MARK == null)
      GLOBAL.STATE_REMOVE_MARK = 1;
    if (GLOBAL.STATE_GEM_FALL == null)
      GLOBAL.STATE_GEM_FALL = 2;
    if (GLOBAL.STATE_GEM_RECHECK == null)
      GLOBAL.STATE_GEM_RECHECK = 3;
    if (GLOBAL.STATE_GEM_RECHECK == null)
      GLOBAL.STATE_GEM_REGENERATE = 4;

    //Init gameplay variables
    if (GLOBAL.GROUP_ANIM_SWAP == null)
      GLOBAL.GROUP_ANIM_SWAP = 'GemSwap';
    if (GLOBAL.OFFSETSIDE == null)
      GLOBAL.OFFSETSIDE = 16;

    if (GLOBAL.OFFSETTOP == null)
      GLOBAL.OFFSETTOP = 315;

    if (GLOBAL.OFFSETBOTTOM == null)
      GLOBAL.OFFSETBOTTOM = 175;

    if (GLOBAL.OFFSETDELTA == null)
      GLOBAL.OFFSETDELTA = 3;

    if (GLOBAL.GEMNONE == null)
      GLOBAL.GEMNONE = -1;

    if (GLOBAL.GEMVIOLET == null)
      GLOBAL.GEMVIOLET = 0;

    if (GLOBAL.GEMORANGE == null)
      GLOBAL.GEMORANGE = 1;

    if (GLOBAL.GEMBLUE == null)
      GLOBAL.GEMBLUE = 2;

    if (GLOBAL.GEMRED == null)
      GLOBAL.GEMRED = 3;

    if (GLOBAL.GEMGREEN == null)
      GLOBAL.GEMGREEN = 4;

    if (GLOBAL.GEMHEIGHT == null)
      GLOBAL.GEMHEIGHT = 132;

    if (GLOBAL.GEMWIDTH == null)
      GLOBAL.GEMWIDTH = 132;

  };

  this.launchUI = function () {

  };

});
