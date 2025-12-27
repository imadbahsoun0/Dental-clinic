import { Entity, Property, PrimaryKey, Collection, ManyToMany } from '@mikro-orm/core';
import { Treatment } from './treatment.entity';

@Entity({ tableName: 'teeth' })
export class Tooth {
    @PrimaryKey({ autoincrement: false })
    number!: number; // ISO 3950 or Universal

    @Property({ length: 255 })
    name!: string;

    // We might want back-reference if needed, but not strictly necessary
    // @ManyToMany(() => Treatment, treatment => treatment.teeth)
    // treatments = new Collection<Treatment>(this);

    constructor(number: number, name: string) {
        this.number = number;
        this.name = name;
    }
}
