import {ContactData} from "./contact_generator";
import {Disc} from "../objects/disc";

export function discToDiscContact(o1: Disc, o2: Disc): ContactData | null {
    let midline = o1.position.copy();
    midline.sub(o2.position);

    let distance = midline.magnitude();
    if (distance == 0 || distance >= o1.radius + o2.radius) {
        return null
    }

    let normal = midline.scale(1 / distance);
    let contactPoint = o1.position.copy();
    contactPoint.add(midline.scale(.5));
    let penetration = o1.radius + o2.radius - distance;
    return {
        contactNormal: normal,
        contactPoint: contactPoint,
        penetration: penetration,
    }
}