import { useEffect, useRef, useState } from 'react';

// Ambient background: a worn, slightly uneven square grid whose segments fade in
// and out, a few cells that light up, grain and dust, and a slow gradient.
// One fixed full-screen WebGL layer behind
// the whole app. Falls back to the static CSS gradient on <body> (ThemeStyles)
// when WebGL is unavailable, and to a single still frame when the user has
// asked their OS for reduced motion.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uDark;
uniform float uDpr;
uniform float uMotion;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}

// One grid segment (a single cell edge): its own slow fade, and some are mostly worn away.
float segAlpha(vec2 seg, float salt) {
  float h = hash21(seg + salt * 17.3);
  float h2 = hash21(seg + salt * 41.9 + 5.1);
  float h3 = hash21(seg + salt * 7.7 + 11.0);
  float wave = sin(uTime * mix(0.025, 0.07, h2) * 6.2831853 + h * 6.2831853);
  float vis = mix(0.08, 1.0, smoothstep(-0.7, 0.7, wave));
  float worn = step(0.82, h3);
  return vis * mix(1.0, 0.12, worn);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = px / uRes;
  float aspect = uRes.x / uRes.y;

  // Gradient: two sine fields warped by each other, drifting very slowly.
  vec2 q = vec2(uv.x * aspect, uv.y) * 1.3;
  float t = uTime * 0.06;
  float a = sin(q.x * 2.1 + t * 1.3 + sin(q.y * 1.7 - t));
  float b = sin(q.y * 2.4 - t * 1.1 + sin(q.x * 1.5 + t * 0.8));
  float m = 0.5 + 0.25 * (a + b);
  float n = 0.5 + 0.5 * sin(q.x * 1.3 + q.y * 0.9 - t * 1.7);

  // Light: soft lilac, teal-leaning blue and mint.
  vec3 c1 = vec3(205.0, 190.0, 245.0) / 255.0;
  vec3 c2 = vec3(138.0, 201.0, 216.0) / 255.0;
  vec3 c3 = vec3(159.0, 229.0, 207.0) / 255.0;
  vec3 lightCol = mix(c1, c2, smoothstep(0.15, 0.85, m));
  lightCol = mix(lightCol, c3, smoothstep(0.55, 1.0, n) * 0.55);

  // Dark: northern lights. The curtains give the shape and brightness; the colour comes from a
  // slowly drifting ramp, so all three hues are always somewhere on screen. Kept dim.
  float top = smoothstep(1.1, 0.05, uv.y);
  vec2 qa = vec2(uv.x * aspect, uv.y);
  float w1 = sin(qa.x * 2.6 + t * 1.7 + 1.4 * sin(qa.y * 2.0 - t * 1.1));
  float w2 = sin(qa.x * 3.4 - t * 1.3 + 2.1 + 1.2 * sin(qa.y * 1.6 + t * 0.9));
  float w3 = sin(qa.x * 1.9 + t * 0.9 + 4.2 + 1.6 * sin(qa.y * 2.4 - t * 0.7));
  float w4 = sin(qa.x * 2.2 - t * 1.1 + 0.7 + 1.5 * sin(qa.y * 1.9 + t * 0.8));
  float cur = 0.55 * smoothstep(-0.1, 1.0, w3) + 0.45 * smoothstep(0.0, 1.0, w4)
            + 0.35 * smoothstep(0.3, 1.0, w2) + 0.25 * smoothstep(0.35, 1.0, w1);
  float inten = clamp(0.3 + 0.9 * cur, 0.0, 1.0) * (0.6 + 0.4 * top);

  // Colour ramp along the drifting field m: green (about half the screen), aqua, blue (about a third), purple (the rest).
  float u = clamp((m - 0.5) * 1.25 + 0.38, 0.0, 1.0);
  vec3 hue = mix(vec3(10.0, 92.0, 62.0), vec3(14.0, 112.0, 104.0), smoothstep(0.15, 0.5, u));
  hue = mix(hue, vec3(28.0, 74.0, 168.0), smoothstep(0.5, 0.75, u));
  hue = mix(hue, vec3(92.0, 44.0, 150.0), smoothstep(0.78, 1.0, u));
  vec3 darkCol = vec3(10.0, 12.0, 22.0) + hue * inten * 0.65;
  darkCol /= 255.0;

  vec3 col = mix(lightCol, darkCol, uDark);

  // Glitch: every few seconds a thin band of the grid slips sideways for a third of a second.
  // Never in still-frame (reduced motion) mode.
  float cell = 20.0 * uDpr;
  float slot = floor(uTime / 7.0);
  float gActive = step(fract(uTime / 7.0), 0.05) * uMotion;
  float gy = hash21(vec2(slot, 3.3)) * uRes.y;
  float gh = mix(10.0, 50.0, hash21(vec2(slot, 8.8))) * uDpr;
  float inBand = gActive * step(abs(px.y - gy), gh * 0.5);
  vec2 gp = px;
  gp.x += inBand * (hash21(vec2(slot, 1.1)) - 0.5) * 2.0 * cell * 0.35;

  // Uneven grid: a static wobble of under two pixels, so the lines are never ruler-straight.
  vec2 wob = vec2(sin(gp.y * 0.021 / uDpr + 1.7) + sin(gp.y * 0.057 / uDpr),
                  sin(gp.x * 0.019 / uDpr + 0.4) + sin(gp.x * 0.061 / uDpr));
  vec2 pw = gp + wob * 0.9 * uDpr;

  vec2 g = pw / cell;
  vec2 id = floor(g);
  vec2 f = fract(g);
  vec2 e = min(f, 1.0 - f) * cell;
  float edge = min(e.x, e.y);

  // Lines: each segment fades on its own, and the whole grid also fades where the gradient shifts colour.
  float ex = f.x < 0.5 ? id.x : id.x + 1.0;
  float ey = f.y < 0.5 ? id.y : id.y + 1.0;
  float lineV = (1.0 - smoothstep(0.0, 1.1 * uDpr, e.x)) * segAlpha(vec2(ex, id.y), 0.0);
  float lineH = (1.0 - smoothstep(0.0, 1.1 * uDpr, e.y)) * segAlpha(vec2(id.x, ey), 1.0);
  float lineMod = mix(0.4, 1.0, smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(q.x * 1.9 - q.y * 1.4 + t * 2.1)));
  float line = max(lineV, lineH) * lineMod;

  // Squares: each cell gets its own slow sine; only the top of the wave lights it. Sizes vary a little.
  float h1 = hash21(id);
  float h2 = hash21(id + 31.7);
  float h3 = hash21(id + 74.1);
  float h4 = hash21(id + 12.9);
  float rate = mix(0.018, 0.045, h2);
  float s = sin(uTime * rate * 6.2831853 + h1 * 6.2831853);
  float lit = smoothstep(0.82, 0.995, s) * step(0.8, h3) * mix(0.55, 1.0, h1);
  float inset = mix(2.0, 5.0, h4) * uDpr;
  float box = smoothstep(inset, inset + 1.0 * uDpr, edge);

  float lineA = mix(0.32, 0.05, uDark);
  float sqA = mix(0.5, 0.07, uDark);
  col = mix(col, vec3(1.0), line * lineA);
  col = mix(col, vec3(1.0), lit * box * sqA * (1.0 - line));

  // Dirt: blotchy mottling, a little dust, and grain.
  float mott = vnoise(px / (90.0 * uDpr)) * 0.6 + vnoise(px / (23.0 * uDpr)) * 0.4;
  col += (mott - 0.5) * mix(0.035, 0.022, uDark);
  float dust = step(0.9993, hash21(floor(px / uDpr) + 7.7));
  col += dust * mix(0.10, 0.05, uDark);
  col += (hash21(px) - 0.5) * mix(3.5, 2.5, uDark) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

