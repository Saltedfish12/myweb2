/* =========================================================
   林墨 · 个人作品集
   原生 JavaScript，无任何外部依赖。
   模块顺序：工具 → 导航 → 滚动体验 → 作品筛选/弹窗 → 联系 → 时钟
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 00. 工具与全局状态 ---------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const desktopQuery = window.matchMedia("(min-width: 901px)");

  const toast = $("#toast");
  let toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function lockScroll(lock) {
    document.body.classList.toggle("menu-open", lock);
  }

  /* ---------- 01. 页头状态与阅读进度 ---------- */
  function initScrollUI() {
    const header = $("#site-header");
    const progress = $("#scroll-progress");
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;

      if (header) header.classList.toggle("is-scrolled", scrollTop > 16);
      if (progress) progress.style.width = `${(ratio * 100).toFixed(2)}%`;
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  /* ---------- 02. 移动端全屏菜单 ---------- */
  function initMobileMenu() {
    const menu = $("#mobile-menu");
    const openButton = $(".menu-toggle");
    const closeButton = $(".mobile-menu__close");
    if (!menu || !openButton) return;

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const backgroundLayers = [$("#site-header"), $("#main"), $(".site-footer")].filter(Boolean);

    const openMenu = () => {
      menu.removeAttribute("inert");
      menu.setAttribute("aria-hidden", "false");
      menu.classList.add("is-open");
      openButton.setAttribute("aria-expanded", "true");
      openButton.setAttribute("aria-label", "关闭导航菜单");
      backgroundLayers.forEach((element) => {
        element.setAttribute("inert", "");
      });
      lockScroll(true);

      const firstLink =
        menu.querySelector(".mobile-menu__nav a") ||
        menu.querySelector(focusableSelector);
      window.setTimeout(() => {
        if (menu.classList.contains("is-open") && firstLink) firstLink.focus();
      }, 80);
    };

    const closeMenu = (restoreFocus = true) => {
      if (!menu.classList.contains("is-open")) return;
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      menu.setAttribute("inert", "");
      openButton.setAttribute("aria-expanded", "false");
      openButton.setAttribute("aria-label", "打开导航菜单");
      backgroundLayers.forEach((element) => {
        element.removeAttribute("inert");
      });
      lockScroll(false);

      if (restoreFocus) openButton.focus();
    };

    openButton.addEventListener("click", openMenu);
    if (closeButton) closeButton.addEventListener("click", () => closeMenu());

    $$("a", menu).forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (!menu.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      // 将键盘焦点限制在菜单内
      if (event.key !== "Tab") return;
      const focusables = $$(focusableSelector, menu).filter(
        (item) => item.offsetParent !== null
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", (event) => {
        if (event.matches) closeMenu(false);
      });
    }
  }

  /* ---------- 03. 滚动显现与当前栏目 ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );

    items.forEach((item) => observer.observe(item));
  }

  function initActiveNav() {
    const links = $$("[data-nav]");
    const sections = ["about", "work", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!links.length || !sections.length || !("IntersectionObserver" in window)) {
      return;
    }

    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.dataset.nav === id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-38% 0px -54% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      return;
    }

    const animate = (element) => {
      const target = Number(element.dataset.count);
      if (!Number.isFinite(target)) return;

      const duration = 1250;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.7 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ---------- 04. 作品筛选 ---------- */
  function initProjectFilter() {
    const filterButtons = $$(".filter");
    const cards = $$(".project-card");
    const status = $("#filter-status");
    if (!filterButtons.length || !cards.length) return;

    const labels = {
      all: "全部作品",
      product: "产品体验",
      brand: "品牌网站",
      lab: "创意实验",
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter || "all";

        filterButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });

        let visibleCount = 0;

        cards.forEach((card) => {
          const matches = filter === "all" || card.dataset.category === filter;
          card.hidden = !matches;

          if (matches) {
            visibleCount += 1;

            if (!prefersReducedMotion.matches && typeof card.animate === "function") {
              card.animate(
                [
                  { opacity: 0, transform: "translateY(14px)" },
                  { opacity: 1, transform: "translateY(0)" },
                ],
                { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
              );
            }
          }
        });

        if (status) {
          status.textContent = `已显示${labels[filter] || "作品"}，共 ${visibleCount} 个项目。`;
        }
      });
    });
  }

  /* ---------- 05. 项目详情弹窗 ---------- */
  function initProjectDialog() {
    const dialog = $("#project-dialog");
    const content = $("#dialog-content");
    if (!dialog || !content) return;

    let lastTrigger = null;

    const closeDialog = () => {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        document.body.classList.remove("modal-open");
      }
    };

    const openDialog = (projectId, trigger) => {
      const template = document.getElementById(`detail-${projectId}`);
      if (!template) return;

      lastTrigger = trigger || null;
      content.replaceChildren(template.content.cloneNode(true));

      if (typeof dialog.showModal === "function") {
        if (dialog.open) dialog.close();
        dialog.showModal();
        document.body.classList.add("modal-open");

        const closeButton = $(".project-dialog__close", dialog);
        if (closeButton) {
          window.setTimeout(() => closeButton.focus(), 60);
        }
      } else {
        // 极旧浏览器的降级方案：至少让内容可读
        dialog.setAttribute("open", "");
        document.body.classList.add("modal-open");
      }
    };

    $$("[data-project]").forEach((button) => {
      button.addEventListener("click", () => {
        openDialog(button.dataset.project, button);
      });
    });

    const closeButton = $("[data-close-dialog]", dialog);
    if (closeButton) closeButton.addEventListener("click", closeDialog);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });

    dialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      content.replaceChildren();
      if (lastTrigger instanceof HTMLElement) lastTrigger.focus();
    });

    if (typeof dialog.showModal !== "function") {
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && dialog.hasAttribute("open")) closeDialog();
      });
    }
  }

  /* ---------- 06. 卡片图片轻微视差 ---------- */
  function initCardTilt() {
    if (!finePointer.matches || prefersReducedMotion.matches) return;

    $$(".project-card__button").forEach((button) => {
      const media = $(".project-card__media", button);
      if (!media) return;

      let frame = 0;
      let lastEvent = null;

      const update = () => {
        if (!lastEvent) return;
        const rect = button.getBoundingClientRect();
        const x = (lastEvent.clientX - rect.left) / rect.width - 0.5;
        const y = (lastEvent.clientY - rect.top) / rect.height - 0.5;

        media.style.setProperty("--shift-x", `${(x * 13).toFixed(2)}px`);
        media.style.setProperty("--shift-y", `${(y * 10).toFixed(2)}px`);
        frame = 0;
      };

      button.addEventListener("pointermove", (event) => {
        lastEvent = event;
        if (frame) return;
        frame = window.requestAnimationFrame(update);
      });

      button.addEventListener("pointerleave", () => {
        lastEvent = null;
        if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
        media.style.setProperty("--shift-x", "0px");
        media.style.setProperty("--shift-y", "0px");
      });
    });
  }

  /* ---------- 07. 复制邮箱 ---------- */
  function copyText(text) {
    const legacyCopy = () =>
      new Promise((resolve, reject) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-1000px";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        try {
          const success = document.execCommand("copy");
          textarea.remove();
          success ? resolve() : reject(new Error("Copy command failed"));
        } catch (error) {
          textarea.remove();
          reject(error);
        }
      });

    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(legacyCopy);
    }

    return legacyCopy();
  }

  function initCopyEmail() {
    const buttons = $$("[data-copy-email]");
    if (!buttons.length) return;

    buttons.forEach((button) => {
      const label = $(".copy-button__label", button);
      let resetTimer = 0;

      button.addEventListener("click", async () => {
        const email = button.dataset.copyEmail;
        if (!email) return;

        try {
          await copyText(email);
          showToast(`邮箱已复制：${email}`);
          button.classList.add("is-copied");
          if (label) label.textContent = "已复制";

          window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => {
            button.classList.remove("is-copied");
            if (label) label.textContent = "复制邮箱";
          }, 2200);
        } catch (error) {
          showToast(`复制失败，请手动记下：${email}`);
        }
      });
    });
  }

  /* ---------- 08. 本地时间与年份 ---------- */
  function initClock() {
    const timeNode = $("#local-time");
    const yearNode = $("#current-year");

    if (yearNode) yearNode.textContent = String(new Date().getFullYear());

    if (!timeNode) return;

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    const update = () => {
      timeNode.textContent = formatter.format(new Date());
    };

    update();
    window.setInterval(update, 1000);
  }

  /* ---------- 09. 自定义光标 ---------- */
  function initCursor() {
    const dot = $(".cursor--dot");
    const ring = $(".cursor--ring");
    if (!dot || !ring || !finePointer.matches || prefersReducedMotion.matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let hovering = false;
    let rafId = 0;
    let activated = false;

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      rafId = window.requestAnimationFrame(animateRing);
    };

    document.addEventListener(
      "pointermove",
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

        // 首次移动后才隐藏系统光标，避免未移动时鼠标“消失”
        if (!activated) {
          activated = true;
          ringX = mouseX;
          ringY = mouseY;
          document.body.classList.add("has-custom-cursor");
        }

        const isInteractive = Boolean(
          event.target.closest("a, button, [data-project], .portrait__frame")
        );

        if (isInteractive !== hovering) {
          hovering = isInteractive;
          dot.classList.toggle("is-hovering", hovering);
          ring.classList.toggle("is-hovering", hovering);
        }

        if (!rafId) animateRing();
      },
      { passive: true }
    );

    document.documentElement.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });

    document.documentElement.addEventListener("mouseenter", () => {
      dot.style.opacity = "";
      ring.style.opacity = "";
    });
  }

  /* ---------- 10. 初始化 ---------- */
  function init() {
    initScrollUI();
    initMobileMenu();
    initReveal();
    initActiveNav();
    initCounters();
    initProjectFilter();
    initProjectDialog();
    initCardTilt();
    initCopyEmail();
    initClock();
    initCursor();
  }

  init();
})();
