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
  $("#hero-mail").href = `mailto:${S.email}`;
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

  // ---------- FEATURED ----------
  const list = (arr) => `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const roleList = (p) =>
    `<ul>${p.role
      .map((x, k) => {
        const kind = p.roleKind && p.roleKind[k];
        return `<li>${kind ? `<span class="kind ${kind === "직접 구현" ? "kind--do" : ""}">${esc(kind)}</span>` : ""}${esc(x)}</li>`;
      })
      .join("")}</ul>`;
  const renderFeatured = (order) => {
    galleries.length = 0;
    const items = order.map((id) => S.featured.find((p) => p.id === id)).filter(Boolean);
    $("#featured").innerHTML = items
      .map(
        (p, i) => `<article class="project reveal" id="p-${esc(p.id)}">
        <header class="project__head">
          <span class="project__index mono">0${i + 1}</span>
          <div>
            <p class="project__kicker mono">${esc(p.kicker)}</p>
            <h3 class="project__name">${esc(p.name)}</h3>
            <p class="project__one">${esc(p.oneLine)}</p>
          </div>
          ${p.award ? `<p class="badge"><span class="mono">Award</span>${esc(p.award)}</p>` : ""}
        </header>

        <div class="metrics">
          ${p.metrics
            .map((m) => `<div class="metric"><span class="metric__v">${esc(m.value)}</span><span class="metric__l">${esc(m.label)}</span></div>`)
            .join("")}
        </div>

        ${gallery(p.shots, p.name)}

        <div class="rows">
          <section class="row"><h4 class="label">문제</h4><div><p>${esc(p.problem)}</p></div></section>
          <section class="row"><h4 class="label">접근</h4><div>${list(p.approach)}</div></section>
          <section class="row row--role"><h4 class="label">내 역할</h4><div>${roleList(p)}</div></section>
        </div>

        <p class="honest"><b>한계</b>${esc(p.honest)}</p>

        <footer class="project__foot">
          ${S.stories && S.stories[p.id] ? `<button class="storybtn" type="button" data-story="${esc(p.id)}">이야기로 읽기 →</button>` : ""}
          <div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>
          ${p.link ? `<a class="link" href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)} ↗</a>` : ""}
        </footer>
      </article>`
      )
      .join("");
  };
  renderFeatured(S.featured.map((p) => p.id));

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
          ${o.storyId && S.stories && S.stories[o.storyId] ? `<button class="storybtn" type="button" data-story="${esc(o.storyId)}">이야기로 읽기 →</button>` : ""}
        </div>
        ${o.shots && o.shots.length ? `<details class="other__shots"><summary>화면 보기 (${o.shots.length})</summary>${gallery(o.shots, o.name)}</details>` : ""}
      </li>`
    )
    .join("");

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
    if (!first) {
      renderFeatured(r ? r.order : allOrder);
      document.querySelectorAll("#featured .reveal").forEach((el) => el.classList.add("is-in"));
    }
    try {
      const u = new URL(location.href);
      if (r) u.searchParams.set("role", r.id); else u.searchParams.delete("role");
      history.replaceState(null, "", u);
    } catch (e) {}
  };
  if (S.roles && S.roles.length) {
    rolesBox.innerHTML =
      `<span class="roles__label mono">읽는 관점</span>` +
      ROLES.map((r) => `<button type="button" class="rolebtn" data-role="${esc(r.id)}" aria-pressed="false">${esc(r.label)}</button>`).join("");
    rolesBox.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) setRole(b.dataset.role, false);
    });
    let initial = "all";
    try { initial = new URL(location.href).searchParams.get("role") || "all"; } catch (e) {}
    if (!ROLES.some((r) => r.id === initial)) initial = "all";
    setRole(initial, false);
  } else {
    rolesBox.hidden = true;
  }

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
