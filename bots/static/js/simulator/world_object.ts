import {Vector} from "./vector";
export class WorldObject {

    position: Vector;
    velocity: Vector;
    acceleration: Vector;
    // TODO(davidw): Move this to a constant / make it configurable
    mass: number = 10;
    color: string;

    constructor(p: Vector, v: Vector) {
        this.position = p;
        this.velocity = v;
        this.acceleration = new Vector(0, 0);

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
}

function getRandomColor() {
    let letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}