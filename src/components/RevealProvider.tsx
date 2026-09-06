"use client";

import { useEffect } from "react";

/**
 * 페이지 전체의 스크롤 등장 애니메이션을 한 곳에서 관리합니다.
 *
 * 섹션마다 useEffect를 두는 대신 옵저버 하나가 `[data-reveal]`을 전부 맡습니다.
 * → 서버 컴포넌트에 `data-reveal`만 적어두면 되고, 클라이언트 번들도 이만큼만 늘어납니다.
 */
export function RevealProvider() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      // 아래에서 12% 정도 올라왔을 때 시작 — 너무 이르면 등장이 안 보이고,
      // 너무 늦으면 스크롤을 멈춰야 보임.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    const observeAll = (root: ParentNode) =>
      root.querySelectorAll?.("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));

    observeAll(document);

    // 라이트박스·방명록처럼 나중에 붙는 노드도 잡아줍니다.
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of r.addedNodes) {
          if (node.nodeType !== 1) continue;
          const el = node as Element;
          if (el.matches?.("[data-reveal]")) io.observe(el);
          observeAll(el);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // iOS 주소창 높이 보정 (100dvh를 못 쓰는 구형 사파리 대비)
  useEffect(() => {
    const setVh = () =>
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  return null;
}
