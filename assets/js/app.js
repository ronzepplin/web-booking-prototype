(function () {
  const DEFAULT_LANG = "en";
  const LANG_KEY = "nikolaus_lang";

  function getStoredLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
  }

  async function loadComponent(selector, path) {
    const el = document.querySelector(selector);
    if (!el) return;
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    el.innerHTML = await res.text();
  }

  function getByPath(obj, path) {
    return path
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  }

  async function loadLocale(lang) {
    const res = await fetch(`locales/${lang}.json`);
    if (!res.ok) throw new Error(`Missing locale file for: ${lang}`);
    return await res.json();
  }

  function applyTranslations(dict) {
    const nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach((node) => {
      const key = node.getAttribute("data-i18n");
      const value = getByPath(dict, key);
      if (value !== null) node.textContent = value;
    });
  }

  function wireLanguageButtons() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const lang = btn.getAttribute("data-lang");
        setStoredLang(lang);
        const dict = await loadLocale(lang);
        applyTranslations(dict);
        document.documentElement.lang = lang;
      });
    });
  }

  function formatEUR(amount) {
    return `€ ${Number(amount || 0).toFixed(2)}`;
  }

  function safeJSONParse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function generateReference() {
    // Example: SNK-20260107-482931
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rnd = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    return `SNK-${y}${m}${day}-${rnd}`;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function show(el, on) {
    if (!el) return;
    el.style.display = on ? "block" : "none";
  }

  // -----------------------------
  // Booking Page (L2) Logic
  // -----------------------------
  function initBookingPage() {
    const form = document.getElementById("bookingForm");
    if (!form) return; // not on book-tour.html

    const ADULT_PRICE = 3.0;
    const CHILD_PRICE = 1.5;

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const email = document.getElementById("email");
    const adults = document.getElementById("adults");
    const children = document.getElementById("children");
    const visitDate = document.getElementById("visitDate");
    const total = document.getElementById("total");

    const errFirstName = document.getElementById("errFirstName");
    const errLastName = document.getElementById("errLastName");
    const errEmail = document.getElementById("errEmail");

    // Set min date to today (prevents selecting past dates)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    visitDate.min = `${yyyy}-${mm}-${dd}`;

    function clampInt(value, fallback = 0) {
      const n = Number.parseInt(value, 10);
      if (Number.isNaN(n) || n < 0) return fallback;
      return n;
    }

    function recalc() {
      const a = clampInt(adults.value, 0);
      const c = clampInt(children.value, 0);

      adults.value = String(a);
      children.value = String(c);

      const amount = a * ADULT_PRICE + c * CHILD_PRICE;
      total.value = formatEUR(amount);

      return amount;
    }

    // Live update total cost
    adults.addEventListener("input", recalc);
    children.addEventListener("input", recalc);

    // Initial value
    recalc();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fn = firstName.value.trim();
      const ln = lastName.value.trim();
      const em = email.value.trim();
      const date = visitDate.value;

      const a = clampInt(adults.value, 0);
      const c = clampInt(children.value, 0);
      const amount = recalc();

      // Validation
      const okFirst = fn.length > 0;
      const okLast = ln.length > 0;
      const okEmail = isValidEmail(em);
      const okDate = !!date;
      const okPeople = (a + c) > 0;

      show(errFirstName, !okFirst);
      show(errLastName, !okLast);

      // Only show email error if user typed something
      show(errEmail, em.length > 0 && !okEmail);

      if (!okDate) {
        alert("Please select a date.");
        return;
      }

      if (!okPeople) {
        alert("Please select at least 1 participant.");
        return;
      }

      if (!okFirst || !okLast || !okEmail) return;

      const lang = getStoredLang();

      // Save booking to sessionStorage for payment page (L3)
      const booking = {
        firstName: fn,
        lastName: ln,
        email: em,
        date,
        adults: a,
        children: c,
        currency: "EUR",
        adultPrice: ADULT_PRICE,
        childPrice: CHILD_PRICE,
        total: Number(amount.toFixed(2)),
        lang
      };

      sessionStorage.setItem("nikolaus_booking", JSON.stringify(booking));

      // Go to payment page
      window.location.href = "payment.html";
    });
  }

  // -----------------------------
  // Payment Page (L3) Logic
  // -----------------------------
  function initPaymentPage() {
    const paymentForm = document.getElementById("paymentForm");
    const paypalBtn = document.getElementById("paypalBtn");

    // Only run on payment.html
    if (!paymentForm && !paypalBtn) return;

    const raw = sessionStorage.getItem("nikolaus_booking");
    const booking = safeJSONParse(raw);

    if (!booking) {
      alert("Booking data is missing. Please start your booking again.");
      window.location.href = "book-tour.html";
      return;
    }

    // Fill summary fields (if they exist)
    const sumName = document.getElementById("sumName");
    const sumEmail = document.getElementById("sumEmail");
    const sumAdults = document.getElementById("sumAdults");
    const sumChildren = document.getElementById("sumChildren");
    const sumDate = document.getElementById("sumDate");
    const sumTotal = document.getElementById("sumTotal");

    if (sumName) sumName.textContent = `${booking.firstName} ${booking.lastName}`;
    if (sumEmail) sumEmail.textContent = booking.email;
    if (sumAdults) sumAdults.textContent = String(booking.adults);
    if (sumChildren) sumChildren.textContent = String(booking.children);
    if (sumDate) sumDate.textContent = booking.date;
    if (sumTotal) sumTotal.textContent = formatEUR(booking.total);

    const terms = document.getElementById("terms");

    function requireTermsAccepted() {
      if (!terms) return true; // in case checkbox is missing
      if (terms.checked) return true;
      alert("Please accept the Terms & Conditions to continue.");
      terms.focus();
      return false;
    }

    function completePayment(method) {
      if (!requireTermsAccepted()) return;

      const reference = generateReference();

      const confirmation = {
        ...booking,
        paymentMethod: method,
        reference,
        paidAt: new Date().toISOString()
      };

      sessionStorage.setItem("nikolaus_confirmation", JSON.stringify(confirmation));
      window.location.href = "thank-you.html";
    }

    // Card payment submit (mock)
    if (paymentForm) {
      paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        completePayment("card");
      });
    }

    // PayPal button (mock)
    if (paypalBtn) {
      paypalBtn.addEventListener("click", () => {
        completePayment("paypal");
      });
    }
  }

  // -----------------------------
  // Thank-you Page (L4) Logic
  // -----------------------------
  function initThankYouPage() {
    const thankYouRoot = document.getElementById("thankYouPage");
    if (!thankYouRoot) return; 

    const raw = sessionStorage.getItem("nikolaus_confirmation");
    const confirmation = safeJSONParse(raw);

    if (!confirmation) {
      alert("Confirmation data is missing. Please complete the booking again.");
      window.location.href = "book-tour.html";
      return;
    }

    // Reference number
    const refEl = document.getElementById("confirmRef");
    if (refEl) refEl.textContent = confirmation.reference || "—";

    // Summary fields (reuse same IDs as payment page)
    const sumName = document.getElementById("sumName");
    const sumEmail = document.getElementById("sumEmail");
    const sumAdults = document.getElementById("sumAdults");
    const sumChildren = document.getElementById("sumChildren");
    const sumDate = document.getElementById("sumDate");
    const sumTotal = document.getElementById("sumTotal");

    if (sumName) sumName.textContent = `${confirmation.firstName} ${confirmation.lastName}`;
    if (sumEmail) sumEmail.textContent = confirmation.email;
    if (sumAdults) sumAdults.textContent = String(confirmation.adults);
    if (sumChildren) sumChildren.textContent = String(confirmation.children);
    if (sumDate) sumDate.textContent = confirmation.date;
    if (sumTotal) sumTotal.textContent = formatEUR(confirmation.total);
  }

  // -----------------------------
  // Contact Page (Demo) Logic
  // -----------------------------
  function initContactPage() {
    const form = document.getElementById("contactForm");
    if (!form) return; // not on contact.html

    const firstName = document.getElementById("contactFirstName");
    const lastName = document.getElementById("contactLastName");
    const email = document.getElementById("contactEmail");
    const message = document.getElementById("contactMessage");
    const success = document.getElementById("contactSuccess");

    function getErrorEl(inputId) {
      return document.querySelector(`[data-error-for="${inputId}"]`);
    }

    function clearErrors() {
      show(getErrorEl("contactFirstName"), false);
      show(getErrorEl("contactLastName"), false);
      show(getErrorEl("contactEmail"), false);
    }

    function validate() {
      const fn = (firstName?.value || "").trim();
      const ln = (lastName?.value || "").trim();
      const em = (email?.value || "").trim();

      const okFirst = fn.length > 0;
      const okLast = ln.length > 0;
      const okEmail = isValidEmail(em);

      show(getErrorEl("contactFirstName"), !okFirst);
      show(getErrorEl("contactLastName"), !okLast);

      // show email error only if user typed something
      show(getErrorEl("contactEmail"), em.length > 0 && !okEmail);

      return okFirst && okLast && okEmail;
    }

    // Hide success when user starts typing again
    [firstName, lastName, email, message].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", () => {
        if (success) success.style.display = "none";
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      if (!validate()) return;

      // Demo behavior: show success, reset form
      if (success) success.style.display = "block";
      form.reset();
    });
  }

  async function init() {
    // Load shared layout
    await loadComponent("#site-header", "components/header.html");
    await loadComponent("#site-footer", "components/footer.html");

    // Language init
    const lang = getStoredLang();
    document.documentElement.lang = lang;
    const dict = await loadLocale(lang);
    applyTranslations(dict);
    wireLanguageButtons();

    // Page-specific logic
    initBookingPage();
    initPaymentPage();
    initThankYouPage();
    initContactPage();
  }

  document.addEventListener("DOMContentLoaded", () => {
    init().catch((err) => console.error(err));
  });
})();
