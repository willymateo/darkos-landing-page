"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MARK } from "@/lib/mark";
import { seam } from "@/lib/seam";
import { MarkPoster } from "./Mark";

// One scene, drawn twice per frame through two scissor rectangles that meet at
// the seam. Left of it (or above it, on a phone) everything is the prototype:
// faceted wireframe, cold, never quite still. Right of it everything is the
// production build: the same objects, machined, lit, calm. Same camera, same
// positions, so the seam reads as a cut through one object rather than two
// pictures side by side.
//
// Planes, back to front, each moving at its own rate:
//   lattice   far field of points (ordered in prod, scattered in demo)
//   ring      an orbit line behind the subject
//   subject   the mark and its core
//   blades    three thin slabs close to the lens, passing fastest

type Mode = "hero" | "close";

const DEMO = 1;
const PROD = 2;
const GROUND_DEMO = new THREE.Color("#0B0D11");
const GROUND_PROD = new THREE.Color("#0D0B09");
const WIRE = new THREE.Color("#8E9BAF");
const TAN = new THREE.Color("#D6B88C");

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const smooth = (x: number) => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};

function markShape() {
  const s = new THREE.Shape();
  s.moveTo(MARK.stemX, -MARK.R);
  s.lineTo(MARK.stemX, MARK.R);
  s.lineTo(0, MARK.R);
  s.absarc(0, 0, MARK.R, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(MARK.stemX, -MARK.R);
  const hole = new THREE.Path();
  hole.moveTo(MARK.innerStemX, -MARK.r);
  hole.lineTo(0, -MARK.r);
  hole.absarc(0, 0, MARK.r, -Math.PI / 2, Math.PI / 2, false);
  hole.lineTo(MARK.innerStemX, MARK.r);
  hole.lineTo(MARK.innerStemX, -MARK.r);
  s.holes.push(hole);
  return s;
}

const DEPTH = 0.44;

function onLayer<T extends THREE.Object3D>(o: T, layer: number): T {
  o.traverse((c) => c.layers.set(layer));
  return o;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(214,184,140,0.55)");
  grd.addColorStop(0.45, "rgba(214,184,140,0.12)");
  grd.addColorStop(1, "rgba(214,184,140,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function SeamScene({ mode, className = "" }: { mode: Mode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const stage = wrap.closest<HTMLElement>("[data-sc-stage]") ?? wrap;
    const section = wrap.closest<HTMLElement>("section") ?? wrap;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    seam.start();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      wrap.dataset.webgl = "off"; // the SVG poster stays up
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    scene.fog = new THREE.Fog(GROUND_PROD, 8, 17);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

    // --- lights: production only, but enabled on every layer so the layer
    // filter never strips them from a pass.
    const key = new THREE.DirectionalLight("#F2D4AA", 2.6);
    key.position.set(3.5, 4, 5);
    const rim = new THREE.DirectionalLight("#9DB2D2", 1.6);
    rim.position.set(-5, 1.5, -3);
    const fill = new THREE.AmbientLight("#ffffff", 0.08);
    [key, rim, fill].forEach((l) => {
      l.layers.enableAll();
      scene.add(l);
    });

    const disposables: { dispose(): void }[] = [env, pmrem];
    const track = <T extends { dispose(): void }>(x: T) => {
      disposables.push(x);
      return x;
    };

    // --- subject -----------------------------------------------------------
    const subject = new THREE.Group();
    scene.add(subject);

    const prodGeo = track(
      new THREE.ExtrudeGeometry(markShape(), {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.035,
        bevelSegments: 6,
        curveSegments: 72,
      }),
    );
    prodGeo.translate(-MARK.centreX, 0, -DEPTH / 2);
    const metal = track(
      new THREE.MeshPhysicalMaterial({ color: "#2B2622", metalness: 1, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
    );
    const obsidian = track(
      new THREE.MeshPhysicalMaterial({ color: "#0B0B0D", metalness: 0.15, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04 }),
    );
    const prodMark = new THREE.Group();
    prodMark.add(new THREE.Mesh(prodGeo, metal));
    const core = new THREE.Mesh(track(new THREE.SphereGeometry(MARK.core.r, 64, 48)), obsidian);
    core.position.x = MARK.core.x - MARK.centreX;
    prodMark.add(core);
    subject.add(onLayer(prodMark, PROD));

    // Glow pool behind the finished object: light falling on a wall, not a halo.
    const glow = new THREE.Sprite(
      track(new THREE.SpriteMaterial({ map: track(glowTexture()), transparent: true, depthWrite: false, opacity: 0.5, fog: false })),
    );
    glow.scale.setScalar(6.5);
    glow.position.z = -1.6;
    subject.add(onLayer(glow, PROD));

    // The prototype: fewer segments, no bevel, a low-poly core.
    const demoGeo = track(new THREE.ExtrudeGeometry(markShape(), { depth: DEPTH, bevelEnabled: false, curveSegments: 7 }));
    demoGeo.translate(-MARK.centreX, 0, -DEPTH / 2);
    const wireMat = track(new THREE.LineBasicMaterial({ color: WIRE, transparent: true, opacity: 0.9 }));
    const demoMark = new THREE.Group();
    demoMark.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(demoGeo, 1)), wireMat));
    const demoCore = new THREE.LineSegments(
      track(new THREE.WireframeGeometry(track(new THREE.IcosahedronGeometry(MARK.core.r, 1)))),
      wireMat,
    );
    demoCore.position.x = MARK.core.x - MARK.centreX;
    demoMark.add(demoCore);
    subject.add(onLayer(demoMark, DEMO));

    // --- ring --------------------------------------------------------------
    const ring = new THREE.Group();
    ring.position.z = -1.4;
    scene.add(ring);
    const prodRing = new THREE.Mesh(
      track(new THREE.TorusGeometry(2.25, 0.006, 6, 220)),
      track(new THREE.MeshBasicMaterial({ color: TAN, transparent: true, opacity: 0.5 })),
    );
    ring.add(onLayer(prodRing, PROD));
    const circlePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      circlePts.push(new THREE.Vector3(Math.cos(a) * 2.25, Math.sin(a) * 2.25, 0));
    }
    const demoRing = new THREE.Line(
      track(new THREE.BufferGeometry().setFromPoints(circlePts)),
      track(new THREE.LineDashedMaterial({ color: WIRE, dashSize: 0.07, gapSize: 0.09, transparent: true, opacity: 0.55 })),
    );
    demoRing.computeLineDistances();
    ring.add(onLayer(demoRing, DEMO));

    // --- lattice -----------------------------------------------------------
    const lattice = new THREE.Group();
    lattice.position.z = -6;
    scene.add(lattice);
    const COLS = 34;
    const ROWS = 20;
    const N = COLS * ROWS;
    const ordered = new Float32Array(N * 3);
    const scattered = new Float32Array(N * 3);
    const home = new Float32Array(N * 3);
    for (let r = 0, i = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++, i++) {
        const x = (c - (COLS - 1) / 2) * 0.62;
        const y = (r - (ROWS - 1) / 2) * 0.62;
        ordered.set([x, y, 0], i * 3);
        const sx = x + (Math.random() - 0.5) * 0.9;
        const sy = y + (Math.random() - 0.5) * 0.9;
        const sz = (Math.random() - 0.5) * 1.6;
        scattered.set([sx, sy, sz], i * 3);
        home.set([sx, sy, sz], i * 3);
      }
    }
    const prodPts = new THREE.Points(
      track(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(ordered, 3))),
      track(new THREE.PointsMaterial({ color: "#9A8E80", size: 0.034, transparent: true, opacity: 0.6 })),
    );
    lattice.add(onLayer(prodPts, PROD));
    const demoAttr = new THREE.BufferAttribute(scattered, 3);
    const demoPts = new THREE.Points(
      track(new THREE.BufferGeometry().setAttribute("position", demoAttr)),
      track(new THREE.PointsMaterial({ color: WIRE, size: 0.03, transparent: true, opacity: 0.5 })),
    );
    lattice.add(onLayer(demoPts, DEMO));

    // --- blades ------------------------------------------------------------
    const blades = new THREE.Group();
    blades.position.z = 2.4;
    scene.add(blades);
    const bladeGeo = track(new THREE.BoxGeometry(0.07, 3.4, 0.55));
    const bladeMat = track(new THREE.MeshPhysicalMaterial({ color: "#1C1916", metalness: 0.9, roughness: 0.42 }));
    const bladeEdges = track(new THREE.EdgesGeometry(bladeGeo));
    const bladeSpec =
      mode === "hero"
        ? [
            { x: -3.3, y: 0.5, rz: 0.12, s: 1, dir: -1 },
            { x: 3.5, y: -0.4, rz: -0.1, s: 1, dir: 1 },
            { x: 1.9, y: -2.7, rz: 0.55, s: 0.7, dir: 1 },
          ]
        : [{ x: -2.6, y: 1.9, rz: 0.4, s: 0.8, dir: -1 }];
    const bladeObjs = bladeSpec.map((b) => {
      const g = new THREE.Group();
      g.add(onLayer(new THREE.Mesh(bladeGeo, bladeMat), PROD));
      g.add(onLayer(new THREE.LineSegments(bladeEdges, wireMat), DEMO));
      g.rotation.set(0.15, 0.5 * b.dir, b.rz);
      g.scale.setScalar(b.s);
      blades.add(g);
      return { g, ...b };
    });

    // --- layout --------------------------------------------------------------
    let W = 1;
    let H = 1;
    let narrow = false;
    const resize = () => {
      W = Math.max(1, canvas.clientWidth);
      H = Math.max(1, canvas.clientHeight);
      narrow = seam.narrow;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      draw();
    };

    // Where on the canvas the subject sits, as fractions, and how big.
    const placement = () => {
      if (mode === "hero") return narrow ? { fx: 0.5, fy: 0.5, scale: 0.52 } : { fx: 0.5, fy: 0.5, scale: 0.8 };
      return narrow ? { fx: 0.5, fy: 0.6, scale: 0.5 } : { fx: 0.47, fy: 0.56, scale: 0.78 };
    };

    // --- motion state ---------------------------------------------------------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      if (!fine.matches || reduce) return;
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onPointer, { passive: true });

    let glitchUntil = 0;
    let nextGlitch = performance.now() + 1600;
    let first = true;

    function progress() {
      const r = section.getBoundingClientRect();
      return clamp(-r.top / Math.max(r.height - innerHeight, 1), 0, 1);
    }

    function draw(now = performance.now()) {
      const p = progress();
      const e = smooth(p);
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const t = reduce ? 0 : now / 1000;

      // camera
      const baseZ = mode === "hero" ? 9.4 - 1.5 * e : 9.2 - 0.6 * e;
      camera.position.set(pointer.x * 0.38, (mode === "hero" ? -0.35 * e : 0) - pointer.y * 0.22, baseZ);
      camera.lookAt(0, mode === "hero" ? -0.2 * e : 0, 0);

      // subject placement in world units at z = 0
      const pl = placement();
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * baseZ;
      const halfW = halfH * camera.aspect;
      subject.position.set((pl.fx - 0.5) * 2 * halfW, (0.5 - pl.fy) * 2 * halfH, 0);
      subject.scale.setScalar(pl.scale);
      const spin = mode === "hero" ? -0.2 + e * 0.75 : -0.5 + e * 0.6;
      subject.rotation.set(0.06 + Math.sin(t * 0.35) * 0.03, spin + Math.sin(t * 0.22) * 0.06, 0);
      ring.position.x = subject.position.x;
      ring.position.y = subject.position.y;
      ring.scale.setScalar(pl.scale * (1 + 0.08 * e));
      ring.rotation.z = e * 0.5;

      // far plane barely moves, near plane passes fastest
      lattice.position.y = 0.3 * e;
      bladeObjs.forEach((b) => {
        b.g.position.set(b.x + b.dir * 1.5 * e, b.y + 1.3 * e, 0);
      });

      // the prototype never sits still
      if (!reduce) {
        const glitching = now < glitchUntil;
        if (now > nextGlitch) {
          glitchUntil = now + 90 + Math.random() * 70;
          nextGlitch = now + 1400 + Math.random() * 2200;
        }
        const j = 0.006;
        demoMark.position.set(
          (Math.random() - 0.5) * j + (glitching ? 0.07 : 0),
          (Math.random() - 0.5) * j,
          0,
        );
        demoMark.scale.set(1, glitching ? 1.04 : 1, 1);
        for (let i = 0; i < N; i++) {
          const k = i * 3;
          scattered[k] = home[k] + Math.sin(t * 1.7 + i) * 0.03;
          scattered[k + 1] = home[k + 1] + Math.cos(t * 1.3 + i * 1.7) * 0.03;
        }
        demoAttr.needsUpdate = true;
      }

      // split
      const cr = canvas.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      let split: number; // fraction of the canvas that is demo
      renderer.setScissorTest(false);
      renderer.clear();
      renderer.setScissorTest(true);
      if (!narrow) {
        const x = clamp(seam.value * document.documentElement.clientWidth - cr.left, 0, W);
        split = x / W;
        pass(DEMO, GROUND_DEMO, 0, 0, x, H);
        pass(PROD, GROUND_PROD, x, 0, W - x, H);
      } else {
        const y = clamp(seam.value * sr.height + sr.top - cr.top, 0, H); // from the top
        split = y / H;
        pass(DEMO, GROUND_DEMO, 0, H - y, W, y);
        pass(PROD, GROUND_PROD, 0, 0, W, H - y);
      }
      wrap.style.setProperty("--split", `${(split * 100).toFixed(2)}%`);
      wrap.dataset.scVerifyState = `${mode} z${baseZ.toFixed(2)} r${spin.toFixed(2)} s${split.toFixed(2)}`;

      if (first) {
        first = false;
        wrap.dataset.webgl = "on";
      }
    }

    function pass(layer: number, ground: THREE.Color, x: number, y: number, w: number, h: number) {
      if (w <= 0.5 || h <= 0.5) return;
      (scene.fog as THREE.Fog).color.copy(ground);
      camera.layers.set(layer);
      renderer.setScissor(x, y, w, h);
      renderer.render(scene, camera);
    }

    // --- loop: only while on screen -----------------------------------------------
    let visible = false;
    let raf = 0;
    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      wake();
    });
    io.observe(wrap);
    const unsub = seam.subscribe(() => wake());
    addEventListener("scroll", wake, { passive: true });
    document.addEventListener("visibilitychange", wake);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      unsub();
      removeEventListener("scroll", wake);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", wake);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [mode]);

  return (
    <div ref={wrapRef} className={`seam-scene seam-scene--${mode} ${className}`} data-webgl="pending">
      <MarkPoster className="seam-scene__poster" />
      <canvas ref={canvasRef} className="seam-scene__canvas" aria-hidden="true" />
    </div>
  );
}
