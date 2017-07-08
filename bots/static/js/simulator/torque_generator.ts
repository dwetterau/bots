
import {WorldObject} from "./world_object";
export class TorqueGenerator {
    torque: number;

    constructor(torque: number) {
        this.torque = torque;
    }

    apply(o: WorldObject) {
        o.torqueAccumulator += this.torque;
    }
}
