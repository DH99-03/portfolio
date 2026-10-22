// 문제 정의 방식: 6단계와 프로젝트별 적용 기록을 그린다. 홈(index.html)과 프로젝트 페이지(project.html)가 함께 쓴다.
(function () {
  const S = window.SITE;
  const P = S.process;
  if (!P) return;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tag = (st) => `<span class="pd-st pd-st--${esc(st)}">${esc(P.states[st] || st)}</span>`;

  // 1. 6단계 (각 단계: 묻는 것 · AI가 던지는 질문 · 내가 판단하는 것 · 남기는 결과물)
  const stepsHTML = () => `
    <ol class="pd-loop" aria-label="각 단계를 진행하는 방법">${P.loop.map((x, i) => `<li><span class="mono">${i + 1}</span>${esc(x)}</li>`).join("")}</ol>
    <div class="pd-stepper">
      <div class="pd-stepper__tabs" role="tablist" aria-label="문제 정의 6단계">${P.steps
        .map((s, i) => `<button type="button" role="tab" class="pd-stab" id="pd-stab-${i}" aria-selected="${i === 0}" aria-controls="pd-spanel" data-step="${i}"><span class="mono">0${i + 1}</span><b>${esc(s.name)}</b></button>`)
        .join("")}</div>
      <div class="pd-spanel" id="pd-spanel" role="tabpanel" aria-labelledby="pd-stab-0"></div>
    </div>
    <div class="pd-principles">${P.principles.map((x) => `<div class="pd-principle"><b>${esc(x.title)}</b><p>${esc(x.desc)}</p></div>`).join("")}</div>`;

  const panelHTML = (i) => {
    const s = P.steps[i];
    return `<p class="pd-spanel__q"><span class="mono">0${i + 1} · ${esc(s.name)}</span>${esc(s.q)}</p>
      <p class="pd-spanel__desc">${esc(s.desc)}</p>
      <dl class="pd-spanel__dl">
        <div><dt>AI가 묻는 것</dt><dd>${esc(s.ai)}</dd></div>
        <div><dt>내가 판단하는 것</dt><dd>${esc(s.me)}</dd></div>
        <div><dt>남기는 결과물</dt><dd>${esc(s.out)}</dd></div>
      </dl>
      <div class="pd-spanel__nav">${i > 0 ? `<button type="button" class="pd-snav" data-step="${i - 1}">← ${esc(P.steps[i - 1].name)}</button>` : "<span></span>"}${
        i < P.steps.length - 1 ? `<button type="button" class="pd-snav" data-step="${i + 1}">${esc(P.steps[i + 1].name)} →</button>` : ""
      }</div>`;
  };

  // 2 · 3. 프로젝트에 적용한 과정 + 결과물과 다음 검증
  const caseHTML = (c, opts) => {
    const f = S.featured.find((p) => p.id === c.id);
    return `<div class="pd-case" data-case="${esc(c.id)}">
      <p class="pd-case__ctx mono">${esc(c.context)}</p>
      <p class="pd-case__problem"><span>핵심 문제 문장</span>${esc(c.problem)}</p>
      <ol class="pd-chain">
        <li><span class="pd-chain__k">처음 생각</span><p>${esc(c.decision.start)}</p></li>
        <li><span class="pd-chain__k">검토하며 바뀐 것</span><p>${esc(c.decision.turn)}</p></li>
        <li class="is-key"><span class="pd-chain__k">나의 선택과 이유</span><p>${esc(c.decision.choice)}</p></li>
        <li><span class="pd-chain__k">결과물에 반영</span><p>${esc(c.decision.reflect)}</p></li>
      </ol>
      <div class="pd-track">
        <p class="pd-track__title">6단계 진행 기록</p>
        <ol>${c.steps
          .map((s, i) => `<li class="pd-track__row pd-track__row--${esc(s.state)}"><span class="pd-track__step"><span class="mono">0${i + 1}</span>${esc(P.steps[i].name)}</span>${tag(s.state)}<span class="pd-track__did">${esc(s.did)}</span></li>`)
          .join("")}</ol>
      </div>
      <div class="pd-next"><span class="pd-next__k">다음 검증</span><p>${esc(c.next)}</p>${
        opts && opts.link && f ? `<a class="pd-next__link" href="project.html?id=${esc(c.id)}">결과물(화면 · 기획 문서) 보기 →</a>` : ""
      }</div>
    </div>`;
  };

  const legend = () => `<p class="pd-legend">${["ok", "cond", "plan", "skip"].map(tag).join("")}</p>`;

  window.ProblemDef = {
    renderSteps(el) {
      el.innerHTML = stepsHTML();
      const panel = el.querySelector(".pd-spanel");
      const go = (i, focus) => {
        el.querySelectorAll(".pd-stab").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.step === i)));
        panel.setAttribute("aria-labelledby", "pd-stab-" + i);
        panel.innerHTML = panelHTML(i);
        if (focus) el.querySelector("#pd-stab-" + i).focus();
      };
      go(0);
      el.addEventListener("click", (e) => {
        const b = e.target.closest(".pd-stab, .pd-snav");
        if (b) go(+b.dataset.step, b.classList.contains("pd-snav"));
      });
      el.querySelector(".pd-stepper__tabs").addEventListener("keydown", (e) => {
        const cur = +el.querySelector('.pd-stab[aria-selected="true"]').dataset.step;
        if (e.key === "ArrowRight") { e.preventDefault(); go(Math.min(P.steps.length - 1, cur + 1), true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(Math.max(0, cur - 1), true); }
      });
    },
    renderCases(el, firstId) {
      const cases = P.cases;
      let cur = cases.find((c) => c.id === firstId) ? firstId : cases[0].id;
      const draw = () => {
        el.innerHTML = `<div class="pd-tabs" role="tablist" aria-label="프로젝트 선택">${cases
          .map((c) => `<button type="button" role="tab" class="pd-tab" aria-selected="${c.id === cur}" data-case="${esc(c.id)}">${esc(c.label)}</button>`)
          .join("")}</div>${legend()}${caseHTML(cases.find((c) => c.id === cur), { link: true })}`;
      };
      draw();
      el.addEventListener("click", (e) => {
        const b = e.target.closest(".pd-tab");
        if (!b || b.dataset.case === cur) return;
        cur = b.dataset.case;
        draw();
      });
      return { select: (id) => { if (cases.find((c) => c.id === id)) { cur = id; draw(); } } };
    },
    caseFor(id) {
      const c = P.cases.find((x) => x.id === id);
      return c ? `${legend()}${caseHTML(c, { link: false })}` : "";
    },
    hasCase: (id) => !!P.cases.find((x) => x.id === id),
  };
})();
