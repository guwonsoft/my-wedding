/**
 * 커버 위에 아주 옅게 흩날리는 꽃잎.
 *
 * 값은 전부 상수 배열입니다 — Math.random()을 쓰면 서버/클라이언트 렌더 결과가
 * 달라져 하이드레이션 경고가 납니다.
 */
const PETALS = [
  { left: 6, delay: 0, dur: 15, size: 9, drift: 34, o: 0.5, hue: 0 },
  { left: 17, delay: 4.5, dur: 19, size: 6, drift: -22, o: 0.36, hue: 1 },
  { left: 28, delay: 9, dur: 16, size: 11, drift: 48, o: 0.42, hue: 0 },
  { left: 39, delay: 2.2, dur: 21, size: 7, drift: -38, o: 0.3, hue: 1 },
  { left: 51, delay: 12, dur: 17, size: 10, drift: 26, o: 0.46, hue: 0 },
  { left: 62, delay: 6.8, dur: 22, size: 6, drift: -30, o: 0.32, hue: 1 },
  { left: 73, delay: 1.4, dur: 18, size: 12, drift: 40, o: 0.4, hue: 0 },
  { left: 84, delay: 10.5, dur: 20, size: 8, drift: -26, o: 0.34, hue: 1 },
  { left: 93, delay: 7.3, dur: 16, size: 7, drift: 18, o: 0.44, hue: 0 },
];

export function Petals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block motion-reduce:hidden"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.35,
            background: p.hue
              ? "radial-gradient(60% 60% at 35% 30%, #fff 0%, #f0e3d4 60%, #e2cdb2 100%)"
              : "radial-gradient(60% 60% at 35% 30%, #fff 0%, #fdf6ef 55%, #eadbc6 100%)",
            borderRadius: "60% 12% 60% 12%",
            animation: `petal-fall ${p.dur}s linear ${p.delay}s infinite`,
            ["--petal-drift" as string]: `${p.drift}px`,
            ["--petal-opacity" as string]: p.o,
            filter: "blur(0.2px)",
          }}
        />
      ))}
    </div>
  );
}
