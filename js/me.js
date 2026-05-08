(function () {
  function escapeHtml(s) {
    if (s == null || s === "") return "";
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function fillSidebar(me) {
    var photo = document.getElementById("me-photo");
    if (photo) {
      if (me.photo) photo.src = me.photo;
      if (me.name) photo.alt = me.name;
    }
    var nameEl = document.getElementById("me-name");
    if (nameEl && me.name) nameEl.textContent = me.name;
    var roleEl = document.getElementById("me-role");
    if (roleEl && me.role != null) roleEl.textContent = me.role;
    var incomingEl = document.getElementById("me-role-incoming");
    if (incomingEl && me.role_incoming) incomingEl.textContent = me.role_incoming;

    var contactUl = document.getElementById("me-contact");
    if (!contactUl) return;
    contactUl.innerHTML = "";

    if (me.location) {
      var li0 = document.createElement("li");
      li0.textContent = me.location;
      contactUl.appendChild(li0);
    }
    if (me.email) {
      var li1 = document.createElement("li");
      var a = document.createElement("a");
      a.href = "mailto:" + me.email;
      a.textContent = me.email;
      li1.appendChild(a);
      contactUl.appendChild(li1);
    }
    (me.contact_links || []).forEach(function (link) {
      if (!link || !link.href) return;
      var li = document.createElement("li");
      var al = document.createElement("a");
      al.href = link.href;
      al.textContent = link.label || link.href;
      al.rel = "noopener noreferrer";
      al.target = "_blank";
      li.appendChild(al);
      contactUl.appendChild(li);
    });
  }

  function fillAbout(me) {
    var root = document.getElementById("about-main");
    if (!root) return;
    root.innerHTML = "";

    var paras = me.bio_paragraphs;
    if (!paras || !paras.length) {
      if (me.description)
        paras = [escapeHtml(me.description)];
      else paras = [];
    }
    if (me.recruiting) {
      var box = document.createElement("div");
      box.className = "recruiting-box";
      var span = document.createElement("em");
      span.innerHTML = "<strong>" + escapeHtml(me.recruiting) + "</strong>";
      box.appendChild(span);
      root.appendChild(box);
    }

    paras.forEach(function (html) {
      var p = document.createElement("p");
      p.innerHTML = html;
      root.appendChild(p);
    });

    if (me.photography_paragraph) {
      var p2 = document.createElement("p");
      p2.innerHTML = me.photography_paragraph;
      root.appendChild(p2);
    }

    if (me.resume && me.resume.href) {
      var pr = document.createElement("p");
      pr.className = "resume-line";
      var ar = document.createElement("a");
      ar.href = me.resume.href;
      ar.setAttribute("download", "");
      ar.textContent = me.resume.label || "Résumé";
      pr.appendChild(ar);
      pr.appendChild(document.createTextNode("."));
      root.appendChild(pr);
    }

  }

  function applySiteTitle(me) {
    if (!me.name) return;
    var mast = document.querySelector(".masthead__title a");
    if (mast) mast.textContent = me.name;
    var foot = document.getElementById("footer-name");
    if (foot) foot.textContent = me.name;
    if (document.getElementById("about-main")) document.title = me.name;
  }

  // ── Preview helpers ────────────────────────────────────────────────────────

  // Build a single publication <li> element (mirrors publications.js rendering)
  function buildPubLI(pub) {
    var li = document.createElement("li");

    // Row: badge + title
    var row = document.createElement("div");
    row.className = "pub-row";

    var conf = pub.conference != null && pub.conference !== "" ? String(pub.conference) : "";
    var year = pub.year != null && pub.year !== "" ? String(pub.year) : "";
    if (conf || year) {
      var badge = document.createElement("div");
      badge.className = "pub-badge";
      var label = [conf, year].filter(Boolean).join(", ");
      badge.textContent = label;
      badge.setAttribute("aria-label", label);
      row.appendChild(badge);
    }

    var titleEl = document.createElement("div");
    titleEl.className = "pub-title";
    if (pub.paper_link) {
      var titleLink = document.createElement("a");
      titleLink.href = pub.paper_link;
      titleLink.textContent = pub.title || "";
      titleLink.rel = "noopener noreferrer";
      titleLink.target = "_blank";
      titleLink.className = "pub-title-link";
      titleEl.appendChild(titleLink);
    } else {
      titleEl.textContent = pub.title || "";
    }
    row.appendChild(titleEl);
    li.appendChild(row);

    // Authors + optional links
    var venue = document.createElement("div");
    venue.className = "pub-venue";
    var authors = Array.isArray(pub.authors)
      ? pub.authors.map(function (n) {
          return n === "Yiming Lin"
            ? "<strong>Yiming Lin</strong>"
            : escapeHtml(n);
        }).join(", ")
      : "";
    venue.innerHTML = authors + (authors ? "." : "");

    var firstLink = true;
    ["code_link", "video"].forEach(function (key) {
      var href = pub[key];
      if (!href) return;
      venue.appendChild(document.createTextNode(firstLink ? " " : " · "));
      firstLink = false;
      var a = document.createElement("a");
      a.href = href;
      a.textContent = key === "code_link" ? "Code" : "Video";
      a.rel = "noopener noreferrer";
      a.target = "_blank";
      venue.appendChild(a);
    });

    li.appendChild(venue);
    return li;
  }

  // Build a single service <li> element (mirrors services.js rendering)
  function buildServiceLI(item) {
    var li = document.createElement("li");
    var conf = escapeHtml(item.conference != null ? String(item.conference) : "");
    var year = item.year != null ? String(item.year) : "";
    var role = escapeHtml(item.role != null ? String(item.role) : "");
    li.innerHTML =
      "<strong>" + conf + "</strong>" +
      (year ? " (" + escapeHtml(year) + ")" : "") +
      (role ? " — " + role : "");
    return li;
  }

  async function fillPreviews() {
    // ── Publications preview: all entries, sorted newest first ───────────────
    try {
      var pubRes = await fetch("data/publication.json", { cache: "no-cache" });
      if (pubRes.ok) {
        var pubs = await pubRes.json();
        if (Array.isArray(pubs)) {
          pubs.sort(function (a, b) {
            var ya = a.year != null ? Number(a.year) : 0;
            var yb = b.year != null ? Number(b.year) : 0;
            if (yb !== ya) return yb - ya;
            return (a.title || "").localeCompare(b.title || "");
          });
          var pubList = document.getElementById("preview-pub-list");
          if (pubList) {
            pubs.forEach(function (pub) {
              pubList.appendChild(buildPubLI(pub));
            });
          }
        }
      }
    } catch (e) { /* fail silently */ }

    // ── People preview: recruiting paragraph ─────────────────────────────────
    var peopleDiv = document.getElementById("preview-people-content");
    if (peopleDiv) {
      var p = document.createElement("p");
      p.textContent =
        "I am recruiting research assistants and postdocs starting Fall 2026, and PhD students starting Spring 2027. " +
        "If you are interested, please email me your CV, the position you are seeking, and a brief description of the research you would like to pursue.";
      peopleDiv.appendChild(p);
    }

    // ── Services preview: all PC items, sorted newest first ──────────────────
    try {
      var svcRes = await fetch("data/service.json", { cache: "no-cache" });
      if (svcRes.ok) {
        var items = await svcRes.json();
        if (Array.isArray(items)) {
          items.sort(function (a, b) {
            var ya = a.year != null ? Number(a.year) : 0;
            var yb = b.year != null ? Number(b.year) : 0;
            if (yb !== ya) return yb - ya;
            return (a.conference || "").localeCompare(b.conference || "");
          });
          var svcList = document.getElementById("preview-service-list");
          if (svcList) {
            items.forEach(function (item) {
              svcList.appendChild(buildServiceLI(item));
            });
          }
        }
      }
    } catch (e) { /* fail silently */ }

    var sections = document.querySelectorAll(".preview-section");

    // ── Scroll-reveal (fires once per section) ───────────────────────────────
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      sections.forEach(function (el) { revealObserver.observe(el); });
    } else {
      sections.forEach(function (el) { el.classList.add("visible"); });
    }

    // ── Scroll-spy: bold the matching nav item ────────────────────────────────
    if (!("IntersectionObserver" in window)) return;

    var sectionNavMap = {
      "preview-publications": "publications.html",
      "preview-people":       "people.html",
      "preview-services":     "services.html"
    };
    var sectionOrder = ["preview-publications", "preview-people", "preview-services"];
    var navLinks = document.querySelectorAll(".site-nav a");
    var visible = {};

    function updateActiveNav() {
      var active = null;
      for (var i = 0; i < sectionOrder.length; i++) {
        if (visible[sectionOrder[i]]) { active = sectionOrder[i]; break; }
      }
      navLinks.forEach(function (a) {
        var href = a.getAttribute("href");
        var shouldBeActive = active
          ? href === sectionNavMap[active]
          : href === "index.html";
        a.classList.toggle("is-active", shouldBeActive);
      });
    }

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      updateActiveNav();
    }, { rootMargin: "0px 0px -55% 0px", threshold: 0 });

    sections.forEach(function (el) { spyObserver.observe(el); });
  }

  // ── End preview helpers ────────────────────────────────────────────────────

  async function load() {
    try {
      var res = await fetch("data/me.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.statusText);
      var me = await res.json();
      fillSidebar(me);
      fillAbout(me);
      applySiteTitle(me);
    } catch (e) {
      var about = document.getElementById("about-main");
      if (about)
        about.innerHTML =
          '<p class="placeholder-note">Could not load <code>data/me.json</code>.</p>';
    }
    // Run previews only on the About/index page
    if (document.getElementById("preview-publications")) {
      fillPreviews();
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", load);
  else load();
})();
