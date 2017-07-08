
import {WorldObject} from "./world_object";
export class TorqueGenerator {
    torque: number;
    governor: number;

    constructor(torque: number, governor: number) {
        this.torque = torque;
        this.governor = governor;
    }

    apply(o: WorldObject) {
        if (Math.abs(o.angularVelocity) > this.governor) {
            return
        }
        o.torqueAccumulator += this.torque;
    }
}
