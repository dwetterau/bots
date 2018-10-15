import {WorldObject} from "../../world_object";
import {Vector} from "../../vector";
import {
    calculateContactVelocity,
    calculateDesiredDeltaVelocity,
    computeContactToWorld, PreparedContact
} from "../contact_resolver";
import {equalM, equalN, equalV} from "../../__tests__/helpers";
import {Contact} from "../contact_generator";
import {World} from "../../world";
import {Matrix} from "../../matrix";

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
    let mockWorld: any = {
        Restitution: .4,
        VelocityLimit: .25,
    };
    let v = calculateDesiredDeltaVelocity(mockWorld, new Vector(2, 12), 0.0);
    expect(equalN(v, -2.8)).toBeTruthy();
    v = calculateDesiredDeltaVelocity(mockWorld, new Vector(.24, 12), 0.0);
    expect(equalN(v, -.24)).toBeTruthy();
});

test("PreparedContact constructor", () => {
    let o1 = new WorldObject(new Vector(0, 0), 0.0);
    o1.velocity = new Vector(1 / Math.sqrt(2), 1 / Math.sqrt(2));
    o1.angularVelocity = Math.PI / 4;

    let o2 = new WorldObject(new Vector(1, 0), 0.0);
    o2.velocity = new Vector(0, 0);
    o2.angularVelocity = 0;

    let world = new World(0, 0);
    world.addObject(o1);
    world.addObject(o2);

    let contact: Contact = {
        data: {
            contactPoint: new Vector(0, 0),
            contactNormal: new Vector(1, 0),
            penetration: 0,
        },
        object1Id: o1.id,
        object2Id: o2.id,
    };
    let p = new PreparedContact(contact, world, 0);
    expect(equalM(p.contactToWorld, new Matrix(1, 0, 0, 1))).toBeTruthy();
    expect(equalV(p.relativeContactPosition[0], new Vector(0, 0))).toBeTruthy();
    expect(equalV(p.relativeContactPosition[1], new Vector(-1, 0))).toBeTruthy();
    expect(equalV(p.contactVelocity, new Vector(1/Math.sqrt(2), 1/Math.sqrt(2)))).toBeTruthy();
    expect(equalN(p.desiredDeltaVelocity, -1.4 / Math.sqrt(2)));
});
