import { t, getLocale } from "../shared/i18n/index.js";
import { stars } from "../data/demo-plan-details.js";
import { destinationBySlug, destinationGradient } from "../data/destinations.js";
import { templateById, templateDisplayName } from "../data/plan-templates.js";

function formatEgp(value) {
  return `${Number(value).toLocaleString()} EGP`;
}

function tierLabel(tier) {
  const map = {
    economy: "plan.economy",
    balanced: "plan.balanced",
    comfort: "plan.comfort",
    family: "template.family",
    adventure: "template.adventure",
  };
  return t(map[tier] || tier);
}

function renderStars(rating) {
  const full = Math.round(rating);
  return `<span class="star-rating" aria-label="${rating}">${stars(full)}</span>`;
}

function renderReviews(reviews, title) {
  if (!reviews?.length) return "";
  return `
    <section class="detail-section reviews-section">
      <h3>${title}</h3>
      <div class="reviews-list">
        ${reviews
          .map(
            (r) => `
          <article class="review-card">
            <div class="review-header">
              <span class="review-avatar">${r.name.charAt(0)}</span>
              <div>
                <strong>${r.name}</strong>
                ${renderStars(r.rating)}
              </div>
            </div>
            <p class="review-text">${r.text}</p>
          </article>`
          )
          .join("")}
      </div>
    </section>`;
}

function renderAmenities(items) {
  if (!items?.length) return "";
  return `<ul class="amenity-list">${items.map((a) => `<li>${a}</li>`).join("")}</ul>`;
}

function renderTripItems(items) {
  if (!items?.length) return "";
  const typeLabels = {
    HOTEL: "plan.accommodation",
    TRANSPORT: "plan.transport",
    ACTIVITY: "plan.activities",
    PACKAGE: "plan.package",
  };
  return `
    <section class="detail-section trip-items-section">
      <h2>${t("plan.full_trip")}</h2>
      <ul class="trip-items-list plan-detail-items">
        ${items
          .map(
            (item) => `
          <li>
            <span class="trip-item-type">${t(typeLabels[item.type] || item.type)}</span>
            <span class="trip-item-name">${item.name}</span>
            <span class="trip-item-cost">${formatEgp(item.cost)}</span>
          </li>`
          )
          .join("")}
      </ul>
    </section>`;
}

function renderOverview(plan) {
  const parts = [];
  if (plan.people_count) {
    parts.push(`${plan.people_count} ${t("plan.people_unit")}`);
  }
  if (plan.duration_days) {
    parts.push(`${plan.duration_days} ${t("plan.days_unit")}`);
  }
  if (!parts.length) return "";

  const tpl = templateById(plan.templateId || plan.tier);
  const templateName =
    plan.templateName || templateDisplayName(tpl, getLocale());

  return `
    <section class="detail-section plan-overview">
      <p class="plan-overview-line">
        ${templateName ? `<span class="badge">${templateName}</span>` : ""}
        <span>${parts.join(" · ")}</span>
      </p>
      ${plan.aiSummary ? `<p class="plan-detail-summary">${plan.aiSummary}</p>` : ""}
      ${plan.custom_notes ? `<p class="plan-custom-notes"><strong>${t("plan.custom_requests")}:</strong> ${plan.custom_notes}</p>` : ""}
    </section>`;
}

