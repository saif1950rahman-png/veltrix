import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as THREE from "three";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [hudProgress, setHudProgress] = useState(0);
  const [hudText, setHudText] = useState("Calibrating Veltrix core...");
  const [hudSpeed, setHudSpeed] = useState(0);
  const [hudGear, setHudGear] = useState("P");
  const [hudGForce, setHudGForce] = useState("1.0 G");
  const [isWarpActive, setIsWarpActive] = useState(false);
  const [screenWarpOverlay, setScreenWarpOverlay] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);

  // Audio status
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioTimerRef = useRef<number | null>(null);

  // Three.js References
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Car meshes references so we can animate them
  const carGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const headlightsRef = useRef<THREE.Mesh[]>([]);
  const taillightsRef = useRef<THREE.Mesh | null>(null);
  const spoilerRef = useRef<THREE.Mesh | null>(null);

  // Environment elements for scrolling speed effect
  const floorGridRef = useRef<THREE.GridHelper | null>(null);
  const warpStarsRef = useRef<THREE.Group | null>(null);
  const warpSpeedLines: { mesh: THREE.Mesh; speed: number; initialZ: number }[] = [];

  // Start synthesis ambient speed sound
  const playCinematicSound = (stage: "boot" | "ignition" | "screech" | "launch") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (stage === "boot") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 1.8);
        gain.gain.setValueAtTime(0.012, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      } else if (stage === "ignition") {
        // Authentic performance twin-scroll twin-turbo V8 throttle rev
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = "sawtooth";
        osc2.type = "sawtooth";

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.frequency.setValueAtTime(45, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.35);
        osc1.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 1.2);

        osc2.frequency.setValueAtTime(45.5, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(322, ctx.currentTime + 0.35);
        osc2.frequency.exponentialRampToValueAtTime(141, ctx.currentTime + 1.2);

        filter.frequency.setValueAtTime(150, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.4);
        filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 1.2);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 1.2);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.3);
        osc2.stop(ctx.currentTime + 1.3);
      } else if (stage === "screech") {
        // High frequency tire skid rubber screaming friction synthesis
        const osc = ctx.createOscillator();
        const biquad = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(1600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 1.6);
        
        biquad.type = "bandpass";
        biquad.frequency.setValueAtTime(1500, ctx.currentTime);
        biquad.Q.setValueAtTime(3.5, ctx.currentTime);

        osc.connect(biquad);
        biquad.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      } else if (stage === "launch") {
        // Solid M stepping power clutch shift sound rocket
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 1.4);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + 1.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }
    } catch (e) {
      // Audio fallback protection
    }
  };

  useEffect(() => {
    // 1. Initialise Three.js Rendering Pipeline
    const width = mountRef.current?.clientWidth || window.innerWidth;
    const height = mountRef.current?.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040507);
    scene.fog = new THREE.FogExp2(0x040507, 0.05);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    // Position camera for cinematic close angle looking down road
    camera.position.set(4.0, 1.8, 6.5);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    rendererRef.current = renderer;

    // 2. Build High-End Procedural BMW M5 Competition M xDrive
    const carGroup = new THREE.Group();
    // Start parked off to the right slightly
    carGroup.position.set(3.5, 0.4, 3.0);
    carGroup.rotation.y = -Math.PI / 4;
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Materials
    const bmwMetallicBlue = new THREE.MeshStandardMaterial({
      color: 0x0a3b8c, // Marina Bay Blue Metallic
      metalness: 0.95,
      roughness: 0.14,
      flatShading: false,
    });

    const carbonRoofMaterial = new THREE.MeshStandardMaterial({
      color: 0x141618, // Rigid carbon fibre finish
      metalness: 0.8,
      roughness: 0.42,
    });

    const activeLEDHeadlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xe6f3ff, // High-intensity Xenon Laser White-Blue
    });

    const activeLEDTaillightMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0505, // Premium organic LED signature rear red
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x040609,
      metalness: 0.98,
      roughness: 0.05,
      transparent: true,
      opacity: 0.88,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 1.0,
      roughness: 0.05,
    });

    const rubberTireMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f0f,
      roughness: 0.85,
    });

    const brakeCaliperMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c6bff, // Signature BMW M-Performance Blue
      metalness: 0.9,
      roughness: 0.15,
    });

    // Sub-Mesh: LOWER CHASSIS BODY
    const chassisGeo = new THREE.BoxGeometry(1.85, 0.24, 4.3);
    const chassisMesh = new THREE.Mesh(chassisGeo, bmwMetallicBlue);
    chassisMesh.position.y = -0.05;
    carGroup.add(chassisMesh);

    // Sub-Mesh: FRONT HOOD (Slight frontward tilt with twin powerdome contour lines)
    const hoodGeo = new THREE.BoxGeometry(1.8, 0.16, 1.45);
    const hoodMesh = new THREE.Mesh(hoodGeo, bmwMetallicBlue);
    hoodMesh.position.set(0, 0.15, -1.35);
    hoodMesh.rotation.x = 0.08;
    carGroup.add(hoodMesh);

    // Sub-Mesh: FRONT KIDNEY GRILLES (Iconic BMW Kidney layout)
    // Left kidney bezel frame
    const leftKidneyFrameGeo = new THREE.BoxGeometry(0.24, 0.18, 0.04);
    const leftKidneyFrame = new THREE.Mesh(leftKidneyFrameGeo, chromeMaterial);
    leftKidneyFrame.position.set(-0.16, 0.12, -2.1);
    carGroup.add(leftKidneyFrame);

    const leftKidneyInnerGeo = new THREE.BoxGeometry(0.2, 0.14, 0.05);
    const leftKidneyInner = new THREE.Mesh(leftKidneyInnerGeo, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }));
    leftKidneyInner.position.set(-0.16, 0.12, -2.09);
    carGroup.add(leftKidneyInner);

    // Right kidney bezel frame
    const rightKidneyFrame = leftKidneyFrame.clone();
    rightKidneyFrame.position.x = 0.16;
    carGroup.add(rightKidneyFrame);

    const rightKidneyInner = leftKidneyInner.clone();
    rightKidneyInner.position.x = 0.16;
    carGroup.add(rightKidneyInner);

    // Sub-Mesh: SEDAN CABIN
    const cabinGeo = new THREE.BoxGeometry(1.55, 0.52, 2.05);
    const cabinMesh = new THREE.Mesh(cabinGeo, bmwMetallicBlue);
    cabinMesh.position.set(0, 0.44, 0.15);
    carGroup.add(cabinMesh);

    // Windshield (Front steep tilt)
    const frontWindshieldGeo = new THREE.BoxGeometry(1.48, 0.03, 1.15);
    const frontWindshield = new THREE.Mesh(frontWindshieldGeo, glassMaterial);
    frontWindshield.position.set(0, 0.45, -0.92);
    frontWindshield.rotation.x = 0.85;
    carGroup.add(frontWindshield);

    // Rear Window (Back steep tilt)
    const rearWindshieldGeo = new THREE.BoxGeometry(1.48, 0.03, 1.25);
    const rearWindshield = new THREE.Mesh(rearWindshieldGeo, glassMaterial);
    rearWindshield.position.set(0, 0.44, 1.2);
    rearWindshield.rotation.x = -0.7;
    carGroup.add(rearWindshield);

    // Carbon fiber roof panel (M5 Competition lightweight carbon top)
    const roofPanelGeo = new THREE.BoxGeometry(1.42, 0.04, 1.8);
    const roofPanel = new THREE.Mesh(roofPanelGeo, carbonRoofMaterial);
    roofPanel.position.set(0, 0.71, 0.15);
    carGroup.add(roofPanel);

    // Sub-Mesh: TRUNK (Iconic sedan deck lid)
    const trunkGeo = new THREE.BoxGeometry(1.8, 0.28, 1.1);
    const trunkMesh = new THREE.Mesh(trunkGeo, bmwMetallicBlue);
    trunkMesh.position.set(0, 0.16, 1.6);
    carGroup.add(trunkMesh);

    // M Carbon Lip Spoiler (Subtle decklid lip spoiler)
    const lipSpoilerGeo = new THREE.BoxGeometry(1.65, 0.03, 0.18);
    const lipSpoiler = new THREE.Mesh(lipSpoilerGeo, carbonRoofMaterial);
    lipSpoiler.position.set(0, 0.31, 2.12);
    lipSpoiler.rotation.x = -0.12;
    carGroup.add(lipSpoiler);
    spoilerRef.current = lipSpoiler;

    // Sub-Mesh: Twin Halo Headlights (Quad LED "Angel Eyes" configuration)
    // Left pair
    const leftInnerHaloGeo = new THREE.BoxGeometry(0.14, 0.04, 0.04);
    const leftInnerHalo = new THREE.Mesh(leftInnerHaloGeo, activeLEDHeadlightMaterial);
    leftInnerHalo.position.set(-0.52, 0.18, -2.1);
    carGroup.add(leftInnerHalo);
    headlightsRef.current.push(leftInnerHalo);

    const leftOuterHalo = leftInnerHalo.clone();
    leftOuterHalo.position.x = -0.74;
    carGroup.add(leftOuterHalo);
    headlightsRef.current.push(leftOuterHalo);

    // Right pair
    const rightInnerHalo = leftInnerHalo.clone();
    rightInnerHalo.position.x = 0.52;
    carGroup.add(rightInnerHalo);
    headlightsRef.current.push(rightInnerHalo);

    const rightOuterHalo = leftInnerHalo.clone();
    rightOuterHalo.position.x = 0.74;
    carGroup.add(rightOuterHalo);
    headlightsRef.current.push(rightOuterHalo);

    // Sub-Mesh: Sleek L-shaped LED taillights
    const leftTaillightGeo = new THREE.BoxGeometry(0.55, 0.05, 0.04);
    const leftTaillight = new THREE.Mesh(leftTaillightGeo, activeLEDTaillightMaterial);
    leftTaillight.position.set(-0.55, 0.18, 2.16);
    carGroup.add(leftTaillight);

    const rightTaillight = leftTaillight.clone();
    rightTaillight.position.x = 0.55;
    carGroup.add(rightTaillight);
    taillightsRef.current = leftTaillight; // Keep reference for animation tickers

    // Quad sport chrome tailpipes
    const leftOuterPipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
    leftOuterPipeGeo.rotateX(Math.PI / 2);
    const leftOuterPipe = new THREE.Mesh(leftOuterPipeGeo, chromeMaterial);
    leftOuterPipe.position.set(-0.52, -0.15, 2.15);
    carGroup.add(leftOuterPipe);

    const leftInnerPipe = leftOuterPipe.clone();
    leftInnerPipe.position.x = -0.65;
    carGroup.add(leftInnerPipe);

    const rightInnerPipe = leftOuterPipe.clone();
    rightInnerPipe.position.x = 0.52;
    carGroup.add(rightInnerPipe);

    const rightOuterPipe = leftOuterPipe.clone();
    rightOuterPipe.position.x = 0.65;
    carGroup.add(rightOuterPipe);

    // Sub-Mesh: Four High-Performance M Alloy Wheels
    const wheelPositions = [
      { x: -1.0, y: -0.18, z: -1.3 }, // Front Left
      { x: 1.0, y: -0.18, z: -1.3 },  // Front Right
      { x: -1.0, y: -0.18, z: 1.35 },  // Rear Left
      { x: 1.0, y: -0.18, z: 1.35 },   // Rear Right
    ];

    const wheelGroups: THREE.Group[] = [];

    wheelPositions.forEach((pos) => {
      const wheelHub = new THREE.Group();
      wheelHub.position.set(pos.x, pos.y, pos.z);

      // Tire Outer Ring
      const tireGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.32, 24);
      const tireMesh = new THREE.Mesh(tireGeo, rubberTireMaterial);
      tireMesh.rotation.z = Math.PI / 2;
      wheelHub.add(tireMesh);

      // Chrome Titanium Finished inner sport alloys
      const rimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.33, 16);
      const rimMesh = new THREE.Mesh(rimGeo, chromeMaterial);
      rimMesh.rotation.z = Math.PI / 2;
      wheelHub.add(rimMesh);

      // Distinctive M-Sport Spoke layout
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, 0.64, 0.05);
        const spoke = new THREE.Mesh(spokeGeo, chromeMaterial);
        spoke.rotation.y = (s * Math.PI) / 5;
        wheelHub.add(spoke);
      }

      // High-Contrast Marina Bay Blue M brake calipers nestled behind alloys
      const caliperGeo = new THREE.BoxGeometry(0.08, 0.18, 0.18);
      const caliperMesh = new THREE.Mesh(caliperGeo, brakeCaliperMaterial);
      caliperMesh.position.set(pos.x < 0 ? 0.08 : -0.08, 0.15, 0.05);
      wheelHub.add(caliperMesh);

      carGroup.add(wheelHub);
      wheelGroups.push(wheelHub);
    });
    wheelsRef.current = wheelGroups;

    // 3. Environment: Dark Wet Reflective Showroom Asphalt Floor
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05070a, // Dark glossy base
      roughness: 0.16, // Wet sheen
      metalness: 0.92,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.62;
    scene.add(floorMesh);

    const floorGrid = new THREE.GridHelper(100, 80, 0x1c6bff, 0x0b1120);
    floorGrid.position.y = -0.61;
    scene.add(floorGrid);
    floorGridRef.current = floorGrid;

    // 4. Lights Setup - Elite Studio Level Showroom Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0); // Fades in phase 1
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x05070a, 0); // Sky-ground ambient bounce
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0); // Front-left key light
    keyLight.position.set(6, 12, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3a82f6, 0); // Front-right fill light (cool blue theme shade)
    fillLight.position.set(-6, 8, -6);
    scene.add(fillLight);

    const blueprintSpotlight = new THREE.SpotLight(0xffffff, 0);
    blueprintSpotlight.position.set(0, 10, 0);
    blueprintSpotlight.angle = Math.PI / 3;
    blueprintSpotlight.penumbra = 0.9;
    blueprintSpotlight.target = carGroup; // Focus the spotlight directly on the car group
    scene.add(blueprintSpotlight);

    // Front headlight projectors throwing realistic floor pools during drift
    const headlightSpotLeft = new THREE.SpotLight(0xfff5ea, 0, 16, Math.PI / 5, 0.5, 0.8);
    headlightSpotLeft.position.set(-0.62, 0.18, -2.15);
    carGroup.add(headlightSpotLeft);
    const targetLeft = new THREE.Object3D();
    targetLeft.position.set(-0.62, 0, -8);
    carGroup.add(targetLeft);
    headlightSpotLeft.target = targetLeft;

    const headlightSpotRight = new THREE.SpotLight(0xfff5ea, 0, 16, Math.PI / 5, 0.5, 0.8);
    headlightSpotRight.position.set(0.62, 0.18, -2.15);
    carGroup.add(headlightSpotRight);
    const targetRight = new THREE.Object3D();
    targetRight.position.set(0.62, 0, -8);
    carGroup.add(targetRight);
    headlightSpotRight.target = targetRight;

    // Side/rear luxury blue rim lights
    const blueRimLight = new THREE.DirectionalLight(0x1c6bff, 0.2);
    blueRimLight.position.set(-5, 2, -2);
    scene.add(blueRimLight);

    const redTaillightGlow = new THREE.PointLight(0xff0505, 0, 8);
    redTaillightGlow.position.set(0, 0.2, 2.2);
    carGroup.add(redTaillightGlow);

    // 5. High Performance Drift Smoke Volumetric Emitters Pool (Shader Particle System)
    const PARTICLE_COUNT = 3000;
    const particleGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const ages = new Float32Array(PARTICLE_COUNT);
    const maxLifes = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);
    
    // Position all offscreen initially
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -999;
      positions[i * 3 + 2] = 0;
      
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
      
      ages[i] = 999.0; // dead/inactive initial state
      maxLifes[i] = 1.0;
      randoms[i] = Math.random();
      sizes[i] = Math.random() * 25.0 + 15.0;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('aAge', new THREE.BufferAttribute(ages, 1));
    particleGeometry.setAttribute('aMaxLife', new THREE.BufferAttribute(maxLifes, 1));
    particleGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    
    const smokeShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMotionBlurIntensity: { value: 0.14 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uMotionBlurIntensity;
        
        attribute vec3 aVelocity;
        attribute float aAge;
        attribute float aMaxLife;
        attribute float aRandom;
        attribute float aSize;
        
        varying float vAgeRatio;
        varying float vRandom;
        
        void main() {
          vAgeRatio = aAge / aMaxLife;
          vRandom = aRandom;
          
          // Evolve position with original position plus velocity times age
          // Plus visual aerodynamic wind turbulence
          vec3 currentPos = position + aVelocity * aAge;
          
          // Upward ballooning dispersion (V8 engine back-draft heat)
          currentPos.y += aAge * 0.42 * (1.0 + aRandom * 0.5);
          
          // Realistic wind-swept turbulence
          currentPos.x += sin(aAge * 4.5 + aRandom * 6.28) * 0.22 * aAge;
          currentPos.z += cos(aAge * 3.5 + aRandom * 6.28) * 0.22 * aAge;
          
          // Volumetric expansion styling - smoke starts tight but balloons out
          float baseSize = aSize * (1.1 + vAgeRatio * 5.2);
          
          // Speed-based wind-swept motion blur expansion
          float speed = length(aVelocity);
          baseSize += speed * uMotionBlurIntensity * 22.0 * (1.0 - vAgeRatio);
          
          vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Scale based on screen size/projective depth
          gl_PointSize = baseSize * (220.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying float vAgeRatio;
        varying float vRandom;
        
        void main() {
          // Volumetric soft brush radial outline calculation
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) {
            discard;
          }
          
          // Smooth edge feathering
          float alpha = smoothstep(0.5, 0.16, dist);
          
          // Volumetric density curve
          float lifeFade = clamp(1.0 - vAgeRatio, 0.0, 1.0);
          float density = pow(lifeFade, 1.5);
          
          alpha *= density * 0.36;
          
          // Authentic thermal color: fresh burning tire rubber starts with slight carbon glow, 
          // quickly transitioning to thick cooling blue-white steam/clouds
          vec3 coreCarbon = vec3(0.06, 0.07, 0.09); // Dark graphite
          vec3 billowySteam = vec3(0.82, 0.86, 0.94); // Wet bright smoke
          
          vec3 finalColor = mix(coreCarbon, billowySteam, smoothstep(0.0, 0.55, vAgeRatio));
          
          // Add hot friction yellow-orange flash in first few milliseconds of tire screech
          if (vAgeRatio < 0.12) {
            float heat = (1.0 - (vAgeRatio / 0.12));
            finalColor = mix(finalColor, vec3(1.0, 0.42, 0.08), heat * 0.4);
          }
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    
    const smokePoints = new THREE.Points(particleGeometry, smokeShaderMaterial);
    scene.add(smokePoints);
    
    let lastParticleIndex = 0;
    
    const emitParticle = (posX: number, posY: number, posZ: number, velX: number, velY: number, velZ: number, life: number, size: number) => {
      const idx = lastParticleIndex;
      
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const velAttr = particleGeometry.attributes.aVelocity as THREE.BufferAttribute;
      const ageAttr = particleGeometry.attributes.aAge as THREE.BufferAttribute;
      const maxLifeAttr = particleGeometry.attributes.aMaxLife as THREE.BufferAttribute;
      const sizeAttr = particleGeometry.attributes.aSize as THREE.BufferAttribute;
      const randAttr = particleGeometry.attributes.aRandom as THREE.BufferAttribute;
      
      posAttr.setXYZ(idx, posX, posY, posZ);
      velAttr.setXYZ(idx, velX, velY, velZ);
      ageAttr.setX(idx, 0.0);
      maxLifeAttr.setX(idx, life);
      sizeAttr.setX(idx, size);
      randAttr.setX(idx, Math.random());
      
      posAttr.needsUpdate = true;
      velAttr.needsUpdate = true;
      ageAttr.needsUpdate = true;
      maxLifeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      randAttr.needsUpdate = true;
      
      lastParticleIndex = (lastParticleIndex + 1) % PARTICLE_COUNT;
    };

    // Warp Speed Tunnel particles for phase 4 launch
    const warpGroup = new THREE.Group();
    scene.add(warpGroup);
    warpStarsRef.current = warpGroup;

    const streakMaterial = new THREE.MeshBasicMaterial({
      color: 0x1c6bff,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < 110; i++) {
      const length = Math.random() * 3.5 + 0.8;
      const streakGeo = new THREE.BoxGeometry(0.015, 0.015, length);
      const streakMesh = new THREE.Mesh(streakGeo, streakMaterial);

      const rad = Math.random() * 8 + 1.2;
      const angle = Math.random() * Math.PI * 2;
      const startX = Math.cos(angle) * rad;
      const startY = Math.sin(angle) * rad + 0.5;
      const startZ = Math.random() * -140 - 10;

      streakMesh.position.set(startX, startY, startZ);
      warpGroup.add(streakMesh);
      warpSpeedLines.push({
        mesh: streakMesh,
        speed: Math.random() * 2.0 + 2.0,
        initialZ: startZ,
      });
    }

    // Hide speed particles initially
    warpGroup.visible = false;

    // 6. Real-time sequence state loops
    const startTime = Date.now();
    let currentPhase = 1;
    let currentSpeedNum = 0; // Solves stale react hook closure bug for requestAnimationFrame
    let lastSmokeUpdateTime = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Spin tires based on current speed indicator
      if (wheelsRef.current) {
        wheelsRef.current.forEach((wheel) => {
          wheel.rotation.x -= (currentSpeedNum * 0.0018) + 0.02;
        });
      }

      // Live High-Density Smoke Shader particles updates
      const now = Date.now();
      const frameDelta = Math.min((now - lastSmokeUpdateTime) / 1000, 0.1);
      lastSmokeUpdateTime = now;
      
      const ageAttr = particleGeometry.attributes.aAge as THREE.BufferAttribute;
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let currentAge = ageAttr.getX(i);
        if (currentAge < 10.0) {
          currentAge += frameDelta;
          ageAttr.setX(i, currentAge);
          
          const maxLife = (particleGeometry.attributes.aMaxLife as THREE.BufferAttribute).getX(i);
          if (currentAge >= maxLife) {
            posAttr.setY(i, -999.0); // Send below ground
            posAttr.needsUpdate = true;
          }
        }
      }
      ageAttr.needsUpdate = true;
      smokeShaderMaterial.uniforms.uTime.value = elapsed;

      // --- PHASE CONTROL SEQUENCE & GSAP MATH TIMELINE ---

      if (elapsed < 1.5) {
        // --- PHASE 1: DARK ENTRY (0–1.5s) ---
        currentPhase = 1;
        setHudProgress(Math.min(25, Math.floor((elapsed / 1.5) * 25)));
        setHudText("Connecting wet asphalt thermal telemetry vectors...");

        // Ambient and studio key/fill lights fade up slowly to highlight car lines in the dark
        ambientLight.intensity = THREE.MathUtils.lerp(0, 0.25, elapsed / 1.5);
        hemisphereLight.intensity = THREE.MathUtils.lerp(0, 1.4, elapsed / 1.5);
        keyLight.intensity = THREE.MathUtils.lerp(0, 1.8, elapsed / 1.5);
        fillLight.intensity = THREE.MathUtils.lerp(0, 1.0, elapsed / 1.5);
        blueprintSpotlight.intensity = 0;
        headlightSpotLeft.intensity = 0;
        headlightSpotRight.intensity = 0;

        // Keep car parked on start
        carGroup.position.set(3.8, 0.4, 3.2);
        carGroup.rotation.y = -Math.PI / 4.5;

        // Low wide orbit cam looking directly at the glorious parked BMW M5
        camera.position.x = 4.8 - Math.sin(elapsed * 0.15) * 0.4;
        camera.position.z = 6.2;
        camera.position.y = 1.6;
        camera.lookAt(carGroup.position.x, 0.4, carGroup.position.z);

        setHudSpeed(0);
        currentSpeedNum = 0;
        setHudGear("P");
        setHudGForce("1.0 G");
      }
      else if (elapsed >= 1.5 && elapsed < 3.0) {
        // --- PHASE 2: BMW M5 ARRIVAL (1.5–3.0s) ---
        if (currentPhase < 2) {
          currentPhase = 2;
          playCinematicSound("ignition");
        }
        setHudProgress(25 + Math.min(25, Math.floor(((elapsed - 1.5) / 1.5) * 25)));
        setHudText("S63 Twin-Turbo V8 active. Roll out into track boundaries...");

        // Spotlight snap-flash and headlight projector halos turn on beautifully
        hemisphereLight.intensity = 1.4;
        keyLight.intensity = THREE.MathUtils.lerp(1.8, 3.5, (elapsed - 1.5) / 1.5);
        fillLight.intensity = THREE.MathUtils.lerp(1.0, 2.0, (elapsed - 1.5) / 1.5);
        blueprintSpotlight.intensity = THREE.MathUtils.lerp(0.5, 3.5, (elapsed - 1.5) / 1.5);
        headlightSpotLeft.intensity = THREE.MathUtils.lerp(0, 4.5, (elapsed - 1.5) / 1.0);
        headlightSpotRight.intensity = THREE.MathUtils.lerp(0, 4.5, (elapsed - 1.5) / 1.0);
        redTaillightGlow.intensity = 1.2;

        // Low angle chase path of car rolling in
        const t = (elapsed - 1.5) / 1.5; // 0 to 1
        carGroup.position.x = THREE.MathUtils.lerp(3.8, 1.3, t);
        carGroup.position.z = THREE.MathUtils.lerp(3.2, 1.2, t);
        carGroup.rotation.y = THREE.MathUtils.lerp(-Math.PI / 4.5, -Math.PI / 6, t);

        // Turn wheels on entry trajectory steering
        if (wheelsRef.current && wheelsRef.current.length >= 2) {
          wheelsRef.current[0].rotation.y = -0.18;
          wheelsRef.current[1].rotation.y = -0.18;
        }

        // Camera tracks low-angle slide lookahead
        camera.position.x = 3.8 - t * 1.5;
        camera.position.z = 6.5 - t * 0.8;
        camera.position.y = 1.4;
        camera.lookAt(carGroup.position.x, 0.35, carGroup.position.z);

        const speedVal = Math.floor(t * 36);
        setHudSpeed(speedVal);
        currentSpeedNum = speedVal;
        setHudGear("D");
        setHudGForce("1.2 G");
      }
      else if (elapsed >= 3.0 && elapsed < 5.0) {
        // --- PHASE 3: DRIFT SEQUENCE (3.0–5.0s) ---
        if (currentPhase < 3) {
          currentPhase = 3;
          playCinematicSound("screech");
        }
        const t = (elapsed - 3.0) / 2.0; // 0 to 1
        setHudProgress(50 + Math.min(30, Math.floor(t * 30)));
        setHudText("M xDrive Active Slide. DSC OFF. CLUTCH ENGAGING POWER DRIFT...");

        // High intensity studio contrast lighting
        hemisphereLight.intensity = 1.4;
        keyLight.intensity = 4.0;
        fillLight.intensity = 2.5;
        blueprintSpotlight.intensity = 4.5;
        blueRimLight.intensity = 3.5; // Beautiful glowing blue outline highlight
        headlightSpotLeft.intensity = 5.2;
        headlightSpotRight.intensity = 5.2;

        // Perform glorious panoramic sideways drift arc
        carGroup.position.x = 1.3 - (t * 4.4); // Sweeps to left
        carGroup.position.z = 1.2 - (t * 2.8); // Slips up

        // Drift angle counter yaw: rear out swings left, rotations spins towards right
        carGroup.rotation.y = -Math.PI / 6 + t * (Math.PI * 0.95);

        // Countersteer wheels to opposite side of slide direction
        if (wheelsRef.current && wheelsRef.current.length >= 2) {
          const steerAngle = 0.58; // Countersteer ~33deg
          wheelsRef.current[0].rotation.y = steerAngle;
          wheelsRef.current[1].rotation.y = steerAngle;
        }

        // Core High-Density, Volumetric Smoke Generation for Drift
        const particlesToEmit = 5; // 5 highly-dispersed particles per wheels per frame
        const rearLeftWorld = new THREE.Vector3(-0.95, -0.22, 1.35).applyMatrix4(carGroup.matrixWorld);
        const rearRightWorld = new THREE.Vector3(0.95, -0.22, 1.35).applyMatrix4(carGroup.matrixWorld);

        [rearLeftWorld, rearRightWorld].forEach((wheelPos) => {
          for (let pIdx = 0; pIdx < particlesToEmit; pIdx++) {
            const pX = wheelPos.x + (Math.random() - 0.5) * 0.2;
            const pY = wheelPos.y + (Math.random() - 0.5) * 0.1;
            const pZ = wheelPos.z + (Math.random() - 0.5) * 0.2;

            // Compute wind vectors backwards relative to car's yaw and drift arc flings
            const relativeVel = new THREE.Vector3(
              (Math.random() - 0.2) * 1.6 + 0.5, // flinging slightly right/outward
              Math.random() * 0.7 + 0.2,         // billowy rise velocity
              Math.random() * 2.0 + 1.0          // rapid backward tire spin throw
            ).applyQuaternion(carGroup.quaternion);

            const randomLife = Math.random() * 1.2 + 0.8;
            const randomSize = Math.random() * 32.0 + 14.0;

            emitParticle(pX, pY, pZ, relativeVel.x, relativeVel.y, relativeVel.z, randomLife, randomSize);
          }
        });

        // Camera shakes and tracks the sweeping drift path orbits
        const camShake = Math.sin(Date.now() * 0.08) * 0.035;
        camera.position.x = (3.8 - t * 4.6) + camShake;
        camera.position.y = 1.3 + Math.cos(Date.now() * 0.04) * 0.05 + camShake;
        camera.position.z = (5.7 - t * 0.5);
        camera.lookAt(carGroup.position.x * 0.8, 0.4, carGroup.position.z);

        const speedVal = Math.floor(36 + Math.pow(t, 1.5) * 82);
        setHudSpeed(speedVal);
        currentSpeedNum = speedVal;
        setHudGear("S");
        setHudGForce((1.2 + t * 2.8).toFixed(1) + " G");
      }
      else if (elapsed >= 5.0 && elapsed < 6.2) {
        // --- PHASE 4: "BOOM EXIT" LAUNCH (5.0–6.2s) ---
        if (currentPhase < 4) {
          currentPhase = 4;
          playCinematicSound("launch");
          setIsWarpActive(true);
          warpGroup.visible = true;
        }
        const t = (elapsed - 5.0) / 1.2; // 0 to 1
        setHudProgress(80 + Math.min(20, Math.floor(t * 20)));
        setHudText("V-MAX BARRIERS UNLOCKED. TORQUE COUPLED LAUNCH...");

        // Generate intense tire spin smoke during the initial torque shift of the launch
        if (t < 0.6) {
          const launchParticlesEmit = 4;
          const rearLeftWorld = new THREE.Vector3(-0.95, -0.22, 1.35).applyMatrix4(carGroup.matrixWorld);
          const rearRightWorld = new THREE.Vector3(0.95, -0.22, 1.35).applyMatrix4(carGroup.matrixWorld);

          [rearLeftWorld, rearRightWorld].forEach((wheelPos) => {
            for (let pIdx = 0; pIdx < launchParticlesEmit; pIdx++) {
              const pX = wheelPos.x + (Math.random() - 0.5) * 0.15;
              const pY = wheelPos.y + (Math.random() - 0.5) * 0.05;
              const pZ = wheelPos.z + (Math.random() - 0.5) * 0.15;

              // Launch smoke sprays straight backward
              const relativeVel = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.6 + 0.4,
                Math.random() * 3.2 + 2.5 // highspeed horizontal launch flings
              ).applyQuaternion(carGroup.quaternion);

              const randomLife = Math.random() * 1.0 + 0.6;
              const randomSize = Math.random() * 36.0 + 18.0;

              emitParticle(pX, pY, pZ, relativeVel.x, relativeVel.y, relativeVel.z, randomLife, randomSize);
            }
          });
        }

        // Straighten wheels for full rocket throttle drag launch
        if (wheelsRef.current && wheelsRef.current.length >= 2) {
          wheelsRef.current[0].rotation.y = 0;
          wheelsRef.current[1].rotation.y = 0;
        }

        // Car points straight down road and rockets deep into the distance
        carGroup.rotation.y = Math.PI / 1.15; // Pointing forward down track
        carGroup.position.z -= Math.pow(t, 3) * 62; // Rocket speed explosion

        // Accelerate ground helper scroll speeds
        if (floorGridRef.current) {
          floorGridRef.current.position.z += (t * 2.5) + 0.2;
          if (floorGridRef.current.position.z > 6) {
            floorGridRef.current.position.z = 0;
          }
        }

        // Velocity particle vectors fly past lens camera
        warpSpeedLines.forEach((streak) => {
          streak.mesh.position.z += (streak.speed * 2.2) + (t * 12.0);
          if (streak.mesh.position.z > 35) {
            streak.mesh.position.z = streak.initialZ;
          }
        });

        // Powerful engine vibration camera exhaust shake
        const exShake = Math.sin(Date.now() * 0.16) * 0.052;
        camera.position.x = -0.8 + exShake;
        camera.position.y = 1.1 + exShake;
        camera.position.z = 5.2 + t * 4.5;
        camera.lookAt(0, 0.45, -t * 18);

        const speedVal = Math.floor(118 + t * 202);
        setHudSpeed(speedVal);
        currentSpeedNum = speedVal;
        setHudGear("⚡");
        setHudGForce((4.0 + t * 2.2).toFixed(1) + " G");

        // Flash overlay whiteout trigger
        if (t > 0.85) {
          setScreenWarpOverlay(true);
        }
      }
      else {
        // --- PHASE 5: REVEAL SYSTEM TRANSITION (6.0s+) ---
        setHudProgress(100);
        setHudSpeed(320);
        currentSpeedNum = 320;
        setHudGear("⚡");
        setHudGForce("6.2 G");

        cancelAnimationFrame(animationFrameId.current!);
        onComplete();
        return;
      }

      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(tick);
    };

    // Instantiate sequence countdown
    playCinematicSound("boot");
    animationFrameId.current = requestAnimationFrame(tick);

    // Responsive sizing events
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        mountRef.current?.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
      }
    };
  }, []);


  const triggerSkip = () => {
    onComplete();
  };

  return (
    <div className="relative w-screen h-screen bg-[#07090d] select-none text-white overflow-hidden z-[9999]">
      {/* WebGL Canvas Node wrapper */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" id="canvas-container" />

      {/* Speed Tunnel Full Screen Blur Overlay (Phase 3 transition) */}
      <AnimatePresence>
        {isWarpActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 + (hudSpeed / 650) * 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#1c6bff]/20 to-transparent flex items-center justify-center mix-blend-screen"
          >
            {/* Speed Tunnel streaks overlays in CSS */}
            <div className="absolute w-[200vw] h-[200vh] border-[150px] border-[#1c6bff]/5 rounded-full scale-110 opacity-30 animate-pulse blur-3xl" />
            <div className="absolute w-[100vw] h-[100vh] border-[90px] border-white/5 rounded-full scale-150 opacity-20 blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Whiteout warp flash transition */}
      <AnimatePresence>
        {screenWarpOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white z-[99999] pointer-events-none flex items-center justify-center filter blur-md"
            transition={{ duration: 0.5, ease: "easeIn" }}
          />
        )}
      </AnimatePresence>

      {/* High-End Automotive Cinematic HUD telemetry layout */}
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between p-6 sm:p-8 pointer-events-none font-mono text-xs z-50">
        
        {/* Top: Branding coordinates + Minimal elegant Skip button */}
        <div className="flex justify-between items-start">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-1 text-slate-300"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1c6bff] animate-ping" />
              <span className="font-bold tracking-[0.4em] text-white">V-SECURE NET</span>
            </div>
            <span className="text-[9px] text-[#dfb46c] tracking-[0.2em]">DIRECTIVE BEYOND ORDINARY</span>
          </motion.div>

          <motion.button
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={triggerSkip}
            className="pointer-events-auto px-4 py-2 hover:px-6 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-[10px] tracking-widest text-[#dfb46c] hover:text-white uppercase rounded-lg transition-all duration-300 cursor-pointer text-center font-bold"
          >
            Skip Intro
          </motion.button>
        </div>

        {/* Center: System booting indicator panel */}
        {!isWarpActive && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="self-center flex flex-col items-center gap-3 bg-[#0b0f14]/80 border border-white/5 backdrop-blur-md px-8 py-5 rounded-2xl shadow-2xl text-center max-w-xs"
          >
            <span className="text-[9px] text-slate-500 tracking-[0.3em] uppercase block font-bold">SYSTEM BOOTING</span>
            <span className="text-sm font-semibold tracking-wider text-[#dfb46c]">{hudProgress}%</span>
            <div className="w-36 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#1c6bff] to-[#dfb46c] transition-all duration-150 rounded-full"
                style={{ width: `${hudProgress}%` }}
              />
            </div>
            <p className="text-[8px] text-slate-400 capitalize max-w-[200px] leading-relaxed truncate">{hudText}</p>
          </motion.div>
        )}

        {/* Bottom: Speed, G-Force and Telemetry grid readout indicators */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4">
          
          {/* Diagnostic status list */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2 bg-black/60 border border-white/5 backdrop-blur-md p-4 rounded-xl text-[10px] text-slate-400 w-full sm:w-64"
          >
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="opacity-65">BMW S63 TWIN-TURBO V8</span>
              <span className="text-emerald-400 font-bold uppercase">625 HP ACTIVE</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="opacity-65">ACTIVE M XDRIVE DIFF</span>
              <span className="text-[#dfb46c] font-bold">4WD SPORT TRACK</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="opacity-65">MARINA BAY BLUE LACQUER</span>
              <span className="text-sky-400 font-bold uppercase">PBR GLOSS</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-65">8-SPEED M STEPTRONIC</span>
              <span className="text-red-400 font-bold uppercase">COUPLED MODE</span>
            </div>
          </motion.div>

          {/* Epic Speed HUD meter */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 bg-black/75 border border-white/5 backdrop-blur-xl p-5 sm:p-6 rounded-2xl min-w-[230px] self-end justify-between shadow-[0_0_50px_rgba(30,58,138,0.15)]"
          >
            {/* Speed readout */}
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 tracking-widest block uppercase font-bold">Speedometer</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-display font-black text-white tracking-widest">{hudSpeed}</span>
                <span className="text-[9px] text-[#dfb46c] font-bold">MPH</span>
              </div>
            </div>

            {/* Gear Selector */}
            <div className="flex gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-slate-500 uppercase font-bold">Gear</span>
                <span className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg border ${hudGear === "S" || hudGear === "⚡" ? "border-red-500 bg-red-950/20 text-red-400 animate-pulse font-black" : "border-white/10 text-[#dfb46c]"}`}>
                  {hudGear}
                </span>
              </div>

              {/* G force dial */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-slate-500 uppercase font-bold">G-Force</span>
                <span className="text-sm font-bold w-12 h-10 flex items-center justify-center rounded-lg border border-white/10 text-slate-200">
                  {hudGForce}
                </span>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </div>
  );
}
