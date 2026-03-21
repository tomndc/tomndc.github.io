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

    if (results) results.style.height = available + "px";
    if (detail)  detail.style.height  = available + "px";
  }

  window.addEventListener("load", resize);
  window.addEventListener("resize", resize);

  var observer = new MutationObserver(function() { setTimeout(resize, 10); });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "data-bio-state"]
  });
})();