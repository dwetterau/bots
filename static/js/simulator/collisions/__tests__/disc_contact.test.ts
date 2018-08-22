import {Disc} from "../../objects/disc";
import {Vector} from "../../vector";
import {discToDiscContact} from "../disc_contact";
import {equalN, equalV} from "../../__tests__/helpers";


test("not in contact", () => {
    let p1 = new Vector(0, 0);
    let p2 = new Vector(0, 2);

    let d1 = new Disc(p1, 0, 1);
    let d2 = new Disc(p2, 0, 0.5);

    expect(discToDiscContact(d1, d2)).toEqual([]);
});

test("perfect overlap", () => {
    let d1 = new Disc(new Vector(0, 0), 0, 1);
    try {
        discToDiscContact(d1, d1);
        fail()
    } catch(Error) {}
});

test("vertically aligned", () => {
    let p1 = new Vector(1, 1);
    let p2 = new Vector(1, 2.3);

    let d1 = new Disc(p1, 0, 1);
    let d2 = new Disc(p2, 0, .5);

    let contact = discToDiscContact(d1, d2)[0];
    expect(equalV(contact.contactNormal, new Vector(0, -1))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1, 1.8))).toBeTruthy();
    expect(equalN(contact.penetration, 0.2)).toBeTruthy();

    // flip it!
    contact = discToDiscContact(d2, d1)[0];
    expect(equalV(contact.contactNormal, new Vector(0, 1))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1, 2))).toBeTruthy();
    expect(equalN(contact.penetration, 0.2)).toBeTruthy();
});

test("horizontally aligned", () => {
    let p1 = new Vector(1, 1);
    let p2 = new Vector(2.3, 1);

    let d1 = new Disc(p1, 0, 1);
    let d2 = new Disc(p2, 0, .5);

    let contact = discToDiscContact(d1, d2)[0];
    expect(equalV(contact.contactNormal, new Vector(-1, 0))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(1.8, 1))).toBeTruthy();
    expect(equalN(contact.penetration, 0.2)).toBeTruthy();

    // flip it!
    contact = discToDiscContact(d2, d1)[0];
    expect(equalV(contact.contactNormal, new Vector(1, 0))).toBeTruthy();
    expect(equalV(contact.contactPoint, new Vector(2, 1))).toBeTruthy();
    expect(equalN(contact.penetration, 0.2)).toBeTruthy();
});
