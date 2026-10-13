/* Ritik Pokharel portfolio — theme, nav, counters, lazy map. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme: persisted choice, else OS preference */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  function applyTheme(name) {
    root.setAttribute("data-theme", name);
    themeToggle.setAttribute("aria-pressed", name === "dark" ? "true" : "false");
    themeToggle.setAttribute("aria-label", name === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
  var stored = null;
  try { stored = localStorage.getItem("rp-theme"); } catch (e) { /* private mode */ }
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else {
    applyTheme("dark"); /* default: dark mode */
  }
  themeToggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("rp-theme", next); } catch (e) { /* private mode */ }
  });

  /* Mobile nav */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
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

  /* Active nav link on scroll */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var linkMap = {};
  Array.prototype.forEach.call(navLinks.querySelectorAll("a"), function (a) {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });
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
          animateCounter(entry.target);
          statObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach(function (el) { statObs.observe(el); });
  } else {
    statEls.forEach(animateCounter);
  }

  /* Back to top */
  document.getElementById("backToTop").addEventListener("click", function () {
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
        { coords: [30.4515, -91.1546], title: "Baton Rouge, LA", text: "Home base — Global Geospatial Institute / Global Geospatial Solutions.", link: "#experience", linkText: "Experience" },
        { coords: [30.2142, -92.3698], title: "Crowley, LA", text: "LSU AgCenter Rice Research Station — 720-plot UAV multispectral campaigns.", link: "#projects", linkText: "Projects" },
        { coords: [29.5958, -90.7195], title: "Terrebonne Parish, LA", text: "TPCW offline Field Maps disaster-response system — 16 offline areas.", link: "#experience", linkText: "Experience" },
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
})();
