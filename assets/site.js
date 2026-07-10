// V5-1 공용 header/footer/모바일메뉴/스크롤 애니메이션. 페이지 3개가 이 스크립트 하나만 공유한다.
(function () {
  // FOUT 방지: 폰트 로드 전까지 헤더/푸터 숨김
  document.documentElement.classList.add('fonts-loading');
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
    document.documentElement.classList.remove('fonts-loading');
  });
  const HEADER_HTML = `
    <a href="index.html" class="brand"><img src="assets/images/logo.png" alt="SEED IT" class="brand-logo" /></a>
    <nav class="nav">
      <a href="index.html" data-key="home">홈</a>
      <a href="operations.html" data-key="ops">운영 시스템</a>
      <a href="case-studies.html" data-key="cases">운영 사례</a>
      <a href="contact.html" class="contact-link" data-key="contact">문의</a>
    </nav>
    <button class="mobile-toggle" id="mobileToggle" aria-label="메뉴 열기"><span></span></button>
  `;

  const MOBILE_HTML = `
    <a href="index.html" data-key="home">홈</a>
    <a href="operations.html" data-key="ops">운영 시스템</a>
    <a href="case-studies.html" data-key="cases">운영 사례</a>
    <a href="contact.html" data-key="contact">문의하기</a>
  `;

  const FOOTER_HTML = `
    <div class="wrap">
      <div>
        <img src="assets/images/logo.png" alt="SEED IT" class="footer-logo" />
        <p>농산물 공급망을 설계하고 현장에서 실행하는 SCM 운영사</p>
        <p style="margin-top:10px">031-321-2403 · contact@seed-it.co.kr</p>
      </div>
      <div class="footer-links">
        <a href="index.html">홈</a>
        <a href="about.html">회사 소개</a>
        <a href="operations.html">운영 시스템</a>
        <a href="case-studies.html">운영 사례</a>
        <a href="partnership.html">파트너십</a>
        <a href="contact.html">문의</a>
      </div>
    </div>
  `;

  function currentKey() {
    const path = location.pathname.replace(/\/$/, '');
    if (path.endsWith('operations.html')) return 'ops';
    if (path.endsWith('case-studies.html') || path.endsWith('case-studies-draft.html')) return 'cases';
    return 'home';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // iOS Safari autoplay fallback: 첫 터치 시 음소거 영상 일괄 재생
    document.addEventListener('touchstart', function iosPlay() {
      document.querySelectorAll('video[muted]').forEach(function(v) {
        v.play().catch(function(){});
      });
      document.removeEventListener('touchstart', iosPlay);
    }, { once: true, passive: true });

    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');
    if (headerSlot) headerSlot.innerHTML = HEADER_HTML;
    if (footerSlot) footerSlot.innerHTML = FOOTER_HTML;

    const mobilePanel = document.getElementById('mobilePanel');
    if (mobilePanel) mobilePanel.innerHTML = MOBILE_HTML;

    const key = currentKey();
    document.querySelectorAll('[data-key="' + key + '"]').forEach(function (el) {
      if (!el.classList.contains('contact-link')) el.classList.add('active');
    });

    const header = document.querySelector('.site-header');
    const noHeroPage = document.body.classList.contains('no-hero');
    if (header) {
      if (noHeroPage) header.classList.add('solid');
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 40);
      });

      // nav auto-theme: 섹션 배경에 따라 nav 텍스트 색 자동 전환
      function applyNavTheme(){
        var headerH = 72;
        var theme = 'dark';
        document.querySelectorAll('[data-nav-theme]').forEach(function(sec){
          var r = sec.getBoundingClientRect();
          if(r.top <= headerH && r.bottom > headerH / 2){
            theme = sec.getAttribute('data-nav-theme');
          }
        });
        header.classList.remove('nav-on-light','nav-on-dark');
        header.classList.add('nav-on-' + theme);
      }
      window.addEventListener('scroll', applyNavTheme, {passive:true});
      applyNavTheme();
    }

    const toggleBtn = document.getElementById('mobileToggle');
    if (toggleBtn && mobilePanel) {
      toggleBtn.addEventListener('click', function () {
        toggleBtn.classList.toggle('open');
        mobilePanel.classList.toggle('open');
      });
      mobilePanel.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggleBtn.classList.remove('open');
          mobilePanel.classList.remove('open');
        });
      });
    }

    // 히어로/서브히어로 타이틀·서브카피·버튼 리빌
    document.querySelectorAll('.hero, .sub-hero').forEach(function (hero) {
      window.setTimeout(function () { hero.classList.add('loaded'); }, 150);
    });

    // 히어로 영상: PC/모바일 분기 로드 (V2 방식 재사용)
    (function () {
      const v = document.getElementById('heroVideo');
      if (!v) return;
      const dSrc = v.getAttribute('data-src-desktop');
      const mSrc = v.getAttribute('data-src-mobile');
      // data-src 없으면 autoplay 속성에 완전히 맡김 (iOS 호환)
      if (!dSrc && !mSrc) { return; }
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      const chosen = isMobile ? (mSrc || dSrc) : (dSrc || mSrc);
      v.setAttribute('preload', 'auto');
      v.setAttribute('src', chosen);
      v.load();
      const p = v.play();
      if (p && p.catch) p.catch(function () {});
    })();

    // 섹션 fade-up / letter-spacing 정리 (폰트 로드 후 시작해 FOUT 방지)
    function initReveal() {
      // 일반 reveal (threshold 낮게)
      const revealEls = document.querySelectorAll('.reveal');
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });

      // reveal-tracking: 섹션이 충분히 들어왔을 때 트리거
      const trackingEls = document.querySelectorAll('.reveal-tracking');
      const iot = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            iot.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      trackingEls.forEach(function (el) { iot.observe(el); });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initReveal);
    } else {
      initReveal();
    }

    // 스태거 그룹
    const staggerEls = document.querySelectorAll('.stagger');
    const so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          so.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    staggerEls.forEach(function (el) { so.observe(el); });

    // 가로형 flow 패널(트랙 채워짐 + 점 순차 등장)
    const flowWraps = document.querySelectorAll('.flow-track-wrap');
    const fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          fo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    flowWraps.forEach(function (el) { fo.observe(el); });

    // 세로형 프로세스 타임라인
    const pvLines = document.querySelectorAll('.pv-line');
    const po = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          po.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    pvLines.forEach(function (el) { po.observe(el); });

    // 세로/대각선 zigzag flow (SEED IT 페이지 전용)
    const zigzagFlows = document.querySelectorAll('.zigzag-flow');
    const zo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          zo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    zigzagFlows.forEach(function (el) { zo.observe(el); });

    // 거점 연결선: 진입 시 천천히 그려지는 draw 애니메이션
    const drawPaths = document.querySelectorAll('.draw-path');
    drawPaths.forEach(function (path) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset 2.4s ' + 'cubic-bezier(.19,1,.22,1)';
    });
    const hubWrap = document.querySelector('.hub-map-wrap');
    if (hubWrap && drawPaths.length) {
      const ho = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            drawPaths.forEach(function (path) { path.style.strokeDashoffset = 0; });
            ho.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      ho.observe(hubWrap);
    }

    // 카운트업 숫자
    function animateCount(el) {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      const duration = 1600;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.firstChild.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.firstChild.textContent = target;
      }
      requestAnimationFrame(step);
    }
    const countEls = document.querySelectorAll('.numbers-val[data-count]');
    const no = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          no.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    countEls.forEach(function (el) { no.observe(el); });

    // fit-orbit: 폰트 로드 후 진입 시 active 클래스 추가 (FOUT 방지)
    function initOrbit() {
      var orbitEls = document.querySelectorAll('.fit-orbit');
      if (!orbitEls.length) return;
      var oo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            oo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      orbitEls.forEach(function (el) { oo.observe(el); });
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initOrbit);
    } else {
      initOrbit();
    }
  });

  // ── sec-timeflow 배경 영상 A/B 크로스페이드 루프 ──
  (function(){
    var va = document.querySelector('.tfv-a');
    var vb = document.querySelector('.tfv-b');
    if(!va || !vb) return;
    var active = va, next = vb;
    function startVideo(v){ v.play().catch(function(){}); }
    // autoplay 속성으로 시작 후 timeupdate 감지
    active.addEventListener('timeupdate', function onUpdate(){
      if(active.duration && active.currentTime >= active.duration - 1.8){
        active.removeEventListener('timeupdate', onUpdate);
        startVideo(next);
        next.style.opacity = '1';
        active.style.opacity = '0';
        setTimeout(function(){
          var tmp = active; active = next; next = tmp;
          next.style.opacity = '0';
          active.addEventListener('timeupdate', onUpdate);
        }, 1800);
      }
    });
  })();

})();