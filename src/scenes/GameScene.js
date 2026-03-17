import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { Enemy } from '../gameobjects/Enemy.js';
import { XpGem } from '../gameobjects/XpGem.js';
import { KnifeWeapon } from '../weapons/KnifeWeapon.js';
import { GarlicWeapon } from '../weapons/GarlicWeapon.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.currentWave = 1;
    this.timeRemaining = CONFIG.waves.duration;
    this.enemies = [];
    this.xpGems = [];
    this.weapons = [];
    this.enemiesSpawned = 0;
    this.isWaveActive = false;
    this.isPaused = false;
    this.damageNumbers = [];
    this.isUpgradeMenuOpen = false;
    this.pendingLevelUps = 0;
  }

  create() {
    this.resetPlayerStats();
    this.createArena();
    this.createPlayer();
    this.createUI();
    this.createUpgradeUI();
    this.setupInput();
    this.initializeWeapons();
    this.startWave();
  }

  resetPlayerStats() {
    this.playerHp = CONFIG.player.maxHp;
    this.playerMaxHp = CONFIG.player.maxHp;
    this.playerXp = 0;
    this.playerLevel = 1;
    this.xpToNextLevel = CONFIG.levelUp.baseXpRequired;
    this.isInvincible = false;
    this.invincibilityTimer = null;
    
    this.playerStats = {
      damageMultiplier: 1,
      speedMultiplier: 1,
      maxHpBonus: 0,
      xpMagnetMultiplier: 1,
      damageReduction: 0,
    };
  }

  createArena() {
    const { width, height } = CONFIG.game;
    const centerX = width / 2;
    const centerY = height / 2;
    const { radius, fillColor, borderColor, borderThickness } = CONFIG.arena;

    this.arenaGraphics = this.add.graphics();
    this.arenaGraphics.fillStyle(fillColor, 1);
    this.arenaGraphics.fillCircle(centerX, centerY, radius);
    this.arenaGraphics.lineStyle(borderThickness, borderColor, 1);
    this.arenaGraphics.strokeCircle(centerX, centerY, radius);

    this.arenaCenter = { x: centerX, y: centerY };
  }

  createPlayer() {
    const { width, height } = CONFIG.game;

    this.playerGraphics = this.add.graphics();
    this.drawPlayer(width / 2, height / 2);

    this.player = {
      x: width / 2,
      y: height / 2,
      radius: CONFIG.player.radius,
    };
  }

  drawPlayer(x, y) {
    const { radius, color, borderColor, borderThickness } = CONFIG.player;

    this.playerGraphics.clear();
    
    const alpha = this.isInvincible ? 0.5 : 1;
    
    this.playerGraphics.fillStyle(color, alpha);
    this.playerGraphics.fillCircle(x, y, radius);
    this.playerGraphics.lineStyle(borderThickness, borderColor, alpha);
    this.playerGraphics.strokeCircle(x, y, radius);
  }

  createUI() {
    const { width } = CONFIG.game;
    const { healthBar, xpBar } = CONFIG.ui;

    this.healthBarBg = this.add.graphics();
    this.healthBarFill = this.add.graphics();
    this.drawHealthBar();

    this.xpBarBg = this.add.graphics();
    this.xpBarFill = this.add.graphics();
    this.drawXpBar();

    this.levelText = this.add.text(
      healthBar.x + healthBar.width + 15,
      healthBar.y + healthBar.height / 2,
      `Lv.${this.playerLevel}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    );
    this.levelText.setOrigin(0, 0.5);
    this.levelText.setDepth(100);

    this.timerText = this.add.text(width / 2, 60, this.formatTime(this.timeRemaining), {
      fontSize: CONFIG.timer.fontSize,
      fontFamily: CONFIG.timer.fontFamily,
      color: CONFIG.timer.color,
      fontStyle: 'bold',
    });
    this.timerText.setOrigin(0.5, 0.5);
    this.timerText.setDepth(100);

    this.waveText = this.add.text(width / 2, 100, `Wave ${this.currentWave}/${CONFIG.waves.count}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    });
    this.waveText.setOrigin(0.5, 0.5);
    this.waveText.setDepth(100);

    this.overlayContainer = this.add.container(0, 0);
    this.overlayContainer.setDepth(200);

    this.overlayBg = this.add.graphics();
    this.overlayBg.fillStyle(0x000000, 0.8);
    this.overlayBg.fillRect(0, 0, CONFIG.game.width, CONFIG.game.height);
    this.overlayBg.setVisible(false);

    this.overlayTitle = this.add.text(CONFIG.game.width / 2, CONFIG.game.height / 2 - 60, '', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.overlayTitle.setOrigin(0.5, 0.5);
    this.overlayTitle.setVisible(false);

    this.overlaySubtitle = this.add.text(CONFIG.game.width / 2, CONFIG.game.height / 2 + 20, '', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    });
    this.overlaySubtitle.setOrigin(0.5, 0.5);
    this.overlaySubtitle.setVisible(false);

    this.restartButton = this.createButton(
      CONFIG.game.width / 2,
      CONFIG.game.height / 2 + 100,
      'Restart',
      () => this.scene.restart()
    );
    this.restartButton.container.setVisible(false);

    this.overlayContainer.add([this.overlayBg, this.overlayTitle, this.overlaySubtitle]);
  }

  drawHealthBar() {
    const { healthBar } = CONFIG.ui;
    const hpPercent = this.playerHp / this.playerMaxHp;

    this.healthBarBg.clear();
    this.healthBarBg.fillStyle(healthBar.backgroundColor, 1);
    this.healthBarBg.fillRoundedRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height, 4);
    this.healthBarBg.lineStyle(healthBar.borderThickness, healthBar.borderColor, 1);
    this.healthBarBg.strokeRoundedRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height, 4);

    this.healthBarFill.clear();
    if (hpPercent > 0) {
      const fillWidth = healthBar.width * hpPercent;
      this.healthBarFill.fillStyle(healthBar.fillColor, 1);
      this.healthBarFill.fillRoundedRect(healthBar.x, healthBar.y, fillWidth, healthBar.height, 4);
    }
  }

  drawXpBar() {
    const { xpBar, healthBar } = CONFIG.ui;
    const xpPercent = this.playerXp / this.xpToNextLevel;

    this.xpBarBg.clear();
    this.xpBarBg.fillStyle(xpBar.backgroundColor, 1);
    this.xpBarBg.fillRoundedRect(xpBar.x, xpBar.y, xpBar.width, xpBar.height, 3);
    this.xpBarBg.lineStyle(xpBar.borderThickness, xpBar.borderColor, 1);
    this.xpBarBg.strokeRoundedRect(xpBar.x, xpBar.y, xpBar.width, xpBar.height, 3);

    this.xpBarFill.clear();
    if (xpPercent > 0) {
      const fillWidth = xpBar.width * xpPercent;
      this.xpBarFill.fillStyle(xpBar.fillColor, 1);
      this.xpBarFill.fillRoundedRect(xpBar.x, xpBar.y, fillWidth, xpBar.height, 3);
    }

    this.xpText = this.add.text(xpBar.x + xpBar.width / 2, xpBar.y + xpBar.height / 2, `${this.playerXp}/${this.xpToNextLevel}`, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.xpText.setOrigin(0.5, 0.5);
    this.xpText.setDepth(101);
  }

  updateXpBar() {
    const { xpBar } = CONFIG.ui;
    const xpPercent = this.playerXp / this.xpToNextLevel;

    this.xpBarFill.clear();
    if (xpPercent > 0) {
      const fillWidth = xpBar.width * xpPercent;
      this.xpBarFill.fillStyle(xpBar.fillColor, 1);
      this.xpBarFill.fillRoundedRect(xpBar.x, xpBar.y, fillWidth, xpBar.height, 3);
    }
    this.xpText.setText(`${this.playerXp}/${this.xpToNextLevel}`);
  }

  createButton(x, y, text, callback) {
    const container = this.add.container(x, y);
    container.setDepth(250);

    const bg = this.add.graphics();
    bg.fillStyle(0x4a4a6a, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 8);
    bg.lineStyle(2, 0x6a6a9e, 1);
    bg.strokeRoundedRect(-80, -25, 160, 50, 8);

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5, 0.5);

    container.add([bg, buttonText]);

    const hitArea = this.add.rectangle(x, y, 160, 50, 0x000000, 0);
    hitArea.setDepth(251);
    hitArea.setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x6a6a9e, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
      bg.lineStyle(2, 0xffdd44, 1);
      bg.strokeRoundedRect(-80, -25, 160, 50, 8);
    });
    
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a4a6a, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
      bg.lineStyle(2, 0x6a6a9e, 1);
      bg.strokeRoundedRect(-80, -25, 160, 50, 8);
    });
    
    hitArea.on('pointerdown', callback);

    return { container, bg, text: buttonText, hitArea };
  }

  createUpgradeUI() {
    this.upgradeContainer = this.add.container(0, 0);
    this.upgradeContainer.setDepth(300);

    this.upgradeBg = this.add.graphics();
    this.upgradeBg.fillStyle(0x000000, 0.85);
    this.upgradeBg.fillRect(0, 0, CONFIG.game.width, CONFIG.game.height);
    this.upgradeBg.setVisible(false);
    this.upgradeContainer.add(this.upgradeBg);

    this.upgradeTitle = this.add.text(CONFIG.game.width / 2, 120, 'LEVEL UP!', {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#ffdd44',
      fontStyle: 'bold',
    });
    this.upgradeTitle.setOrigin(0.5, 0.5);
    this.upgradeTitle.setVisible(false);
    this.upgradeContainer.add(this.upgradeTitle);

    this.upgradeSubtitle = this.add.text(CONFIG.game.width / 2, 180, 'Choose an upgrade:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    });
    this.upgradeSubtitle.setOrigin(0.5, 0.5);
    this.upgradeSubtitle.setVisible(false);
    this.upgradeContainer.add(this.upgradeSubtitle);

    this.upgradeCards = [];
  }

  showUpgradeMenu() {
    if (this.isUpgradeMenuOpen) {
      this.pendingLevelUps++;
      return;
    }

    this.isUpgradeMenuOpen = true;
    this.isPaused = true;
    this.waveTimer.paused = true;
    if (this.spawnTimer) this.spawnTimer.paused = true;

    this.upgradeBg.setVisible(true);
    this.upgradeTitle.setVisible(true);
    this.upgradeSubtitle.setVisible(true);

    this.clearUpgradeCards();
    this.generateUpgradeChoices();
  }

  clearUpgradeCards() {
    this.upgradeCards.forEach(card => {
      card.container.destroy();
      if (card.hitArea) card.hitArea.destroy();
    });
    this.upgradeCards = [];
  }

  generateUpgradeChoices() {
    const { choicesCount, pool, ui } = CONFIG.upgrades;
    const availableUpgrades = [...pool];
    const choices = [];

    for (let i = 0; i < Math.min(choicesCount, availableUpgrades.length); i++) {
      const randomIndex = Phaser.Math.Between(0, availableUpgrades.length - 1);
      choices.push(availableUpgrades.splice(randomIndex, 1)[0]);
    }

    const totalWidth = (choices.length * ui.cardWidth) + ((choices.length - 1) * ui.cardSpacing);
    const startX = (CONFIG.game.width - totalWidth) / 2 + ui.cardWidth / 2;

    choices.forEach((upgrade, index) => {
      const x = startX + (index * (ui.cardWidth + ui.cardSpacing));
      const y = CONFIG.game.height / 2 + 40;

      const card = this.createUpgradeCard(x, y, upgrade);
      this.upgradeCards.push(card);
    });
  }

  createUpgradeCard(x, y, upgrade) {
    const { ui } = CONFIG.upgrades;
    const container = this.add.container(x, y);
    container.setDepth(310);

    const bg = this.add.graphics();
    bg.fillStyle(ui.backgroundColor, 1);
    bg.fillRoundedRect(-ui.cardWidth / 2, -ui.cardHeight / 2, ui.cardWidth, ui.cardHeight, 12);
    bg.lineStyle(ui.borderThickness, ui.borderColor, 1);
    bg.strokeRoundedRect(-ui.cardWidth / 2, -ui.cardHeight / 2, ui.cardWidth, ui.cardHeight, 12);
    container.add(bg);

    const icon = this.add.text(0, -ui.cardHeight / 2 + 60, upgrade.icon, {
      fontSize: ui.iconFontSize,
    });
    icon.setOrigin(0.5, 0.5);
    container.add(icon);

    const title = this.add.text(0, -ui.cardHeight / 2 + 120, upgrade.name, {
      fontSize: ui.titleFontSize,
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      wordWrap: { width: ui.cardWidth - 20 },
      align: 'center',
    });
    title.setOrigin(0.5, 0.5);
    container.add(title);

    const desc = this.add.text(0, -ui.cardHeight / 2 + 180, upgrade.description, {
      fontSize: ui.descFontSize,
      fontFamily: 'Arial',
      color: '#aaaaaa',
      wordWrap: { width: ui.cardWidth - 30 },
      align: 'center',
    });
    desc.setOrigin(0.5, 0.5);
    container.add(desc);

    const hitArea = this.add.rectangle(x, y, ui.cardWidth, ui.cardHeight, 0x000000, 0);
    hitArea.setDepth(311);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(ui.backgroundColor, 1);
      bg.fillRoundedRect(-ui.cardWidth / 2, -ui.cardHeight / 2, ui.cardWidth, ui.cardHeight, 12);
      bg.lineStyle(ui.borderThickness + 1, ui.hoverBorderColor, 1);
      bg.strokeRoundedRect(-ui.cardWidth / 2, -ui.cardHeight / 2, ui.cardWidth, ui.cardHeight, 12);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(ui.backgroundColor, 1);
      bg.fillRoundedRect(-ui.cardWidth / 2, -ui.cardHeight / 2, ui.cardWidth, ui.cardHeight, 12);
      bg.lineStyle(ui.borderThickness, ui.borderColor, 1);
      bg.strokeRoundedRect(-ui.cardWidth / 2, -ui.cardHeight / 2, ui.cardWidth, ui.cardHeight, 12);
    });

    hitArea.on('pointerdown', () => {
      this.applyUpgrade(upgrade);
      this.hideUpgradeMenu();
    });

    return { container, bg, hitArea };
  }

  applyUpgrade(upgrade) {
    switch (upgrade.type) {
      case 'stat':
        if (upgrade.stat === 'heal') {
          this.playerHp = Math.min(this.playerHp + upgrade.value, this.playerMaxHp);
          this.showDamageNumber(this.player.x, this.player.y - 50, `+${upgrade.value}`, '#44ff44');
        } else {
          this.playerStats[upgrade.stat] += upgrade.value;
          
          if (upgrade.stat === 'maxHpBonus') {
            this.playerMaxHp = CONFIG.player.maxHp + this.playerStats.maxHpBonus;
            this.playerHp = Math.min(this.playerHp + upgrade.value, this.playerMaxHp);
          }
        }
        break;

      case 'weapon_upgrade':
        this.upgradeWeapon(upgrade);
        break;
    }

    this.drawHealthBar();
  }

  upgradeWeapon(upgrade) {
    const weaponMap = {
      'knife': 'knifeWeapon',
      'garlic': 'garlicWeapon',
    };

    const weaponConfig = weaponMap[upgrade.weapon];
    if (!weaponConfig) return;

    if (upgrade.isMultiplier) {
      CONFIG[weaponConfig][upgrade.stat] *= (1 + upgrade.value);
    } else {
      CONFIG[weaponConfig][upgrade.stat] += upgrade.value;
    }

    if (upgrade.weapon === 'knife' && upgrade.stat === 'count') {
      this.refreshKnifeWeapon();
    }
    if (upgrade.weapon === 'garlic' && upgrade.stat === 'radius') {
      this.refreshGarlicWeapon();
    }
  }

  refreshKnifeWeapon() {
    const knifeIndex = this.weapons.findIndex(w => w.name === 'Knife');
    if (knifeIndex !== -1) {
      this.weapons[knifeIndex].destroy();
      this.weapons[knifeIndex] = new KnifeWeapon(this, CONFIG.knifeWeapon);
    }
  }

  refreshGarlicWeapon() {
    const garlicIndex = this.weapons.findIndex(w => w.name === 'Garlic Aura');
    if (garlicIndex !== -1) {
      this.weapons[garlicIndex].destroy();
      this.weapons[garlicIndex] = new GarlicWeapon(this, CONFIG.garlicWeapon);
    }
  }

  hideUpgradeMenu() {
    this.upgradeBg.setVisible(false);
    this.upgradeTitle.setVisible(false);
    this.upgradeSubtitle.setVisible(false);
    this.clearUpgradeCards();

    this.isUpgradeMenuOpen = false;
    this.isPaused = false;
    this.waveTimer.paused = false;
    if (this.spawnTimer) this.spawnTimer.paused = false;

    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps--;
      this.time.delayedCall(100, () => this.showUpgradeMenu());
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  initializeWeapons() {
    this.weapons = [];
    this.addWeapon(new KnifeWeapon(this, CONFIG.knifeWeapon));
    this.addWeapon(new GarlicWeapon(this, CONFIG.garlicWeapon));
  }

  addWeapon(weapon) {
    if (this.weapons.length < CONFIG.weapons.slots) {
      this.weapons.push(weapon);
    }
  }

  startWave() {
    this.isWaveActive = true;
    this.isPaused = false;
    this.enemiesSpawned = 0;
    this.timeRemaining = CONFIG.waves.duration;
    
    this.updateUI();
    this.hideOverlay();
    
    this.waveTimer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });

    this.scheduleNextSpawn();
  }

  scheduleNextSpawn() {
    if (!this.isWaveActive || this.isPaused) return;
    
    const maxEnemies = CONFIG.waves.enemiesPerWave[this.currentWave - 1];
    if (this.enemiesSpawned >= maxEnemies) return;

    const { intervalMin, intervalMax } = CONFIG.spawn;
    const delay = Phaser.Math.Between(intervalMin, intervalMax);
    
    this.spawnTimer = this.time.delayedCall(delay, () => {
      this.spawnEnemy();
      this.scheduleNextSpawn();
    });
  }

  spawnEnemy() {
    if (!this.isWaveActive || this.isPaused) return;
    
    const maxEnemies = CONFIG.waves.enemiesPerWave[this.currentWave - 1];
    if (this.enemiesSpawned >= maxEnemies) return;

    const pos = this.getSpawnPosition();
    const enemy = new Enemy(this, pos.x, pos.y);
    this.enemies.push(enemy);
    this.enemiesSpawned++;
  }

  getSpawnPosition() {
    const { width, height } = CONFIG.game;
    const { spawnDistance } = CONFIG.enemy;
    
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    
    switch (side) {
      case 0:
        x = Phaser.Math.Between(0, width);
        y = -spawnDistance;
        break;
      case 1:
        x = width + spawnDistance;
        y = Phaser.Math.Between(0, height);
        break;
      case 2:
        x = Phaser.Math.Between(0, width);
        y = height + spawnDistance;
        break;
      case 3:
        x = -spawnDistance;
        y = Phaser.Math.Between(0, height);
        break;
    }
    
    return { x, y };
  }

  onTimerTick() {
    if (this.isPaused) return;
    
    this.timeRemaining--;
    this.timerText.setText(this.formatTime(this.timeRemaining));

    if (this.timeRemaining <= 0) {
      this.onWaveComplete();
    }
  }

  onWaveComplete() {
    this.isWaveActive = false;
    this.waveTimer.remove();
    
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    this.clearEnemies();
    this.clearXpGems();

    if (this.currentWave >= CONFIG.waves.count) {
      this.showVictory();
    } else {
      this.showWaveComplete();
    }
  }

  clearEnemies() {
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
  }

  clearXpGems() {
    this.xpGems.forEach(gem => gem.destroy());
    this.xpGems = [];
  }

  showOverlay(title, subtitle, color = '#ffffff', showRestart = false) {
    this.isPaused = true;
    this.overlayBg.setVisible(true);
    this.overlayTitle.setText(title);
    this.overlayTitle.setColor(color);
    this.overlayTitle.setVisible(true);
    this.overlaySubtitle.setText(subtitle);
    this.overlaySubtitle.setVisible(true);
    this.restartButton.container.setVisible(showRestart);
  }

  hideOverlay() {
    this.overlayBg.setVisible(false);
    this.overlayTitle.setVisible(false);
    this.overlaySubtitle.setVisible(false);
    this.restartButton.container.setVisible(false);
  }

  showWaveComplete() {
    this.showOverlay('Wave Complete!', '', '#44ff44');
    
    let countdown = Math.ceil(CONFIG.waves.intermissionDuration / 1000);
    this.overlaySubtitle.setText(`Next wave in ${countdown}...`);
    this.overlaySubtitle.setVisible(true);
    
    this.intermissionTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        if (countdown > 0) {
          this.overlaySubtitle.setText(`Next wave in ${countdown}...`);
        }
      },
      callbackScope: this,
      repeat: countdown - 1,
    });
    
    this.time.delayedCall(CONFIG.waves.intermissionDuration, () => {
      if (this.intermissionTimer) this.intermissionTimer.remove();
      this.currentWave++;
      this.startWave();
    });
  }

  showVictory() {
    this.showOverlay(
      'VICTORY!',
      `Level ${this.playerLevel} | Final Score: ${this.playerLevel * 1000}`,
      '#ffdd44',
      true
    );
  }

  showGameOver() {
    this.isWaveActive = false;
    this.waveTimer.remove();
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }
    if (this.intermissionTimer) {
      this.intermissionTimer.remove();
    }
    
    this.showOverlay(
      'GAME OVER',
      `Level ${this.playerLevel} | Score: ${this.playerLevel * 1000}`,
      '#ff4444',
      true
    );
  }

  updateUI() {
    this.timerText.setText(this.formatTime(this.timeRemaining));
    this.waveText.setText(`Wave ${this.currentWave}/${CONFIG.waves.count}`);
    this.levelText.setText(`Lv.${this.playerLevel}`);
    this.drawHealthBar();
    this.updateXpBar();
  }

  update(time, delta) {
    if (this.isPaused && !this.isUpgradeMenuOpen) return;

    this.handlePlayerMovement();
    this.updateEnemies(delta);
    this.updateWeapons(delta);
    this.updateXpGems(delta);
    this.checkPlayerEnemyCollision();
    this.updateDamageNumbers(delta);
    this.checkWaveCleared();
  }

  checkWaveCleared() {
    if (!this.isWaveActive || this.isPaused) return;
    
    const maxEnemies = CONFIG.waves.enemiesPerWave[this.currentWave - 1];
    const allSpawned = this.enemiesSpawned >= maxEnemies;
    const allDead = this.enemies.length === 0;
    
    if (allSpawned && allDead) {
      this.onWaveComplete();
    }
  }

  handlePlayerMovement() {
    const baseSpeed = CONFIG.player.speed * this.playerStats.speedMultiplier;
    const { radius: arenaRadius } = CONFIG.arena;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx = (vx / length) * baseSpeed;
      vy = (vy / length) * baseSpeed;
    }

    const mousePos = this.input.activePointer;
    if (mousePos.isDown && vx === 0 && vy === 0) {
      const dx = mousePos.worldX - this.player.x;
      const dy = mousePos.worldY - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5) {
        vx = (dx / dist) * baseSpeed;
        vy = (dy / dist) * baseSpeed;
      }
    }

    this.player.x += vx * (this.game.loop.delta / 1000);
    this.player.y += vy * (this.game.loop.delta / 1000);

    const dx = this.player.x - this.arenaCenter.x;
    const dy = this.player.y - this.arenaCenter.y;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    const maxDist = arenaRadius - this.player.radius;

    if (distFromCenter > maxDist) {
      const angle = Math.atan2(dy, dx);
      this.player.x = this.arenaCenter.x + Math.cos(angle) * maxDist;
      this.player.y = this.arenaCenter.y + Math.sin(angle) * maxDist;
    }

    this.drawPlayer(this.player.x, this.player.y);
  }

  updateEnemies(delta) {
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.active) {
        enemy.update(this.player.x, this.player.y, delta);
        return true;
      }
      return false;
    });
  }

  updateWeapons(delta) {
    this.weapons.forEach(weapon => {
      weapon.update(this.player, this.enemies, delta);
    });
  }

  updateXpGems(delta) {
    const attractRadius = CONFIG.xpGem.attractRadius * this.playerStats.xpMagnetMultiplier;
    
    this.xpGems = this.xpGems.filter(gem => {
      if (gem.active) {
        gem.update(this.player.x, this.player.y, delta, attractRadius);
        return true;
      }
      return false;
    });
  }

  checkPlayerEnemyCollision() {
    if (this.isInvincible) return;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      
      const dist = Math.sqrt(
        Math.pow(this.player.x - enemy.x, 2) + Math.pow(this.player.y - enemy.y, 2)
      );
      
      if (dist < this.player.radius + enemy.radius) {
        this.playerTakeDamage(enemy.damage);
        break;
      }
    }
  }

  playerTakeDamage(amount) {
    const reducedDamage = Math.floor(amount * (1 - this.playerStats.damageReduction));
    this.playerHp -= reducedDamage;
    this.updateUI();
    
    this.showDamageNumber(this.player.x, this.player.y - 30, reducedDamage, '#ff4444');
    
    if (this.playerHp <= 0) {
      this.showGameOver();
      return;
    }
    
    this.isInvincible = true;
    this.drawPlayer(this.player.x, this.player.y);
    
    if (this.invincibilityTimer) {
      this.invincibilityTimer.remove();
    }
    
    this.invincibilityTimer = this.time.delayedCall(CONFIG.player.invincibilityDuration, () => {
      this.isInvincible = false;
      this.drawPlayer(this.player.x, this.player.y);
    });
  }

  dealDamageToEnemy(enemy, amount) {
    if (!enemy.active) return;
    
    const finalDamage = Math.floor(amount * this.playerStats.damageMultiplier);
    const killed = enemy.takeDamage(finalDamage);
    this.showDamageNumber(enemy.x, enemy.y - enemy.radius, finalDamage, CONFIG.damageNumber.color);
    
    if (killed) {
      this.enemies = this.enemies.filter(e => e !== enemy);
    }
  }

  spawnXpGem(x, y, value) {
    const gem = new XpGem(this, x, y, value);
    this.xpGems.push(gem);
  }

  collectXp(amount) {
    this.playerXp += amount;
    
    while (this.playerXp >= this.xpToNextLevel) {
      this.playerXp -= this.xpToNextLevel;
      this.playerLevel++;
      this.xpToNextLevel = Math.floor(CONFIG.levelUp.baseXpRequired * Math.pow(CONFIG.levelUp.xpScaling, this.playerLevel - 1));
      
      this.showUpgradeMenu();
    }
    
    this.updateUI();
  }

  showDamageNumber(x, y, amount, color) {
    const text = this.add.text(x, y, amount > 0 ? `-${amount}` : `+${Math.abs(amount)}`, {
      fontSize: CONFIG.damageNumber.fontSize,
      fontFamily: CONFIG.damageNumber.fontFamily,
      color: color,
      fontStyle: 'bold',
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(150);
    
    this.damageNumbers.push({
      text: text,
      y: y,
      elapsed: 0,
    });
  }

  updateDamageNumbers(delta) {
    this.damageNumbers = this.damageNumbers.filter(dn => {
      dn.elapsed += delta;
      
      if (dn.elapsed >= CONFIG.damageNumber.duration) {
        dn.text.destroy();
        return false;
      }
      
      dn.y += CONFIG.damageNumber.floatSpeed * (delta / 1000);
      dn.text.setY(dn.y);
      
      const alpha = 1 - (dn.elapsed / CONFIG.damageNumber.duration);
      dn.text.setAlpha(alpha);
      
      return true;
    });
  }
}
