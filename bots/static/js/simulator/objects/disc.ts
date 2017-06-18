import {WorldObject, RenderingInfo} from "../world_object";
import {Vector} from "../vector";

export class Disc extends WorldObject {
    radius: number = 0;

    constructor(p: Vector, v: Vector, m: number, r: number) {
        super(p, v, m);
        this.radius = r;
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

        ctx.arc(x + radiusHeight, y + radiusHeight, radiusHeight, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();
    }
}
