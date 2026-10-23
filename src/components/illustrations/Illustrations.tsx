import type { ReactNode } from 'react';
import type { IllustrationKey } from '../../config/services';
import { LOGO_URL } from '../../config/brand';

const NAVY = '#0F1F3B';
const NAVY2 = '#1F3966';
const AMBER = '#F57C1F';
const AMBER_SOFT = '#FFB167';
const PAPER = '#FAF8F4';
const KRAFT = '#C9A06F';
const KRAFT_DARK = '#A97E50';
const LEAF = '#7F9C6B';
const GLASS = '#CFE0EE';
const TRUCK_BLUE = '#2E9BD6';
const TRUCK_ORANGE = '#F07A1E';

/** Side-view branded truck, drawn at (x, y) = bottom-left of wheels baseline. */
export function SvgTruck({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Blue ribbed container */}
      <rect x="0" y="-64" width="96" height="54" rx="2" fill={TRUCK_BLUE} />
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={3 + i * 6.3} y="-63" width="1.4" height="52" fill="#1F7DB5" opacity="0.55" />
      ))}
      <rect x="6" y="-64" width="12" height="2.5" fill="#F5C518" />
      <rect x="78" y="-64" width="12" height="2.5" fill="#F5C518" />
      {/* Company logo on a white decal panel */}
      <rect x="9" y="-56" width="78" height="34" rx="3" fill="#FFFFFF" />
      <image href={LOGO_URL} x="12" y="-53" width="72" height="28" preserveAspectRatio="xMidYMid meet" />
      {/* Orange cab with white roof fairing */}
      <path d="M99 -62h16l7 10h-23z" fill="#F4F5F7" />
      <path d="M99 -52h22l9 6v36H99z" fill={TRUCK_ORANGE} />
      <path d="M106 -49h13l7 6v8h-20z" fill="#2B3A4A" />
      <rect x="99" y="-24" width="31" height="2" fill="#F5C518" />
      <rect x="-2" y="-12" width="134" height="6" rx="2" fill="#2B323D" />
      {[16, 36, 112].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="-4" r="9" fill="#1D232C" />
          <circle cx={cx} cy="-4" r="4" fill="#C9CED6" />
        </g>
      ))}
    </g>
  );
}

function Box({ x, y, w = 34, h = 28, label }: { x: number; y: number; w?: number; h?: number; label?: string }) {
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} rx="2" fill={KRAFT} />
      <rect x={x + w / 2 - 3} y={y - h} width="6" height={h * 0.45} fill="#E9D7B0" />
      <rect x={x + w * 0.58} y={y - h * 0.4} width={w * 0.3} height={h * 0.22} fill={label ?? PAPER} />
      <path d={`M${x} ${y - h}h${w}`} stroke={KRAFT_DARK} strokeWidth="1.5" />
    </g>
  );
}

function House({ x, y, s = 1, door = AMBER }: { x: number; y: number; s?: number; door?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -40 34 -68l34 28v40H0z" fill={PAPER} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="26" y="-26" width="16" height="26" fill={door} />
      <rect x="8" y="-34" width="12" height="11" fill={GLASS} stroke={NAVY} strokeWidth="1.5" />
      <rect x="48" y="-34" width="12" height="11" fill={GLASS} stroke={NAVY} strokeWidth="1.5" />
    </g>
  );
}

function Ground({ y = 170 }: { y?: number }) {
  return <rect x="0" y={y} width="320" height={200 - y} fill="#EDE8DF" />;
}

function Route({ d, dashed = false }: { d: string; dashed?: boolean }) {
  return <path d={d} fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" strokeDasharray={dashed ? '2 7' : undefined} />;
}

function Pin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0c-7-9-11-14-11-20a11 11 0 0 1 22 0c0 6-4 11-11 20z" fill={AMBER} />
      <circle cx="0" cy="-20" r="4" fill={PAPER} />
    </g>
  );
}

