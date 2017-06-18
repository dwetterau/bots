export class Vector {
    a: number = 0;
    b: number = 0;

    constructor(dx: number, dy: number) {
        this.a = dx;
        this.b = dy;
    }

    add(v: Vector): void {
        this.a += v.a;
        this.b += v.b;
    }

    dot(v: Vector): number {
        return this.a * v.a + this.b * v.b;
    }

    proj(v: Vector): Vector {
        let fraction = this.dot(v);
        return new Vector(v.a * fraction, v.b * fraction);
    }

    magnitude(): number {
        return Math.sqrt(this.a * this.a + this.b * this.b);
    }

    normalize(): void {
        let mag = this.magnitude();
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
}
