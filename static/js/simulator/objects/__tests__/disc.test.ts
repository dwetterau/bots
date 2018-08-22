import {Disc} from "../disc";
import {equalN} from "../../__tests__/helpers";

test("inertia", () => {
    let b = new Disc(null, 4, 2);
    expect(equalN(b.momentOfInertia(), 1/2 * 4 * (2*2))).toBeTruthy();
});
