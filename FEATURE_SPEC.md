# Feature Spec: About Page — Scroll-Reveal Section Previews

## Requirement (English Translation)

On the **About page** (`index.html`), when the user scrolls down, the content sections for **Publications**, **People**, and **Services** should appear **in order** with a smooth reveal animation. Each section should display a **preview** of its content (not the full page). Clicking the section title (or a "View all →" link) navigates the user to the corresponding full page.

---

## Behavior

### 1. Scroll-Reveal Animation
- After the existing bio/About content, three preview sections are appended sequentially:
  1. Publications preview
  2. People preview
  3. Services preview
- Each section starts **invisible** (opacity 0, slightly shifted down).
- As the user scrolls down and each section enters the viewport, it **fades in and slides up** smoothly using CSS transitions triggered by the `IntersectionObserver` API.
- Sections animate **in order** — Publications first, then People, then Services.

### 2. Section Preview Content
Each preview section contains:
- A **clickable section heading** (e.g., `<h2>`) that links to the full page.
- A **short preview** of the actual content:
  - **Publications**: Show the first 3 publications from `js/publications.js` (same data source as `publications.html`), rendered with the existing `.pub-list` styles.
  - **People**: Show the recruiting blurb (static text already in `people.html`).
  - **Services**: Show the first 5 items from the program committee list (same data source as `js/services.js`).
- A **"View all →"** link at the bottom of each preview section, pointing to the full page.

### 3. Navigation on Click
- Section heading clicks → navigate to the corresponding page (`publications.html`, `people.html`, `services.html`).
- "View all →" link → same navigation targets.
- All links are standard `<a href="...">` anchors (no JS router needed).

---

## Affected Files

| File | Change |
|------|--------|
| `index.html` | Add three preview section `<div>` containers after `#about-main` |
| `js/me.js` | After `fillAbout()`, call a new `fillPreviews()` function that fetches publication/service data and populates the preview sections |
| `css/main.css` | Add `.preview-section`, `.preview-section.visible`, and animation styles |

---

## CSS Classes to Add

```css
/* Initially hidden, ready to animate in */
.preview-section {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

/* Triggered by IntersectionObserver */
.preview-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.preview-section__title a {
  color: var(--text-heading);
  text-decoration: none;
}
.preview-section__title a:hover {
  color: var(--link);
  text-decoration: underline;
}

.preview-section__viewall {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
}
```

---

## JS Logic to Add (inside `me.js`, after `fillAbout`)

```js
async function fillPreviews() {
  // --- Publications preview ---
  // Re-use the same fetch call that publications.js uses to get pub data
  // Render first 3 items into #preview-publications using existing .pub-list markup

  // --- People preview ---
  // Static content — just render the recruiting paragraph

  // --- Services preview ---
  // Re-use the same fetch call that services.js uses to get service data
  // Render first 5 PC items into #preview-services using existing .service-pc-list markup

  // --- Scroll-reveal via IntersectionObserver ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.preview-section').forEach(el => observer.observe(el));
}
```

---

## HTML Structure to Add in `index.html` (after `#about-main`)

```html
<!-- Publications Preview -->
<div id="preview-publications" class="preview-section" aria-label="Publications preview">
  <h2 class="preview-section__title"><a href="publications.html">Publications</a></h2>
  <ul class="pub-list" id="preview-pub-list"></ul>
  <a class="preview-section__viewall" href="publications.html">View all →</a>
</div>

<!-- People Preview -->
<div id="preview-people" class="preview-section" aria-label="People preview">
  <h2 class="preview-section__title"><a href="people.html">People</a></h2>
  <div id="preview-people-content"></div>
  <a class="preview-section__viewall" href="people.html">View all →</a>
</div>

<!-- Services Preview -->
<div id="preview-services" class="preview-section" aria-label="Services preview">
  <h2 class="preview-section__title"><a href="services.html">Services</a></h2>
  <ul class="service-pc-list" id="preview-service-list"></ul>
  <a class="preview-section__viewall" href="services.html">View all →</a>
</div>
```

---

## Notes

- The preview sections are only rendered on `index.html`. The other pages are unchanged.
- The JS fetches data independently (it does not depend on `publications.js` or `services.js` being loaded). The data source URLs must match what those scripts already use.
- The scroll-reveal uses native `IntersectionObserver` — no external libraries required.
- Staggered animation delay can be added optionally via `transition-delay` on each `.preview-section` (`0s`, `0.1s`, `0.2s`).
