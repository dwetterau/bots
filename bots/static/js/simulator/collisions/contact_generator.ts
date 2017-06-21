import {Vector} from "../vector";
import {World} from "../world";
import {WorldObject} from "../world_object";
import {Disc} from "../objects/disc";
import {discToDiscContact} from "./disc_contact";

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

    computeContactData(o1: WorldObject, o2: WorldObject): ContactData | null {
        // TODO: Flip these around as needed to make things easy
        if (o1 instanceof Disc) {
            if (o2 instanceof Disc) {
                return discToDiscContact(o1, o2);
            }
        }

        throw Error("Missing object type handling")
    }
}
