/* Vardhaman Hospital — site interactions */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    /* ---- Mobile drawer ---- */
    var burger = document.querySelector(".sd-burger");
    var drawer = document.querySelector(".sd-drawer");
    var overlay = document.querySelector(".sd-overlay");
    var closeBtn = document.querySelector(".sd-drawer__close");
    function openDrawer() { if (drawer) drawer.classList.add("is-open"); if (overlay) overlay.classList.add("is-open"); document.body.style.overflow = "hidden"; }
    function closeDrawer() { if (drawer) drawer.classList.remove("is-open"); if (overlay) overlay.classList.remove("is-open"); document.body.style.overflow = ""; }
    if (burger) burger.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    if (drawer) drawer.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", closeDrawer); });

    /* ---- Sticky header shadow ---- */
    var header = document.querySelector(".sd-header");
    function onScroll() {
      if (header) header.classList.toggle("is-stuck", window.scrollY > 12);
      var top = document.querySelector(".sd-top");
      if (top) top.classList.toggle("is-show", window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- Scroll to top ---- */
    var topBtn = document.querySelector(".sd-top");
    if (topBtn) topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    /* ---- FAQ accordion ---- */
    document.querySelectorAll(".sd-faq__item").forEach(function (item) {
      var q = item.querySelector(".sd-faq__q");
      var a = item.querySelector(".sd-faq__a");
      if (!q || !a) return;
      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        document.querySelectorAll(".sd-faq__item").forEach(function (it) {
          it.classList.remove("is-open");
          var aa = it.querySelector(".sd-faq__a");
          if (aa) aa.style.maxHeight = null;
        });
        if (!open) { item.classList.add("is-open"); a.style.maxHeight = a.scrollHeight + "px"; }
      });
    });

    /* ---- Counter animation ---- */
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = parseFloat(el.getAttribute("data-count")), dur = 1600, start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var val = Math.floor(p * target);
            el.firstChild ? el.childNodes[0].nodeValue = val.toLocaleString("en-IN") : el.textContent = val;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { io.observe(c); });
    }

    /* ---- Native gallery lightbox ---- */
    var galleryLinks = Array.prototype.slice.call(document.querySelectorAll(".sd-popup-gallery a"));
    if (galleryLinks.length) {
      var lightbox = document.createElement("div");
      lightbox.className = "sd-lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.innerHTML = '<button class="sd-lightbox__close" type="button" aria-label="Close image"><i class="fa-solid fa-xmark"></i></button><button class="sd-lightbox__nav sd-lightbox__nav--prev" type="button" aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button><img class="sd-lightbox__img" alt=""><button class="sd-lightbox__nav sd-lightbox__nav--next" type="button" aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button><div class="sd-lightbox__caption"></div>';
      document.body.appendChild(lightbox);

      var img = lightbox.querySelector(".sd-lightbox__img");
      var caption = lightbox.querySelector(".sd-lightbox__caption");
      var current = 0;

      function show(index) {
        current = (index + galleryLinks.length) % galleryLinks.length;
        var link = galleryLinks[current];
        var thumb = link.querySelector("img");
        img.src = link.href;
        img.alt = thumb ? thumb.alt : "";
        caption.textContent = (link.querySelector(".sd-gallery__cap") || {}).textContent || "";
      }
      function openLightbox(index) {
        show(index);
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      }
      function closeLightbox() {
        lightbox.classList.remove("is-open");
        document.body.style.overflow = "";
        img.removeAttribute("src");
      }

      galleryLinks.forEach(function (link, index) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          openLightbox(index);
        });
      });
      lightbox.querySelector(".sd-lightbox__close").addEventListener("click", closeLightbox);
      lightbox.querySelector(".sd-lightbox__nav--prev").addEventListener("click", function () { show(current - 1); });
      lightbox.querySelector(".sd-lightbox__nav--next").addEventListener("click", function () { show(current + 1); });
      lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
      document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") show(current - 1);
        if (e.key === "ArrowRight") show(current + 1);
      });
    }
  });
})();
