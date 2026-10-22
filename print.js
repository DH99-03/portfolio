// 인쇄본 만들기: data.js(window.SITE)만 읽어서 A4 가로 페이지를 그립니다.
(function () {
  const S = window.SITE;
  const q = new URLSearchParams(location.search);
  const doc = q.get("doc") || "portfolio";
  const role = (S.roles || []).find((r) => r.id === q.get("role")) || null;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const byId = (id) => S.featured.find((p) => p.id === id);
  const order = role ? role.order : S.featured.map((p) => p.id);
  const picks = order.map(byId).filter(Boolean);
  const projName = (() => { if (doc !== "project") return null; const id = q.get("id"); const f = byId(id); const o = S.others.find((x) => x.storyId === id); return (f && f.name) || (o && o.name) || null; })();
  const roleLabel = projName || (role ? role.label : "전체");
  const docName = { onepager: "원페이저", portfolio: "포트폴리오", project: "프로젝트 상세" }[doc] || "포트폴리오";

  const pages = [];
  const page = (cls, inner, top) =>
    pages.push(`<section class="page ${cls || ""}">${top ? `<header class="pg-top"><span class="mono">${esc(top[0])}</span><span>${esc(top[1] || "")}</span></header>` : ""}${inner}</section>`);

  const headline = () => {
    const w = S.headline.trim().split(/\s+/);
    const last = w.pop();
    return `${w.map(esc).join(" ")}<br><em>${esc(last)}</em>`;
  };
  const contact = () => `<div class="contact"><b>${esc(S.email)}</b><span>${esc(S.github.replace(/^https?:\/\//, ""))}</span><span>dh99-03.github.io/portfolio</span></div>`;
  const photo = () => `<div class="photo"><img src="${esc(S.photo)}" alt="${esc(S.name)} 사진" /></div>`;
  const kindTag = (k) => (k ? `<span class="kind ${k === "직접 구현" ? "kind--do" : ""}">${esc(k)}</span>` : "");
  const share = (p) => (p.facts && p.facts.share ? `<span class="share"><i style="width:${parseInt(p.facts.share, 10) || 0}%"></i></span>${esc(p.facts.share)}` : "");

  // ---------- 페이지 조각 ----------
  const coverPage = () => {
    const sub = role ? role.subline : S.subline;
    const intro = role ? role.intro : S.intro;
    const proof = role ? role.proof : [];
    page(
      "",
      `<div class="cover">
        <div class="cover__main">
          <span class="cover__role">${role ? `${esc(role.label)} 직무 포트폴리오` : "포트폴리오 전체판"}</span>
          <h1 class="cover__head">${headline()}</h1>
          <p class="cover__sub">${esc(sub)}</p>
          <p class="cover__intro">${esc(intro)}</p>
          ${proof.length ? `<ul class="cover__proof dash">${proof.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
          <div class="stats cover__stats">${S.stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}<br>${esc(s.note)}</span></div>`).join("")}</div>
          <ol class="toc">
            ${picks
              .slice(0, 3)
              .map((p, i) => `<li><span class="mono">0${i + 1}</span><b>${esc(p.name)}</b>${esc(p.kicker)}</li>`)
              .join("")}
            <li><span class="mono">+</span><b>일하는 방식 · 기록</b>AI 협업 개발 · 수상 · 자격</li>
          </ol>
        </div>
        <aside class="cover__side">${photo()}<div><p class="op__name">${esc(S.name)}<small>${esc(S.nameEn)}</small></p></div>${contact()}</aside>
      </div>`
    );
  };

  const glancePage = () => {
    const SK = `<p class="sub" style="margin-top:20px">기술</p>
          <div class="skills">${S.skills.map((g) => `<div><span class="mono">${esc(g.group)}</span><div class="chips">${g.items.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div></div>`).join("")}</div>`;
    page(
      "",
      `<div class="glance${picks.length > 3 ? " glance--compact" : ""}">
        <div>
          <p class="eyebrow">한눈에 보기</p>
          <h2 class="h-page">${role ? `${esc(role.label)} 직무에서 먼저 볼 것` : "프로젝트 한눈에"}</h2>
          <div style="height:14px"></div>
          ${picks
            .map(
              (p, i) => `<div class="pickrow"><span class="mono">0${i + 1}</span><b>${esc(p.name)}</b><span class="num">${esc(p.metrics[0].value)} ${esc(p.metrics[0].label)}</span><p>${picks.length > 3 ? "" : esc(p.oneLine) + " · "}${p.facts ? `${esc(p.facts.period)} · ${esc(p.facts.team)}${p.facts.share ? ` · 기여 ${esc(p.facts.share)}` : ""}` : ""}</p></div>`
            )
            .join("")}
          ${picks.length > 3 ? "" : SK}
        </div>
        <div>
          <p class="sub">성장 과정</p>
          <ol class="tl">${S.timeline.map((t) => `<li><span class="mono">${esc(t.period)}</span><div><b>${esc(t.title)}</b><p>${esc(t.desc)}</p></div></li>`).join("")}</ol>
          ${picks.length > 3 ? SK : ""}
        </div>
      </div>`,
      ["권동현 · " + roleLabel, docName]
    );
  };

  const projHead = (p, i) => `<div class="proj-head">
      <div>
        <p class="kicker">${i != null ? `PROJECT 0${i + 1} · ` : ""}${esc(p.kicker)}</p>
        <h2>${esc(p.name)}</h2>
        <p class="one">${esc(p.oneLine)}</p>
      </div>
      ${p.award ? `<p class="award"><span class="mono">Award</span>${esc(p.award)}</p>` : ""}
    </div>
    ${p.facts ? `<dl class="facts">
      <div><dt>기간</dt><dd>${esc(p.facts.period)}</dd></div>
      <div><dt>팀</dt><dd>${esc(p.facts.team)}</dd></div>
      ${p.facts.share ? `<div><dt>내 기여</dt><dd>${share(p)}</dd></div>` : ""}
      <div class="grow"><dt>맡은 일</dt><dd>${esc(p.facts.role)}</dd></div>
      ${p.live ? `<div><dt>직접 써 보기</dt><dd class="mono">${esc(p.live.url.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</dd></div>` : ""}
    </dl>` : ""}`;

  const projectA = (p, i) => {
    page(
      "",
      `${projHead(p, i)}
      <div class="metrics">${p.metrics.map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span>${m.basis ? `<em class="basis basis--${m.state === "ok" ? "ok" : "cond"}">${m.state === "ok" ? "확인함" : "조건부"} · ${esc(m.basis)}</em>` : ""}</div>`).join("")}</div>
      <div class="rows">
        <div class="row"><span class="label">문제</span><p>${esc(p.problem)}</p></div>
        <div class="row"><span class="label">접근</span><ul class="dash">${p.approach.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="row row--role"><span class="label">내 역할</span><ul>${p.role.map((x, k) => `<li>${kindTag(p.roleKind && p.roleKind[k])}${esc(x)}</li>`).join("")}</ul></div>
      </div>
      <p class="honest"><b>한계</b>${esc(p.honest)}</p>
      <div class="chips" style="margin-top:10px">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>`,
      ["권동현 · " + roleLabel, docName]
    );
  };

  const shotsGrid = (shots, max, phone) => {
    const list = (shots || []).slice(0, max || 4);
    return `<div class="shots ${phone ? "shots--phone" : `shots--${list.length}`}">${list
      .map((s) => `<figure><div class="frame"><img src="${esc(s.src)}" alt="${esc(s.caption)}" /></div><figcaption>${esc(s.caption)}</figcaption></figure>`)
      .join("")}</div>`;
  };

  const projectB = (p, i) => {
    page(
      "",
      `<p class="eyebrow">${i != null ? `PROJECT 0${i + 1} · ` : ""}화면</p>
      <h2 class="h-page" style="margin:2px 0 14px">${esc(p.name)}</h2>
      ${shotsGrid(p.shots, 4, p.phone)}
      ${p.live || p.link ? `<div class="shots-foot"><span></span><span class="live">${esc((p.live || p.link).label)} → ${esc((p.live || p.link).url)}</span></div>` : ""}`,
      ["권동현 · " + roleLabel, docName]
    );
  };

  const storyPages = (st, label) => {
    const ch = st.chapters || [];
    const per = 4;
    for (let k = 0; k < ch.length; k += per) {
      page(
        "",
        `<p class="eyebrow">${esc(st.meta)}</p>
        <h2 class="h-page" style="margin:2px 0 14px">${k === 0 ? strip(st.hook) : esc(st.name) + " · 이어서"}</h2>
        <div class="chapters">${ch
          .slice(k, k + per)
          .map((c) => `<article class="chapter"><span class="mono">${esc(c.label)}</span><b>${esc(c.head)}</b>${c.body.map((b) => `<p>${esc(b)}</p>`).join("")}</article>`)
          .join("")}</div>`,
        [label, "프로젝트 이야기"]
      );
    }
  };

  const howPage = () => {
    const V = S.vibe;
    page(
      "",
      `<p class="eyebrow">일하는 방식</p>
      <h2 class="h-page">모르면 배워서 끝까지, 그리고 AI와 함께 만드는 법</h2>
      <p class="lead" style="margin-top:6px;max-width:860px">${esc(V.thesis)}</p>
      <div class="pillars">${V.pillars.map((x, i) => `<div class="pillar"><span class="mono">0${i + 1}</span><b>${esc(x.name)}</b><p>${esc(x.desc)}</p></div>`).join("")}</div>
      <ol class="flow">${V.flow.map((f, i) => `<li><span class="mono">${i + 1}</span><b>${esc(f.step)}</b><span>${esc(f.skill)}</span></li>`).join("")}</ol>
      <div class="scenes">${S.scenes
        .map(
          (s) => `<div class="scene"><span class="mono">${esc(s.year)}</span><b>${esc(s.where)}</b><dl><dt>모름</dt><dd>${esc(s.unknown)}</dd><dt>배움</dt><dd>${esc(s.learned)}</dd><dt>끝냄</dt><dd class="done">${esc(s.done)}</dd></dl></div>`
        )
        .join("")}</div>
      <ul class="rules">${V.lessons.map((l) => `<li><b>${esc(l.rule)}</b>${esc(l.what)}</li>`).join("")}</ul>`,
      ["권동현 · " + roleLabel, docName]
    );
  };

  const recordPage = () => {
    const ACT = `<p class="sub">사람을 묶어 본 경험</p>
          <ul class="list">${S.activities.map((a) => `<li><span class="mono">${esc(a.period.split(" – ")[0])}</span><div><b>${esc(a.title)}</b><p>${esc(a.desc)}</p></div></li>`).join("")}</ul>`;
    const rest = S.featured.filter((p) => !picks.slice(0, 3).includes(p) || !role);
    const restRows = role ? S.featured.filter((p) => !role.order.includes(p.id)) : [];
    page(
      "",
      `<div class="record">
        <div>
          <p class="sub">${role ? "그 외 프로젝트" : "그 외 프로젝트"}</p>
          <ul class="list">
            ${restRows.map((p) => `<li><span class="mono">${esc(p.facts ? p.facts.period : "")}</span><div><b>${esc(p.name)}</b><p>${esc(p.oneLine)} · ${esc(p.metrics[0].value)} ${esc(p.metrics[0].label)}</p></div></li>`).join("")}
            ${S.others.map((o) => `<li><span class="mono">${esc(o.when.split(" · ")[0])}</span><div><b>${esc(o.name)}</b><p>${esc(o.desc)} · ${esc(o.note)}</p></div></li>`).join("")}
          </ul>
          ${role ? "" : ACT}
        </div>
        <div>
          <p class="sub">수상</p>
          <ul class="list">${S.awards.map((a) => `<li><span class="mono">${esc(a.date)}</span><div><b>${esc(a.title)}</b><p>${esc(a.org)} · ${esc(a.project)}</p></div></li>`).join("")}</ul>
          <p class="sub">자격 · 어학</p>
          <ul class="certs">${S.certs.map((c) => `<li><b>${esc(c.name)}</b><span class="mono">${esc(c.date)}</span><span>${esc(c.org)}</span></li>`).join("")}</ul>
          ${role ? ACT : ""}
        </div>
      </div>
      <div class="closing"><h3>처음인 일도,<br>끝까지 해내겠습니다.</h3>${contact()}</div>`,
      ["권동현 · " + roleLabel, docName]
    );
    void rest;
  };

  const onePager = () => {
    const three = picks.slice(0, 3);
    page(
      "",
      `<div class="op">
        <aside class="op__side">
          <div class="op__id">${photo()}<p class="op__name">${esc(S.name)}<small>${esc(S.nameEn)} · ${esc(roleLabel)}</small></p></div>
          <p class="op__head">${esc(role ? role.subline : S.subline)}</p>
          <p class="op__intro">${esc(role ? role.intro : S.intro)}</p>
          <div class="op__block"><span class="label">수상</span><div class="two">${S.awards.map((a) => `<span>${esc(a.date)}</span><span>${esc(a.title.replace(" 프로젝트", ""))}</span>`).join("")}</div></div>
          <div class="op__block"><span class="label">자격 · 어학</span><div class="two">${S.certs.map((c) => `<span>${esc(c.date)}</span><span>${esc(c.name)}</span>`).join("")}</div></div>
          <div class="op__block"><span class="label">교육</span><div class="two">${S.timeline
            .filter((t) => /교육|SCHOOL|JUMP|대학교/.test(t.title))
            .map((t) => `<span>${esc(t.period.split(" – ")[0])}</span><span>${esc(t.title)}</span>`)
            .join("")}</div></div>
          <div class="op__block" style="margin-top:auto">${contact()}</div>
        </aside>
        <div class="op__main">
          <span class="label">${role ? esc(role.label) + " 직무 대표 프로젝트" : "대표 프로젝트"}</span>
          ${three
            .map(
              (p, i) => `<article class="opp">
              <div>
                <div class="opp__head"><span class="mono">0${i + 1}</span><b>${esc(p.name)}</b><span>${esc(p.facts ? `${p.facts.period} · ${p.facts.team}${p.facts.share ? ` · 기여 ${p.facts.share}` : ""}` : p.kicker)}</span></div>
                <p class="opp__one">${esc(p.oneLine)}</p>
                <div class="opp__nums">${p.metrics.slice(0, 3).map((m) => `<div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>
                <ul class="opp__role dash">${p.role.slice(0, 2).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
              </div>
              <div class="opp__thumb">${p.shots && p.shots[0] ? `<img src="${esc(p.shots[0].src)}" alt="${esc(p.shots[0].caption)}" />` : ""}</div>
            </article>`
            )
            .join("")}
        </div>
      </div>`
    );
  };


  // 문제 정의 방식 (6단계) + 적용 사례 한 건
  const pdTag = (st) => `<span class="pdst pdst--${st}">${esc(S.process.states[st])}</span>`;
  const pdCasePage = (c, label) => {
    page(
      "",
      `<p class="eyebrow">문제 정의 과정 · ${esc(c.label)}</p>
      <p class="pdp-problem"><span>핵심 문제 문장</span>${esc(c.problem)}</p>
      <ol class="pdp-chain">
        <li><b>처음 생각</b><p>${esc(c.decision.start)}</p></li>
        <li><b>검토하며 바뀐 것</b><p>${esc(c.decision.turn)}</p></li>
        <li class="key"><b>나의 선택과 이유</b><p>${esc(c.decision.choice)}</p></li>
        <li><b>결과물에 반영</b><p>${esc(c.decision.reflect)}</p></li>
      </ol>
      <ol class="pdp-track">${c.steps.map((s, i) => `<li><span class="n mono">0${i + 1}</span><b>${esc(S.process.steps[i].name)}</b>${pdTag(s.state)}<span class="d">${esc(s.did)}</span></li>`).join("")}</ol>
      <p class="pdp-next"><b>다음 검증</b>${esc(c.next)}</p>`,
      [label, docName]
    );
  };
  const pdMethodPage = () => {
    const P = S.process;
    page(
      "",
      `<p class="eyebrow">문제 정의 방식</p>
      <h2 class="h-page">불편을 근거 있는 문제와 검증 가능한 가설로</h2>
      <p class="lead" style="margin-top:4px">${esc(P.lead)} 각 단계는 <b>${P.loop.map(esc).join(" → ")}</b> 순서의 문답으로 진행합니다.</p>
      <ol class="pdp-steps">${P.steps
        .map((s, i) => `<li><span class="mono">0${i + 1}</span><b>${esc(s.name)}</b><p class="q">${esc(s.q)}</p><dl><dt>AI가 묻는 것</dt><dd>${esc(s.ai)}</dd><dt>내가 판단하는 것</dt><dd>${esc(s.me)}</dd><dt>남기는 결과물</dt><dd>${esc(s.out)}</dd></dl></li>`)
        .join("")}</ol>
      <div class="pdp-princ">${P.principles.map((x) => `<div><b>${esc(x.title)}</b><p>${esc(x.desc)}</p></div>`).join("")}</div>
      <p class="pdp-after">${esc(P.after)}</p>`,
      ["권동현 · " + roleLabel, docName]
    );
  };
  // ---------- 문서 조립 ----------
  if (doc === "onepager") {
    onePager();
  } else if (doc === "project") {
    const id = q.get("id");
    const p = byId(id);
    const st = S.stories && S.stories[id];
    if (p) {
      projectA(p, null);
      const pc = S.process && S.process.cases.find((c) => c.id === id);
      if (pc) pdCasePage(pc, "권동현 · " + p.name);
      projectB(p, null);
      if (st) storyPages(st, "권동현 · " + p.name);
    } else {
      const o = S.others.find((x) => x.storyId === id);
      if (o && st) {
        page(
          "",
          `<div class="proj-head"><div><p class="kicker">${esc(o.when)}</p><h2>${esc(o.name)}</h2><p class="one">${esc(o.desc)}</p></div><p class="award"><span class="mono">Note</span>${esc(o.note)}</p></div>
          <div style="height:16px"></div>${shotsGrid(o.shots, 4)}
          <div class="shots-foot"><div class="chips">${(st.tech || []).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></div>`,
          ["권동현 · " + o.name, docName]
        );
        storyPages(st, "권동현 · " + o.name);
      }
    }
  } else {
    coverPage();
    glancePage();
    if (S.process) {
      pdMethodPage();
      const pc = S.process.cases.find((c) => picks.slice(0, 3).some((p) => p.id === c.id)) || S.process.cases[0];
      pdCasePage(pc, "권동현 · " + roleLabel);
    }
    picks.forEach((p, i) => {
      projectA(p, i);
      projectB(p, i);
    });
    howPage();
    recordPage();
  }

  const out = document.getElementById("doc");
  out.innerHTML = pages.join("");
  const all = out.querySelectorAll(".page");
  all.forEach((pg, k) => {
    const f = document.createElement("footer");
    f.className = "pg-foot";
    f.innerHTML = `<span>${esc(S.name)} · ${esc(roleLabel)} ${esc(docName)}</span><span class="mono">${k + 1} / ${all.length}</span>`;
    pg.appendChild(f);
  });
  document.title = `${S.name} · ${roleLabel} ${docName}`;
})();
