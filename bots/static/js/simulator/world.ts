import {WorldObject} from "./world_object";
import {Vector} from "./vector";
import {Disc} from "./objects/disc";
import {ContactGenerator} from "./collisions/contact_generator";
import {ContactResolver} from "./collisions/contact_resolver";
import {Plane} from "./objects/plane";
import {Box} from "./objects/box";
import {Spring} from "./spring";
import {Assembly} from "./assembly";

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
    springs: Array<Spring> = [];
    assemblies: Array<Assembly> = [];
    objectIDToAssembly: {[objectID: string]: Assembly};

    // Internal components
    contactGenerator: ContactGenerator;
    contactResolver: ContactResolver;

    constructor(height: number, width:number) {
        this.height = height;
        this.width = width;

        this.contactGenerator = new ContactGenerator(this);
        this.contactResolver = new ContactResolver(this);

        this.objectIDToAssembly = {};

        this.addWalls();
    }

    addWalls() {
        // Bottom wall
        this.objects.push(new Plane(
            new Vector(50, 0),
            new Vector(0, 1),
            50,
        ));
        // Right wall
        this.objects.push(new Plane(
            new Vector(100, 50),
            new Vector(-1, 0),
            50,
        ));
        // Left wall
        this.objects.push(new Plane(
            new Vector(0, 50),
            new Vector(1, 0),
            50,
        ));
        // Top wall
        this.objects.push(new Plane(
            new Vector(50, 100),
            new Vector(0, -1),
            50,
        ));
    }

    addAssembly(a: Assembly) {
        this.assemblies.push(a);
        for (let o of a.objects) {
            this.objectIDToAssembly[o.id] = a;
            this.objects.push(o)
        }
        for (let s of a.springs) {
            this.springs.push(s)
        }
    }

    moveObjects(timestep: number) {
        let dt = timestep / 1000.0;
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

    stats(): Array<string> {
        let stats = ["fps: TODO"];
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
