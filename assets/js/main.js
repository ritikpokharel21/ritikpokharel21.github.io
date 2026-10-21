/* Ritik Pokharel portfolio - theme, nav, counters, lazy map. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme: persisted choice, else OS preference */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  function applyTheme(name) {
    root.setAttribute("data-theme", name);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", name === "dark" ? "true" : "false");
      themeToggle.setAttribute("aria-label", name === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }
  var stored = null;
  try { stored = localStorage.getItem("rp-theme"); } catch (e) { /* private mode */ }
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else {
    applyTheme("dark"); /* default: dark mode */
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("rp-theme", next); } catch (e) { /* private mode */ }
    });
  }

  /* Project tabs: center the active tab inside the tab bar on load, and fade the
     edge hints as the bar is scrolled so it is obvious the bar scrolls sideways. */
  (function () {
    var scroller = document.querySelector(".project-tabs");
    var wrap = document.querySelector(".project-tabs-wrap");
    if (!scroller) return;
    var active = scroller.querySelector(".ptab.active");
    function center() {
      if (!active) return;
      var r = active.getBoundingClientRect();
      var s = scroller.getBoundingClientRect();
      var target = scroller.scrollLeft + (r.left - s.left) - (scroller.clientWidth - active.offsetWidth) / 2;
      scroller.scrollLeft = Math.max(0, target);
    }
    function fades() {
      if (!wrap) return;
      wrap.classList.toggle("at-start", scroller.scrollLeft <= 4);
      wrap.classList.toggle("at-end", scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4);
    }
    center();
    fades();
    window.addEventListener("load", function () { center(); fades(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { center(); fades(); });
    scroller.addEventListener("scroll", fades, { passive: true });
  })();

  /* Certificate lightbox: click a certificate to view it in place; click outside, the close button, or ESC to dismiss */
  (function () {
    var lb = document.getElementById("certLightbox");
    if (!lb) return;
    var lbImg = document.getElementById("lightboxImg");
    var lbCap = document.getElementById("lightboxCap");
    var lbClose = lb.querySelector(".lightbox-close");
    var lastFocus = null;
    var hideTimer = null;
    function openLb(src, title) {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      lastFocus = document.activeElement;
      lbImg.src = src;
      lbImg.alt = "Certificate: " + title;
      lbCap.textContent = title;
      lb.hidden = false;
      document.body.classList.add("lightbox-open");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { lb.classList.add("open"); });
      });
      lbClose.focus();
    }
    function closeLb() {
      lb.classList.remove("open");
      document.body.classList.remove("lightbox-open");
      hideTimer = setTimeout(function () {
        lb.hidden = true;
        lbImg.removeAttribute("src");
        hideTimer = null;
      }, 260);
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    }
    Array.prototype.forEach.call(document.querySelectorAll(".cert-img"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var img = a.querySelector("img");
        var label = a.getAttribute("aria-label") || "";
        var title = label.replace(/^View certificate:\s*/, "") || (img && img.getAttribute("alt")) || "Certificate";
        openLb(a.getAttribute("href"), title);
      });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target === lbClose) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lb.hidden) closeLb();
    });
  })();

  /* Project cards: whole card opens its project page (same tab); inner links keep working */
  Array.prototype.forEach.call(document.querySelectorAll(".card[data-project]"), function (card) {
    var target = card.getAttribute("data-project");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      window.location.href = target;
    });
    card.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a")) {
        e.preventDefault();
        window.location.href = target;
      }
    });
  });

  /* Mobile nav */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* Active nav link on scroll */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var linkMap = {};
  if (navLinks) {
    Array.prototype.forEach.call(navLinks.querySelectorAll("a"), function (a) {
      linkMap[a.getAttribute("href").slice(1)] = a;
    });
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove("active"); });
          var link = linkMap[entry.target.id];
          if (link) link.classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* Animated stat counters */
  function animateCounter(el) {
    var run = (el._counterRun || 0) + 1;
    el._counterRun = run;
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    function fmt(v) {
      return prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    }
    if (reduceMotion) {
      el.textContent = fmt(target);
      return;
    }
    var dur = 1400, start = null;
    function frame(ts) {
      if (el._counterRun !== run) return; /* a newer run took over */
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(frame);
  }
  var statEls = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target); /* replays every time the stat scrolls back into view */
        } else {
          entry.target._counterRun = (entry.target._counterRun || 0) + 1; /* cancel any mid-count run while off-screen */
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach(function (el) { statObs.observe(el); });
  } else {
    statEls.forEach(animateCounter);
  }

  /* Back to top */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* Lazy-load Leaflet map when the Field Sites section approaches */
  var mapEl = document.getElementById("map");
  var mapLoaded = false;
  function loadCss(href) {
    return new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
  function loadJs(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }
  function initMap() {
    if (mapLoaded) return;
    mapLoaded = true;
    var fallback = document.getElementById("mapFallback");
    Promise.all([
      loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"),
      loadJs("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
    ]).then(function () {
      var map = L.map("map", { scrollWheelZoom: false }).setView([24, -40], 2);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
      }).addTo(map);
      var sites = [
        { coords: [30.4515, -91.1546], title: "Baton Rouge, LA", text: "Home base - Global Geospatial Institute / Global Geospatial Solutions.", link: "#experience", linkText: "Experience" },
        { coords: [30.2142, -92.3698], title: "Crowley, LA", text: "LSU AgCenter Rice Research Station - 720-plot UAV multispectral campaigns.", link: "#projects", linkText: "Projects" },
        { coords: [29.5958, -90.7195], title: "A Louisiana parish, LA", text: "Offline Field Maps disaster-response system - 16 offline areas.", link: "#experience", linkText: "Experience" },
        { coords: [26.9081, 87.9268], title: "Ilam, Nepal", text: "GIS-based soil fertility mapping of the Pandam cardamom-growing area.", link: "#publications", linkText: "Publications" }
      ];
      sites.forEach(function (s) {
        L.marker(s.coords).addTo(map)
          .bindPopup("<strong>" + s.title + "</strong><br>" + s.text + '<br><a href="' + s.link + '">' + s.linkText + " &rarr;</a>");
      });
    }).catch(function () {
      if (fallback) fallback.hidden = false;
      mapEl.setAttribute("aria-hidden", "true");
    });
  }
  var fsEl = document.getElementById("field-sites");
  if (mapEl && fsEl) {
    if ("IntersectionObserver" in window) {
      var mapObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            initMap();
            mapObs.disconnect();
          }
        });
      }, { rootMargin: "300px" });
      mapObs.observe(fsEl);
    } else {
      initMap();
    }
  }
