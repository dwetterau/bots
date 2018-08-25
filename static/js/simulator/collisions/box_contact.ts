import {ContactData} from "./contact_generator";
import {Disc} from "../objects/disc";
import {Box} from "../objects/box";
import {Vector} from "../vector";

export function boxToDiscContact(box: Box, disc: Disc): Array<ContactData> {
    let localCenterPoint = box.translateRealWorldPoint(disc.position);
    let closestPoint = new Vector(0, 0);

    // Clamp the point in each dimension
    let dist = localCenterPoint.a;
    if (dist > box.halfX) {
        dist = box.halfX
    } else if (dist < -box.halfX) {
        dist = -box.halfX
    }
    closestPoint.a = dist;

    dist = localCenterPoint.b;
    if (dist > box.halfY) {
        dist = box.halfY
    } else if (dist < -box.halfY) {
        dist = -box.halfY
    }
    closestPoint.b = dist;

    let contactNormal = closestPoint.copy();
    contactNormal.subInPlace(localCenterPoint);

    dist = contactNormal.squareMagnitude();
    if (dist > disc.radius * disc.radius) {
        return []
    }

    let contactPoint = box.translateLocalPoint(closestPoint);
    contactNormal = contactPoint.copy();
    contactNormal.subInPlace(disc.position);
    contactNormal.normalize();
    return [{
        contactNormal,
        contactPoint,
        penetration: disc.radius - Math.sqrt(dist),
    }]
}

// Returns the amount that the boxes are overlapping along the given axis.
// Positive means they are overlapping by that much, negative is the separation.
function penetrationOnAxis(box1: Box, box2: Box, axis: Vector, toCenter: Vector): number {
    let projection1 = box1.transformToAxis(axis);
    let projection2 = box2.transformToAxis(axis);

    let distance = Math.abs(axis.dot(toCenter));
    return projection1 + projection2 - distance;
}

// Returns the normal and the contactPoint for the collision with the other box.
let computeContactPoint = function(box: Box, toEdgeBox: Vector): Vector {
    // This originally used the normal to figure this out, but I don't think that
    // has enough information to properly decide which point is actually in contact.
    //
    // This may only be a problem for test scenarios where things are perfectly aligned.
    //
    // Instead, we'll use the vector between the boxes to determine which is the closest point.
    let vertex = new Vector(box.halfX, box.halfY);
    if (box.getAxis(0).dot(toEdgeBox) < 0) {
        vertex.a = -vertex.a
    }
    if (box.getAxis(1).dot(toEdgeBox) < 0) {
        vertex.b = -vertex.b
    }
    return box.translateLocalPoint(vertex);
};

export function boxToBoxContact(box1: Box, box2: Box): Array<ContactData> {
    let toCenter = box2.position.copy();
    toCenter.subInPlace(box1.position);

    // Try all axises
    let axises = [
        box1.getAxis(0),
        box1.getAxis(1),
        box2.getAxis(0),
        box2.getAxis(1),
    ];

    let bestOverlap = Infinity;
    let bestIndex = -1;
    for (let [i, a] of axises.entries()) {
        let overlap = penetrationOnAxis(box1, box2, a, toCenter);
        if (overlap < 0) {
            return []
        }
        if (overlap < bestOverlap) {
            bestOverlap = overlap;
            bestIndex = i;
        }
    }

    let contactPoint = new Vector(0, 0);

    // toCenter originally always points from box1 -> box2
    // This ensures that toCenter is always pointing to the box with the edge in the
    // edge, vertex collision pair. This also means it's pointing away from the box with
    // the vertex, which is useful for determining the contact point.
    if (bestIndex <= 1) {
        toCenter.reverseInPlace();
    }

    // This computes the normal which is the same as the axis that we found the "best" penetration
    // with ("best" here means smallest). The conditional ensures that we're picking the proper
    // face, namely the one in the direction of the box with the vertex.
    // The value of the contactNormal feels a little backwards, but it's because we want to flip
    // the value of the face's normal (since the contact is pointing into the face).
    let contactNormal = axises[bestIndex];
    if (contactNormal.dot(toCenter.reverse()) > 0) {
        contactNormal.reverseInPlace();
    }

    if (bestIndex <= 1) {
        contactPoint = computeContactPoint(box2, toCenter)
    } else {
        contactPoint = computeContactPoint(box1, toCenter);
        // We need to flip the normal again because of the ordering imposed
        // by the detector;
        contactNormal.reverseInPlace();
    }

    return [{
        contactNormal: contactNormal,
        contactPoint: contactPoint,
        penetration: bestOverlap,
    }]
}