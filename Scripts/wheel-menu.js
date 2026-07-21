/*
 * 재사용 가능한 반원형 휠 메뉴
 *
 * 사용 예시:
 *   <nav class="wheel-wrap" data-wheel-menu data-active="About">
 *     <svg viewBox="0 0 360 520"></svg>
 *   </nav>
 */
(() => {
  const svgNS = "http://www.w3.org/2000/svg";

  const defaultSections = [
    { label: "About", href: "about.html" },
    { label: "Interests", href: "interests.html" },
    { label: "Future", href: "future.html" },
    { label: "Portfolio", href: "portfolio.html" },
    { label: "Links", href: "links.html" },
  ];

  document.querySelectorAll("[data-wheel-menu]").forEach((menu) => {
    const svg = menu.querySelector("svg");
    if (!svg) return;

    svg.innerHTML = "";

    const cx = 520;
    const cy = 260;
    const outerR = 240;
    const innerR = 104;
    const labelRadius = (innerR + outerR) / 2;
    const activeLabel = (menu.dataset.active || "").trim();
    const activeIndex = defaultSections.findIndex(
      (section) => section.label === activeLabel,
    );

    const sections =
      activeIndex < 0
        ? [...defaultSections]
        : defaultSections.map(
            (_, index) =>
              defaultSections[
                (index + activeIndex - 2 + defaultSections.length) %
                  defaultSections.length
              ],
          );

    const startAngle = 270;
    const endAngle = 90;
    const step = (startAngle - endAngle) / sections.length;

    const point = (angle, radius) => {
      const radians = (angle * Math.PI) / 180;
      return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
    };

    const wedgePath = (a0, a1) => {
      const [x1, y1] = point(a0, outerR);
      const [x2, y2] = point(a1, outerR);
      const [x3, y3] = point(a1, innerR);
      const [x4, y4] = point(a0, innerR);
      return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 1 ${x4} ${y4} Z`;
    };

    sections.forEach((section, index) => {
      const a0 = startAngle - index * step;
      const a1 = startAngle - (index + 1) * step;
      const mid = (a0 + a1) / 2;
      const isActive = section.label === activeLabel;
      const group = document.createElementNS(svgNS, "g");
      group.setAttribute("class", "wedge-group");

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", wedgePath(a0, a1));
      path.setAttribute(
        "class",
        isActive ? "wedge-path wedge-path-active" : "wedge-path",
      );
      group.appendChild(path);

      const [x, y] = point(mid, labelRadius + (isActive ? 4 : 12));
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", x.toFixed(2));
      label.setAttribute("y", y.toFixed(2));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute(
        "class",
        isActive ? "wedge-label wedge-label-active" : "wedge-label",
      );
      label.setAttribute(
        "transform",
        `rotate(${(mid + 180) % 360} ${x.toFixed(2)} ${y.toFixed(2)})`,
      );
      label.textContent = section.label;
      group.appendChild(label);

      const [dx, dy] = [
        Math.cos((mid * Math.PI) / 180) * 8,
        Math.sin((mid * Math.PI) / 180) * 8,
      ];
      const resetTransform = () => {
        group.style.transform = "translate(0, 0)";
      };
      group.addEventListener("mouseenter", () => {
        group.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      group.addEventListener("mouseleave", resetTransform);
      group.addEventListener("focusin", () => {
        group.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      group.addEventListener("focusout", resetTransform);

      const link = document.createElementNS(svgNS, "a");
      link.setAttribute("href", isActive ? "#" : section.href);
      link.setAttribute("aria-label", section.label);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      }
      link.appendChild(group);
      svg.appendChild(link);
    });

    for (let index = 0; index <= sections.length; index += 1) {
      const angle = startAngle - index * step;
      const [x1, y1] = point(angle, innerR);
      const [x2, y2] = point(angle, outerR);
      const divider = document.createElementNS(svgNS, "line");
      divider.setAttribute("x1", x1.toFixed(2));
      divider.setAttribute("y1", y1.toFixed(2));
      divider.setAttribute("x2", x2.toFixed(2));
      divider.setAttribute("y2", y2.toFixed(2));
      divider.setAttribute("class", "wheel-divider");
      svg.appendChild(divider);
    }

    const hub = document.createElementNS(svgNS, "circle");
    hub.setAttribute("cx", cx.toFixed(2));
    hub.setAttribute("cy", cy.toFixed(2));
    hub.setAttribute("r", (innerR - 20).toFixed(2));
    hub.setAttribute("class", "wheel-hub");
    svg.appendChild(hub);
  });
})();
