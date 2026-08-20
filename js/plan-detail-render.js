import { t } from "../shared/i18n/index.js";
import { stars } from "../data/demo-plan-details.js";

function formatEgp(value) {
  return `${Number(value).toLocaleString()} EGP`;
}

function tierLabel(tier) {
  const map = { economy: "plan.economy", balanced: "plan.balanced", comfort: "plan.comfort" };
  return t(map[tier] || tier);
}

function renderStars(rating) {
  const full = Math.round(rating);
  return `<span class="star-rating" aria-label="${rating}">${stars(full)}</span>`;
}

function renderGallery(images) {
  return `
    <div class="detail-gallery">
      ${images
        .map(
          (img) => `
        <figure class="gallery-item">
          <img src="${img.src}" alt="${img.caption}" loading="lazy" referrerpolicy="no-referrer" onerror="this.classList.add('img-error')" />
          <figcaption>${img.caption}</figcaption>
        </figure>`
        )
        .join("")}
    </div>`;
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
  return `<ul class="amenity-list">${items.map((a) => `<li>${a}</li>`).join("")}</ul>`;
}

export function renderPlanDetailPage(plan) {
  const hotel = plan.hotel;
  const breakdown = plan.breakdown;

  return `
    <div class="plan-detail-page">
      <div class="plan-detail-top">
        <div>
          <span class="badge">${tierLabel(plan.tier)}</span>
          <span class="demo-tag">${t("demo.badge")}</span>
          ${plan.aiGenerated ? `<span class="gemini-tag">${t("gemini.badge")}</span>` : ""}
          <h1>${plan.cityName}</h1>
          <p class="plan-detail-meta">
            ${renderStars(plan.overallRating)}
            <span>${plan.overallRating} · ${plan.totalReviews} ${t("plan.reviews_count")}</span>
          </p>
        </div>
        <div class="plan-detail-price">
          <span class="plan-detail-total">${formatEgp(plan.total)}</span>
          <span class="plan-detail-price-label">${t("plan.total")}</span>
        </div>
      </div>

      ${renderGallery(plan.gallery)}

      <section class="detail-section hotel-section card">
        <div class="section-header">
          <h2>${t("plan.accommodation")}</h2>
          ${renderStars(hotel.rating)}
        </div>
        <h3>${hotel.name} · ${"★".repeat(hotel.stars)}</h3>
        <p class="detail-address">${hotel.address}</p>
        <p class="detail-desc">${hotel.description}</p>
        ${renderAmenities(hotel.amenities)}
        <div class="detail-subgallery">
          ${hotel.images
            .map(
              (img) => `
            <figure><img src="${img.src}" alt="${img.caption}" loading="lazy" referrerpolicy="no-referrer" /><figcaption>${img.caption}</figcaption></figure>`
            )
            .join("")}
        </div>
        <p class="detail-cost-line"><strong>${formatEgp(breakdown.accommodation)}</strong> · ${t("plan.included_stay")}</p>
        ${renderReviews(hotel.reviews, t("plan.hotel_reviews"))}
      </section>

      <section class="detail-section card">
        <h2>${t("plan.activities")}</h2>
        ${plan.activities
          .map(
            (act) => `
          <article class="activity-block">
            <div class="activity-header">
              <h3>${act.name}</h3>
              <span class="activity-duration">${act.duration}</span>
            </div>
            <p class="detail-desc">${act.description}</p>
            <div class="detail-subgallery activity-gallery">
              ${act.images
                .map(
                  (img) => `
                <figure><img src="${img.src}" alt="${img.caption}" loading="lazy" referrerpolicy="no-referrer" /><figcaption>${img.caption}</figcaption></figure>`
                )
                .join("")}
            </div>
            <p class="detail-includes"><strong>${t("plan.includes")}:</strong> ${act.included.join(" · ")}</p>
            ${renderReviews(act.reviews, t("plan.activity_reviews"))}
          </article>`
          )
          .join("")}
        <p class="detail-cost-line"><strong>${formatEgp(breakdown.activities)}</strong> · ${t("plan.activities_total")}</p>
      </section>

      <section class="detail-section card transport-section">
        <h2>${t("plan.transport")}</h2>
        <div class="transport-row">
          <img class="transport-thumb" src="${plan.transport.image}" alt="" loading="lazy" referrerpolicy="no-referrer" />
          <div>
            <h3>${plan.transport.name}</h3>
            <p class="detail-desc">${plan.transport.description}</p>
            <p class="activity-duration">${plan.transport.duration}</p>
          </div>
        </div>
        <p class="detail-cost-line"><strong>${formatEgp(breakdown.transport)}</strong></p>
      </section>

      <section class="detail-section card breakdown-card">
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

      <a class="btn btn-block plan-book-btn" href="index.html">${t("plan.back")}</a>
    </div>`;
}
