import React, { useEffect, useRef, useState } from 'react';
import { Zap, Sparkles, Shield, Orbit, Flame, Disc } from 'lucide-react';

export type HeroPowerType =
  | 'arc_pulse'
  | 'mystic_mandala'
  | 'reality_hex'
  | 'thunder_surge'
  | 'vibranium_shockwave'
  | 'star_deflection'
  | null;

interface HeroPowerEffectOverlayProps {
  activePower: HeroPowerType;
  onAnimationComplete?: () => void;
  triggerPower?: (power: HeroPowerType) => void;
}

// Safe Canvas arc drawing helper to strictly prevent negative radius IndexSizeError
const safeArc = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  startAngle: number = 0,
  endAngle: number = Math.PI * 2
) => {
  if (!isFinite(radius) || isNaN(radius) || radius <= 0) return;
  ctx.arc(x, y, Math.max(0.001, radius), startAngle, endAngle);
};

export const HeroPowerEffectOverlay: React.FC<HeroPowerEffectOverlayProps> = ({
  activePower,
  onAnimationComplete,
  triggerPower,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPower, setCurrentPower] = useState<HeroPowerType>(activePower);
  const [powerLabel, setPowerLabel] = useState<string | null>(null);

  useEffect(() => {
    if (activePower) {
      setCurrentPower(activePower);
      runPowerEffect(activePower);
    }
  }, [activePower]);

  const runPowerEffect = (power: HeroPowerType) => {
    const canvas = canvasRef.current;
    if (!canvas || !power) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.max(300, window.innerWidth || 1024);
    canvas.height = Math.max(300, window.innerHeight || 768);

    let startTime = performance.now();
    const duration = power === 'thunder_surge' ? 1400 : 1800;

    let powerName = '';
    if (power === 'arc_pulse') powerName = 'REPULSOR ARC SURGE';
    else if (power === 'mystic_mandala') powerName = 'MYSTIC ELDRITCH MANDALA';
    else if (power === 'reality_hex') powerName = 'CHAOS HEX REALITY WARP';
    else if (power === 'thunder_surge') powerName = 'THUNDER LIGHTNING STRIKE';
    else if (power === 'vibranium_shockwave') powerName = 'VIBRANIUM KINETIC PULSE';
    else if (power === 'star_deflection') powerName = 'CAPTAIN STAR DEFLECTION';

    setPowerLabel(powerName);

    // Particle system for the power
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
    }[] = [];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const particleCount = power === 'thunder_surge' ? 120 : 180;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 9;
      let color = '#38bdf8';
      if (power === 'mystic_mandala') color = Math.random() > 0.4 ? '#f59e0b' : '#fbbf24';
      else if (power === 'reality_hex') color = Math.random() > 0.5 ? '#f43f5e' : '#c084fc';
      else if (power === 'thunder_surge') color = Math.random() > 0.3 ? '#67e8f9' : '#ffffff';
      else if (power === 'vibranium_shockwave') color = Math.random() > 0.4 ? '#a855f7' : '#e879f9';

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.max(1, 2 + Math.random() * 4),
        color,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 40,
      });
    }

    // Branching lightning coordinates generator for Thunder Surge
    const generateLightning = (x1: number, y1: number, x2: number, y2: number, displace: number): [number, number][] => {
      if (displace < 9) {
        return [[x1, y1], [x2, y2]];
      }
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;
      return [
        ...generateLightning(x1, y1, midX, midY, displace / 2),
        ...generateLightning(midX, midY, x2, y2, displace / 2).slice(1),
      ];
    };

    let animId: number;

    const render = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(Math.max(0, elapsed / duration), 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. ARC PULSE ANIMATION (Repulsor / Iron Vanguard)
      if (power === 'arc_pulse') {
        const ringRadius = Math.max(0, progress * (canvas.width * 0.7));
        const alpha = Math.max(0, 1 - progress);

        // Core glow flash
        if (progress < 0.3) {
          const coreAlpha = Math.max(0, (0.3 - progress) / 0.3);
          const radGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 180);
          radGrad.addColorStop(0, `rgba(56, 189, 248, ${coreAlpha * 0.9})`);
          radGrad.addColorStop(0.5, `rgba(6, 182, 212, ${coreAlpha * 0.5})`);
          radGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = radGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Concentric Shockwave Rings
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = Math.max(1, 6 * (1 - progress));
        ctx.beginPath();
        safeArc(ctx, centerX, centerY, ringRadius);
        ctx.stroke();

        ctx.strokeStyle = `rgba(103, 232, 249, ${alpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        safeArc(ctx, centerX, centerY, ringRadius * 0.65);
        ctx.stroke();

        // Holographic HUD Targeting Reticle
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(progress * Math.PI);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
        ctx.lineWidth = 2;
        // Crosshairs and brackets
        ctx.strokeRect(-45, -45, 90, 90);
        ctx.beginPath();
        ctx.moveTo(-70, 0);
        ctx.lineTo(-50, 0);
        ctx.moveTo(70, 0);
        ctx.lineTo(50, 0);
        ctx.moveTo(0, -70);
        ctx.lineTo(0, -50);
        ctx.moveTo(0, 70);
        ctx.lineTo(0, 50);
        ctx.stroke();
        ctx.restore();
      }

      // 2. MYSTIC MANDALA ANIMATION (Sorcerer / Eldritch Rings)
      else if (power === 'mystic_mandala') {
        const ringRadius = Math.max(10, 120 + progress * 240);
        const alpha = Math.max(0, 1 - progress * 0.85);

        ctx.save();
        ctx.translate(centerX, centerY);

        // Rotating outer mandala
        ctx.rotate(progress * 2.5);
        ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
        ctx.lineWidth = 3;

        // Draw geometric star of mandalas
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.strokeRect(-ringRadius / 2, -ringRadius / 2, ringRadius, ringRadius);
        }

        // Inner circle with runes
        ctx.beginPath();
        safeArc(ctx, 0, 0, ringRadius * 0.8);
        ctx.stroke();

        // Second counter-rotating inner ring
        ctx.rotate(-progress * 5);
        ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.9})`;
        ctx.beginPath();
        safeArc(ctx, 0, 0, ringRadius * 0.45);
        ctx.stroke();

        ctx.restore();
      }

      // 3. CHAOS REALITY HEX ANIMATION (Scarlet / Creator Reality Warp)
      else if (power === 'reality_hex') {
        const hexRadius = Math.max(10, progress * (canvas.width * 0.6));
        const alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;
        ctx.lineWidth = 4;

        // Draw expanding concentric hexagons
        [0.4, 0.7, 1.0].forEach(mult => {
          ctx.beginPath();
          const r = Math.max(1, hexRadius * mult);
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 + progress * 0.8;
            const hx = Math.cos(angle) * r;
            const hy = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        });

        // Magenta/violet reality wave
        ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.75})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeArc(ctx, 0, 0, hexRadius * 0.85);
        ctx.stroke();

        ctx.restore();
      }

      // 4. THUNDER LIGHTNING SURGE ANIMATION (Thor / Shockwave Field Agent)
      else if (power === 'thunder_surge') {
        // Flash background
        if (progress < 0.25) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, (0.25 - progress) * 1.5)})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw multiple branching lightning bolts
        ctx.strokeStyle = progress < 0.6 ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = Math.max(1, 4 * (1 - progress * 0.5));
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;

        // Left bolt
        const pts1 = generateLightning(centerX * 0.4, 0, centerX * 0.7, canvas.height, 120);
        ctx.beginPath();
        pts1.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.stroke();

        // Center primary bolt
        const pts2 = generateLightning(centerX, 0, centerX + (Math.random() - 0.5) * 80, canvas.height, 140);
        ctx.beginPath();
        pts2.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.stroke();

        // Right bolt
        const pts3 = generateLightning(centerX * 1.6, 0, centerX * 1.3, canvas.height, 110);
        ctx.beginPath();
        pts3.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.stroke();

        ctx.shadowBlur = 0;
      }

      // 5. VIBRANIUM KINETIC SHOCKWAVE ANIMATION
      else if (power === 'vibranium_shockwave') {
        const pulseRadius = Math.max(10, progress * (canvas.width * 0.75));
        const alpha = Math.max(0, 1 - progress);

        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.lineWidth = Math.max(1, 6 * (1 - progress));
        ctx.beginPath();
        safeArc(ctx, centerX, centerY, pulseRadius);
        ctx.stroke();

        ctx.strokeStyle = `rgba(232, 121, 249, ${alpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        safeArc(ctx, centerX, centerY, pulseRadius * 0.7);
        ctx.stroke();
      }

      // 6. STAR DEFLECTION ANIMATION
      else if (power === 'star_deflection') {
        const shieldRadius = Math.max(10, 100 + progress * 240);
        const alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        safeArc(ctx, 0, 0, shieldRadius);
        ctx.stroke();

        ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.85})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        safeArc(ctx, 0, 0, shieldRadius * 0.65);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeArc(ctx, 0, 0, shieldRadius * 0.35);
        ctx.stroke();
        ctx.restore();
      }

      // Animate Particles with safe bounds
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const pAlpha = Math.max(0, Math.min(1, (1 - p.life / p.maxLife) * (1 - progress)));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pAlpha;
        ctx.beginPath();
        const pSize = Math.max(0.5, p.size);
        safeArc(ctx, p.x, p.y, pSize);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      if (progress < 1) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCurrentPower(null);
        setPowerLabel(null);
        if (onAnimationComplete) onAnimationComplete();
      }
    };

    animId = requestAnimationFrame(render);
  };

  const handleManualTrigger = (power: HeroPowerType) => {
    setCurrentPower(power);
    runPowerEffect(power);
    if (triggerPower) triggerPower(power);
  };

  return (
    <>
      {/* Fullscreen Canvas Overlay for Power Visual Effects */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Dynamic Power Banner HUD */}
      {powerLabel && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="px-5 py-2 rounded-full bg-[#0a0f26]/90 border border-cyan-400 text-cyan-300 font-mono-tech text-xs font-bold tracking-widest shadow-2xl flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{powerLabel} ACTIVATED</span>
          </div>
        </div>
      )}

      {/* Floating Hero Power Arsenal Quick-Launcher Bar */}
      <div className="fixed bottom-6 left-6 z-30 hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#090e24]/90 border border-slate-800 shadow-2xl">
        <span className="text-[10px] font-mono-tech text-slate-400 px-2 uppercase font-bold">
          POWERS:
        </span>

        <button
          onClick={() => handleManualTrigger('arc_pulse')}
          className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 text-xs transition-colors cursor-pointer"
          title="Unleash Arc Reactor Repulsor"
        >
          <Orbit className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleManualTrigger('mystic_mandala')}
          className="p-2 rounded-xl bg-slate-900 hover:bg-amber-950/80 border border-slate-800 hover:border-amber-500/50 text-amber-400 text-xs transition-colors cursor-pointer"
          title="Unleash Mystic Mandala Portal"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleManualTrigger('reality_hex')}
          className="p-2 rounded-xl bg-slate-900 hover:bg-purple-950/80 border border-slate-800 hover:border-purple-500/50 text-purple-400 text-xs transition-colors cursor-pointer"
          title="Unleash Chaos Hex Reality Warp"
        >
          <Flame className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleManualTrigger('thunder_surge')}
          className="p-2 rounded-xl bg-slate-900 hover:bg-blue-950/80 border border-slate-800 hover:border-blue-500/50 text-blue-400 text-xs transition-colors cursor-pointer"
          title="Unleash Thunder Lightning Strike"
        >
          <Zap className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleManualTrigger('vibranium_shockwave')}
          className="p-2 rounded-xl bg-slate-900 hover:bg-fuchsia-950/80 border border-slate-800 hover:border-fuchsia-500/50 text-fuchsia-400 text-xs transition-colors cursor-pointer"
          title="Unleash Vibranium Kinetic Pulse"
        >
          <Disc className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};
