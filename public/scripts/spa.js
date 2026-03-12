(() => {
  const tabs     = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll("section[id^='section-']");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.section;

      sections.forEach((s) => {
        s.hidden = s.id !== `section-${target}`;
      });

      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    });
  });
})();
