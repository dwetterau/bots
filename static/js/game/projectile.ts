import {Assembly} from "../simulator/assembly";
import {Vector} from "../simulator/vector";
import {Disc} from "../simulator/objects/disc";
import {Box} from "../simulator/objects/box";
import {WorldObject} from "../simulator/world_object";
import {Joint} from "../simulator/collisions/joint";
import {Complex} from "../simulator/complex";

export interface ProjectileSpec {
    height: number;
    length: number;
}

export class Projectile extends Assembly {

    constructor(spawnPosition: Vector,  rotation: Complex, speed: number, spec: ProjectileSpec) {
        super();
        this.validateSpec(spec);

        let boxLength = spec.length - (spec.height / 2);
        let objects: Array<WorldObject> = [
            new Box(
                new Vector(spawnPosition.a + boxLength / 2, spawnPosition.b),
                0.1, // mass
                boxLength / 2, // halfX
                spec.height / 2, // halfY
            ),
            new Disc(
                new Vector(spawnPosition.a + boxLength, spawnPosition.b),
                0.1, // mass
                spec.height / 2, // radius
            ),
        ];

        for (let o of objects) {
            o.velocity = Vector.fromRotation(rotation).scale(speed);
        }
        this.setObjects(objects);
        if (objects.length > 1) {
            this.setJoints([new Joint(
                0.1, // threshold
                objects[0],
                new Vector(boxLength / 2, 0),
                objects[1],
                new Vector(0, 0),
            )])
        }
    }

    validateSpec(spec: ProjectileSpec) {
        if (spec.length < spec.height) {
            throw Error("Projectiles must be longer than they are tall")
        }
    }
}