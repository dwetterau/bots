import {WorldObject} from "./world_object";
import {Vector} from "./vector";
import {Disc} from "./objects/disc";
import {ContactGenerator} from "./collisions/contact_generator";
import {ContactResolver} from "./collisions/contact_resolver";
import {Plane} from "./objects/plane";
import {Box} from "./objects/box";
import {Spring} from "./spring";

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

    // Internal components
    contactGenerator: ContactGenerator;
    contactResolver: ContactResolver;

    constructor(height: number, width:number) {
        this.height = height;
        this.width = width;

        this.contactGenerator = new ContactGenerator(this);
        this.contactResolver = new ContactResolver(this);

        // Make a simple disc for now
        this.objects.push(new Disc(
            new Vector(20, 20),
            10, // mass
            5,  // radius
        ));
        this.objects.push(new Disc(
            new Vector(89, 50),
            20, // mass
            10, // radius
        ));
        // A box!
        this.objects.push(new Box(
            new Vector(20, 70),
            50,     // mass
            18,     // halfX
            9,      // halfY
        ));
        this.objects.push(new Box(
            new Vector(10, 20),
            20,     // mass
            4,      // halfX
            5,      // halfY
        ));
        this.objects[0].velocity = new Vector(20, 12);
        this.objects[1].velocity = new Vector(-10, 12);
        this.objects[3].velocity = new Vector(4, -10);
        this.objects[3].angularVelocity = -.5;

        for (let o of this.objects) {
            o.velocity = new Vector(Math.random() * 10 - 5, Math.random() * 10 - 5);
            o.angularVelocity = Math.random() * Math.PI - Math.PI / 2;
        }
        this.addWalls();


        this.springs.push(new Spring(
            50,  // spring constant
            5,  // rest length
            this.objects[0],
            new Vector(3, 2),
            this.objects[7],
            new Vector(0, 0),
        ));
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
