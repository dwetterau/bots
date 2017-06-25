import {Vector} from "../vector";
import {World} from "../world";
import {WorldObject} from "../world_object";
import {Disc} from "../objects/disc";
import {discToDiscContact} from "./disc_contact";
import {Plane} from "../objects/plane";
import {planeToDiscContact} from "./plane_contact";

export interface Contact {
    data: ContactData
    object1Index: number
    object2Index: number
}

export interface ContactData{
    contactPoint: Vector
    contactNormal: Vector
    penetration: number
}

export class ContactGenerator {
    world: World;

    constructor(world: World) {
        this.world = world;
    }

    detectContacts(): Array<Contact> {
        let contacts: Array<Contact> = [];

        // TODO: Use a KD tree or something
        for (let i = 0; i < this.world.objects.length; i++) {
            let o1 = this.world.objects[i];
            for (let j = i + 1; j < this.world.objects.length; j++) {
                let contact = this.computeContactData(o1, this.world.objects[j]);
                if (contact != null) {
                    contacts.push({
                        data: contact,
                        object1Index: i,
                        object2Index: j,
                    })
                }
            }
        }

        return contacts;
    }

    flip(contactData: ContactData | null): ContactData | null {
        if (contactData == null) {
            return null
        }
        contactData.contactNormal.reverse();
        return contactData
    }

    computeContactData(o1: WorldObject, o2: WorldObject): ContactData | null {
        if (o1 instanceof Disc) {
            if (o2 instanceof Disc) {
                return discToDiscContact(o1, o2);
            }

            if (o2 instanceof Plane) {
                return this.flip(planeToDiscContact(o2, o1));
            }
        }

        if (o1 instanceof Plane) {
            if (o2 instanceof Disc) {
                return planeToDiscContact(o1, o2);
            }

            // We don't allow Plane/Plane collisions
            if (o2 instanceof Plane) {
                return null
            }
        }

        throw Error("Missing object type handling")
    }
}
