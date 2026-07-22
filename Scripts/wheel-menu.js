/*
 * 재사용 가능한 반원형 휠 메뉴 (무한 회전 루프 및 모바일 가독성 텍스트 회전 지원)
 *
 * 사용 예시:
 *   <nav class="wheel-wrap" data-wheel-menu data-active="About">
 *     <svg viewBox="0 0 520 520" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"></svg>
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

    const renderWheel = () => {
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

      const baseSections =
        activeIndex < 0
          ? [...defaultSections]
          : defaultSections.map(
              (_, index) =>
                defaultSections[
                  (index + activeIndex - 2 + defaultSections.length) %
                    defaultSections.length
                ],
            );

      // 5개 섹션을 2회 반복하여 360도 전체 10개 슬롯으로 배치
      const sections = [...baseSections, ...baseSections];

      const startAngle = 270;
      const totalSlots = sections.length;
      const step = 360 / totalSlots; // 슬롯당 36도

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

      // 화면 경계선 넘어가는 조각 클리핑
      const defs = document.createElementNS(svgNS, "defs");
      const clipPath = document.createElementNS(svgNS, "clipPath");
      const clipId = `wheel-clip-${Math.random().toString(36).substr(2, 9)}`;
      clipPath.setAttribute("id", clipId);

      const clipRect = document.createElementNS(svgNS, "rect");
      clipRect.setAttribute("x", "0");
      clipRect.setAttribute("y", "0");
      clipRect.setAttribute("width", "520");
      clipRect.setAttribute("height", "520");

      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);
      svg.appendChild(defs);

      const wheelDisc = document.createElementNS(svgNS, "g");
      wheelDisc.setAttribute("class", "wheel-disc");
      wheelDisc.setAttribute("clip-path", `url(#${clipId})`);
      wheelDisc.style.transformBox = "view-box";
      wheelDisc.style.transformOrigin = `${cx}px ${cy}px`;
      svg.appendChild(wheelDisc);

      const isMobile = window.innerWidth <= 768;

      sections.forEach((section, index) => {
        const a0 = startAngle - index * step;
        const a1 = startAngle - (index + 1) * step;
        const mid = (a0 + a1) / 2;
        const isActive = section.label === activeLabel && index === 2;
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

        let labelRot = (mid + 180) % 360;
        if (isMobile) {
          // 모바일 하단 휠(+90deg 회전) 환경에서 텍스트가 상하반전되지 않도록 정방향 정렬
          const netAngle = (labelRot + 90) % 360;
          const normalized = netAngle > 180 ? netAngle - 360 : netAngle;
          if (normalized > 90 || normalized < -90) {
            labelRot = (labelRot + 180) % 360;
          }
          if (index === 2) {
            labelRot = 180; // 모바일 중앙 활성 메뉴 세로 우뚝 정렬
          }
        }

        label.setAttribute(
          "transform",
          `rotate(${labelRot} ${x.toFixed(2)} ${y.toFixed(2)})`,
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

        link.addEventListener("click", (e) => {
          if (isActive) {
            e.preventDefault();
            return;
          }

          e.preventDefault();

          if (menu.dataset.animating === "true") return;
          menu.dataset.animating = "true";

          const currentActivePath = svg.querySelector(".wedge-path-active");
          if (currentActivePath) {
            currentActivePath.classList.remove("wedge-path-active");
          }
          const currentActiveLabel = svg.querySelector(".wedge-label-active");
          if (currentActiveLabel) {
            currentActiveLabel.classList.remove("wedge-label-active");
          }

          path.classList.add("wedge-path-active");
          label.classList.add("wedge-label-active");

          const rotDeg = (index - 2) * step;
          wheelDisc.style.transform = `rotate(${rotDeg}deg)`;

          setTimeout(() => {
            window.location.href = section.href;
          }, 420);
        });

        link.appendChild(group);
        wheelDisc.appendChild(link);
      });

      for (let index = 0; index <= totalSlots; index += 1) {
        const angle = startAngle - index * step;
        const [x1, y1] = point(angle, innerR);
        const [x2, y2] = point(angle, outerR);
        const divider = document.createElementNS(svgNS, "line");
        divider.setAttribute("x1", x1.toFixed(2));
        divider.setAttribute("y1", y1.toFixed(2));
        divider.setAttribute("x2", x2.toFixed(2));
        divider.setAttribute("y2", y2.toFixed(2));
        divider.setAttribute("class", "wheel-divider");
        wheelDisc.appendChild(divider);
      }

      const hub = document.createElementNS(svgNS, "circle");
      hub.setAttribute("cx", cx.toFixed(2));
      hub.setAttribute("cy", cy.toFixed(2));
      hub.setAttribute("r", (innerR - 20).toFixed(2));
      hub.setAttribute("class", "wheel-hub");
      wheelDisc.appendChild(hub);
    };

    renderWheel();
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderWheel, 150);
    });
  });
})();
