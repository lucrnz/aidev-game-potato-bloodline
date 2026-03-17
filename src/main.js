import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: CONFIG.game.width,
  height: CONFIG.game.height,
  parent: 'game-container',
  backgroundColor: CONFIG.game.backgroundColor,
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
