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

    transform(v: Vector): Vector {
        // For a matrix A and vector b, returns c for A * b = c
        return new Vector(
            this.aa * v.a + this.ab * v.b,
            this.ba * v.a + this.bb * v.b,
        )
    }

    transformTranspose(v: Vector): Vector {
        // For a matrix A and vector b, returns c for A^T * b = c
        return new Vector(
            this.aa * v.a + this.ba * v.b,
            this.ab * v.a + this.bb * v.b,
        )
    }

    static fromRotation(theta: number): Matrix {
        return new Matrix(
            Math.cos(theta), -Math.sin(theta),
            Math.sin(theta), Math.cos(theta),
        )
    }
}