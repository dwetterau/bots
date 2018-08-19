import {WorldObject, RenderingInfo} from "../world_object";
import {Vector} from "../vector";

export class Particle extends WorldObject {
    constructor(p: Vector) {
        super(p, Infinity)
    }

    momentOfInertia(): number {
        return Infinity;
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
                ctx.beginPath();
        ctx.fillStyle = this.color;

        // Center and rotate the canvas to our liking
        let x = renderingInfo.getX(this.position.a);
        let y = renderingInfo.getY(this.position.b);
        ctx.translate(x, y);

        ctx.lineWidth = 2;
        let width = 4;
        ctx.strokeStyle = "#000";
        ctx.moveTo(-width, -width);
        ctx.lineTo(width, width);
        ctx.stroke();
        ctx.closePath();

        ctx.moveTo(-width, width);
        ctx.lineTo(width, -width);
        ctx.stroke();
        ctx.closePath();

        // Reset the canvas
        ctx.translate(-x, -y);
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

    isInside(realWorldPoint: Vector): boolean {
        return false
    }
}
