
import {Projectile, ProjectileSpec} from "./projectile";
import {Vector} from "../simulator/vector";
import {WorldObject} from "../simulator/world_object";
import {Complex} from "../simulator/complex";

export interface WeaponSpec {
    reloadTime: number;
    muzzleSpeed: number;
    projectileSpec: ProjectileSpec;
}

export class Weapon {
    lastFireTime: number;
    currentTime: number;

    spec: WeaponSpec;

    object: WorldObject;
    localPosition: Vector;
    localRotation: Complex;

    // TODO(davidw): Figure out how we're going to delete these...
    constructor(spec: WeaponSpec, o: WorldObject, p: Vector, rotation: Complex) {
        // On creation, we register this as the lastFireTime
        this.lastFireTime = 0;
        this.currentTime = 0;
        this.spec = spec;

        this.object = o;
        this.localPosition = p;
        this.localRotation = rotation;
    }

    fire(dt: number): Projectile | null {
        this.currentTime += dt;
        // Check if we're still reloading
        if (this.currentTime - this.lastFireTime < this.spec.reloadTime) {
            return null;
        }
        this.lastFireTime = this.currentTime;

        // Spawn a new projectile
        let r = this.localRotation.rotate(this.object.rotation);
        r.normalize();
        return new Projectile(
            this.object.translateLocalPoint(this.localPosition),
            r,
            this.spec.muzzleSpeed,
            this.spec.projectileSpec,
        )
    }
}