import {WorldObject} from "./world_object";
import {Vector} from "./vector";

export class World {

    // Universal constants
    Gravity = .4;
    Restitution = .8;
    Tolerance = .01;

    // World info
    height: number = 100;
    width: number = 0;
    gravityDirection: Vector = new Vector(0, -1);
    objects: Array<WorldObject> = [];

    constructor(widthToHeightRatio: number) {
        this.width = Math.round(100 * widthToHeightRatio);

        // Make an object for now
        this.objects.push(new WorldObject(
            new Vector(50, 50),
            new Vector(4, 12),
        ))
    }

    moveObjects(timestep: number) {
        let dt = timestep / 1000.0;
        let gravity = this.gravityDirection.scale(this.Gravity);

        // TODO: Collisions with walls and other objects

        for (let object of this.objects) {
            object.updatePosition(dt);
            object.updateVelocity(dt);
            object.setGravity(gravity);
        }
    }
}
