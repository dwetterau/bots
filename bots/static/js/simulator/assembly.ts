
import {WorldObject, WorldObjectID} from "./world_object";
import {Spring} from "./spring";
import {Joint} from "./collisions/joint";

export class Assembly {
    objects: Array<WorldObject>;
    joints: Array<Joint>;
    springs: Array<Spring>;
    objectIDs: {[objectID: string]: boolean;};

    constructor() {
        this.objects = [];
        this.objectIDs = {};
        this.joints = [];
        this.springs = [];
    }

    setObjects(objects: Array<WorldObject>) {
        this.objectIDs = {};
        this.objects = objects;

        for (let o of objects) {
            this.objectIDs[o.id] = true
        }
    }

    setJoints(joints: Array<Joint>) {
        this.joints = joints
    }

    setSprings(springs: Array<Spring>) {
        this.springs = springs
    }

    contains(o: WorldObject) {
        return this.objectIDs[o.id] && this.objectIDs[o.id]
    }
}