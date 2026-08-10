/* S V Healthcare — site interactions v2 */
(function () {
  "use strict";

  /* ---- Preloader (registered immediately; script is deferred so DOM exists) ---- */
  var loader = document.querySelector(".sv-load");
  var t0 = performance.now();
  function hideLoader() {
    if (!loader || loader.classList.contains("done")) return;
    var wait = Math.max(0, 650 - (performance.now() - t0));
    setTimeout(function () {
      loader.classList.add("done");
      document.documentElement.style.overflow = "";
    }, wait);
  }
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader);
  setTimeout(hideLoader, 3000); /* failsafe */

  document.addEventListener("DOMContentLoaded", function () {
    /* ---- Mobile drawer ---- */
    var burger = document.querySelector(".burger");
    var drawer = document.querySelector(".drawer");
    var overlay = document.querySelector(".oc__ov");
    var closeBtn = document.querySelector(".drawer__close");
    function openDrawer() { if (drawer) drawer.classList.add("is-open"); if (overlay) overlay.classList.add("is-open"); document.body.style.overflow = "hidden"; }
    function closeDrawer() { if (drawer) drawer.classList.remove("is-open"); if (overlay) overlay.classList.remove("is-open"); document.body.style.overflow = ""; }
    if (burger) burger.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    if (drawer) drawer.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", closeDrawer); });

    /* ---- Sticky header ---- */
    var header = document.querySelector(".hd");
    var topBtn = document.querySelector(".top");
    function onScroll() {
      if (header) header.classList.toggle("is-stuck", window.scrollY > 10);
      if (topBtn) topBtn.classList.toggle("is-show", window.scrollY > 550);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (topBtn) topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    /* ---- Services dropdown: keyboard/touch toggle ---- */
    document.querySelectorAll(".nav__dd .nav__t").forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        var dd = t.parentElement;
        var open = dd.classList.toggle("is-open");
        t.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    /* ---- FAQ accordion ---- */
    document.querySelectorAll(".faq__item").forEach(function (item) {
      var q = item.querySelector(".faq__q");
      var a = item.querySelector(".faq__a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        var group = item.parentElement;
        group.querySelectorAll(".faq__item").forEach(function (it) {
          it.classList.remove("is-open");
          var aa = it.querySelector(".faq__a");
          if (aa) aa.style.maxHeight = null;
        });
        if (!open) { item.classList.add("is-open"); a.style.maxHeight = a.scrollHeight + "px"; }
      });
    });

    /* ---- Scroll reveal ---- */
    var revealEls = document.querySelectorAll("[data-rv]");
    if (revealEls.length && "IntersectionObserver" in window) {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("rv-in"); rio.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el, i) {
        el.style.transitionDelay = Math.min((i % 4) * 70, 220) + "ms";
        rio.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add("rv-in"); });
    }

    /* ---- Counter animation ---- */
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length && "IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = parseFloat(el.getAttribute("data-count")), dur = 1500, start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            el.textContent = Math.floor(p * target).toLocaleString("en-IN");
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  });
})();
