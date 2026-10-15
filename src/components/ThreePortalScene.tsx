import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Shield, Sparkles, Orbit, Compass, Eye, EyeOff, RotateCw } from 'lucide-react';

interface ThreePortalSceneProps {
  onExploreMissions?: () => void;
  onJoinAssembly?: () => void;
}

export const ThreePortalScene: React.FC<ThreePortalSceneProps> = ({
  onExploreMissions,
  onJoinAssembly,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [portalSpeed, setPortalSpeed] = useState<number>(1);
  const [energyColor, setEnergyColor] = useState<'cyan' | 'crimson' | 'gold'>('cyan');
  const [activeCameraView, setActiveCameraView] = useState<'front' | 'hero' | 'zenith'>('front');

  // Mutable refs for animation loop
  const speedRef = useRef(1);
  const colorRef = useRef<'cyan' | 'crimson' | 'gold'>('cyan');
  const targetCamPosRef = useRef(new THREE.Vector3(0, 2.2, 7.5));
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    speedRef.current = portalSpeed;
  }, [portalSpeed]);

  useEffect(() => {
    colorRef.current = energyColor;
  }, [energyColor]);

  useEffect(() => {
    if (activeCameraView === 'front') {
      targetCamPosRef.current.set(0, 2.2, 7.5);
    } else if (activeCameraView === 'hero') {
      targetCamPosRef.current.set(3.2, 1.4, 5.8);
    } else if (activeCameraView === 'zenith') {
      targetCamPosRef.current.set(0, 6.0, 5.0);
    }
  }, [activeCameraView]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050710);
    scene.fog = new THREE.FogExp2(0x050710, 0.045);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.2, 7.5);
    camera.lookAt(0, 1.8, 0);

    // 2. Renderer with ACESFilmic & Studio Environment
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Environment (Zero-dependency procedural reflections)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Balanced Studio Lighting (Warm Key, Cool Fill, Subtle Rim)
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.4);
    keyLight.position.set(4, 7, 5);
    if (!isHeadless) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // 4. Procedural Textures (Zero 404 dependencies)
    const createRuneTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#101426';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#67e8f9';
        // Draw tech rune marks and notches
        for (let x = 16; x < 512; x += 32) {
          ctx.strokeRect(x, 24, 20, 80);
          ctx.beginPath();
          ctx.moveTo(x + 10, 34);
          ctx.lineTo(x + 10, 94);
          ctx.stroke();
          ctx.fillText(`ANOMALY_${(x % 17).toString(16).toUpperCase()}`, x - 4, 18);
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 1);
      return tex;
    };

    const runeTexture = createRuneTexture();

    // 5. Composite 3-12 Part Procedural Portal Model (THREE.Group)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, 0);
    scene.add(portalGroup);

    // Part 1: Heavy Obsidian Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(3.2, 3.6, 0.4, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.65,
      metalness: 0.45,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.2;
    baseMesh.receiveShadow = true;
    portalGroup.add(baseMesh);

    // Base Tech Ring with Rune Texture
    const baseRingGeo = new THREE.RingGeometry(1.8, 3.1, 48);
    const baseRingMat = new THREE.MeshStandardMaterial({
      map: runeTexture,
      roughness: 0.4,
      metalness: 0.8,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const baseRingMesh = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRingMesh.rotation.x = -Math.PI / 2;
    baseRingMesh.position.y = 0.41;
    portalGroup.add(baseRingMesh);

    // Part 2: Outer Heavy Arch Ring (Obsidian & Titanium Pylon)
    const outerArchGeo = new THREE.TorusGeometry(2.4, 0.18, 24, 64);
    const outerArchMat = new THREE.MeshStandardMaterial({
      color: 0x0d1326,
      roughness: 0.28,
      metalness: 0.88,
    });
    const outerArchMesh = new THREE.Mesh(outerArchGeo, outerArchMat);
    outerArchMesh.position.y = 2.4;
    outerArchMesh.castShadow = true;
    portalGroup.add(outerArchMesh);

    // Part 3: Intermediate Counter-Rotating Gear Ring with Anomaly Notches
    const gearRingGroup = new THREE.Group();
    gearRingGroup.position.y = 2.4;
    portalGroup.add(gearRingGroup);

    const gearCoreGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 48);
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0x223654,
      roughness: 0.22,
      metalness: 0.95,
    });
    const gearCoreMesh = new THREE.Mesh(gearCoreGeo, gearMat);
    gearRingGroup.add(gearCoreMesh);

    // Add 12 dimensional teeth/brackets along the ring
    const toothGeo = new THREE.BoxGeometry(0.12, 0.28, 0.16);
    const toothMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.35,
      metalness: 0.85,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0);
      tooth.rotation.z = angle;
      gearRingGroup.add(tooth);
    }

    // Part 4: Inner Golden Conductor Track with 6 Quantum Flux Coils
    const innerTrackGroup = new THREE.Group();
    innerTrackGroup.position.y = 2.4;
    portalGroup.add(innerTrackGroup);

    const innerTrackGeo = new THREE.TorusGeometry(1.75, 0.05, 16, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.18,
      metalness: 0.98,
    });
    const innerTrackMesh = new THREE.Mesh(innerTrackGeo, goldMat);
    innerTrackGroup.add(innerTrackMesh);

    const coilGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 12);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const coil = new THREE.Mesh(coilGeo, goldMat);
      coil.position.set(Math.cos(angle) * 1.75, Math.sin(angle) * 1.75, 0);
      coil.rotation.z = angle + Math.PI / 2;
      innerTrackGroup.add(coil);
    }

    // Part 5: Central Anomaly Iris / Singularity Core
    const irisGeo = new THREE.CircleGeometry(1.68, 48);
    const irisMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      emissive: 0x0369a1,
      emissiveIntensity: 0.7,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.85,
      ior: 1.45,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const irisMesh = new THREE.Mesh(irisGeo, irisMat);
    irisMesh.position.y = 2.4;
    portalGroup.add(irisMesh);

    // Singularity Core Sphere (Floating at center)
    const coreGeo = new THREE.IcosahedronGeometry(0.48, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 2.4;
    portalGroup.add(coreMesh);

    // Part 6: Soft Radial Contact Shadow Plane at ground level
    const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const radGrad = shadowCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
      radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      radGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = radGrad;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // Part 7: Ambient Cosmic Dust / Timeline Sparks (Instanced / Buffer Particles)
    const particleCount = isHeadless ? 60 : 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 4.5;
      particlePositions[i * 3] = Math.cos(theta) * radius;
      particlePositions[i * 3 + 1] = 0.4 + Math.random() * 4.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // Pointer Parallax Handler
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Lossless 60fps Animation Loop with Exponential Damping
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const spd = speedRef.current;

      // Animate gear rings
      gearRingGroup.rotation.z += 0.4 * delta * spd;
      innerTrackGroup.rotation.z -= 0.65 * delta * spd;
      coreMesh.rotation.x += 0.8 * delta * spd;
      coreMesh.rotation.y += 1.1 * delta * spd;

      // Color tuning
      const curColor = colorRef.current;
      if (curColor === 'cyan') {
        irisMat.emissive.setHex(0x0284c7);
        coreMat.color.setHex(0x38bdf8);
        coreMat.emissive.setHex(0x0284c7);
        particleMat.color.setHex(0x38bdf8);
      } else if (curColor === 'crimson') {
        irisMat.emissive.setHex(0xbe123c);
        coreMat.color.setHex(0xf43f5e);
        coreMat.emissive.setHex(0x9f1239);
        particleMat.color.setHex(0xfb7185);
      } else {
        irisMat.emissive.setHex(0xb45309);
        coreMat.color.setHex(0xfbbf24);
        coreMat.emissive.setHex(0x78350f);
        particleMat.color.setHex(0xfde047);
      }

      // Orbit particles slowly around portal
      particles.rotation.y += 0.1 * delta * spd;

      // Camera Damping + Subtle Parallax
      const targetX = targetCamPosRef.current.x + pointerRef.current.x * 0.4;
      const targetY = targetCamPosRef.current.y + pointerRef.current.y * 0.25;
      const targetZ = targetCamPosRef.current.z;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);
      camera.lookAt(0, 2.3, 0);

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pmremGenerator.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      baseRingGeo.dispose();
      baseRingMat.dispose();
      outerArchGeo.dispose();
      outerArchMat.dispose();
      gearCoreGeo.dispose();
      gearMat.dispose();
      toothGeo.dispose();
      toothMat.dispose();
      innerTrackGeo.dispose();
      goldMat.dispose();
      coilGeo.dispose();
      irisGeo.dispose();
      irisMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      runeTexture.dispose();
      shadowTex.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[620px] md:h-[720px] lg:h-[800px] overflow-hidden bg-[#050710] border-b border-slate-800/80">
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        data-testid="three-canvas-surface"
        aria-label="3D Interactive Quantum Portal Visualization"
      />

      {/* Top Overlay Briefing Badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-3 bg-[#0a0f1d]/90 border border-cyan-500/30 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-mono-tech text-cyan-300">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400" />
          <span>STATUS: ANOMALY ACTIVE</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">TACTICAL GATE: RUNTIME ONLINE</span>
        </div>
      </div>

      {/* Hero Content Surface Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center px-4 sm:px-6 text-center z-10 pt-10 sm:pt-0">
        <div className="max-w-3xl pointer-events-auto bg-[#070b18]/85 border border-slate-800/80 rounded-2xl p-4 sm:p-7 md:p-8 shadow-2xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-[10px] sm:text-xs font-mono-tech mb-2 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>CAMPUS MISSION BRIEFING • 2026</span>
          </div>

          <h1 className="text-2xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-wide leading-tight mb-2 sm:mb-4">
            THE CAMPUS <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              NEEDS YOU.
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-4 sm:mb-6 font-medium">
            One campus. Infinite possibilities. One team. A multiverse fracture has disrupted our
            academic timeline. Discover your mission, select your squad role, and assemble.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5">
            <button
              onClick={onJoinAssembly}
              className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold tracking-wider text-xs sm:text-sm font-display shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              JOIN THE ASSEMBLY
            </button>
            <button
              onClick={onExploreMissions}
              className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer hover:border-cyan-500/50"
            >
              EXPLORE MISSIONS
            </button>
          </div>
        </div>
      </div>

      {/* Viewport-First Collapsible Bottom Control Dock (Compliant with <=15% Footprint and Zero Viewport Occlusion) */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto transition-transform duration-300 ease-out"
        style={{
          maxWidth: 'min(920px, 94vw)',
          transform: controlsCollapsed
            ? 'translate(-50%, calc(100% - 32px))'
            : 'translate(-50%, 0)',
        }}
      >
        {/* Collapse / Expand Tab */}
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-lg bg-[#0c1324] border-t border-x border-slate-700/70 text-slate-300 text-xs font-mono-tech hover:text-cyan-400 transition-colors cursor-pointer"
          aria-label={controlsCollapsed ? 'Show 3D Viewport Controls' : 'Hide 3D Viewport Controls'}
        >
          {controlsCollapsed ? (
            <>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHOW 3D PORTAL CONTROLS</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>COLLAPSE / ZEN MODE</span>
            </>
          )}
        </button>

        {/* Dock Panel Surface (Solid/rgba surfaces, no backdrop-filter over WebGL) */}
        <div className="w-full bg-[#0a0f1e] border border-slate-800 rounded-b-xl rounded-tl-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Energy Resonance Swatches */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono-tech flex items-center gap-1">
              <Orbit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resonance:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEnergyColor('cyan')}
                className={`px-2.5 py-1 rounded-md font-mono-tech transition-colors cursor-pointer ${
                  energyColor === 'cyan'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Quantum Blue
              </button>
              <button
                onClick={() => setEnergyColor('crimson')}
                className={`px-2.5 py-1 rounded-md font-mono-tech transition-colors cursor-pointer ${
                  energyColor === 'crimson'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Anomaly Red
              </button>
              <button
                onClick={() => setEnergyColor('gold')}
                className={`px-2.5 py-1 rounded-md font-mono-tech transition-colors cursor-pointer ${
                  energyColor === 'gold'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Tachyon Gold
              </button>
            </div>
          </div>

          {/* Camera Angles */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono-tech flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Vector:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {(['front', 'hero', 'zenith'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveCameraView(view)}
                  className={`px-2 py-1 rounded-md uppercase font-mono-tech transition-colors cursor-pointer ${
                    activeCameraView === view
                      ? 'bg-slate-800 text-slate-100 border border-slate-600'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono-tech flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotation:</span>
            </span>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2].map(s => (
                <button
                  key={s}
                  onClick={() => setPortalSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono-tech cursor-pointer ${
                    portalSpeed === s
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
