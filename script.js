(function () {
  const S = window.SITE;
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- HERO ----------
  $("#hero-name").textContent = `${S.name} · ${S.nameEn}`;
  // 헤드라인의 마지막 단어만 포인트 색으로 강조
  const words = S.headline.trim().split(/\s+/);
  const last = words.pop();
  $("#hero-headline").innerHTML = `${words.map(esc).join(" ")}${words.length ? " " : ""}<em>${esc(last)}</em>`;
  $("#hero-sub").textContent = S.subline;
  $("#hero-intro").textContent = S.intro;
  $("#footer-name").textContent = S.name;

  // 사진: 파일이 있으면 표시, 없으면 이니셜 유지
  const img = new Image();
  img.alt = `${S.name} 프로필 사진`;
  img.onload = () => {
    const box = $("#photo");
    box.innerHTML = "";
    box.appendChild(img);
    box.classList.add("photo--loaded");
  };
  // 윈도우에서 확장자가 숨겨져 'profile.jpg.jpg'로 저장된 경우도 찾아서 표시
  const candidates = [S.photo, S.photo + ".jpg", S.photo.replace(/\.jpg$/, ".png"), S.photo.replace(/\.jpg$/, ".jpeg")];
  let tryIdx = 0;
  img.onerror = () => {
    tryIdx += 1;
    if (tryIdx < candidates.length) img.src = candidates[tryIdx];
  };
  img.src = candidates[0];

  $("#stats").innerHTML = S.stats
    .map(
      (s) => `<li class="stat reveal">
        <span class="stat__value">${esc(s.value)}</span>
        <span class="stat__label">${esc(s.label)}</span>
        <span class="stat__note mono">${esc(s.note)}</span>
      </li>`
    )
    .join("");

  // ---------- PDF 경로 ----------
  const P = S.pdf || { all: { label: "전체", file: "전체" }, projects: [] };
  const rolePdf = (r, kind) => `pdf/직무별/권동현_${(r || P.all).file}_${kind}.pdf`;
  const projPdf = (f) => `pdf/프로젝트/권동현_${f}.pdf`;

  // ---------- 화면 이미지 갤러리 + 확대 보기 ----------
  const galleries = [];
  const gallery = (shots, name) => {
    if (!shots || !shots.length) return "";
    const gi = galleries.push({ shots, name }) - 1;
    return `<div class="shots" data-g="${gi}" role="list" aria-label="${esc(name)} 화면">${shots
      .map(
        (sh, k) => `<figure class="shot" role="listitem"><button type="button" data-g="${gi}" data-k="${k}" aria-label="${esc(sh.caption)} — 크게 보기"><img src="${esc(sh.src)}" alt="${esc(name)} · ${esc(sh.caption)}" loading="lazy" /></button><figcaption>${esc(sh.caption)}</figcaption></figure>`
      )
      .join("")}</div>`;
  };

  // ---------- 목차 바로가기 (지금 위치 표시) ----------
  const SITE_URL = "https://dh99-03.github.io/portfolio/";
  const roleLink = (r) => SITE_URL + (r ? `?role=${encodeURIComponent(r.id)}` : "");
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    return ok;
  };
  const flash = (btn, msg) => {
    const old = btn.dataset.label || btn.textContent;
    btn.dataset.label = old;
    btn.textContent = msg;
    btn.classList.add("is-done");
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = old; btn.classList.remove("is-done"); }, 1800);
  };
  const toc = document.createElement("nav");
  toc.className = "toc";
  toc.setAttribute("aria-label", "목차 바로가기");
  toc.innerHTML = `<button type="button" class="toc__pill" aria-expanded="false" aria-controls="toc-list"><span class="mono">목차</span><b class="toc__now"></b></button><ol class="toc__list" id="toc-list"></ol>`;
  document.body.appendChild(toc);
  const tocList = toc.querySelector(".toc__list");
  const tocPill = toc.querySelector(".toc__pill");
  let tocItems = [];
  const renderToc = (picks) => {
    const items = [{ id: "top", label: "첫 화면" }];
    picks.forEach((p, i) => items.push({ id: "ps-" + p.id, label: p.name.replace(/\s*\(.*\)$/, ""), sub: `0${i + 1}` }));
    if ($("#projects-tail")) items.push({ id: "projects-tail", label: "다른 프로젝트" });
    items.push({ id: "vibe", label: "일하는 방식" }, { id: "story", label: "성장 과정" }, { id: "awards", label: "수상·자격" }, { id: "contact", label: "연락처" });
    tocItems = items.map((x) => ({ ...x, el: document.getElementById(x.id) })).filter((x) => x.el);
    tocList.innerHTML = tocItems
      .map((x) => `<li><a href="#${esc(x.id)}" class="toc__a${x.sub ? " toc__a--proj" : ""}"><i aria-hidden="true"></i><span>${x.sub ? `<em class="mono">${x.sub}</em>` : ""}${esc(x.label)}</span></a></li>`)
      .join("");
    tocUpdate();
  };
  const tocUpdate = () => {
    const y = window.scrollY + window.innerHeight * 0.4;
    let cur = 0;
    tocItems.forEach((x, i) => { if (x.el.getBoundingClientRect().top + window.scrollY <= y) cur = i; });
    tocList.querySelectorAll(".toc__a").forEach((a, i) => {
      a.classList.toggle("is-active", i === cur);
      if (i === cur) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
    if (tocItems[cur]) toc.querySelector(".toc__now").textContent = tocItems[cur].label;
  };
  const setToc = (open) => { toc.classList.toggle("is-open", open); tocPill.setAttribute("aria-expanded", String(open)); };
  tocPill.addEventListener("click", () => setToc(!toc.classList.contains("is-open")));
  tocList.addEventListener("click", (e) => { if (e.target.closest("a")) setToc(false); });
  document.addEventListener("click", (e) => { if (!toc.contains(e.target)) setToc(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setToc(false); });
  let tocTick = false;
  window.addEventListener("scroll", () => { if (!tocTick) { tocTick = true; requestAnimationFrame(() => { tocUpdate(); tocTick = false; }); } }, { passive: true });
  window.addEventListener("resize", tocUpdate);

  // ---------- FEATURED ----------
  const list = (arr) => `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const roleList = (p) =>
    `<ul>${p.role
      .map((x, k) => {
        const kind = p.roleKind && p.roleKind[k];
        return `<li>${kind ? `<span class="kind ${kind === "직접 구현" ? "kind--do" : ""}">${esc(kind)}</span>` : ""}${esc(x)}</li>`;
      })
      .join("")}</ul>`;
  // 대표 프로젝트: 장면형 (pscenes.js). 직무를 고르면 그 직무의 앞 3개가 장면으로, 나머지는 짧은 목록으로
  const renderFeatured = (order, full) => {
    const byId = (id) => S.featured.find((p) => p.id === id);
    const picks = full ? S.featured : order.map(byId).filter(Boolean);
    const rest = full ? [] : S.featured.filter((p) => !order.includes(p.id));
    window.ProjectScenes.render($("#pscenes"), picks, [$("#top"), $("#projects .section__head"), $("#projects-tail"), $("#vibe")], { maxShots: 3 });
    $("#ps-more-wrap").hidden = !rest.length;
    $("#ps-more").innerHTML = rest
      .map((p) => `<li><a href="project.html?id=${esc(p.id)}"><b>${esc(p.name)}</b><p>${esc(p.oneLine)}</p><span class="mono">${esc(p.metrics[0].value)} ${esc(p.metrics[0].label)} →</span></a></li>`)
      .join("");
    renderToc(picks);
  };
  renderFeatured(S.featured.map((p) => p.id), true);

  // ---------- OTHERS ----------
  $("#others").innerHTML = S.others
    .map(
      (o) => `<li class="other reveal">
        <div>
          <h4>${esc(o.name)}</h4>
          <span class="mono other__when">${esc(o.when)}</span>
        </div>
        <div>
          <p>${esc(o.desc)}</p>
          <p class="other__note">${esc(o.note)}</p>
          ${o.storyId && S.stories && S.stories[o.storyId] ? `<a class="storybtn" href="project.html?id=${esc(o.storyId)}">자세히 보기 →</a>` : ""}
        </div>
        ${o.shots && o.shots.length ? `<details class="other__shots"><summary>화면 보기 (${o.shots.length})</summary>${gallery(o.shots, o.name)}</details>` : ""}
      </li>`
    )
    .join("");

  // ---------- 문제 정의 방식 ----------
  let pdCases = null;
  if (S.process && window.ProblemDef) {
    $("#pd-lead").textContent = S.process.lead;
    $("#pd-after").textContent = S.process.after;
    window.ProblemDef.renderSteps($("#pd-steps"));
    pdCases = window.ProblemDef.renderCases($("#pd-cases"), "spot");
  }

  // ---------- VIBE ----------
  if (S.vibe) {
    const V = S.vibe;
    $("#vibe-thesis").textContent = V.thesis;
    $("#vibe-pillars").innerHTML = V.pillars
      .map((p, i) => `<article class="pillar reveal"><span class="mono pillar__no">0${i + 1}</span><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><p class="pillar__miss">${esc(p.miss)}</p></article>`)
      .join("");
    $("#vibe-flow").innerHTML = V.flow
      .map((f, i) => `<li class="flow__step reveal"><span class="mono flow__no">${i + 1}</span><b>${esc(f.step)}</b><span class="mono flow__skill">${esc(f.skill)}</span></li>`)
      .join("");
    $("#vibe-flownote").textContent = V.flowNote;
    // 9단계가 스크롤에 따라 하나씩 켜진다
    const flowEl = $("#vibe-flow");
    const lightFlow = () => {
      const r = flowEl.getBoundingClientRect();
      const k = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (innerHeight * 0.6)));
      const n = Math.round(k * V.flow.length);
      flowEl.querySelectorAll(".flow__step").forEach((s, i) => s.classList.toggle("lit", i < n));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) flowEl.querySelectorAll(".flow__step").forEach((s) => s.classList.add("lit"));
    else { addEventListener("scroll", lightFlow, { passive: true }); lightFlow(); }
    $("#vibe-tools").innerHTML = V.tools
      .map((g) => `<div class="skillgroup reveal"><span class="mono skillgroup__name">${esc(g.group)}</span><div class="chips">${g.items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div></div>`)
      .join("");
    $("#vibe-lessons").innerHTML = V.lessons
      .map((l) => `<li class="lesson reveal"><p class="lesson__what">${esc(l.what)}</p><p class="lesson__rule">→ ${esc(l.rule)}</p></li>`)
      .join("");
    $("#vibe-human").innerHTML = `<b>사람의 몫</b>${esc(V.human.replace(/^제가 맡는 것: /, ""))}`;
  } else {
    const v = $("#vibe"); if (v) v.hidden = true;
  }

  // ---------- SCENES ----------
  $("#scene-list").innerHTML = S.scenes
    .map(
      (s) => `<article class="scene reveal">
        <header class="scene__head">
          <span class="scene__year mono">${esc(s.year)}</span>
          <span class="scene__where">${esc(s.where)}</span>
        </header>
        <ol class="scene__steps">
          <li><span class="step">모름</span><p>${esc(s.unknown)}</p></li>
          <li><span class="step">배움</span><p>${esc(s.learned)}</p></li>
          <li class="is-done"><span class="step">끝냄</span><p>${esc(s.done)}</p></li>
        </ol>
        ${s.basis ? `<p class="scene__basis">${esc(s.basis)}</p>` : ""}
      </article>`
    )
    .join("");

  // ---------- TIMELINE ----------
  $("#timeline").innerHTML = S.timeline
    .map(
      (t) => `<li class="tl reveal">
        <div class="tl__meta">
          <span class="tl__period mono">${esc(t.period)}</span>
          <span class="tl__tag mono">${esc(t.tag)}</span>
        </div>
        <div class="tl__body">
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.desc)}</p>
        </div>
      </li>`
    )
    .join("");

  // ---------- RECORD ----------
  $("#award-list").innerHTML = S.awards
    .map(
      (a) => `<li class="award reveal">
        <span class="mono award__date">${esc(a.date)}</span>
        <div><p class="award__title">${esc(a.title)}</p><p class="award__org">${esc(a.org)} · ${esc(a.project)}</p></div>
      </li>`
    )
    .join("");

  $("#cert-list").innerHTML = S.certs
    .map((c) => `<li class="cert reveal"><span class="mono">${esc(c.date)}</span><b>${esc(c.name)}</b><span class="cert__org">${esc(c.org)}</span></li>`)
    .join("");

  $("#skill-list").innerHTML = S.skills
    .map(
      (g) => `<div class="skillgroup reveal"><span class="mono skillgroup__name">${esc(g.group)}</span>
        <div class="chips">${g.items.map((i) => `<span class="chip">${esc(i)}</span>`).join("")}</div></div>`
    )
    .join("");

  $("#activity-list").innerHTML = S.activities
    .map(
      (a) => `<li class="activity reveal"><h4>${esc(a.title)}</h4><span class="mono">${esc(a.period)}</span><p>${esc(a.desc)}</p></li>`
    )
    .join("");

  // ---------- CONTACT ----------
  const mail = $("#contact-mail");
  mail.href = `mailto:${S.email}`;
  mail.textContent = S.email;
  $("#contact-gh").href = S.github;

  // ---------- 읽는 관점 전환 ----------
  const ROLES = [{ id: "all", label: "전체" }, ...(S.roles || [])];
  const rolesBox = $("#roles");
  const proofBox = $("#hero-proof");
  const heroSub = $("#hero-sub");
  const heroIntro = $("#hero-intro");
  const allOrder = S.featured.map((p) => p.id);
  let currentRole = null;
  const setRole = (id, first) => {
    const r = (S.roles || []).find((x) => x.id === id);
    heroSub.textContent = r ? r.subline : S.subline;
    heroIntro.textContent = r ? r.intro : S.intro;
    if (r && r.proof && r.proof.length) {
      proofBox.innerHTML = r.proof.map((x) => `<li>${esc(x)}</li>`).join("");
      proofBox.hidden = false;
    } else {
      proofBox.hidden = true;
    }
    rolesBox.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.role === (r ? r.id : "all"))));
    renderFeatured(r ? r.order : allOrder, !r);
    currentRole = r;
    const rc = $("#role-copy");
    if (rc) { rc.title = roleLink(r); rc.setAttribute("aria-label", `${r ? r.label : "전체"} 관점 링크 복사: ${roleLink(r)}`); }
    if (pdCases) {
      const ids = (r ? r.order : allOrder).filter((x) => window.ProblemDef.hasCase(x));
      if (ids.length) pdCases.select(ids[0]);
    }
    const op = $("#hero-onepager");
    op.href = rolePdf(r, "원페이저");
    op.textContent = r ? `${r.label} 원페이저 PDF` : "원페이저 PDF";
    const pickIds = (r ? r.order : allOrder).slice(0, 3);
    $("#picks").innerHTML =
      `<p class="picks__label mono">${r ? esc(r.label) + " 직무로 먼저 볼 프로젝트" : "먼저 볼 프로젝트"}</p><ol class="picks__list">` +
      pickIds
        .map((id) => S.featured.find((p) => p.id === id))
        .filter(Boolean)
        .map(
          (p, i) => `<li><a class="pick" href="#ps-${esc(p.id)}">
            <span class="pick__no mono">0${i + 1}</span>
            <span class="pick__name">${esc(p.name)}</span>
            <span class="pick__one">${esc(p.oneLine)}</span>
            <span class="pick__meta mono">${esc(p.metrics[0].value)} ${esc(p.metrics[0].label)}${p.facts && p.facts.share ? ` · 기여 ${esc(p.facts.share)}` : ""}</span>
          </a></li>`
        )
        .join("") +
      `</ol>`;
    try {
      const u = new URL(location.href);
      if (r) u.searchParams.set("role", r.id); else u.searchParams.delete("role");
      history.replaceState(null, "", u);
    } catch (e) {}
  };
  if (S.roles && S.roles.length) {
    rolesBox.innerHTML =
      `<span class="roles__label">어떤 직무로 보시나요?</span>` +
      ROLES.map((r) => `<button type="button" class="rolebtn" data-role="${esc(r.id)}" aria-pressed="false">${esc(r.label)}</button>`).join("") +
      `<button type="button" class="rolelink" id="role-copy">이 관점 링크 복사</button>`;
    rolesBox.addEventListener("click", async (e) => {
      const c = e.target.closest(".rolelink");
      if (c) { flash(c, (await copyText(roleLink(currentRole))) ? "복사했어요 ✓" : "복사 실패: 주소창을 복사해 주세요"); return; }
      const b = e.target.closest(".rolebtn");
      if (b) setRole(b.dataset.role, false);
    });
    let initial = "all";
    try { initial = new URL(location.href).searchParams.get("role") || "all"; } catch (e) {}
    if (!ROLES.some((r) => r.id === initial)) initial = "all";
    setRole(initial, false);
  } else {
    rolesBox.hidden = true;
  }

  // ---------- PDF 받기 ----------
  const dl = $("#dl");
  const roleRows = [...(S.roles || []), null];
  const renderDl = () => {
    $("#dl-roles").innerHTML = roleRows
      .map((r) => {
        const cur = r ? currentRole && currentRole.id === r.id : !currentRole;
        return `<li class="dl__row${cur ? " is-current" : ""}">
          <span class="dl__name">${esc(r ? r.label : "전체 (모든 프로젝트)")}${cur ? ' <span class="mono dl__now">지금 보는 관점</span>' : ""}</span>
          <a class="dl__file" href="${esc(rolePdf(r, "원페이저"))}" download>원페이저 <span class="mono">1쪽</span></a>
          <a class="dl__file" href="${esc(rolePdf(r, "포트폴리오"))}" download>포트폴리오 <span class="mono">${r ? "12쪽" : "16쪽"}</span></a>
          <button type="button" class="dl__file dl__link" data-copy="${esc(roleLink(r))}" title="${esc(roleLink(r))}">링크 복사</button>
        </li>`;
      })
      .join("");
    $("#dl-projects").innerHTML = (P.projects || [])
      .map((x) => {
        const f = S.featured.find((p) => p.id === x.id);
        const o = S.others.find((p) => p.storyId === x.id);
        const name = (f && f.name) || (o && o.name) || x.file;
        return `<li><a class="dl__file dl__file--proj" href="${esc(projPdf(x.file))}" download>${esc(name)}</a></li>`;
      })
      .join("");
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-dl]")) {
      renderDl();
      dl.showModal();
    }
  });
  dl.addEventListener("click", async (e) => {
    const c = e.target.closest("[data-copy]");
    if (c) flash(c, (await copyText(c.dataset.copy)) ? "복사됨 ✓" : "복사 실패");
  });
  $("#dl-close").addEventListener("click", () => dl.close());
  dl.addEventListener("click", (e) => { if (e.target === dl) dl.close(); });

  // 연락 가능 시기
  if (S.availability) {
    const av = $("#avail");
    av.textContent = S.availability;
    av.hidden = false;
  }

  // ---------- 스크롤 등장 효과 (같은 묶음 안에서는 순서대로 살짝 시차) ----------
  const reveals = [...document.querySelectorAll(".reveal")];
  reveals.forEach((el) => {
    const idx = [...el.parentElement.children].filter((c) => c.classList.contains("reveal")).indexOf(el);
    el.style.setProperty("--d", Math.min(Math.max(idx, 0), 4));
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // 확대 보기
  const lb = $("#lightbox");
  let cur = { g: 0, k: 0 };
  const showLb = (g, k) => {
    const G = galleries[g];
    k = (k + G.shots.length) % G.shots.length;
    cur = { g, k };
    const sh = G.shots[k];
    $("#lb-img").src = sh.src;
    $("#lb-img").alt = `${G.name} · ${sh.caption}`;
    $("#lb-cap").textContent = `${G.name} · ${sh.caption} (${k + 1}/${G.shots.length})`;
    if (!lb.open) lb.showModal();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".shot button");
    if (b) showLb(+b.dataset.g, +b.dataset.k);
  });
  lb.querySelector(".lightbox__close").addEventListener("click", () => lb.close());
  lb.querySelector(".lightbox__nav--prev").addEventListener("click", () => showLb(cur.g, cur.k - 1));
  lb.querySelector(".lightbox__nav--next").addEventListener("click", () => showLb(cur.g, cur.k + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showLb(cur.g, cur.k - 1);
    if (e.key === "ArrowRight") showLb(cur.g, cur.k + 1);
  });


  // ---------- 이야기로 읽기 ----------
  const rd = $("#reader"), rdBody = $("#rd-body"), rdScroll = $("#rd-scroll");
  const findShots = (id) => {
    const f = S.featured.find((p) => p.id === id);
    if (f) return f.shots || [];
    const o = S.others.find((x) => x.storyId === id);
    return (o && o.shots) || [];
  };
  const openStory = (id) => {
    const st = S.stories && S.stories[id];
    if (!st) return;
    const shots = findShots(id);
    $("#rd-title").textContent = st.name;
    rdBody.innerHTML = `<header class="rd-hero"><p class="eyebrow mono">${esc(st.meta)}</p><h2>${st.hook}</h2>${st.numbers ? `<ul class="rd-nums">${st.numbers.map((n) => `<li><b>${esc(n.v)}</b><span>${esc(n.l)}</span></li>`).join("")}</ul>` : ""}<p class="rd-hint mono">아래로 스크롤 ↓</p></header>` +
      st.chapters.map((c) => {
        const sh = c.shot != null ? shots[c.shot] : null;
        return `<section class="rd-ch"><p class="rd-label mono">${esc(c.label)}</p><h3>${esc(c.head)}</h3>${c.body.map((t) => `<p>${esc(t)}</p>`).join("")}${sh ? `<figure class="rd-fig"><img src="${esc(sh.src)}" alt="${esc(sh.caption)}" loading="lazy" /><figcaption>${esc(sh.caption)}</figcaption></figure>` : ""}</section>`;
      }).join("") +
      `<footer class="rd-tech"><p class="rd-label mono">TECH</p><div class="chips">${st.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div><button class="btn" type="button" id="rd-end">닫고 프로젝트로 돌아가기</button></footer>`;
    rd.showModal();
    rdScroll.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("rd-end").addEventListener("click", () => rd.close());
    onRd();
  };
  const onRd = () => {
    const m = rdScroll.scrollHeight - rdScroll.clientHeight;
    $("#rd-prog").style.width = (m > 0 ? (rdScroll.scrollTop / m) * 100 : 0) + "%";
    rdBody.querySelectorAll(".rd-ch,.rd-tech").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("is-in");
    });
  };
  rdScroll.addEventListener("scroll", onRd, { passive: true });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-story]");
    if (b) openStory(b.dataset.story);
  });
  $("#rd-close").addEventListener("click", () => rd.close());
  rd.addEventListener("close", () => rdScroll.scrollTo({ top: 0, behavior: "instant" }));

  // ---------- 모바일 메뉴 ----------
  const toggle = $("#nav-toggle");
  const navLinks = $("#nav-links");
  const setMenu = (open) => {
    navLinks.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  };
  toggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("is-open")));
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // ---------- 스크롤: 현재 섹션 강조 · 상단 진행 바 ----------
  const links = [...document.querySelectorAll(".nav__links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const bar = $("#progress");
  let ticking = false;
  const update = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = -1;
    sections.forEach((s, i) => {
      if (s && s.offsetTop <= y) current = i;
    });
    links.forEach((a, i) => a.classList.toggle("is-active", i === current));
    $("#nav").classList.toggle("nav--scrolled", window.scrollY > 10);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
