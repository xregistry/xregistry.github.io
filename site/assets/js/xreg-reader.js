document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector("#xregistry-content");
  const siteHeader = document.querySelector("#header_wrap");
  const toc = document.querySelector(".spec-toc");
  const tocBody = document.querySelector(".spec-toc__body");
  const inlineTocHeading = content?.querySelector("#table-of-contents");
  const inlineTocList = inlineTocHeading?.nextElementSibling;
  const headings = [...(content?.querySelectorAll("h1[id], h2[id], h3[id], h4[id]") ?? [])];
  const sectionHeadings = headings.filter((heading) => heading.tagName !== "H1" && heading.id !== "table-of-contents");

  document.querySelectorAll(".spec-view-switch a").forEach((link) => {
    const target = new URL(link.href);
    target.searchParams.set("reader", "1");
    link.href = `${target.pathname}${target.search}${target.hash}`;
  });

  const documentHeading = content?.querySelector("h1");
  const documentTitle = documentHeading?.childNodes[0]?.textContent.trim()
    || document.title.replace(/\s*\|\s*xRegistry\s*$/, "");

  const documentToolbar = document.createElement("div");
  documentToolbar.className = "document-toolbar";
  documentToolbar.setAttribute("aria-hidden", "true");
  documentToolbar.innerHTML = `
    <div class="document-toolbar__inner">
      <a class="document-toolbar__title" href="#xregistry-content" title="Back to document start">
        <i class="fas fa-book-open" aria-hidden="true"></i>
        <span></span>
      </a>
      <span class="document-toolbar__path"></span>
    </div>`;
  documentToolbar.querySelector(".document-toolbar__title span").textContent = documentTitle;
  documentToolbar.querySelector(".document-toolbar__path").textContent = document.querySelector(".registry-path code")?.textContent.trim() || "";
  document.body.prepend(documentToolbar);

  const headingStack = document.createElement("nav");
  headingStack.className = "heading-stack";
  headingStack.setAttribute("aria-label", "Current document section");
  headingStack.innerHTML = '<div class="heading-stack__layout"><div class="heading-stack__items"></div></div>';
  documentToolbar.after(headingStack);

  const headingStackItems = headingStack.querySelector(".heading-stack__items");
  let headingStackSignature = "";

  const updateHeadingStack = (toolbarVisible) => {
    const activeHeadings = new Map();
    if (toolbarVisible) {
      sectionHeadings.forEach((heading) => {
        if (heading.offsetParent === null) return;
        const level = Number(heading.tagName.slice(1));
        const parentRows = [...activeHeadings.keys()].filter((activeLevel) => activeLevel < level).length;
        const threshold = window.scrollY + 54 + (parentRows * 38);
        const headingTop = heading.getBoundingClientRect().top + window.scrollY;
        if (headingTop > threshold) return;

        activeHeadings.set(level, heading);
        for (let deeperLevel = level + 1; deeperLevel <= 4; deeperLevel += 1) {
          activeHeadings.delete(deeperLevel);
        }
      });
    }

    const signature = [...activeHeadings.entries()].map(([level, heading]) => `${level}:${heading.id}`).join("|");
    if (signature !== headingStackSignature) {
      headingStackItems.replaceChildren();
      [...activeHeadings.entries()].sort(([first], [second]) => first - second).forEach(([level, heading]) => {
        const headingLabel = heading.cloneNode(true);
        headingLabel.querySelector(".anchor")?.remove();
        const link = document.createElement("a");
        link.className = `heading-stack__item heading-stack__item--h${level}`;
        link.href = `#${encodeURIComponent(heading.id)}`;
        link.textContent = headingLabel.textContent.trim();
        link.title = link.textContent;
        headingStackItems.append(link);
      });
      headingStackSignature = signature;
    }

    const stackVisible = toolbarVisible && activeHeadings.size > 0;
    headingStack.classList.toggle("is-visible", stackVisible);
    const stackHeight = stackVisible ? headingStackItems.offsetHeight : 0;
    document.body.style.setProperty("--heading-stack-height", `${stackHeight}px`);
    document.documentElement.style.scrollPaddingTop = `${70 + stackHeight}px`;
  };

  const progressFooter = document.createElement("footer");
  progressFooter.className = "reading-progress";
  progressFooter.innerHTML = `
    <div class="reading-progress__inner">
      <span class="reading-progress__label">Reading progress</span>
      <div class="reading-progress__track" role="slider" tabindex="0" aria-label="Document reading progress" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="0% read">
        <span class="reading-progress__fill"></span>
      </div>
      <output class="reading-progress__value">0%</output>
    </div>`;
  document.body.append(progressFooter);

  const progressTrack = progressFooter.querySelector(".reading-progress__track");
  const progressFill = progressFooter.querySelector(".reading-progress__fill");
  const progressValue = progressFooter.querySelector(".reading-progress__value");
  let scrollFrame;

  const readingMetrics = () => ({
    contentTop: content.offsetTop,
    readableDistance: Math.max(content.offsetHeight - window.innerHeight, 1),
  });

  const seekToProgress = (progress, behavior = "auto") => {
    const boundedProgress = Math.min(100, Math.max(0, progress));
    const { contentTop, readableDistance } = readingMetrics();
    window.scrollTo({
      top: contentTop + ((boundedProgress / 100) * readableDistance),
      behavior,
    });
  };

  const progressFromPointer = (clientX) => {
    const bounds = progressTrack.getBoundingClientRect();
    return ((clientX - bounds.left) / bounds.width) * 100;
  };

  let seekingWithPointer = false;
  progressTrack.addEventListener("pointerdown", (event) => {
    seekingWithPointer = true;
    progressTrack.setPointerCapture(event.pointerId);
    seekToProgress(progressFromPointer(event.clientX));
    event.preventDefault();
  });
  progressTrack.addEventListener("pointermove", (event) => {
    if (seekingWithPointer) seekToProgress(progressFromPointer(event.clientX));
  });
  progressTrack.addEventListener("pointerup", (event) => {
    seekingWithPointer = false;
    progressTrack.releasePointerCapture(event.pointerId);
  });
  progressTrack.addEventListener("pointercancel", () => {
    seekingWithPointer = false;
  });
  progressTrack.addEventListener("keydown", (event) => {
    const currentProgress = Number(progressTrack.getAttribute("aria-valuenow"));
    const progressByKey = {
      ArrowLeft: currentProgress - 5,
      ArrowDown: currentProgress - 5,
      ArrowRight: currentProgress + 5,
      ArrowUp: currentProgress + 5,
      PageDown: currentProgress - 10,
      PageUp: currentProgress + 10,
      Home: 0,
      End: 100,
    };
    if (!(event.key in progressByKey)) return;
    event.preventDefault();
    seekToProgress(progressByKey[event.key], window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  });

  const updateReaderChrome = () => {
    scrollFrame = undefined;
    const toolbarVisible = siteHeader?.getBoundingClientRect().bottom <= 0;
    documentToolbar.classList.toggle("is-visible", toolbarVisible);
    documentToolbar.setAttribute("aria-hidden", String(!toolbarVisible));
    document.body.classList.toggle("has-document-toolbar", toolbarVisible);
    updateHeadingStack(toolbarVisible);

    const { contentTop, readableDistance } = readingMetrics();
    const progress = Math.min(100, Math.max(0, ((window.scrollY - contentTop) / readableDistance) * 100));
    const roundedProgress = Math.round(progress);
    progressFill.style.width = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", String(roundedProgress));
    progressTrack.setAttribute("aria-valuetext", `${roundedProgress}% read`);
    progressValue.value = `${roundedProgress}%`;
    progressValue.textContent = `${roundedProgress}%`;
  };

  const scheduleReaderChromeUpdate = () => {
    if (scrollFrame === undefined) scrollFrame = window.requestAnimationFrame(updateReaderChrome);
  };

  window.addEventListener("scroll", scheduleReaderChromeUpdate, { passive: true });
  window.addEventListener("resize", scheduleReaderChromeUpdate);
  updateReaderChrome();

  if (inlineTocList?.tagName === "UL") {
    tocBody.append(inlineTocList.cloneNode(true));
    inlineTocHeading.classList.add("spec-inline-toc");
    inlineTocList.classList.add("spec-inline-toc");
  } else if (toc) {
    toc.hidden = true;
  }

  const toast = document.createElement("div");
  toast.className = "reader-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.append(toast);
  let toastTimer;

  const showToast = (message) => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied");
    } catch {
      showToast("Link ready in the address bar");
    }
  };

  headings.forEach((heading) => {
    const anchor = heading.querySelector(":scope > .anchor");
    if (!anchor) return;
    anchor.innerHTML = '<i class="fas fa-link" aria-hidden="true"></i>';
    anchor.setAttribute("aria-label", `Copy link to ${heading.textContent.trim()}`);
    anchor.setAttribute("title", "Copy section link");
    anchor.addEventListener("click", () => window.setTimeout(copyUrl, 0));
  });

  content?.querySelectorAll("table").forEach((table) => {
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.setAttribute("tabindex", "0");
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "Scrollable table");
    table.parentNode.insertBefore(wrapper, table);
    wrapper.append(table);
  });

  const coreModelImages = ["xregbasicmodel.png", "xregfullmodel.png", "xregsample.png"];
  const coreModelComparison = content?.querySelector('img[src$="xregbasicmodel.png"]')?.parentElement;
  if (coreModelComparison && coreModelImages.every((file) => coreModelComparison.querySelector(`img[src$="${file}"]`))) {
    [...coreModelComparison.childNodes].forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) node.remove();
    });
    coreModelComparison.classList.add("core-model-comparison");
    coreModelComparison.setAttribute("tabindex", "0");
    coreModelComparison.setAttribute("role", "region");
    coreModelComparison.setAttribute("aria-label", "Core registry model diagrams, left to right");
  }

  const tocLinks = [...(tocBody?.querySelectorAll('a[href^="#"]') ?? [])];
  if ("IntersectionObserver" in window && headings.length > 0 && tocLinks.length > 0) {
    const linksById = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        tocLinks.forEach((link) => link.classList.remove("is-active"));
        linksById.get(visible.target.id)?.classList.add("is-active");
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    headings.forEach((heading) => observer.observe(heading));
  }

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const updateBackToTop = () => backToTop.classList.toggle("is-visible", window.scrollY > 700);
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    updateBackToTop();
  }

  const lineLinks = [...document.querySelectorAll(".source-line__number")];
  let rangeStart = null;

  const selectLineRange = (start, end = start, shouldCopy = true) => {
    const first = Math.min(start, end);
    const last = Math.max(start, end);
    document.querySelectorAll(".source-line.is-selected").forEach((line) => line.classList.remove("is-selected"));
    for (let line = first; line <= last; line += 1) {
      document.querySelector(`#L${line}`)?.classList.add("is-selected");
    }
    const hash = first === last ? `#L${first}` : `#L${first}-L${last}`;
    history.replaceState(null, "", hash);
    document.querySelector(`#L${first}`)?.scrollIntoView({ block: "center" });
    if (shouldCopy) copyUrl();
  };

  lineLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const line = Number(link.dataset.line);
      if (event.shiftKey && rangeStart !== null) {
        selectLineRange(rangeStart, line);
      } else {
        rangeStart = line;
        selectLineRange(line);
      }
    });
  });

  const lineHash = window.location.hash.match(/^#L(\d+)(?:-L(\d+))?$/);
  if (lineHash) {
    rangeStart = Number(lineHash[1]);
    selectLineRange(rangeStart, Number(lineHash[2] ?? lineHash[1]), false);
  }
});