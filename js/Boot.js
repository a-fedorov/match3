var Match3Game = Match3Game || {};

Match3Game.Boot = function(){};

Match3Game.Boot.prototype = {
	preload: function(){
		this.load.image('preloadbar', '/assets/preload-bar.png');
	},

	create: function(){
		this.game.stage.backgroundColor = '#fff';

		// this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.game.GEM_SIZE = 80;
		this.game.GEM_SPACING = 5;
		this.game.GEM_SIZE_SPACED = this.game.GEM_SIZE + this.game.GEM_SPACING;
		this.game.BOARD_COLS;
		this.game.BOARD_ROWS;
		this.game.MATCH_MIN = 3; // min number of same color gems required in a row to be considered a match

		this.state.start('Preload');
	}
};