import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  catalogProducts,
  categories,
  deliveryFamilies,
  intelligenceProductIds
} from "../src/data/products.js";

const errors = [];
const forbiddenPhrases = [
  "Schedule a Free Call",
  "Book a Free Consultation",
  "Get a Free Strategy Session",
  "Talk to Sales",
  "Contact Us for Pricing",
  "Request a Free Audit"
];

const assertFile = async (route) => {
  const path = join("dist", route, "index.html");
  try {
    await access(path);
    return await readFile(path, "utf8");
  } catch {
    errors.push(`Missing generated route: /${route}/`);
    return "";
  }
};

const assertIncludes = (html, route, snippets) => {
  for (const snippet of snippets) {
    if (!html.includes(snippet)) errors.push(`/${route}/ missing required content: ${snippet}`);
  }
};

const assertOneH1 = (html, route) => {
  const matches = html.match(/<h1[\s>]/g) || [];
  if (matches.length !== 1) errors.push(`/${route}/ expected exactly one H1, found ${matches.length}`);
};

const assertNoForbiddenPhrases = (html, route) => {
  for (const phrase of forbiddenPhrases) {
    if (html.includes(phrase)) errors.push(`/${route}/ contains prohibited CTA language: ${phrase}`);
  }
};

const sarCurrencyMarker = `currency-symbol">${String.fromCodePoint(0x20C1)}</span>282.50`;

const assertSchema = (html, route, snippets = []) => {
  assertIncludes(html, route, ["application/ld+json", ...snippets]);
};

const allRouteHtml = [];

for (const category of categories) {
  const html = await assertFile(category.slug);
  allRouteHtml.push([category.slug, html]);
  assertOneH1(html, category.slug);
  assertSchema(html, category.slug, ["CollectionPage", "ItemList"]);
  assertIncludes(html, category.slug, [
    category.title,
    category.description,
    "Buyer problem:",
    category.problemStatement,
    "Compare Products",
    "Recommended starting point:",
    "Product comparison",
    "Product ladder",
    "How to choose",
    "Available services",
    "Category FAQ",
    "Related growth paths",
    "Secure checkout is completed through Stan Store",
    "Are these free consultations?",
    "Where does checkout happen?",
    "Can I compare services before buying?",
    "What happens after purchase?"
  ]);

  for (const productId of category.productIds) {
    const product = catalogProducts.find((item) => item.id === productId);
    if (product && !html.includes(product.name)) errors.push(`/${category.slug}/ missing category product: ${product.name}`);
    if (product && !html.includes(product.internalUrl)) errors.push(`/${category.slug}/ missing internal product link: ${product.internalUrl}`);
  }

  if (category.id === "use-ai") {
    assertIncludes(html, category.slug, ["View Realtor GPT Products", "/use-ai/realtor-gpt/"]);
  }
}

const services = await assertFile("services");
allRouteHtml.push(["services", services]);
assertOneH1(services, "services");
assertSchema(services, "services", ["CollectionPage", "ItemList"]);
assertIncludes(services, "services", ["ZYNE Paid Services", "Product comparison", "Every product links to a ZYNE detail page", "Secure checkout is completed through Stan Store"]);

const intelligence = await assertFile("intelligence");
allRouteHtml.push(["intelligence", intelligence]);
assertOneH1(intelligence, "intelligence");
assertSchema(intelligence, "intelligence", ["CollectionPage", "ItemList"]);
assertIncludes(intelligence, "intelligence", ["ZYNE Intelligence", "Before execution comes intelligence.", "Product comparison", "Recommended Intelligence Sequence", "Collection questions", "Secure checkout is completed through Stan Store"]);
for (const productId of intelligenceProductIds) {
  const product = catalogProducts.find((item) => item.id === productId);
  if (product && !intelligence.includes(product.name)) errors.push(`/intelligence/ missing product: ${product.name}`);
}

const delivery = await assertFile("delivery");
allRouteHtml.push(["delivery", delivery]);
assertOneH1(delivery, "delivery");
assertSchema(delivery, "delivery", ["CollectionPage", "ItemList"]);
assertIncludes(delivery, "delivery", ["ZYNE Delivery", "From strategy to execution.", "Product comparison", "Service families", "Delivery Service Families", "Collection questions", "Secure checkout is completed through Stan Store"]);
for (const family of deliveryFamilies) {
  if (!delivery.includes(family.name)) errors.push(`/delivery/ missing delivery family: ${family.name}`);
}

const realtorGpt = await assertFile(join("use-ai", "realtor-gpt"));
allRouteHtml.push([join("use-ai", "realtor-gpt"), realtorGpt]);
assertOneH1(realtorGpt, join("use-ai", "realtor-gpt"));
assertSchema(realtorGpt, join("use-ai", "realtor-gpt"), ["CollectionPage", "ItemList"]);
assertIncludes(realtorGpt, "use-ai/realtor-gpt", ["Realtor GPT Products", "real estate agents and teams", "Product comparison", "Secure checkout is completed through Stan Store"]);

const repairSchedule = await assertFile("repair-schedule");
allRouteHtml.push(["repair-schedule", repairSchedule]);
assertOneH1(repairSchedule, "repair-schedule");
assertSchema(repairSchedule, "repair-schedule", ["WebPage", "Repair Schedule"]);
assertIncludes(repairSchedule, "repair-schedule", [
  "Repair Schedule",
  "Posted 07/31/2026",
  "Tentative repair schedule",
  "Phase 1",
  "Safety &amp; Baseline",
  "Replace and test all security devices/detectors",
  "November 2026 - May 2027",
  "Interior Cosmetics &amp; Comfort",
  "Broken fence repaired (cosmetic)",
  "July - August 2029",
  "Planning assumptions",
  "/assets/catalog/properties/7101-wendemere-st/gallery/front.webp",
  "/assets/catalog/properties/7101-wendemere-st/thumbnails-mobile/front.webp",
  "/assets/catalog/properties/7101-wendemere-st/gallery/living-room.webp",
  "/assets/catalog/properties/7101-wendemere-st/gallery/front-yard.webp",
  "/assets/catalog/properties/7101-wendemere-st/gallery/front-yard-mailbox-carport.png"
]);

