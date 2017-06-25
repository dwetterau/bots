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