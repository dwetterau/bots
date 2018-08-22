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

    v.add(v);
    expect(v).toEqual(v2);
    v.sub(orig);
    expect(v).toEqual(orig);
});

test("dot", () => {
    let v = new Vector(Math.PI / 2, Math.PI / 2);
    let v2 = new Vector(-1, 1);

    // This is testing a * b = |a||b|cos(theta)
    expect(equalN(v.dot(v2), 0));
    expect(equalN(v.dot(new Vector(1, 0)), Math.PI / 4))
});

test("normalize", () => {
    let v = new Vector( 5, 0);
    v.normalize();
    expect(equalV(v, new Vector(1, 0)));

    v = new Vector(Math.PI / 2, Math.PI / 2);
    v.normalize();
    expect(equalV(v, new Vector(Math.PI / 2, Math.PI / 2)));

    v = new Vector(1, Math.sqrt(3));
    v.normalize();
    expect(equalV(v, new Vector(1/2, Math.sqrt(3) / 2)));
});
