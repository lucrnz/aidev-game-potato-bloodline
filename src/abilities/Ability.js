export class Ability {
  constructor(scene, definition, stats) {
    this.scene = scene;
    this.definition = definition;
    this.stats = stats;
    this.id = definition.id;
    this.name = definition.name;
    this.type = definition.type;
    this.active = true;
  }

  update(player, enemies, delta) {
    
  }

  destroy() {
    
  }
}
