/* ── PAGE LOADER ── */
(function () {
  const loader = document.getElementById("page-loader");
  const bar = document.getElementById("loader-bar");
  const label = document.getElementById("loader-label");
  const stages = [
    { pct: 15, text: "Loading assets…" },
    { pct: 38, text: "Building interface…" },
    { pct: 62, text: "Initializing 3D scene…" },
    { pct: 85, text: "Almost ready…" },
    { pct: 100, text: "Welcome to NOXWING" },
  ];
  document.body.style.overflow = "hidden";
  let idx = 0;
  function next() {
    if (idx >= stages.length) return;
    const s = stages[idx++];
    bar.style.width = s.pct + "%";
    label.textContent = s.text;
    if (idx < stages.length) setTimeout(next, 260 + Math.random() * 180);
    else
      setTimeout(() => {
        loader.classList.add("hidden");
        document.body.style.overflow = "";
      }, 480);
  }
  setTimeout(next, 120);
})();

/* ── NAV SCROLL ── */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

/* ── MOBILE MENU ── */
const hamburger = document.getElementById("nav-hamburger");
const mobileMenu = document.getElementById("mobile-menu");

hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});

document.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    document.body.style.overflow = "";
  });
});

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* ── WEB3FORMS ── */
const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const btnText = document.getElementById("btn-text");
const btnIcon = document.getElementById("btn-icon");
const btnSpinner = document.getElementById("btn-spinner");
const successEl = document.getElementById("form-success");
const errorEl = document.getElementById("form-error");
const errorTextEl = document.getElementById("form-error-text");

function setLoading(on) {
  submitBtn.disabled = on;
  if (on) {
    submitBtn.classList.add("loading");
    btnSpinner.style.display = "block";
    btnText.textContent = "Sending…";
    btnIcon.style.display = "none";
  } else {
    submitBtn.classList.remove("loading");
    btnSpinner.style.display = "none";
    btnText.textContent = "Send Message";
    btnIcon.style.display = "";
  }
}
function hideAlerts() {
  successEl.classList.remove("show");
  errorEl.classList.remove("show");
}

contactForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  hideAlerts();
  const name = document.getElementById("f-name").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const message = document.getElementById("f-message").value.trim();
  if (!name || !email || !message) {
    errorTextEl.textContent = "Please fill in your name, email, and message.";
    errorEl.classList.add("show");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorTextEl.textContent = "Please enter a valid email address.";
    errorEl.classList.add("show");
    return;
  }
  setLoading(true);
  try {
    const data = Object.fromEntries(new FormData(contactForm).entries());
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      successEl.classList.add("show");
      contactForm.reset();
      successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else throw new Error(result.message || "Submission failed");
  } catch (err) {
    errorTextEl.textContent =
      err.message && err.message !== "Failed to fetch"
        ? err.message
        : "Something went wrong. Please email noxwing.official@gmail.com directly.";
    errorEl.classList.add("show");
  } finally {
    setLoading(false);
  }
});
contactForm
  .querySelectorAll("input,textarea,select")
  .forEach((el) => el.addEventListener("input", hideAlerts));