function Sofa({ x, y, wrapped = false }: { x: number; y: number; wrapped?: boolean }) {
  return (
    <g>
      <rect x={x} y={y - 34} width="86" height="22" rx="6" fill="#56698A" />
      <rect x={x - 6} y={y - 22} width="98" height="16" rx="5" fill="#4A5C7A" />
      <rect x={x - 6} y={y - 6} width="6" height="6" fill={NAVY} />
      <rect x={x + 86} y={y - 6} width="6" height="6" fill={NAVY} />
      {wrapped && <rect x={x - 9} y={y - 38} width="104" height="38" rx="8" fill="#DCE6F0" opacity="0.7" stroke="#B9C9DA" strokeDasharray="4 4" />}
    </g>
  );
}

function Desk({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y - 42} width="90" height="5" fill={NAVY2} />
      <rect x={x + 4} y={y - 37} width="4" height="37" fill={NAVY2} />
      <rect x={x + 82} y={y - 37} width="4" height="37" fill={NAVY2} />
      <rect x={x + 26} y={y - 74} width="40" height="26" rx="2" fill={NAVY} />
      <rect x={x + 29} y={y - 71} width="34" height="20" fill="#3E6596" />
      <rect x={x + 44} y={y - 48} width="4" height="6" fill={NAVY} />
    </g>
  );
}

function Frame({ children, bg }: { children: ReactNode; bg: string }) {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill={bg} />
      {children}
    </svg>
  );
}

export function ServiceIllustration({ kind }: { kind: IllustrationKey }) {
  switch (kind) {
    case 'home':
      return (
        <Frame bg="#F4EEE4">
          <Ground />
          <House x={30} y={170} s={1.5} />
          <Sofa x={150} y={170} />
          <Box x={258} y={170} />
          <Box x={262} y={142} w={28} h={22} />
          <circle cx="282" cy="48" r="16" fill={AMBER_SOFT} opacity="0.6" />
        </Frame>
      );
    case 'office':
      return (
        <Frame bg="#E9EEF5">
          <rect x="0" y="0" width="320" height="170" fill="#E9EEF5" />
          <rect x="190" y="26" width="104" height="70" rx="3" fill={GLASS} stroke={NAVY} strokeWidth="2" />
          <path d="M242 26v70M190 61h104" stroke={NAVY} strokeWidth="1.5" />
          <Ground />
          <Desk x={30} y={170} />
          <rect x="140" y="110" width="36" height="60" rx="2" fill="#D9DDE3" stroke={NAVY2} strokeWidth="1.5" />
          <path d="M150 130h16M150 150h16" stroke={NAVY} strokeWidth="2" />
          <Box x={200} y={170} label={AMBER} />
          <Box x={240} y={170} label="#2E4D80" />
          <Box x={218} y={142} label={AMBER} />
        </Frame>
      );
    case 'local':
      return (
        <Frame bg="#F1EEE8">
          <Ground y={160} />
          <House x={16} y={160} s={1.05} />
          <House x={232} y={160} s={1.05} door={NAVY2} />
          <Route d="M70 178 C130 188 190 188 256 178" dashed />
          <SvgTruck x={104} y={160} scale={0.8} />
          <Pin x={42} y={94} />
          <Pin x={268} y={94} />
        </Frame>
      );
    case 'long-distance':
      return (
        <Frame bg="#EEF1F5">
          <path d="M0 140 60 92l50 40 60-62 70 70 80-52v112H0z" fill="#DDE3EA" />
          <Ground y={168} />
          <Route d="M24 150 C80 110 120 180 170 130 S260 90 300 120" dashed />
          <Pin x={24} y={146} />
          <Pin x={300} y={116} />
          <SvgTruck x={110} y={190} scale={0.7} />
          <circle cx="58" cy="168" r="8" fill={LEAF} />
          <circle cx="250" cy="168" r="10" fill={LEAF} />
        </Frame>
      );
    case 'packing':
      return (
        <Frame bg="#F5EFE6">
          <Ground y={164} />
          <rect x="70" y="96" width="96" height="68" fill={KRAFT} />
          <path d="M70 96 52 70h96l18 26M166 96l20-28h-38" fill={KRAFT_DARK} />
          <rect x="84" y="76" width="18" height="24" fill="#56698A" />
          <rect x="108" y="70" width="22" height="28" rx="3" fill={GLASS} stroke={NAVY} strokeWidth="1.5" />
          <rect x="196" y="98" width="38" height="66" rx="8" fill="#DCE6F0" stroke="#B9C9DA" strokeWidth="2" />
          <ellipse cx="215" cy="98" rx="19" ry="5" fill="#EAF0F6" stroke="#B9C9DA" strokeWidth="2" />
          <circle cx="262" cy="154" r="12" fill="none" stroke={AMBER_SOFT} strokeWidth="7" />
          <path d="M24 60h30M30 48l16 24" stroke={AMBER} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </Frame>
      );
    case 'furniture':
      return (
        <Frame bg="#F0ECE5">
          <Ground y={166} />
          <Sofa x={36} y={166} wrapped />
          <rect x="176" y="72" width="46" height="94" rx="5" fill="#E3E7EC" stroke={NAVY2} strokeWidth="2" />
          <path d="M210 92v22" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
          <rect x="172" y="68" width="54" height="102" rx="8" fill="#DCE6F0" opacity="0.55" stroke="#B9C9DA" strokeDasharray="4 4" />
          <rect x="240" y="120" width="52" height="46" fill="#B88A5C" />
          <rect x="236" y="114" width="60" height="8" fill="#DBC29F" />
        </Frame>
      );
    case 'vehicle':
      return (
        <Frame bg="#EEF1F5">
          <Ground y={160} />
          <path d="M70 140 92 114h70l24 26h34v22H58v-22z" fill={NAVY2} />
          <path d="M98 118h26v20H82zM130 118h28l18 20h-46z" fill={GLASS} />
          <circle cx="94" cy="162" r="12" fill="#1D232C" />
          <circle cx="186" cy="162" r="12" fill="#1D232C" />
          <Route d="M30 184h260" dashed />
        </Frame>
      );
    case 'custom':
    default:
      return (
        <Frame bg="#F3EFE8">
          <Ground y={166} />
          <Box x={70} y={166} w={60} h={48} />
          <Box x={136} y={166} w={44} h={36} />
          <Box x={96} y={118} w={40} h={30} />
          <rect x="196" y="48" width="96" height="54" rx="12" fill={NAVY} />
          <path d="M214 102l-6 16 22-16" fill={NAVY} />
          <circle cx="222" cy="75" r="4.5" fill={AMBER} />
          <circle cx="244" cy="75" r="4.5" fill={PAPER} />
          <circle cx="266" cy="75" r="4.5" fill={PAPER} />
        </Frame>
      );
  }
}

