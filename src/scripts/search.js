(() => {
  const { projects, allTechnologies, allTypes } = window.__PS_DATA__;

  const idx = projects.map((p) => {
    const techs = Array.isArray(p.technologies)
      ? p.technologies.map((t) => t.toLowerCase())
      : p.technologies.split(",").map((t) => t.trim().toLowerCase());
    return { ...p, techs, typeLow: (p.type || "").toLowerCase() };
  });

  function swMatch(value, query) {
    if (!query) return false;
    const q = query.toLowerCase().trim();
    const re = new RegExp(`(^|[^a-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}`, "i");
    return re.test(value);
  }

  let query    = "";
  let filters  = [];
  let focusIdx = -1;
  let curSugs  = [];

  const $input     = document.getElementById("ps-input");
  const $clear     = document.getElementById("ps-clear");
  const $shell     = document.getElementById("input-shell");
  const $sugs      = document.getElementById("ps-sugs");
  const $chips     = document.getElementById("chips-row");
  const $grid      = document.getElementById("ps-grid");
  const $gridShell = document.getElementById("grid-shell");
  const $idle      = document.getElementById("ps-idle");
  const $meta      = document.getElementById("ps-meta");
  const $hint      = document.getElementById("ps-hint");
  const allCards   = Array.from($grid.querySelectorAll("article"));

  function buildSugs(q) {
    if (!q.trim()) return [];
    const active = new Set(filters.map((f) => f.label.toLowerCase()));
    const seen = new Set();
    const out  = [];
    const push = (label, kind) => {
      const k = label.toLowerCase();
      if (seen.has(k) || active.has(k)) return;
      seen.add(k); out.push({ label, kind });
    };
    allTechnologies.forEach((t) => { if (swMatch(t, q)) push(t, "tech"); });
    allTypes.forEach((t)        => { if (t && swMatch(t, q)) push(t, "type"); });
    return out.slice(0, 9);
  }

  function renderSugs(sugs) {
    curSugs = sugs; focusIdx = -1;
    if (!sugs.length) { closeSugs(); return; }

    $sugs.innerHTML = sugs.map((s, i) => `
      <li class="sug-item ${s.kind}-item"
          role="option" id="sug-${i}"
          aria-selected="false"
          data-label="${s.label}"
          data-kind="${s.kind}"
          tabindex="0">
        <span class="sug-pill">${s.label}</span>
      </li>
    `).join("");

    $sugs.hidden = false;
    $input.setAttribute("aria-expanded", "true");

    $sugs.querySelectorAll(".sug-item").forEach((li) => {
      li.addEventListener("mousedown",  (e) => { e.preventDefault(); pickLi(li); });
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ")                              { e.preventDefault(); pickLi(li); }
        else if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) { e.preventDefault(); moveFocus(1); }
        else if (e.key === "ArrowUp"   || (e.key === "Tab" &&  e.shiftKey)) { e.preventDefault(); moveFocus(-1); }
        else if (e.key === "Escape")                                         { closeSugs(); $input.focus(); }
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
    addFilter(li.dataset.label, li.dataset.kind);
    $input.value = ""; query = "";
    closeSugs(); $input.focus();
  }

  function closeSugs() {
    $sugs.hidden = true; $sugs.innerHTML = "";
    $input.setAttribute("aria-expanded", "false");
    $input.removeAttribute("aria-activedescendant");
    curSugs = []; focusIdx = -1;
  }

  function addFilter(label, kind) {
    if (filters.some((f) => f.label.toLowerCase() === label.toLowerCase())) return;
    filters.push({ label, kind });
    syncClear(); renderChips(); applyFilters();
    if ($hint) $hint.style.opacity = "0";
  }

  function removeFilter(label) {
    filters = filters.filter((f) => f.label.toLowerCase() !== label.toLowerCase());
    syncClear(); renderChips(); applyFilters();
    if (!filters.length && !query && $hint) $hint.style.opacity = "";
    $input.focus();
  }

  function syncClear() {
    $clear.hidden = !query && !filters.length;
  }

  function renderChips() {
    const chipBase = "display:inline-flex;align-items:center;gap:0.3rem;font-size:0.63rem;font-family:var(--font-mono,'IBM Plex Mono',monospace);padding:0.14rem 0.4rem 0.14rem 0.48rem;border-radius:999px;white-space:nowrap;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.11);color:rgba(255,255,255,0.6);cursor:default;line-height:1;";

    $chips.innerHTML = filters.map((f) => `
      <span style="${chipBase}">
        <span style="font-size:0.63rem;">${f.label}</span>
        <span class="chip-x" role="button" tabindex="0" aria-label="Remove ${f.label}" data-lbl="${f.label}" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer;opacity:0.45;line-height:1;font-size:0.7rem;">✕</span>
      </span>
    `).join("");

    $chips.querySelectorAll(".chip-x").forEach((x) => {
      x.addEventListener("click",   (e) => { e.stopPropagation(); removeFilter(x.dataset.lbl); });
      x.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); removeFilter(x.dataset.lbl); } });
      x.addEventListener("mouseenter", () => { x.style.opacity = "1"; });
      x.addEventListener("mouseleave", () => { x.style.opacity = "0.45"; });
    });

    $input.placeholder = filters.length ? "" : "Search by type or tech :)";
  }

  function applyFilters() {
    const q      = query.trim().toLowerCase();
    const hasAny = q.length > 0 || filters.length > 0;
    let visible  = 0;

    allCards.forEach((card, i) => {
      const p = idx[i];
      let show = false;

      if (hasAny) {
        if (filters.length) {
          show = filters.some((f) => {
            const fl = f.label.toLowerCase();
            if (f.kind === "tech") return p.techs.some((t) => t === fl);
            if (f.kind === "type") return p.typeLow === fl;
            return false;
          });
        }
        if (!show && q) {
          show = p.techs.some((t) => swMatch(t, q)) || (p.type && swMatch(p.type, q));
        }
      }

      card.hidden = !show;
      if (show) visible++;
    });

    $gridShell.hidden = !hasAny || visible === 0;
    if ($idle) $idle.hidden = hasAny;
    $meta.textContent = (hasAny && visible > 0) ? `${visible} project${visible === 1 ? "" : "s"}` : "";
  }

  $input.addEventListener("input", () => {
    query = $input.value;
    syncClear(); renderSugs(buildSugs(query)); applyFilters();
  });

  $input.addEventListener("keydown", (e) => {
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
      else { $input.value = ""; query = ""; syncClear(); applyFilters(); }
    } else if (e.key === "Backspace" && !$input.value && filters.length) {
      removeFilter(filters[filters.length - 1].label);
    }
  });

  $input.addEventListener("focus", () => { if (query) renderSugs(buildSugs(query)); });

  $clear.addEventListener("click", () => {
    filters = []; query = ""; $input.value = "";
    syncClear(); renderChips(); closeSugs(); applyFilters();
    if ($hint) $hint.style.opacity = "";
    $input.focus();
  });

  document.addEventListener("mousedown", (e) => {
    if (!document.getElementById("ps-head").contains(e.target)) closeSugs();
  });

  $shell.addEventListener("click", () => $input.focus());

  applyFilters();
})();