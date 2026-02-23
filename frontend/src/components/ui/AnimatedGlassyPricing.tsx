import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Фон проекта #0A0A0F -> (0.04, 0.04, 0.06)
const ShaderCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;
    const vertexShaderSource = `attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;
    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 uBackgroundColor;
      mat2 rotate2d(float angle){ float c=cos(angle),s=sin(angle); return mat2(c,-s,s,c); }
      float variation(vec2 v1,vec2 v2,float strength,float speed){ return sin(dot(normalize(v1),normalize(v2))*strength+iTime*speed)/100.0; }
      vec3 paintCircle(vec2 uv,vec2 center,float rad,float width){
        vec2 diff = center-uv;
        float len = length(diff);
        len += variation(diff,vec2(0.,1.),5.,2.);
        len -= variation(diff,vec2(1.,0.),5.,2.);
        float circle = smoothstep(rad-width,rad,len)-smoothstep(rad,rad+width,len);
        return vec3(circle);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        uv.x *= 1.5; uv.x -= 0.25;
        float mask = 0.0;
        float radius = .35;
        vec2 center = vec2(.5);
        mask += paintCircle(uv,center,radius,.035).r;
        mask += paintCircle(uv,center,radius-.018,.01).r;
        mask += paintCircle(uv,center,radius+.018,.005).r;
        vec2 v=rotate2d(iTime)*uv;
        vec3 foregroundColor=vec3(0.23,0.51,0.96);
        foregroundColor=mix(foregroundColor,vec3(0.,1.,0.67),v.y*0.3);
        vec3 color=mix(uBackgroundColor,foregroundColor,mask);
        color=mix(color,vec3(1.),paintCircle(uv,center,radius,.003).r);
        gl_FragColor=vec4(color,1.);
      }`;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation error");
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iTimeLoc = gl.getUniformLocation(program, "iTime");
    const iResLoc = gl.getUniformLocation(program, "iResolution");
    const uBgLoc = gl.getUniformLocation(program, "uBackgroundColor");
    gl.uniform3fv(uBgLoc, new Float32Array([0.04, 0.04, 0.06]));

    let animationFrameId: number;
    const render = (time: number) => {
      gl.uniform1f(iTimeLoc, time * 0.001);
      gl.uniform2f(iResLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    animationFrameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block z-0"
      style={{ background: "var(--vg-bg, #0A0A0F)" }}
    />
  );
};

export interface PricingCardProps {
  planName: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: "primary" | "secondary";
}

export const PricingCard = ({
  planName,
  description,
  price,
  period,
  features,
  buttonText,
  isPopular = false,
  buttonVariant = "primary",
}: PricingCardProps) => {
  const cardClasses = `
    backdrop-blur-[14px] rounded-2xl shadow-xl flex-1 max-w-xs px-7 py-8 flex flex-col transition-all duration-300
    bg-gradient-to-br from-white/10 to-white/5 border border-white/10
    ${isPopular ? "scale-105 relative ring-2 ring-vg-accent/30 shadow-2xl from-white/20 to-white/10" : ""}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClasses.trim()}
    >
      {isPopular && (
        <div className="absolute -top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-vg-accent text-white">
          Популярный
        </div>
      )}
      <div className="mb-3">
        <h2 className="text-[42px] font-extralight tracking-tight text-white font-display">
          {planName}
        </h2>
        <p className="text-base text-white/70 mt-1">{description}</p>
      </div>
      <div className="my-6 flex items-baseline gap-2">
        <span className="text-[42px] font-extralight text-white font-display">{price}</span>
        <span className="text-sm text-white/70">{period}</span>
      </div>
      <div className="w-full mb-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <ul className="flex flex-col gap-2 text-sm text-white/90 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckIcon className="text-vg-accent w-4 h-4 flex-shrink-0" /> {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Link
          to="/register"
          className={
            buttonVariant === "primary"
              ? "inline-flex items-center justify-center w-full py-3 px-6 rounded-xl font-semibold text-sm bg-vg-accent hover:bg-vg-accent-hover text-white transition-colors"
              : "inline-flex items-center justify-center w-full py-3 px-6 rounded-xl font-semibold text-sm glass text-vg-accent hover:shadow-glow transition-colors border border-white/10"
          }
        >
          {buttonText}
        </Link>
      </div>
    </motion.div>
  );
};

interface ModernPricingPageProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  plans: PricingCardProps[];
  showAnimatedBackground?: boolean;
}

export const ModernPricingPage = ({
  title,
  subtitle,
  plans,
  showAnimatedBackground = true,
}: ModernPricingPageProps) => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-vg-bg text-white">
      {showAnimatedBackground && <ShaderCanvas />}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extralight leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-vg-accent to-[#00FFAA] font-display">
            {title}
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center items-stretch w-full max-w-4xl">
          {plans.map((plan) => (
            <PricingCard key={plan.planName} {...plan} />
          ))}
        </div>
      </main>
    </div>
  );
};
