var Match3Game = Match3Game || {};

Match3Game.Game = function(){};

Match3Game.Game.prototype = {
	preload: function(){
	    // currently selected gem starting position. used to stop player form moving gems too far.
	    this.game.selectedGemStartPos = { x: 0, y: 0 };

	    // used to disable input while gems are dropping down and respawning
	    this.game.allowInput = true;
	},

	create: function(){
		this.game.stage.backgroundColor = '#000';
		this.spawnBoard();

		this.firstPick = 0;
		this.prevIndex = -1;
		this.prevGem = 0;
	},

	spawnBoard: function(){

		this.game.BOARD_COLS = Phaser.Math.floor(this.game.world.width / this.game.GEM_SIZE_SPACED);
		this.game.BOARD_ROWS = Phaser.Math.floor(this.game.world.height / this.game.GEM_SIZE_SPACED);

		this.gems = this.game.add.group();

		for (var i = 0; i < this.game.BOARD_COLS; i++) {
			for (var j = 0; j < this.game.BOARD_ROWS; j++) {
				var gem = this.gems.create(i * this.game.GEM_SIZE_SPACED, j * this.game.GEM_SIZE_SPACED, "GEMS");
				gem.inputEnabled = true;
		
				// gem.input.enableDrag();
				gem.events.onInputDown.add(this.selectGem, this);
						
				this.randomizeGemColor(gem);
				this.setGemPos(gem, i, j); // each gem has a position on the board
			}
		}
	},

	// select a gem and remember its starting position
	selectGem: function(gem, pointer){
		if (this.game.allowInput) {
			this.selectedGem = gem;

			this.game.selectedGemStartPos.x = gem.posX;
			this.game.selectedGemStartPos.y = gem.posY;
		} 

		// var index = this.selectedGemStartPos.x + this.selectedGemStartPos.y * this.game.BOARD_COLS;
		var index = this.selectedGem.id;
		var alphaLevel = 0.3;

		if (this.firstPick == 0){
			this.selectedGem.alpha = alphaLevel;
			this.firstPick = 1;
			prevIndex = index;
			prevGem = this.selectedGem;
		} else if (this.firstPick == 1){
			if (prevIndex == index){
				this.selectedGem.alpha = 1;
				prevIndex = -1;
				this.firstPick = 0;
			}
			else {
				prevGem.alpha = 1;
				prevGem = this.selectedGem;
				prevIndex = index;
				this.selectedGem.alpha = alphaLevel;

				this.firstPick = 1;
			}

		}

	},

	// find a gem on the board according to its position on the board
	getGem: function(posX, posY) {
		return this.gems.iterate("id", this.calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);
	},

	// convert world coordinates to board position
	getGemPos: function(coordinate) {
		return Phaser.Math.floor(coordinate / this.game.GEM_SIZE_SPACED);
	},

	// set the position on the board for a gem
	setGemPos: function(gem, posX, posY) {
		gem.posX = posX;
		gem.posY = posY;
		gem.id = this.calcGemId(posX, posY);
	},

	// the gem id is used by getGem() to find specific gems in the group
	// each position on the board has a unique id
	calcGemId: function(posX, posY) {
		// console.log(this);
		return posX + posY * this.game.BOARD_COLS;
	},

	// since the gems are a spritesheet, their color is the same as the current frame number
	getGemColor: function(gem) {
		return gem.frame;
	},

	// set the gem spritesheet to a random frame
	randomizeGemColor: function(gem) {
		gem.frame = this.game.rnd.integerInRange(0, gem.animations.frameTotal - 1);
	}

}