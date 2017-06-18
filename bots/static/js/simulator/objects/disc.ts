import {WorldObject, RenderingInfo} from "../world_object";
import {Vector} from "../vector";

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

        let radiusHeight = this.radius * renderingInfo.heightToGridHeight;
        let x = Math.round(this.position.a * renderingInfo.widthToGridWidth) - radiusHeight;
        let y = Math.round(
            renderingInfo.height
            - (this.position.b * renderingInfo.heightToGridHeight)
            - radiusHeight
        );
        radiusHeight = Math.round(radiusHeight);

        ctx.arc(
            x + radiusHeight,
            y + radiusHeight,
            radiusHeight,
            this.rotation, // startAngle
            (this.rotation + (Math.PI * 2 - .2)) % (Math.PI * 2),  // endAngle
            false,  // anticlockwise
        );
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();
    }

    translateRealWorldPoint(realWorldPoint: Vector): Vector {
        return new Vector(
            realWorldPoint.a - this.position.a,
            realWorldPoint.b - this.position.b,
        );
    }

    isInside(p: Vector): boolean {
        return p.magnitude() <= this.radius;
    }
}