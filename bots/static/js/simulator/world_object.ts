import {Vector} from "./vector";

export interface RenderingInfo {
    heightToGridHeight: number
    widthToGridWidth: number
    height: number
}

export class WorldObject {

    position: Vector;
    velocity: Vector;
    acceleration: Vector;
    mass: number;

    rotation: number;
    angularVelocity: number;
    angularAcceleration: number;

    forceAccumulator: Vector;
    torqueAccumulator: number;

    color: string;

    constructor(p: Vector, m: number) {
        this.position = p;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.mass = m;

        this.rotation = 0;
        this.angularVelocity = 0;

        this.color = getRandomColor()
    }

    clearForFrame() {
        // Clear the accumulators for the new simulation frame
        this.forceAccumulator = new Vector(0, 0);
        this.torqueAccumulator = 0;
    }

    accumulateForce(f: Vector, realWorldPoint: Vector) {
        // TODO(davidw): Think about this more, I think we only want to add some
        // component of the force (the portion that goes through the center of mass?)
        this.forceAccumulator.add(f);

        // Translate the realWorldPoint into a local point
        let localPoint = this.translateRealWorldPoint(realWorldPoint);

        if (!this.isInside(localPoint)) {
            throw Error("Force applied that was outside of object");
        }

        this.torqueAccumulator += localPoint.cross(f)
    }

    updatePosition(dt: number) {
        this.position.add(this.velocity.scale(dt));
    }

    updateVelocity(dt: number) {
        this.velocity.add(this.acceleration.scale(dt));
    }

    setAcceleration() {
        // a = F/m.
        this.acceleration = this.forceAccumulator.scale(1 / this.mass);
    }

    setAngularAcceleration() {
        this.angularAcceleration = this.torqueAccumulator / this.momentOfInertia();
    }

    updateAngularVelocity(dt: number) {
        this.angularVelocity += this.angularAcceleration * dt;
    }

    updateRotation(dt: number) {
        this.rotation += this.angularVelocity * dt;
        // Clamp the rotation in radians
        if (this.rotation < 0) {
            this.rotation += Math.PI * 2;
        } else if (this.rotation > Math.PI * 2) {
            this.rotation -= Math.PI * 2;
        }
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        throw Error("Abstract method, subclasses must implement.")
    }

    momentOfInertia(): number {
        throw Error("Abstract method, subclasses must implement.")
    }

    translateRealWorldPoint(realWorldPoint: Vector): Vector {
        throw Error("Abstract method, subclasses must implement.");
    }

    isInside(p: Vector): boolean {
        throw Error("Abstract method, subclasses must implement.");
    }
}

function getRandomColor() {
    let letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}