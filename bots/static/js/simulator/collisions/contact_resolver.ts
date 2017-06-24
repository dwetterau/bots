import {World} from "../world";
import {Contact} from "./contact_generator";
import {Vector} from "../vector";
import {Matrix} from "../matrix";
import {WorldObject} from "../world_object";

interface PositionChangeInfo {
    linearChanges: Array<Vector>
    angularChanges: Array<number>
}


class PreparedContact {
    contact: Contact;

    // A matrix that can convert coordinates from the contact frame to the world's frame
    contactToWorld: Matrix;

    // The closing velocity at the point of contact
    contactVelocity: Vector;

    // The required change in velocity to resolve the contact
    desiredDeltaVelocity: number;

    // The real-world position of each contact point relative to each
    // object's origin.
    relativeContactPosition: Array<Vector>;

    constructor(contact: Contact, world: World, duration: number) {
        this.contact = contact;
        this.contactToWorld = this.computeContactToWorld(contact.data.contactNormal);

        this.relativeContactPosition = [
            this.contact.data.contactPoint.copy(),
            this.contact.data.contactPoint.copy(),
        ];
        this.relativeContactPosition[0].sub(world.objects[contact.object1Index].position);
        this.relativeContactPosition[1].sub(world.objects[contact.object2Index].position);

        this.contactVelocity = this.calculateLocalVelocity(
            0,
            world.objects[contact.object1Index],
            duration,
        );
        this.contactVelocity.sub(this.calculateLocalVelocity(
            1,
            world.objects[contact.object2Index],
            duration,
        ));

        this.desiredDeltaVelocity = this.calculateDesiredDeltaVelocity(world, duration);
    }

    computeContactToWorld(normal: Vector): Matrix {
        return new Matrix(normal.a, normal.b, normal.b, -normal.a);
    }

    calculateLocalVelocity(objectIndex: number, o: WorldObject, duration: number): Vector {
        let velocity = o.velocityAtPoint(this.relativeContactPosition[objectIndex]);
        let contactVelocity = this.contactToWorld.transformTranspose(velocity);

        let accelerationVelocity = this.contactToWorld.transformTranspose(
            o.acceleration.scale(duration)
        );

        // We clear out all acceleration in the direction of the contact
        accelerationVelocity.a = 0;
        contactVelocity.add(accelerationVelocity);

        return contactVelocity;
    }

    calculateDesiredDeltaVelocity(world: World, duration: number) {
        let o1 = world.objects[this.contact.object1Index];
        let o2 = world.objects[this.contact.object2Index];

        let velocityFromAcceleration = o1.acceleration
            .scale(duration)
            .dot(this.contact.data.contactNormal);
        velocityFromAcceleration += o2.acceleration
            .scale(duration)
            .dot(this.contact.data.contactNormal);

        // If the velocity is low, we don't consider restitution
        let restitution = world.Restitution;
        if (Math.abs(this.contactVelocity.a) < world.VelocityLimit) {
            restitution = 0
        }

        return -this.contactVelocity.a
            - restitution * (this.contactVelocity.a - velocityFromAcceleration)
    }

