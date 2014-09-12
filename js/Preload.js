var Match3Game = Match3Game || {};

Match3Game.Preload = function(){};

Match3Game.Preload.prototype = {
	preload: function(){
		this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar')
		// this.preloadBar.anchor.setTo(0.5);

		this.load.setPreloadSprite(this.preloadBar);

		this.load.spritesheet("GEMS", "/assets/sprites/sprite_b.png", this.game.GEM_SIZE, this.game.GEM_SIZE);
		this.load.image('space', 'assets/space.png');

	},

	create: function(){
		this.state.start('MainMenu');
	}
}

