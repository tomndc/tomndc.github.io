(function () {
  const STATES = ["system", "light", "dark"];
  let current = localStorage.getItem("theme") || "system";

  function apply(state) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const isLight = state === "light" || (state === "system" && mq.matches);
    document.body.classList.toggle("light", isLight);
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

  document.addEventListener("DOMContentLoaded", function () {
    apply(current);
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      const seg = e.target.closest(".tseg");
      if (seg) apply(seg.dataset.t);
    });
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () {
      if (current === "system") apply("system");
    });
  });
})();
