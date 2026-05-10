/**
 * Site behavior: mobile nav, smooth scroll, header state, scroll reveals,
 * subtle hero parallax, WhatsApp float, lead form → FormSubmit.
 */

// === Owner config — change here if the contact email changes ===
const GUY_EMAIL = "guybs300@gmail.com";

// WhatsApp: international number, digits only (no + or spaces).
// Leave as WHATSAPP_NUMBER_HERE to use the default 972543098966, or set e.g. "972501234567".
const WHATSAPP_NUMBER = "WHATSAPP_NUMBER_HERE";

const WHATSAPP_PREFILL_MESSAGE =
  "היי גיא, הגעתי דרך האתר ואני מעוניין/ת בייעוץ לגבי רכישת רכב";

/**
 * Marketing / analytics — placeholders only. Do not load scripts until legal
 * review and cookie policy are aligned with actual tracking.
 *
 *   GOOGLE_ANALYTICS_ID  (e.g. G-XXXXXXXXXX)
 *   META_PIXEL_ID        (Meta Pixel ID from Events Manager)
 *
 * Example (keep commented until ready):
 *   // const GOOGLE_ANALYTICS_ID = "GOOGLE_ANALYTICS_ID";
 *   // const META_PIXEL_ID = "META_PIXEL_ID";
 *   // function loadGoogleAnalytics(id) { ... inject gtag ... }
 *   // function loadMetaPixel(id) { ... inject fbq ... }
 */

(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = siteNav ? siteNav.querySelectorAll("a[href^='#']") : [];

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      const open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const headerOffset = header ? header.offsetHeight : 0;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    if (anchor.classList.contains("whatsapp-float")) return;
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;

    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerOffset -
        16;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  });

  /* WhatsApp floating button — URL + appear on scroll */
  const waBtn = document.getElementById("whatsapp-float");
  const WA_SCROLL_REVEAL = 140;

  function resolveWhatsAppDigits() {
    const raw = String(WHATSAPP_NUMBER || "").trim();
    if (!raw || raw === "WHATSAPP_NUMBER_HERE") {
      return "972543098966";
    }
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 10 ? digits : "972543098966";
  }

  function buildWhatsAppHref() {
    const num = resolveWhatsAppDigits();
    return (
      "https://wa.me/" +
      num +
      "?text=" +
      encodeURIComponent(WHATSAPP_PREFILL_MESSAGE)
    );
  }

  function updateWhatsAppVisibility() {
    if (!waBtn) return;
    const show =
      prefersReducedMotion || window.scrollY >= WA_SCROLL_REVEAL;
    waBtn.classList.toggle("is-visible", show);
  }

  if (waBtn) {
    waBtn.setAttribute("href", buildWhatsAppHref());

    if (prefersReducedMotion) {
      waBtn.classList.add("is-visible");
    } else {
      updateWhatsAppVisibility();
      window.addEventListener("scroll", updateWhatsAppVisibility, {
        passive: true,
      });
    }
  }

  /* Floating header — stronger glass when scrolled */
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 32);
  }

  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* Scroll-triggered fade-in */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else if (revealEls.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Subtle hero image parallax */
  const heroImg = document.querySelector("[data-parallax-img]");
  const heroSection = document.querySelector(".hero");

  if (heroImg && heroSection && !prefersReducedMotion) {
    let parallaxTicking = false;

    function updateHeroParallax() {
      parallaxTicking = false;
      const rect = heroSection.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom <= 0 || rect.top >= vh) return;

      const scrollMid = window.scrollY + vh * 0.35;
      const heroMid = heroSection.offsetTop + rect.height * 0.4;
      const delta = scrollMid - heroMid;
      const y = Math.max(-18, Math.min(28, delta * 0.06));
      heroImg.style.transform = "translate3d(0, " + y + "px, 0) scale(1.03)";
    }

    function requestParallax() {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(updateHeroParallax);
      }
    }

    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    requestParallax();
  }

  const form = document.getElementById("lead-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = form ? form.querySelector(".btn-submit") : null;

  if (form && statusEl) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      statusEl.classList.remove("is-success", "is-error");

      const consentEl = document.getElementById("privacy_consent");
      if (consentEl && !consentEl.checked) {
        statusEl.textContent =
          "יש לאשר את מדיניות הפרטיות כדי לשלוח את הטופס.";
        statusEl.classList.add("is-error");
        consentEl.focus();
        return;
      }

      if (!GUY_EMAIL) {
        statusEl.textContent =
          "חסרה כתובת אימייל בהגדרות. עדכנו את GUY_EMAIL בקובץ js/main.js.";
        statusEl.classList.add("is-error");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(GUY_EMAIL)) {
        statusEl.textContent = "כתובת האימייל בהגדרות אינה תקינה.";
        statusEl.classList.add("is-error");
        return;
      }

      const fd = new FormData(form);
      fd.append("_subject", "פנייה חדשה מאתר — ליווי קניית רכב");
      fd.append("_template", "table");

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "שולח…";
      }

      try {
        const res = await fetch(
          "https://formsubmit.co/ajax/" + encodeURIComponent(GUY_EMAIL),
          {
            method: "POST",
            body: fd,
            headers: { Accept: "application/json" },
          }
        );

        const data = await res.json().catch(function () {
          return {};
        });

        if (res.ok) {
          statusEl.textContent =
            "תודה! הפרטים נשלחו בהצלחה וגיא יחזור אליכם בקרוב.";
          statusEl.classList.add("is-success");
          form.reset();
        } else {
          throw new Error(data.message || "שגיאת שליחה");
        }
      } catch (err) {
        statusEl.textContent =
          "לא הצלחנו לשלוח את הטופס. נסו שוב או צרו קשר ישירות.";
        statusEl.classList.add("is-error");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "שליחה";
        }
      }
    });
  }

  /* Cookie consent — localStorage; marketing hooks after approval */
  const COOKIE_CONSENT_KEY = "guy_bs_cookie_consent_v1";

  function initMarketingAfterConsent() {
    try {
      if (localStorage.getItem(COOKIE_CONSENT_KEY) !== "1") return;
    } catch (e) {
      return;
    }
    // After replacing placeholders and loading vendor scripts, uncomment:
    // const gaId = "GOOGLE_ANALYTICS_ID";
    // loadGoogleAnalytics(gaId);
    // const pixelId = "META_PIXEL_ID";
    // loadMetaPixel(pixelId);
  }

  const cookieBanner = document.getElementById("cookie-consent");
  const cookieAccept = document.getElementById("cookie-consent-accept");

  var hasCookieConsent = false;
  try {
    hasCookieConsent = localStorage.getItem(COOKIE_CONSENT_KEY) === "1";
  } catch (e) {
    hasCookieConsent = false;
  }

  if (hasCookieConsent) {
    initMarketingAfterConsent();
    if (cookieBanner) cookieBanner.remove();
  } else if (cookieBanner && cookieAccept) {
    cookieBanner.removeAttribute("hidden");
    cookieBanner.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cookieBanner.classList.add("cookie-consent--visible");
      });
    });
    cookieAccept.addEventListener("click", function () {
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, "1");
      } catch (err) {
        /* blocked storage — banner still dismissed for this session */
      }
      cookieBanner.classList.remove("cookie-consent--visible");
      cookieBanner.classList.add("cookie-consent--hiding");
      cookieBanner.setAttribute("aria-hidden", "true");
      window.setTimeout(function () {
        cookieBanner.remove();
        initMarketingAfterConsent();
      }, 420);
    });
  }
})();
