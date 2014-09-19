var Match3Game = Match3Game || {};

Match3Game.game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game');

Match3Game.game.state.add('Boot', Match3Game.Boot);
Match3Game.game.state.add('Preload', Match3Game.Preload);
Match3Game.game.state.add('MainMenu', Match3Game.MainMenu);
Match3Game.game.state.add('Game', Match3Game.Game);

Match3Game.game.state.start('Boot');