/* S V Healthcare — site interactions v2 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Preloader (registered immediately; script is deferred so DOM exists) ---- */
  var loader = document.querySelector(".sv-load");
  var t0 = performance.now();
  function hideLoader() {
    if (!loader || loader.classList.contains("done")) return;
    var wait = Math.max(0, 400 - (performance.now() - t0));
    setTimeout(function () { loader.classList.add("done"); }, wait);
  }
  /* Reveal as soon as the document is parsed + first paint is possible — we do not
     wait for every image, which on mobile connections delays the load event badly. */
  if (document.readyState === "complete" || document.readyState === "interactive") {
    requestAnimationFrame(hideLoader);
  } else {
    document.addEventListener("DOMContentLoaded", function () { requestAnimationFrame(hideLoader); });
  }
  window.addEventListener("load", hideLoader);
  setTimeout(hideLoader, 3000); /* failsafe */

  document.addEventListener("DOMContentLoaded", function () {

    /* ---- Scroll lock (iOS-safe: body is pinned, scroll offset restored) ---- */
    var lockedAt = 0;
    function lockScroll() {
      lockedAt = window.scrollY || window.pageYOffset || 0;
      document.body.style.top = -lockedAt + "px";
      document.body.classList.add("is-locked");
    }
    function unlockScroll() {
      if (!document.body.classList.contains("is-locked")) return;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      document.body.classList.remove("is-locked");
      document.body.style.top = "";
      window.scrollTo(0, lockedAt);
      root.style.scrollBehavior = prev;
    }

    /* ---- Mobile drawer ---- */
    var burger = document.querySelector(".burger");
    var drawer = document.querySelector(".drawer");
    var overlay = document.querySelector(".oc__ov");
    var closeBtn = document.querySelector(".drawer__close");

    function drawerIsOpen() { return !!drawer && drawer.classList.contains("is-open"); }

    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add("is-open");
      drawer.removeAttribute("aria-hidden");
      if (overlay) overlay.classList.add("is-open");
      if (burger) burger.setAttribute("aria-expanded", "true");
      lockScroll();
      /* the panel transitions from visibility:hidden — focus() is ignored until the
         next frame, so wait for the flip before moving focus into it */
      if (closeBtn) requestAnimationFrame(function () { requestAnimationFrame(function () { closeBtn.focus(); }); });
    }
    function closeDrawer(returnFocus) {
      if (!drawer || !drawerIsOpen()) return;
      /* move focus out before hiding, so it is never trapped on a hidden node */
      if (drawer.contains(document.activeElement)) {
        if (returnFocus !== false && burger) burger.focus();
        else if (document.activeElement.blur) document.activeElement.blur();
      }
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      if (overlay) overlay.classList.remove("is-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
      unlockScroll();
    }

    if (drawer) {
      drawer.setAttribute("aria-hidden", "true");
      /* keep focus inside the drawer while it is open */
      drawer.addEventListener("keydown", function (e) {
        if (e.key !== "Tab" || !drawerIsOpen()) return;
        var focusable = drawer.querySelectorAll('a[href], button:not([disabled])');
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.addEventListener("click", openDrawer);
    }
    if (closeBtn) closeBtn.addEventListener("click", function () { closeDrawer(); });
    if (overlay) overlay.addEventListener("click", function () { closeDrawer(); });
    if (drawer) {
      drawer.querySelectorAll("nav a, .drawer__cta a, .drawer__contact a").forEach(function (a) {
        a.addEventListener("click", function () { closeDrawer(false); });
      });
    }

    /* ---- Services dropdown: keyboard/touch toggle ---- */
    var dropdowns = [];
    document.querySelectorAll(".nav__dd").forEach(function (dd) {
      var t = dd.querySelector(".nav__t");
      if (!t) return;
      dropdowns.push(dd);
      t.addEventListener("click", function (e) {
        e.preventDefault();
        var open = dd.classList.toggle("is-open");
        t.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    function closeDropdowns() {
      dropdowns.forEach(function (dd) {
        dd.classList.remove("is-open");
        var t = dd.querySelector(".nav__t");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }
    if (dropdowns.length) {
      document.addEventListener("click", function (e) {
        for (var i = 0; i < dropdowns.length; i++) {
          if (dropdowns[i].contains(e.target)) return;
        }
        closeDropdowns();
      });
    }

    /* ---- Escape closes whatever is open ---- */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" && e.key !== "Esc") return;
      if (drawerIsOpen()) closeDrawer();
      closeDropdowns();
    });

    /* ---- FAQ accordion ---- */
    var faqSeq = 0;
    var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq__item"));
    faqItems.forEach(function (item) {
      var q = item.querySelector(".faq__q");
      var a = item.querySelector(".faq__a");
      if (!q || !a) return;

      if (!a.id) a.id = "faq-panel-" + (++faqSeq);
      q.setAttribute("type", "button");
      q.setAttribute("aria-expanded", "false");
      q.setAttribute("aria-controls", a.id);
      a.setAttribute("role", "region");
      a.setAttribute("aria-labelledby", a.id + "-q");
      q.id = a.id + "-q";

      q.addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        var group = item.parentElement;
        group.querySelectorAll(".faq__item").forEach(function (it) {
          it.classList.remove("is-open");
          var aa = it.querySelector(".faq__a");
          var qq = it.querySelector(".faq__q");
          if (aa) aa.style.maxHeight = null;
          if (qq) qq.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("is-open");
          a.style.maxHeight = a.scrollHeight + "px";
          q.setAttribute("aria-expanded", "true");
        }
      });
    });

    /* Re-measure the open panel when the layout reflows (rotation, resize, late fonts) */
    function resyncFaq() {
      faqItems.forEach(function (item) {
        if (!item.classList.contains("is-open")) return;
        var a = item.querySelector(".faq__a");
        if (a) a.style.maxHeight = a.scrollHeight + "px";
      });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resyncFaq).catch(function () {});

    /* ---- Sticky header + back-to-top (rAF-throttled) ---- */
    var header = document.querySelector(".hd");
    var topBtn = document.querySelector(".top");
    var ticking = false;
    function applyScrollState() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      if (header) header.classList.toggle("is-stuck", y > 10);
      if (topBtn) topBtn.classList.toggle("is-show", y > 550);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(applyScrollState);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    applyScrollState();
    if (topBtn) {
      topBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }

    /* ---- Resize / orientation handling ---- */
    var desktopNav = window.matchMedia("(min-width: 1021px)");
    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (desktopNav.matches) closeDrawer(false);
        resyncFaq();
      }, 120);
    }
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    /* ---- Scroll reveal ---- */
    var revealEls = document.querySelectorAll("[data-rv]");
    if (reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add("rv-in"); });
    } else if (revealEls.length && "IntersectionObserver" in window) {
      /* shorter stagger on narrow screens — cards stack, so a long cascade feels slow */
      var narrow = window.matchMedia("(max-width: 680px)").matches;
      var step = narrow ? 45 : 70;
      var cap = narrow ? 135 : 220;
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("rv-in"); rio.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el, i) {
        el.style.transitionDelay = Math.min((i % 4) * step, cap) + "ms";
        rio.observe(el);
      });
    } else {
      revealEls.forEach(function (el) { el.classList.add("rv-in"); });
    }

    /* ---- Welcome pop-up: WhatsApp community + apps (every page load) ---- */
    (function () {
      var pop = document.createElement("div");
      pop.className = "pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-modal", "true");
      pop.setAttribute("aria-labelledby", "pop-title");
      pop.innerHTML =
        '<div class="pop__card">' +
          '<button type="button" class="pop__x" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
          '<img class="pop__logo" src="assets/img/sv/logo/sv-logo.webp" width="86" height="55" alt="S V Healthcare logo">' +
          '<h3 id="pop-title">Join Our WhatsApp Community</h3>' +
          '<p>Get health tips, clinic updates and exclusive offers from S V Healthcare, straight on WhatsApp.</p>' +
          '<a href="https://chat.whatsapp.com/K3ubNDX2UpJLYl7xKh9egJ?mode=gi_t" target="_blank" rel="noopener" class="btn btn--wa"><i class="fa-brands fa-whatsapp"></i> Join Community</a>' +
          '<div class="pop__apps">' +
            '<span class="pop__apps-label">Download Our Apps</span>' +
            '<div class="ft__apps-row">' +
              '<a href="https://play.google.com/store/apps/details?id=com.exly.sveyecare" target="_blank" rel="noopener" class="appbtn"><svg class="appbtn__ic" aria-hidden="true"><use href="#i-gplay"/></svg><span><small>Get it on</small>Google Play</span></a>' +
              '<a href="https://apps.apple.com/in/app/sv-health-app/id6761810427" target="_blank" rel="noopener" class="appbtn"><svg class="appbtn__ic" aria-hidden="true"><use href="#i-apple"/></svg><span><small>Download on the</small>App Store</span></a>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(pop);

      var lastFocus = null;
      function closePop() {
        if (!pop.classList.contains("is-open")) return;
        pop.classList.remove("is-open");
        unlockScroll();
        document.removeEventListener("keydown", onKey);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
      function onKey(e) { if (e.key === "Escape" || e.key === "Esc") closePop(); }
      pop.addEventListener("click", function (e) {
        if (e.target === pop || e.target.closest(".pop__x")) closePop();
        else if (e.target.closest("a")) setTimeout(closePop, 150);
      });

      /* open shortly after the preloader clears */
      setTimeout(function () {
        if (drawerIsOpen()) return;
        lastFocus = document.activeElement;
        pop.classList.add("is-open");
        lockScroll();
        document.addEventListener("keydown", onKey);
        requestAnimationFrame(function () { requestAnimationFrame(function () { pop.querySelector(".pop__x").focus(); }); });
      }, 1200);
    })();

    /* ---- Counter animation ---- */
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
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
