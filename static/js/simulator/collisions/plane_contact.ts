import {ContactData} from "./contact_generator";
import {Disc} from "../objects/disc";
import {Plane} from "../objects/plane";
import {Box} from "../objects/box";
import {Vector} from "../vector";

export function planeToDiscContact(plane: Plane, disc: Disc): Array<ContactData> {
    let distance = plane.normal.dot(disc.position) -  disc.radius - plane.offset;

    if (distance >= 0) {
        return []
    }

    let point = disc.position.copy();
    point.subInPlace(plane.normal.scale(disc.radius));
    let contactNormal = plane.normal.copy();
    contactNormal.reverseInPlace();
    return [{
        contactNormal: contactNormal,
        contactPoint: point,
        penetration: -distance,
    }]
}

export function planeToBoxContact(plane: Plane, box: Box): Array<ContactData> {
    let realWorldPoints = [
        // top left
        box.translateLocalPoint(new Vector(-box.halfX, box.halfY)),
        // top right
        box.translateLocalPoint(new Vector(box.halfX, box.halfY)),
        // bottom left
        box.translateLocalPoint(new Vector(-box.halfX, -box.halfY)),
        // bottom right
        box.translateLocalPoint(new Vector(box.halfX, -box.halfY)),
    ];
    let contacts: Array<ContactData> = [];
    for (let point of realWorldPoints) {
        let contactNormal = plane.normal.copy();
        contactNormal.reverseInPlace();

        // See if the point is penetrating the plane
        let distance = plane.normal.dot(point) - plane.offset;

        if (distance >= 0) {
            continue
        }
        contacts.push({
            contactNormal: contactNormal,
            contactPoint: point,
            penetration: -distance,
        });
    }
    return contacts;
}