/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Unified Interactive 3D Human Body Model (Three.js WebGL)
 * 
 * Features:
 *  - 360° orbital rotation, smooth inertia, damping
 *  - Zoom in / Zoom out (mouse wheel & UI controls)
 *  - Pan & Repositioning (right click / two-finger drag & on-screen pan)
 *  - Preset views: Anterior (Front), Posterior (Back), Lateral Left, Lateral Right, Superior / Internal
 *  - Reset View button
 *  - Clickable 3D organs with raycasting & hover tooltips
 *  - Organ Isolation / Focus mode (zooms into organ & dims body shell)
 *  - Anatomical Structure Visibility Toggles (Body Shell, Skeleton, Vessels, Nerves, Organs)
 *  - Dynamic biometrics sync: Synchronized cardiac pulse, respiratory cycle, neural synapse glow
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ANATOMICAL_ORGANS_DATA } from '../../data/anatomicalOrganData';
import { DailyAssessmentRecord } from '../../types/health';
import {
  Rotate3d,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Crosshair,
  Layers,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface UnifiedHumanBody3DProps {
  latestAssessment?: DailyAssessmentRecord;
  selectedOrganId: string;
  onSelectOrgan: (organId: string) => void;
  isIsolatedView?: boolean;
  onToggleIsolation?: () => void;
  height?: number | string;
}

export const UnifiedHumanBody3D: React.FC<UnifiedHumanBody3DProps> = ({
  latestAssessment,
  selectedOrganId,
  onSelectOrgan,
  isIsolatedView = false,
  onToggleIsolation,
  height = 680,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Anatomical Structure Layer Visibility Toggles
  const [showBodyShell, setShowBodyShell] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showNerves, setShowNerves] = useState(true);
  const [showOrgans, setShowOrgans] = useState(true);

  // Three.js control refs
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const twinRootRef = useRef<THREE.Group | null>(null);
  const organMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  // Camera & rotation state
  const targetRotRef = useRef<{ x: number; y: number }>({ x: 0.05, y: 0 });
  const currentRotRef = useRef<{ x: number; y: number }>({ x: 0.05, y: 0 });
  const targetPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 1.6 });
  const currentPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 1.6 });
  const targetZoomRef = useRef<number>(9.8);
  const currentZoomRef = useRef<number>(9.8);
  const autoRotateRef = useRef<boolean>(false);
  autoRotateRef.current = isAutoRotating;

  const hr = latestAssessment?.values.heartRate || 72;

  // Selected organ data
  const currentOrgan = ANATOMICAL_ORGANS_DATA[selectedOrganId] || ANATOMICAL_ORGANS_DATA.heart;

  // Camera presets
  const setPresetAngle = (view: 'anterior' | 'posterior' | 'lateral_l' | 'lateral_r' | 'superior' | 'reset') => {
    setIsAutoRotating(false);
    switch (view) {
      case 'anterior':
        targetRotRef.current = { x: 0.02, y: 0 };
        targetPanRef.current = { x: 0, y: 1.6 };
        targetZoomRef.current = 9.8;
        break;
      case 'posterior':
        targetRotRef.current = { x: 0.02, y: Math.PI };
        targetPanRef.current = { x: 0, y: 1.6 };
        targetZoomRef.current = 9.8;
        break;
      case 'lateral_l':
        targetRotRef.current = { x: 0.02, y: Math.PI / 2 };
        targetPanRef.current = { x: 0, y: 1.6 };
        targetZoomRef.current = 9.8;
        break;
      case 'lateral_r':
        targetRotRef.current = { x: 0.02, y: -Math.PI / 2 };
        targetPanRef.current = { x: 0, y: 1.6 };
        targetZoomRef.current = 9.8;
        break;
      case 'superior':
        targetRotRef.current = { x: 0.65, y: 0.45 };
        targetPanRef.current = { x: 0, y: 2.2 };
        targetZoomRef.current = 7.5;
        break;
      case 'reset':
        targetRotRef.current = { x: 0.05, y: 0 };
        targetPanRef.current = { x: 0, y: 1.6 };
        targetZoomRef.current = 9.8;
        break;
    }
  };

  const handleZoom = (delta: number) => {
    targetZoomRef.current = Math.max(4.0, Math.min(14.0, targetZoomRef.current + delta));
  };

  const handlePan = (dx: number, dy: number) => {
    targetPanRef.current.x += dx;
    targetPanRef.current.y += dy;
  };

  // Center on selected organ when isolated or clicked
  useEffect(() => {
    if (isIsolatedView && currentOrgan) {
      const [ox, oy, _oz] = currentOrgan.position3D;
      targetPanRef.current = { x: -ox * 0.8, y: oy };
      targetZoomRef.current = 5.2;
    }
  }, [isIsolatedView, selectedOrganId, currentOrgan]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 680;

    // ── Scene / Camera / Renderer ──────────────────────────────────────
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x060b19, 0.028);

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(0, 1.6, 9.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── Lighting ───────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0e2246, 2.5));

    const keyLight = new THREE.DirectionalLight(0x00f0ff, 3.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 2.2);
    fillLight.position.set(-5, 0, -4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 5, 20);
    rimLight.position.set(0, 4.5, -5.5);
    scene.add(rimLight);

    const warmOrganLight = new THREE.PointLight(0xf43f5e, 2.0, 10);
    warmOrganLight.position.set(0, 2.5, 3.0);
    scene.add(warmOrganLight);

    // ── Root Group ─────────────────────────────────────────────────────
    const twinRoot = new THREE.Group();
    twinRootRef.current = twinRoot;
    scene.add(twinRoot);

    // ── Sub-groups for layered visibility ──────────────────────────────
    const shellGroup = new THREE.Group();
    const skeletonGroup = new THREE.Group();
    const vascularGroup = new THREE.Group();
    const neuralGroup = new THREE.Group();
    const organsGroup = new THREE.Group();

    twinRoot.add(shellGroup);
    twinRoot.add(skeletonGroup);
    twinRoot.add(vascularGroup);
    twinRoot.add(neuralGroup);
    twinRoot.add(organsGroup);

    // ── Holographic Base Pod ───────────────────────────────────────────
    const baseGroup = new THREE.Group();
    baseGroup.position.y = -2.7;

    const ringMatCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5, wireframe: true });
    const ringMatBlue = new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.35, wireframe: true });
    const diskMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.12 });

    const outerRing = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.8, 64), ringMatCyan);
    outerRing.rotation.x = -Math.PI / 2;
    baseGroup.add(outerRing);

    const innerRing = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.55, 48), ringMatBlue);
    innerRing.rotation.x = -Math.PI / 2;
    baseGroup.add(innerRing);

    const glowDisk = new THREE.Mesh(new THREE.CircleGeometry(2.8, 64), diskMat);
    glowDisk.rotation.x = -Math.PI / 2;
    baseGroup.add(glowDisk);

    scene.add(baseGroup);

    // ── Holographic Body Shell (Silhouette / Contour) ──────────────────
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x072847,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.85,
      transparent: true,
      opacity: isIsolatedView ? 0.08 : 0.32,
    });
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: isIsolatedView ? 0.04 : 0.16,
    });

    const addBodyPart = (geo: THREE.BufferGeometry, pos: [number, number, number], rot?: [number, number, number], scale?: [number, number, number]) => {
      const g = new THREE.Group();
      g.position.set(...pos);
      if (rot) g.rotation.set(...rot);
      if (scale) g.scale.set(...scale);
      g.add(new THREE.Mesh(geo, shellMat));
      g.add(new THREE.Mesh(geo, wireMat));
      shellGroup.add(g);
      return g;
    };

    // Cranium & Head
    const craniumGeo = new THREE.SphereGeometry(0.58, 28, 28);
    craniumGeo.scale(0.88, 1.2, 0.96);
    addBodyPart(craniumGeo, [0, 4.45, 0]);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.20, 0.28, 0.50, 20);
    addBodyPart(neckGeo, [0, 3.72, 0]);

    // Torso (Thorax, Abdomen, Pelvis)
    const thoraxGeo = new THREE.CylinderGeometry(0.92, 0.82, 0.88, 24);
    thoraxGeo.scale(1.22, 1.0, 0.70);
    addBodyPart(thoraxGeo, [0, 3.12, 0]);

    const abdomenGeo = new THREE.CylinderGeometry(0.82, 0.75, 0.80, 24);
    abdomenGeo.scale(1.10, 1.0, 0.66);
    addBodyPart(abdomenGeo, [0, 2.30, 0]);

    const pelvisGeo = new THREE.CylinderGeometry(0.88, 0.76, 0.65, 24);
    pelvisGeo.scale(1.14, 1.0, 0.72);
    addBodyPart(pelvisGeo, [0, 1.45, 0]);

    // Arms
    const upperArmGeo = new THREE.CylinderGeometry(0.20, 0.16, 1.20, 16);
    const forearmGeo = new THREE.CylinderGeometry(0.16, 0.12, 1.15, 16);
    const handGeo = new THREE.BoxGeometry(0.18, 0.28, 0.08);

    // Left Arm
    addBodyPart(upperArmGeo, [-1.35, 2.80, 0], [0, 0, 0.20]);
    addBodyPart(forearmGeo, [-1.62, 1.62, 0.06], [0, 0, 0.10]);
    addBodyPart(handGeo, [-1.72, 0.95, 0.06]);

    // Right Arm
    addBodyPart(upperArmGeo, [1.35, 2.80, 0], [0, 0, -0.20]);
    addBodyPart(forearmGeo, [1.62, 1.62, 0.06], [0, 0, -0.10]);
    addBodyPart(handGeo, [1.72, 0.95, 0.06]);

    // Legs
    const thighGeo = new THREE.CylinderGeometry(0.38, 0.28, 1.70, 20);
    const shinGeo = new THREE.CylinderGeometry(0.24, 0.18, 1.65, 18);
    const footGeo = new THREE.BoxGeometry(0.24, 0.16, 0.68);

    // Left Leg
    addBodyPart(thighGeo, [-0.50, 0.45, 0], [0, 0, -0.04]);
    addBodyPart(shinGeo, [-0.52, -1.20, 0]);
    addBodyPart(footGeo, [-0.52, -2.18, 0.18]);

    // Right Leg
    addBodyPart(thighGeo, [0.50, 0.45, 0], [0, 0, 0.04]);
    addBodyPart(shinGeo, [0.52, -1.20, 0]);
    addBodyPart(footGeo, [0.52, -2.18, 0.18]);

    // ── Skeletal Framework (Spine, Ribs, Clavicles, Pelvic Rim) ────────
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.2,
      transparent: true,
      opacity: isIsolatedView && selectedOrganId !== 'bones' ? 0.12 : 0.75,
    });

    // Vertebrae chain (C1 - L5)
    for (let i = 0; i < 18; i++) {
      const vY = 1.25 + i * 0.15;
      const vGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.06, 14);
      const vMesh = new THREE.Mesh(vGeo, boneMat);
      vMesh.position.set(0, vY, -0.18);
      skeletonGroup.add(vMesh);
    }

    // Rib cage curves
    const ribLineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: isIsolatedView && selectedOrganId !== 'bones' ? 0.10 : 0.45,
    });
    for (let r = 0; r < 8; r++) {
      const rY = 2.65 + r * 0.16;
      const rx = 0.92 - r * 0.035;
      const rz = 0.52 - r * 0.025;
      const arc = new THREE.EllipseCurve(0, 0, rx, rz, 0, Math.PI, false, 0);
      const pts = arc.getPoints(24).map((p) => new THREE.Vector3(p.x, rY, p.y));
      skeletonGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ribLineMat));
    }

    // Clavicle bar
    const clavicleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 12);
    const clavicleMesh = new THREE.Mesh(clavicleGeo, boneMat);
    clavicleMesh.position.set(0, 3.48, 0.02);
    clavicleMesh.rotation.z = Math.PI / 2;
    skeletonGroup.add(clavicleMesh);

    // ── Vascular Network (Aorta, Vena Cava, Femoral/Brachial Arcs) ────
    const artLineMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: isIsolatedView && selectedOrganId !== 'vessels' ? 0.12 : 0.65,
    });
    const venLineMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: isIsolatedView && selectedOrganId !== 'vessels' ? 0.12 : 0.55,
    });

    const createVesselLine = (points: THREE.Vector3[], mat: THREE.LineBasicMaterial) => {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)), mat);
    };

    // Aortic arch & descending aorta
    vascularGroup.add(createVesselLine([
      new THREE.Vector3(-0.15, 2.95, 0.35),
      new THREE.Vector3(-0.05, 3.35, 0.20),
      new THREE.Vector3(0, 2.80, -0.05),
      new THREE.Vector3(0, 1.80, -0.08),
      new THREE.Vector3(-0.25, 0.80, 0.02),
      new THREE.Vector3(-0.48, -0.80, 0.02),
    ], artLineMat));

    vascularGroup.add(createVesselLine([
      new THREE.Vector3(-0.15, 2.95, 0.35),
      new THREE.Vector3(-0.05, 3.35, 0.20),
      new THREE.Vector3(0, 2.80, -0.05),
      new THREE.Vector3(0, 1.80, -0.08),
      new THREE.Vector3(0.25, 0.80, 0.02),
      new THREE.Vector3(0.48, -0.80, 0.02),
    ], artLineMat));

    // Vena cava return
    vascularGroup.add(createVesselLine([
      new THREE.Vector3(0.10, 3.35, 0.15),
      new THREE.Vector3(0.10, 2.80, 0.20),
      new THREE.Vector3(0.12, 1.70, 0.05),
      new THREE.Vector3(0.48, 0.50, 0.02),
      new THREE.Vector3(0.50, -1.0, 0.02),
    ], venLineMat));

    // ── Neural Pathways (Spinal cord & Branches) ───────────────────────
    const nerveMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: isIsolatedView && selectedOrganId !== 'nervous' ? 0.12 : 0.65,
    });
    // Spinal cord central tract
    vascularGroup.add(createVesselLine([
      new THREE.Vector3(0, 4.10, -0.05),
      new THREE.Vector3(0, 3.20, -0.15),
      new THREE.Vector3(0, 2.00, -0.16),
      new THREE.Vector3(0, 1.30, -0.12),
    ], nerveMat));

    // ── Interactive 3D Organs ──────────────────────────────────────────
    const organNodes = new Map<string, THREE.Group>();
    organMeshesRef.current = organNodes;

    Object.values(ANATOMICAL_ORGANS_DATA).forEach((organ) => {
      const g = new THREE.Group();
      g.position.set(...organ.position3D);
      g.userData = { organId: organ.id, organName: organ.name };

      const baseColor = new THREE.Color(organ.color);
      const isSelected = organ.id === selectedOrganId;
      const isDimmed = isIsolatedView && !isSelected;

      let organGeo: THREE.BufferGeometry;

      // Create tailored 3D geometries for each organ
      if (organ.id === 'heart') {
        organGeo = new THREE.SphereGeometry(organ.scale3D[0], 24, 24);
        organGeo.scale(1.0, 1.25, 0.95);
      } else if (organ.id === 'brain') {
        organGeo = new THREE.SphereGeometry(organ.scale3D[0], 28, 28);
        organGeo.scale(1.12, 0.95, 1.08);
      } else if (organ.id === 'lungs') {
        // Dual lung lobes representation
        organGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.65, 20);
        organGeo.scale(1.5, 1.0, 0.8);
      } else if (organ.id === 'liver') {
        organGeo = new THREE.ConeGeometry(0.38, 0.45, 20);
        organGeo.scale(1.3, 0.8, 1.1);
        organGeo.rotateZ(-Math.PI / 4);
      } else if (organ.id === 'kidneys') {
        organGeo = new THREE.SphereGeometry(0.18, 18, 18);
        organGeo.scale(1.8, 0.9, 0.8);
      } else if (organ.id === 'stomach') {
        organGeo = new THREE.TorusGeometry(0.18, 0.12, 14, 24, Math.PI * 1.2);
      } else if (organ.id === 'pancreas') {
        organGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.45, 16);
        organGeo.rotateZ(Math.PI / 2.3);
      } else if (organ.id === 'spleen') {
        organGeo = new THREE.SphereGeometry(0.16, 16, 16);
        organGeo.scale(0.8, 1.3, 0.9);
      } else if (organ.id === 'intestines') {
        organGeo = new THREE.TorusKnotGeometry(0.22, 0.08, 48, 12, 2, 3);
      } else if (organ.id === 'bladder') {
        organGeo = new THREE.SphereGeometry(0.18, 18, 18);
        organGeo.scale(1.0, 0.9, 0.95);
      } else if (organ.id === 'bones') {
        organGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.85, 16);
      } else if (organ.id === 'muscles') {
        organGeo = new THREE.BoxGeometry(0.25, 0.65, 0.15);
      } else {
        organGeo = new THREE.SphereGeometry(0.20, 18, 18);
      }

      // Material with vibrant glowing shader parameters
      const organMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: isSelected ? 4.5 : isDimmed ? 0.35 : 2.2,
        roughness: 0.15,
        metalness: 0.45,
        transparent: true,
        opacity: isDimmed ? 0.15 : 0.88,
      });

      const mesh = new THREE.Mesh(organGeo, organMat);
      g.add(mesh);

      // Pulsing Aura Ring around selected organ
      const auraMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.75 : 0.35,
      });
      const auraRing = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.42, 32), auraMat);
      g.add(auraRing);

      // Diagnostic pinpoint line
      const pointerLineMat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: isSelected ? 0.90 : 0.40,
      });
      const pointerLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.42, 0.35, 0.18),
        ]),
        pointerLineMat
      );
      g.add(pointerLine);

      organsGroup.add(g);
      organNodes.set(organ.id, g);
    });

    // ── Particle Hologram Cloud ────────────────────────────────────────
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 6.5;
      pPos[i + 1] = Math.random() * 7.5 - 2.5;
      pPos[i + 2] = (Math.random() - 0.5) * 6.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.038,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(particles);

    // ── Mouse & Touch Controls (Orbital Rotation, Pan, Zoom) ───────────
    let isDragging = false;
    let isPanning = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Right button or middle button = pan; Left button = rotate
      if (e.button === 2 || e.button === 1 || e.shiftKey) {
        isPanning = true;
      } else {
        isDragging = true;
        setIsAutoRotating(false);
      }
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Handle dragging / rotation
      if (isDragging) {
        targetRotRef.current.y += (e.clientX - prevX) * 0.009;
        targetRotRef.current.x = Math.max(-0.55, Math.min(0.70, targetRotRef.current.x + (e.clientY - prevY) * 0.006));
        prevX = e.clientX;
        prevY = e.clientY;
        return;
      }

      // Handle panning
      if (isPanning) {
        targetPanRef.current.x += (e.clientX - prevX) * 0.008;
        targetPanRef.current.y -= (e.clientY - prevY) * 0.008;
        prevX = e.clientX;
        prevY = e.clientY;
        return;
      }

      // Raycasting for hover tooltip
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const targetMeshes: THREE.Object3D[] = [];
      organNodes.forEach((grp) => {
        if (grp.children[0]) targetMeshes.push(grp.children[0]);
      });

      const hits = raycaster.intersectObjects(targetMeshes, false);
      if (hits.length > 0) {
        const id = hits[0].object.parent?.userData.organId as string;
        if (id) {
          setHoveredOrgan(id);
          setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredOrgan(null);
      renderer.domElement.style.cursor = 'grab';
    };

    const onMouseUp = () => {
      isDragging = false;
      isPanning = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomRef.current = Math.max(4.0, Math.min(14.0, targetZoomRef.current + e.deltaY * 0.006));
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent default browser context menu for smooth right-click panning
    };

    // Touch controls
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        setIsAutoRotating(false);
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isPanning = true;
        prevX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        prevY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        targetRotRef.current.y += (e.touches[0].clientX - prevX) * 0.012;
        targetRotRef.current.x = Math.max(-0.55, Math.min(0.70, targetRotRef.current.x + (e.touches[0].clientY - prevY) * 0.008));
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      } else if (isPanning && e.touches.length === 2) {
        const curX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const curY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        targetPanRef.current.x += (curX - prevX) * 0.010;
        targetPanRef.current.y -= (curY - prevY) * 0.010;
        prevX = curX;
        prevY = curY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      isPanning = false;
    };

    // Click selection
    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const targetMeshes: THREE.Object3D[] = [];
      organNodes.forEach((grp) => {
        if (grp.children[0]) targetMeshes.push(grp.children[0]);
      });

      const hits = raycaster.intersectObjects(targetMeshes, false);
      if (hits.length > 0) {
        const organId = hits[0].object.parent?.userData.organId as string;
        if (organId) {
          onSelectOrgan(organId);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    dom.addEventListener('click', onClick);

    // ── Animation Loop ─────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Auto-rotation
      if (autoRotateRef.current) {
        targetRotRef.current.y += 0.005;
      }

      // Smooth inertia damping
      currentRotRef.current.y += (targetRotRef.current.y - currentRotRef.current.y) * 0.09;
      currentRotRef.current.x += (targetRotRef.current.x - currentRotRef.current.x) * 0.09;
      currentPanRef.current.x += (targetPanRef.current.x - currentPanRef.current.x) * 0.09;
      currentPanRef.current.y += (targetPanRef.current.y - currentPanRef.current.y) * 0.09;
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.09;

      twinRoot.rotation.y = currentRotRef.current.y;
      twinRoot.rotation.x = currentRotRef.current.x;
      twinRoot.position.x = currentPanRef.current.x;
      twinRoot.position.y = currentPanRef.current.y - 1.6;

      camera.position.z = currentZoomRef.current;

      // Base pod rotations
      outerRing.rotation.z = t * 0.15;
      innerRing.rotation.z = -t * 0.28;

      // Sync Heart pulse to HR
      const heartGrp = organNodes.get('heart');
      if (heartGrp) {
        const bps = hr / 60;
        const bt = (t * bps * Math.PI * 2) % (Math.PI * 2);
        const beat = 1.0 + Math.sin(bt) * 0.14 + (Math.sin(bt * 2) > 0 ? Math.sin(bt * 2) * 0.08 : 0);
        heartGrp.scale.set(beat, beat, beat);
      }

      // Sync Lung respiration
      const lungGrp = organNodes.get('lungs');
      if (lungGrp) {
        const breath = 1.0 + Math.sin(t * 0.45) * 0.08;
        lungGrp.scale.set(breath, breath * 1.04, breath);
      }

      // Brain synaptic scintillation
      const brainGrp = organNodes.get('brain');
      if (brainGrp) {
        const syn = 1.0 + Math.sin(t * 3.5) * 0.05;
        brainGrp.scale.set(syn, syn, syn);
      }

      // Billboard aura rings to face camera
      organNodes.forEach((grp) => {
        if (grp.children[1]) {
          grp.children[1].quaternion.copy(camera.quaternion);
        }
      });

      // Highlight selected organ
      organNodes.forEach((grp, id) => {
        const isSelected = id === selectedOrganId;
        const mesh = grp.children[0] as THREE.Mesh;
        if (mesh && mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = isSelected ? 4.8 : isIsolatedView ? 0.35 : 2.2;
        }
      });

      // Update layer visibilities
      shellGroup.visible = showBodyShell;
      skeletonGroup.visible = showSkeleton;
      vascularGroup.visible = showVessels;
      neuralGroup.visible = showNerves;
      organsGroup.visible = showOrgans;

      particles.rotation.y = t * 0.025;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = typeof height === 'number' ? height : container.clientHeight || 680;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [height, hr, isIsolatedView, selectedOrganId, showBodyShell, showSkeleton, showVessels, showNerves, showOrgans]);

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#080d22] via-[#060a1a] to-[#040714] border border-cyan-500/30 shadow-2xl overflow-hidden select-none">
      
      {/* ── Top Floating Telemetry & View Controls Bar ──────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#09112a]/85 backdrop-blur-md border border-cyan-500/30 shadow-lg">
        
        {/* Active Model Indicator */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono">
          <Rotate3d className={`w-4 h-4 text-cyan-400 ${isAutoRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          <div>
            <span className="font-extrabold text-white tracking-wider block">3D HUMAN ANATOMICAL MODEL</span>
            <span className="text-[10px] text-cyan-300 font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Full 360° Rotational Space • {hr} BPM Sync
            </span>
          </div>
        </div>

        {/* Camera Preset Buttons (Anterior, Posterior, Lateral, Superior, Reset) */}
        <div className="flex items-center gap-1 bg-[#060a1a] p-1 rounded-xl border border-blue-500/20 text-xs font-mono">
          <button
            onClick={() => setPresetAngle('anterior')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-all"
            title="Anterior (Frontal View 0°)"
          >
            Anterior
          </button>
          <button
            onClick={() => setPresetAngle('posterior')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-all"
            title="Posterior (Back View 180°)"
          >
            Posterior
          </button>
          <button
            onClick={() => setPresetAngle('lateral_l')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-all"
            title="Left Lateral View 90°"
          >
            Lat (L)
          </button>
          <button
            onClick={() => setPresetAngle('lateral_r')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-all"
            title="Right Lateral View -90°"
          >
            Lat (R)
          </button>
          <button
            onClick={() => setPresetAngle('superior')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-blue-600/30 transition-all"
            title="Internal / Superior View"
          >
            Internal
          </button>
          <button
            onClick={() => setPresetAngle('reset')}
            className="px-2 py-1 rounded-lg text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1"
            title="Reset Camera View to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Manipulation Controls (Auto-Rotate, Zoom, Pan, Isolate) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1 transition-all ${
              isAutoRotating
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-[#060a1a] border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle 360° Continuous Orbit Rotation"
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>{isAutoRotating ? 'Auto On' : 'Auto 360°'}</span>
          </button>

          <button
            onClick={() => handleZoom(-1.2)}
            className="p-1.5 rounded-xl bg-[#060a1a] border border-slate-700 text-slate-300 hover:text-white hover:bg-cyan-600/20 transition-all"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleZoom(1.2)}
            className="p-1.5 rounded-xl bg-[#060a1a] border border-slate-700 text-slate-300 hover:text-white hover:bg-cyan-600/20 transition-all"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {onToggleIsolation && (
            <button
              onClick={onToggleIsolation}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                isIsolatedView
                  ? 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-400 text-amber-200 shadow-md shadow-amber-950/40'
                  : 'bg-[#060a1a] border-slate-700 text-slate-300 hover:text-white hover:bg-blue-600/20'
              }`}
              title="Isolate / Focus on Selected Organ in 3D"
            >
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>{isIsolatedView ? 'Isolated View' : 'Focus Organ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Left Side: Anatomical Structure Layer Visibility Toggles ───── */}
      <div className="absolute top-20 left-3 z-20 flex flex-col gap-1.5 p-2 rounded-2xl bg-[#09112a]/80 backdrop-blur-md border border-cyan-500/20 shadow-lg text-[11px] font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 font-bold border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>STRUCTURES</span>
        </div>

        <button
          onClick={() => setShowBodyShell(!showBodyShell)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl transition-all ${
            showBodyShell ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Outer Body Shell (Dermal Surface)"
        >
          <span>Body Shell</span>
          {showBodyShell ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
        </button>

        <button
          onClick={() => setShowSkeleton(!showSkeleton)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl transition-all ${
            showSkeleton ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Skeletal Cage & Spine"
        >
          <span>Skeleton</span>
          {showSkeleton ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
        </button>

        <button
          onClick={() => setShowVessels(!showVessels)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl transition-all ${
            showVessels ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Vascular Arteries & Veins"
        >
          <span>Vascular</span>
          {showVessels ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
        </button>

        <button
          onClick={() => setShowNerves(!showNerves)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl transition-all ${
            showNerves ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Peripheral & Spinal Nerves"
        >
          <span>Nerves</span>
          {showNerves ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
        </button>

        <button
          onClick={() => setShowOrgans(!showOrgans)}
          className={`flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl transition-all ${
            showOrgans ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Internal Organs"
        >
          <span>Organs</span>
          {showOrgans ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
        </button>
      </div>

      {/* ── On-screen Reposition / Pan D-Pad ────────────────────────────── */}
      <div className="absolute bottom-20 left-3 z-20 flex flex-col items-center p-1.5 rounded-2xl bg-[#09112a]/75 backdrop-blur-md border border-cyan-500/20 shadow-lg">
        <button
          onClick={() => handlePan(0, 0.35)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-500/20"
          title="Pan Up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePan(-0.35, 0)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-500/20"
            title="Pan Left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
          </div>
          <button
            onClick={() => handlePan(0.35, 0)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-500/20"
            title="Pan Right"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={() => handlePan(0, -0.35)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-500/20"
          title="Pan Down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Active Selection HUD Callout Pin ────────────────────────────── */}
      <div className="absolute top-20 right-3 z-20 p-3 rounded-2xl bg-[#09112a]/85 backdrop-blur-md border border-cyan-500/30 shadow-xl max-w-xs text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-1.5">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            Selected Structure
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: `${currentOrgan.color}25`, color: currentOrgan.color, border: `1px solid ${currentOrgan.color}50` }}
          >
            {currentOrgan.system}
          </span>
        </div>
        <div>
          <div className="text-base font-black text-white font-sans">{currentOrgan.name}</div>
          <div className="text-[11px] text-slate-400 italic">{currentOrgan.latinName}</div>
        </div>
        <div className="text-[10px] text-slate-300 font-sans leading-tight">
          📍 {currentOrgan.location}
        </div>
      </div>

      {/* ── Hover Tooltip Pin ─────────────────────────────────────────── */}
      {hoveredOrgan && hoverPos && hoveredOrgan !== selectedOrganId && (
        <div
          className="absolute z-30 pointer-events-none px-2.5 py-1 rounded-xl bg-cyan-950/90 border border-cyan-400/60 text-white text-xs font-mono shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{ left: hoverPos.x, top: hoverPos.y }}
        >
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ANATOMICAL_ORGANS_DATA[hoveredOrgan]?.color || '#00f0ff' }} />
            {ANATOMICAL_ORGANS_DATA[hoveredOrgan]?.name || hoveredOrgan}
          </div>
          <div className="text-[10px] text-cyan-300">Click to inspect structure</div>
        </div>
      )}

      {/* ── Main Three.js Mount Container ─────────────────────────────── */}
      <div
        ref={mountRef}
        className="w-full relative cursor-grab active:cursor-grabbing"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />

      {/* ── Bottom Quick Organ Selector Bar ────────────────────────────── */}
      <div className="p-3 border-t border-[#1b2752] bg-[#060a1a]/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            SELECT ANATOMICAL STRUCTURE:
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            Click any organ in 3D or select from quick bar
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {Object.values(ANATOMICAL_ORGANS_DATA).map((organ) => {
            const isSelected = organ.id === selectedOrganId;
            return (
              <button
                key={organ.id}
                onClick={() => onSelectOrgan(organ.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r text-white font-bold shadow-md'
                    : 'bg-[#09112a] text-slate-400 hover:text-white border border-[#1b2752]'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundImage: `linear-gradient(to right, ${organ.color}35, ${organ.color}75)`,
                        border: `1px solid ${organ.color}`,
                        boxShadow: `0 4px 14px ${organ.color}40`,
                      }
                    : {}
                }
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: organ.color }}
                />
                <span>{organ.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
