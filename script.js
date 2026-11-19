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
})();
