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
    sightRadius: 80,
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
    enemyScaling: {
      healthGrowth: 0.38,
      healthExponent: 1.4,
      speedGrowth: 0.06,
      speedExponent: 1.25,
    },
  },

  enemy: {
    baseSpeed: 78,
    radius: 12,
    color: 0xff4444,
    borderColor: 0xaa2222,
    borderThickness: 2,
    spawnDistance: 50,
    baseHp: 15,
    damage: 10,
    scoreValue: 10,
    xpValue: 1,
  },

  score: {
    pointsPerCrystal: 20,
  },

  spawn: {
    intervalMin: 500,
    intervalMax: 1500,
  },

  weapons: {
    slots: 6,
    starter: [],
    definitions: {
      knife: {
        id: 'knife',
        name: 'Knife',
        type: 'weapon',
        category: 'melee',
        icon: '🔪',
        unlockDescription: 'Orbiting blades that shred enemies up close',
        baseStats: {
          count: 2,
          damage: 10,
          orbitRadius: 60,
          rotationSpeed: 3,
          knifeLength: 25,
          knifeWidth: 6,
          hitCooldown: 300,
        },
        visuals: {
          color: 0xcccccc,
          borderColor: 0x888888,
        },
      },
      pistol: {
        id: 'pistol',
        name: 'Pistol',
        type: 'weapon',
        category: 'ranged',
        icon: '🔫',
        unlockDescription: 'Balanced sidearm with steady damage and a 12-round magazine',
        baseStats: {
          damage: 12,
          attackCooldown: 450,
          magazineSize: 12,
          reloadDuration: 1400,
          tracerDuration: 90,
          tracerWidth: 3,
        },
        visuals: {
          tracerColor: 0xffe082,
        },
      },
      revolver: {
        id: 'revolver',
        name: 'Revolver',
        type: 'weapon',
        category: 'ranged',
        icon: '🤠',
        unlockDescription: 'Hard-hitting sidearm with 6 shots and a slow reload',
        baseStats: {
          damage: 22,
          attackCooldown: 500,
          magazineSize: 6,
          reloadDuration: 2200,
          tracerDuration: 110,
          tracerWidth: 4,
        },
        visuals: {
          tracerColor: 0xffb74d,
        },
      },
      smg: {
        id: 'smg',
        name: 'SMG',
        type: 'weapon',
        category: 'ranged',
        icon: '💥',
        unlockDescription: 'Fast spray weapon with low damage and a 25-round magazine',
        baseStats: {
          damage: 5,
          attackCooldown: 140,
          magazineSize: 25,
          reloadDuration: 1700,
          tracerDuration: 70,
          tracerWidth: 2,
        },
        visuals: {
          tracerColor: 0xfff176,
        },
      },
    },
  },

  abilities: {
    starter: [],
    definitions: {
      damageAura: {
        id: 'damageAura',
        name: 'Damage Aura',
        type: 'ability',
        icon: '✨',
        baseStats: {
          damage: 5,
          radius: 80,
          tickInterval: 200,
        },
        visuals: {
          color: 0x88ff88,
          alpha: 0.3,
        },
      },
    },
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
        id: 'sight_up',
        name: '+20% Sight',
        description: 'Auto-attack enemies from farther away',
        type: 'stat',
        stat: 'sightMultiplier',
        value: 0.2,
        icon: '👁️',
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

  store: {
    itemsPerVisit: 5,
    pool: [
      {
        id: 'store_weapon_knife',
        name: 'Knife',
        description: 'Add the knife to your arsenal',
        type: 'weapon_unlock',
        weaponId: 'knife',
        price: 4,
        icon: '🔪',
      },
      {
        id: 'store_weapon_pistol',
        name: 'Pistol',
        description: 'Unlock the balanced pistol',
        type: 'weapon_unlock',
        weaponId: 'pistol',
        price: 6,
        icon: '🔫',
      },
      {
        id: 'store_weapon_revolver',
        name: 'Revolver',
        description: 'Unlock the high-damage revolver',
        type: 'weapon_unlock',
        weaponId: 'revolver',
        price: 8,
        icon: '🤠',
      },
      {
        id: 'store_weapon_smg',
        name: 'SMG',
        description: 'Unlock the rapid-fire SMG',
        type: 'weapon_unlock',
        weaponId: 'smg',
        price: 7,
        icon: '💥',
      },
      {
        id: 'store_damage_boost',
        name: 'Damage Boost',
        description: '+20% weapon damage',
        type: 'stat',
        stat: 'damageMultiplier',
        value: 0.2,
        price: 5,
        icon: '⚔️',
      },
      {
        id: 'store_speed_boost',
        name: 'Speed Boots',
        description: '+15% move speed',
        type: 'stat',
        stat: 'speedMultiplier',
        value: 0.15,
        price: 4,
        icon: '👟',
      },
      {
        id: 'store_armor_plating',
        name: 'Armor Plating',
        description: '-10% damage taken',
        type: 'stat',
        stat: 'damageReduction',
        value: 0.1,
        price: 5,
        icon: '🛡️',
      },
      {
        id: 'store_sight_upgrade',
        name: 'Targeting Chip',
        description: '+20% sight range',
        type: 'stat',
        stat: 'sightMultiplier',
        value: 0.2,
        price: 3,
        icon: '👁️',
      },
      {
        id: 'store_health_upgrade',
        name: 'Vitality Core',
        description: '+20 max HP',
        type: 'stat',
        stat: 'maxHpBonus',
        value: 20,
        price: 4,
        icon: '❤️',
      },
    ],
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