export type FallbackVariant = 'hero' | 'home' | 'office' | 'planner' | 'finale';

/** Static scene shown when WebGL is unavailable, while a scene loads, or if it fails. */
export function SceneFallback({ variant, dark = false }: { variant: FallbackVariant; dark?: boolean }) {
  const ground = dark ? '#1A2B48' : '#EAE5DC';
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
        <rect x="0" y="282" width="640" height="78" fill={ground} />
        <rect x="0" y="292" width="640" height="26" fill={dark ? '#26344C' : '#3B4351'} />
        <path d="M0 305h640" stroke="#E9E4DA" strokeWidth="2" strokeDasharray="18 18" />
        <path d="M60 326H580" stroke={AMBER} strokeWidth="3" strokeLinecap="round" />
        {variant === 'office' || variant === 'finale' ? (
          <g transform={`translate(${variant === 'finale' ? 450 : 360} 282)`}>
            <rect x="0" y="-150" width="130" height="150" fill={NAVY2} />
            {[0, 1, 2, 3].map((r) =>
              [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={14 + c * 38} y={-138 + r * 34} width="26" height="22" fill={(r + c) % 2 ? GLASS : '#FFE2B8'} />),
            )}
          </g>
        ) : null}
        {variant !== 'office' && (
          <g transform="translate(70 282) scale(2.1)">
            <House x={0} y={0} />
          </g>
        )}
        {variant === 'office' && (
          <g transform="translate(70 282)">
            <Desk x={0} y={0} />
            <Desk x={100} y={0} />
          </g>
        )}
        <SvgTruck x={variant === 'finale' ? 250 : 230} y={300} scale={1.25} />
        <g transform="translate(0 0)">
          <Box x={variant === 'office' ? 60 : 210} y={282} />
          <Box x={variant === 'office' ? 96 : 246} y={282} w={28} h={22} />
        </g>
      </svg>
    </div>
  );
}
