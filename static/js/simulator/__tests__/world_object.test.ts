import {WorldObject} from "../world_object";
import {Vector} from "../vector";
import {equalV} from "./helpers";

test("velocityAtPoint", () => {
    let o = new WorldObject(new Vector(0, 0), 0);

    o.velocity = new Vector(2, 3);
    o.angularVelocity = Math.PI / 4;

    let localPoint = new Vector(3, 4);
    let tangentV = new Vector(-4, 3);
    tangentV.normalize();
    tangentV.scaleInPlace(localPoint.magnitude() * o.angularVelocity);
    tangentV.addInPlace(o.velocity);
    expect(equalV(o.velocityAtPoint(localPoint), tangentV)).toBeTruthy()
});