import {WorldObject, RenderingInfo} from "../world_object";
import {Vector} from "../vector";
import {Matrix} from "../matrix";

export class Disc extends WorldObject {
    radius: number = 0;

    constructor(p: Vector, m: number, r: number) {
        super(p, m);
        this.radius = r;
    }

    momentOfInertia(): number {
        // The moment of inertia for a thin disc is: MR^2 / 2
        return this.mass * (this.radius * this.radius) / 2;
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        ctx.beginPath();
        ctx.fillStyle = this.color;

        // Center and rotate the canvas to our liking
        let x = renderingInfo.getX(this.position.a);
        let y = renderingInfo.getY(this.position.b);
        ctx.translate(x, y);
        let canvasRotation = Math.PI * 2 - this.rotation.toTheta();
        ctx.rotate(canvasRotation);

        let radiusHeight = Math.round(this.radius * renderingInfo.canvasToGridRatio);
        ctx.arc(
            0,
            0,
            radiusHeight,
            0,
            Math.PI * 2,
            false,  // anticlockwise
        );
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();

        ctx.moveTo(-radiusHeight / 2, 0);
        ctx.lineTo(radiusHeight / 2, 0);
        ctx.stroke();
        ctx.closePath();

        ctx.moveTo(0, -radiusHeight / 2);
        ctx.lineTo(0, radiusHeight / 2);
        ctx.stroke();
        ctx.closePath();

        // Reset the canvas
        ctx.rotate(-canvasRotation);
        ctx.translate(-x, -y);
    }

    translateRealWorldPoint(realWorldPoint: Vector): Vector {
        return Matrix.fromRotation(this.rotation).transformTranspose(new Vector(
            realWorldPoint.a - this.position.a,
            realWorldPoint.b - this.position.b,
        ));
    }

    translateLocalPoint(localPoint: Vector): Vector {
        let realWorldPoint = localPoint.copy();
        realWorldPoint = Matrix.fromRotation(this.rotation).transform(realWorldPoint);
        realWorldPoint.add(this.position);
        return realWorldPoint;
    }

    isInside(realWorldPoint: Vector): boolean {
        let localPoint = this.translateRealWorldPoint(realWorldPoint);
        return localPoint.magnitude() <= this.radius;
    }
}
