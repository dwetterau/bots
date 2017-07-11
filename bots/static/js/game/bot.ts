import {Assembly} from "../simulator/assembly";
import {Vector} from "../simulator/vector";
import {Box} from "../simulator/objects/box";
import {Disc} from "../simulator/objects/disc";
import {Spring} from "../simulator/spring";
import {TorqueGenerator} from "../simulator/torque_generator";

export interface BotSpec {
    bodySpec: BodySpec
    wheelSpec: WheelSpec
    wheelSpringSpec: WheelSpringSpec
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

export interface WheelSpringSpec {
    springConstant: number,
    restLength: number,
    offsetX: number,
    offsetY: number,
}

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
        let springs: Array<Spring> = [];
        for (let o of [0, 1]) {
            let oSign = ((o == 0) ? -1 : 1);
            for (let s of [-1, 1]) {
                springs.push(new Spring(
                    spec.wheelSpringSpec.springConstant,
                    spec.wheelSpringSpec.restLength,
                    this.objects[0],
                    new Vector(
                        oSign * spec.wheelSpec.offsetX + s * spec.wheelSpringSpec.offsetX,
                        spec.wheelSpec.offsetY + spec.wheelSpringSpec.offsetY,
                    ),
                    this.objects[o + 1],
                    new Vector(0, 0),
                ));
            }
        }
        super.setSprings(springs);
    }

    addWheelMotor(tg: TorqueGenerator) {
        this.objects[1].torqueGenerator = tg;
        this.objects[2].torqueGenerator = tg;
    }
}
