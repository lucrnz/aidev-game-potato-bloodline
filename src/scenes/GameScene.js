import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { Enemy } from '../gameobjects/Enemy.js';
import { XpGem } from '../gameobjects/XpGem.js';
import { KnifeWeapon } from '../weapons/KnifeWeapon.js';
import { FirearmWeapon } from '../weapons/FirearmWeapon.js';
import { DamageAuraAbility } from '../abilities/DamageAuraAbility.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.currentWave = 1;
    this.timeRemaining = CONFIG.waves.duration;
    this.enemies = [];
    this.xpGems = [];
    this.weapons = [];
    this.abilities = [];
    this.weaponState = new Map();
    this.abilityState = new Map();
    this.enemiesSpawned = 0;
    this.isWaveActive = false;
    this.isPaused = false;
    this.damageNumbers = [];
    this.isUpgradeMenuOpen = false;
    this.pendingLevelUps = 0;
    this.pendingStore = false;
    this.isStoreOpen = false;
    this.isPauseMenuOpen = false;
    this.isPauseConfirmOpen = false;
    this.score = 0;
    this.crystals = 0;
  }

  create(data) {
    this.resetPlayerStats();
    this.createArena();
    this.createPlayer();
    this.createUI();
    this.createUpgradeUI();
    this.createStoreUI();
    this.createPauseMenuUI();
    this.createHud();
    this.setupInput();
    this.initializeCombatLoadout(data?.starterWeaponId);
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
      sightMultiplier: 1,
    };

    this.pendingStore = false;
    this.isStoreOpen = false;
    this.isPauseMenuOpen = false;
    this.isPauseConfirmOpen = false;
    this.score = 0;
    this.crystals = 0;
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
      () => this.scene.start('WeaponSelectScene')
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

  createHud() {
    this.hudContainer = this.add.container(0, 0);
    this.hudContainer.setDepth(180);
    this.hudContainer.setScrollFactor(0);

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x101020, 0.75);
    hudBg.fillRoundedRect(20, CONFIG.game.height - 170, 360, 140, 12);
    hudBg.lineStyle(2, 0x4a4a6a, 1);
    hudBg.strokeRoundedRect(20, CONFIG.game.height - 170, 360, 140, 12);
    this.hudContainer.add(hudBg);

    const itemBg = this.add.graphics();
    itemBg.fillStyle(0x101020, 0.75);
    itemBg.fillRoundedRect(CONFIG.game.width - 380, CONFIG.game.height - 170, 360, 140, 12);
    itemBg.lineStyle(2, 0x4a4a6a, 1);
    itemBg.strokeRoundedRect(CONFIG.game.width - 380, CONFIG.game.height - 170, 360, 140, 12);
    this.hudContainer.add(itemBg);

    this.weaponHudTitle = this.add.text(40, CONFIG.game.height - 160, 'Weapons', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.hudContainer.add(this.weaponHudTitle);

    this.itemHudTitle = this.add.text(CONFIG.game.width - 360, CONFIG.game.height - 160, 'Items', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.hudContainer.add(this.itemHudTitle);

    this.weaponHudText = this.add.text(40, CONFIG.game.height - 130, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#cccccc',
      lineSpacing: 4,
    });
    this.hudContainer.add(this.weaponHudText);

    this.itemHudText = this.add.text(CONFIG.game.width - 360, CONFIG.game.height - 130, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#cccccc',
      lineSpacing: 4,
    });
    this.hudContainer.add(this.itemHudText);

    this.scoreText = this.add.text(CONFIG.game.width / 2, 24, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.scoreText.setOrigin(0.5, 0);
    this.scoreText.setDepth(120);

    this.crystalText = this.add.text(CONFIG.game.width / 2, 44, 'Crystals: 0', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#44ffdd',
      fontStyle: 'bold',
    });
    this.crystalText.setOrigin(0.5, 0);
    this.crystalText.setDepth(120);

    this.updateHud();
  }

  createStoreUI() {
    this.storeContainer = this.add.container(0, 0);
    this.storeContainer.setDepth(260);

    this.storeBg = this.add.graphics();
    this.storeBg.fillStyle(0x000000, 0.85);
    this.storeBg.fillRect(0, 0, CONFIG.game.width, CONFIG.game.height);
    this.storeBg.setVisible(false);
    this.storeContainer.add(this.storeBg);

    this.storeTitle = this.add.text(CONFIG.game.width / 2, 110, 'SUPPLY STORE', {
      fontSize: '52px',
      fontFamily: 'Arial',
      color: '#44ffdd',
      fontStyle: 'bold',
    });
    this.storeTitle.setOrigin(0.5, 0.5);
    this.storeTitle.setVisible(false);
    this.storeContainer.add(this.storeTitle);

    this.storeSubtitle = this.add.text(CONFIG.game.width / 2, 170, 'Spend crystals to prepare for the next wave', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    });
    this.storeSubtitle.setOrigin(0.5, 0.5);
    this.storeSubtitle.setVisible(false);
    this.storeContainer.add(this.storeSubtitle);

    this.storeCards = [];
    this.storeContinueButton = this.createButton(
      CONFIG.game.width / 2,
      CONFIG.game.height - 80,
      'Continue',
      () => this.hideStore()
    );
    this.storeContinueButton.container.setVisible(false);
  }

  createPauseMenuUI() {
    this.pauseMenuContainer = this.add.container(0, 0);
    this.pauseMenuContainer.setDepth(320);

    this.pauseMenuBg = this.add.graphics();
    this.pauseMenuBg.fillStyle(0x000000, 0.85);
    this.pauseMenuBg.fillRect(0, 0, CONFIG.game.width, CONFIG.game.height);
    this.pauseMenuBg.setVisible(false);
    this.pauseMenuContainer.add(this.pauseMenuBg);

    this.pauseMenuTitle = this.add.text(140, 80, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.pauseMenuTitle.setOrigin(0, 0.5);
    this.pauseMenuTitle.setVisible(false);
    this.pauseMenuContainer.add(this.pauseMenuTitle);

    this.pauseMenuSubtitle = this.add.text(140, 130, 'Escape to resume', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    });
    this.pauseMenuSubtitle.setOrigin(0, 0.5);
    this.pauseMenuSubtitle.setVisible(false);
    this.pauseMenuContainer.add(this.pauseMenuSubtitle);

    this.pauseRestartButton = this.createButton(
      200,
      220,
      'Restart',
      () => this.openPauseConfirm()
    );
    this.pauseRestartButton.container.setVisible(false);

    this.pauseStatsBg = this.add.graphics();
    this.pauseStatsBg.fillStyle(0x101020, 0.85);
    this.pauseStatsBg.fillRoundedRect(CONFIG.game.width - 420, 80, 360, CONFIG.game.height - 160, 14);
    this.pauseStatsBg.lineStyle(2, 0x4a4a6a, 1);
    this.pauseStatsBg.strokeRoundedRect(CONFIG.game.width - 420, 80, 360, CONFIG.game.height - 160, 14);
    this.pauseStatsBg.setVisible(false);
    this.pauseMenuContainer.add(this.pauseStatsBg);

    this.pauseStatsTitle = this.add.text(CONFIG.game.width - 390, 110, 'Loadout & Stats', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.pauseStatsTitle.setOrigin(0, 0.5);
    this.pauseStatsTitle.setVisible(false);
    this.pauseMenuContainer.add(this.pauseStatsTitle);

    this.pauseWeaponsText = this.add.text(CONFIG.game.width - 390, 150, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc',
      lineSpacing: 6,
      wordWrap: { width: 320 },
    });
    this.pauseWeaponsText.setOrigin(0, 0);
    this.pauseWeaponsText.setVisible(false);
    this.pauseMenuContainer.add(this.pauseWeaponsText);

    this.pauseItemsText = this.add.text(CONFIG.game.width - 390, 320, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc',
      lineSpacing: 6,
      wordWrap: { width: 320 },
    });
    this.pauseItemsText.setOrigin(0, 0);
    this.pauseItemsText.setVisible(false);
    this.pauseMenuContainer.add(this.pauseItemsText);

    this.pauseStatsText = this.add.text(CONFIG.game.width - 390, 510, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc',
      lineSpacing: 6,
      wordWrap: { width: 320 },
    });
    this.pauseStatsText.setOrigin(0, 0);
    this.pauseStatsText.setVisible(false);
    this.pauseMenuContainer.add(this.pauseStatsText);

    this.pauseConfirmBg = this.add.graphics();
    this.pauseConfirmBg.fillStyle(0x000000, 0.9);
    this.pauseConfirmBg.fillRoundedRect(CONFIG.game.width / 2 - 200, CONFIG.game.height / 2 - 120, 400, 240, 14);
    this.pauseConfirmBg.lineStyle(2, 0xffdd44, 1);
    this.pauseConfirmBg.strokeRoundedRect(CONFIG.game.width / 2 - 200, CONFIG.game.height / 2 - 120, 400, 240, 14);
    this.pauseConfirmBg.setVisible(false);
    this.pauseMenuContainer.add(this.pauseConfirmBg);

    this.pauseConfirmTitle = this.add.text(CONFIG.game.width / 2, CONFIG.game.height / 2 - 60, 'Restart run?', {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.pauseConfirmTitle.setOrigin(0.5, 0.5);
    this.pauseConfirmTitle.setVisible(false);
    this.pauseMenuContainer.add(this.pauseConfirmTitle);

    this.pauseConfirmSubtitle = this.add.text(CONFIG.game.width / 2, CONFIG.game.height / 2 - 20, 'Your current progress will be lost.', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    });
    this.pauseConfirmSubtitle.setOrigin(0.5, 0.5);
    this.pauseConfirmSubtitle.setVisible(false);
    this.pauseMenuContainer.add(this.pauseConfirmSubtitle);

    this.pauseConfirmYes = this.createButton(
      CONFIG.game.width / 2 - 90,
      CONFIG.game.height / 2 + 50,
      'Restart',
      () => this.scene.start('WeaponSelectScene')
    );
    this.pauseConfirmYes.container.setVisible(false);

    this.pauseConfirmNo = this.createButton(
      CONFIG.game.width / 2 + 90,
      CONFIG.game.height / 2 + 50,
      'Cancel',
      () => this.closePauseConfirm()
    );
    this.pauseConfirmNo.container.setVisible(false);
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
    const availableChoices = [...pool, ...this.getAvailableWeaponUnlockChoices()];
    const choices = [];

    for (let i = 0; i < Math.min(choicesCount, availableChoices.length); i++) {
      const randomIndex = Phaser.Math.Between(0, availableChoices.length - 1);
      choices.push(availableChoices.splice(randomIndex, 1)[0]);
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
        this.playerStats[upgrade.stat] += upgrade.value;

        if (upgrade.stat === 'maxHpBonus') {
          this.playerMaxHp = CONFIG.player.maxHp + this.playerStats.maxHpBonus;
          this.playerHp = Math.min(this.playerHp + upgrade.value, this.playerMaxHp);
        }
        break;

      case 'instant':
        if (upgrade.stat === 'heal') {
          this.playerHp = Math.min(this.playerHp + upgrade.value, this.playerMaxHp);
          this.showDamageNumber(this.player.x, this.player.y - 50, `+${upgrade.value}`, '#44ff44');
        }
        break;

      case 'weapon_unlock':
        this.unlockWeapon(upgrade.weaponId);
        break;
    }

    this.drawHealthBar();
    this.updateHud();
  }

  getAvailableWeaponUnlockChoices() {
    return Object.values(CONFIG.weapons.definitions)
      .filter(definition => !this.weaponState.has(definition.id))
      .map(definition => ({
        id: `unlock_${definition.id}`,
        name: `Unlock ${definition.name}`,
        description: definition.unlockDescription,
        type: 'weapon_unlock',
        weaponId: definition.id,
        icon: definition.icon,
      }));
  }

  unlockWeapon(weaponId) {
    if (this.weaponState.has(weaponId) || this.weapons.length >= CONFIG.weapons.slots) return;

    const weapon = this.createWeaponInstance(weaponId);
    if (!weapon) return;

    this.weaponState.set(weaponId, weapon.stats);
    this.weapons.push(weapon);
    this.updateHud();
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

    if (this.isPauseMenuOpen) {
      this.hidePauseMenu();
    }

    if (this.pendingLevelUps > 0) {
      this.pendingLevelUps--;
      this.time.delayedCall(100, () => this.showUpgradeMenu());
      return;
    }

    if (this.pendingStore) {
      this.pendingStore = false;
      this.showStore();
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
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escapeKey.on('down', () => {
      if (this.isUpgradeMenuOpen || this.isStoreOpen) {
        return;
      }
      if (this.isPauseMenuOpen) {
        this.hidePauseMenu();
      } else {
        this.showPauseMenu();
      }
    });
  }

  initializeCombatLoadout(starterWeaponId) {
    this.weapons = [];
    this.abilities = [];
    this.weaponState.clear();
    this.abilityState.clear();

    if (starterWeaponId) {
      this.unlockWeapon(starterWeaponId);
    } else {
      CONFIG.weapons.starter.forEach(weaponId => {
        this.unlockWeapon(weaponId);
      });
    }

    CONFIG.abilities.starter.forEach(abilityId => {
      this.unlockAbility(abilityId);
    });
  }

  unlockAbility(abilityId) {
    if (this.abilityState.has(abilityId)) return;

    const ability = this.createAbilityInstance(abilityId);
    if (!ability) return;

    this.abilityState.set(abilityId, ability.stats);
    this.abilities.push(ability);
    this.updateHud();
  }

  createWeaponInstance(weaponId) {
    const definition = CONFIG.weapons.definitions[weaponId];
    if (!definition) return null;

    const stats = structuredClone(definition.baseStats);

    switch (definition.category) {
      case 'melee':
        return new KnifeWeapon(this, definition, stats);
      case 'ranged':
        return new FirearmWeapon(this, definition, stats);
      default:
        return null;
    }
  }

  createAbilityInstance(abilityId) {
    const definition = CONFIG.abilities.definitions[abilityId];
    if (!definition) return null;

    const stats = structuredClone(definition.baseStats);

    switch (abilityId) {
      case 'damageAura':
        return new DamageAuraAbility(this, definition, stats);
      default:
        return null;
    }
  }

  startWave() {
    this.isWaveActive = true;
    this.isPaused = false;
    this.enemiesSpawned = 0;
    this.timeRemaining = CONFIG.waves.duration;
    this.currentWaveEnemyStats = this.getEnemyStatsForWave(this.currentWave);

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
    const enemy = new Enemy(this, pos.x, pos.y, this.currentWaveEnemyStats);
    this.enemies.push(enemy);
    this.enemiesSpawned++;
  }

  getEnemyStatsForWave(waveNumber) {
    const waveIndex = Math.max(waveNumber - 1, 0);
    const { baseHp, baseSpeed } = CONFIG.enemy;
    const { healthGrowth, healthExponent, speedGrowth, speedExponent } = CONFIG.waves.enemyScaling;

    const healthMultiplier = 1 + (healthGrowth * Math.pow(waveIndex, healthExponent));
    const speedMultiplier = 1 + (speedGrowth * Math.pow(waveIndex, speedExponent));

    return {
      hp: Math.round(baseHp * healthMultiplier),
      speed: Math.round(baseSpeed * speedMultiplier),
    };
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

    const crystalsEarned = this.convertScoreToCrystals();
    this.pendingStore = true;

    if (this.currentWave >= CONFIG.waves.count) {
      this.showVictory(crystalsEarned);
    } else {
      this.showWaveComplete(crystalsEarned);
    }
  }

  clearEnemies() {
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
  }

  clearWeapons() {
    this.weapons.forEach(weapon => weapon.destroy());
    this.weapons = [];
  }

  clearAbilities() {
    this.abilities.forEach(ability => ability.destroy());
    this.abilities = [];
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

  showWaveComplete(crystalsEarned = 0) {
    const crystalText = crystalsEarned > 0 ? `+${crystalsEarned} crystals` : 'No crystals earned';
    this.showOverlay('Wave Complete!', crystalText, '#44ff44');

    this.time.delayedCall(600, () => {
      if (this.isStoreOpen || !this.pendingStore) return;
      this.hideOverlay();
      this.showStore();
    });
  }

  showVictory(crystalsEarned = 0) {
    const subtitle = `Level ${this.playerLevel} | Crystals +${crystalsEarned}`;
    this.showOverlay('VICTORY!', subtitle, '#ffdd44', true);
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

    this.clearWeapons();
    this.clearAbilities();
    
    this.showOverlay(
      'GAME OVER',
      `Level ${this.playerLevel} | Score: ${this.score}`,
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
    if (this.isPaused) return;

    this.handlePlayerMovement();
    this.updateEnemies(delta);
    this.updateWeapons(delta);
    this.updateAbilities(delta);
    this.updateXpGems(delta);
    this.checkPlayerEnemyCollision();
    this.updateDamageNumbers(delta);
    this.checkWaveCleared();
    this.updateHud();
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

  updateAbilities(delta) {
    this.abilities.forEach(ability => {
      ability.update(this.player, this.enemies, delta);
    });
  }

  getNearestEnemyInSight(x, y) {
    const sightRadius = CONFIG.player.sightRadius * this.playerStats.sightMultiplier;
    let nearestEnemy = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    this.enemies.forEach(enemy => {
      if (!enemy.active) return;

      const distance = Math.sqrt(
        Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2)
      );

      if (distance <= sightRadius && distance <= nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    return nearestEnemy;
  }

  updateHud() {
    if (!this.weaponHudText || !this.itemHudText) return;

    const weaponLines = this.weapons.map(weapon => {
      if (weapon.category === 'ranged') {
        const mag = weapon.stats.magazineSize;
        const ammo = weapon.ammoInMagazine ?? mag;
        const reloading = weapon.reloadRemaining > 0;
        const reloadText = reloading ? ` (Reload ${Math.ceil(weapon.reloadRemaining / 100) / 10}s)` : '';
        return `${weapon.definition.icon} ${weapon.name} ${ammo}/${mag}${reloadText}`;
      }

      const countText = weapon.stats.count ? ` x${weapon.stats.count}` : '';
      return `${weapon.definition.icon} ${weapon.name}${countText}`;
    });

    this.weaponHudText.setText(weaponLines.length ? weaponLines : ['No weapons']);

    const itemLines = [];

    const statDisplay = {
      damageMultiplier: { label: 'Damage', format: v => `${Math.round((v - 1) * 100)}%` },
      speedMultiplier: { label: 'Speed', format: v => `${Math.round((v - 1) * 100)}%` },
      xpMagnetMultiplier: { label: 'XP Magnet', format: v => `${Math.round((v - 1) * 100)}%` },
      damageReduction: { label: 'Armor', format: v => `${Math.round(v * 100)}%` },
      sightMultiplier: { label: 'Sight', format: v => `${Math.round((v - 1) * 100)}%` },
      maxHpBonus: { label: 'Max HP', format: v => `+${v}` },
    };

    Object.entries(statDisplay).forEach(([key, meta]) => {
      const value = this.playerStats[key];
      if ((key === 'damageReduction' && value <= 0) || (key !== 'damageReduction' && value <= (key === 'maxHpBonus' ? 0 : 1))) {
        return;
      }
      itemLines.push(`${meta.label}: ${meta.format(value)}`);
    });

    if (this.abilities.length) {
      this.abilities.forEach(ability => {
        itemLines.push(`${ability.definition.icon} ${ability.name}`);
      });
    }

    this.itemHudText.setText(itemLines.length ? itemLines : ['No bonuses']);

    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
    if (this.crystalText) {
      this.crystalText.setText(`Crystals: ${this.crystals}`);
    }
  }

  showStore() {
    this.isStoreOpen = true;
    this.isPaused = true;
    if (this.waveTimer) this.waveTimer.paused = true;
    if (this.spawnTimer) this.spawnTimer.paused = true;

    this.storeBg.setVisible(true);
    this.storeTitle.setVisible(true);
    this.storeSubtitle.setVisible(true);
    this.storeContinueButton.container.setVisible(true);

    this.clearStoreCards();
    this.generateStoreChoices();
  }

  showPauseMenu() {
    if (this.isPauseMenuOpen) return;

    this.isPauseMenuOpen = true;
    this.isPaused = true;
    if (this.waveTimer) this.waveTimer.paused = true;
    if (this.spawnTimer) this.spawnTimer.paused = true;

    this.pauseMenuBg.setVisible(true);
    this.pauseMenuTitle.setVisible(true);
    this.pauseMenuSubtitle.setVisible(true);
    this.pauseRestartButton.container.setVisible(true);
    this.pauseStatsBg.setVisible(true);
    this.pauseStatsTitle.setVisible(true);
    this.pauseWeaponsText.setVisible(true);
    this.pauseItemsText.setVisible(true);
    this.pauseStatsText.setVisible(true);

    this.updatePauseMenuData();
  }

  hidePauseMenu() {
    this.closePauseConfirm();
    this.pauseMenuBg.setVisible(false);
    this.pauseMenuTitle.setVisible(false);
    this.pauseMenuSubtitle.setVisible(false);
    this.pauseRestartButton.container.setVisible(false);
    this.pauseStatsBg.setVisible(false);
    this.pauseStatsTitle.setVisible(false);
    this.pauseWeaponsText.setVisible(false);
    this.pauseItemsText.setVisible(false);
    this.pauseStatsText.setVisible(false);

    this.isPauseMenuOpen = false;
    this.isPaused = false;
    if (this.waveTimer) this.waveTimer.paused = false;
    if (this.spawnTimer) this.spawnTimer.paused = false;
  }

  openPauseConfirm() {
    if (this.isPauseConfirmOpen) return;
    this.isPauseConfirmOpen = true;

    this.pauseConfirmBg.setVisible(true);
    this.pauseConfirmTitle.setVisible(true);
    this.pauseConfirmSubtitle.setVisible(true);
    this.pauseConfirmYes.container.setVisible(true);
    this.pauseConfirmNo.container.setVisible(true);
  }

  closePauseConfirm() {
    this.isPauseConfirmOpen = false;
    this.pauseConfirmBg.setVisible(false);
    this.pauseConfirmTitle.setVisible(false);
    this.pauseConfirmSubtitle.setVisible(false);
    this.pauseConfirmYes.container.setVisible(false);
    this.pauseConfirmNo.container.setVisible(false);
  }

  updatePauseMenuData() {
    if (!this.pauseWeaponsText || !this.pauseItemsText || !this.pauseStatsText) return;

    const weaponLines = this.weapons.length
      ? this.weapons.map(weapon => `${weapon.definition.icon} ${weapon.name}`)
      : ['No weapons'];
    this.pauseWeaponsText.setText(['Weapons', ...weaponLines]);

    const itemLines = [];
    const statDisplay = {
      damageMultiplier: { label: 'Damage', format: v => `${Math.round((v - 1) * 100)}%` },
      speedMultiplier: { label: 'Speed', format: v => `${Math.round((v - 1) * 100)}%` },
      xpMagnetMultiplier: { label: 'XP Magnet', format: v => `${Math.round((v - 1) * 100)}%` },
      damageReduction: { label: 'Armor', format: v => `${Math.round(v * 100)}%` },
      sightMultiplier: { label: 'Sight', format: v => `${Math.round((v - 1) * 100)}%` },
      maxHpBonus: { label: 'Max HP', format: v => `+${v}` },
    };

    Object.entries(statDisplay).forEach(([key, meta]) => {
      const value = this.playerStats[key];
      if ((key === 'damageReduction' && value <= 0) || (key !== 'damageReduction' && value <= (key === 'maxHpBonus' ? 0 : 1))) {
        return;
      }
      itemLines.push(`${meta.label}: ${meta.format(value)}`);
    });

    if (this.abilities.length) {
      this.abilities.forEach(ability => {
        itemLines.push(`${ability.definition.icon} ${ability.name}`);
      });
    }

    const itemsText = itemLines.length ? itemLines : ['No items'];
    this.pauseItemsText.setText(['Items', ...itemsText]);

    const statsLines = [
      `Level: ${this.playerLevel}`,
      `HP: ${Math.ceil(this.playerHp)}/${this.playerMaxHp}`,
      `Score: ${this.score}`,
      `Crystals: ${this.crystals}`,
      `Sight Radius: ${Math.round(CONFIG.player.sightRadius * this.playerStats.sightMultiplier)}`,
    ];
    this.pauseStatsText.setText(['Stats', ...statsLines]);
  }

  hideStore() {
    this.clearStoreCards();
    this.storeBg.setVisible(false);
    this.storeTitle.setVisible(false);
    this.storeSubtitle.setVisible(false);
    this.storeContinueButton.container.setVisible(false);

    this.isStoreOpen = false;
    this.isPaused = false;
    if (this.waveTimer) this.waveTimer.paused = false;
    if (this.spawnTimer) this.spawnTimer.paused = false;

    if (this.intermissionTimer) this.intermissionTimer.remove();
    this.currentWave++;
    this.startWave();

    this.updateHud();
  }

  clearStoreCards() {
    this.storeCards.forEach(card => {
      card.container.destroy();
      if (card.hitArea) card.hitArea.destroy();
    });
    this.storeCards = [];
  }

  generateStoreChoices() {
    const { itemsPerVisit, pool } = CONFIG.store;
    const available = pool.filter(item => {
      if (item.type === 'weapon_unlock') {
        return !this.weaponState.has(item.weaponId);
      }
      return true;
    });

    const choices = [];
    const working = [...available];
    for (let i = 0; i < Math.min(itemsPerVisit, working.length); i++) {
      const randomIndex = Phaser.Math.Between(0, working.length - 1);
      choices.push(working.splice(randomIndex, 1)[0]);
    }

    const cardW = 260;
    const cardH = 300;
    const spacing = 30;
    const totalWidth = (choices.length * cardW) + ((choices.length - 1) * spacing);
    const startX = (CONFIG.game.width - totalWidth) / 2 + cardW / 2;
    const y = CONFIG.game.height / 2 + 20;

    choices.forEach((item, index) => {
      const x = startX + index * (cardW + spacing);
      const card = this.createStoreCard(x, y, cardW, cardH, item);
      this.storeCards.push(card);
    });
  }

  createStoreCard(x, y, w, h, item) {
    const container = this.add.container(x, y);
    container.setDepth(270);

    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a4e, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(3, 0x6a6a9e, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    container.add(bg);

    const icon = this.add.text(0, -h / 2 + 55, item.icon, { fontSize: '48px' });
    icon.setOrigin(0.5, 0.5);
    container.add(icon);

    const title = this.add.text(0, -h / 2 + 110, item.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: w - 20 },
    });
    title.setOrigin(0.5, 0.5);
    container.add(title);

    const desc = this.add.text(0, -h / 2 + 165, item.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center',
      wordWrap: { width: w - 30 },
    });
    desc.setOrigin(0.5, 0.5);
    container.add(desc);

    const price = this.add.text(0, h / 2 - 40, `Price: ${item.price}💎`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#44ffdd',
      fontStyle: 'bold',
    });
    price.setOrigin(0.5, 0.5);
    container.add(price);

    const hitArea = this.add.rectangle(x, y, w, h, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x3a3a5e, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      bg.lineStyle(3, 0xffdd44, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a2a4e, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      bg.lineStyle(3, 0x6a6a9e, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    });

    hitArea.setDepth(271);

    hitArea.on('pointerdown', () => {
      this.purchaseStoreItem(item);
    });

    return { container, bg, hitArea };
  }

  purchaseStoreItem(item) {
    if (this.crystals < item.price) {
      return;
    }

    if (item.type === 'weapon_unlock') {
      if (this.weaponState.has(item.weaponId)) return;
      this.crystals -= item.price;
      this.unlockWeapon(item.weaponId);
    } else if (item.type === 'stat') {
      this.crystals -= item.price;
      this.playerStats[item.stat] += item.value;

      if (item.stat === 'maxHpBonus') {
        this.playerMaxHp = CONFIG.player.maxHp + this.playerStats.maxHpBonus;
        this.playerHp = Math.min(this.playerHp, this.playerMaxHp);
      }
    }

    this.updateHud();
    this.generateStoreChoices();
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

  updateScoreInOverlay(title, subtitle) {
    if (!this.overlayTitle || !this.overlaySubtitle) return;

    this.overlayTitle.setText(title);
    this.overlaySubtitle.setText(subtitle);
    this.overlayTitle.setVisible(true);
    this.overlaySubtitle.setVisible(true);
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
      this.addScore(enemy.scoreValue);
    }
  }

  spawnXpGem(x, y, value) {
    const gem = new XpGem(this, x, y, value);
    this.xpGems.push(gem);
  }

  addScore(amount) {
    this.score += amount;
  }

  convertScoreToCrystals() {
    const crystalsEarned = Math.floor(this.score / CONFIG.score.pointsPerCrystal);
    if (crystalsEarned > 0) {
      this.crystals += crystalsEarned;
      this.score -= crystalsEarned * CONFIG.score.pointsPerCrystal;
    }
    return crystalsEarned;
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
