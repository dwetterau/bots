import {equalN, equalV} from "./helpers";
import {Vector} from "../vector";

test("copy", () => {
    let v = new Vector(1, 2);
    expect(v).toEqual(v.copy());
});

test("add and subtract", () => {
    let v = new Vector(1, 2);
    let orig = v;
    let v2 = new Vector(2, 4);
    expect(equalV(v, v2)).toBeFalsy();

    v.addInPlace(v);
    expect(v).toEqual(v2);
    v.subInPlace(orig);
    expect(v).toEqual(orig);
});

test("dot", () => {
    let v = new Vector(1/Math.sqrt(2), 1/Math.sqrt(2));
    let v2 = new Vector(-1, 1);

    // This is testing a * b = |a||b|cos(theta)
    expect(equalN(v.dot(v2), 0)).toBeTruthy();
    expect(equalN(v.dot(new Vector(1, 0)), 1/Math.sqrt(2))).toBeTruthy()
});

test("normalize", () => {
    let v = new Vector( 5, 0);
    v.normalize();
    expect(equalV(v, new Vector(1, 0))).toBeTruthy();

    v = new Vector(1/Math.sqrt(2), 1/Math.sqrt(2));
    let copy = v.copy();
    v.normalize();
    expect(equalV(v, copy)).toBeTruthy();

    v = new Vector(1, Math.sqrt(3));
    v.normalize();
    expect(equalV(v, new Vector(1/2, Math.sqrt(3) / 2))).toBeTruthy();
});

test("cross", () => {
    let p = new Vector(2, 3);
    let f = new Vector(5, 7);
    expect(equalN(p.cross(f), -1)).toBeTruthy();
    expect(equalN(f.cross(p), 1)).toBeTruthy();
});
