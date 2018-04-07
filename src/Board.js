import ui.View;
import animate;

import src.Gem as Gem;


exports = Class(ui.View, function(supr) {
	this.init = function(opts) {
		opts = merge(opts, {
			x: GLOBAL.OFFSETSIDE,
			y: GLOBAL.OFFSETTOP,
			width: GLOBAL.BASEWIDTH - GLOBAL.OFFSETSIDE * 2,
			height: GLOBAL.BASEHEIGHT - GLOBAL.OFFSETTOP - GLOBAL.OFFSETBOTTOM
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.generateBoard = function() {
		for (var i = 0; i < this.row; i++) {
			this.gems[i] = [];
			for (var j = 0; j < this.column; j++) {
				//if (this.positions[i][j] == GLOBAL.GEMNONE) {

				// var gemtype = Math.random() * (GLOBAL.GEMGREEN + 1);
				// gemtype = Math.round(gemtype - 1);
				// if (gemtype < 0)
				// 	gemtype = 0;
				//console.log("gemtype " + gemtype);
				var gem = new Gem();
				// gem.SetGem(gemtype,
				// 	j * GLOBAL.GEMHEIGHT + ((j + 1) * GLOBAL.OFFSETDELTA),
				// 	i * GLOBAL.GEMWIDTH + ((i + 1) * GLOBAL.OFFSETDELTA),
				// 	i, j);
				gem.on('Gem:OnSelect', bind(this, function(xIndex, yIndex) {
					// console.log("x: " + xIndex + " - y: " + yIndex);
					this.handleInput(xIndex, yIndex);
				}));
				this.gems[i].push(gem);
				this.addSubview(gem);
				// while (this.checkGem(gem)) {
				// 	var newtype = Math.random() * (GLOBAL.GEMGREEN + 1);
				// 	while (newtype == gemtype) {
				// 		newtype = Math.random() * (GLOBAL.GEMGREEN + 1);
				// 	}
				// 	gem.changeType(newtype);
				// }
				//}
			}
		}
	};

	this.resetState = function(){
		this.inputCount = 0;
		this.isEnded = false;
		this.onMarkGems(false);
		this.enableGemInput(true);
	};

	this.balanceGems = function() {
		for (var i = 0; i < this.row; i++)
			for (var j = 0; j < this.column; j++) {
				while (this.checkGem(this.gems[i][j], true)) {
					var newtype = 0;
					do {
						newtype = Math.random() * (GLOBAL.GEMGREEN + 1);
						newtype = Math.round(newtype - 1);
						if (newtype < 0)
							newtype = 0;
					}
					while (newtype == this.gems[i][j].getGemType());
					this.gems[i][j].changeType(newtype);
				}
			}
	};

	this.randomGems = function() {
		for (var i = 0; i < this.row; i++)
			for (var j = 0; j < this.column; j++) {
				var gemtype = Math.random() * (GLOBAL.GEMGREEN + 1);
				gemtype = Math.round(gemtype - 1);
				if (gemtype < 0)
					gemtype = 0;
				this.gems[i][j].SetGem(gemtype,
					i * GLOBAL.GEMWIDTH + ((i + 1) * GLOBAL.OFFSETDELTA),
					j * GLOBAL.GEMHEIGHT + ((j + 1) * GLOBAL.OFFSETDELTA),
					i, j);
			}
	};

	this.build = function() {
		this.positions =
			[
				[GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE],
				[GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE],
				[GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE],
				[GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE, GLOBAL.GEMNONE]
			];
		this.gems = [];
		this.row = 4;
		this.column = 4;
		this.inputCount = 0;
		this.scoreGems = 0;
		this.isEnded = false;

		//this.groupAnim = null;
		this.swapTime = 800;
		this.flashTime = 200;
		this.fastSwap = 100;
		this.state = GLOBAL.STATE_INVALID;

		this.gem1 = {
			x: -1,
			y: -1
		};
		this.gem2 = {
			x: -1,
			y: -1
		};

		this.generateBoard();
		this.randomGems();
		this.balanceGems();

		// this.debugPrint();

		this.onGroupAnimFinish();

		this.on('OnStateRecheck', bind(this, function(){
			this.state = GLOBAL.STATE_GEM_RECHECK;
			this.checkValid();
		}));

		this.on('Board:OnReplay', bind(this, function(){
			this.state = GLOBAL.STATE_INVALID;
			this.visualizeGems();
			this.randomGems();
			this.balanceGems();
			this.resetState();
			
		}));

		this.on('Board:EndGame', bind(this, function(){
			this.isEnded = true;
			this.state = GLOBAL.STATE_NONE;
			this.onStopGemAim();
			this.enableGemInput(false);
		}));
	};

	this.onGroupAnimFinish = function() {
		animate.getGroup(GLOBAL.GROUP_ANIM_SWAP).on('Finish', bind(this, function() {
			if (this.isEnded)
			{
				this.state = STATE_NONE;
				this.isEnded = false;
				return;
			}

			switch (this.state) {
				case GLOBAL.STATE_CHECKVALID:
					this.checkValid();
					break;
				case GLOBAL.STATE_INVALID:
					this.inputCount = 0;
					this.enableGemInput(true);
					this.onMarkGems(false);
					break;
				case GLOBAL.STATE_REMOVE_MARK:
					if (this.scoreGems > 0)
					{
						var number = this.scoreGems;
						this.emit('Board:OnRemoveMarkGem', number);
						this.scoreGems = 0;
					}
					this.state = GLOBAL.STATE_GEM_FALL;
					// console.log("Call makeGemsFall - 1111111111111");
					this.makeGemsFall();
					break;
				case GLOBAL.STATE_GEM_FALL:
					// console.log("Call makeGemsFall - 2222222222222");
					this.makeGemsFall();
					break;
				case GLOBAL.STATE_GEM_REGENERATE:
					this.state = STATE_GEM_RECHECK;
					this.onMarkGems(false);
					this.checkValid();
					break;
				// case GLOBAL.STATE_GEM_RECHECK:
				// 	this.checkValid();
				// 	break;

			}
		}));
	};

	this.onRegenerate = function(){
		// console.log("onRegenerate");
		var randomType = -1;
		var hasRegenerated = false;
		for (var i = 0; i < this.row; i++)
			for (var j = 0; j < this.column; j++){
				if (this.gems[i][j].getMark()){
					hasRegenerated = true;

					//Random type
					if (randomType == -1){
						randomType = Math.random() * (GLOBAL.GEMGREEN + 1);
						randomType = Math.round(randomType - 1);
						if (randomType < 0)
							randomType = 0;
					}else{
						var newtype = 0;
						do {
							newtype = Math.random() * (GLOBAL.GEMGREEN + 1);
							newtype = Math.round(newtype - 1);
							if (newtype < 0)
								newtype = 0;
						}while(newtype == randomType);

						randomType = newtype;
					}
					this.gems[i][j].changeType(randomType);

					//Set position and animation
					var originalY = this.gems[i][j].style.y;
					//this.gems[i][j].style.opacity = 1;
					var offY = originalY - GLOBAL.OFFSETTOP - (j * GLOBAL.GEMHEIGHT + ((j + 1) * GLOBAL.OFFSETDELTA));
					//this.gems[i][j].style.y = offY;
					this.gems[i][j].getAnimator().now({
						y: offY
					}, this.fastSwap).then({
						y: originalY,
						opacity: 1
					}, this.swapTime, animate.easeOut);
				}
			}

		if (!hasRegenerated){
			// console.log("Reset state");
			this.state = GLOBAL.STATE_INVALID;
			this.resetState();
		}
	};

	this.removeMarkGems = function() {
		// console.log("Remove mark gems");
		var number = 0;
		for (var i = 0; i < this.row; i++)
			for (var j = 0; j < this.column; j++) {
				if (this.gems[i][j].getMark() && this.gems[i][j].style.opacity > 0)
				{
					number++;
					this.gems[i][j].getAnimator().now({
						opacity: 0.3
					}, this.flashTime).then({
						opacity: 0.5
					}, this.flashTime).then({
						opacity: 0
					}, this.flashTime);
				}
			}
			
		if (number > 0)
		{
			// this.emit('Board:OnRemoveMarkGem', number);
			this.scoreGems = number;
		}
	};

	this.makeGemsFall = function() {
		// console.log("makeGemsFall");
		var coordinate = {
				x: -1,
				y: -1
			};

		var isFallen = false;
		for (var i = 0; i < this.row; i++) {
			// console.log("enter here");
			coordinate.x = -1;
			coordinate.y = -1;
			for (var j = this.column - 1; j >= 0; j--) {
				if (this.gems[i][j].getMark()) {
					if (coordinate.x == -1  && i == this.gems[i][j].getXIndex()) {
						coordinate.x = this.gems[i][j].getXIndex();
						coordinate.y = this.gems[i][j].getYIndex();
						// console.log("Record values");
						// console.log("Coordinate with x: " + coordinate.x + " and y: " + coordinate.y);
						// console.log("gems[i][j] " + i + " " + j + " with x: " + 
						// 	this.gems[i][j].getXIndex() + " and y: " + this.gems[i][j].getYIndex());
					}
				} else {
					if (coordinate.x != -1 && coordinate.x == this.gems[i][j].getXIndex()) {
						// console.log("Before swap");
						// console.log("Coordinate with x: " + this.gems[coordinate.x][coordinate.y].getXIndex() + " and y: " + 
						// 	this.gems[coordinate.x][coordinate.y].getYIndex());
						// console.log("gems[i][j] with i: " + i + " and j: " + j + " with x: " + 
						// 	this.gems[i][j].getXIndex() + " and y: " + this.gems[i][j].getYIndex());

						var tX = this.gems[i][j].style.x;
						var tY = this.gems[i][j].style.y;
						var tempX = this.gems[coordinate.x][coordinate.y].style.x;
						var tempY = this.gems[coordinate.x][coordinate.y].style.y;
					
						this.gems[i][j].updatePosition(coordinate.x, coordinate.y);
						this.gems[coordinate.x][coordinate.y].updatePosition(i, j);

						var temp = this.gems[i][j];
						this.gems[i][j] = this.gems[coordinate.x][coordinate.y];
						this.gems[coordinate.x][coordinate.y] = temp;

						// console.log("after swap");
						// console.log("Coordinate with x: " + this.gems[coordinate.x][coordinate.y].getXIndex() + " and y: " + 
						// 	this.gems[coordinate.x][coordinate.y].getYIndex());
						// console.log("gems[i][j] with i: " + i + " and j " + j + " with x: " + 
						// 	this.gems[i][j].getXIndex() + " and y: " + this.gems[i][j].getYIndex());

						// this.gems[i][j].style.x = tX;
						// this.gems[i][j].style.y = tY;
						this.gems[i][j].getAnimator().now({
							x: tX,
							y: tY
						}, this.fastSwap, animate.easeOut);
						this.gems[coordinate.x][coordinate.y].getAnimator().now({
							x: tempX,
							y: tempY
						}, this.fastSwap, animate.easeOut);

						coordinate.x = -1;
						coordinate.y = -1;
						j++;
						isFallen = true;
						break;
					}
				}

			}
			if (isFallen)
				break;
		}

		if (!isFallen)
			this.emit('OnStateRecheck');
			
	};

	this.checkValid = function() {
		// console.log("Check valid");
		switch(this.state){
			case GLOBAL.STATE_CHECKVALID:
				// console.log("Board - checkValid");
				//console.log("Board: gem1 -> " + this.gem1.x + " - " + this.gem1.y);
				//console.log("Board: gem2 -> " + this.gem2.x + " - " + this.gem2.y);
				var con1 = this.checkGem(this.gems[this.gem1.x][this.gem1.y], false);
				//console.log("Gem 1 is valid: " + con1);
				var con2 = this.checkGem(this.gems[this.gem2.x][this.gem2.y], false);
				//console.log("Gem 2 is valid: " + con2);
				if (con1 || con2) {
					this.state = GLOBAL.STATE_REMOVE_MARK;
					this.removeMarkGems();

				} else {
					
					this.state = GLOBAL.STATE_INVALID;
					this.swapGems();
				}
			break;
			case GLOBAL.STATE_GEM_RECHECK:
				// console.log("State recheck");
				var shouldRemove = false;
				for (var i = 0; i < this.row; i++){
					for (var j = 0; j < this.column; j++){
						if (!this.gems[i][j].getMark())
							if (this.checkGem(this.gems[i][j], false))
								shouldRemove = true;
					}
				}
				if (shouldRemove){
					// console.log("State recheck - state remove mark");
					this.state = GLOBAL.STATE_REMOVE_MARK;
					this.removeMarkGems();
				}else{
					// console.log("State recheck - state regenerate");
					this.state = GLOBAL.STATE_GEM_REGENERATE;
					this.onRegenerate();
				}
			break;
		}
	

	};

	this.enableGemInput = function(active) {
		for (var i = 0; i < this.row; i++) {
			for (var j = 0; j < this.column; j++) {
				this.gems[i][j].emit('Gem:OnEnableInput', active);
			}
		}
	};

	this.onMarkGems = function(mark) {
		for (var i = 0; i < this.row; i++) {
			for (var j = 0; j < this.column; j++) {
				this.gems[i][j].markGem(mark);
			}
		}
	};

	this.onStopGemAim = function(){
		for (var i = 0; i < this.row; i++)
			for (var j = 0; j < this.column; j++){
				this.gems[i][j].emit('Gem:OnStopAnim');
			}
	};

	this.visualizeGems = function(){
		for (var i = 0; i < this.row; i++)
			for (var j = 0; j < this.column; j++){
				if (this.gems[i][j].style.opacity < 1)
					this.gems[i][j].style.opacity = 1;
			}
	};	

	this.updateGemsPosition = function() {
		var temp = this.gems[this.gem1.x][this.gem1.y];
		this.gems[this.gem1.x][this.gem1.y] = this.gems[this.gem2.x][this.gem2.y];
		this.gems[this.gem2.x][this.gem2.y] = temp;
	};

	this.debugPrint = function(){
		for (var i = 0; i < this.row; i++)
			for (var j = 0; j < this.column; j++){
				console.log("i: " + i + " and j: " + j);
				this.gems[i][j].debugPrint();
			}
	};

	this.checkGem = function(gem, shouldUnmark) {
		//console.log("gem type should check: " + gem.getGemType());
		var tempGems = [];
		var count = 1;
		var result = false;
		gem.markGem(true);

		var i = 0,
			j = 0;
		var temp = null;
		//tempGems.push(gem);

		// console.log("Gem type: " + gem.getGemType());
		//Check direction x - 1, y - 1
		for (i = gem.getXIndex() - 1, j = gem.getYIndex() - 1; i >= 0 && j >= 0; i--, j--) {
			if (this.gems[i][j] == null)
				break;

			if (this.gems[i][j].getGemType() == gem.getGemType() && !this.gems[i][j].getMark()) {
				this.gems[i][j].markGem(true);
				tempGems.push(this.gems[i][j]);
				count++;
				// console.log("x - 1 with: x: " + i + " and y - 1: " + j);
			} else
				break;
		}
		// console.log("count in x - 1, y - 1: " + count);
		// Check direction x + 1, y + 1
		for (i = gem.getXIndex() + 1, j = gem.getYIndex() + 1; i < this.row && j < this.column; i++, j++) {
			if (this.gems[i][j] == null)
				break;


			if (this.gems[i][j].getGemType() == gem.getGemType() && !this.gems[i][j].getMark()) {
				this.gems[i][j].markGem(true);
				tempGems.push(this.gems[i][j]);
				count++;
				// console.log("x + 1 with: x: " + i + " and y + 1: " + j);
			} else
				break;
		}
		// console.log("count in x + 1, y + 1: " + count);
		if (count >= 3)
			result = true;
		else {
			for (i = 0; i < tempGems.length; i++)
				tempGems[i].markGem(false);
			//count = 1;
			tempGems = [];
		}

		count = 1; //reset count before checking new direction
		//Check direction x - 1, y + 1
		for (i = gem.getXIndex() - 1, j = gem.getYIndex() + 1; i >= 0 && j < this.column; i--, j++) {
			if (this.gems[i][j] == null)
				break;

			if (this.gems[i][j].getGemType() == gem.getGemType() && !this.gems[i][j].getMark()) {
				this.gems[i][j].markGem(true);
				tempGems.push(this.gems[i][j]);
				count++;
				// console.log("x - 1 with: x: " + i + " and y + 1: " + j);
			} else
				break;
		}
		// console.log("count in x - 1, y + 1: " + count);
		//Check direction x + 1, y - 1
		for (i = gem.getXIndex() + 1, j = gem.getYIndex() - 1; i < this.row && j >= 0; i++, j--) {
			if (this.gems[i][j] == null)
				break;
			if (this.gems[i][j].getGemType() == gem.getGemType() && !this.gems[i][j].getMark()) {
				this.gems[i][j].markGem(true);
				tempGems.push(this.gems[i][j]);
				count++;
				// console.log("x + 1 with: x: " + i + " and y - 1: " + j);
			} else
				break;
		}
		// console.log("count in x + 1, y - 1: " + count);
		if (count >= 3)
			result = true;
		else {
			if (result) {
				if (count > 1) {
					temp = tempGems.pop();
					temp.markGem(false);
				}
			} else {
				for (i = 0; i < tempGems.length; i++)
					tempGems[i].markGem(false);
				//count = 1;
				tempGems = [];
			}
		}

		count = 1; //reset count before checking new direction
		//Check direction x - 1
		for (i = gem.getXIndex() - 1; i >= 0; i--) {
			if (this.gems[i][gem.getYIndex()] == null)
				break;
			if (this.gems[i][gem.getYIndex()].getGemType() == gem.getGemType() && !this.gems[i][gem.getYIndex()].getMark()) {
				this.gems[i][gem.getYIndex()].markGem(true);
				tempGems.push(this.gems[i][gem.getYIndex()]);
				count++;
				// console.log("x - 1 with: x: " + i + " and with y: " + gem.getYIndex());
			} else
				break;
		}
		// console.log("count in x - 1, y: " + count);
		//Check direction x + 1
		for (i = gem.getXIndex() + 1; i < this.row; i++) {
			if (this.gems[i][gem.getYIndex()] == null)
				break;
			if (this.gems[i][gem.getYIndex()].getGemType() == gem.getGemType() && !this.gems[i][gem.getYIndex()].getMark()) {
				this.gems[i][gem.getYIndex()].markGem(true);
				tempGems.push(this.gems[i][gem.getYIndex()]);
				count++;
				// console.log("x + 1 with: x: " + i + " and with y: " + gem.getYIndex());
			} else
				break;
		}
		// console.log("count in x + 1, y: " + count);
		if (count >= 3)
			result = true;
		else {
			if (result) {
				if (count > 1) {
					temp = tempGems.pop();
					temp.markGem(false);
				}
			} else {
				for (i = 0; i < tempGems.length; i++)
					tempGems[i].markGem(false);
				//count = 1;
				tempGems = [];
			}
		}

		count = 1; //reset count before checking new direction
		//Check direction y - 1
		for (j = gem.getYIndex() - 1; j >= 0; j--) {
			if (this.gems[gem.getXIndex()][j] == null)
				break;
			if (this.gems[gem.getXIndex()][j].getGemType() == gem.getGemType() && !this.gems[gem.getXIndex()][j].getMark()) {
				this.gems[gem.getXIndex()][j].markGem(true);
				tempGems.push(this.gems[gem.getXIndex()][j]);
				count++;
				// console.log("Y - 1 with: x: " + gem.getXIndex() + " and y: " + j);
			} else
				break;
		}
		// console.log("count in y - 1: " + count);
		//Check direction y + 1
		for (j = gem.getYIndex() + 1; j < this.column; j++) {
			if (this.gems[gem.getXIndex()][j] == null)
				break;
			if (this.gems[gem.getXIndex()][j].getGemType() == gem.getGemType() && !this.gems[gem.getXIndex()][j].getMark()) {
				this.gems[gem.getXIndex()][j].markGem(true);
				tempGems.push(this.gems[gem.getXIndex()][j]);
				count++;
				// console.log("Y + 1 with: x: " + gem.getXIndex() + " and y: " + j);
			} else
				break;
		}
		// console.log("count in y + 1: " + count);
		if (count >= 3)
			result = true;
		else {
			if (result) {
				if (count > 1) {
					temp = tempGems.pop();
					temp.markGem(false);
				}
			} else {
				for (i = 0; i < tempGems.length; i++)
					tempGems[i].markGem(false);
				//count = 1;
				tempGems = [];
			}
		}

		if (!result)
			gem.markGem(false);
		if (shouldUnmark) {
			gem.markGem(false);
			for (i = 0; i < tempGems.length; i++)
				tempGems[i].markGem(false);
		}
		temp = null;
		tempGems = null;
		return result;
	};

	this.handleInput = function(xIndex, yIndex) {
		//console.log("Board - inputCount: " + this.inputCount);
		if (this.inputCount == 0) {
			this.inputCount++;
			// console.log("selected rem - 000 are: " + this.inputCount);

			this.gem1.x = xIndex;
			this.gem1.y = yIndex;
			// console.log("Fist gem x: " + xIndex + " and y: " + yIndex);
		} else if (this.inputCount == 1) {
			if (Math.abs(xIndex - this.gem1.x) < 2 && Math.abs(yIndex - this.gem1.y) < 2) {
				// console.log("Second gem x: " + xIndex + " and y: " + yIndex);
				this.inputCount++;
				// console.log("selected rem - 111 are: " + this.inputCount);

				this.gem2.x = xIndex;
				this.gem2.y = yIndex;
				this.state = GLOBAL.STATE_CHECKVALID;
				this.enableGemInput(false);
				this.swapGems();
			} else {
				this.inputCount--;
				this.enableGemInput(true);
				// console.log("selected rem - 222 are: " + this.inputCount);
			}
		}

		// if (this.inputCount == 2) {
		// }
	};

	this.swapGems = function() {
		var firstgem = this.gems[this.gem1.x][this.gem1.y];
		var secondgem = this.gems[this.gem2.x][this.gem2.y];
		firstgem.updatePosition(this.gem2.x, this.gem2.y);
		secondgem.updatePosition(this.gem1.x, this.gem1.y);

		this.updateGemsPosition();

		firstgem.getAnimator().now({
			x: secondgem.style.x,
			y: secondgem.style.y
		}, this.swapTime, animate.easeOut);

		secondgem.getAnimator().now({
			x: firstgem.style.x,
			y: firstgem.style.y
		}, this.swapTime, animate.easeOut);


		// if (this.state == GLOBAL.STATE_CHECKVALID) {
		// 	if (this.groupAnim == null) {
		// 		this.groupAnim = animate.getGroup(GLOBAL.GROUP_ANIM_SWAP);
		// 		this.groupAnim.on('Finish', bind(this, function() {
		// 			this.checkValid();
		// 		}));
		// 	}
		// }
	};
});