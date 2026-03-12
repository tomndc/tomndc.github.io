(() => {
  const { projects, allTechnologies, allTypes, tagsThreshold } = window.__PS_DATA__;
  const TAGS_LIMIT = tagsThreshold ?? 4;

  const idx = projects.map((p) => ({
    ...p,
    techs:   (Array.isArray(p.technologies) ? p.technologies : p.technologies.split(",").map(t => t.trim())).map(t => t.toLowerCase()),
    typeLow: (p.type || "").toLowerCase(),
  }));

  const iconSlug = {
    javascript:"javascript", typescript:"typescript", nodejs:"nodedotjs",
    expressjs:"express", python:"python", php:"php", laravel:"laravel",
    wordpress:"wordpress", postgresql:"postgresql", prisma:"prisma",
    mongoose:"mongoose", vite:"vite", websockets:"socketdotio",
    "socket.io":"socketdotio", swagger:"swagger", "google api":"google",
  };

  const $input   = document.getElementById("ps-input");
  const $clear   = document.getElementById("ps-clear");
  const $shell   = document.getElementById("input-shell");
  const $sugs    = document.getElementById("ps-sugs");
  const $chips   = document.getElementById("chips-row");
  const $meta    = document.getElementById("ps-meta");
  const $grid    = document.getElementById("ps-grid");
  const $pFeat   = document.getElementById("panel-featured");
  const $pRes    = document.getElementById("panel-results");
  const $pDet    = document.getElementById("panel-detail");
  const $detCont = document.getElementById("detail-content");
  const $back    = document.getElementById("detail-back");
  const $lbBox   = document.getElementById("img-lightbox");
  const $lbImg   = document.getElementById("lb-img");
  const $lbClose = document.getElementById("lb-close");
  const allCards = Array.from($grid.querySelectorAll("[data-project-btn]"));

  let query       = "";
  let filters     = [];
  let focusIdx    = -1;
  let curSugs     = [];
  let activePanel = "featured";
  let prevPanel   = "featured";
  let fromFeaturedMode = false;

  function setBioState(state) {
    document.body.dataset.bioState = state;
    document.body.classList.toggle("searching", state !== "default");
  }

  function computeBioState() {
    if (fromFeaturedMode)         return "featured";
    if (filters.length >= TAGS_LIMIT) return "many-tags";
    if (filters.length > 0 || query.length > 0) return "searching";
    return "default";
  }

  function syncState() {
    setBioState(computeBioState());
    document.body.classList.toggle("detail", activePanel === "detail");
  }

  function showPanel(which) {
    if (activePanel === which) return;
    const map = { featured: $pFeat, results: $pRes, detail: $pDet };
    map[activePanel].classList.add("panel-off");
    activePanel = which;
    syncState();
    requestAnimationFrame(() => map[which].classList.remove("panel-off"));
  }

  function openDetail(projectName, fromFeatured) {
    const p = projects.find(x => x.name === projectName);
    if (!p) return;
    prevPanel = activePanel;

    if (fromFeatured) {
      fromFeaturedMode = true;
    }

    const techs = Array.isArray(p.technologies) ? p.technologies : p.technologies.split(",").map(t => t.trim());
    const tools = p.tools ? (Array.isArray(p.tools) ? p.tools : p.tools.split(",").map(t => t.trim())) : [];
    const initial = p.name.charAt(0).toUpperCase();

    const thumbHtml = p.thumbnail
      ? `<img src="${p.thumbnail}" alt="">`
      : `<span class="detail-thumb-letter">${initial}</span>`;

    const linksHtml = (p.source || (p.deploy && p.deploy.trim())) ? `<div class="detail-links">
      ${p.source ? `<a href="${p.source}" target="_blank" rel="noopener noreferrer" class="detail-link">
        <svg viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.87.5 12.35c0 5.18 3.44 9.58 8.2 11.13.6.12.82-.27.82-.58v-2.17c-3.34.75-4.04-1.65-4.04-1.65-.55-1.42-1.35-1.8-1.35-1.8-1.1-.78.08-.77.08-.77 1.22.09 1.86 1.3 1.86 1.3 1.08 1.9 2.83 1.35 3.52 1.03.11-.81.42-1.35.76-1.66-2.66-.31-5.46-1.37-5.46-6.08 0-1.34.46-2.43 1.22-3.29-.12-.31-.53-1.57.12-3.27 0 0 1-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.3-1.6 3.3-1.26 3.3-1.26.65 1.7.24 2.96.12 3.27.76.86 1.22 1.95 1.22 3.29 0 4.72-2.8 5.76-5.47 6.07.43.38.81 1.12.81 2.27v3.36c0 .32.22.7.83.58 4.76-1.55 8.19-5.95 8.19-11.13C23.5 5.87 18.27.5 12 .5z"/></svg>Source</a>` : ""}
      ${p.deploy && p.deploy.trim() ? `<a href="${p.deploy}" target="_blank" rel="noopener noreferrer" class="detail-link accent">
        <svg viewBox="0 0 24 24"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"/><path d="M5 5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6H5V5z"/></svg>Live demo</a>` : ""}
    </div>` : "";

    const imgsHtml = (p.images && p.images.length) ? `<div class="detail-images">
      ${p.images.map(src => `<button class="detail-img-btn" data-lb-src="${src}" aria-label="Open image">
        <img src="${src}" alt="" loading="lazy">
      </button>`).join("")}
    </div>` : "";

    $detCont.innerHTML = `
      <div class="detail-topbar">
        <div class="detail-name-row">
          <div class="detail-thumb">${thumbHtml}</div>
          <div>
            <h2 class="detail-heading">${p.name}</h2>
            ${p.type ? `<span class="detail-type">${p.type}</span>` : ""}
          </div>
        </div>
      </div>
      ${linksHtml}
      <p class="detail-desc">${p.description}</p>
      ${imgsHtml}
      <div class="detail-tags">
        ${techs.map(t => `<span>${t}</span>`).join("")}
        ${tools.map(t => `<span class="tool">${t}</span>`).join("")}
      </div>`;

    $pDet.scrollTop = 0;
    showPanel("detail");
  }

  $back.addEventListener("click", () => {
    fromFeaturedMode = false;

    if (prevPanel === "featured") {
      if (filters.length > 0) {
        showPanel("results");
      } else {
        resetToFeatured();
      }
    } else {
      showPanel("results");
    }
    syncState();
  });

  function resetToFeatured() {
    fromFeaturedMode = false;
    query = ""; $input.value = "";
    filters = [];
    syncClear(); renderChips(); closeSugs(); updateShellClasses();
    allCards.forEach(c => { c.hidden = true; });
    if ($meta) $meta.textContent = "";
    showPanel("featured");
    syncState();
  }

  document.addEventListener("click", e => {
    const imgBtn = e.target.closest("[data-lb-src]");
    if (imgBtn) { openLightbox(imgBtn.dataset.lbSrc); return; }
    const btn = e.target.closest("[data-project-btn]");
    if (!btn) return;
    const fromFeatured = activePanel === "featured";
    openDetail(btn.dataset.projectId, fromFeatured);
  });

  document.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-project-btn]")) {
      e.preventDefault();
      const fromFeatured = activePanel === "featured";
      openDetail(e.target.dataset.projectId, fromFeatured);
    }
    if (e.key === "Escape" && $lbBox && !$lbBox.hidden) closeLightbox();
  });

  function openLightbox(src) { $lbImg.src = src; $lbBox.hidden = false; }
  function closeLightbox()   { $lbBox.hidden = true; $lbImg.src = ""; }
  if ($lbClose) $lbClose.addEventListener("click", closeLightbox);
  if ($lbBox)   $lbBox.addEventListener("click", e => { if (e.target === $lbBox) closeLightbox(); });

  function techIcon(label) {
    const slug = iconSlug[label.toLowerCase()];
    if (!slug) return "";
    return `<img src="https://cdn.simpleicons.org/${slug}" width="13" height="13" alt="" onerror="this.style.display='none'">`;
  }

  function swMatch(value, q) {
    const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${esc}`, "i").test(value);
  }

  function buildSugs(q) {
    if (!q.trim()) return [];
    const active = new Set(filters.map(f => f.label.toLowerCase()));
    const seen = new Set(), out = [];
    const push = (label, kind) => {
      const k = label.toLowerCase();
      if (seen.has(k) || active.has(k)) return;
      seen.add(k); out.push({ label, kind });
    };
    allTechnologies.forEach(t => { if (swMatch(t, q)) push(t, "tech"); });
    allTypes.forEach(t => { if (t && swMatch(t, q)) push(t, "type"); });
    return out.slice(0, 9);
  }

  function renderSugs(sugs) {
    curSugs = sugs; focusIdx = -1;
    if (!sugs.length) { closeSugs(); return; }
    $sugs.innerHTML = sugs.map((s, i) =>
      `<li class="sug-item ${s.kind}-item" role="option" id="sug-${i}"
           aria-selected="false" data-label="${s.label}" data-kind="${s.kind}" tabindex="0">
        ${s.kind === "tech" ? techIcon(s.label) : ""}
        <span>${s.label}</span>
      </li>`
    ).join("");
    $sugs.hidden = false;
    $input.setAttribute("aria-expanded", "true");
    $sugs.querySelectorAll(".sug-item").forEach(li => {
      li.addEventListener("mousedown", e => { e.preventDefault(); pickLi(li); });
      li.addEventListener("keydown", e => {
        if (e.key==="Enter"||e.key===" ")                              { e.preventDefault(); pickLi(li); }
        else if (e.key==="ArrowDown"||(e.key==="Tab"&&!e.shiftKey))   { e.preventDefault(); moveFocus(1); }
        else if (e.key==="ArrowUp"||(e.key==="Tab"&&e.shiftKey))      { e.preventDefault(); moveFocus(-1); }
        else if (e.key==="Escape")                                      { closeSugs(); $input.focus(); }
      });
    });
  }

  function setActive(i) {
    const items = Array.from($sugs.querySelectorAll(".sug-item"));
    items.forEach((li, j) => {
      li.classList.toggle("is-active", j === i);
      li.setAttribute("aria-selected", j === i ? "true" : "false");
    });
    if (i >= 0 && i < items.length) {
      items[i].focus();
      $input.setAttribute("aria-activedescendant", `sug-${i}`);
    } else {
      $input.removeAttribute("aria-activedescendant");
    }
  }

  function moveFocus(dir) {
    const n = curSugs.length; if (!n) return;
    focusIdx = (focusIdx + dir + n) % n;
    setActive(focusIdx);
  }

  function pickLi(li) {
    $input.value = ""; query = "";
    addFilter(li.dataset.label, li.dataset.kind);
    closeSugs(); $input.focus();
  }

  function closeSugs() {
    $sugs.hidden = true; $sugs.innerHTML = "";
    $input.setAttribute("aria-expanded", "false");
    $input.removeAttribute("aria-activedescendant");
    curSugs = []; focusIdx = -1;
  }

  function updateShellClasses() {
    $shell.classList.toggle("has-chips", filters.length > 0);
    $shell.classList.toggle("has-value",  query.length > 0);
  }

  function addFilter(label, kind) {
    if (filters.some(f => f.label.toLowerCase() === label.toLowerCase())) return;
    fromFeaturedMode = false;
    filters.push({ label, kind });
    syncClear(); renderChips(); applyFilters(); updateShellClasses(); syncState();
  }

  function removeFilter(label) {
    filters = filters.filter(f => f.label.toLowerCase() !== label.toLowerCase());
    syncClear(); renderChips(); applyFilters(); updateShellClasses(); syncState();
    $input.focus();
  }

  function syncClear() {
    $clear.hidden = !query && !filters.length;
  }

  function renderChips() {
    const base = "display:inline-flex;align-items:center;gap:.3rem;font-size:.63rem;font-family:inherit;padding:.14rem .4rem .14rem .48rem;border-radius:999px;white-space:nowrap;background:color-mix(in srgb,currentColor 8%,transparent);border:1px solid color-mix(in srgb,currentColor 14%,transparent);color:inherit;line-height:1;";
    $chips.innerHTML = filters.map(f =>
      `<span style="${base}">
        <span style="font-size:.63rem;opacity:.75;">${f.label}</span>
        <span class="chip-x" role="button" tabindex="0" aria-label="Remove ${f.label}" data-lbl="${f.label}"
          style="display:inline-flex;align-items:center;cursor:pointer;opacity:.4;font-size:.68rem;padding:0 1px;">✕</span>
      </span>`
    ).join("");
    $chips.querySelectorAll(".chip-x").forEach(x => {
      x.addEventListener("click",      e => { e.stopPropagation(); removeFilter(x.dataset.lbl); });
      x.addEventListener("keydown",    e => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); removeFilter(x.dataset.lbl); } });
      x.addEventListener("mouseenter", () => x.style.opacity="1");
      x.addEventListener("mouseleave", () => x.style.opacity="0.4");
    });
  }

  function applyFilters() {
    if (!filters.length) {
      allCards.forEach(c => { c.hidden = true; });
      if (activePanel === "results") showPanel("featured");
      if ($meta) $meta.textContent = "";
      return;
    }

    if (activePanel === "featured" || activePanel === "detail") showPanel("results");

    let visible = 0;
    allCards.forEach((card, i) => {
      const p = idx[i];
      const show = filters.some(f => {
        const fl = f.label.toLowerCase();
        if (fl === "featured") return p.featured === true;
        if (f.kind === "tech") return p.techs.some(t => t === fl);
        if (f.kind === "type") return p.typeLow === fl;
        return false;
      });
      card.hidden = !show;
      if (show) visible++;
    });

    if ($meta) $meta.textContent = visible
      ? `${visible} project${visible === 1 ? "" : "s"}`
      : "No projects match";
  }

  function clearAll() {
    fromFeaturedMode = false;
    filters = []; query = ""; $input.value = "";
    prevPanel = "featured";
    syncClear(); renderChips(); closeSugs(); updateShellClasses();
    allCards.forEach(c => { c.hidden = true; });
    if ($meta) $meta.textContent = "";
    if (activePanel !== "featured") showPanel("featured");
    syncState();
    $input.focus();
  }

  $input.addEventListener("input", () => {
    query = $input.value;
    if (query.length > 0) fromFeaturedMode = false;
    syncClear(); updateShellClasses(); syncState();
    renderSugs(buildSugs(query));
  });

  $input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!curSugs.length) renderSugs(buildSugs(query));
      moveFocus(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); moveFocus(-1);
    } else if (e.key === "Tab" && !e.shiftKey && curSugs.length) {
      e.preventDefault(); moveFocus(1);
    } else if (e.key === "Enter") {
      const active = $sugs.querySelector(".is-active");
      if (active) { e.preventDefault(); pickLi(active); }
    } else if (e.key === "Escape") {
      if (!$sugs.hidden) { e.preventDefault(); closeSugs(); }
      else clearAll();
    } else if (e.key === "Backspace" && !$input.value && filters.length) {
      removeFilter(filters[filters.length - 1].label);
    }
  });

  $input.addEventListener("focus", () => { if (query) renderSugs(buildSugs(query)); });
  $clear.addEventListener("click", clearAll);
  document.addEventListener("mousedown", e => {
    if (!document.getElementById("search-bar").contains(e.target)) closeSugs();
  });
  $shell.addEventListener("click", () => $input.focus());

  syncState();
  applyFilters();
})();
