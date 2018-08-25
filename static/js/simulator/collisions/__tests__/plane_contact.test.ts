import {Vector} from "../../vector";
import {Disc} from "../../objects/disc";
import {Plane} from "../../objects/plane";
import {planeToBoxContact, planeToDiscContact} from "../plane_contact";
import {equalN, equalV} from "../../__tests__/helpers";
import {Box} from "../../objects/box";
import {Complex} from "../../complex";

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

test("planeToBox no contact", () => {
    let b = new Box(new Vector(1.1, 1.1), 0, 1, 1);
    let plane = new Plane(
        new Vector(5, 0),
        new Vector(0, 1),
        10,
    );
    expect(planeToBoxContact(plane, b)).toEqual([]);
});

test("planeToBox vertical", () => {
    let b = new Box(new Vector(1.1, 1.1), 0, 1, 1);
    let plane = new Plane(
        new Vector(0, 1),
        new Vector(0, 1),
        10,
    );

    let contacts = planeToBoxContact(plane, b);
    expect(equalV(contacts[0].contactNormal, new Vector(0, -1))).toBeTruthy();
    expect(equalV(contacts[0].contactPoint, new Vector(0.1, 0.1))).toBeTruthy();
    expect(equalN(contacts[0].penetration, 0.9)).toBeTruthy();

    expect(equalV(contacts[1].contactNormal, new Vector(0, -1))).toBeTruthy();
    expect(equalV(contacts[1].contactPoint, new Vector(2.1, 0.1))).toBeTruthy();
    expect(equalN(contacts[1].penetration, 0.9)).toBeTruthy();
});

test("planeToBox one point", () => {
    let b = new Box(new Vector(1, 1), 0, 1, 1);
    b.rotation = Complex.fromRotation(Math.PI / 4);
    let plane = new Plane(
        new Vector(5, 0),
        new Vector(0, 1),
        10,
    );

    let contacts = planeToBoxContact(plane, b);
    expect(contacts.length).toEqual(1);
    let contact = contacts[0];
    expect(equalV(contact.contactNormal, new Vector(0, -1))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1, 1 - Math.sqrt(2)))).toBeTruthy();
    expect(equalN(contact.penetration, Math.sqrt(2) - 1)).toBeTruthy();
});

test("planeToBox angled plane", () => {
    let b = new Box(new Vector(1, 1), 0, 1, 1);
    let planeNormal = Vector.fromRotation(Complex.fromRotation(5 * Math.PI / 4));
    let plane = new Plane(
        new Vector(1.5, 1.5),
        planeNormal,
        10,
    );

    let contacts = planeToBoxContact(plane, b);
    expect(contacts.length).toEqual(1);
    let contact = contacts[0];
    expect(equalV(contact.contactNormal, planeNormal.reverse())).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(2, 2))).toBeTruthy();
    expect(equalN(contact.penetration, 1 / Math.sqrt(2))).toBeTruthy();
});
