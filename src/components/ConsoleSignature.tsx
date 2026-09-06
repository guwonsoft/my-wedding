"use client";

import { useEffect } from "react";
import { wedding } from "@/config/wedding";
import { countdown } from "@/lib/date";

/** 개발자 도구를 열어본 분들을 위한 인사. */
export function ConsoleSignature() {
  useEffect(() => {
    const { dday } = countdown(wedding.date);
    const title = `${wedding.groom.en} & ${wedding.bride.en}`;

    console.log(
      `%c${title}%c\n${wedding.meta.description}`,
      "font-size:20px;font-family:Georgia,serif;color:#a98f63;letter-spacing:2px",
      "font-size:12px;color:#5a544c",
    );
    console.log(
      `%c여기까지 열어보셨군요. 그 마음까지 감사합니다. %c(D${dday > 0 ? "-" + dday : "+" + -dday})`,
      "font-size:12px;color:#23201c",
      "font-family:monospace;color:#a98f63",
    );
  }, []);

  return null;
}
