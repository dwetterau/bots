import {Disc} from "../../objects/disc";
import {Vector} from "../../vector";
import {equalN, equalV} from "../../__tests__/helpers";
import {Box} from "../../objects/box";
import {boxToBoxContact, boxToDiscContact} from "../box_contact";
import {Complex} from "../../complex";


test("boxToDisc not in contact", () => {
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

test("boxToDisc vertically aligned", () => {
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
    expect(equalV(contact.contactPoint, new Vector(1, 2.3 - invSqrt2))).toBeTruthy();
    expect(equalN(contact.penetration, invSqrt2 - .3)).toBeTruthy();
});

test("boxToDisc corner offsets", () => {
    let p1 = new Vector(1, 1);
    let d = new Disc(p1, 0, 1);

    // Box is in the top right
    let p2 = new Vector(2, 2);
    let b = new Box(p2, 0, 0.5, 0.5);

    let contact = boxToDiscContact(b, d)[0];
    let invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(invSqrt2, invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1.5, 1.5))).toBeTruthy();
    expect(equalN(contact.penetration, 1 - invSqrt2)).toBeTruthy();

    // Box is in the top left
    p2 = new Vector(0, 2);
    b = new Box(p2, 0, 0.5, 0.5);

    contact = boxToDiscContact(b, d)[0];
    invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(-invSqrt2, invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(0.5, 1.5))).toBeTruthy();
    expect(equalN(contact.penetration, 1 - invSqrt2)).toBeTruthy();

    // Box is in the bottom right
    p2 = new Vector(2, 0);
    b = new Box(p2, 0, 0.5, 0.5);

    contact = boxToDiscContact(b, d)[0];
    invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(invSqrt2, -invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1.5, 0.5))).toBeTruthy();
    expect(equalN(contact.penetration, 1 - invSqrt2)).toBeTruthy();

    // Box is in the bottom left
    p2 = new Vector(0, 0);
    b = new Box(p2, 0, 0.5, 0.5);

    contact = boxToDiscContact(b, d)[0];
    invSqrt2 = 1 / Math.sqrt(2);
    expect(equalV(contact.contactNormal, new Vector(-invSqrt2, -invSqrt2))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(0.5, 0.5))).toBeTruthy();
    expect(equalN(contact.penetration, 1 - invSqrt2)).toBeTruthy();
});

test("boxToBox no contact", () => {
    let b1 = new Box(new Vector(1, 1), 0, 1, 0.5);
    let b2 = new Box(new Vector(2, 2), 0, 5, 0.4);

    expect(boxToBoxContact(b1, b2)).toEqual([]);
    expect(boxToBoxContact(b2, b1)).toEqual([]);
});

function verifyContact(b1: Box, b2: Box, normal: Vector, penetration: number, p1: Vector, p2: Vector) {
    let contact = boxToBoxContact(b1, b2)[0];
    expect(equalV(contact.contactNormal, normal)).toBeTruthy();
    expect(equalV(contact.contactPoint, p1)).toBeTruthy();
    expect(equalN(contact.penetration, penetration)).toBeTruthy();

    contact = boxToBoxContact(b2, b1)[0];
    expect(equalV(contact.contactNormal, normal.reverse())).toBeTruthy();
    expect(equalV(contact.contactPoint, p2)).toBeTruthy();
    expect(equalN(contact.penetration, penetration)).toBeTruthy();
}

function verifyContactSamePoint(b1: Box, b2: Box, normal: Vector, penetration: number, p: Vector) {
    verifyContact(b1, b2, normal, penetration, p, p)
}

