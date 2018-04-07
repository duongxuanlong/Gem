import ui.View;
import ui.ImageView;


exports = Class(ui.ImageView, function(supr){
	this.init = function(opts){
		opts = merge(opts, {
			x: 0,
			y: 0,
			// image: "resources/images/ui/background.png"
			// image: "resources/images/ui/background.png"
			image: "resources/images/ui/splash_with_play.png"
		});

		supr(this, 'init', [opts]);

		this.on('InputSelect', bind(this, function(){
			this.emit ('TitleScreen:Start');
		}));
	};
});