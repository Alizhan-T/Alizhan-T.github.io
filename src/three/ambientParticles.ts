import * as THREE from "three";

const CODE_TOKENS = [
  "const",
  "async",
  "=>",
  "return",
  "struct",
  "0101",
  "M5",
  "git",
  "0xF90",
  "await",
  "void",
  "fn()",
  "const m5 = 0xF90;",
  "async () => {}",
  "return true;",
  "::vec3",
] as const;

export interface AmbientParticleUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uOpacity: { value: number };
  uPointer: { value: THREE.Vector2 };
  uMouseReact: { value: number };
}

export interface AmbientParticleField {
  mesh: THREE.Mesh;
  uniforms: AmbientParticleUniforms;
  dispose: () => void;
}

/**
 * Generates a high-resolution crisp 1024x1024 (4x4 wide-cell) JetBrains Mono glyph atlas
 * without mipmap blur so every floating code line and token renders razor-sharp.
 */
function createCrispGlyphAtlas(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const cols = 4;
  const rows = 4;
  const cellW = width / cols;
  const cellH = height / rows;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < CODE_TOKENS.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW * 0.5;
    const cy = row * cellH + cellH * 0.5;
    const token = CODE_TOKENS[i];

    const fontSize = token.length > 10 ? 22 : token.length > 5 ? 30 : 38;
    ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;

    // Crisp razor-sharp text with subtle electric cyan core
    ctx.fillStyle = "#E0F2FE";
    ctx.fillText(token, cx, cy);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function createSeededRandom(seed = 5902026) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Dense, crisp, high-clarity instanced code-line & token background layer
 * (`const`, `async`, `=>`, `return`, `struct`, `0101`, `M5`, `git`, `0xF90`).
 * Runs smoothly at 60 FPS across all portfolio sections with opacity ~0.55 and mouse interaction.
 */
export function buildAmbientParticleField(
  particleCount = 1600,
): AmbientParticleField {
  const rand = createSeededRandom(9055);
  const basePositions = new Float32Array(particleCount * 3);
  const seedAttr = new Float32Array(particleCount);
  const glyphAttr = new Float32Array(particleCount);
  const sizeAttr = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Uniform volumetric distribution filling the entire desktop & mobile frustum
    basePositions[i3] = (rand() - 0.5) * 20.5;
    basePositions[i3 + 1] = (rand() - 0.5) * 12.2;
    basePositions[i3 + 2] = -7.5 + rand() * 11.2;

    seedAttr[i] = rand();
    glyphAttr[i] = Math.floor(rand() * CODE_TOKENS.length);
    sizeAttr[i] = 0.24 + rand() * 0.26;
  }

  // 2:1 aspect plane matches our 256x128 wide atlas cells so code strings never squash
  const baseQuad = new THREE.PlaneGeometry(2.0, 1.0);
  const instancedGeo = new THREE.InstancedBufferGeometry();
  instancedGeo.index = baseQuad.index;
  instancedGeo.setAttribute("position", baseQuad.getAttribute("position"));
  instancedGeo.setAttribute("uv", baseQuad.getAttribute("uv"));
  instancedGeo.instanceCount = particleCount;

  instancedGeo.setAttribute(
    "aBasePos",
    new THREE.InstancedBufferAttribute(basePositions, 3),
  );
  instancedGeo.setAttribute(
    "aSeed",
    new THREE.InstancedBufferAttribute(seedAttr, 1),
  );
  instancedGeo.setAttribute(
    "aGlyph",
    new THREE.InstancedBufferAttribute(glyphAttr, 1),
  );
  instancedGeo.setAttribute(
    "aSize",
    new THREE.InstancedBufferAttribute(sizeAttr, 1),
  );
  baseQuad.dispose();

  const atlasTex = createCrispGlyphAtlas();

  const uniforms: AmbientParticleUniforms & {
    uAtlas: { value: THREE.CanvasTexture };
  } = {
    uTime: { value: 0 },
    uOpacity: { value: 0.56 }, // Clearly visible 0.45 - 0.65 range
    uPointer: { value: new THREE.Vector2(0, 0) },
    uMouseReact: { value: 1.0 },
    uAtlas: { value: atlasTex },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aBasePos;
      attribute float aSeed;
      attribute float aGlyph;
      attribute float aSize;

      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uMouseReact;

      varying vec2 vUv;
      varying float vAlpha;
      varying float vAccent;

      void main() {
        float h1 = fract(sin(aSeed * 127.1 + 1.3) * 43758.5453);
        float h2 = fract(sin(aSeed * 311.7 + 5.7) * 43758.5453);
        float h3 = fract(sin(aSeed * 74.7 + 11.1) * 43758.5453);

        // Smooth continuous atmospheric drift
        vec3 pos = aBasePos;
        pos.x += sin(uTime * (0.28 + h1 * 0.34) + h2 * 19.0) * 0.52;
        pos.y += cos(uTime * (0.24 + h2 * 0.28) + h3 * 13.0) * 0.42;
        pos.z += sin(uTime * (0.18 + h3 * 0.22) + h1 * 27.0) * 0.35;

        // Responsive 3D cursor parallax & gentle radial repulsion
        if (uMouseReact > 0.001) {
          vec3 cursorWorld = vec3(uPointer.x * 5.2, uPointer.y * 2.9, 1.4);
          vec3 delta = pos - cursorWorld;
          float dist = length(delta);
          float push = smoothstep(3.6, 0.35, dist) * 1.15 * uMouseReact;
          pos += normalize(delta + vec3(0.0001)) * push;
          pos.x -= uPointer.x * 0.45 * uMouseReact;
          pos.y -= uPointer.y * 0.26 * uMouseReact;
        }

        // Camera-facing crisp billboard quad
        vec4 mvCenter = modelViewMatrix * vec4(pos, 1.0);
        mvCenter.xy += position.xy * aSize;

        // 4x4 glyph atlas cell UV
        float col = mod(aGlyph, 4.0);
        float row = floor(aGlyph / 4.0);
        vUv = (uv + vec2(col, 3.0 - row)) / 4.0;

        // Gentle depth attenuation keeping near/mid-field crisp and bright
        float viewDist = -mvCenter.z;
        float depthFade = smoothstep(18.0, 4.5, viewDist) * smoothstep(0.6, 1.9, viewDist);
        float twinkle = 0.84 + 0.16 * sin(uTime * 1.6 + h1 * 37.0);

        vAlpha = depthFade * twinkle;
        vAccent = h3;

        gl_Position = projectionMatrix * mvCenter;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform float uOpacity;

      varying vec2 vUv;
      varying float vAlpha;
      varying float vAccent;

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        // Preserve sharp anti-aliased edges without hazy bloom washout
        float glyphAlpha = smoothstep(0.08, 0.85, tex.a);
        float alpha = clamp(glyphAlpha * vAlpha * uOpacity, 0.0, 0.72);
        if (alpha < 0.02) discard;

        vec3 monteCarloBlue = vec3(0.16, 0.58, 1.0);
        vec3 electricCyan = vec3(0.36, 0.82, 1.0);
        vec3 iceWhite = vec3(0.75, 0.92, 1.0);

        vec3 tint = mix(monteCarloBlue, electricCyan, vAccent);
        tint = mix(tint, iceWhite, smoothstep(0.78, 1.0, vAccent) * 0.45);

        gl_FragColor = vec4(tint * tex.rgb, alpha);
      }
    `,
  });

  const mesh = new THREE.Mesh(instancedGeo, material);
  mesh.name = "ambientCodeParticles";
  mesh.frustumCulled = false;

  return {
    mesh,
    uniforms,
    dispose() {
      instancedGeo.dispose();
      material.dispose();
      atlasTex.dispose();
    },
  };
}
