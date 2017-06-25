import {WorldObject} from "./world_object";
import {Vector} from "./vector";
import {Disc} from "./objects/disc";
import {ContactGenerator} from "./collisions/contact_generator";
import {ContactResolver} from "./collisions/contact_resolver";
import {Plane} from "./objects/plane";
import {Box} from "./objects/box";

export class World {

    // Universal constants
    Gravity = 20;
    Restitution = .8;
    Tolerance = .005;
    VelocityLimit = .25;
    AngularLimit = .2;

    // World info
    height: number = 100;
    width: number = 0;
    gravityDirection: Vector = new Vector(0, -1);
    objects: Array<WorldObject> = [];

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
            new Vector(50, 50),
            10, // mass
            5,  // radius
        ));
        this.objects.push(new Disc(
            new Vector(89, 50),
            20, // mass
            10, // radius
        ));
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

        // A box!
        this.objects.push(new Box(
            new Vector(20, 80),
            10,    // mass
            18,     // halfX
            9,      // halfY
        ));

        this.objects[0].velocity = new Vector(4, 12);
        this.objects[1].velocity = new Vector(-10, 12);
        this.objects[6].velocity = new Vector(2, -10);
        this.objects[6].angularVelocity = -.5;
    }

    moveObjects(timestep: number) {
        let dt = timestep / 1000.0;
        let gravity = this.gravityDirection.scale(this.Gravity);

        // TODO: Collisions with walls and other objects

        for (let object of this.objects) {
            object.clearForFrame();

            // Hack to test out a rotation
            if (this.objects[0].position.a == 50 && this.objects[0].position.b == 50) {
                // Force going up at the right edge
                object.accumulateForce(new Vector(0, 10 * 1000), new Vector(55, 50));
            }

            if (object.mass != Infinity) {
                // Only apply gravity if the object has non-infinite mass
                object.accumulateForce(gravity.scale(object.mass), object.position);
            }
            object.setAcceleration();
            object.updateVelocity(dt);
            object.updatePosition(dt);

            object.setAngularAcceleration();
            object.updateAngularVelocity(dt);
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
