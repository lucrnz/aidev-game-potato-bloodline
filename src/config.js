/**
 * POTATO BLOODLINE - CONFIGURATION
 * ================================
 * Change any value here and restart to see instant changes.
 * All game balance, visuals, and mechanics are controlled from this file.
 */

export const CONFIG = {
  game: {
    width: 1280,
    height: 720,
    backgroundColor: '#1a1a2e',
  },

  arena: {
    radius: 300,
    borderColor: 0x4a4a6a,
    borderThickness: 4,
    fillColor: 0x2a2a4e,
  },

  player: {
    speed: 200,
    radius: 20,
    color: 0xf4a460,
    borderColor: 0x8b4513,
    borderThickness: 3,
    maxHp: 100,
    invincibilityDuration: 1000,
  },

  waves: {
    count: 5,
    duration: 60,
    intermissionDuration: 3000,
    enemiesPerWave: [20, 40, 70, 100, 150],
  },

  enemy: {
    speed: 80,
    radius: 12,
    color: 0xff4444,
    borderColor: 0xaa2222,
    borderThickness: 2,
    spawnDistance: 50,
    hp: 10,
    damage: 10,
    xpValue: 1,
  },

  spawn: {
    intervalMin: 500,
    intervalMax: 1500,
  },

  weapons: {
    slots: 6,
  },

  knifeWeapon: {
    name: 'Knife',
    count: 2,
    damage: 10,
    orbitRadius: 60,
    rotationSpeed: 3,
    knifeLength: 25,
    knifeWidth: 6,
    color: 0xcccccc,
    borderColor: 0x888888,
  },

  garlicWeapon: {
    name: 'Garlic Aura',
    damage: 5,
    radius: 80,
    tickInterval: 200,
    color: 0x88ff88,
    alpha: 0.3,
  },

  xpGem: {
    radius: 6,
    color: 0x44ff44,
    borderColor: 0x22aa22,
    borderThickness: 1,
    attractRadius: 50,
    attractSpeed: 300,
    value: 1,
  },

  levelUp: {
    baseXpRequired: 10,
    xpScaling: 1.5,
  },

  damageNumber: {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ff4444',
    duration: 800,
    floatSpeed: -50,
  },

  timer: {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffffff',
  },

  ui: {
    healthBar: {
      width: 200,
      height: 20,
      x: 20,
      y: 20,
      backgroundColor: 0x333333,
      fillColor: 0xff4444,
      borderColor: 0x666666,
      borderThickness: 2,
    },
    xpBar: {
      width: 200,
      height: 12,
      x: 20,
      y: 50,
      backgroundColor: 0x333333,
      fillColor: 0x44ff44,
      borderColor: 0x666666,
      borderThickness: 1,
    },
  },

  upgrades: {
    choicesCount: 3,
    pool: [
      {
        id: 'damage_up',
        name: '+25% Damage',
        description: 'All weapons deal more damage',
        type: 'stat',
        stat: 'damageMultiplier',
        value: 0.25,
        icon: '⚔️',
      },
      {
        id: 'speed_up',
        name: '+15% Move Speed',
        description: 'Move faster around the arena',
        type: 'stat',
        stat: 'speedMultiplier',
        value: 0.15,
        icon: '👟',
      },
      {
        id: 'max_hp_up',
        name: '+20 Max HP',
        description: 'Increase maximum health',
        type: 'stat',
        stat: 'maxHpBonus',
        value: 20,
        icon: '❤️',
      },
      {
        id: 'heal',
        name: 'Heal 30 HP',
        description: 'Restore health immediately',
        type: 'instant',
        stat: 'heal',
        value: 30,
        icon: '💚',
      },
      {
        id: 'knife_count',
        name: '+1 Knife',
        description: 'Add an extra orbiting knife',
        type: 'weapon_upgrade',
        weapon: 'knife',
        stat: 'count',
        value: 1,
        icon: '🔪',
      },
      {
        id: 'knife_damage',
        name: '+50% Knife Damage',
        description: 'Knives hit harder',
        type: 'weapon_upgrade',
        weapon: 'knife',
        stat: 'damage',
        value: 0.5,
        isMultiplier: true,
        icon: '🗡️',
      },
      {
        id: 'knife_speed',
        name: '+30% Knife Speed',
        description: 'Knives spin faster',
        type: 'weapon_upgrade',
        weapon: 'knife',
        stat: 'rotationSpeed',
        value: 0.3,
        isMultiplier: true,
        icon: '🌀',
      },
      {
        id: 'garlic_radius',
        name: '+25% Garlic Radius',
        description: 'Larger damage aura',
        type: 'weapon_upgrade',
        weapon: 'garlic',
        stat: 'radius',
        value: 0.25,
        isMultiplier: true,
        icon: '🧄',
      },
      {
        id: 'garlic_damage',
        name: '+50% Garlic Damage',
        description: 'Aura deals more damage',
        type: 'weapon_upgrade',
        weapon: 'garlic',
        stat: 'damage',
        value: 0.5,
        isMultiplier: true,
        icon: '☠️',
      },
      {
        id: 'xp_magnet',
        name: '+50% XP Magnet',
        description: 'Collect XP from further away',
        type: 'stat',
        stat: 'xpMagnetMultiplier',
        value: 0.5,
        icon: '🧲',
      },
      {
        id: 'armor',
        name: '-20% Damage Taken',
        description: 'Reduce incoming damage',
        type: 'stat',
        stat: 'damageReduction',
        value: 0.2,
        icon: '🛡️',
      },
    ],
    ui: {
      cardWidth: 280,
      cardHeight: 320,
      cardSpacing: 40,
      backgroundColor: 0x2a2a4e,
      borderColor: 0x6a6a9e,
      hoverBorderColor: 0xffdd44,
      borderThickness: 3,
      titleFontSize: '22px',
      descFontSize: '16px',
      iconFontSize: '48px',
    },
  },

  screens: {
    gameOver: {
      autoRestartDelay: 5000,
    },
    victory: {
      autoRestartDelay: 5000,
    },
  },
};
