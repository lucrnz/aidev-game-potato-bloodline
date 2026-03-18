export class Weapon {
  constructor(scene, definition, stats) {
    this.scene = scene;
    this.definition = definition;
    this.stats = stats;
    this.id = definition.id;
    this.name = definition.name;
    this.type = definition.type;
    this.category = definition.category;
    this.active = true;
  }

  update(player, enemies, delta) {
    
  }

  destroy() {
    
  }
}
