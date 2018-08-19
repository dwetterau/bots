import {WorldObject} from "./world_object";
import {Vector} from "./vector";
import {ContactGenerator} from "./collisions/contact_generator";
import {ContactResolver} from "./collisions/contact_resolver";
import {Plane} from "./objects/plane";
import {Spring} from "./spring";
import {Assembly} from "./assembly";
import {Joint} from "./collisions/joint";

export class World {

    // Universal constants
    Gravity = 20;
    Restitution = .6;
    Tolerance = .005;
    VelocityLimit = .25;
    AngularLimit = .2;

    // World info
    height: number = 100;
    width: number = 0;
    gravityDirection: Vector = new Vector(0, -1);
    objects: Array<WorldObject> = [];
    idToObject: {[objectID: string]: WorldObject};
    joints: Array<Joint> = [];
    springs: Array<Spring> = [];
    assemblies: Array<Assembly> = [];
    objectIDToAssembly: {[objectID: string]: Assembly};

    // Internal components
    contactGenerator: ContactGenerator;
    contactResolver: ContactResolver;

    constructor(height: number, width:number) {
        this.height = height;
        this.width = width;
        this.reset();
    }

    reset() {
        // TODO(davidw): Reset any state in the generator / resolver
        this.contactGenerator = new ContactGenerator(this);
        this.contactResolver = new ContactResolver(this);

        this.objects = [];
        this.idToObject = {};
        this.joints = [];
        this.springs = [];
        this.assemblies = [];
        this.objectIDToAssembly = {};
        this.addWalls();
    }

    addWalls() {
        // Bottom wall
        this.addObject(new Plane(
            new Vector(this.width / 2, 0),
            new Vector(0, 1),
            this.width / 2,
        ));
        // Right wall
        this.addObject(new Plane(
            new Vector(this.width, this.height / 2),
            new Vector(-1, 0),
            this.height / 2,
        ));
        // Left wall
        this.addObject(new Plane(
            new Vector(0, this.height / 2),
            new Vector(1, 0),
            this.height / 2,
        ));
        // Top wall
        this.addObject(new Plane(
            new Vector(this.width / 2, this.height),
            new Vector(0, -1),
            this.width / 2,
        ));
    }

    addObject(o: WorldObject) {
        if (this.idToObject[o.id]) {
            throw Error("Already have object with this id:" + o.id)
        }
        this.objects.push(o);
        this.idToObject[o.id] = o;
    }

    addAssembly(a: Assembly) {
        this.assemblies.push(a);
        for (let o of a.objects) {
            this.objectIDToAssembly[o.id] = a;
            this.addObject(o);
        }
        for (let s of a.springs) {
            this.springs.push(s)
        }
        for (let j of a.joints) {
            this.joints.push(j)
        }
    }

    moveObjects(dt: number) {
        let gravity = this.gravityDirection.scale(this.Gravity);

        for (let object of this.objects) {
            object.clearForFrame();
        }

        // Apply all spring forces
        for (let spring of this.springs) {
            spring.accumulateForces();
        }

        for (let object of this.objects) {
            if (object.mass != Infinity) {
                // Only apply gravity if the object has non-infinite mass
                object.accumulateForce(gravity.scale(object.mass), object.position);
            }
            object.setAcceleration();
            object.updateVelocity(dt);

            object.setAngularAcceleration();
            object.updateAngularVelocity(dt);

            object.applyDrag(dt);

            object.updatePosition(dt);
            object.updateRotation(dt);
        }

        let contacts = this.contactGenerator.detectContacts();
        this.contactResolver.resolve(contacts, dt);
    }

    objectUnderPoint(realWorldPoint: Vector): [Vector, WorldObject] {
        for (let o of this.objects) {
            if (o.isInside(realWorldPoint)) {
                return [o.translateRealWorldPoint(realWorldPoint), o]
            }
        }
        return [null, null];
    }

    removeObject(o: WorldObject) {
        // Clear out all state involving this object
        this.springs = this.springs.filter((s: Spring): boolean => {
            return s.o1.id != o.id && s.o2.id != o.id
        });

        this.objects = this.objects.filter((cur: WorldObject): boolean => {
            return cur.id != o.id
        });

        delete this.idToObject[o.id];
        delete this.objectIDToAssembly[o.id]
    }

    stats(): Array<string> {
        let stats = [];
        for (let object of this.objects) {
            if (object instanceof Plane) {
                continue
            }
            stats.push(
                `p: (${object.position.a.toFixed(2)}, ` +
                `${object.position.b.toFixed(2)}) ` +
                `theta: ${object.rotation.toFixed(3)}`
            )
        }
        return stats;
    }
}
