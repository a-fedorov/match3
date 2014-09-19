var Match3Game = Match3Game || {};

Match3Game.MainMenu = function(){};

Match3Game.MainMenu.prototype = {
  create: function() {
    this.game.stage.backgroundColor = '#222';

    //start game text
    var text = "Click to begin";
    var style = { font: "50px Arial", fill: "#eee", align: "center" };
    var t = this.game.add.text(this.game.width/2, this.game.height/2 - 100, text, style);
    t.anchor.set(0.5);
    
  },
  
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('Game');
    }
  }
};