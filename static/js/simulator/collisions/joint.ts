import {Vector} from "../vector";
import {ContactData} from "./contact_generator";
import {WorldObject} from "../world_object";

export class Joint {

    // Threshold
    threshold: number;

    // References to the attached objects and the relative point on each
    o1: WorldObject;
    p1: Vector;
    o2: WorldObject;
    p2: Vector;

    constructor(threshold: number, o1: WorldObject, p1: Vector, o2: WorldObject, p2: Vector) {
        this.threshold = threshold;
        this.o1 = o1;
        this.p1 = p1;
        this.o2 = o2;
        this.p2 = p2;
    }

    displacementAndP1(): [Vector, Vector] {
        let realWorldP1 = this.o1.translateLocalPoint(this.p1);
        let realWorldP2 = this.o2.translateLocalPoint(this.p2);

        let displacement = realWorldP2.copy();
        displacement.sub(realWorldP1);
        return [displacement, realWorldP1]
    }

    displacement(): Vector {
        return this.displacementAndP1()[0];
    }

    exceedsThreshold(): boolean {
        return this.displacement().squareMagnitude() > this.threshold * this.threshold;
    }

    generateContact(): ContactData {
        let [d, p1] = this.displacementAndP1();
        let penetration = d.magnitude();

        // Normalize
        d.scaleInPlace(1 / penetration);
        return {
            contactNormal: d,
            contactPoint: p1,
            penetration: penetration,
        }
    }
}