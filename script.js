const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");
const mobileLayout = window.matchMedia("(max-width: 41.999rem)");

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.hidden = mobileLayout.matches && !open;
}

function syncNavigation() {
  menuButton.hidden = !mobileLayout.matches;
  const focusWasInNav = navigation.contains(document.activeElement);
  setMenu(false);
  if (mobileLayout.matches && focusWasInNav) menuButton.focus();
}

syncNavigation();
mobileLayout.addEventListener("change", syncNavigation);

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !mobileLayout.matches) return;

  const section = document.querySelector(link.hash);
  section.setAttribute("tabindex", "-1");
  setMenu(false);
  section.focus({ preventScroll: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || menuButton.getAttribute("aria-expanded") !== "true") return;
  setMenu(false);
  menuButton.focus();
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-entering");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  document.querySelectorAll(".project").forEach((project) => observer.observe(project));
}