const customDelivery = await assertFile(join("delivery", "custom"));
allRouteHtml.push([join("delivery", "custom"), customDelivery]);
assertOneH1(customDelivery, join("delivery", "custom"));
assertSchema(customDelivery, join("delivery", "custom"), ["WebPage", "Custom Delivery"]);
assertIncludes(customDelivery, "delivery/custom", [
  "Custom Delivery",
  "View bill",
  "Invoice preview",
  "Delivery Fee",
  "View breakdown",
  "Pay now",
  "Task",
  "Duration",
  "Rate",
  "Cost",
  "SAR 282.50",
  "Approx. USD",
  "$75.33",
  "Continue to Stan",
  "Stan checkout",
  "This is a read-only bill preview."
]);

const propertyRoute = join("homedetail", "7101-wendemere-st-houston-tx-77088");
const propertyDetail = await assertFile(propertyRoute);
allRouteHtml.push([propertyRoute, propertyDetail]);

assertOneH1(propertyDetail, propertyRoute);
assertSchema(propertyDetail, propertyRoute, ["SingleFamilyResidence", "Offer"]);

assertIncludes(propertyDetail, propertyRoute, [
  "7101 Wendemere St",
  "Houston, TX 77088",
  "$1,495/month",
  "For Rent · Active",
  "Schedule a Viewing",
  "Request to Apply",
  "Listing Agent",
  "Carissa Weber",
  "PLATINUM",
  "Better Homes and Gardens Real Estate",
  "Gary Greene - Sugar Land",
  "https://www.har.com/carissa-weber/agent_WEBERC",
  "/assets/catalog/agents/carissa-weber.webp",
  "/assets/brand/zyne-gold-pillars.png",
  "See all 10 photos",
  "max-width: 1440px",
  "grid-template-columns: minmax(0, 1.48fr) minmax(460px, .98fr)",
  "width: 88px",
  "Wendemere St"
]);

const buyRoute = join(propertyRoute, "buy");
const buyDetail = await assertFile(buyRoute);
allRouteHtml.push([buyRoute, buyDetail]);

assertSchema(buyDetail, buyRoute, ["SingleFamilyResidence", "Offer"]);
assertIncludes(buyDetail, buyRoute, [
  "<body class=\"buy-route\">",
  "id=\"main-content\"",
  "class=\"buy-page-stack desktop-buy-pages\"",
  "class=\"buy-page-stack mobile-buy-pages\"",
  "data-mobile-menu-open",
  "id=\"mobile-menu\"",
  "<footer class=\"footer\">",
  "REQUEST INVESTMENT PACKET",
  "CONTACT LISTING AGENT",
  "https://www.har.com/carissa-weber/agent_WEBERC",
  "mailto:lisibeth@zyne.store",
  "tel:+13465924718",
  "1 of 9",
  "/assets/catalog/agents/carissa-weber.webp"
]);

for (const product of catalogProducts) {
  const route = join("services", product.slug);
  const html = await assertFile(route);
  allRouteHtml.push([route, html]);
  assertOneH1(html, route);
  assertSchema(html, route, ["Offer", String(product.priceValue), product.currency || "USD"]);
  assertIncludes(html, route, [
    product.name,
    product.price,
    product.timeline,
    "Product positioning:",
    "Who it is for:",
    product.bestFor,
    "Buyer problem:",
    "Purchase this service",
    "What is included",
    "Deliverables",
    "What you receive",
    "Decision outcomes",
    "Timeline and revisions",
    "Buyer responsibilities",
    "What you need to provide",
    "Scope exclusions",
    "What is not included",
    "Refund and scope handling",
    "/refund-policy/",
    "Related products",
    "Product FAQ",
    "Common purchase questions",
    "Where does checkout happen?",
    "What happens after purchase?",
    "Are results guaranteed?",
    "What does the buyer need to provide?",
    "How do revisions work?",
    "Final checkout note",
    "Secure checkout is completed through Stan Store",
    "data-event=\"product_page_view\"",
    "data-event=\"refund_policy_click\""
  ]);

  if (product.checkoutStatus === "live" && product.stanCheckoutUrl) {
    assertIncludes(html, route, [
      "Checkout on Stan Store",
      "Purchase This Service",
      product.stanCheckoutUrl,
      "data-event=\"product_buy_now_click\"",
      "data-event=\"stan_store_redirect_click\"",
      "data-destination-type=\"stan_checkout\""
    ]);
  } else if (html.includes("Checkout on Stan Store") || html.includes("stan_store_redirect_click")) {
    errors.push(`/${route}/ renders external checkout controls while checkout is not live`);
  }
}

for (const route of ["privacy", "terms", "refund-policy"]) {
  const html = await assertFile(route);
  allRouteHtml.push([route, html]);
  assertOneH1(html, route);
  assertSchema(html, route, ["WebPage"]);
  assertIncludes(html, route, ["Legal and checkout clarity", "Secure checkout is completed through Stan Store"]);
}

for (const [route, html] of allRouteHtml) {
  assertNoForbiddenPhrases(html, route);
}

if (errors.length) {
  console.error("Generated route validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Generated route validation passed: ${catalogProducts.length} products, ${categories.length} growth paths, collection pages, subroutes, and policy routes.`);
