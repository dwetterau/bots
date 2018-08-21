export class Complex {
    a: number;
    b: number;

    constructor(a: number, b: number) {
        this.a = a;
        this.b = b;
    }

    rotate(o: Complex): Complex {
          return new Complex(
              this.a * o.a - this.b * o.b,
              this.a * o.b + this.b * o.a,
          )
    }

    normalize() {
        let squaredMag = this.a * this.a + this.b * this.b;
        if (squaredMag == 1) {
            return
        }
        let mag = Math.sqrt(squaredMag);
        this.a /= mag;
        this.b /= mag;
    }

    toTheta(): number {
        if (this.a == 0) {
            if (this.b > 0) {
                return Math.PI / 2
            } else {
                return 3 * Math.PI / 2
            }
        }
        if (this.b == 0) {
            if (this.a < 0) {
               return Math.PI
            } else {
                return 0;
            }
        }
        let atan = Math.atan(this.b / this.a);
        if (this.a > 0) {
            if (this.b < 0) {
                return 2 * Math.PI + atan;
            } else {
                return atan;
            }
        }
        return Math.PI + atan;
    }

    static fromRotation(theta: number) {
        return new Complex(Math.cos(theta), Math.sin(theta))
    }

}