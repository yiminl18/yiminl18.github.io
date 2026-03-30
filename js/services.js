(function () {
  function escapeHtml(s) {
    if (s == null || s === "") return "";
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function sortItems(a, b) {
    var ya = a.year != null ? Number(a.year) : 0;
    var yb = b.year != null ? Number(b.year) : 0;
    if (yb !== ya) return yb - ya;
    return (a.conference || "").localeCompare(b.conference || "");
  }

  async function load() {
    var list = document.getElementById("service-pc-list");
    if (!list) return;

    try {
      var res = await fetch("data/service.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.statusText);
      var items = await res.json();
      if (!Array.isArray(items)) throw new Error("Invalid data");

      items.sort(sortItems);
      list.innerHTML = "";

      items.forEach(function (row) {
        var li = document.createElement("li");
        var conf = escapeHtml(row.conference != null ? String(row.conference) : "");
        var year = row.year != null ? String(row.year) : "";
        var role = escapeHtml(row.role != null ? String(row.role) : "");
        li.innerHTML =
          "<strong>" +
          conf +
          "</strong>" +
          (year ? " (" + escapeHtml(year) + ")" : "") +
          (role ? " — " + role : "");
        list.appendChild(li);
      });
    } catch (e) {
      list.innerHTML =
        '<li><p class="placeholder-note">Could not load <code>data/service.json</code>.</p></li>';
    }
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", load);
  else load();
})();
