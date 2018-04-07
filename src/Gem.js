import ui.View;
import ui.ImageView;
import animate;


// var ImageViolet = new Image({url: "resources/images/gems/gem_01.png"}),
// 	ImageOrange = new Image({url: "resources/images/gems/gem_02.png"}),
// 	ImageBlue = new Image({url: "resources/images/gems/gem_03.png"}),
// 	ImageRed = new Image({url: "resources/images/gems/gem_04.png"}),
// 	ImageGreen = new Image({url: "resources/images/gems/gem_05.png"}),
var ImageViolet = "resources/images/gems/gem_01.png",
	ImageOrange = "resources/images/gems/gem_02.png",
	ImageBlue = "resources/images/gems/gem_03.png",
	ImageRed = "resources/images/gems/gem_04.png",
	ImageGreen = "resources/images/gems/gem_05.png";
	// GemNone = -1,
	// GemViolet = 0,
	// GemOrange = 1,
	// GemBlue = 2,
	// GemRed = 3,
	// GemGreen = 4,
	// GemWidth = 132,
	// GemHeight = 132;


exports = Class (ui.View, function(supr){
	this.init = function(opts){
		opts = merge (opts, {
			// width: GemWidth,
			// height: GemHeight
			width: GLOBAL.GEMWIDTH,
			height: GLOBAL.GEMHEIGHT
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.build = function(){
		this.isSelect = false;
		this.isMark = false;
		this.canReceiveInput = true;
		this.xIndex = -1;
		this.yIndex = -1;
		this.gemAnimator = animate(this, GLOBAL.GROUP_ANIM_SWAP);

		this.on('InputSelect', bind(this, function(){
			if (this.canReceiveInput)// && !this.isSelect)
			{
				//console.log("Gem is touched here with type: " + this.type);
				//this.isSelect = true;
				this.canReceiveInput = false;
				this.emit('Gem:OnSelect', this.xIndex, this.yIndex);
			}
		}));

		this.on('Gem:OnEnableInput', bind(this, function(active){
			this.canReceiveInput = active;
			//this.resetState();
		}));

		this.on('Gem:OnStopAnim', bind(this, function(){
			if (this.gemAnimator.hasFrames())
				this.gemAnimator.clear();
		}));
	};

	this.getAnimator = function(){
		return this.gemAnimator;
	}

	this.getXIndex = function(){
		return this.xIndex;
	};

	this.getYIndex = function(){
		return this.yIndex;
	};

	this.getGemType = function(){
		return this.type;
	};

	this.getMark = function(){
		return this.isMark;
	};

	this.resetState = function(){
		this.isSelect = false;
		this.canReceiveInput = true;
	};

	this.markGem = function(mark){
		this.isMark = mark;
	};

	this.updatePosition = function(xIndex, yIndex){
		this.xIndex = xIndex;
		this.yIndex = yIndex;
	};

	this.changeType = function(type){
		this.type = type;
		switch(this.type){
			case GLOBAL.GEMVIOLET:
				this.gemView.setImage(ImageViolet);
			break;
			case GLOBAL.GEMORANGE:
				this.gemView.setImage(ImageOrange);
			break;
			case GLOBAL.GEMBLUE:
				this.gemView.setImage(ImageBlue);
			break;
			case GLOBAL.GEMRED:
				this.gemView.setImage(ImageRed);
			break;
			case GLOBAL.GEMGREEN:
				this.gemView.setImage(ImageGreen);
			break;
		}
	};

	this.debugPrint = function(){
		console.log("Position in Board with x: " + this.xIndex + " and y: " + this.yIndex + "; screenX: " + 
		this.style.x + " and screenY: " + this.style.y + " and Opacity: " + this.style.opacity + " and is mark: " + this.getMark() );
	};

	this.SetGem = function(gemType, posX, posY, xIndex, yIndex){
		// console.log("posx: " + posX);
		// console.log("posy: " + posY);
		this.type = gemType;
		this.style.x = posX;
		this.style.y = posY;
		this.xIndex = xIndex;
		this.yIndex = yIndex;

		switch (this.type){
			case GLOBAL.GEMVIOLET:
			this.gemView = new ui.ImageView({
				superview: this,
				visible: true,
				canHandleEvents: false,
				image: ImageViolet,
				x: 0,
				y: 0,
				width: GLOBAL.GEMWIDTH,
				height: GLOBAL.GEMHEIGHT
			});
			break;

			case GLOBAL.GEMORANGE:
			this.gemView = new ui.ImageView({
				superview: this,
				visible: true,
				canHandleEvents: false,
				image: ImageOrange,
				x: 0,
				y: 0,
				width: GLOBAL.GEMWIDTH,
				height: GLOBAL.GEMHEIGHT
			});
			break;

			case GLOBAL.GEMBLUE:
			this.gemView = new ui.ImageView({
				superview: this,
				visible: true,
				canHandleEvents: false,
				image: ImageBlue,
				x: 0,
				y: 0,
				width: GLOBAL.GEMWIDTH,
				height: GLOBAL.GEMHEIGHT
			});
			break;

			case GLOBAL.GEMRED:
			this.gemView = new ui.ImageView({
				superview: this,
				visible: true,
				canHandleEvents: false,
				image: ImageRed,
				x: 0,
				y: 0,
				width: GLOBAL.GEMWIDTH,
				height: GLOBAL.GEMHEIGHT
			});
			break;

			case GLOBAL.GEMGREEN:
			this.gemView = new ui.ImageView({
				superview: this,
				visible: true,
				canHandleEvents: false,
				image: ImageGreen,
				x: 0,
				y: 0,
				width: GLOBAL.GEMWIDTH,
				height: GLOBAL.GEMHEIGHT
			});
			break;
		}
	};
});