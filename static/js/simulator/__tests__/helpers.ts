import {Complex} from "../complex";
import {Vector} from "../vector";
import {Matrix} from "../matrix";

let eps = 1e-10;

export function equalM(m1: Matrix, m2: Matrix): boolean {
    return equalN(m1.aa, m2.aa) && equalN(m1.ab, m2.ab) &&
        equalN(m1.ba, m2.ba) && equalN(m1.bb, m2.bb);
}

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
