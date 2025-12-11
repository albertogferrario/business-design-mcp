import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { Project, EntityType } from "../schemas/index.js";

const DATA_DIR = join(homedir(), ".business-design");
const PROJECTS_DIR = join(DATA_DIR, "projects");
const ENTITIES_DIR = join(DATA_DIR, "entities");

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  await fs.mkdir(ENTITIES_DIR, { recursive: true });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function timestamp(): string {
  return new Date().toISOString();
}

// Project operations
export async function createProject(
  name: string,
  description?: string,
  tags?: string[]
): Promise<Project> {
  await ensureDirectories();

  const project: Project = {
    id: generateId(),
    name,
    description,
    tags,
    createdAt: timestamp(),
    updatedAt: timestamp(),
    entities: [],
  };

  await fs.writeFile(
    join(PROJECTS_DIR, `${project.id}.json`),
    JSON.stringify(project, null, 2)
  );

  return project;
}

export async function getProject(projectId: string): Promise<Project | null> {
  await ensureDirectories();
  try {
    const data = await fs.readFile(join(PROJECTS_DIR, `${projectId}.json`), "utf-8");
    return JSON.parse(data) as Project;
  } catch {
    return null;
  }
}

export async function updateProject(project: Project): Promise<Project> {
  await ensureDirectories();
  project.updatedAt = timestamp();
  await fs.writeFile(
    join(PROJECTS_DIR, `${project.id}.json`),
    JSON.stringify(project, null, 2)
  );
  return project;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  await ensureDirectories();
  try {
    const project = await getProject(projectId);
    if (!project) return false;

    // Delete all associated entities
    for (const entityRef of project.entities) {
      await deleteEntity(entityRef.id);
    }

    await fs.unlink(join(PROJECTS_DIR, `${projectId}.json`));
    return true;
  } catch {
    return false;
  }
}

