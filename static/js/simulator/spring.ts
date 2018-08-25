
import {WorldObject, RenderingInfo} from "./world_object";
import {Vector} from "./vector";
import {render} from "react-dom";
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
        displacement.subInPlace(realWorldP1);
        let x = displacement.magnitude() - this.l;

        if (x == -this.l) {
            // Skip the spring force if the two points overlap.
            return
        }

        displacement.normalize();
        displacement.scaleInPlace(this.k * x);
        this.o1.accumulateForce(displacement, realWorldP1);
        displacement.reverseInPlace();
        this.o2.accumulateForce(displacement, realWorldP2);
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        ctx.beginPath();

        let realWorldP1 = this.o1.translateLocalPoint(this.p1);
        let realWorldP2 = this.o2.translateLocalPoint(this.p2);
        ctx.moveTo(
            renderingInfo.getX(realWorldP1.a),
            renderingInfo.getY(realWorldP1.b),
        );
        ctx.lineTo(
            renderingInfo.getX(realWorldP2.a),
            renderingInfo.getY(realWorldP2.b),
        );
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath()
    }
}