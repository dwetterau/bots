import {WorldObject} from "../../world_object";
import {Vector} from "../../vector";
import {calculateContactVelocity, computeContactToWorld} from "../contact_resolver";
import {equalV} from "../../__tests__/helpers";

test("computeContactToWorld", () => {
    let worldNormal = new Vector(3, 4);
    worldNormal.normalize();
    let contactToWorld = computeContactToWorld(worldNormal);

    let contactVector = new Vector(1, 1);
    let x = contactToWorld.transform(contactVector);
    expect(equalV(x, new Vector(-0.2, 1.4))).toBeTruthy();

    // Check that it can transform back.
    let y = contactToWorld.transformTranspose(x);
    expect(equalV(y, contactVector)).toBeTruthy();
});

test("calculateContactVelocity", () => {
    let o = new WorldObject(new Vector(0, 0), 0.0);
    o.velocity = new Vector(1 / Math.sqrt(2), 1 / Math.sqrt(2));
    o.angularVelocity = Math.PI / 4;
    // Use the identity matrix for simplicity
    let contactToWorld = computeContactToWorld(new Vector(1, 0));
    let v = calculateContactVelocity(new Vector(0, 1), contactToWorld, o, 0.0);

    let expectedLocalV = o.velocity.add(new Vector(-1, 0).scale(o.angularVelocity));
    expect(equalV(v, expectedLocalV)).toBeTruthy();

    // Now make sure the matrix also does something
    o.angularVelocity = 0;
    o.velocity = new Vector(-0.2, 1.4);
    let worldNormal = new Vector(3, 4);
    worldNormal.normalize();
    contactToWorld = computeContactToWorld(worldNormal);
    v = calculateContactVelocity(new Vector(0, 0), contactToWorld, o, 0.0);
    expect(equalV(v, new Vector(1, 1))).toBeTruthy();
});

test("calculateDesiredDeltaVelocity", () => {
    // TODO.
});
