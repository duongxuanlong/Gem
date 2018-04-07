import ui.View;
import ui.ImageView;

import src.Board as Board;
import src.GUI as GUI;

exports = Class(ui.ImageView, function(supr) {
	this.init = function(opts) {
		opts = merge(opts, {
			x: 0,
			y: 0,
			image: "resources/images/ui/background.png"
		});

		supr(this, 'init', [opts]);

		this.board = new Board();
		this.gui = new GUI();
		this.addSubview(this.board);
		this.addSubview(this.gui);
		//this.board.generateBoard();

		this.on('GameScreen:Start', bind(this, function(){
			this.gui.setUpTime();
		}));

		this.board.on('Board:OnRemoveMarkGem', bind(this, function(number){
			this.gui.emit('GUI:ScoreGem', number);
		}));

		this.gui.on('GUI:EndGame', bind(this, function(){
			this.board.emit('Board:EndGame');
		}));

		this.gui.on('GUI:OnReplay', bind(this, function(){
			this.board.emit('Board:OnReplay');
			this.gui.onEnableReplayButton(false);
			this.gui.resetState();
			this.gui.setUpTime();
		}));
	};
});