export async function listProjects(): Promise<Project[]> {
  await ensureDirectories();
  try {
    const files = await fs.readdir(PROJECTS_DIR);
    const projects: Project[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const data = await fs.readFile(join(PROJECTS_DIR, file), "utf-8");
        projects.push(JSON.parse(data) as Project);
      }
    }

    return projects.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

// Entity operations
export async function createEntity<T extends EntityType>(
  projectId: string,
  entity: Omit<T, "id" | "projectId" | "createdAt" | "updatedAt">
): Promise<T> {
  await ensureDirectories();

  const project = await getProject(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  const fullEntity = {
    ...entity,
    id: generateId(),
    projectId,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  } as T;

  await fs.writeFile(
    join(ENTITIES_DIR, `${fullEntity.id}.json`),
    JSON.stringify(fullEntity, null, 2)
  );

  // Add reference to project
  project.entities.push({
    id: fullEntity.id,
    type: fullEntity.type,
  });
  await updateProject(project);

  return fullEntity;
}

export async function getEntity<T extends EntityType>(entityId: string): Promise<T | null> {
  await ensureDirectories();
  try {
    const data = await fs.readFile(join(ENTITIES_DIR, `${entityId}.json`), "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function updateEntity<T extends EntityType>(entity: T): Promise<T> {
  await ensureDirectories();
  entity.updatedAt = timestamp();
  await fs.writeFile(
    join(ENTITIES_DIR, `${entity.id}.json`),
    JSON.stringify(entity, null, 2)
  );
  return entity;
}

export async function deleteEntity(entityId: string): Promise<boolean> {
  await ensureDirectories();
  try {
    const entity = await getEntity(entityId);
    if (!entity) return false;

    // Remove from project
    const project = await getProject(entity.projectId);
    if (project) {
      project.entities = project.entities.filter((e) => e.id !== entityId);
      await updateProject(project);
    }

    await fs.unlink(join(ENTITIES_DIR, `${entityId}.json`));
    return true;
  } catch {
    return false;
  }
}

export async function listEntitiesByProject(projectId: string): Promise<EntityType[]> {
  await ensureDirectories();
  const project = await getProject(projectId);
  if (!project) return [];

  const entities: EntityType[] = [];
  for (const ref of project.entities) {
    const entity = await getEntity(ref.id);
    if (entity) {
      entities.push(entity);
    }
  }

  return entities;
}

export async function listEntitiesByType(
  projectId: string,
  type: EntityType["type"]
): Promise<EntityType[]> {
  const entities = await listEntitiesByProject(projectId);
  return entities.filter((e) => e.type === type);
}

// Export utilities
export async function exportProjectToJson(projectId: string): Promise<string> {
  const project = await getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const entities = await listEntitiesByProject(projectId);

  return JSON.stringify({ project, entities }, null, 2);
}

export async function exportProjectToMarkdown(projectId: string): Promise<string> {
  const project = await getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const entities = await listEntitiesByProject(projectId);

  let md = `# ${project.name}\n\n`;

  if (project.description) {
    md += `${project.description}\n\n`;
  }

  if (project.tags && project.tags.length > 0) {
    md += `**Tags:** ${project.tags.join(", ")}\n\n`;
  }

  md += `---\n\n`;

  for (const entity of entities) {
    md += formatEntityAsMarkdown(entity);
    md += `\n---\n\n`;
  }

  return md;
}

function formatEntityAsMarkdown(entity: EntityType): string {
  let md = "";

  switch (entity.type) {
    case "business-model-canvas":
      md += `## Business Model Canvas: ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;

      md += `### Customer Segments\n`;
      for (const seg of entity.customerSegments) {
        md += `- **${seg.segment}**`;
        if (seg.characteristics) md += ` - ${seg.characteristics}`;
        if (seg.size) md += ` (${seg.size})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Value Propositions\n`;
      for (const vp of entity.valuePropositions) {
        md += `- **${vp.proposition}**\n`;
        if (vp.customerPains?.length) md += `  - Pains addressed: ${vp.customerPains.join(", ")}\n`;
        if (vp.customerGains?.length) md += `  - Gains created: ${vp.customerGains.join(", ")}\n`;
      }
      md += `\n`;

      md += `### Channels\n`;
      for (const ch of entity.channels) {
        md += `- ${ch.channel}`;
        if (ch.phase) md += ` (${ch.phase})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Customer Relationships\n`;
      for (const rel of entity.customerRelationships) {
        md += `- ${rel.relationship}`;
        if (rel.type) md += ` (${rel.type})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Revenue Streams\n`;
      for (const rev of entity.revenueStreams) {
        md += `- **${rev.stream}**`;
        if (rev.type) md += ` - ${rev.type}`;
        if (rev.pricing) md += ` (${rev.pricing})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Key Resources\n`;
      for (const res of entity.keyResources) {
        md += `- ${res.resource}`;
        if (res.type) md += ` (${res.type})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Key Activities\n`;
      for (const act of entity.keyActivities) {
        md += `- ${act.activity}`;
        if (act.type) md += ` (${act.type})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Key Partnerships\n`;
      for (const part of entity.keyPartnerships) {
        md += `- **${part.partner}**`;
        if (part.type) md += ` - ${part.type}`;
        if (part.motivation) md += `: ${part.motivation}`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Cost Structure\n`;
      for (const cost of entity.costStructure) {
        md += `- ${cost.cost}`;
        if (cost.type) md += ` (${cost.type})`;
        md += `\n`;
      }
      md += `\n`;
      break;

    case "lean-canvas":
      md += `## Lean Canvas: ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;

      md += `### Problem\n`;
      for (const prob of entity.problem) {
        md += `- **${prob.problem}**\n`;
        if (prob.existingAlternatives) md += `  - Existing alternatives: ${prob.existingAlternatives}\n`;
      }
      md += `\n`;

      md += `### Customer Segments\n`;
      for (const seg of entity.customerSegments) {
        md += `- **${seg.segment}**\n`;
        if (seg.earlyAdopters) md += `  - Early adopters: ${seg.earlyAdopters}\n`;
      }
      md += `\n`;

      md += `### Unique Value Proposition\n`;
      md += `**${entity.uniqueValueProposition.proposition}**\n`;
      if (entity.uniqueValueProposition.highLevelConcept) {
        md += `High-level concept: ${entity.uniqueValueProposition.highLevelConcept}\n`;
      }
      md += `\n`;

      md += `### Solution\n`;
      for (const sol of entity.solution) {
        md += `- **${sol.feature}**`;
        if (sol.description) md += ` - ${sol.description}`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Channels\n`;
      for (const ch of entity.channels) {
        md += `- ${ch}\n`;
      }
      md += `\n`;

      md += `### Revenue Streams\n`;
      for (const rev of entity.revenueStreams) {
        md += `- ${rev.stream}`;
        if (rev.amount) md += ` (${rev.amount})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Cost Structure\n`;
      for (const cost of entity.costStructure) {
        md += `- ${cost.cost}`;
        if (cost.amount) md += ` (${cost.amount})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Key Metrics\n`;
      for (const metric of entity.keyMetrics) {
        md += `- **${metric.metric}**`;
        if (metric.target) md += ` - Target: ${metric.target}`;
        md += `\n`;
      }
      md += `\n`;

      if (entity.unfairAdvantage) {
        md += `### Unfair Advantage\n${entity.unfairAdvantage}\n\n`;
      }
      break;

    case "value-proposition-canvas":
      md += `## Value Proposition Canvas: ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;

      md += `### Customer Profile\n\n`;

      md += `#### Customer Jobs\n`;
      for (const job of entity.customerProfile.customerJobs) {
        md += `- **${job.job}**`;
        if (job.type) md += ` (${job.type})`;
        if (job.importance) md += ` - ${job.importance}`;
        md += `\n`;
      }
      md += `\n`;

      md += `#### Pains\n`;
      for (const pain of entity.customerProfile.pains) {
        md += `- ${pain.pain}`;
        if (pain.severity) md += ` (severity: ${pain.severity})`;
        md += `\n`;
      }
      md += `\n`;

      md += `#### Gains\n`;
      for (const gain of entity.customerProfile.gains) {
        md += `- ${gain.gain}`;
        if (gain.relevance) md += ` (${gain.relevance})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Value Map\n\n`;

      md += `#### Products & Services\n`;
      for (const item of entity.valueMap.productsAndServices) {
        md += `- ${item.item}`;
        if (item.type) md += ` (${item.type})`;
        md += `\n`;
      }
      md += `\n`;

      md += `#### Pain Relievers\n`;
      for (const pr of entity.valueMap.painRelievers) {
        md += `- **${pr.reliever}**`;
        if (pr.addressedPain) md += ` → addresses: ${pr.addressedPain}`;
        md += `\n`;
      }
      md += `\n`;

      md += `#### Gain Creators\n`;
      for (const gc of entity.valueMap.gainCreators) {
        md += `- **${gc.creator}**`;
        if (gc.addressedGain) md += ` → creates: ${gc.addressedGain}`;
        md += `\n`;
      }
      md += `\n`;

      if (entity.fitScore !== undefined) {
        md += `**Fit Score:** ${entity.fitScore}%\n\n`;
      }
      break;

    case "swot-analysis":
      md += `## SWOT Analysis: ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;
      if (entity.context) md += `**Context:** ${entity.context}\n\n`;

      md += `### Strengths\n`;
      for (const s of entity.strengths) {
        md += `- ${s.item}`;
        if (s.impact) md += ` (impact: ${s.impact})`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Weaknesses\n`;
      for (const w of entity.weaknesses) {
        md += `- ${w.item}`;
        if (w.impact) md += ` (impact: ${w.impact})`;
        if (w.mitigation) md += `\n  - Mitigation: ${w.mitigation}`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Opportunities\n`;
      for (const o of entity.opportunities) {
        md += `- ${o.item}`;
        if (o.timeframe) md += ` (${o.timeframe})`;
        if (o.requiredAction) md += `\n  - Action: ${o.requiredAction}`;
        md += `\n`;
      }
      md += `\n`;

      md += `### Threats\n`;
      for (const t of entity.threats) {
        md += `- ${t.item}`;
        if (t.likelihood) md += ` (likelihood: ${t.likelihood})`;
        if (t.contingency) md += `\n  - Contingency: ${t.contingency}`;
        md += `\n`;
      }
      md += `\n`;
      break;

    case "user-persona":
      md += `## User Persona: ${entity.name}\n\n`;

      if (entity.quote) md += `> "${entity.quote}"\n\n`;
      if (entity.bio) md += `${entity.bio}\n\n`;

      md += `### Demographics\n`;
      const demo = entity.demographics;
      if (demo.age) md += `- **Age:** ${demo.age}\n`;
      if (demo.gender) md += `- **Gender:** ${demo.gender}\n`;
      if (demo.location) md += `- **Location:** ${demo.location}\n`;
      if (demo.occupation) md += `- **Occupation:** ${demo.occupation}\n`;
      if (demo.income) md += `- **Income:** ${demo.income}\n`;
      if (demo.education) md += `- **Education:** ${demo.education}\n`;
      if (demo.familyStatus) md += `- **Family Status:** ${demo.familyStatus}\n`;
      md += `\n`;

      const psych = entity.psychographics;
      if (psych.personality?.length || psych.values?.length || psych.interests?.length || psych.lifestyle) {
        md += `### Psychographics\n`;
        if (psych.personality?.length) md += `- **Personality:** ${psych.personality.join(", ")}\n`;
        if (psych.values?.length) md += `- **Values:** ${psych.values.join(", ")}\n`;
        if (psych.interests?.length) md += `- **Interests:** ${psych.interests.join(", ")}\n`;
        if (psych.lifestyle) md += `- **Lifestyle:** ${psych.lifestyle}\n`;
        md += `\n`;
      }

      md += `### Behavior\n`;
      const beh = entity.behavior;
      md += `#### Goals\n`;
      for (const g of beh.goals) md += `- ${g}\n`;
      md += `\n#### Frustrations\n`;
      for (const f of beh.frustrations) md += `- ${f}\n`;
      md += `\n#### Motivations\n`;
      for (const m of beh.motivations) md += `- ${m}\n`;
      if (beh.preferredChannels?.length) {
        md += `\n**Preferred Channels:** ${beh.preferredChannels.join(", ")}\n`;
      }
      if (beh.buyingBehavior) {
        md += `**Buying Behavior:** ${beh.buyingBehavior}\n`;
      }
      md += `\n`;

      if (entity.scenario) {
        md += `### Scenario\n${entity.scenario}\n\n`;
      }
      break;

    case "competitive-analysis":
      md += `## Competitive Analysis: ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;

      for (const comp of entity.competitors) {
        md += `### ${comp.name}\n`;
        if (comp.website) md += `🔗 ${comp.website}\n\n`;
        if (comp.description) md += `${comp.description}\n\n`;

        md += `**Strengths:** ${comp.strengths.join(", ")}\n\n`;
        md += `**Weaknesses:** ${comp.weaknesses.join(", ")}\n\n`;

        if (comp.pricing) {
          md += `**Pricing:** ${comp.pricing.model || ""}`;
          if (comp.pricing.range) md += ` (${comp.pricing.range})`;
          md += `\n\n`;
        }

        if (comp.marketShare) md += `**Market Share:** ${comp.marketShare}\n\n`;
        if (comp.targetAudience) md += `**Target Audience:** ${comp.targetAudience}\n\n`;
      }

      if (entity.ourPosition) {
        md += `### Our Position\n`;
        md += `**Differentiators:** ${entity.ourPosition.differentiators.join(", ")}\n\n`;
        md += `**Gaps:** ${entity.ourPosition.gaps.join(", ")}\n\n`;
        md += `**Opportunities:** ${entity.ourPosition.opportunities.join(", ")}\n\n`;
      }
      break;

    case "market-sizing":
      md += `## Market Sizing: ${entity.name}\n\n`;
      if (entity.description) md += `${entity.description}\n\n`;

      const formatCurrency = (value: number, currency: string) => {
        if (value >= 1_000_000_000) return `${currency} ${(value / 1_000_000_000).toFixed(1)}B`;
        if (value >= 1_000_000) return `${currency} ${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000) return `${currency} ${(value / 1_000).toFixed(1)}K`;
        return `${currency} ${value}`;
      };

      md += `### TAM (Total Addressable Market)\n`;
      md += `**${formatCurrency(entity.tam.value, entity.tam.currency)}** ${entity.tam.unit}\n\n`;
      if (entity.tam.methodology) md += `Methodology: ${entity.tam.methodology}\n\n`;
      if (entity.tam.sources?.length) md += `Sources: ${entity.tam.sources.join(", ")}\n\n`;
      if (entity.tam.assumptions?.length) {
        md += `Assumptions:\n`;
        for (const a of entity.tam.assumptions) md += `- ${a}\n`;
        md += `\n`;
      }

      md += `### SAM (Serviceable Addressable Market)\n`;
      md += `**${formatCurrency(entity.sam.value, entity.sam.currency)}** ${entity.sam.unit}\n\n`;
      if (entity.sam.constraints?.length) {
        md += `Constraints: ${entity.sam.constraints.join(", ")}\n\n`;
      }
      if (entity.sam.targetSegments?.length) {
        md += `Target Segments: ${entity.sam.targetSegments.join(", ")}\n\n`;
      }

      md += `### SOM (Serviceable Obtainable Market)\n`;
      md += `**${formatCurrency(entity.som.value, entity.som.currency)}** ${entity.som.unit}\n\n`;
      if (entity.som.timeframe) md += `Timeframe: ${entity.som.timeframe}\n\n`;
      if (entity.som.captureStrategy) md += `Capture Strategy: ${entity.som.captureStrategy}\n\n`;
      if (entity.som.assumptions?.length) {
        md += `Assumptions:\n`;
        for (const a of entity.som.assumptions) md += `- ${a}\n`;
        md += `\n`;
      }

      if (entity.growthRate) {
        md += `### Growth Rate\n`;
        md += `**${entity.growthRate.rate}%** ${entity.growthRate.period}\n\n`;
        if (entity.growthRate.drivers?.length) {
          md += `Drivers: ${entity.growthRate.drivers.join(", ")}\n\n`;
        }
      }
      break;
  }

  return md;
}

export { formatEntityAsMarkdown };