    applyPositionChange(world: World, penetration: number): PositionChangeInfo {
        let linearChanges: Array<Vector> = [new Vector(0, 0), new Vector(0, 0)];
        let angularChanges: Array<number> = [0, 0];

        let linearMove = [0, 0];
        let angularMove = [0, 0];

        let totalInertia = 0;
        let linearInertia = [0, 0];
        let angularInertia = [0, 0];

        let objects = [
            world.objects[this.contact.object1Index],
            world.objects[this.contact.object2Index],
        ];

        for (let [i, o] of objects.entries()) {
            linearInertia[i] = o.inverseMass();
            angularInertia[i] = (
                this.relativeContactPosition[i].cross(this.contact.data.contactNormal)
                / o.momentOfInertia()
            );
            totalInertia += linearInertia[i] + angularInertia[i];
        }

        for (let [i, o] of objects.entries()) {
            let sign = i == 0 ? 1 : -1;
            angularMove[i] = sign * penetration * (angularInertia[i] / totalInertia);
            linearMove[i] = sign * penetration * (linearInertia[i] / totalInertia);

            // Limit the angular move to avoid too large of angular moves
            let projection = this.relativeContactPosition[i].copy();
            projection.add(
                this.contact.data.contactNormal.scale(
                    -this.relativeContactPosition[i].dot(this.contact.data.contactNormal)
                )
            );

            let maxMagnitude = world.AngularLimit * projection.magnitude();
            if (angularMove[i] < -maxMagnitude) {
                let totalMove = angularMove[i] + linearMove[i];
                angularMove[i] = -maxMagnitude;
                linearMove[i] = totalMove - angularMove[i];
            } else if (angularMove[i] > maxMagnitude) {
                let totalMove = angularMove[i] + linearMove[i];
                angularMove[i] = maxMagnitude;
                linearMove[i] = totalMove - angularMove[i];
            }

            // Calculate the rotation needed to obtain the angular move
            // TODO(davidw): Should this take the inertia into account again?
            angularChanges[i] = Math.atan(
                angularMove[i] / this.relativeContactPosition[i].magnitude()
            );

            // Calculate the linear component
            linearChanges[i] = this.contact.data.contactNormal.scale(linearMove[i]);

            // Apply the actual movements
            o.position.add(linearChanges[i]);
            o.setRotation(o.rotation + angularChanges[i]);
        }

        return {
            linearChanges,
            angularChanges
        }
    }
}

export class ContactResolver {

    maxPositionIterations = 100;
    world: World;

    constructor(world: World) {
        this.world = world;
    }

    resolve(contacts: Array<Contact>, duration: number) {
        if (contacts.length == 0) {
            return
        }

        let preparedContacts = this.prepareContacts(contacts, duration);
        this.adjustPositions(preparedContacts);
        this.adjustVelocities(preparedContacts, duration);
    }

    prepareContacts(contacts: Array<Contact>, duration: number): Array<PreparedContact> {
        let preparedContacts: Array<PreparedContact> = [];
        for (let c of contacts) {
            preparedContacts.push(new PreparedContact(c, this.world, duration));
        }
        return preparedContacts
    }

    adjustPositions(contacts: Array<PreparedContact>) {
        let iteration = 0;
        while (iteration++ < this.maxPositionIterations) {

            // Find the largest interpenetration
            let maxPenetration = 0;
            let maxIndex = 0;
            for (let [i, c] of contacts.entries()) {
                if (c.contact.data.penetration > maxPenetration) {
                    maxPenetration = c.contact.data.penetration;
                    maxIndex = i;
                }
            }
            if (maxPenetration < this.world.Tolerance) {
                break
            }

            // Resolve the penetration
            let positionChangeInfo = contacts[maxIndex]
                .applyPositionChange(this.world, maxPenetration);

            // Resolve all of the penetrations of the other objects
            for (let c of contacts) {
                for (let b of [0, 1]) {
                    let thisObjectIndex = c.contact.object1Index;
                    if (b == 1) {
                        thisObjectIndex = c.contact.object2Index;
                    }

                    for (let d of [0, 1]) {
                        let resolvedObjectIndex = contacts[maxIndex]
                            .contact.object1Index;
                        if (d == 1) {
                            resolvedObjectIndex = contacts[maxIndex]
                                .contact.object2Index;
                        }

                        if (thisObjectIndex == resolvedObjectIndex) {
                            let deltaPosition = positionChangeInfo.linearChanges[d].copy();
                            deltaPosition.add(
                                Matrix.fromRotation(
                                    positionChangeInfo.angularChanges[d]
                                ).transform(
                                    c.relativeContactPosition[b]
                                )
                            );
                            deltaPosition.sub(c.relativeContactPosition[b]);
                            let sign = b ? 1 : -1;
                            c.contact.data.penetration +=
                                sign * (deltaPosition.dot(c.contact.data.contactNormal));
                        }
                    }
                }
            }
        }
    }

    adjustVelocities(contacts: Array<PreparedContact>, duration: number) {
        // TODO(davidw): Finish this!
    }
}