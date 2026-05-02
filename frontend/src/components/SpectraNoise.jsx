import { useEffect, useRef, useState } from 'react';

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 centered = uv * 2.0 - 1.0;
  centered.x *= uResolution.x / uResolution.y;

  float t = uTime * 0.18;
  centered += uWarp * 0.13 * vec2(
    sin(centered.y * 3.7 + t * 1.8),
    cos(centered.x * 4.1 - t * 1.6)
  );

  float waveA = fbm(centered * 1.55 + vec2(t, -t * 0.7));
  float waveB = fbm(centered * 2.6 + vec2(-t * 0.55, t * 0.9));
  float ribbon = smoothstep(0.18, 0.95, waveA + waveB * 0.62);

  vec3 color = mix(uColorA, uColorB, ribbon);
  color = mix(color, uColorC, smoothstep(0.52, 0.9, waveB));
  color *= 0.62 + 0.52 * smoothstep(-0.72, 0.88, centered.y + waveA * 0.9);

  float scanline = sin(gl_FragCoord.y * uScanFreq) * 0.5 + 0.5;
  color *= 1.0 - scanline * scanline * uScan;
  color += (hash(gl_FragCoord.xy + uTime) - 0.5) * uNoise;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  const normalized = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value;
  const number = parseInt(normalized, 16);
  return [
    ((number >> 16) & 255) / 255,
    ((number >> 8) & 255) / 255,
    (number & 255) / 255,
  ];
};

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export default function SpectraNoise({
  className = '',
  style,
  speed = 0.85,
  noiseIntensity = 0.18,
  scanlineIntensity = 0.08,
  scanlineFrequency = 0.025,
  warpAmount = 0.7,
  colors = ['#050706', '#81f600', '#1d3f21'],
}) {
  const canvasRef = useRef(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: true })
      || canvas.getContext('experimental-webgl', { antialias: false, alpha: true });

    if (!gl) {
      setSupported(false);
      return undefined;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      setSupported(false);
      return undefined;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setSupported(false);
      return undefined;
    }

    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      noise: gl.getUniformLocation(program, 'uNoise'),
      scan: gl.getUniformLocation(program, 'uScan'),
      scanFreq: gl.getUniformLocation(program, 'uScanFreq'),
      warp: gl.getUniformLocation(program, 'uWarp'),
      colorA: gl.getUniformLocation(program, 'uColorA'),
      colorB: gl.getUniformLocation(program, 'uColorB'),
      colorC: gl.getUniformLocation(program, 'uColorC'),
    };

    const [colorA, colorB, colorC] = colors.map(hexToRgb);
    gl.uniform1f(uniforms.noise, noiseIntensity);
    gl.uniform1f(uniforms.scan, scanlineIntensity);
    gl.uniform1f(uniforms.scanFreq, scanlineFrequency);
    gl.uniform1f(uniforms.warp, warpAmount);
    gl.uniform3f(uniforms.colorA, ...colorA);
    gl.uniform3f(uniforms.colorB, ...colorB);
    gl.uniform3f(uniforms.colorC, ...colorC);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const width = Math.max(parent.clientWidth, 1);
      const height = Math.max(parent.clientHeight, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    let frame = 0;
    const start = performance.now();
    const render = () => {
      const elapsed = (performance.now() - start) / 1000;
      gl.uniform1f(uniforms.time, elapsed * speed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [colors, noiseIntensity, scanlineFrequency, scanlineIntensity, speed, warpAmount]);

  if (!supported) {
    return <div className={`spectra-fallback ${className}`} style={style} aria-hidden="true" />;
  }

  return <canvas ref={canvasRef} className={className} style={style} aria-hidden="true" />;
}
