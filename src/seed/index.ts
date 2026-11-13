import type { Core } from '@strapi/strapi'

import { profile } from './data/profile'
import { education } from './data/education'
import { certifications } from './data/certifications'
import { skillGroups } from './data/skill-groups'
import { experiences } from './data/experiences'
import { projects } from './data/projects'

const PUBLIC_ACTIONS = [
  'api::profile.profile.find',
  'api::education.education.find',
  'api::certification.certification.find',
  'api::certification.certification.findOne',
  'api::skill-group.skill-group.find',
  'api::skill-group.skill-group.findOne',
]

/**
 * Titles the old hand-entered records used, mapped onto the seed title so the
 * existing row (and its Cloudinary image) is updated instead of duplicated.
 */
const PROJECT_TITLE_ALIASES: Record<string, string> = {
  'Data Community Anonymous': 'Data Community Anonymous (Game Night Wall)',
}

const documents = (strapi: Core.Strapi, uid: string) =>
  (strapi.documents as any)(uid) as {
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
    findFirst: (args?: any) => Promise<any>
  }

async function seedSingleType(strapi: Core.Strapi, uid: string, data: Record<string, unknown>) {
  const docs = documents(strapi, uid)
  const existing = await docs.findFirst({})
  if (existing) {
    await docs.update({ documentId: existing.documentId, data })
  } else {
    await docs.create({ data })
  }
}

async function seedCollection(
  strapi: Core.Strapi,
  uid: string,
  rows: Array<Record<string, any>>,
  published: boolean
) {
  const docs = documents(strapi, uid)
  const existing = (await (strapi.db.query(uid as any).findMany({}))) as Array<{
    id: number
    documentId: string
    title: string
  }>
  const byTitle = new Map(existing.map((row) => [row.title, row]))

  for (const row of rows) {
    const match = byTitle.get(row.title)
    if (match) {
      await docs.update({
        documentId: match.documentId,
        data: row,
        ...(published ? { status: 'published' } : {}),
      })
    } else {
      await docs.create({ data: row, ...(published ? { status: 'published' } : {}) })
    }
  }
}

async function seedProjects(strapi: Core.Strapi) {
  const docs = documents(strapi, 'api::project.project')
  const existing = (await strapi.db.query('api::project.project').findMany({})) as Array<{
    documentId: string
    title: string
    category: string | null
    status: string | null
    description: string | null
    order: number | null
    featured: boolean | null
    publishedAt: string | null
  }>

  // A document has one row per published state, so keep the published row for
  // each title; the draft row shares the documentId.
  const byTitle = new Map<string, (typeof existing)[number]>()
  for (const row of existing) {
    const current = byTitle.get(row.title)
    if (!current || (row.publishedAt && !current.publishedAt)) {
      byTitle.set(row.title, row)
    }
  }

  const aliasesBySeedTitle = new Map<string, string[]>()
  for (const [legacyTitle, seedTitle] of Object.entries(PROJECT_TITLE_ALIASES)) {
    aliasesBySeedTitle.set(seedTitle, [
      ...(aliasesBySeedTitle.get(seedTitle) ?? []),
      legacyTitle,
    ])
  }

  const keep = new Set<string>()
  const removedEarlier = new Set<string>()

  for (const project of projects) {
    const { featured, ...rest } = project

    // Legacy titles are tried first so a hand-entered record keeps its document
    // id and its uploaded image.
    const candidates = [
      ...(aliasesBySeedTitle.get(project.title) ?? []),
      project.title,
    ]
    const match = candidates
      .map((title) => byTitle.get(title))
      .find((row): row is (typeof existing)[number] => Boolean(row))

    // Links and media are only written when the seed knows them, so a record
    // that carries a live demo URL or an uploaded image keeps it.
    const data: Record<string, unknown> = { ...rest, featured }
    delete data.demo
    delete data.github
    if (rest.demo) data.demo = rest.demo
    if (rest.github) data.github = rest.github

    if (!match) {
      const created = await docs.create({ data, status: 'published' })
      if (created?.documentId) keep.add(created.documentId)
      continue
    }

    keep.add(match.documentId)

    // A record already sitting on the canonical title belongs to a different
    // document; it has to go before the rename, or the slug collides.
    const canonical = byTitle.get(project.title)
    if (canonical && canonical.documentId !== match.documentId) {
      await docs.delete({ documentId: canonical.documentId })
      byTitle.delete(project.title)
      removedEarlier.add(canonical.documentId)
    }

    const unchanged =
      match.title === project.title &&
      match.category === project.category &&
      match.status === (project.status ?? null) &&
      match.description === (project.description ?? null) &&
      match.order === project.order &&
      Boolean(match.featured) === featured

    if (unchanged) continue

    await docs.update({ documentId: match.documentId, data, status: 'published' })
  }

  // Anything not claimed by the inventory is either a dropped project or a
  // duplicate left behind by an older title.
  const removed = new Set<string>(removedEarlier)
  for (const row of existing) {
    if (keep.has(row.documentId) || removed.has(row.documentId)) continue
    removed.add(row.documentId)
    await docs.delete({ documentId: row.documentId })
    strapi.log.info(`[seed] removed project no longer in the inventory: ${row.title}`)
  }
}

async function seedExperiences(strapi: Core.Strapi) {
  const docs = documents(strapi, 'api::experience.experience')
  const existing = (await strapi.db.query('api::experience.experience').findMany({})) as Array<{
    documentId: string
  }>

  // Experiences hold no media or relations, and the whole set is superseded by
  // the resume data, so they are rebuilt rather than reconciled.
  for (const row of existing) {
    await docs.delete({ documentId: row.documentId })
  }

  for (const experience of experiences) {
    await docs.create({ data: experience })
  }
}

async function grantPublicRead(strapi: Core.Strapi) {
  const role = (await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  })) as { id: number } | null

  if (!role) return

  for (const action of PUBLIC_ACTIONS) {
    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: { action, role: role.id },
    })
    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      })
    }
  }
}

export async function seed({ strapi }: { strapi: Core.Strapi }) {
  strapi.log.info('[seed] writing resume data into the CMS')

  await seedSingleType(strapi, 'api::profile.profile', profile as unknown as Record<string, unknown>)
  await seedSingleType(strapi, 'api::education.education', education as unknown as Record<string, unknown>)
  await seedCollection(strapi, 'api::certification.certification', certifications, false)
  await seedCollection(strapi, 'api::skill-group.skill-group', skillGroups, false)
  await seedExperiences(strapi)
  await seedProjects(strapi)
  await grantPublicRead(strapi)

  strapi.log.info(
    `[seed] done: ${projects.length} projects, ${experiences.length} experiences, ${certifications.length} certifications, ${skillGroups.length} skill groups`
  )
}
