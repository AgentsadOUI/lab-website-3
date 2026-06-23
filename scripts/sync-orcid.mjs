const ORCID_ID = "0000-0002-7298-8690";
const API = "https://pub.orcid.org/v3.0";

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pickName(c) {
  if (c["credit-name"]?.value) return c["credit-name"].value;
  const given = c["given-names"]?.value ?? "";
  const family = c["family-names"]?.value ?? "";
  return `${family}${family && given ? ", " : ""}${given}`.trim();
}

function pickBestSummary(group) {
  const summaries = group["work-summary"] ?? [];
  if (summaries.length === 0) return null;

  let best = summaries[0];
  let bestScore = -1;

  for (const s of summaries) {
    const ids = s["external-ids"]?.["external-id"] ?? [];
    const hasDoi = ids.some((id) => id["external-id-type"] === "doi");
    const score = (hasDoi ? 2 : 0) + ids.length;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }

  return best;
}
function pickDOI(externalIds) {
  const list = externalIds?.["external-id"] ?? [];
  const doi = list.find((id) => id["external-id-type"] === "doi");
  if (!doi) return "";
  return doi["external-id-url"]?.value || `https://doi.org/${doi["external-id-value"]}`;
}

async function main() {
  const fs = await import("node:fs/promises");

  let existing = [];
  try {
    existing = JSON.parse(await fs.readFile("data/publications.json", "utf-8"));
  } catch (e) {}

  const byDoi = new Map();
  const byTitle = new Map();
  for (const p of existing) {
    if (p.link) byDoi.set(p.link, p);
    byTitle.set((p.title || "").trim().toLowerCase(), p);
  }

  const works = await getJSON(`${API}/${ORCID_ID}/works`);
  const groups = works.group ?? [];

  const publications = [];

  for (const group of groups) {
    const summary = pickBestSummary(group);
    if (!summary) continue;
    const putCode = summary["put-code"];

    let detail;
    try {
      detail = await getJSON(`${API}/${ORCID_ID}/work/${putCode}`);
    } catch (e) {
      console.warn(`Skipping put-code ${putCode}: ${e.message}`);
      continue;
    }

    const title = detail.title?.title?.value ?? "Untitled";
    const journal = detail["journal-title"]?.value ?? "";
    const year = Number(detail["publication-date"]?.year?.value) || 0;
    const link = pickDOI(detail["external-ids"]);
    const contributors = detail.contributors?.contributor ?? [];
    const authors = contributors.map(pickName).filter(Boolean).join("; ");

    const previous = byDoi.get(link) || byTitle.get(title.trim().toLowerCase());

    publications.push({
      year,
      authors: authors || "",
      title,
      journal,
      vol_pages: "",
      link,
      photo: previous?.photo || "",
    });

    await sleep(200);
  }

  publications.sort((a, b) => b.year - a.year);

  await fs.writeFile(
    "data/publications.json",
    JSON.stringify(publications, null, 2) + "\n"
  );
  console.log(`Wrote ${publications.length} publications.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
