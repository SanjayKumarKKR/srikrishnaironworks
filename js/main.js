/* Site behaviour: menu, contact details, projects, forms. No dependencies. */
(function () {
  "use strict";
  var S = window.SITE || {};

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function waLink(text) {
    return "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(text || S.whatsappMessage || "");
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Contact details from config ---------- */
  document.querySelectorAll("[data-site]").forEach(function (el) {
    var key = el.getAttribute("data-site");
    switch (key) {
      case "phone":
        el.textContent = S.phoneDisplay;
        if (el.tagName === "A") el.href = "tel:" + S.phoneLink;
        break;
      case "email":
        el.textContent = S.email;
        if (el.tagName === "A") el.href = "mailto:" + S.email;
        break;
      case "whatsapp":
        if (el.tagName === "A") el.href = waLink(el.getAttribute("data-wa-text"));
        break;
      case "map":
        if (S.mapEmbedUrl) {
          var f = document.createElement("iframe");
          f.className = "map";
          f.src = S.mapEmbedUrl;
          f.title = "Workshop location map";
          f.loading = "lazy";
          f.referrerPolicy = "no-referrer-when-downgrade";
          el.replaceWith(f);
        } else {
          el.remove();
        }
        break;
      default:
        if (S[key]) el.textContent = S[key];
        else if (el.closest("li")) el.closest("li").remove();
    }
  });
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Projects ---------- */
  function projectCard(p) {
    var cats = window.PROJECT_CATEGORIES || {};
    var imgs = p.images || [];
    var idx = window.PROJECTS.indexOf(p);
    var media = imgs.length
      ? '<button type="button" class="project-open" data-project="' + idx + '" aria-label="View ' + imgs.length + " photos of " + esc(p.title) + '">' +
          '<img src="' + esc(imgs[0]) + '" alt="' + esc(p.title) + '" loading="lazy" width="800" height="500">' +
          (imgs.length > 1 ? '<span class="photo-count">' + imgs.length + " photos</span>" : "") +
        "</button>"
      : '<div class="img-ph"><span>Project photo placeholder</span></div>';
    return (
      '<article class="project reveal in">' +
        '<div class="project-media">' + (p.sample ? '<span class="badge-sample">Sample — replace</span>' : "") + media + "</div>" +
        '<div class="project-body">' +
          '<div class="project-cat">' + esc(cats[p.category] || p.category) + "</div>" +
          "<h3>" + esc(p.title) + "</h3>" +
          "<p>" + esc(p.scope) + "</p>" +
          '<dl class="project-facts">' +
            (p.location ? "<dt>Location</dt><dd>" + esc(p.location) + "</dd>" : "") +
            (p.size ? "<dt>Size</dt><dd>" + esc(p.size) + "</dd>" : "") +
            (p.year ? "<dt>Year</dt><dd>" + esc(p.year) + "</dd>" : "") +
          "</dl>" +
        "</div>" +
      "</article>"
    );
  }

  var featured = document.getElementById("featured-projects");
  if (featured && window.PROJECTS) {
    featured.innerHTML = window.PROJECTS.filter(function (p) { return p.featured; })
      .slice(0, 3).map(projectCard).join("");
  }

  var grid = document.getElementById("project-grid");
  var filterBar = document.getElementById("project-filters");
  if (grid && filterBar && window.PROJECTS) {
    var cats = window.PROJECT_CATEGORIES || {};
    var keys = ["all"].concat(Object.keys(cats));
    filterBar.innerHTML = keys.map(function (k) {
      return '<button type="button" class="filter-btn" data-filter="' + k + '" aria-pressed="' + (k === "all") + '">' +
        esc(k === "all" ? "All projects" : cats[k]) + "</button>";
    }).join("");

    var render = function (filter) {
      var list = window.PROJECTS.filter(function (p) { return filter === "all" || p.category === filter; });
      grid.innerHTML = list.length
        ? list.map(projectCard).join("")
        : '<p class="muted">No projects in this category yet.</p>';
    };
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      render(btn.getAttribute("data-filter"));
    });
    var initial = location.hash.replace("#", "");
    if (cats[initial]) {
      filterBar.querySelector('[data-filter="' + initial + '"]').click();
    } else {
      render("all");
    }
  }

  /* ---------- Project photo gallery ---------- */
  var gallery = null, gImgs = [], gPos = 0, gTitle = "";
  function showPhoto() {
    var img = gallery.querySelector("img");
    img.src = gImgs[gPos];
    img.alt = gTitle + " — photo " + (gPos + 1) + " of " + gImgs.length;
    gallery.querySelector(".gallery-count").textContent = (gPos + 1) + " / " + gImgs.length;
  }
  function step(d) { gPos = (gPos + d + gImgs.length) % gImgs.length; showPhoto(); }
  function openGallery(p) {
    if (!gallery) {
      gallery = document.createElement("dialog");
      gallery.className = "gallery";
      gallery.innerHTML =
        '<div class="gallery-bar"><strong class="gallery-title"></strong><span class="gallery-count"></span>' +
        '<button type="button" class="gallery-close" aria-label="Close gallery">✕</button></div>' +
        '<div class="gallery-stage"><button type="button" class="gallery-nav prev" aria-label="Previous photo">‹</button>' +
        '<img alt=""><button type="button" class="gallery-nav next" aria-label="Next photo">›</button></div>';
      document.body.appendChild(gallery);
      gallery.querySelector(".gallery-close").addEventListener("click", function () { gallery.close(); });
      gallery.querySelector(".prev").addEventListener("click", function () { step(-1); });
      gallery.querySelector(".next").addEventListener("click", function () { step(1); });
      gallery.addEventListener("click", function (e) { if (e.target === gallery) gallery.close(); });
      gallery.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
    gImgs = p.images; gPos = 0; gTitle = p.title;
    gallery.querySelector(".gallery-title").textContent = p.title;
    gallery.querySelectorAll(".gallery-nav").forEach(function (b) { b.hidden = gImgs.length < 2; });
    showPhoto();
    gallery.showModal();
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".project-open");
    if (btn) openGallery(window.PROJECTS[Number(btn.getAttribute("data-project"))]);
  });

  /* ---------- Quote form → WhatsApp message ---------- */
  function setError(field, msg) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    var err = wrap.querySelector(".error");
    if (msg) {
      wrap.classList.add("invalid");
      field.setAttribute("aria-invalid", "true");
      if (!err) { err = document.createElement("div"); err.className = "error"; wrap.appendChild(err); }
      err.id = field.id + "-error";
      field.setAttribute("aria-describedby", err.id);
      err.textContent = msg;
    } else {
      wrap.classList.remove("invalid");
      field.removeAttribute("aria-invalid");
      if (err) err.remove();
    }
  }

  function showStatus(form, type, title, body) {
    var box = form.querySelector(".form-status");
    box.className = "form-status show " + type;
    box.innerHTML = "<h3>" + esc(title) + "</h3><p>" + body + "</p>";
    box.setAttribute("tabindex", "-1");
    box.focus();
  }

  // Builds one message: "*Label:* value" per filled field, in form order.
  function buildMessage(form) {
    var lines = ["*New enquiry from the website*", ""];
    form.querySelectorAll(".field").forEach(function (wrap) {
      var f = wrap.querySelector("input, select, textarea");
      var label = wrap.querySelector("label");
      if (!f || !label) return;
      var value = f.value.trim();
      if (!value) return;
      var name = label.textContent.replace("*", "").trim();
      lines.push(f.tagName === "TEXTAREA" ? "*" + name + ":*\n" + value : "*" + name + ":* " + value);
    });
    return lines.join("\n");
  }

  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    form.setAttribute("novalidate", "");
    form.querySelectorAll("input, select, textarea").forEach(function (f) {
      f.addEventListener("input", function () { if (f.closest(".invalid")) setError(f, ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll("input, select, textarea").forEach(function (f) {
        var msg = f.checkValidity() ? "" : (f.validity.valueMissing ? "This field is required." : "Please enter a valid value.");
        setError(f, msg);
        if (msg && !firstBad) firstBad = f;
      });
      if (firstBad) { firstBad.focus(); return; }

      var url = waLink(buildMessage(form));
      var win = window.open(url, "_blank");
      if (win) win.opener = null;
      else location.href = url;
      showStatus(form, "ok", "WhatsApp is opening with your enquiry",
        "Press <strong>Send</strong> in WhatsApp to deliver it to us. You can attach drawings or site photos in the same chat. " +
        "If WhatsApp did not open, <a href=\"" + esc(url) + "\" target=\"_blank\" rel=\"noopener\">tap here</a> or call us on " +
        '<a href="tel:' + esc(S.phoneLink) + '">' + esc(S.phoneDisplay) + "</a>.");
    });
  });
})();
