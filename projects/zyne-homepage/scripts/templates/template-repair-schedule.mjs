import { readFileSync } from "node:fs";
import { repairScheduleContent } from "../../src/data/repair-schedule-content.js";
import {
  globalHeaderFooterStyles,
  renderGlobalFavicons,
  renderGlobalFooter,
  renderGlobalHeader,
  renderGlobalHeaderFooterScript
} from "../global-header-footer.mjs";

const siteUrl = "https://zyne.store";
const styles = readFileSync(new URL("../../src/styles/repair-schedule.css", import.meta.url), "utf8");

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const absoluteUrl = (path) => `${siteUrl}${path.endsWith("/") ? path : `${path}/`}`;

const listItems = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

const propertyImage = ({ file, alt, caption, className = "" }) => {
  const base = `/assets/catalog/properties/7101-wendemere-st`;
  return `<figure class="repair-photo ${className}">
    <picture>
      <source media="(max-width: 700px)" srcset="${base}/thumbnails-mobile/${escapeHtml(file)}">
      <source media="(max-width: 1100px)" srcset="${base}/thumbnails/${escapeHtml(file)}">
      <img src="${base}/gallery/${escapeHtml(file)}" alt="${escapeHtml(alt)}" loading="lazy">
    </picture>
    ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}
  </figure>`;
};

const repairPhase = (phase) => `<article class="repair-phase">
  ${propertyImage({ ...phase.image, className: "phase-photo" })}
  <div>
    <p class="eyebrow">${escapeHtml(phase.phase)}</p>
    <h3>${escapeHtml(phase.title)}</h3>
  </div>
  <strong>${escapeHtml(phase.timeframe)}</strong>
  <ul>${listItems(phase.work)}</ul>
</article>`;

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": repairScheduleContent.title,
  "description": repairScheduleContent.description,
  "url": absoluteUrl(repairScheduleContent.canonicalPath)
};

export const renderRepairSchedulePage = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#070706">
<title>${escapeHtml(repairScheduleContent.seoTitle)}</title>
<meta name="description" content="${escapeHtml(repairScheduleContent.description)}">
<link rel="canonical" href="${absoluteUrl(repairScheduleContent.canonicalPath)}">
${renderGlobalFavicons()}
<style>${globalHeaderFooterStyles}${styles}</style>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
${renderGlobalHeader()}
<main id="main-content" class="repair-page">
  <section class="repair-hero">
    <div class="repair-panel">
      <p class="eyebrow">${escapeHtml(repairScheduleContent.eyebrow)}</p>
      <h1>${escapeHtml(repairScheduleContent.title)}</h1>
      <p class="lede">${escapeHtml(repairScheduleContent.description)}</p>
      <p>${escapeHtml(repairScheduleContent.intro)}</p>
      <div class="repair-actions">
        <a class="button" href="${escapeHtml(repairScheduleContent.primaryCta.href)}">${escapeHtml(repairScheduleContent.primaryCta.label)}</a>
        <a class="button ghost" href="${escapeHtml(repairScheduleContent.secondaryCta.href)}">${escapeHtml(repairScheduleContent.secondaryCta.label)}</a>
      </div>
    </div>
    <aside class="repair-card repair-status" aria-label="Repair schedule status">
      ${propertyImage({ ...repairScheduleContent.heroImage, className: "hero-photo" })}
      <p class="eyebrow">Schedule span</p>
      <h2>September 2026 to August 2029</h2>
      <p>The work begins with safety and baseline checks, then moves through systems, interior comfort, exterior items, and final touches.</p>
    </aside>
  </section>
  <section id="repair-schedule" class="repair-schedule" aria-label="Tentative repair schedule">
    <div class="section-heading">
      <p class="eyebrow">Tentative repair schedule</p>
      <h2>Phased repair timeline</h2>
    </div>
    <div class="repair-timeline">${repairScheduleContent.phases.map(repairPhase).join("")}</div>
  </section>
  <section id="schedule-notes" class="repair-next">
    <p class="eyebrow">Schedule notes</p>
    <h2>Planning assumptions</h2>
    <ul>${listItems(repairScheduleContent.notes)}</ul>
  </section>
</main>
${renderGlobalFooter()}
${renderGlobalHeaderFooterScript()}
</body>
</html>`;
