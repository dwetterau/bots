import {Assembly} from "../simulator/assembly";
import {Vector} from "../simulator/vector";
import {Box} from "../simulator/objects/box";
import {Disc} from "../simulator/objects/disc";
import {TorqueGenerator} from "../simulator/torque_generator";
import {Joint} from "../simulator/collisions/joint";

export interface BotSpec {
    bodySpec: BodySpec
    wheelSpec: WheelSpec
}

export interface BodySpec {
    width: number,
    height: number,
    mass: number,
}

export interface WheelSpec {
    radius: number,
    mass: number,
    offsetX: number,
    offsetY: number,
}

const AXLE_TOLERANCE = 0.01;

export class Bot extends Assembly {

    constructor(p: Vector, spec: BotSpec) {
        super();

        super.setObjects([
            new Box(
                p,
                spec.bodySpec.mass,
                spec.bodySpec.width / 2,
                spec.bodySpec.height / 2,
            ),
            new Disc(
                new Vector(p.a - spec.wheelSpec.offsetX, p.b + spec.wheelSpec.offsetY),
                spec.wheelSpec.mass,
                spec.wheelSpec.radius,
            ),
            new Disc(
                new Vector(p.a + spec.wheelSpec.offsetX, p.b + spec.wheelSpec.offsetY),
                spec.wheelSpec.mass,
                spec.wheelSpec.radius,
            ),
        ]);
        let joints: Array<Joint> = [];
        for (let o of [0, 1]) {
            let oSign = ((o == 0) ? -1 : 1);
            joints.push(new Joint(
                AXLE_TOLERANCE,
                this.objects[0],
                new Vector(oSign * spec.wheelSpec.offsetX, spec.wheelSpec.offsetY),
                this.objects[o + 1],
                new Vector(0, 0),
            ));
        }
        super.setJoints(joints);
    }

    addWheelMotor(tg: TorqueGenerator) {
        this.objects[1].torqueGenerator = tg;
        this.objects[2].torqueGenerator = tg;
    }
}
