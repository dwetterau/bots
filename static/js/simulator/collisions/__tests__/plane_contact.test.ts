import {Vector} from "../../vector";
import {Disc} from "../../objects/disc";
import {Plane} from "../../objects/plane";
import {planeToDiscContact} from "../plane_contact";
import {equalN, equalV} from "../../__tests__/helpers";

test("planeToDisc no contact", () => {
    let p1 = new Vector(1, 2);

    let d1 = new Disc(p1, 0, .9);
    let plane = new Plane(
        new Vector(1, 1),
        new Vector(0, 1),
        10,
    );
    expect(planeToDiscContact(plane, d1)).toEqual([]);
});

test("planeToDisc vertical", () => {
    let p1 = new Vector(1, 2);

    let d1 = new Disc(p1, 0, 1.2);
    let plane = new Plane(
        new Vector(5, 1),
        new Vector(0, 1),
        10,
    );

    let contact = planeToDiscContact(plane, d1)[0];
    expect(equalV(contact.contactNormal, new Vector(0, -1))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1, 0.8))).toBeTruthy();
    expect(equalN(contact.penetration, .2)).toBeTruthy();
});

test("planeToDisc horizontal", () => {
    let p1 = new Vector(2, 1);

    let d1 = new Disc(p1, 0, 1.2);
    let plane = new Plane(
        new Vector(1, 5),
        new Vector(1, 0),
        10,
    );

    let contact = planeToDiscContact(plane, d1)[0];
    expect(equalV(contact.contactNormal, new Vector(-1, 0))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(0.8, 1))).toBeTruthy();
    expect(equalN(contact.penetration, .2)).toBeTruthy();
});