/* Scroll restore: remember where the visitor was on this page when they open another
     page on this site, and put them back there when they press Back. */
  (function () {
    var KEY = "rp-scroll:" + window.location.pathname;
    window.addEventListener("pagehide", function () {
      try { sessionStorage.setItem(KEY, String(Math.round(window.scrollY || 0))); } catch (e) { /* private mode */ }
    });
    var navType = null;
    try {
      var navs = performance.getEntriesByType && performance.getEntriesByType("navigation");
      if (navs && navs.length) navType = navs[0].type;
    } catch (e) { /* older browser */ }
    window.addEventListener("pageshow", function (e) {
      if (!e.persisted && navType !== "back_forward") return;
      if (window.location.hash) return;
      var y = null;
      try { y = sessionStorage.getItem(KEY); } catch (err) { /* private mode */ }
      if (y === null) return;
      var top = parseInt(y, 10);
      if (!top || isNaN(top)) return;
      var rootEl = document.documentElement;
      var prevBehavior = rootEl.style.scrollBehavior;
      rootEl.style.scrollBehavior = "auto";
      window.scrollTo(0, top);
      setTimeout(function () {
        window.scrollTo(0, top);
        rootEl.style.scrollBehavior = prevBehavior;
      }, 400);
    });
  })();

  /* Phones: the Download CV button opens the CV viewer page (cv.html) instead of the
     raw PDF, so the reader sees the CV with a clear download button below it.
     Desktop keeps the direct one-click PDF download. */
  (function () {
    var btn = document.getElementById("cvDownloadBtn");
    if (!btn) return;
    if (window.matchMedia("(max-width: 768px)").matches) {
      btn.setAttribute("href", "cv.html");
      btn.removeAttribute("download");
    }
  })();
/* External links: on phones they open in the same window; on desktop they open
     in a new window. Applies to every off-site link (papers, profiles, requests). */
  (function () {
    var onPhone = window.matchMedia("(max-width: 768px)").matches;
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="http://"], a[href^="https://"]'), function (a) {
      var url;
      try { url = new URL(a.getAttribute("href"), window.location.href); } catch (e) { return; }
      if (url.hostname === window.location.hostname) return;
      if (onPhone) {
        a.removeAttribute("target");
      } else {
        a.setAttribute("target", "_blank");
        var rel = (a.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
        if (rel.indexOf("noopener") === -1) rel.push("noopener");
        a.setAttribute("rel", rel.join(" "));
      }
    });
  })();
/* Share button: native share sheet when available; otherwise copy the page link
     and flash a "Link copied" tooltip. */
  (function () {
    var btn = document.getElementById("shareBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      function copied() {
        btn.setAttribute("data-tip", "Link copied");
        btn.classList.add("tip-show");
        setTimeout(function () {
          btn.classList.remove("tip-show");
          btn.setAttribute("data-tip", "Share");
        }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(copied, copied);
      } else {
        copied();
      }
    });
  })();
/* Mobile scroll hint: fade it away for good once the visitor starts scrolling */
  (function () {
    var hint = document.getElementById("scrollHint");
    if (!hint) return;
    function onScroll() {
      if (window.scrollY > 40) {
        hint.classList.add("gone");
        window.removeEventListener("scroll", onScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();
})();
