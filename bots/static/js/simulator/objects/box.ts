import {WorldObject, RenderingInfo} from "../world_object";
import {Vector} from "../vector";
import {Matrix} from "../matrix";
import {render} from "react-dom";

export class Box extends WorldObject {
    halfX: number = 0;
    halfY: number = 0;

    constructor(p: Vector, m: number, halfX: number, halfY: number) {
        super(p, m);
        this.halfX = halfX;
        this.halfY = halfY;
    }

    momentOfInertia(): number {
        // The moment of inertia for a flat box is: M(dx^2 + dy^2) / 12
        return this.mass * ((4 * this.halfX * this.halfX) + (4 * this.halfY * this.halfY)) / 12;
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        ctx.beginPath();
        ctx.fillStyle = this.color;

        // Center and rotate the canvas to our liking
        let x = renderingInfo.getX(this.position.a);
        let y = renderingInfo.getY(this.position.b);
        ctx.translate(x, y);
        let canvasRotation = Math.PI * 2 - this.rotation;
        ctx.rotate(canvasRotation);

        // Draw our rectangle
        ctx.rect(
            -this.halfX * renderingInfo.canvasToGridRatio,
            -this.halfY * renderingInfo.canvasToGridRatio,
            this.halfX * 2 * renderingInfo.canvasToGridRatio,
            this.halfY * 2 * renderingInfo.canvasToGridRatio,
        );
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();

        // Reset the canvas
        ctx.rotate(-canvasRotation);
        ctx.translate(-x, -y);
    }

    getAxis(index: number): Vector {
        let axis = Matrix.fromRotation(this.rotation).transform(new Vector(1 - index, index));
        axis.normalize();
        return axis;
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

    transformToAxis(axis: Vector): number {
        return this.halfX * Math.abs(axis.dot(this.getAxis(0))) +
            this.halfY * Math.abs(axis.dot(this.getAxis(1)))
    }
}
