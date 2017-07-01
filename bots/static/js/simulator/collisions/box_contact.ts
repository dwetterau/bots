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
    contactNormal.sub(localCenterPoint);

    dist = contactNormal.squareMagnitude();
    if (dist > disc.radius * disc.radius) {
        return []
    }

    let contactPoint = box.translateLocalPoint(closestPoint);
    contactNormal = contactPoint.copy();
    contactNormal.sub(disc.position);
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

export function boxToBoxContact(box1: Box, box2: Box): Array<ContactData> {
    let toCenter = box2.position.copy();
    toCenter.sub(box1.position);

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

    // Returns the normal and the contactPoint for the collision with the other box.
    let getNormalAndContactPoint = function(box: Box, toCenter: Vector): [Vector, Vector] {
        let normal = axises[bestIndex].copy();
        if (normal.dot(toCenter) > 0) {
            normal.reverse();
        }

        let vertex = new Vector(box.halfX, box.halfY);
        if (box.getAxis(0).dot(normal) < 0) {
            vertex.a = -vertex.a
        }
        if (box.getAxis(1).dot(normal) < 0) {
            vertex.b = -vertex.b
        }
        return [normal, box.translateLocalPoint(vertex)];
    };

    let contactPoint = new Vector(0, 0);
    let contactNormal = new Vector(0, 0);
    if (bestIndex <= 1) {
        [contactNormal, contactPoint] = getNormalAndContactPoint(box2, toCenter)
    } else {
        // Reverse the toCenter vector
        toCenter.reverse();
        [contactNormal, contactPoint] = getNormalAndContactPoint(box1, toCenter);
        // We need to flip the normal again because of the ordering imposed
        // by the detector;
        contactNormal.reverse();
    }

    return [{
        contactNormal: contactNormal,
        contactPoint: contactPoint,
        penetration: bestOverlap,
    }]
}