/**
 * HeroShapes — decorative abstract shapes behind the hero.
 *
 * This is a genuinely-animated island: each shape floats continuously and
 * drifts toward the pointer at its own depth (parallax). It's purely
 * decorative (aria-hidden, pointer-events: none) so it has zero LCP / no-JS
 * cost — the hero headline is static HTML rendered by Hero.astro.
 *
 * Motion is gated by `prefers-reduced-motion`.
 */
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'preact/hooks';

interface Shape {
  /** Tailwind positioning classes. */
  pos: string;
  /** Parallax depth — higher drifts further with the pointer. */
  depth: number;
  /** Seconds for one float cycle. */
  float: number;
  render: JSX.Element;
}

const shapes: Shape[] = [
  {
    // Big soft tomato blob, top-right.
    pos: 'top-[-6%] right-[-4%] w-[34rem] h-[34rem]',
    depth: 26,
    float: 11,
    render: (
      <div class="h-full w-full rounded-[42%_58%_60%_40%/45%_45%_55%_55%] bg-accent/15 blur-2xl" />
    ),
  },
  {
    // Sky-blue ring outline, mid-left.
    pos: 'top-[38%] left-[-7%] w-64 h-64',
    depth: 44,
    float: 9,
    render: (
      <div class="h-full w-full rounded-full border-[14px] border-secondary/40" />
    ),
  },
  {
    // Solid tomato dot, lower-right.
    pos: 'bottom-[12%] right-[16%] w-24 h-24',
    depth: 60,
    float: 7,
    render: <div class="h-full w-full rounded-full bg-accent shadow-lg" />,
  },
  {
    // Sky-blue squircle, upper-mid.
    pos: 'top-[12%] left-[34%] w-20 h-20',
    depth: 52,
    float: 8,
    render: (
      <div class="h-full w-full rotate-12 rounded-[32%] bg-secondary/70" />
    ),
  },
  {
    // Hollow tomato plus, lower-left.
    pos: 'bottom-[20%] left-[14%] w-14 h-14',
    depth: 70,
    float: 6,
    render: (
      <svg viewBox="0 0 24 24" class="h-full w-full text-accent">
        <path
          d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </svg>
    ),
  },
];

export default function HeroShapes() {
  const reduce = useReducedMotion();

  // Normalised pointer position (-0.5 .. 0.5), spring-smoothed.
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce]);

  return (
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((s, i) => (
        <ParallaxShape key={i} shape={s} px={px} py={py} reduce={!!reduce} />
      ))}
    </div>
  );
}

function ParallaxShape({
  shape,
  px,
  py,
  reduce,
}: {
  shape: Shape;
  px: ReturnType<typeof useSpring>;
  py: ReturnType<typeof useSpring>;
  reduce: boolean;
}) {
  // Outer layer = pointer parallax (drifts by `depth` px toward the pointer).
  const x = useTransform(px, (v) => v * shape.depth);
  const y = useTransform(py, (v) => v * shape.depth);

  return (
    <motion.div class={`absolute ${shape.pos}`} style={reduce ? undefined : { x, y }}>
      {/* Inner layer = entrance + continuous float, kept on a separate
          transform so it never fights the parallax translate above. */}
      <motion.div
        class="h-full w-full"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={
          reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -16, 0] }
        }
        transition={
          reduce
            ? { duration: 0.6 }
            : {
                opacity: { duration: 0.8, ease: 'easeOut' },
                scale: { duration: 0.8, ease: 'easeOut' },
                y: { duration: shape.float, repeat: Infinity, ease: 'easeInOut' },
              }
        }
      >
        {shape.render}
      </motion.div>
    </motion.div>
  );
}
