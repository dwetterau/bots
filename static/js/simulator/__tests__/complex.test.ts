import {Complex} from "../complex";
import {equalC, equalN} from "./helpers";

test("rotate", () => {
    // 90 degree rotations
    let zero = new Complex(1, 0);
    let ninety = new Complex(0, 1);
    let half = new Complex(-1, 0);
    let threeQuarter = new Complex(0, -1);

    expect(equalC(zero.rotate(ninety), ninety)).toBeTruthy();
    expect(equalC(ninety.rotate(ninety), half)).toBeTruthy();
    expect(equalC(half.rotate(ninety), threeQuarter)).toBeTruthy();
    expect(equalC(threeQuarter.rotate(ninety), zero)).toBeTruthy();

    // 45 degree rotations
    let fortyFive = new Complex(1, 1);
    fortyFive.normalize();
    expect(equalC(fortyFive, new Complex(
        1 / Math.sqrt(2),
        1 / Math.sqrt(2),
    ))).toBeTruthy();
    expect(equalC(fortyFive.rotate(fortyFive), ninety)).toBeTruthy();
    expect(equalC(ninety.rotate(fortyFive).rotate(fortyFive), half)).toBeTruthy();
});

test("normalize", () => {
    let fortyFive = new Complex(1, 1);
    fortyFive.normalize();
    expect(equalC(fortyFive, new Complex(
        1 / Math.sqrt(2),
        1 / Math.sqrt(2),
    ))).toBeTruthy();

    // 60 degree angle should be preserved
    let x = new Complex(1, Math.sqrt(3));
    x.normalize();
    expect(equalC(x, new Complex(1/2, 1/2 * Math.sqrt(3)))).toBeTruthy();
});

test("theta", () => {
    let zero = new Complex(1, 0);
    let ninety = new Complex(0, 1);
    let half = new Complex(-1, 0);
    let threeQuarter = new Complex(0, -1);
    let fortyFive = new Complex(1, 1);
    let sixty = new Complex(1, Math.sqrt(3));

    expect(equalN(zero.toTheta(), 0)).toBeTruthy();
    expect(equalN(ninety.toTheta(), Math.PI / 2)).toBeTruthy();
    expect(equalN(half.toTheta(), Math.PI)).toBeTruthy();
    expect(equalN(threeQuarter.toTheta(), 3 * Math.PI / 2)).toBeTruthy();

    expect(equalN(fortyFive.toTheta(), Math.PI / 4)).toBeTruthy();
    expect(equalN(fortyFive.rotate(ninety).toTheta(), 3 * Math.PI / 4)).toBeTruthy();
    expect(equalN(fortyFive.rotate(half).toTheta(), 5 * Math.PI / 4)).toBeTruthy();
    expect(equalN(fortyFive.rotate(threeQuarter).toTheta(), 7 * Math.PI / 4)).toBeTruthy();

    expect(equalN(sixty.toTheta(), Math.PI / 3)).toBeTruthy();
    expect(equalN(sixty.rotate(ninety).toTheta(), 5 * Math.PI / 6)).toBeTruthy();
    expect(equalN(sixty.rotate(half).toTheta(), 4 * Math.PI / 3)).toBeTruthy();
    expect(equalN(sixty.rotate(threeQuarter).toTheta(), 11 * Math.PI / 6)).toBeTruthy();
});