test("boxToBox overlapping corners", () => {
    let b1 = new Box(new Vector(1, 1), 0, 1, 0.5);

    // We expect the top edge of b1 to contact with the bottom-left corner of b2 &
    // the bottom edge of b2 to contact with the top-right corner of b1.
    let b2 = new Box(new Vector(2, 2), 0, 0.5, 0.6);
    verifyContact(b1, b2, new Vector(0, -1), .1, new Vector(1.5, 1.4), new Vector(2, 1.5));

    // We expect the right edge of b1 to contact with the bottom-left corner of b2 &
    // the left edge of b2 to contact with the top-right corner of b1.
    b2 = new Box(new Vector(2.5, 2), 0, 0.6, 0.7);
    verifyContact(b1, b2, new Vector(-1, 0), .1, new Vector(1.9, 1.3), new Vector(2, 1.5));

    // We expect the bottom edge of b1 to contact with the top-left corner of b2 &
    // the top edge of b2 to contact with the bottom-right corner of b1.
    b2 = new Box(new Vector(2, 0), 0, 0.5, 0.6);
    verifyContact(b1, b2, new Vector(0, 1), .1, new Vector(1.5, 0.6), new Vector(2, 0.5));

    // We expect the right edge of b1 to contact with the top-left corner of b2 &
    // the left edge of b2 to contact with the bottom-right corner of b1.
    b2 = new Box(new Vector(2.5, 0), 0, 0.6, 0.7);
    verifyContact(b1, b2, new Vector(-1, 0), .1, new Vector(1.9, 0.7), new Vector(2, 0.5));

    // We expect the top edge of b1 to contact with the bottom-right corner of b2 &
    // the bottom edge of b2 to contact with the top-left corner of b1
    b2 = new Box(new Vector(0, 2), 0, 0.5, 0.6);
    verifyContact(b1, b2, new Vector(0, -1), .1, new Vector(0.5, 1.4), new Vector(0, 1.5));

    // We expect the left edge of b1 to contact with the bottom-right corner of b2 &
    // the right edge of b2 to contact with the top-left corner of b1.
    b2 = new Box(new Vector(-0.5, 2), 0, 0.6, 0.7);
    verifyContact(b1, b2, new Vector(1, 0), .1, new Vector(0.1, 1.3), new Vector(0, 1.5));

    // We expect the bottom edge of b1 to contact with the top-right corner of b2 &
    // the top edge of b2 to contact with the bottom-left corner of b1.
    b2 = new Box(new Vector(0, 0), 0, 0.5, 0.6);
    verifyContact(b1, b2, new Vector(0, 1), .1, new Vector(0.5, 0.6), new Vector(0, 0.5));

    // We expect the left edge of b1 to contact with the top-right corner of b2 &
    // the right edge of b2 to contact with the bottom-left corner of b1.
    b2 = new Box(new Vector(-0.5, 0), 0, 0.6, 0.7);
    verifyContact(b1, b2, new Vector(1, 0), .1, new Vector(0.1, 0.7), new Vector(0, 0.5));
});

test("boxToBox angled corners into edges", () => {
    let b1 = new Box(new Vector(1, 1), 0, 1, 1);

    // First case is b2 on top
    let b2 = new Box(new Vector(1.5, 2.5), 0, 0.5, 0.5);
    b2.rotation = Complex.fromRotation(Math.PI / 4);
    let invSqrt2 = 1 / Math.sqrt(2);
    let pen = invSqrt2 - 0.5;
    verifyContactSamePoint(b1, b2, new Vector(0, -1), pen, new Vector(1.5, 2.5 - invSqrt2));

    // Now b2 to the right
    b2.position = new Vector(2.5, 0.5);
    verifyContactSamePoint(b1, b2, new Vector(-1, 0), pen, new Vector(2.5 - invSqrt2, 0.5));

    // Now b2 underneath
    b2.position = new Vector(0.5, -0.5);
    verifyContactSamePoint(b1, b2, new Vector(0, 1), pen, new Vector(0.5, invSqrt2 - 0.5));

    // Now b2 to the left
    b2.position = new Vector(-0.5, 1.5);
    verifyContactSamePoint(b1, b2, new Vector(1, 0), pen, new Vector(invSqrt2 - 0.5, 1.5));
});
