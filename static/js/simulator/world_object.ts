import {Vector} from "./vector";
import {TorqueGenerator} from "./torque_generator";
import {Complex} from "./complex";

export interface RenderingInfo {
    canvasToGridRatio: number
    height: number
    getX: (x: number) => number
    getY: (y: number) => number
}

export type WorldObjectID = string;

export class WorldObject {
    id: WorldObjectID;

    position: Vector;
    velocity: Vector;
    acceleration: Vector;
    mass: number;

    rotation: Complex;
    angularVelocity: number;
    angularAcceleration: number;

    linearDamping = .99;
    angularDamping = .80;

    forceAccumulator: Vector;
    lastFrameAcceleration: Vector;
    torqueAccumulator: number;

    torqueGenerator: TorqueGenerator;

    color: string;

    constructor(p: Vector, m: number) {
        this.id = uuid4();
        this.position = p;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.mass = m;

        this.rotation = new Complex(1, 0);
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

        // Translate the realWorldPoint into a point relative to the center of mass
        let centerOfMassPoint = new Vector(
            realWorldPoint.a - this.position.a,
            realWorldPoint.b - this.position.b,
        );

        this.torqueAccumulator += centerOfMassPoint.cross(f)
    }

    updatePosition(dt: number) {
        this.position.add(this.velocity.scale(dt));
    }

    updateVelocity(dt: number) {
        this.velocity.add(this.acceleration.scale(dt));
    }

    setAcceleration() {
        // a = F/m.
        this.lastFrameAcceleration = this.acceleration.copy();
        this.lastFrameAcceleration.add(this.forceAccumulator.scale(this.inverseMass()));

        this.acceleration = this.forceAccumulator.scale(this.inverseMass());
    }

    setAngularAcceleration() {
        if (this.torqueGenerator) {
            this.torqueGenerator.apply(this);
        }

        this.angularAcceleration = this.torqueAccumulator / this.momentOfInertia();
    }

    updateAngularVelocity(dt: number) {
        this.angularVelocity += this.angularAcceleration * dt;
    }

    updateRotation(dt: number) {
        this.setRotation(this.angularVelocity * dt);
    }

    setRotation(delta: number) {
        this.rotation = this.rotation.rotate(Complex.fromRotation(
           delta
        ));
        this.rotation.normalize();
    }

    applyDrag(dt: number) {
        this.velocity.scaleInPlace(Math.pow(this.linearDamping, dt));
        this.angularVelocity *= Math.pow(this.angularDamping, dt);
    }

    velocityAtPoint(localPoint: Vector): Vector {
        let v = this.velocity.copy();

        // Now add in the angular component
        let tangent = new Vector(
            -localPoint.b,
            localPoint.a,
        );
        tangent.normalize();
        tangent.scaleInPlace(this.angularVelocity * localPoint.magnitude());
        v.add(tangent);
        return v;
    }

    inverseMass(): number {
        return 1 / this.mass;
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

    translateLocalPoint(localPoint: Vector): Vector {
        throw Error("Abstract method, subclasses must implement.");
    }

    isInside(realWorldPoint: Vector): boolean {
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

function uuid4() {
    //// return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    let uuid = '', ii;
    for (ii = 0; ii < 32; ii += 1) {
        switch (ii) {
            case 8:
            case 20:
                uuid += '-';
                uuid += (Math.random() * 16 | 0).toString(16);
                break;
            case 12:
                uuid += '-';
                uuid += '4';
                break;
            case 16:
                uuid += '-';
                uuid += (Math.random() * 4 | 8).toString(16);
                break;
            default:
                uuid += (Math.random() * 16 | 0).toString(16);
          }
    }
    return uuid;
}
