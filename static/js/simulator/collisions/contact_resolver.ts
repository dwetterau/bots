import {World} from "../world";
import {Contact} from "./contact_generator";
import {Vector} from "../vector";
import {Matrix} from "../matrix";
import {WorldObject} from "../world_object";
import {Complex} from "../complex";

interface PositionChangeInfo {
    linearChanges: Array<Vector>
    angularChanges: Array<number>
}

interface VelocityChangeInfo {
    velocityChanges: Array<Vector>
    angularVelocityChanges: Array<number>
}

// TODO: don't expose these, it's just for tests
// Returns a matrix for converting between contact coordinates and world coordinates.
// `transform()` on the matrix converts a contact-local vector to a world vector
// `transformTranspose()` does the opposite.
// Conceptually, turns the provided normal into the x axis, and the tangent into y.
export function computeContactToWorld(normal: Vector): Matrix {
    return new Matrix(normal.a, -normal.b, normal.b, normal.a);
}

export function calculateContactVelocity(
    relativeContactPosition: Vector,
    contactToWorld: Matrix,
    o: WorldObject,
    duration: number,
): Vector {
    let velocity = o.velocityAtPoint(relativeContactPosition);
    return contactToWorld.transformTranspose(velocity);

    /*
    let accelerationVelocity = this.contactToWorld.transformTranspose(
        o.lastFrameAcceleration.scale(duration)
    );

    // We clear out all acceleration in the direction of the contact
    accelerationVelocity.a = 0;
    contactVelocity.addInPlace(accelerationVelocity);

    return contactVelocity;
    */
}

export function calculateDesiredDeltaVelocity(
    world: World,
    contactVelocity: Vector,
    duration: number,
): number {
    /*
    let o1 = world.idToObject[this.contact.object1Id];
    let o2 = world.idToObject[this.contact.object2Id];

    // This is a later optimization
    let velocityFromAcceleration = o1.lastFrameAcceleration
        .scale(duration)
        .dot(this.contact.data.contactNormal);
    velocityFromAcceleration -= o2.lastFrameAcceleration
        .scale(duration)
        .dot(this.contact.data.contactNormal);
    */

    // If the velocity is low, we don't consider restitution
    let restitution = world.Restitution;
    if (Math.abs(contactVelocity.a) < world.VelocityLimit) {
        restitution = 0
    }

    /*
    return -this.contactVelocity.a
        - restitution * (this.contactVelocity.a - velocityFromAcceleration)
    */
    return -contactVelocity.a * (1 + restitution);
}


export class PreparedContact {
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

    // TODO(davidw): Allow this to be set by the objects themselves
    friction = 0.4;

    constructor(contact: Contact, world: World, duration: number) {
        this.contact = contact;
        this.contactToWorld = computeContactToWorld(contact.data.contactNormal);

        this.relativeContactPosition = [
            this.contact.data.contactPoint.sub(world.idToObject[contact.object1Id].position),
            this.contact.data.contactPoint.sub(world.idToObject[contact.object2Id].position),
        ];

        this.contactVelocity = calculateContactVelocity(
            this.relativeContactPosition[0],
            this.contactToWorld,
            world.idToObject[contact.object1Id],
            duration,
        ).sub(calculateContactVelocity(
            this.relativeContactPosition[1],
            this.contactToWorld,
            world.idToObject[contact.object2Id],
            duration,
        ));

        this.desiredDeltaVelocity = calculateDesiredDeltaVelocity(
            world,
            this.contactVelocity,
            duration
        );
    }

