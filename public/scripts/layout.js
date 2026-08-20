(function () {
  function resize() {
    var box = document.getElementById("display-box");
    if (!box) return;

    var boxTop = box.getBoundingClientRect().top;
    var footer = document.querySelector("footer");
    var footerH = footer ? footer.offsetHeight : 40;
    var available = Math.max(60, window.innerHeight - boxTop - footerH - 10);

    var results = document.getElementById("panel-results");
    var detail  = document.getElementById("panel-detail");
    var featured = document.getElementById("panel-featured");

    if (results)  results.style.height  = available + "px";
    if (detail)   detail.style.height   = available + "px";
    if (featured) featured.style.height = available + "px";

    document.dispatchEvent(new CustomEvent("layout:resized"));
  }

  window.__psResize = resize;

  requestAnimationFrame(resize);
  window.addEventListener("load", resize);
  window.addEventListener("resize", resize);

  if (!window.__psLayoutObserver) {
    window.__psLayoutObserver = new MutationObserver(function () { setTimeout(resize, 10); });
    window.__psLayoutObserver.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class", "data-bio-state", "hidden"]
    });
  }
})();
