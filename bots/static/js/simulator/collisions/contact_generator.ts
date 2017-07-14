import {Vector} from "../vector";
import {World} from "../world";
import {WorldObject, WorldObjectID} from "../world_object";
import {Disc} from "../objects/disc";
import {discToDiscContact} from "./disc_contact";
import {Plane} from "../objects/plane";
import {planeToDiscContact, planeToBoxContact} from "./plane_contact";
import {Box} from "../objects/box";
import {boxToDiscContact, boxToBoxContact} from "./box_contact";
import {Particle} from "../objects/particle";

export interface Contact {
    data: ContactData
    object1Id: WorldObjectID
    object2Id: WorldObjectID
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
            let a = this.world.objectIDToAssembly[o1.id];
            for (let j = i + 1; j < this.world.objects.length; j++) {
                // If the two objects are in the same assembly, we want to skip all detection
                let o2 = this.world.objects[j];
                if (a && a.contains(o2)) {
                    continue
                }

                for (let contact of this.computeContactData(o1, o2)) {
                    contacts.push({
                        data: contact,
                        object1Id: o1.id,
                        object2Id: o2.id,
                    })
                }
            }
        }

        // Examine the joints for contacts
        for (let j of this.world.joints) {
            if (j.exceedsThreshold()) {
                contacts.push({
                    data: j.generateContact(),
                    object1Id: j.o1.id,
                    object2Id: j.o2.id,
                })
            }
        }

        return contacts;
    }

    flip(
        f: (o1: WorldObject, o2: WorldObject) => Array<ContactData>,
    ): (o1: WorldObject, o2: WorldObject) => Array<ContactData> {

        return (o1: WorldObject, o2: WorldObject) => {
            let contactData = f(o2, o1);
            for (let i in contactData) {
                contactData[i].contactNormal.reverse();
            }
            return contactData
        };
    }

    computeContactData(o1: WorldObject, o2: WorldObject): Array<ContactData> {
        let typePairs = [
            [Disc, Disc],
            [Disc, Plane],
            [Disc, Box],
            [Disc, Particle],

            [Plane, Disc],
            [Plane, Plane],
            [Plane, Box],
            [Plane, Particle],

            [Box, Disc],
            [Box, Plane],
            [Box, Box],
            [Box, Particle],

            [Particle, Disc],
            [Particle, Plane],
            [Particle, Box],
            [Particle, Particle],
        ];
        let nullGenerator = (o1: WorldObject, o2: WorldObject): Array<ContactData> => {
            return [];
        };

        let generators = [
            discToDiscContact,
            this.flip(planeToDiscContact),
            this.flip(boxToDiscContact),
            nullGenerator,

            planeToDiscContact,
            nullGenerator,
            planeToBoxContact,
            nullGenerator,

            boxToDiscContact,
            this.flip(planeToBoxContact),
            boxToBoxContact,
            nullGenerator,

            nullGenerator,
            nullGenerator,
            nullGenerator,
            nullGenerator,
        ];

        for (let [i, [type1, type2]] of typePairs.entries()) {
            if (o1 instanceof type1 && o2 instanceof type2) {
                return generators[i](o1, o2)
            }
        }
        
        throw Error("Missing object type handling")
    }
}
