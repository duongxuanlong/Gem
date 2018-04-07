import ui.View;
import ui.TextView;
import ui.ImageView;
import ui.ParticleEngine as ParticleEngine;


var ScoreIcon = "resources/images/ui/header.png";
var ReplayIcon = "resources/images/ui/ReplayIcon.png";

//Particles
var Gleam_Blue      = "resources/images/particles/gleam_blue.png",
Gleam_Green     = "resources/images/particles/gleam_green.png",
Gleam_Purple    = "resources/images/particles/gleam_purple.png",
Gleam_Red       = "resources/images/particles/gleam_red.png",
Gleam_White     = "resources/images/particles/gleam_white.png",
Gleam_Yellow    = "resources/images/particles/gleam_yellow.png",
Round_Blue      = "resources/images/particles/round_blue.png",
Round_Green     = "resources/images/particles/round_green.png",
Round_Purple    = "resources/images/particles/round_purple.png",
Round_Red       = "resources/images/particles/round_red.png",
Round_White     = "resources/images/particles/round_white.png",
Round_Yellow    = "resources/images/particles/round_yellow.png";

exports = Class(ui.View, function (supr) {
    this.init = function (opts) {
        opts = merge(opts, {
            x: 0,
            y: 0,
            width: GLOBAL.BASEWIDTH,
            height: GLOBAL.OFFSETTOP
        });

        supr(this, 'init', [opts]);

        this.build();
    };

    this.build = function () {
        this.timeLimitation = 300000;
        this.timePeriod = 1000;
        this.timeCurrent = 0;

        this.pointCurrent = 0;
        this.pointTarget = 1000;
        this.pointGem = 30;

        this.delta = 15;
        this.txtHeight = 50;
        this.txtWidth = 320;
        this.txtSize = 35;
        this.txtNormalColor = '#000099';
        this.txtScoreColor = '#FFFFFF';
        this.txtUrgentColor = '#ff0000';
        this.txtPlusColor = '#66ff33';
        this.txtTargetColor = '#ff3300';

        this.ivScore = new ui.ImageView({
            superview: this,
            x: (GLOBAL.BASEWIDTH - 249) / 2,
            y: 0,
            image: ScoreIcon,
            canHandleEvents: false,
            width: 249,
            height: 166
        });

        this.txtTime = new ui.TextView({
            superview: this,
            x: (GLOBAL.BASEWIDTH - this.txtWidth) / 2,
            y: this.delta + (this.txtHeight * 4),
            width: this.txtWidth,
            height: this.txtHeight,
            size: this.txtSize,
            verticalAlign: 'middle',
            horizontalAlign: 'center',
            autoSize: false,
            wrap: false,
            canHandleEvents: false,
            color: this.txtNormalColor,
            text: 'Timer'
        });

        this.txtScore = new ui.TextView({
            superview: this,
            x: (GLOBAL.BASEWIDTH - this.txtWidth) / 2,
            y: (this.txtHeight + this.delta * 2),
            width: this.txtWidth,
            height: this.txtHeight,
            size: this.txtSize,
            verticalAlign: 'middle',
            horizontalAlign: 'center',
            autoSize: false,
            wrap: false,
            canHandleEvents: false,
            color: this.txtScoreColor,
            text: 'Score'
        });

        this.txtTarget = new ui.TextView({
            superview: this,
            x: GLOBAL.BASEWIDTH - this.txtWidth - this.delta,
            y: this.delta,
            width: this.txtWidth,
            height: this.txtHeight,
            size: this.txtSize,
            verticalAlign: 'middle',
            horizontalAlign: 'right',
            autoSize: false,
            wrap: false,
            canHandleEvents: false,
            color: this.txtTargetColor,
            text: this.pointTarget
        });

        this.txtPlus = new ui.TextView({
            superview: this,
            x: (GLOBAL.BASEWIDTH / 2),
            y: (this.txtHeight + this.delta * 2),
            width: this.txtWidth,
            height: this.txtHeight,
            size: this.txtSize,
            verticalAlign: 'middle',
            horizontalAlign: 'center',
            autoSize: false,
            wrap: false,
            canHandleEvents: false,
            color: this.txtPlusColor,
            text: 'Score',
            opacity: 0
        });

        this.initTextValues();

        this.btnReplay = new ui.ImageView({
            superview: this,
            canHandleEvents: false,
            x: (GLOBAL.BASEWIDTH - 242) / 2,
            y: 0 - 242,
            width: 242,
            height: 242,
            image: ReplayIcon
        });

        this.btnReplay.on('InputSelect', bind(this, function () {
            this.btnReplay.setHandleEvents(false);
            this.emit('GUI:OnReplay');
        }));

        this.on('GUI:ScoreGem', bind(this, function (number) {
            this.pointCurrent += (number * this.pointGem);
            this.txtScore.setText(this.pointCurrent);

            var remaining = this.pointTarget - this.pointCurrent;
            if (remaining <= 0) {
                remaining = 0;
                clearTimeout(this.timeOut);
                clearInterval(this.timeInterval);
                this.txtTarget.setText(remaining);
                this.emit('GUI:EndGame');
                this.emitParticles();
                //this.onEnableReplayButton(true);
                //this.endGame();
            } else {
                this.txtTarget.setText(remaining);
            }
        }));

        //Particle engine
        this.particleCount = 100;
        this.particleLiftSpan = 3000;
        this.particleEngine = new ParticleEngine({
            superview: this,
            width: 1,
            height: 1,
            initCount: this.particleCount
        });
    };

    this.emitParticles = function(){
        var particleObjects = this.particleEngine.obtainParticleArray(this.particleCount);
        var offsetX = GLOBAL.BASEWIDTH;
        var offsetY = GLOBAL.BASEHEIGHT - (GLOBAL.OFFSETTOP + GLOBAL.OFFSETBOTTOM);
        var originalX = GLOBAL.BASEWIDTH;
        var originalY = GLOBAL.BASEHEIGHT - (GLOBAL.OFFSETBOTTOM / 2);
        for (var i = 0; i < this.particleCount; i++){
            var obj = particleObjects[i];
            obj.x = Math.random() * originalX;
            obj.y = Math.random() * originalY;
            obj.width = 57;
            obj.height = 57;
            obj.dx = offsetX * Math.random();
            obj.dy = offsetY * Math.random();
            obj.ddx = offsetX * Math.random();
            obj.ddy = offsetY * Math.random();
            obj.ttl = this.particleLiftSpan;
            var imageID = Math.floor(Math.random() * 12 - 1);
            if (imageID < 0)
                imageID = 0;
            obj.image = this.getParticleImage(imageID);
            // var pObj = particleObjects[i];
            // pObj.dx = 100 + Math.random() * 20;
            // pObj.dy = -100 + Math.random() * 20;
            // pObj.ddy = 200; // gravity is same for all particles
            // pObj.width = 57;
            // pObj.height = 57;
            // var imageID = Math.floor(Math.random() * 12 - 1);

            // if (imageID < 0)
            //     imageID = 0;
            // pObj.image = this.getParticleImage(imageID);
        }
        this.particleEngine.emitParticles(particleObjects);
        var timeOut = setTimeout(bind(this, function(){
            clearTimeout(timeOut);
            this.particleEngine.killAllParticles();
            this.onEnableReplayButton(true);
        }), this.particleLiftSpan);
    };

    this.resetState = function(){
        this.pointCurrent = 0;
        this.pointTarget = 1000;

        this.initTextValues();
    };

    this.initTextValues = function(){
        this.txtScore.setText(this.pointCurrent);
        this.txtTarget.setText(this.pointTarget);
    };

    this.setUpTime = function () {
        this.timeLimitation = 120000;//10000; // 3 minutes
        this.timeCurrent = this.timeLimitation;

        setTime.call(this);
    };

    this.updateTime = function () {
        this.timeCurrent -= this.timePeriod;
        if (this.timeCurrent < 0)
            this.timeCurrent = 0;
        var minutes = Math.floor(this.timeCurrent / 60000);
        var seconds = this.timeCurrent / 1000 - minutes * 60;
        this.txtTime.setText(minutes + " : " + seconds);
    };

    this.onEnableReplayButton = function (enable) {
        this.btnReplay.setHandleEvents(enable);
        this.btnReplay.style.visible = enable;

        if (enable)
        {
            this.btnReplay.style.y = (GLOBAL.OFFSETTOP - 242) / 2;
        }
        else
        {
            this.btnReplay.style.y = 0 - 242;
        }
    };

    this.endGame = function () {
        this.emit('GUI:EndGame');
        this.onEnableReplayButton(true);
    };

    this.getParticleImage = function(imageID){
        switch (imageID){
            case 0: 
            return Gleam_Blue;
            case 1:
            return Gleam_Purple;
            case 2:
            return Gleam_Green;
            case 3:
            return Gleam_Yellow;
            case 4:
            return Gleam_White;
            case 5:
            return Gleam_Red;
            case 6:
            return Round_Blue;
            case 7: 
            return Round_Red;
            case 8:
            return Round_Purple;
            case 9:
            return Round_White;
            case 10:
            return Round_Yellow;
            case 11:
            return Round_Green;

        }
    };
});

function setTime() {
    this.timeInterval = setInterval(this.updateTime.bind(this), this.timePeriod);
    this.timeOut = setTimeout(bind(this, function () {
        clearInterval(this.timeInterval);
        //this.endGame();
        this.emit('GUI:EndGame');
        this.onEnableReplayButton(true);
    }), this.timeLimitation + (this.timePeriod * 2));
}
