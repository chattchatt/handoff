import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  hue: number;
  alpha: number;
  stretch: number;
  twinkle: number;
};

type SpherePoint = {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
};

type TunnelPoint = {
  angle: number;
  radius: number;
  z: number;
  size: number;
  alpha: number;
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    size: 0.35 + Math.random() * 1.9,
    hue: Math.random() > 0.72 ? 32 + Math.random() * 28 : 190 + Math.random() * 72,
    alpha: 0.12 + Math.random() * 0.72,
    stretch: Math.random() > 0.84 ? 2.2 + Math.random() * 5.8 : 1,
    twinkle: Math.random() * Math.PI * 2,
  }));
}

function makeSphere(count: number): SpherePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / Math.max(1, count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * index;

    return {
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
      size: 0.42 + Math.random() * 0.92,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

function makeTunnel(count: number): TunnelPoint[] {
  return Array.from({ length: count }, (_, index) => {
    const depth = index / count;
    return {
      angle: Math.random() * Math.PI * 2,
      radius: 0.05 + Math.pow(Math.random(), 0.44) * 1.28,
      z: depth,
      size: 0.28 + Math.random() * 1.8,
      alpha: 0.06 + Math.random() * 0.36,
    };
  });
}

function rotatePoint(point: SpherePoint, rotX: number, rotY: number) {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y1 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;

  return { x: x1, y: y1, z: z2 };
}

export function HeroMemoryScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let animationFrame = 0;
    let stars: Star[] = [];
    let sphere: SpherePoint[] = [];
    let tunnel: TunnelPoint[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = width < 760;
      stars = makeStars(mobile ? 160 : 260);
      sphere = makeSphere(mobile ? 1150 : 2100);
      tunnel = makeTunnel(mobile ? 520 : 960);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = (event.clientX / Math.max(width, 1) - 0.5) * 2;
      pointer.ty = (event.clientY / Math.max(height, 1) - 0.5) * 2;
    };

    const drawDeepField = (time: number) => {
      for (const star of stars) {
        const parallax = 1 + star.z * 20;
        const x =
          ((star.x * width + pointer.x * parallax + time * (0.003 + star.z * 0.006)) %
            (width + 80)) -
          40;
        const y = star.y * height + pointer.y * parallax * 0.4;
        const pulse = 0.74 + Math.sin(time * 0.0015 + star.twinkle) * 0.26;
        const size = star.size * (0.6 + star.z * 0.9);

        context.save();
        context.translate(x, y);
        context.rotate(star.twinkle + time * 0.00008);
        context.fillStyle = `hsla(${star.hue}, 92%, ${star.hue < 80 ? 63 : 78}%, ${star.alpha * pulse})`;
        context.beginPath();
        context.ellipse(0, 0, size * star.stretch, size, 0, 0, Math.PI * 2);
        context.fill();

        if (star.size > 1.35 && star.stretch === 1) {
          context.strokeStyle = `rgba(255, 255, 255, ${0.12 * star.alpha})`;
          context.lineWidth = 0.7;
          context.beginPath();
          context.moveTo(-size * 3, 0);
          context.lineTo(size * 3, 0);
          context.moveTo(0, -size * 3);
          context.lineTo(0, size * 3);
          context.stroke();
        }
        context.restore();
      }
    };

    const drawTunnel = (time: number, scroll: number) => {
      const centerX = width * (width < 760 ? 0.46 : 0.38) + pointer.x * 18;
      const centerY = height * (width < 760 ? 0.7 : 0.62) + pointer.y * 14;
      const span = Math.min(width, height) * (width < 760 ? 0.92 : 1.04);
      const twist = time * 0.00012 + scroll * 1.1;

      for (const point of tunnel) {
        const z = (point.z + time * 0.000045) % 1;
        const perspective = 0.26 + (1 - z) * 1.32;
        const angle = point.angle + twist + point.radius * 1.9;
        const spiral = point.radius * span * perspective;
        const x = centerX + Math.cos(angle) * spiral + pointer.x * z * 28;
        const y = centerY + Math.sin(angle) * spiral * 0.58 + pointer.y * z * 16;
        const alpha = point.alpha * (1 - z) * 0.8;
        const size = point.size * perspective;

        if (x < -40 || x > width + 40 || y < -40 || y > height + 40) continue;

        context.fillStyle = `rgba(235, 241, 255, ${alpha})`;
        context.beginPath();
        context.ellipse(x, y, size * (1.4 + z * 2), size, angle, 0, Math.PI * 2);
        context.fill();
      }
    };

    const drawSphere = (time: number, scroll: number) => {
      const mobile = width < 760;
      const radius = Math.min(width, height) * (mobile ? 0.38 : 0.3);
      const centerX = width * (mobile ? 0.58 : 0.68) + pointer.x * (mobile ? 14 : 30);
      const centerY =
        height * (mobile ? 0.38 : 0.38) +
        pointer.y * (mobile ? 10 : 22) +
        scroll * (mobile ? 36 : 68);
      const rotY = time * 0.00018 + pointer.x * 0.22;
      const rotX = -0.18 + Math.sin(time * 0.00022) * 0.08 + pointer.y * 0.12;

      context.save();
      context.globalCompositeOperation = "lighter";

      for (const point of sphere) {
        const rotated = rotatePoint(point, rotX, rotY);
        const perspective = 0.66 + (rotated.z + 1) * 0.19;
        const x = centerX + rotated.x * radius * perspective;
        const y = centerY + rotated.y * radius * perspective;
        const projectedRadius = Math.sqrt(rotated.x * rotated.x + rotated.y * rotated.y);
        const rim = Math.pow(Math.max(0, projectedRadius), 2.1);
        const capGlow = Math.pow(Math.abs(rotated.y), 3.4) * 0.6;
        const front = Math.max(0, rotated.z + 0.22);
        const noise = 0.78 + Math.sin(time * 0.002 + point.phase) * 0.22;
        const alpha = Math.min(0.95, (0.08 + rim * 0.42 + capGlow + front * 0.12) * noise);

        if (alpha < 0.035) continue;

        const warmEdge = rotated.y < -0.64 ? 210 : 228;
        context.fillStyle = `rgba(${warmEdge}, ${warmEdge + 7}, 255, ${alpha})`;
        context.beginPath();
        context.arc(x, y, point.size * (0.72 + perspective * 0.72), 0, Math.PI * 2);
        context.fill();
      }

      const glow = context.createRadialGradient(
        centerX,
        centerY,
        radius * 0.2,
        centerX,
        centerY,
        radius * 1.18,
      );
      glow.addColorStop(0, "rgba(255,255,255,0)");
      glow.addColorStop(0.68, "rgba(255,255,255,0.035)");
      glow.addColorStop(1, "rgba(255,255,255,0.11)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(centerX, centerY, radius * 1.12, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const draw = (time = 0) => {
      frame = time;
      pointer.x += (pointer.tx - pointer.x) * 0.055;
      pointer.y += (pointer.ty - pointer.y) * 0.055;

      const scroll = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1));
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#1A1F31";
      context.fillRect(0, 0, width, height);

      drawDeepField(time);
      drawTunnel(time, scroll);
      drawSphere(time, scroll);

      const shade = context.createRadialGradient(
        width * 0.55,
        height * 0.38,
        Math.min(width, height) * 0.2,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72,
      );
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,0.54)");
      context.fillStyle = shade;
      context.fillRect(0, 0, width, height);

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      frame = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[3] h-screen w-screen opacity-95"
    />
  );
}

export default HeroMemoryScene;
