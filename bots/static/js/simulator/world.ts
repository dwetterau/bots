import {WorldObject} from "./world_object";
import {Vector} from "./vector";
import {Disc} from "./objects/disc";

export class World {

    // Universal constants
    Gravity = 10;
    Restitution = .8;
    Tolerance = .01;

    // World info
    height: number = 100;
    width: number = 0;
    gravityDirection: Vector = new Vector(0, -1);
    objects: Array<WorldObject> = [];

    constructor(widthToHeightRatio: number) {
        this.width = Math.round(100 * widthToHeightRatio);

        // Make a simple disc for now
        this.objects.push(new Disc(
            new Vector(50, 50),
            10, // mass
            5,  // radius
        ));
        this.objects[0].velocity = new Vector(4, 12);
    }

    moveObjects(timestep: number) {
        let dt = timestep / 1000.0;
        let gravity = this.gravityDirection.scale(this.Gravity);

        // TODO: Collisions with walls and other objects

        for (let object of this.objects) {
            object.clearForFrame();

            // Hack to test out a rotation
            if (this.objects[0].position.a == 50 && this.objects[0].position.b == 50) {
                // Force going up at the right edge
                object.accumulateForce(new Vector(0, 10 * 1000), new Vector(55, 50));
            }

            object.accumulateForce(gravity.scale(object.mass), object.position);
            object.setAcceleration();
            object.updateVelocity(dt);
            object.updatePosition(dt);

            object.setAngularAcceleration();
            object.updateAngularVelocity(dt);
            object.updateRotation(dt);
        }
    }

    stats(): Array<string> {
        let stats = ["fps: TODO"];
        for (let object of this.objects) {
            stats.push(
                `p: (${object.position.a.toFixed(2)}, ` +
                `${object.position.b.toFixed(2)}) ` +
                `theta: ${object.rotation.toFixed(3)}`
            )
        }
        return stats;
    }
}
