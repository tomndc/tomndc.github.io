(function () {
  let current = localStorage.getItem("theme") || "system";

  function apply(state) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const isLight = state === "light" || (state === "system" && mq.matches);
    document.documentElement.classList.toggle("light", isLight);
    localStorage.setItem("theme", state);
    current = state;
    render();
  }

  function render() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    const segs = btn.querySelectorAll(".tseg");
    segs.forEach(s => s.classList.toggle("ts-active", s.dataset.t === current));
  }

  function init() {
    apply(current);
    const btn = document.getElementById("theme-toggle");
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function (e) {
      const seg = e.target.closest(".tseg");
      if (seg) apply(seg.dataset.t);
    });
  }

  init();

  if (!window.__themeMqBound) {
    window.__themeMqBound = true;
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () {
      if (current === "system") apply(current);
    });
  }

  // Prevent theme flash during client-side (ClientRouter) navigation:
  // bake the current theme class into the incoming document *before* it
  // gets swapped in, since Astro's swap otherwise overwrites <html>'s
  // attributes with the freshly-fetched (unthemed) page.
  if (!window.__themeSwapBound) {
    window.__themeSwapBound = true;
    document.addEventListener("astro:before-swap", function (e) {
      var isLight = document.documentElement.classList.contains("light");
      if (e.newDocument && e.newDocument.documentElement) {
        e.newDocument.documentElement.classList.toggle("light", isLight);
      }
    });
  }
})();