    computePositionChange(world: World): PositionChangeInfo {
        let linearChanges: Array<Vector> = [new Vector(0, 0), new Vector(0, 0)];
        let angularChanges: Array<number> = [0, 0];

        let linearMove = [0, 0];
        let angularMove = [0, 0];

        let totalInertia = 0;
        let linearInertia = [0, 0];
        let angularInertia = [0, 0];

        let objects = [
            world.idToObject[this.contact.object1Id],
            world.idToObject[this.contact.object2Id],
        ];

        for (let [i, o] of objects.entries()) {
            linearInertia[i] = o.inverseMass();
            angularInertia[i] = 1 / o.momentOfInertia();
            totalInertia += linearInertia[i] + angularInertia[i];
        }
        let penetration = this.contact.data.penetration;

        for (let i of [0, 1]) {
            let sign = i == 0 ? 1 : -1;
            linearMove[i] = sign * penetration * (linearInertia[i] / totalInertia);
            angularMove[i] = sign * penetration * (angularInertia[i] / totalInertia);

            // Limit the angular move to avoid too large of angular moves
            let projection = this.relativeContactPosition[i].copy();
            projection.addInPlace(
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
            angularChanges[i] = this.relativeContactPosition[i].cross(this.contact.data.contactNormal)
                * angularInertia[i] * angularMove[i];
            // Calculate the linear component
            linearChanges[i] = this.contact.data.contactNormal.scale(linearMove[i]);
        }

        return {
            linearChanges,
            angularChanges
        }
    }

    applyVelocityChange(world: World): VelocityChangeInfo {
        let velocityChanges = [new Vector(0, 0), new Vector(0, 0)];
        let angularVelocityChanges = [0, 0];

        // TODO(davidw): Switch methods when friction is 0
        //let impulseContact = this.calculateFrictionlessImpulse(world);
        // TODO: Switch back when it's right
        let impulseContact = this.calculateFrictionImpulse(world);

        // Transform impulse to world coordinates
        let impulse = this.contactToWorld.transform(impulseContact);

        for (let [i, objectId] of [
            this.contact.object1Id, this.contact.object2Id
        ].entries()) {
            let o = world.idToObject[objectId];

            let impulsiveTorque: number;
            if (i == 0) {
                impulsiveTorque = this.relativeContactPosition[i].cross(impulse);
            } else {
                impulsiveTorque = impulse.cross(this.relativeContactPosition[i]);
            }
            angularVelocityChanges[i] = impulsiveTorque / o.momentOfInertia();

            let signedImpulse = impulse.scale(o.inverseMass());
            if (i == 1) {
                signedImpulse.reverseInPlace();
            }
            velocityChanges[i].addInPlace(signedImpulse);

            // Actually apply the changes to the object
            o.velocity.addInPlace(velocityChanges[i]);
            o.angularVelocity += angularVelocityChanges[i];
        }
        return {
            velocityChanges,
            angularVelocityChanges,
        }
    }

    calculateFrictionlessImpulse(world: World): Vector {
        let deltaV = 0;
        for (let [i, objectId] of [
            this.contact.object1Id, this.contact.object2Id
        ].entries()) {
            let o = world.idToObject[objectId];

            let torquePerUnitImpulse = this.relativeContactPosition[i]
                .cross(this.contact.data.contactNormal);

            let rotationPerUnitImpulse = torquePerUnitImpulse / o.momentOfInertia();
            // If we think of rotationPerUnitImpulse as delta w, then we can get delta v
            // by multiplying by r. We are then assuming the delta v is in the direction
            // perpendicular to the position of the point (the tangent of the surface where the
            // contact is). This shorthand also uses the fact that the magnitude of the vector
            // we choose matches the original (which is also r).
            // Note: this implementation is similar to velocityAtPoint().
            let velocityPerUnitImpulse = new Vector(
                -this.relativeContactPosition[i].b,
                this.relativeContactPosition[i].a,
            ).scale(rotationPerUnitImpulse);

            // Convert this back to contact coordinates
            // This is an optimization of simply this.contactToWorld.transformTranspose(vel)
            // since we don't care about non-x directions for frictionless impulse
            // TODO: Get rid of this step?
            deltaV += velocityPerUnitImpulse.dot(this.contact.data.contactNormal);

            deltaV += o.inverseMass()
        }
        return new Vector(
            this.desiredDeltaVelocity / deltaV,
            0,
        );
    }

    // TODO: I think all of this is wrong
    calculateFrictionImpulse(world: World): Vector {
        let impulseUnitToContactVelocityFunctions = [];
        for (let [i, objectId] of [
            this.contact.object1Id, this.contact.object2Id
        ].entries()) {
            let o = world.idToObject[objectId];

            impulseUnitToContactVelocityFunctions.push(function (impulseDirection: Vector): Vector {
                let worldImpulseDirection = this.contactToWorld.transform(impulseDirection);
                let torquePerUnitImpulse = this.relativeContactPosition[i]
                    .cross(worldImpulseDirection);
                let rotationPerUnitImpulse = torquePerUnitImpulse / o.momentOfInertia();
                let velocityPerUnitImpulse = new Vector(
                    -this.relativeContactPosition[i].b,
                    this.relativeContactPosition[i].a,
                ).scale(rotationPerUnitImpulse);

                // Add in the linear component too
                velocityPerUnitImpulse.addInPlace(worldImpulseDirection.scale(o.inverseMass()));
                velocityPerUnitImpulse = this.contactToWorld
                    .transformTranspose(velocityPerUnitImpulse);
                return velocityPerUnitImpulse
            }.bind(this));
        }

        let velocitiesToEliminate = new Vector(
            this.desiredDeltaVelocity,
            -this.contactVelocity.b,
        );
        let impulseDirection = velocitiesToEliminate.copy();
        impulseDirection.normalize();

        let velocityPerUnitImpulseContact = new Vector(0, 0);
        for (let f of impulseUnitToContactVelocityFunctions) {
            velocityPerUnitImpulseContact.addInPlace(f(impulseDirection));
        }
        let scale = this.desiredDeltaVelocity / velocityPerUnitImpulseContact.a;
        let impulseContact = velocityPerUnitImpulseContact.copy();
        impulseContact.normalize();
        impulseContact.scaleInPlace(scale);

        let planarImpulse = Math.abs(impulseContact.b);
        if (planarImpulse > impulseContact.a * this.friction) {
            // Adjust the impulse contact according to friction
            impulseContact.b /= planarImpulse;
            impulseContact.a = velocityPerUnitImpulseContact.a
                + velocityPerUnitImpulseContact.b * this.friction * impulseContact.b;
            impulseContact.a = this.desiredDeltaVelocity / impulseContact.a;
            impulseContact.b *= this.friction * impulseContact.a;
        }
        return impulseContact;
    }
}

export class ContactResolver {

