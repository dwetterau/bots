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

    addInPlace(v: Vector): void {
        this.a += v.a;
        this.b += v.b;
    }

    subInPlace(v: Vector):  void{
        this.a -= v.a;
        this.b -= v.b;
    }

    dot(v: Vector): number {
        return this.a * v.a + this.b * v.b;
    }

    // TODO: Remove this function
    // DEPRECATED: Remove this function
    cross(v: Vector): number {
        return this.a * v.b - this.b * v.a;
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

    reverseInPlace(): void {
        this.a = -this.a;
        this.b = -this.b;
    }

    reverse(): Vector {
        return this.scale(-1);
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
