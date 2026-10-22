// 프로젝트 페이지: project.html?id=rokets 처럼 주소의 id로 data.js에서 프로젝트 하나를 그린다.
(function () {
  const S = window.SITE;
  const PS = window.ProjectScenes;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const id = new URLSearchParams(location.search).get("id");
  const main = document.getElementById("pp");
  const f = S.featured.find((p) => p.id === id);
  const o = S.others.find((x) => x.storyId === id);
  const st = S.stories && S.stories[id];
  const pdf = (S.pdf.projects || []).find((x) => x.id === id);

  if (!f && !(o && st)) {
    main.innerHTML = `<section class="pp-hero"><p class="eyebrow mono">404</p><h1 class="pp-name">프로젝트를 찾지 못했습니다</h1><p class="pp-one">주소의 id를 확인해 주세요. <a class="ps-full" href="index.html#projects">모든 프로젝트로 →</a></p></section>`;
    return;
  }

  // 같은 줄의 프로젝트 순서: 대표 프로젝트 → 이야기가 있는 그 외 프로젝트
  const all = [
    ...S.featured.map((p) => ({ id: p.id, name: p.name })),
    ...S.others.filter((x) => x.storyId && S.stories[x.storyId]).map((x) => ({ id: x.storyId, name: x.name })),
  ];
  const idx = all.findIndex((x) => x.id === id);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  const name = f ? f.name : o.name;
  const shots = (f ? f.shots : o.shots) || [];
  document.title = `${name} · 권동현 포트폴리오`;
  if (f && f.palette) {
    PS.ensureTextures();
    PS.apply(f.palette);
  }

  const actions = `<div class="pp-actions">
      ${f && f.live ? `<a class="btn btn--primary" href="${esc(f.live.url)}" target="_blank" rel="noopener">${esc(f.live.label)} ↗</a>` : ""}
      ${f && f.link ? `<a class="btn" href="${esc(f.link.url)}" target="_blank" rel="noopener">${esc(f.link.label)} ↗</a>` : ""}
      ${pdf ? `<a class="btn" href="pdf/프로젝트/권동현_${esc(pdf.file)}.pdf" download>이 프로젝트 PDF</a>` : ""}
    </div>`;

  const hero = f
    ? `<section class="pp-hero">
        <p class="pp-kicker mono">${esc(f.kicker)}</p>
        <h1 class="pp-name">${esc(f.name)}</h1>
        <p class="pp-one">${esc(f.oneLine)}</p>
        ${f.award ? `<p class="pp-award"><span class="mono">수상</span>${esc(f.award)}</p>` : ""}
        ${PS.factsHTML(f)}
        ${f.facts && f.facts.role ? `<p class="pp-role"><span>맡은 일</span>${esc(f.facts.role)}</p>` : ""}
        ${actions}
      </section>
      <section class="pp-sec">${PS.metricsHTML(f)}</section>
      <section class="pp-sec rows">
        <div class="row"><h2 class="label">문제</h2><div><p>${esc(f.problem)}</p></div></div>
        <div class="row"><h2 class="label">접근</h2><div><ul>${f.approach.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
        <div class="row row--role"><h2 class="label">내 역할</h2><div><ul>${f.role.map((x, k) => `<li>${f.roleKind && f.roleKind[k] ? `<span class="kind ${f.roleKind[k] === "직접 구현" ? "kind--do" : ""}">${esc(f.roleKind[k])}</span>` : ""}${esc(x)}</li>`).join("")}</ul></div></div>
      </section>
      <p class="honest pp-honest"><b>한계</b>${esc(f.honest)}</p>`
    : `<section class="pp-hero">
        <p class="pp-kicker mono">${esc(o.when)}</p>
        <h1 class="pp-name">${esc(o.name)}</h1>
        <p class="pp-one">${esc(o.desc)}</p>
        <p class="pp-award"><span class="mono">기록</span>${esc(o.note)}</p>
        ${actions}
      </section>`;

  const gallery = shots.length
    ? `<section class="pp-sec">
        <h2 class="pp-h2">화면 <span class="mono">${shots.length}</span></h2>
        <div class="pp-gallery${f && f.phone ? " pp-gallery--phone" : ""}">${shots
          .map((sh, k) => `<figure><button class="pp-shot" type="button" data-src="${esc(sh.src)}" data-cap="${esc(name + " · " + sh.caption)}" aria-label="${esc(sh.caption)} 크게 보기"><img src="${esc(sh.src)}" alt="${esc(name)} · ${esc(sh.caption)}" loading="lazy" /></button><figcaption><span class="mono">0${k + 1}</span>${esc(sh.caption)}</figcaption></figure>`)
          .join("")}</div>
      </section>`
    : "";

  const story = st
    ? `<section class="pp-sec pp-story">
        <p class="eyebrow mono">${esc(st.meta)}</p>
        <h2 class="pp-hook">${st.hook}</h2>
        ${st.numbers ? `<ul class="pp-storynums">${st.numbers.map((n) => `<li><b>${esc(n.v)}</b><span>${esc(n.l)}</span></li>`).join("")}</ul>` : ""}
        <div class="pp-chapters">${st.chapters
          .map(
            (c) => `<article class="pp-ch">
              <p class="pp-ch__label mono">${esc(c.label)}</p>
              <div><h3>${esc(c.head)}</h3>${c.body.map((b) => `<p>${esc(b)}</p>`).join("")}${
                c.shot != null && shots[c.shot] ? `<button class="pp-shot pp-ch__fig" type="button" data-src="${esc(shots[c.shot].src)}" data-cap="${esc(name + " · " + shots[c.shot].caption)}"><img src="${esc(shots[c.shot].src)}" alt="${esc(shots[c.shot].caption)}" loading="lazy" /></button>` : ""
              }</div>
            </article>`
          )
          .join("")}</div>
      </section>`
    : "";

  const stack = (f ? f.stack : st && st.tech) || [];
  main.innerHTML =
    hero +
    gallery +
    story +
    (stack.length ? `<section class="pp-sec"><h2 class="pp-h2">쓴 기술</h2><div class="chips">${stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></section>` : "") +
    `<nav class="pp-pager" aria-label="다른 프로젝트">
      <a href="project.html?id=${esc(prev.id)}"><span class="mono">← 이전</span><b>${esc(prev.name)}</b></a>
      <a href="index.html#projects" class="pp-pager__home"><span class="mono">전체</span><b>모든 프로젝트</b></a>
      <a href="project.html?id=${esc(next.id)}"><span class="mono">다음 →</span><b>${esc(next.name)}</b></a>
    </nav>`;

  main.querySelectorAll(".ps-num__v").forEach(PS.countUp);
})();
