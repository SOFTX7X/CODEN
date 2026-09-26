const menuToggle = document.getElementById("mobileMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mobileMenu.hidden = open;
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    });
  });
}

const canvas = document.getElementById("codeRain");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const glyphs = "01<>[]{}()/;:=+*#@CODEN";
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let fontSize = 15;
  let columns = 0;
  let drops = [];
  let velocities = [];
  let rafId = 0;
  let lastFrame = 0;

  function resizeRain() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    fontSize = width <= 560 ? 12 : 15;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#030704";
    ctx.fillRect(0, 0, width, height);
    columns = Math.ceil(width / fontSize) + 1;
    drops = Array.from({ length: columns }, () => -Math.random() * (height / fontSize));
    velocities = Array.from({ length: columns }, () => 0.55 + Math.random() * 0.85);
    ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  }

  function drawRain(now) {
    if (reduceMotion) return;
    if (now - lastFrame < 42) {
      rafId = requestAnimationFrame(drawRain);
      return;
    }
    lastFrame = now;
    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.fillStyle = "rgba(3,7,4,0.12)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

    for (let i = 0; i < columns; i += 1) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const char = glyphs[Math.floor(Math.random() * glyphs.length)];

      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(85,255,136,.22)";
      ctx.fillStyle = Math.random() > 0.965 ? "#d8ffe3" : "rgba(85,255,136,.62)";
      ctx.fillText(char, x, y);
      ctx.shadowBlur = 0;

      drops[i] += velocities[i];
      if (y > height + fontSize * 2 && Math.random() > 0.975) {
        drops[i] = -Math.random() * 24;
        velocities[i] = 0.55 + Math.random() * 0.85;
      }
    }

    rafId = requestAnimationFrame(drawRain);
  }

  resizeRain();
  window.addEventListener("resize", resizeRain, { passive: true });

  if (reduceMotion) {
    ctx.fillStyle = "#030704";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  } else {
    rafId = requestAnimationFrame(drawRain);
  }
}
