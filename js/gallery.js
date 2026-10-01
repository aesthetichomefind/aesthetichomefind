// gallery.js — product gallery. Thumbnails are normal links to the images;
// this script makes them switch the main image instead. Works with keyboard (Tab + Enter).
(function () {
  "use strict";

  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  const main = gallery.querySelector("[data-gallery-main]");
  const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
  const status = gallery.querySelector("[data-gallery-status]");
  if (!main || thumbs.length < 2) return;

  function show(index) {
    const thumb = thumbs[index];
    main.src = thumb.getAttribute("href");
    main.alt = thumb.dataset.alt;
    thumbs.forEach((el, i) => {
      if (i === index) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    if (status) status.textContent = `Showing image ${index + 1} of ${thumbs.length}`;
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", (event) => {
      event.preventDefault();
      show(index);
    });
  });
})();