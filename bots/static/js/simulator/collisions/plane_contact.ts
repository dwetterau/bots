import {ContactData} from "./contact_generator";
import {Disc} from "../objects/disc";
import {Plane} from "../objects/plane";

export function planeToDiscContact(plane: Plane, disc: Disc): Array<ContactData> {
    let distance = plane.normal.dot(disc.position) -  disc.radius - plane.offset;

    if (distance >= 0) {
        return []
    }

    let point = disc.position.copy();
    point.sub(plane.normal.scale(distance + disc.radius));
    let contactNormal = plane.normal.copy();
    contactNormal.reverse();
    return [{
        contactNormal: contactNormal,
        contactPoint: point,
        penetration: -distance,
    }]
}