const STILL_FRAME_TIME = 42;
const FRAME_INTERVAL_MS = 33;

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('AmbientBackground shader failed:', gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
};

const AmbientBackground = () => {
  const canvasRef = useRef(null);
  const [epoch, setEpoch] = useState(0);
  const retries = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return undefined;

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uDark = gl.getUniformLocation(program, 'uDark');
    const uDpr = gl.getUniformLocation(program, 'uDpr');
    const uMotion = gl.getUniformLocation(program, 'uMotion');

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const startedAt = performance.now();
    let reduced = motionQuery.matches;
    let raf = 0;
    let lastFrame = 0;

    const draw = (now) => {
      gl.uniform1f(uTime, reduced ? STILL_FRAME_TIME : (now - startedAt) / 1000);
      gl.uniform1f(uDark, document.documentElement.classList.contains('dark') ? 1 : 0);
      gl.uniform1f(uMotion, reduced ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < FRAME_INTERVAL_MS) return;
      lastFrame = now;
      draw(now);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) draw(performance.now());
      else raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDpr, dpr);
      draw(performance.now());
    };

    const onMotionChange = (event) => {
      reduced = event.matches;
      start();
    };

    const onContextLost = (event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      canvas.style.display = 'none';
      // The browser dropped the graphics context (memory pressure, GPU reset). Rebuild on a fresh canvas.
      if (retries.current < 3) {
        retries.current += 1;
        setTimeout(() => setEpoch((e) => e + 1), 300);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      if (reduced) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    motionQuery.addEventListener('change', onMotionChange);
    canvas.addEventListener('webglcontextlost', onContextLost);

    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    };
  }, [epoch]);

  return <canvas key={epoch} ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
};

export default AmbientBackground;
