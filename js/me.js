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
      a.textContent = "Email";
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

    var h2 = document.createElement("h2");
    h2.textContent = "Interests";
    root.appendChild(h2);
    var ul = document.createElement("ul");
    (me.research_interests || []).forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  function applySiteTitle(me) {
    if (!me.name) return;
    var mast = document.querySelector(".masthead__title a");
    if (mast) mast.textContent = me.name;
    var foot = document.getElementById("footer-name");
    if (foot) foot.textContent = me.name;
    if (document.getElementById("about-main")) document.title = me.name;
  }

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
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", load);
  else load();
})();
