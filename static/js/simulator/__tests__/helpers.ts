import {Complex} from "../complex";
import {Vector} from "../vector";

let eps = 1e-10;

export function equalV(v1: Vector, v2: Vector): boolean {
    return equalN(v1.a, v2.a) && equalN(v1.b, v2.b);
}

export function equalC(c1: Complex, c2: Complex): boolean {
    return equalN(c1.a, c2.a) && equalN(c1.b, c2.b);
}

export function equalN(n1: number, n2: number): boolean {
    return n1 == n2 || Math.abs(n1 - n2) < eps
}

test("", () => {});