export function renderPlanDetailPage(plan) {
  if (!plan?.hotel || !plan?.breakdown) {
    return `
      <div class="card empty-state">
        <p>${t("demo.plan_not_found")}</p>
        <a class="back-link" href="index.html">← ${t("plan.back")}</a>
      </div>`;
  }

  const hotel = plan.hotel;
  const breakdown = plan.breakdown;
  const slug = plan.citySlug || plan.city?.slug;
  const city = slug ? destinationBySlug(slug) : plan.city;
  const colorBand = city ? destinationGradient(city.slug) : "var(--color-primary)";

  return `
    <div class="plan-detail-page card">
      <div class="plan-detail-color-band" style="background:${colorBand}"></div>
      <div class="plan-detail-top">
        <div>
          <span class="badge">${tierLabel(plan.tier)}</span>
          <span class="demo-tag">${t("demo.badge")}</span>
          ${plan.aiGenerated ? `<span class="gemini-tag">${t("gemini.badge")}</span>` : ""}
          <h1>${plan.cityName || ""}</h1>
          <p class="plan-detail-meta">
            ${renderStars(plan.overallRating)}
            <span>${plan.overallRating} · ${plan.totalReviews} ${t("plan.reviews_count")}</span>
          </p>
        </div>
        <div class="plan-detail-price">
          <span class="plan-detail-total">${formatEgp(plan.total)}</span>
          <span class="plan-detail-price-label">${t("plan.total")}</span>
          ${plan.within_budget && plan.budget_remaining != null
            ? `<span class="plan-budget-left">${t("search.budget_label")}: ${formatEgp(plan.budget || plan.budget_remaining + plan.total)}</span>`
            : ""}
        </div>
      </div>

      ${renderOverview(plan)}
      ${renderTripItems(plan.items)}

      <section class="detail-section hotel-section">
        <div class="section-header">
          <h2>${t("plan.accommodation")}</h2>
          ${renderStars(hotel.rating)}
        </div>
        <h3>${hotel.name} · ${"★".repeat(hotel.stars)}</h3>
        <p class="detail-address">${hotel.address}</p>
        <p class="detail-desc">${hotel.description}</p>
        ${renderAmenities(hotel.amenities)}
        <p class="detail-cost-line"><strong>${formatEgp(breakdown.accommodation)}</strong> · ${t("plan.included_stay")}</p>
        ${renderReviews(hotel.reviews, t("plan.hotel_reviews"))}
      </section>

      <section class="detail-section">
        <h2>${t("plan.activities")}</h2>
        ${(plan.activities || [])
          .map(
            (act) => `
          <article class="activity-block">
            <div class="activity-header">
              <h3>${act.name}</h3>
              <span class="activity-duration">${act.duration}</span>
            </div>
            <p class="detail-desc">${act.description}</p>
            <p class="detail-includes"><strong>${t("plan.includes")}:</strong> ${(act.included || []).join(" · ")}</p>
            ${renderReviews(act.reviews, t("plan.activity_reviews"))}
          </article>`
          )
          .join("")}
        <p class="detail-cost-line"><strong>${formatEgp(breakdown.activities)}</strong> · ${t("plan.activities_total")}</p>
      </section>

      <section class="detail-section transport-section">
        <h2>${t("plan.transport")}</h2>
        <h3>${plan.transport.name}</h3>
        <p class="detail-desc">${plan.transport.description}</p>
        <p class="activity-duration">${plan.transport.duration}</p>
        <p class="detail-cost-line"><strong>${formatEgp(breakdown.transport)}</strong></p>
      </section>

      <section class="detail-section breakdown-card">
        <h2>${t("plan.cost_breakdown")}</h2>
        <ul class="breakdown-list">
          <li><span>${t("plan.accommodation")}</span><span>${Number(breakdown.accommodation).toLocaleString()}</span></li>
          <li><span>${t("plan.transport")}</span><span>${Number(breakdown.transport).toLocaleString()}</span></li>
          <li><span>${t("plan.activities")}</span><span>${Number(breakdown.activities).toLocaleString()}</span></li>
          <li><span>${t("plan.service_fee")}</span><span>${Number(breakdown.service_fee).toLocaleString()}</span></li>
          <li class="breakdown-total"><span>${t("plan.total")}</span><span>${Number(plan.total).toLocaleString()} EGP</span></li>
        </ul>
      </section>

      ${renderReviews(plan.tripReviews, t("plan.traveler_reviews"))}

      <a class="btn btn-block plan-book-btn" href="index.html">← ${t("plan.back")}</a>
    </div>`;
}
