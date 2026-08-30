import { Client, collectPaginatedAPI, isFullDatabase, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client";

const token = process.env.NOTION_TOKEN;

export const notion = token ? new Client({ auth: token }) : null;

export type MediaRef = {
  pageId: string;
  property: string;
  index: number;
  isVideo: boolean;
};

export type LogoItem = {
  id: string;
  name: string;
  logo: MediaRef | null;
  link: string | null;
};

export type WorkCategory = "F&B" | "Brand Content" | "Event Coverage";

// A client deliverable meant to be watched with sound/controls, hosted on
// Bunny Stream rather than uploaded to Notion — HLS gives it real
// adaptive-bitrate streaming, which a decorative muted loop doesn't need.
export type ShowcaseVideo = {
  url: string;
  poster: string | null;
};

export type WorkProject = {
  id: string;
  name: string;
  slug: string;
  category: string;
  featured: boolean;
  summary: string;
  client: string;
  cover: MediaRef | null;
  gallery: MediaRef[];
  showcaseVideos: ShowcaseVideo[];
  momentVideoUrl: string | null;
  momentCaption: string;
};

export type PhotographyItem = {
  id: string;
  caption: string;
  image: MediaRef | null;
};

const dataSourceIdCache = new Map<string, string>();

async function resolveDataSourceId(databaseId: string): Promise<string | null> {
  if (!notion) return null;
  const cached = dataSourceIdCache.get(databaseId);
  if (cached) return cached;
  const db = await notion.databases.retrieve({ database_id: databaseId });
  if (!isFullDatabase(db) || db.data_sources.length === 0) return null;
  const id = db.data_sources[0].id;
  dataSourceIdCache.set(databaseId, id);
  return id;
}

function isVideoFilename(name: string): boolean {
  return /\.(mp4|mov|webm|m4v)$/i.test(name);
}

function getTitle(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  return p?.type === "title" ? p.title.map((t) => t.plain_text).join("") : "";
}

function getRichText(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  return p?.type === "rich_text" ? p.rich_text.map((t) => t.plain_text).join("") : "";
}

function getCheckbox(page: PageObjectResponse, prop: string): boolean {
  const p = page.properties[prop];
  return p?.type === "checkbox" ? p.checkbox : false;
}

function getSelectName(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  return p?.type === "select" && p.select ? p.select.name : "";
}

function getUrl(page: PageObjectResponse, prop: string): string | null {
  const p = page.properties[prop];
  return p?.type === "url" ? p.url : null;
}

function toMediaRefs(page: PageObjectResponse, prop: string): MediaRef[] {
  const p = page.properties[prop];
  if (p?.type !== "files") return [];
  return p.files.map((file, index) => ({
    pageId: page.id,
    property: prop,
    index,
    isVideo: isVideoFilename(file.name),
  }));
}

function toMediaRef(page: PageObjectResponse, prop: string): MediaRef | null {
  return toMediaRefs(page, prop)[0] ?? null;
}

// Bunny Stream serves a thumbnail at the same path as the HLS playlist,
// just with the filename swapped — derive it so a poster shows immediately
// instead of a blank player before the visitor presses play.
function deriveBunnyThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.endsWith("/playlist.m3u8")) return null;
    parsed.pathname = parsed.pathname.replace(/playlist\.m3u8$/, "thumbnail.jpg");
    return parsed.toString();
  } catch {
    return null;
  }
}

function getShowcaseVideos(page: PageObjectResponse, prop: string): ShowcaseVideo[] {
  return getRichText(page, prop)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => ({ url, poster: deriveBunnyThumbnail(url) }));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function queryPublishedRows(databaseId: string | undefined): Promise<PageObjectResponse[]> {
  if (!notion || !databaseId) return [];
  try {
    const dataSourceId = await resolveDataSourceId(databaseId);
    if (!dataSourceId) return [];
    const rows = await collectPaginatedAPI(notion.dataSources.query, {
      data_source_id: dataSourceId,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "Order", direction: "ascending" }],
    });
    return rows.filter(isFullPage);
  } catch (err) {
    console.error(`Notion query failed for database ${databaseId}:`, err);
    return [];
  }
}

export async function getLogos(): Promise<LogoItem[]> {
  const rows = await queryPublishedRows(process.env.NOTION_LOGOS_DB_ID);
  return rows.map((page) => ({
    id: page.id,
    name: getTitle(page, "Name"),
    logo: toMediaRef(page, "Logo"),
    link: getUrl(page, "Link"),
  }));
}

export async function getWorkProjects(): Promise<WorkProject[]> {
  const rows = await queryPublishedRows(process.env.NOTION_WORK_DB_ID);
  return rows.map((page) => {
    const name = getTitle(page, "Name");
    const slugField = getRichText(page, "Slug");
    return {
      id: page.id,
      name,
      slug: slugField || slugify(name),
      category: getSelectName(page, "Category"),
      featured: getCheckbox(page, "Featured"),
      summary: getRichText(page, "Summary"),
      client: getRichText(page, "Client"),
      cover: toMediaRef(page, "Cover"),
      gallery: toMediaRefs(page, "Gallery"),
      showcaseVideos: getShowcaseVideos(page, "Video URLs"),
      momentVideoUrl: getUrl(page, "Moment Video URL"),
      momentCaption: getRichText(page, "Moment Caption"),
    };
  });
}

export async function getWorkProjectBySlug(slug: string): Promise<WorkProject | null> {
  const projects = await getWorkProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}

export type Moment = {
  id: string;
  videoUrl: string;
  caption: string;
};

// "Moments from recent campaigns" on the home page — a curated handful of
// muted b-roll clips pulled straight from Work Projects, rather than a
// separate database, since each one is naturally tied to a real project.
export async function getMoments(limit = 6): Promise<Moment[]> {
  const projects = await getWorkProjects();
  return projects
    .filter((p): p is WorkProject & { momentVideoUrl: string } => Boolean(p.momentVideoUrl))
    .slice(0, limit)
    .map((p) => ({ id: p.id, videoUrl: p.momentVideoUrl, caption: p.momentCaption }));
}

export async function getPhotographyItems(): Promise<PhotographyItem[]> {
  const rows = await queryPublishedRows(process.env.NOTION_PHOTOGRAPHY_DB_ID);
  return rows.map((page) => ({
    id: page.id,
    caption: getTitle(page, "Caption"),
    image: toMediaRef(page, "Image"),
  }));
}

export async function getMediaFileUrl(
  pageId: string,
  property: string,
  index: number,
): Promise<string | null> {
  if (!notion) return null;
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!isFullPage(page)) return null;
    const prop = page.properties[property];
    if (prop?.type !== "files") return null;
    const file = prop.files[index];
    if (!file) return null;
    return file.type === "external" ? file.external.url : file.file.url;
  } catch (err) {
    console.error(`Notion media lookup failed for ${pageId}/${property}/${index}:`, err);
    return null;
  }
}
