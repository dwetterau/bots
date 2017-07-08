
import {WorldObject, WorldObjectID} from "./world_object";
import {Spring} from "./spring";

export class Assembly {
    objects: Array<WorldObject>;
    springs: Array<Spring>;
    objectIDs: {[objectID: string]: boolean;};

    constructor() {
        this.objects = [];
        this.objectIDs = {};
        this.springs = [];
    }

    setObjects(objects: Array<WorldObject>) {
        this.objectIDs = {};
        this.objects = objects;

        for (let o of objects) {
            this.objectIDs[o.id] = true
        }
    }

    setSprings(springs: Array<Spring>) {
        this.springs = springs
    }

    contains(o: WorldObject) {
        return this.objectIDs[o.id] && this.objectIDs[o.id]
    }
}