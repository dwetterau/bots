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
    mass: number = 0;
    color: string;

    constructor(p: Vector, v: Vector, m: number) {
        this.position = p;
        this.velocity = v;
        this.acceleration = new Vector(0, 0);
        this.mass = m;

        this.color = getRandomColor()
    }

    updatePosition(dt: number) {
        this.position.add(this.velocity.scale(dt));
    }

    updateVelocity(dt: number) {
        this.velocity.add(this.acceleration.scale(dt));
    }

    setGravity(g: Vector) {
        this.acceleration = g.scale(this.mass);
    }

    drawSelf(ctx: CanvasRenderingContext2D, renderingInfo: RenderingInfo) {
        throw Error("Abstract method, subclasses must implement.")
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