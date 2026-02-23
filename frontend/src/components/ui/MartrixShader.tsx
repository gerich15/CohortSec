import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const MartrixShader = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error("WebGL not supported:", err);
      container.innerHTML =
        '<p style="color:white;text-align:center;">Ваш браузер не поддерживает WebGL.</p>';
      return;
    }

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse * 2.0 - iResolution.xy) / iResolution.y;

        float dist = length(uv - mouse);
        float warp = smoothstep(0.5, 0.0, dist);
        uv += normalize(uv - mouse) * warp * 0.2;

        float gridSize = 30.0;
        vec2 gridUv = fract(uv * gridSize);
        vec2 gridId = floor(uv * gridSize);

        float t = iTime * 2.0;
        float rainSpeed = 0.5;
        float fall = fract(gridId.y * 0.1 - t * rainSpeed + random(gridId.xx) * 2.0);

        float character = random(gridId + floor(t * 5.0 * random(gridId.yx)));
        character = step(0.95, character);

        float glow = 1.0 - smoothstep(0.0, 0.8, gridUv.y);
        float intensity = character * glow * fall;

        vec3 color1 = vec3(0.1, 0.3, 0.9);
        vec3 color2 = vec3(0.1, 0.8, 0.5);
        vec3 finalColor = mix(color1, color2, random(gridId)) * intensity;
        finalColor *= (1.0 - random(gridId + t) * 0.2);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(0, 0) },
      iMouse: { value: new THREE.Vector2(0, 0) },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const onResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };
    window.addEventListener("resize", onResize);
    onResize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = rect.height - (e.clientY - rect.top);
      uniforms.iMouse.value.set(x, y);
    };
    window.addEventListener("mousemove", onMouseMove);

    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.setAnimationLoop(null);
      const canvas = renderer.domElement;
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="shader-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden
    />
  );
};

export default MartrixShader;
