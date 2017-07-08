import {WorldObject, RenderingInfo} from "../world_object";
import {Vector} from "../vector";

export class Plane extends WorldObject {
    normal: Vector;
    offset: number;
    squareRadius: number;

    constructor(p: Vector, n: Vector, squareRadius: number) {
        super(p, Infinity);
        this.normal = n;
        this.offset = n.dot(p);
        this.squareRadius = squareRadius;
    }

    momentOfInertia(): number {
        return Infinity;
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        ctx.beginPath();
        ctx.fillStyle = this.color;

        let getX = (x: number): number => {
            return Math.round(x * renderingInfo.canvasToGridRatio);
        };
        let getY = (y: number): number => {
            return Math.round(renderingInfo.height - (y * renderingInfo.canvasToGridRatio))
        };

        let normToLeft = new Vector(
            -this.normal.b,
            this.normal.a,
        );
        normToLeft.scaleInPlace(this.squareRadius);

        ctx.moveTo(
            getX(this.position.a + normToLeft.a),
            getY(this.position.b + normToLeft.b),
        );

        normToLeft.reverse();
        ctx.lineTo(
            getX(this.position.a + normToLeft.a),
            getY(this.position.b + normToLeft.b),
        );

        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    translateRealWorldPoint(realWorldPoint: Vector): Vector {
        return new Vector(
            realWorldPoint.a - this.position.a,
            realWorldPoint.b - this.position.b,
        )
    }

    translateLocalPoint(localPoint: Vector): Vector {
        return new Vector(
            this.position.a + localPoint.a,
            this.position.b + localPoint.b,
        )
    }
}
