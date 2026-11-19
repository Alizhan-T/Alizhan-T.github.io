(() => {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("portfolio-theme");

  function setTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      if (toggleBtn) toggleBtn.textContent = "🌙";
    } else {
      root.removeAttribute("data-theme");
      if (toggleBtn) toggleBtn.textContent = "☀️";
    }
  }

  setTheme(savedTheme === "light" ? "light" : "dark");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      setTheme(nextTheme);
      localStorage.setItem("portfolio-theme", nextTheme);
    });
  }

  // Category filter for Featured Projects
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll("#featured .card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        const visible = filter === "all" || category === filter;
        card.classList.toggle("hidden", !visible);
      });
    });
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Interactive monochrome ASCII eye tracking the real mouse cursor
  const eyeEl = document.getElementById("ascii-eye");
  const eyeFrame = document.getElementById("eye-frame");

  if (eyeEl && eyeFrame) {
    const COLS = 70;
    const ROWS = 20;
    const CX = (COLS - 1) / 2;
    const CY = (ROWS - 1) / 2;
    const AX = 26.5;
    const AY = 7.8;
    const RAMP = " .',;:clodxk0KXNWM";

    let targetX = 0;
    let targetY = 0;
    let gazeX = 0;
    let gazeY = 0;
    let blink = 0;
    let blinkDir = 0;

    function triggerBlink() {
      if (blinkDir === 0) blinkDir = 1;
    }

    eyeFrame.addEventListener("click", triggerBlink);

    window.addEventListener("pointermove", (e) => {
      const rect = eyeFrame.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const maxDist = Math.max(window.innerWidth * 0.45, 320);
      const normX = Math.max(-1, Math.min(1, dx / maxDist));
      const normY = Math.max(-1, Math.min(1, dy / (maxDist * 0.65)));
      targetX = normX * 9.5;
      targetY = normY * 2.4;
    });

    function scheduleBlink() {
      const delay = 3600 + Math.random() * 3800;
      setTimeout(() => {
        triggerBlink();
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();

    function renderEye() {
      gazeX += (targetX - gazeX) * 0.14;
      gazeY += (targetY - gazeY) * 0.14;

      if (blinkDir === 1) {
        blink += 0.22;
        if (blink >= 1) {
          blink = 1;
          blinkDir = -1;
        }
      } else if (blinkDir === -1) {
        blink -= 0.16;
        if (blink <= 0) {
          blink = 0;
          blinkDir = 0;
        }
      }

      const openFactor = 1 - blink * 0.96;
      const lines = new Array(ROWS);

      for (let r = 0; r < ROWS; r++) {
        const dy = (r - CY) / AY;
        let row = "";

        for (let c = 0; c < COLS; c++) {
          const dx = (c - CX) / AX;
          let ch = " ";

          if (Math.abs(dx) <= 1.18) {
            const lidY = Math.max(0, 1 - Math.pow(dx / 1.02, 2)) * 0.88 * openFactor;
            const distFromLid = Math.abs(dy) - lidY;

            if (Math.abs(dx) <= 1.0 && Math.abs(dy) < lidY) {
              // Inside open eye: compute distance to moving iris center
              const ix = (c - (CX + gazeX)) * 0.56;
              const iy = r - (CY + gazeY);
              const dist = Math.hypot(ix, iy);
              const catchDist = Math.hypot(ix - 1.5, iy + 1.1);

              if (catchDist < 0.95 && dist < 4.5) {
                ch = catchDist < 0.5 ? "@" : "o";
              } else if (dist < 1.75) {
                ch = dist > 1.45 ? "." : " ";
              } else if (dist < 4.5) {
                const angle = Math.atan2(iy, ix);
                const fiber = 0.5 + 0.5 * Math.cos(angle * 10);
                const ring = 0.65 + 0.35 * Math.abs((dist - 1.75) / 2.75 - 0.45) * 1.6;
                const val = Math.min(1, ring * (0.74 + 0.26 * fiber));
                const idx = Math.max(6, Math.min(RAMP.length - 1, Math.floor(val * (RAMP.length - 1))));
                ch = RAMP[idx];
              } else if (Math.abs(dx) > 0.66) {
                const shade = Math.pow((Math.abs(dx) - 0.66) / 0.34, 1.5) * 0.52;
                ch = shade >= 0.1 ? RAMP[Math.min(RAMP.length - 1, Math.floor(shade * 11))] : " ";
              }
            } else {
              let val = 0;
              if (Math.abs(dx) > 1.0) {
                const dCorner = Math.hypot((Math.abs(dx) - 0.98) * 3.6, dy * 2.1);
                val = Math.max(0, 0.68 - dCorner * 0.85);
              } else {
                const upperBoost = dy < 0 ? 1.15 : 0.85;
                const crease =
                  dy < 0 && distFromLid > 0.18 && distFromLid < 0.42
                    ? 0.22 * (1 - Math.pow(Math.abs(dx), 1.6))
                    : 0;
                val = Math.max(0, (0.74 - distFromLid * 1.42) * upperBoost + crease);
                val *= Math.max(0, 1 - Math.pow(Math.abs(dx) / 1.15, 4));
              }
              if (val >= 0.07) {
                ch = RAMP[Math.min(RAMP.length - 1, Math.floor(val * (RAMP.length - 1)))];
              }
            }
          }
          row += ch;
        }
        lines[r] = row;
      }

      eyeEl.textContent = lines.join("\n");
      requestAnimationFrame(renderEye);
    }

    renderEye();
  }
})();
