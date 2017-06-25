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
        // The moment of inertia for a thin disc is: M(dx^2 + dy^2) / 12
        return this.mass * ((4 * this.halfX * this.halfX) + (4 * this.halfY * this.halfY)) / 12;
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        ctx.beginPath();
        ctx.fillStyle = this.color;

        // Center and rotate the canvas to our liking
        let x = Math.round(this.position.a * renderingInfo.canvasToGridRatio);
        let y = Math.round(
            renderingInfo.height - (this.position.b * renderingInfo.canvasToGridRatio)
        );
        ctx.translate(x, y);
        let canvasRotation = Math.PI * 2 - this.rotation;
        ctx.rotate(canvasRotation);

        // Draw our rectangle
        ctx.rect(
            -this.halfX,
            -this.halfY,
            this.halfX * 2,
            this.halfY * 2,
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

    translateRealWorldPoint(realWorldPoint: Vector): Vector {
        return Matrix.fromRotation(this.rotation).transform(new Vector(
            realWorldPoint.a - this.position.a,
            realWorldPoint.b - this.position.b,
        ));
    }

    isInside(localPoint: Vector): boolean {
        return (
            Math.abs(localPoint.a) <= this.halfX
            && Math.abs(localPoint.b) <= this.halfY
        );
    }
}
