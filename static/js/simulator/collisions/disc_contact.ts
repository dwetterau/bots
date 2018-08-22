import {ContactData} from "./contact_generator";
import {Disc} from "../objects/disc";

export function discToDiscContact(o1: Disc, o2: Disc): Array<ContactData> {
    let midline = o1.position.copy();
    midline.sub(o2.position);

    let distance = midline.magnitude();
    if (distance == 0) {
        throw Error("can't resolve disc contact with perfect overlap")
    }
    if (distance >= o1.radius + o2.radius) {
        return []
    }

    let normal = midline.scale(1 / distance);
    let contactPoint = o2.position.copy();
    contactPoint.add(normal.scale(o2.radius));
    let penetration = o1.radius + o2.radius - distance;
    return [{
        contactNormal: normal,
        contactPoint: contactPoint,
        penetration: penetration,
    }]
}