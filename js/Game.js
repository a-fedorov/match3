var Match3Game = Match3Game || {};

Match3Game.Game = function(){};

Match3Game.Game.prototype = {
	preload: function(){
		this.selectedGem = null;
		this.selectedGems = [];

	    // currently selected gem starting position. used to stop player form moving gems too far.
		this.selectedGemStartPos = {x: 0, y: 0};

		this.selectedGemTween = null;
		this.tempShiftedGem = null;
		this.tempShiftedGemTween = null;

		this.score = 0;
		this.selectedOnce = false;
	},

	create: function() {
    this.game.world.y = 60;

		// fill the screen with as many gems as possible
		this.spawnBoard();
		
		// this.scoreLabelStyle = {
		// 	font: '30px Arial', 
		// 	fill: '#ffffff',
		// 	align: 'left',
		// 	fontWeight: 'bold'
		// };
		// this.scoreLabel = this.game.add.text(32, 0, "Score: 0", this.scoreLabelStyle);
		// this.scoreLabel.setShadow(15, 15, 'rgba(0,0,0,0.8)', 15);

		this.scoreValue = document.getElementById('score');
	},

	updateScore: function(){
		// this.scoreLabel.setText("Score: " + this.getScore());
		this.scoreValue.style.fontSize = 30 + 'px';
		this.scoreValue.innerHTML = 'Score: ' + this.getScore();
	},

	update: function() {

		// if (this.game.width != window.innerWidth){
		// 	this.game.width = window.innerWidth;
		// }

		// when the mouse is released with a gem selected
		// 1) check for matches
		// 2) remove matched gems
		// 3) drop down gems above removed gems
		// 4) refill the board

// if (this.game.input.mousePointer.justClicked()){}

		if (this.game.input.mousePointer.justReleased()) {
			if (this.selectedGem != null) {
	    		this.checkAndKillGemMatches(this.selectedGem);

	    		if (this.tempShiftedGem != null) {
		    		// this.checkAndKillGemMatches(this.tempShiftedGem);
	    		}

	    		this.removeKilledGems();
	    		this.updateScore();


	    		var dropGemDuration = this.dropGems();
	    		this.game.time.events.add(dropGemDuration * 1, this.refillBoard, this); // delay board refilling until all existing gems have dropped down

		    	this.selectedGem = null;
		    	this.tempShiftedGem = null;
			}
		}

		// check if a selected gem should be moved and do it

		if (this.selectedGem != null) {

			var cursorGemPosX = this.getGemPos(this.game.input.mousePointer.x);
			var cursorGemPosY = this.getGemPos(this.game.input.mousePointer.y);

			if (this.checkIfGemCanBeMovedHere(this.selectedGemStartPos.x, this.selectedGemStartPos.y, cursorGemPosX, cursorGemPosY)) {
				if (cursorGemPosX != this.selectedGem.posX || cursorGemPosY != this.selectedGem.posY) {

	    			// move currently selected gem
	    			if (this.selectedGemTween != null) {
	    				this.game.tweens.remove(this.selectedGemTween);
	    			}
	    			this.selectedGemTween = this.tweenGemPos(this.selectedGem, cursorGemPosX, cursorGemPosY);
		    		this.gems.bringToTop(this.selectedGem);

		    		// if we moved a gem to make way for the selected gem earlier, move it back into its starting position
		    		if (this.tempShiftedGem != null) {
		    			this.tweenGemPos(this.tempShiftedGem, this.selectedGem.posX , this.selectedGem.posY);
	    				this.swapGemPosition(this.selectedGem, this.tempShiftedGem);
		    		}

		    		// when the player moves the selected gem, we need to swap the position of the selected gem with the gem currently in that position 
		    		this.tempShiftedGem = this.getGem(cursorGemPosX, cursorGemPosY);
	    			
		    		if (this.tempShiftedGem == this.selectedGem) {
		    			this.tempShiftedGem = null;

		    		} else {
			    		this.tweenGemPos(this.tempShiftedGem, this.selectedGem.posX, this.selectedGem.posY);
		    			this.swapGemPosition(this.tempShiftedGem, this.selectedGem);
		    		}
		    	}
		    }
		}
	},

	// fill the screen with as many gems as possible
	spawnBoard: function() {
		this.game.BOARD_COLS = Phaser.Math.floor(this.game.world.width / this.game.GEM_SIZE_SPACED);
		this.game.BOARD_ROWS = Phaser.Math.floor(this.game.world.height / this.game.GEM_SIZE_SPACED);
		this.gems = this.game.add.group();
		this.gems.enableBody = true;
		// this.gems.physicsBodyType = Phaser.Physics.ARCADE;

		for (var i = 0; i < this.game.BOARD_COLS; i++) {
			for (var j = 0; j < this.game.BOARD_ROWS; j++) {
				var gem = this.gems.create(i * this.game.GEM_SIZE_SPACED, j * this.game.GEM_SIZE_SPACED, "GEMS");
				gem.inputEnabled = true;
				gem.events.onInputDown.add(this.selectGem, this);
				this.randomizeGemColor(gem);
				this.setGemPos(gem, i, j); // each gem has a position on the board
			}
		}
	},

	selectGem: function(gem, pointer){
		this.selectedGem = gem;

		this.selectedGemStartPos.x = gem.posX;
		this.selectedGemStartPos.y = gem.posY;
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
		return posX + posY * this.game.BOARD_COLS;
	},

	// since the gems are a spritesheet, their color is the same as the current frame number
	getGemColor: function(gem) {
		return gem.frame;
	},

	// set the gem spritesheet to a random frame
	randomizeGemColor: function(gem) {
		gem.frame = this.game.rnd.integerInRange(0, gem.animations.frameTotal - 1);
	},

	// gems can only be moved 1 square up/down or left/right
	checkIfGemCanBeMovedHere: function(fromPosX, fromPosY, toPosX, toPosY) {
		if (toPosX < 0 || toPosX >= this.game.BOARD_COLS || toPosY < 0 || toPosY >= this.game.BOARD_ROWS) {
			return false;
		}
		if (fromPosX == toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1) {
			return true;
		}
		if (fromPosY == toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1) {
			return true;
		}
		return false;
	},

	// count how many gems of the same color lie in a given direction
	// eg if moveX=1 and moveY=0, it will count how many gems of the same color lie to the right of the gem
	// stops counting as soon as a gem of a different color or the board end is encountered
	countSameColorGems: function(startGem, moveX, moveY) {
		var curX = startGem.posX + moveX;
		var curY = startGem.posY + moveY;
		var count = 0;

		var tempGem = this.getGem(curX, curY);

		while (curX >= 0 && curY >= 0 && 
			   curX < this.game.BOARD_COLS && 
			   curY < this.game.BOARD_ROWS && 
			   this.getGem(curX, curY).frame == startGem.frame ) {

			count++;
			curX += moveX;
			curY += moveY;
		}
		return count;
	},

	// swap the position of 2 gems when the player drags the selected gem into a new location
	swapGemPosition: function(gem1, gem2) {
		var tempPosX = gem1.posX;
		var tempPosY = gem1.posY;
		this.setGemPos(gem1, gem2.posX, gem2.posY);
		this.setGemPos(gem2, tempPosX, tempPosY);
	},

	// count how many gems of the same color are above, below, to the left and right
	// if there are more than 3 matched horizontally or vertically, kill those gems
	// if no match was made, move the gems back into their starting positions
	checkAndKillGemMatches: function(gem) {

		if (gem != null) {

			var countUp = this.countSameColorGems(gem, 0, -1);
			var countDown = this.countSameColorGems(gem, 0, 1);
			var countLeft = this.countSameColorGems(gem, -1, 0);
			var countRight = this.countSameColorGems(gem, 1, 0);
			
			var countHoriz = countLeft + countRight + 1;
			var countVert = countUp + countDown + 1;

			if (countVert >= this.game.MATCH_MIN) {
				this.score += countVert;
				this.killGemRange(gem.posX, gem.posY - countUp, gem.posX, gem.posY + countDown);
			}

			if (countHoriz >= this.game.MATCH_MIN) {
				this.score += countHoriz;
				this.killGemRange(gem.posX - countLeft, gem.posY, gem.posX + countRight, gem.posY);
			}

			if (countVert < this.game.MATCH_MIN && countHoriz < this.game.MATCH_MIN) {
				if (gem.posX != this.selectedGemStartPos.x || gem.posY != this.selectedGemStartPos.y) {
					if (this.selectedGemTween != null) {
	    				this.game.tweens.remove(this.selectedGemTween);
	    			}
	    			this.selectedGemTween = this.tweenGemPos(gem, this.selectedGemStartPos.x, this.selectedGemStartPos.y);

		    		if (this.tempShiftedGem != null) {
		    			this.tweenGemPos(this.tempShiftedGem, gem.posX, gem.posY);
	    			}

	    			this.swapGemPosition(gem, this.tempShiftedGem);
	    		}
			}
		}
	},

	// kill all gems from a starting position to an end position
	killGemRange: function(fromX, fromY, toX, toY) {
		fromX = Phaser.Math.clamp(fromX, 0, this.game.BOARD_COLS - 1);
		fromY = Phaser.Math.clamp(fromY , 0, this.game.BOARD_ROWS - 1);
		toX = Phaser.Math.clamp(toX, 0, this.game.BOARD_COLS - 1);
		toY = Phaser.Math.clamp(toY, 0, this.game.BOARD_ROWS - 1);
		for (var i = fromX; i <= toX; i++) {
			for (var j = fromY; j <= toY; j++) {
				var gem = this.getGem(i, j);
				gem.kill();
			}
		}
	},

	// move gems that have been killed off the board
	removeKilledGems: function() {
		var self = this;
		this.gems.forEach(function(gem) {
			if (!gem.alive) {
				self.setGemPos(gem, -1,-1);
			}
		});
	},

	// animated gem movement
	tweenGemPos: function(gem, newPosX, newPosY, durationMultiplier) {
		if (durationMultiplier == null) {
			durationMultiplier = 1;

			var duration = 200;
		}
		return this.game.add.tween(gem.body).to({x: newPosX  * this.game.GEM_SIZE_SPACED, y: newPosY * this.game.GEM_SIZE_SPACED}, durationMultiplier * 120, Phaser.Easing.Cubic.None, true);   			
	},

	// look for gems with empty space beneath them and move them down
	dropGems: function() {
		var dropRowCountMax = 0;
		for (var i = 0; i < this.game.BOARD_COLS; i++) {
			var dropRowCount = 0;
			for (var j = this.game.BOARD_ROWS - 1; j >= 0; j--) {
				var gem = this.getGem(i, j);
				if (gem == null) {
					dropRowCount++;
				} else if (dropRowCount > 0) {
					this.setGemPos(gem, gem.posX, gem.posY + dropRowCount);
					this.tweenGemPos(gem, gem.posX, gem.posY, dropRowCount);
				}
			}
			dropRowCountMax = Math.max(dropRowCount, dropRowCountMax);
		}

		return dropRowCountMax;
	},

	// look for any empty spots on the board and spawn new gems in their place that fall down from above
	refillBoard: function() {
		for (var i = 0; i < this.game.BOARD_COLS; i++) {
			var gemsMissingFromCol = 0;
			for (var j = this.game.BOARD_ROWS - 1; j >= 0; j--) {
				var gem = this.getGem(i, j);
				if (gem == null) {
					gemsMissingFromCol++;
					gem = this.gems.getFirstDead();
					gem.reset(i * this.game.GEM_SIZE_SPACED, -gemsMissingFromCol * this.game.GEM_SIZE_SPACED);
					this.randomizeGemColor(gem);
					this.setGemPos(gem, i, j);
					this.tweenGemPos(gem, gem.posX, gem.posY, gemsMissingFromCol * 2);
				}
			}
		}

	},

	// when the board has finished refilling, re-enable player input
	boardRefilled: function() {
		this.allowInput = true;
	},

	getScore: function() {
		return this.score;
	},

	render: function() {
		this.updateScore();
	}

}