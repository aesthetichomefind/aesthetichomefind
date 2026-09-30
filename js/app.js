// app.js — site-wide behaviour. Progressive enhancement: the site works without it.
(function () {
  "use strict";

  // Mobile menu: button toggles the nav panel.
  // Esc or a click outside closes it; opening moves focus to the first link.
  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    const desktop = window.matchMedia("(min-width: 52em)");
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (open) {
        const firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) setOpen(false, true);
    });

    document.addEventListener("click", (event) => {
      if (isOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Reset when the layout switches to the desktop navigation
    desktop.addEventListener("change", () => {
      if (desktop.matches) setOpen(false);
    });
  }

  initMenu();
})();