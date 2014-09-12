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
		this.selected = [];
	},

	update: function(){
	},


	spawnBoard: function(){

		this.game.BOARD_COLS = Phaser.Math.floor(this.game.world.width / this.game.GEM_SIZE_SPACED);
		this.game.BOARD_ROWS = Phaser.Math.floor(this.game.world.height / this.game.GEM_SIZE_SPACED);

		this.gems = this.game.add.group();
		this.gems.enableBody = true;

		for (var i = 0; i < this.game.BOARD_COLS; i++) {
			for (var j = 0; j < this.game.BOARD_ROWS; j++) {
				var gem = this.gems.create(i * this.game.GEM_SIZE_SPACED, j * this.game.GEM_SIZE_SPACED, "GEMS");
				gem.inputEnabled = true;
		
				// gem.input.enableDrag();
				// gem.input.enableSnap(85, 85, false, true);
				gem.events.onInputDown.add(this.selectGem, this);
				gem.checked = false;
						
				this.randomizeGemColor(gem);
				this.setGemPos(gem, i, j); // each gem has a position on the board
			}
		}
	},

	// select a gem and remember its starting position
	selectGem: function(gem, pointer){
		this.selectedGem = gem;

		if (this.selected[0] === undefined) {
			this.selected[0] = this.selectedGem;
		} else {
			this.selected[1] = this.selectedGem;

			this.swap(this.selected[0], this.selected[1]);
		}

		this.game.selectedGemStartPos.x = gem.posX;
		this.game.selectedGemStartPos.y = gem.posY;
	},

	swap: function(elem1, elem2){
		var duration = 250;
		var offset = this.game.GEM_SIZE_SPACED;

		if (elem2.id - elem1.id == 1){
			this.game.add.tween(elem1.body).to({ x: elem1.x + offset }, duration, Phaser.Easing.Linear.None, true);
			this.game.add.tween(elem2.body).to({ x: elem2.x - offset }, duration, Phaser.Easing.Linear.None, true);

		} else if (elem2.id - elem1.id == -1){
			this.game.add.tween(elem1.body).to({ x: elem1.x - offset }, duration, Phaser.Easing.Linear.None, true);
			this.game.add.tween(elem2.body).to({ x: elem2.x + offset }, duration, Phaser.Easing.Linear.None, true);

		} else if (elem2.id - elem1.id == this.game.BOARD_COLS){
			this.game.add.tween(elem1.body).to({ y: elem1.y + offset }, duration, Phaser.Easing.Linear.None, true);
			this.game.add.tween(elem2.body).to({ y: elem2.y - offset }, duration, Phaser.Easing.Linear.None, true);

		} else if (elem2.id - elem1.id == -this.game.BOARD_COLS){
			this.game.add.tween(elem1.body).to({ y: elem1.y - offset }, duration, Phaser.Easing.Linear.None, true);
			this.game.add.tween(elem2.body).to({ y: elem2.y + offset }, duration, Phaser.Easing.Linear.None, true);

		} else {
			this.selected = [];
			return;
		}

		var temp = elem1.id;
		elem1.id = elem2.id;
		elem2.id = temp;

		this.selected = [];
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
		// console.log(posX, posY, posX + posY * this.game.BOARD_COLS);
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