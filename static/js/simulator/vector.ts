import {Complex} from "./complex";

export class Vector {
    a: number = 0;
    b: number = 0;

    constructor(dx: number, dy: number) {
        this.a = dx;
        this.b = dy;
    }

    copy(): Vector {
        return new Vector(this.a, this.b);
    }

    add(v: Vector): void {
        this.a += v.a;
        this.b += v.b;
    }

    sub(v: Vector):  void{
        this.a -= v.a;
        this.b -= v.b;
    }

    dot(v: Vector): number {
        return this.a * v.a + this.b * v.b;
    }

    cross(v: Vector): number {
        return this.a * v.b - this.b * v.a;
    }

    proj(v: Vector): Vector {
        let fraction = this.dot(v);
        return new Vector(v.a * fraction, v.b * fraction);
    }

    squareMagnitude(): number {
        return this.a * this.a + this.b * this.b
    }

    magnitude(): number {
        return Math.sqrt(this.squareMagnitude());
    }

    normalize(): void {
        let mag = this.magnitude();
        if (mag == 0) {
            throw Error("Divide by zero error while normalizing vector");
        }
        this.a /= mag;
        this.b /= mag;
    }

    reverse(): void {
        this.a = -this.a;
        this.b = -this.b;
    }

    scaleInPlace(n: number): void {
        this.a *= n;
        this.b *= n;
    }

    scale(n: number): Vector {
        return new Vector(this.a * n, this.b * n);
    }

    static fromRotation(c: Complex): Vector {
        return new Vector(c.a, c.b);
    }
}
