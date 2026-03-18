import { Weapon } from './Weapon.js';

export class FirearmWeapon extends Weapon {
  constructor(scene, definition, stats) {
    super(scene, definition, stats);

    this.cooldownRemaining = 0;
    this.reloadRemaining = 0;
    this.ammoInMagazine = stats.magazineSize;
    this.graphics = scene.add.graphics();
    this.tracers = [];
  }

  update(player, enemies, delta) {
    if (!this.active) return;

    this.updateTimers(delta);
    this.drawTracers();

    if (this.reloadRemaining > 0 || this.cooldownRemaining > 0) {
      return;
    }

    const target = this.scene.getNearestEnemyInSight(player.x, player.y);
    if (!target) return;

    if (this.ammoInMagazine <= 0) {
      this.startReload();
      return;
    }

    this.fire(player, target);
  }

  updateTimers(delta) {
    this.cooldownRemaining = Math.max(this.cooldownRemaining - delta, 0);

    if (this.reloadRemaining > 0) {
      this.reloadRemaining = Math.max(this.reloadRemaining - delta, 0);
      if (this.reloadRemaining === 0) {
        this.ammoInMagazine = this.stats.magazineSize;
      }
    }

    this.tracers = this.tracers.filter(tracer => {
      tracer.remaining -= delta;
      return tracer.remaining > 0;
    });
  }

  startReload() {
    if (this.reloadRemaining > 0) return;

    this.reloadRemaining = this.stats.reloadDuration;
  }

  fire(player, target) {
    this.scene.dealDamageToEnemy(target, this.stats.damage);
    this.cooldownRemaining = this.stats.attackCooldown;
    this.ammoInMagazine -= 1;

    this.tracers.push({
      startX: player.x,
      startY: player.y,
      endX: target.x,
      endY: target.y,
      remaining: this.stats.tracerDuration,
      duration: this.stats.tracerDuration,
    });

    if (this.ammoInMagazine <= 0) {
      this.startReload();
    }
  }

  drawTracers() {
    this.graphics.clear();

    this.tracers.forEach(tracer => {
      const alpha = tracer.remaining / tracer.duration;
      this.graphics.lineStyle(this.stats.tracerWidth, this.definition.visuals.tracerColor, alpha);
      this.graphics.lineBetween(tracer.startX, tracer.startY, tracer.endX, tracer.endY);
    });
  }

  destroy() {
    this.graphics.destroy();
  }
}
