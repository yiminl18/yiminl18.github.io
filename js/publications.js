(function () {
  function escapeHtml(s) {
    if (s == null || s === "") return "";
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function formatAuthors(names) {
    if (!Array.isArray(names)) return "";
    return names
      .map(function (name) {
        return name === "Yiming Lin"
          ? "<strong>Yiming Lin</strong>"
          : escapeHtml(name);
      })
      .join(", ");
  }

  function appendLinks(container, pub) {
    var first = true;
    ["paper_link", "code_link", "video"].forEach(function (key) {
      var href = pub[key];
      if (!href) return;
      if (first) {
        container.appendChild(document.createTextNode(" "));
        first = false;
      } else container.appendChild(document.createTextNode(" · "));
      var a = document.createElement("a");
      a.href = href;
      a.textContent =
        key === "paper_link" ? "Paper" : key === "code_link" ? "Code" : "Video";
      a.rel = "noopener noreferrer";
      if (key === "paper_link") a.setAttribute("target", "_blank");
      else if (key === "code_link") a.setAttribute("target", "_blank");
      else if (key === "video") a.setAttribute("target", "_blank");
      container.appendChild(a);
    });
  }

  function createBadge(pub) {
    var conf =
      pub.conference != null && pub.conference !== ""
        ? String(pub.conference)
        : "";
    var year =
      pub.year != null && pub.year !== "" ? String(pub.year) : "";
    if (!conf && !year) return null;

    var badge = document.createElement("div");
    badge.className = "pub-badge";
    var label = [conf, year].filter(Boolean).join(", ");
    badge.textContent = label;
    badge.setAttribute("aria-label", label);
    return badge;
  }

  function sortPubs(a, b) {
    var ya = a.year != null ? Number(a.year) : 0;
    var yb = b.year != null ? Number(b.year) : 0;
    if (yb !== ya) return yb - ya;
    return (a.title || "").localeCompare(b.title || "");
  }

  async function load() {
    var list = document.getElementById("pub-list");
    if (!list) return;

    try {
      var res = await fetch("data/publication.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.statusText);
      var pubs = await res.json();
      if (!Array.isArray(pubs)) throw new Error("Invalid data");

      pubs.sort(sortPubs);
      list.innerHTML = "";

      pubs.forEach(function (pub) {
        var li = document.createElement("li");

        var row = document.createElement("div");
        row.className = "pub-row";

        var badge = createBadge(pub);
        if (badge) row.appendChild(badge);

        var title = document.createElement("div");
        title.className = "pub-title";
        title.textContent = pub.title || "";
        row.appendChild(title);

        li.appendChild(row);

        var venue = document.createElement("div");
        venue.className = "pub-venue";
        venue.innerHTML = formatAuthors(pub.authors) + ".";
        appendLinks(venue, pub);

        li.appendChild(venue);
        list.appendChild(li);
      });
    } catch (e) {
      list.innerHTML =
        '<li><p class="placeholder-note">Could not load publications. Ensure <code>data/publication.json</code> is available.</p></li>';
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", load);
  else load();
})();
