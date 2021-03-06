import {Complex} from "./complex";
import {Vector} from "./vector";

export class Matrix {
    // First char = row, Second char = col
    aa: number;
    ab: number;
    ba: number;
    bb: number;

    constructor(aa: number, ab: number, ba: number, bb: number) {
        this.aa = aa;
        this.ab = ab;
        this.ba = ba;
        this.bb = bb;
    }

    // For a matrix A and vector b, returns c for A * b = c
    transform(v: Vector): Vector {
        return new Vector(
            this.aa * v.a + this.ab * v.b,
            this.ba * v.a + this.bb * v.b,
        )
    }

    // For a matrix A and vector b, returns c for A^T * b = c
    transformTranspose(v: Vector): Vector {
        return new Vector(
            this.aa * v.a + this.ba * v.b,
            this.ab * v.a + this.bb * v.b,
        )
    }

    static fromRotation(c: Complex): Matrix {
        return new Matrix(
            c.a, -c.b,
            c.b, c.a,
        )
    }
}