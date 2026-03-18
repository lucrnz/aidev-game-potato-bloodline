import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class WeaponSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WeaponSelectScene' });
  }

  create() {
    const { width, height } = CONFIG.game;
    const cx = width / 2;

    this.add.graphics()
      .fillStyle(0x1a1a2e, 1)
      .fillRect(0, 0, width, height);

    this.add.text(cx, 80, 'POTATO BLOODLINE', {
      fontSize: '52px',
      fontFamily: 'Arial',
      color: '#f4a460',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.add.text(cx, 140, 'Choose your starting weapon', {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5, 0.5);

    const weaponIds = ['knife', 'pistol', 'smg', 'revolver'];
    const cardW = 240;
    const cardH = 340;
    const spacing = 30;
    const totalW = (weaponIds.length * cardW) + ((weaponIds.length - 1) * spacing);
    const startX = (width - totalW) / 2 + cardW / 2;
    const cardY = height / 2 + 30;

    weaponIds.forEach((id, index) => {
      const def = CONFIG.weapons.definitions[id];
      const x = startX + index * (cardW + spacing);
      this.createWeaponCard(x, cardY, cardW, cardH, def);
    });
  }

  createWeaponCard(x, y, w, h, def) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    this.drawCardBg(bg, w, h, 0x2a2a4e, 0x6a6a9e, 3);
    container.add(bg);

    const icon = this.add.text(0, -h / 2 + 55, def.icon, { fontSize: '52px' });
    icon.setOrigin(0.5, 0.5);
    container.add(icon);

    const title = this.add.text(0, -h / 2 + 115, def.name, {
      fontSize: '24px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    container.add(title);

    const categoryLabel = def.category === 'melee' ? 'Melee' : 'Ranged';
    const catColor = def.category === 'melee' ? '#ff9944' : '#44bbff';
    const cat = this.add.text(0, -h / 2 + 145, categoryLabel, {
      fontSize: '14px', fontFamily: 'Arial', color: catColor, fontStyle: 'bold',
    });
    cat.setOrigin(0.5, 0.5);
    container.add(cat);

    const statsLines = this.getStatsDescription(def);
    const desc = this.add.text(0, -h / 2 + 200, statsLines, {
      fontSize: '14px', fontFamily: 'Arial', color: '#cccccc',
      wordWrap: { width: w - 30 }, align: 'center', lineSpacing: 4,
    });
    desc.setOrigin(0.5, 0.5);
    container.add(desc);

    const flavor = this.add.text(0, h / 2 - 40, def.unlockDescription, {
      fontSize: '12px', fontFamily: 'Arial', color: '#888888',
      wordWrap: { width: w - 30 }, align: 'center', fontStyle: 'italic',
    });
    flavor.setOrigin(0.5, 0.5);
    container.add(flavor);

    const hitArea = this.add.rectangle(x, y, w, h, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      this.drawCardBg(bg, w, h, 0x3a3a5e, 0xffdd44, 4);
    });

    hitArea.on('pointerout', () => {
      this.drawCardBg(bg, w, h, 0x2a2a4e, 0x6a6a9e, 3);
    });

    hitArea.on('pointerdown', () => {
      this.scene.start('GameScene', { starterWeaponId: def.id });
    });
  }

  drawCardBg(gfx, w, h, fill, border, thickness) {
    gfx.clear();
    gfx.fillStyle(fill, 1);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    gfx.lineStyle(thickness, border, 1);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
  }

  getStatsDescription(def) {
    const s = def.baseStats;
    if (def.category === 'melee') {
      return `Damage: ${s.damage}\nBlades: ${s.count}\nSpin Speed: ${s.rotationSpeed}`;
    }
    return `Damage: ${s.damage}\nFire Rate: ${Math.round(1000 / s.attackCooldown * 10) / 10}/s\nMag: ${s.magazineSize}\nReload: ${(s.reloadDuration / 1000).toFixed(1)}s`;
  }
}
