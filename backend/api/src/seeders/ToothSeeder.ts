import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Tooth } from '../common/entities/tooth.entity';

export class ToothSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const teethData: { number: number; name: string }[] = [];

    // Adult teeth (Quadrants 1-4, Teeth 1-8)
    for (let q = 1; q <= 4; q++) {
      for (let t = 1; t <= 8; t++) {
        const isoNumber = parseInt(`${q}${t}`);
        teethData.push({
          number: isoNumber,
          name: this.getToothName(q, t),
        });
      }
    }

    // Child teeth (Quadrants 5-8, Teeth 1-5)
    for (let q = 5; q <= 8; q++) {
      for (let t = 1; t <= 5; t++) {
        const isoNumber = parseInt(`${q}${t}`);
        teethData.push({
          number: isoNumber,
          name: this.getChildToothName(q, t),
        });
      }
    }

    for (const tooth of teethData) {
      const exists = await em.findOne(Tooth, { number: tooth.number });
      if (!exists) {
        const t = new Tooth(tooth.number, tooth.name);
        em.persist(t);
      }
    }
  }

  private getToothName(quadrant: number, tooth: number): string {
    const names = [
      'Central Incisor',
      'Lateral Incisor',
      'Canine',
      'First Premolar',
      'Second Premolar',
      'First Molar',
      'Second Molar',
      'Third Molar',
    ];
    const positions = [
      'Upper Right',
      'Upper Left',
      'Lower Left',
      'Lower Right',
    ];
    return `${positions[quadrant - 1]} ${names[tooth - 1]}`;
  }

  private getChildToothName(quadrant: number, tooth: number): string {
    const names = [
      'Central Incisor',
      'Lateral Incisor',
      'Canine',
      'First Molar',
      'Second Molar',
    ];
    const positions = [
      'Upper Right',
      'Upper Left',
      'Lower Left',
      'Lower Right',
    ];
    return `Deciduous ${positions[quadrant - 5]} ${names[tooth - 1]}`;
  }
}
