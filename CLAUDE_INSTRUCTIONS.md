# Claude Instructions: Implement Scroll-Reveal Section Previews on About Page

## Context

This is a static personal academic website. The About page (`index.html`) currently shows only a bio section. The goal is to add scroll-animated previews of Publications, People, and Services **below** the bio, so visitors see a teaser of each section as they scroll down. Clicking any section title or "View all →" link navigates to the full page.

## What You Need to Know First

Before making any changes, read these files to understand the current structure:
- `index.html` — the About page; content is injected into `#about-main` by `js/me.js`
- `js/me.js` — fetches `data/me.json` and renders the bio; this is where you'll add preview logic
- `js/publications.js` — fetches publication data and renders it; find the data source URL it uses
- `js/services.js` — fetches service/PC data and renders it; find the data source URL it uses
- `css/main.css` — all existing styles; you'll append new styles here

## Task 1 — Modify `index.html`

Inside `<main class="main">`, **after** the `<div id="about-main">` element, add these three preview section divs:

```html
<!-- Publications Preview -->
<div id="preview-publications" class="preview-section" aria-label="Publications preview">
  <h2 class="preview-section__title"><a href="publications.html">Publications</a></h2>
  <ul class="pub-list" id="preview-pub-list"></ul>
  <a class="preview-section__viewall" href="publications.html">View all publications →</a>
</div>

<!-- People Preview -->
<div id="preview-people" class="preview-section" aria-label="People preview">
  <h2 class="preview-section__title"><a href="people.html">People</a></h2>
  <div id="preview-people-content"></div>
  <a class="preview-section__viewall" href="people.html">View people page →</a>
</div>

<!-- Services Preview -->
<div id="preview-services" class="preview-section" aria-label="Services preview">
  <h2 class="preview-section__title"><a href="services.html">Services</a></h2>
  <ul class="service-pc-list" id="preview-service-list"></ul>
  <a class="preview-section__viewall" href="services.html">View all services →</a>
</div>
```

Do **not** change anything else in `index.html`.

## Task 2 — Modify `css/main.css`

Append the following CSS rules at the **end** of `css/main.css`. Do not modify any existing rules.

```css
/* =============================================
   Scroll-reveal preview sections (index.html)
   ============================================= */

.preview-section {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.preview-section.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered delay for each section */
#preview-publications { transition-delay: 0s; }
#preview-people       { transition-delay: 0.1s; }
#preview-services     { transition-delay: 0.2s; }

.preview-section__title {
  margin: 0 0 0.75rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-heading);
}

.preview-section__title a {
  color: var(--text-heading);
  text-decoration: none;
}

.preview-section__title a:hover,
.preview-section__title a:focus {
  color: var(--link);
  text-decoration: underline;
}

.preview-section__viewall {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--link);
}

.preview-section__viewall:hover {
  color: var(--link-hover);
  text-decoration: underline;
}
```

## Task 3 — Modify `js/me.js`

### Step 3a — Understand the data sources

Open `js/publications.js` and `js/services.js`. Find the URL strings passed to `fetch(...)` in each file. You will use these exact same URLs in the new preview functions below.

### Step 3b — Add `fillPreviews()` function

Inside the existing IIFE in `js/me.js`, add the following function. Replace `'DATA_URL_FOR_PUBLICATIONS'` and `'DATA_URL_FOR_SERVICES'` with the actual URLs you found in Step 3a.

```js
async function fillPreviews() {
  // ---- Publications preview (first 3 items) ----
  try {
    var pubRes = await fetch('DATA_URL_FOR_PUBLICATIONS', { cache: 'no-cache' });
    if (pubRes.ok) {
      var pubData = await pubRes.json();
      // pubData may be an array directly, or have a property like pubData.publications
      // Inspect the shape and adjust accordingly
      var pubs = Array.isArray(pubData) ? pubData : (pubData.publications || []);
      var pubList = document.getElementById('preview-pub-list');
      if (pubList) {
        pubs.slice(0, 3).forEach(function (pub) {
          var li = document.createElement('li');
          // Build the same markup that publications.js uses for each pub entry.
          // At minimum render: badge (venue abbreviation), title, full venue string.
          // Copy the exact rendering logic from publications.js renderPub() or equivalent.
          li.innerHTML = buildPubHTML(pub); // see Step 3c
          pubList.appendChild(li);
        });
      }
    }
  } catch (e) { /* silently ignore */ }

  // ---- People preview (static recruiting text) ----
  var peopleDiv = document.getElementById('preview-people-content');
  if (peopleDiv) {
    peopleDiv.innerHTML =
      '<p>I am recruiting multiple Ph.D. students, research assistants, and postdoctoral researchers ' +
      'starting in Fall 2026. Undergraduates, master’s students, and visiting students are welcome as well.</p>';
  }

  // ---- Services preview (first 5 PC items) ----
  try {
    var svcRes = await fetch('DATA_URL_FOR_SERVICES', { cache: 'no-cache' });
    if (svcRes.ok) {
      var svcData = await svcRes.json();
      // Inspect shape: may be array or have a property like svcData.pc
      var pcItems = Array.isArray(svcData) ? svcData : (svcData.pc || svcData.program_committee || []);
      var svcList = document.getElementById('preview-service-list');
      if (svcList) {
        pcItems.slice(0, 5).forEach(function (item) {
          var li = document.createElement('li');
          // Copy the same rendering logic from services.js
          li.innerHTML = buildServiceHTML(item); // see Step 3c
          svcList.appendChild(li);
        });
      }
    }
  } catch (e) { /* silently ignore */ }

  // ---- Scroll-reveal with IntersectionObserver ----
  var sections = document.querySelectorAll('.preview-section');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    sections.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show all immediately
    sections.forEach(function (el) { el.classList.add('visible'); });
  }
}
```

### Step 3c — Add `buildPubHTML` and `buildServiceHTML` helper functions

Look at `js/publications.js` and `js/services.js`. Find how each file renders a single list item (likely a `renderPub` or similar function). Copy that rendering logic into two small helper functions in `me.js`:

```js
function buildPubHTML(pub) {
  // Copy/adapt rendering logic from publications.js for a single publication entry.
  // Must return an HTML string.
  // Use the same .pub-row, .pub-badge, .pub-title, .pub-venue classes.
}

function buildServiceHTML(item) {
  // Copy/adapt rendering logic from services.js for a single PC item.
  // Must return an HTML string.
}
```

### Step 3d — Call `fillPreviews()` from `load()`

In the existing `load()` async function, after the line that calls `fillAbout(me)`, add:

```js
// Only run previews on the About/index page
if (document.getElementById('preview-publications')) {
  fillPreviews();
}
```

## Verification Checklist

After making all changes:

1. Open `index.html` in a browser (or via `live-server` / GitHub Pages).
2. Confirm the About bio loads as before.
3. Scroll down — verify that the Publications, People, and Services sections appear **one by one** with a smooth fade-in/slide-up animation.
4. Confirm Publications shows 3 items, People shows the recruiting text, Services shows 5 items.
5. Click each section title and "View all →" link — confirm they navigate to the correct pages.
6. Open `publications.html`, `people.html`, `services.html` directly — confirm they are unchanged.
7. Check browser console for any JS errors.

## Constraints

- Do **not** modify `publications.html`, `people.html`, or `services.html`.
- Do **not** add any external JS libraries (no jQuery, no GSAP, no AOS).
- Keep all changes backward-compatible; the site must still work if JS is disabled (sections can simply remain hidden in that case — acceptable degradation).
- Match the existing code style in each file (var declarations, function expressions, etc.).
