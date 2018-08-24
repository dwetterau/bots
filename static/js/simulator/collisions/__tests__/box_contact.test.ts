import {Disc} from "../../objects/disc";
import {Vector} from "../../vector";
import {equalN, equalV} from "../../__tests__/helpers";
import {Box} from "../../objects/box";
import {boxToDiscContact} from "../box_contact";
import {Complex} from "../../complex";


test("not in contact", () => {
    let p1 = new Vector(0, 0);
    let p2 = new Vector(0, 2);

    let d = new Disc(p1, 0, 0.5);
    let b = new Box(p2, 0, 0.5, 0.9);

    expect(boxToDiscContact(b, d)).toEqual([]);

    // Box is in the top right and rotated 45 degrees so it doesn't contact
    p1 = new Vector(1, 1);
    d = new Disc(p1, 0, 1);
    p2 = new Vector(2, 2);
    b = new Box(p2, 0, 0.3, 0.3);
    b.rotation = Complex.fromRotation(Math.PI / 4);

    expect(boxToDiscContact(b, d)).toEqual([]);
});

test("vertically aligned", () => {
    let p1 = new Vector(1, 1);
    let p2 = new Vector(1, 2.3);

    let d = new Disc(p1, 0, 1);
    let b = new Box(p2, 0, 0.5, 0.5);

    let contact = boxToDiscContact(b, d)[0];
    expect(equalV(contact.contactNormal, new Vector(0, 1))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1, 1.8))).toBeTruthy();
    expect(equalN(contact.penetration, 0.2)).toBeTruthy();

    // Now rotate it to make it interesting
    let invSqrt2 = 1 / Math.sqrt(2);
    b.rotation = new Complex(invSqrt2, invSqrt2);
    contact = boxToDiscContact(b, d)[0];

    expect(equalV(contact.contactNormal, new Vector(0, 1))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1, 2.3-invSqrt2))).toBeTruthy();
    expect(equalN(contact.penetration, invSqrt2 - .3)).toBeTruthy();
});

test("corner offsets", () => {
    let p1 = new Vector(1, 1);
    let d = new Disc(p1, 0, 1);

    // Box is in the top right
    let p2 = new Vector(2, 2);
    let b = new Box(p2, 0, 0.5, 0.5);

    let contact = boxToDiscContact(b, d)[0];
    let invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(invSqrt2, invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1.5, 1.5))).toBeTruthy();
    expect(equalN(contact.penetration,  1-invSqrt2)).toBeTruthy();

    // Box is in the top left
    p2 = new Vector(0, 2);
    b = new Box(p2, 0, 0.5, 0.5);

    contact = boxToDiscContact(b, d)[0];
    invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(-invSqrt2, invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(0.5, 1.5))).toBeTruthy();
    expect(equalN(contact.penetration,  1-invSqrt2)).toBeTruthy();

    // Box is in the bottom right
    p2 = new Vector(2, 0);
    b = new Box(p2, 0, 0.5, 0.5);

    contact = boxToDiscContact(b, d)[0];
    invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(invSqrt2, -invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1.5, 0.5))).toBeTruthy();
    expect(equalN(contact.penetration,  1-invSqrt2)).toBeTruthy();

    // Box is in the bottom left
    p2 = new Vector(0, 0);
    b = new Box(p2, 0, 0.5, 0.5);

    contact = boxToDiscContact(b, d)[0];
    invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(-invSqrt2, -invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(0.5, 0.5))).toBeTruthy();
    expect(equalN(contact.penetration,  1-invSqrt2)).toBeTruthy();
});
