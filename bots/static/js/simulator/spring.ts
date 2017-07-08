
import {WorldObject, RenderingInfo} from "./world_object";
import {Vector} from "./vector";
export class Spring {
    // Spring constant
    k: number;

    // Rest length
    l: number;

    // References to the attached objects and the relative point on each
    o1: WorldObject;
    p1: Vector;
    o2: WorldObject;
    p2: Vector;

    constructor(k: number, l: number, o1: WorldObject, p1: Vector, o2: WorldObject, p2: Vector) {
        this.k = k;
        this.l = l;
        this.o1 = o1;
        this.p1 = p1;
        this.o2 = o2;
        this.p2 = p2;
    }

    accumulateForces() {
        let realWorldP1 = this.o1.translateLocalPoint(this.p1);
        let realWorldP2 = this.o2.translateLocalPoint(this.p2);

        let displacement = realWorldP2.copy();
        displacement.sub(realWorldP1);
        let x = displacement.magnitude() - this.l;


        displacement.normalize();
        displacement.scaleInPlace(this.k * x);
        this.o1.accumulateForce(displacement, realWorldP1);
        displacement.reverse();
        this.o2.accumulateForce(displacement, realWorldP2);
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        ctx.beginPath();

        let realWorldP1 = this.o1.translateLocalPoint(this.p1);
        let realWorldP2 = this.o2.translateLocalPoint(this.p2);

        let getX = (x: number): number => {
            return Math.round(x * renderingInfo.canvasToGridRatio);
        };
        let getY = (y: number): number => {
            return Math.round(renderingInfo.height - (y * renderingInfo.canvasToGridRatio))
        };
        ctx.moveTo(
            getX(realWorldP1.a),
            getY(realWorldP1.b),
        );
        ctx.lineTo(
            getX(realWorldP2.a),
            getY(realWorldP2.b),
        );
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath()
    }
}