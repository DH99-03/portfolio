// 프로젝트 장면: 스크롤로 화면 가운데에 온 프로젝트의 장면색으로 페이지 전체 색을 바꾼다.
// 홈(index.html)과 프로젝트 페이지(project.html)가 함께 쓴다. 내용은 data.js(window.SITE).
(function () {
  const S = window.SITE;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const TOKENS = ["bg", "surface", "sunken", "line", "text", "muted", "faint", "accent", "accent-soft", "on-ink", "ok", "cond"];
  const TEXTURE = { control: "grid", night: "night" };

  const isDark = () => {
    const t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  let current = null;
  // 끝 카드는 페이지 전체 색과 상관없이 자기 프로젝트의 색을 쓴다 (다음 장면으로 넘어가도 유지)
  const paintEnds = () =>
    document.querySelectorAll(".ps-end[data-palette], .ps-go[data-palette]").forEach((el) => {
      const P = S.palettes && S.palettes[el.dataset.palette];
      if (!P) return;
      const t = isDark() && P.dark ? P.dark : P.light;
      el.style.setProperty("--end-bg", t.accent);
      el.style.setProperty("--end-fg", t["on-ink"]);
    });
  const apply = (paletteId) => {
    current = paletteId || null;
    const P = paletteId && S.palettes && S.palettes[paletteId];
    const tone = P ? (isDark() && P.dark ? P.dark : P.light) : null;
    TOKENS.forEach((k) => (tone ? root.style.setProperty(`--${k}`, tone[k]) : root.style.removeProperty(`--${k}`)));
    root.toggleAttribute("data-scene", !!tone);
    document.querySelectorAll(".ps-tex").forEach((el) => el.classList.toggle("on", !!P && el.dataset.tex === TEXTURE[paletteId]));
  };
  // 테마를 바꾸면 지금 장면을 그 테마 색으로 다시 칠한다
  new MutationObserver(() => { if (current) apply(current); paintEnds(); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { if (current) apply(current); paintEnds(); });

  const ensureTextures = () => {
    if (document.querySelector(".ps-tex")) return;
    ["grid", "night"].forEach((t) => {
      const d = document.createElement("div");
      d.className = `ps-tex ps-tex--${t}`;
      d.dataset.tex = t;
      d.setAttribute("aria-hidden", "true");
      document.body.prepend(d);
    });
  };

  const stateTag = (m) =>
    m.state
      ? `<span class="ps-st ps-st--${m.state === "ok" ? "ok" : "cond"}">${m.state === "ok" ? "확인함" : "조건부"}</span>${m.basis ? `<span class="ps-basis">${esc(m.basis)}</span>` : ""}`
      : "";
  const metricsHTML = (p) =>
    `<div class="ps-nums">${p.metrics
      .map((m) => `<div class="ps-num"><span class="ps-num__v" data-v="${esc(m.value)}">${esc(m.value)}</span><span class="ps-num__l">${esc(m.label)}</span>${stateTag(m)}</div>`)
      .join("")}</div>`;
  const factsHTML = (p) => {
    const f = p.facts || {};
    return `<dl class="ps-facts">
      ${f.period ? `<div><dt>기간</dt><dd>${esc(f.period)}</dd></div>` : ""}
      ${f.team ? `<div><dt>팀</dt><dd>${esc(f.team)}</dd></div>` : ""}
      ${f.share ? `<div><dt>내 기여</dt><dd><span class="ps-share" style="--w:${parseInt(f.share, 10) || 0}%"><i></i></span>${esc(f.share)}</dd></div>` : ""}
    </dl>`;
  };

  // 숫자 올라가기: 값 앞부분의 숫자만 0에서 올린다
  const countUp = (el) => {
    const raw = el.dataset.v;
    const m = raw.match(/^([\d,]+(?:\.\d+)?)([\s\S]*)$/);
    if (!m || reduce()) return;
    const target = parseFloat(m[1].replace(/,/g, ""));
    const dec = (m[1].split(".")[1] || "").length;
    const comma = m[1].includes(",");
    const t0 = performance.now(), dur = 1100;
    const fmt = (v) => (comma ? v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec));
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))) + m[2];
      if (k < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };

  let MAX_SHOTS = 99;
  const sceneHTML = (p, i) => `<section class="ps" id="ps-${esc(p.id)}" data-palette="${esc(p.palette || "")}" aria-labelledby="ps-name-${esc(p.id)}">
      <div class="ps__text">
        <p class="ps__no mono">PROJECT 0${i + 1}${p.award ? ` · <span>수상</span>` : ""}</p>
        <p class="ps__kicker">${esc(p.kicker)}</p>
        <h3 class="ps__name" id="ps-name-${esc(p.id)}">${esc(p.name)}</h3>
        <p class="ps__one">${esc(p.oneLine)}</p>
        ${factsHTML(p)}
        ${metricsHTML(p)}
        <div class="ps-steps" aria-hidden="true">${p.shots.slice(0, MAX_SHOTS).map((_, k) => `<i data-k="${k}"></i>`).join("")}<span class="mono">화면 1 / ${Math.min(p.shots.length, MAX_SHOTS)}</span></div>
        <div class="ps-peek">
          <div class="ps-peek__row">
            <a class="ps-go" href="project.html?id=${esc(p.id)}" data-palette="${esc(p.palette || "")}">프로젝트 전체 보기 <span aria-hidden="true">→</span></a>
            <button class="ps-peek__btn" type="button" aria-expanded="false" aria-controls="ps-peek-${esc(p.id)}">빠르게 보기 <span class="mono" aria-hidden="true">+</span></button>
          </div>
          <div class="ps-peek__body" id="ps-peek-${esc(p.id)}" role="region" aria-label="${esc(p.name)} 요약"><div><div class="ps-peek__inner">
            ${p.award ? `<p class="ps-award">${esc(p.award)}</p>` : ""}
            <div><h4>문제</h4><p>${esc(p.problem)}</p></div>
            <div><h4>내 역할</h4><ul>${p.role.map((r, k) => `<li>${p.roleKind && p.roleKind[k] ? `<span class="ps-kind">${esc(p.roleKind[k])}</span>` : ""}${esc(r)}</li>`).join("")}</ul></div>
            <p class="ps-honest"><b>한계</b>${esc(p.honest)}</p>
            ${p.live ? `<a class="ps-live" href="${esc(p.live.url)}" target="_blank" rel="noopener">${esc(p.live.label)} ↗</a>` : ""}
          </div></div></div>
        </div>
      </div>
      <div class="ps__shots">${p.shots
        .slice(0, MAX_SHOTS)
        .map(
          (sh, k) => `<figure class="ps-shot" data-k="${k}">
            <button class="ps-shot__frame" type="button" data-src="${esc(sh.src)}" data-cap="${esc(p.name + " · " + sh.caption)}" aria-label="${esc(sh.caption)} 크게 보기"><img src="${esc(sh.src)}" alt="${esc(p.name)} · ${esc(sh.caption)}" loading="lazy" /></button>
            <figcaption><span class="mono">0${k + 1}</span>${esc(sh.caption)}</figcaption>
          </figure>`
        )
        .join("")}
        <a class="ps-end" href="project.html?id=${esc(p.id)}" data-palette="${esc(p.palette || "")}">
          <span class="ps-end__label mono">다 보셨나요?</span>
          <span class="ps-end__title">${esc(p.name)} 전체 보기</span>
          <span class="ps-end__meta">${[`화면 ${p.shots.length}장`, S.stories && S.stories[p.id] ? `이야기 ${S.stories[p.id].chapters.length}장` : "", "문제 · 역할 · 한계", "프로젝트 PDF"].filter(Boolean).map(esc).join(" · ")}</span>
          <span class="ps-end__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>`;

  let io = null, shotIO = null;
  const observe = (boundary) => {
    if (io) io.disconnect();
    if (shotIO) shotIO.disconnect();
    const scenes = [...document.querySelectorAll(".ps")];
    io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const pal = e.target.dataset.palette || null;
          apply(pal);
          if (pal && !e.target.classList.contains("is-active")) {
            e.target.classList.add("is-active");
            e.target.querySelectorAll(".ps-num__v").forEach(countUp);
          }
        }),
      { rootMargin: "-48% 0px -48% 0px" }
    );
    scenes.forEach((el) => io.observe(el));
    (boundary || []).forEach((el) => el && io.observe(el));
    shotIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const sc = e.target.closest(".ps");
          const k = +e.target.dataset.k;
          sc.querySelectorAll(".ps-shot").forEach((s) => s.classList.toggle("is-on", s === e.target));
          sc.querySelectorAll(".ps-steps i").forEach((b) => b.classList.toggle("on", +b.dataset.k === k));
          sc.querySelector(".ps-steps .mono").textContent = `화면 ${k + 1} / ${sc.querySelectorAll(".ps-shot").length}`;
        }),
      { rootMargin: "-40% 0px -40% 0px" }
    );
    document.querySelectorAll(".ps-shot").forEach((s) => shotIO.observe(s));
  };

  // 빠르게 보기 · 화면 크게 보기
  let lb = null;
  const lightbox = () => {
    if (lb) return lb;
    lb = document.createElement("dialog");
    lb.className = "ps-lb";
    lb.setAttribute("aria-label", "화면 크게 보기");
    lb.innerHTML = `<button class="ps-lb__close" type="button" aria-label="닫기">×</button><figure><img alt="" /><figcaption></figcaption></figure>`;
    document.body.appendChild(lb);
    lb.querySelector(".ps-lb__close").addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    return lb;
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".ps-peek__btn");
    if (b) {
      const pk = b.closest(".ps-peek");
      const open = !pk.classList.contains("is-open");
      pk.classList.toggle("is-open", open);
      pk.closest(".ps__text").classList.toggle("is-peek", open);
      b.setAttribute("aria-expanded", String(open));
      b.firstChild.textContent = open ? "요약 닫기 " : "빠르게 보기 ";
    }
    const fr = e.target.closest(".ps-shot__frame, .pp-shot");
    if (fr) {
      const d = lightbox();
      d.querySelector("img").src = fr.dataset.src;
      d.querySelector("img").alt = fr.dataset.cap || "";
      d.querySelector("figcaption").textContent = fr.dataset.cap || "";
      d.showModal();
    }
  });

  window.ProjectScenes = {
    render(container, projects, boundary, opts) {
      MAX_SHOTS = (opts && opts.maxShots) || 99;
      ensureTextures();
      container.innerHTML = projects.map(sceneHTML).join("");
      paintEnds();
      observe(boundary);
    },
    apply,
    countUp,
    metricsHTML,
    factsHTML,
    ensureTextures,
  };
})();