    maxPositionIterations = 10000;
    maxVelocityIterations = 10000;
    velocityEpsilon = 0.001;

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

    applyPositionChange(world: World, contact: Contact, positionChangeInfo) {
        for (let i of [0, 1]) {
            let id = (i == 0) ? contact.object1Id: contact.object2Id;
            let o = this.world.idToObject[id];
            o.position.addInPlace(positionChangeInfo.linearChanges[i]);
            o.setRotation(positionChangeInfo.angularChanges[i]);
        }
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
                .computePositionChange(this.world);

            // Apply the actual movements
            this.applyPositionChange(this.world, contacts[maxIndex].contact, positionChangeInfo);

            // Resolve all of the penetrations of the other contacts involving these
            // objects.
            for (let c of contacts) {
                for (let b of [0, 1]) {
                    let thisObjectId = c.contact.object1Id;
                    if (b == 1) {
                        thisObjectId = c.contact.object2Id;
                    }

                    for (let d of [0, 1]) {
                        let resolvedObjectId = contacts[maxIndex]
                            .contact.object1Id;
                        if (d == 1) {
                            resolvedObjectId = contacts[maxIndex]
                                .contact.object2Id;
                        }

                        if (thisObjectId == resolvedObjectId) {
                            let deltaPosition = positionChangeInfo.linearChanges[d].copy();
                            deltaPosition.addInPlace(
                                Matrix.fromRotation(
                                    Complex.fromRotation(positionChangeInfo.angularChanges[d]),
                                ).transform(
                                    c.relativeContactPosition[b]
                                )
                            );
                            deltaPosition.subInPlace(c.relativeContactPosition[b]);
                            let sign = b == 1 ? 1 : -1;
                            c.contact.data.penetration +=
                                sign * (deltaPosition.dot(c.contact.data.contactNormal));
                        }
                    }
                }
            }
        }
        if (iteration >= this.maxPositionIterations) {
            throw Error("Hit position iteration limit")
        }
    }

    adjustVelocities(contacts: Array<PreparedContact>, duration: number) {
        let iteration = 0;
        while (iteration++ < this.maxVelocityIterations) {
            // Find the contact with the highest desired velocity change.
            let maxIndex = -1;
            let maxDeltaV = this.velocityEpsilon;
            for (let [i, c] of contacts.entries()) {
                if (c.desiredDeltaVelocity > maxDeltaV) {
                    maxDeltaV = c.desiredDeltaVelocity;
                    maxIndex = i;
                }
            }
            if (maxIndex == -1) {
                break
            }

            let velocityChangeInfo = contacts[maxIndex]
                .applyVelocityChange(this.world);

            // Compute the relative closing velocities as needed
            for (let c of contacts) {
                for (let b of [0, 1]) {
                    let thisObjectId = c.contact.object1Id;
                    if (b == 1) {
                        thisObjectId = c.contact.object2Id;
                    }

                    for (let d of [0, 1]) {
                        let resolvedObjectId = contacts[maxIndex]
                            .contact.object1Id;
                        if (d == 1) {
                            resolvedObjectId = contacts[maxIndex]
                                .contact.object2Id;
                        }

                        if (thisObjectId == resolvedObjectId) {
                            let deltaV = velocityChangeInfo.velocityChanges[d].copy();
                            deltaV.addInPlace(
                                new Vector(
                                    -c.relativeContactPosition[b].b,
                                    c.relativeContactPosition[b].a,
                                ).scale(velocityChangeInfo.angularVelocityChanges[d])
                            );
                            let signedDeltaV = c.contactToWorld.transformTranspose(deltaV);
                            if (b == 1) {
                                signedDeltaV.reverseInPlace()
                            }
                            c.contactVelocity.addInPlace(signedDeltaV);
                            c.desiredDeltaVelocity =
                                calculateDesiredDeltaVelocity(
                                    this.world,
                                    c.contactVelocity,
                                    duration,
                                );
                        }
                    }
                }
            }
        }
        if (iteration >= this.maxVelocityIterations) {
            throw Error("Hit velocity iteration limit")
        }
    }
}
