#!/usr/bin/env ts-node
import { EntityManager, MikroORM } from '@mikro-orm/core';
import * as dotenv from 'dotenv';
import { join } from 'path';
import mikroOrmConfig from '../common/config/mikro-orm.config';
import { MedicalHistoryQuestion } from '../common/entities/medical-history-question.entity';
import { TreatmentCategory } from '../common/entities/treatment-category.entity';
import { TreatmentType } from '../common/entities/treatment-type.entity';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

type CloneSection = 'medical-history' | 'categories' | 'types';

interface CliOptions {
  fromOrgId: string;
  toOrgId: string;
  execute: boolean;
  overwrite: boolean;
  sections: Set<CloneSection>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function usage(): string {
  return [
    'Clone org-scoped settings from one organization to another:',
    '',
    '  Medical History Questions',
    '  Treatment Categories',
    '  Treatment Types',
    '',
    'Usage:',
    '  npm run clone:org-settings -- --from <fromOrgId> --to <toOrgId> [--execute] [--overwrite] [--medical-history] [--categories] [--types]',
    '',
    'Defaults:',
    '  - Dry-run (no DB writes) unless --execute is provided',
    '  - If no section flags are provided, all sections are copied',
    '  - Treatment Types always ensure referenced categories exist in target',
    '',
    'Examples:',
    '  npm run clone:org-settings -- --from 11111111-1111-1111-1111-111111111111 --to 22222222-2222-2222-2222-222222222222',
    '  npm run clone:org-settings -- --from <A> --to <B> --execute --overwrite',
    '  npm run clone:org-settings -- --from <A> --to <B> --execute --medical-history',
  ].join('\n');
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[i + 1];

    if (next && !next.startsWith('--')) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function getStringArg(
  args: Record<string, string | boolean>,
  keys: string[],
): string | undefined {
  for (const k of keys) {
    const v = args[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function buildOptions(): CliOptions {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    console.log(usage());
    process.exit(0);
  }

  const fromOrgId = getStringArg(args, ['from', 'fromOrgId']);
  const toOrgId = getStringArg(args, ['to', 'toOrgId']);

  if (!fromOrgId || !toOrgId) {
    console.error('❌ Missing required arguments: --from and --to');
    console.log(usage());
    process.exit(1);
  }

  if (!UUID_RE.test(fromOrgId) || !UUID_RE.test(toOrgId)) {
    console.error('❌ fromOrgId/toOrgId must be valid UUIDs');
    process.exit(1);
  }

  if (fromOrgId === toOrgId) {
    console.error('❌ fromOrgId and toOrgId must be different');
    process.exit(1);
  }

  const execute = args.execute === true;
  const overwrite = args.overwrite === true;

  const sections = new Set<CloneSection>();
  if (args['medical-history'] === true) sections.add('medical-history');
  if (args.categories === true) sections.add('categories');
  if (args.types === true) sections.add('types');

  // default: all
  if (sections.size === 0) {
    sections.add('medical-history');
    sections.add('categories');
    sections.add('types');
  }

  return { fromOrgId, toOrgId, execute, overwrite, sections };
}

interface CopySummary {
  created: number;
  updated: number;
  skipped: number;
}

function emptySummary(): CopySummary {
  return { created: 0, updated: 0, skipped: 0 };
}

async function main() {
  const opts = buildOptions();

  console.log('='.repeat(70));
  console.log('🧬 Clone org settings');
  console.log(`From Org: ${opts.fromOrgId}`);
  console.log(`To Org:   ${opts.toOrgId}`);
  console.log(`Mode:     ${opts.execute ? 'EXECUTE (writes enabled)' : 'DRY-RUN (no writes)'}`);
  console.log(`Overwrite:${opts.overwrite ? 'YES' : 'NO'}`);
  console.log(`Sections: ${Array.from(opts.sections).join(', ')}`);
  console.log('='.repeat(70));

  let orm: MikroORM | undefined;

  try {
    orm = await MikroORM.init(mikroOrmConfig);
    const em = orm.em.fork();

    const run = async (entityManager: EntityManager) => {
      const categoriesSummary = emptySummary();
      const typesSummary = emptySummary();
      const questionsSummary = emptySummary();

      // Always ensure categories mapping if treatment types are requested
      const needCategories = opts.sections.has('categories') || opts.sections.has('types');

      const targetCategoryByName = new Map<string, TreatmentCategory>();
      if (needCategories) {
        const dstCategories = await entityManager.find(TreatmentCategory, {
          orgId: opts.toOrgId,
        });
        for (const c of dstCategories) {
          targetCategoryByName.set(normalizeKey(c.name), c);
        }

        const srcCategories = await entityManager.find(
          TreatmentCategory,
          { orgId: opts.fromOrgId },
          { orderBy: { order: 'ASC' } },
        );

        for (const src of srcCategories) {
          const key = normalizeKey(src.name);
          const existing = targetCategoryByName.get(key);

          if (existing) {
            if (opts.overwrite) {
              const needsUpdate =
                existing.icon !== src.icon || existing.order !== src.order;
              if (needsUpdate) {
                if (opts.execute) {
                  existing.icon = src.icon;
                  existing.order = src.order;
                }
                categoriesSummary.updated += 1;
              } else {
                categoriesSummary.skipped += 1;
              }
            } else {
              categoriesSummary.skipped += 1;
            }
            continue;
          }

          categoriesSummary.created += 1;
          if (opts.execute) {
            const created = entityManager.create(TreatmentCategory, {
              createdAt: new Date(),
              updatedAt: new Date(),
              orgId: opts.toOrgId,
              name: src.name,
              icon: src.icon,
              order: src.order,
            });
            entityManager.persist(created);
            targetCategoryByName.set(key, created);
          }
        }
      }

      if (opts.sections.has('types')) {
        const srcTypes = await entityManager.find(
          TreatmentType,
          { orgId: opts.fromOrgId },
          { populate: ['category'] },
        );

        const dstTypes = await entityManager.find(
          TreatmentType,
          { orgId: opts.toOrgId },
          { populate: ['category'] },
        );

        const dstTypeByKey = new Map<string, TreatmentType>();
        for (const t of dstTypes) {
          const key = `${normalizeKey(t.name)}::${normalizeKey(t.category?.name ?? '')}`;
          dstTypeByKey.set(key, t);
        }

        for (const src of srcTypes) {
          const srcCategoryName = src.category?.name;
          const categoryKey = normalizeKey(srcCategoryName ?? '');
          const targetCategory = srcCategoryName
            ? targetCategoryByName.get(categoryKey)
            : undefined;

          // If we are copying types but target category is missing, create it implicitly
          if (srcCategoryName && !targetCategory) {
            const implicit = entityManager.create(TreatmentCategory, {
              createdAt: new Date(),
              updatedAt: new Date(),
              orgId: opts.toOrgId,
              name: srcCategoryName,
              icon: src.category?.icon ?? '🦷',
              order: src.category?.order ?? 0,
            });
            if (opts.execute) {
              entityManager.persist(implicit);
            }
            targetCategoryByName.set(categoryKey, implicit);
            categoriesSummary.created += 1;
          }

          const finalTargetCategory = srcCategoryName
            ? targetCategoryByName.get(categoryKey)
            : undefined;

          const typeKey = `${normalizeKey(src.name)}::${normalizeKey(srcCategoryName ?? '')}`;
          const existing = dstTypeByKey.get(typeKey);

          if (existing) {
            if (opts.overwrite) {
              const desiredCategoryId = finalTargetCategory?.id;
              const existingCategoryId = existing.category?.id;

              const needsUpdate =
                existing.duration !== src.duration ||
                existing.color !== src.color ||
                JSON.stringify(existing.priceVariants) !==
                  JSON.stringify(src.priceVariants) ||
                desiredCategoryId !== existingCategoryId;

              if (needsUpdate) {
                if (opts.execute) {
                  existing.duration = src.duration;
                  existing.color = src.color;
                  existing.priceVariants = src.priceVariants.map((pv) => ({ ...pv }));
                  existing.category = finalTargetCategory;
                }
                typesSummary.updated += 1;
              } else {
                typesSummary.skipped += 1;
              }
            } else {
              typesSummary.skipped += 1;
            }
            continue;
          }

          typesSummary.created += 1;
          if (opts.execute) {
            const created = entityManager.create(TreatmentType, {
              createdAt: new Date(),
              updatedAt: new Date(),
              orgId: opts.toOrgId,
              name: src.name,
              duration: src.duration,
              color: src.color,
              priceVariants: src.priceVariants.map((pv) => ({ ...pv })),
              category: finalTargetCategory,
            });
            entityManager.persist(created);
            dstTypeByKey.set(typeKey, created);
          }
        }
      }

      if (opts.sections.has('medical-history')) {
        const srcQuestions = await entityManager.find(
          MedicalHistoryQuestion,
          { orgId: opts.fromOrgId },
          { orderBy: { order: 'ASC' } },
        );

        const dstQuestions = await entityManager.find(
          MedicalHistoryQuestion,
          { orgId: opts.toOrgId },
          { orderBy: { order: 'ASC' } },
        );

        const dstByKey = new Map<string, MedicalHistoryQuestion>();
        for (const q of dstQuestions) {
          const key = `${normalizeKey(q.question)}::${q.type}`;
          dstByKey.set(key, q);
        }

        for (const src of srcQuestions) {
          const key = `${normalizeKey(src.question)}::${src.type}`;
          const existing = dstByKey.get(key);

          if (existing) {
            if (opts.overwrite) {
              const needsUpdate =
                existing.required !== src.required ||
                existing.order !== src.order ||
                existing.textTriggerOption !== src.textTriggerOption ||
                existing.textFieldLabel !== src.textFieldLabel ||
                JSON.stringify(existing.options ?? null) !==
                  JSON.stringify(src.options ?? null);

              if (needsUpdate) {
                if (opts.execute) {
                  existing.required = src.required;
                  existing.order = src.order;
                  existing.options = src.options ? [...src.options] : undefined;
                  existing.textTriggerOption = src.textTriggerOption;
                  existing.textFieldLabel = src.textFieldLabel;
                }
                questionsSummary.updated += 1;
              } else {
                questionsSummary.skipped += 1;
              }
            } else {
              questionsSummary.skipped += 1;
            }
            continue;
          }

          questionsSummary.created += 1;
          if (opts.execute) {
            const created = entityManager.create(MedicalHistoryQuestion, {
              createdAt: new Date(),
              updatedAt: new Date(),
              orgId: opts.toOrgId,
              question: src.question,
              type: src.type,
              options: src.options ? [...src.options] : undefined,
              textTriggerOption: src.textTriggerOption,
              textFieldLabel: src.textFieldLabel,
              required: src.required,
              order: src.order,
            });
            entityManager.persist(created);
            dstByKey.set(key, created);
          }
        }
      }

      if (opts.execute) {
        await entityManager.flush();
      }

      console.log('\n✅ Summary');
      if (needCategories) {
        console.log(
          `Treatment Categories: created=${categoriesSummary.created}, updated=${categoriesSummary.updated}, skipped=${categoriesSummary.skipped}`,
        );
      }
      if (opts.sections.has('types')) {
        console.log(
          `Treatment Types:      created=${typesSummary.created}, updated=${typesSummary.updated}, skipped=${typesSummary.skipped}`,
        );
      }
      if (opts.sections.has('medical-history')) {
        console.log(
          `Med History Questions: created=${questionsSummary.created}, updated=${questionsSummary.updated}, skipped=${questionsSummary.skipped}`,
        );
      }

      if (!opts.execute) {
        console.log('\nℹ️ Dry-run only. Re-run with --execute to apply changes.');
      }
    };

    if (opts.execute) {
      await em.transactional(async (transactionalEm) => run(transactionalEm));
    } else {
      await run(em);
    }
  } catch (error: unknown) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    if (orm) {
      await orm.close(true);
    }
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
