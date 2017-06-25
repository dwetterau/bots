import {Vector} from "../vector";
import {World} from "../world";
import {WorldObject} from "../world_object";
import {Disc} from "../objects/disc";
import {discToDiscContact} from "./disc_contact";
import {Plane} from "../objects/plane";
import {planeToDiscContact, planeToBoxContact} from "./plane_contact";
import {Box} from "../objects/box";

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
                for (let contact of this.computeContactData(o1, this.world.objects[j])) {
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

    flip(
        f: (o1: WorldObject, o2: WorldObject) => Array<ContactData>,
    ): (o1: WorldObject, o2: WorldObject) => Array<ContactData> {

        return (o1: WorldObject, o2: WorldObject) => {
            let contactData = f(o2, o1);
            for (let c of contactData) {
                c.contactNormal.reverse();
            }
            return contactData
        };
    }

    computeContactData(o1: WorldObject, o2: WorldObject): Array<ContactData> {
        let typePairs = [
            [Disc, Disc],
            [Disc, Plane],
            [Disc, Box],
            [Plane, Disc],
            [Plane, Plane],
            [Plane, Box],
            [Box, Disc],
            [Box, Plane],
            [Box, Box],
        ];
        let nullGenerator = (o1: WorldObject, o2: WorldObject): Array<ContactData> => {
            return [];
        };

        let generators = [
            discToDiscContact,
            this.flip(planeToDiscContact),
            nullGenerator,  // TODO(davidw): call flip(boxToDisc)
            planeToDiscContact,
            nullGenerator,
            planeToBoxContact,
            nullGenerator,  // TODO(davidw): implement boxToDisc
            this.flip(planeToBoxContact),
            nullGenerator,  // TODO(davidw): implement boxToBox
        ];

        for (let [i, [type1, type2]] of typePairs.entries()) {
            if (o1 instanceof type1 && o2 instanceof type2) {
                return generators[i](o1, o2)
            }
        }
        
        throw Error("Missing object type handling")
    }
}
