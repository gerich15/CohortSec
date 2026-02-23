import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Цвета проекта: vg-bg #0A0A0F, vg-accent #3B82F6, mint #00FFAA
const BG_COLOR = new THREE.Color(0x0a0a0f);
const RAY_COLOR1 = new THREE.Color(0x3b82f6); // vg-accent blue
const RAY_COLOR2 = new THREE.Color(0x00ffaa); // mint
const RAY_COLOR3 = new THREE.Color(0x2563eb); // vg-accent-hover

const GodRaysBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(BG_COLOR, 1);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        colorBack: { value: BG_COLOR },
        color1: { value: RAY_COLOR1 },
        color2: { value: RAY_COLOR2 },
        color3: { value: RAY_COLOR3 },
      },
      vertexShader: `
        void main() { gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec3 colorBack;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
          float aspect = iResolution.x / iResolution.y;

          // Источник лучей смещён вправо-вверх (как в оригинале offsetX 0.85, offsetY -1)
          vec2 origin = vec2(0.85 * aspect, 0.9);
          vec2 toFrag = uv - origin;
          float dist = length(toFrag);
          float angle = atan(toFrag.y, toFrag.x);

          // Мягкие полосы-лучи
          float rays = 0.0;
          float numRays = 12.0;
          float rayWidth = 0.15;
          float rayAngle = angle + iTime * 0.15;
          float ray = abs(sin(rayAngle * numRays));
          ray = smoothstep(1.0 - rayWidth, 1.0, ray);

          // Затухание по расстоянию
          float falloff = 1.0 - smoothstep(0.0, 1.8, dist);
          rays = ray * falloff;

          // Лёгкий шум (spotty)
          float n = noise(uv * 8.0 + iTime * 0.2);
          rays *= (0.55 + 0.45 * n);

          // Смешивание цветов проекта
          float t = 0.5 + 0.3 * sin(iTime * 0.5);
          vec3 rayColor = mix(color1, color2, t);
          rayColor = mix(rayColor, color3, 0.3 * sin(iTime * 0.3));

          float intensity = 0.5;
          float bloom = 0.25;
          vec3 final = colorBack + rayColor * (intensity * rays + bloom * falloff * 0.5);
          final = mix(colorBack, final, min(1.0, rays * 2.0 + falloff * 0.3));

          gl_FragColor = vec4(final, 1.0);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const updateSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      material.uniforms.iResolution.value.set(w, h);
    };
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden min-h-full min-w-full"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden
    />
  );
};

export default GodRaysBackground;
