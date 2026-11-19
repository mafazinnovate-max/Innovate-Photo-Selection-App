"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  DragEvent as ReactDragEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface AlbumImage {
  id: string;
  imageUrl: string;
  fileName: string | null;
}

interface SelectedAlbumPreviewProps {
  images: AlbumImage[];
  onClose: () => void;
  /* Studio branding shown on the album cover (both optional) */
  studioName?: string;
  studioLogoUrl?: string | null;
}

interface StudioBrand {
  name?: string;
  logoUrl?: string | null;
}

interface AlbumPage {
  id: string;
  images: AlbumImage[];
}

interface AlbumSpread {
  id: string;
  left: AlbumPage;
  right: AlbumPage;
}

/* ------------------------------------------------------------------ */
/* Page-turn types + look-and-feel constants                           */
/* ------------------------------------------------------------------ */

interface TurnFace {
  page: AlbumPage;
  pageNumber: number;
  cover?: "front" | "back"; // draw the studio front/back cover instead of a photo page
}

interface TurnState {
  dir: "next" | "prev";
  mode: "spread" | "page";
  cover?: "open" | "close" | "end" | "unend"; // set when the sheet is a cover: front (open/close) or back (end/unend)
  n: number; // number of vertical strips the paper is cut into
  pw: number; // page width in px
  ph: number; // page height in px
  baseLeft?: TurnFace;
  baseRight?: TurnFace;
  base?: TurnFace;
  front: TurnFace;
  back?: TurnFace;
}

type SliceKind = "slice" | "front" | "back";

/* Live state of one page turn. Mutated every frame, never stored in React state. */
interface TurnCtl {
  mode: "tween" | "drag" | "spring";
  k: number; // 0 = turn not started, 1 = turn finished (direction independent)
  kTarget: number; // where the pointer wants the page (drag mode)
  v: number; // physical velocity in k / second (spring mode)
  vis: number; // smoothed visual velocity, drives paper flutter + fling
  target: 0 | 1; // where the spring is heading
  t0: number; // tween start timestamp
}

/* A pointer gesture on the album */
interface DragInfo {
  id: number;
  x0: number;
  y0: number;
  desktop: boolean;
  side: "left" | "right";
  spineX: number;
  pw: number;
  dir: "next" | "prev";
  moved: boolean;
  started: boolean;
  dead: boolean;
  el: HTMLElement;
}

const FACE_HIDDEN: CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

/* Stacked paper edges on both sides + a soft contact shadow on the desk */
const BOOK_SHADOW = [
  "0 2px 3px rgba(0,0,0,0.35)",
  "1px 2px 0 #f0e8d9",
  "2px 4px 0 #e5dccb",
  "3px 6px 0 #d8cdb9",
  "4px 8px 0 #cabfa9",
  "-1px 2px 0 #f0e8d9",
  "-2px 4px 0 #e5dccb",
  "-3px 6px 0 #d8cdb9",
  "-4px 8px 0 #cabfa9",
].join(", ");

const PAGE_SHADOW = [
  "0 2px 3px rgba(0,0,0,0.35)",
  "1px 2px 0 #f0e8d9",
  "2px 4px 0 #e5dccb",
  "3px 6px 0 #d8cdb9",
  "4px 8px 0 #cabfa9",
].join(", ");

/* Soft pool of light on the desk behind the album */
const STAGE_GLOW =
  "radial-gradient(ellipse 72% 62% at 50% 46%, rgba(222,204,172,0.13) 0%, rgba(222,204,172,0.04) 45%, rgba(0,0,0,0) 72%)";

/* Hardcover: oxblood leather, fine grain, gold foil rule and a thick board edge */
const COVER_LEATHER =
  "linear-gradient(145deg, #5a2128 0%, #43171d 45%, #2d0f14 100%)";

/*
 * Cover artwork (maroon paisley). Put the image at /public/album-cover-pattern.jpg
 * (or change this path). If the file is missing, the leather gradient underneath
 * shows instead, so nothing breaks.
 */
const COVER_IMAGE = "/album-cover-pattern.jpg";

/* Paisley art + a soft dark veil (keeps the gold foil readable) over the leather fallback */
const COVER_SURFACE: CSSProperties = {
  backgroundImage: `linear-gradient(rgba(26,6,10,0.22), rgba(26,6,10,0.46)), url("${COVER_IMAGE}"), ${COVER_LEATHER}`,
  backgroundSize: "100% 100%, cover, 100% 100%",
  backgroundPosition: "center, center, center",
  backgroundRepeat: "no-repeat, no-repeat, no-repeat",
};

/* Solid colour behind the cover strips so no light seam can show between them */
const COVER_STRIP_BG = "#3a1319";

const COVER_SHADOW = [
  "inset 0 1px 0 rgba(255,255,255,0.14)",
  "inset 0 -2px 3px rgba(0,0,0,0.35)",
  "0 3px 0 #2a0e12",
  "0 6px 0 #1d0a0d",
  "0 10px 0 #120608",
  "0 46px 70px -18px rgba(0,0,0,0.7)",
  "0 22px 40px rgba(0,0,0,0.45)",
].join(", ");

const LEATHER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='l'><feTurbulence type='fractalNoise' baseFrequency='.6' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -.3'/></filter><rect width='220' height='220' filter='url(%23l)'/></svg>\")";

const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  0 0 0 .5 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")";

/* Tuning knobs for the paper */
const SPREAD_MS = 1500; // button / key / tap turn duration (desktop)
const PAGE_MS = 1050; // button / key / tap turn duration (mobile)
const SPREAD_SLICES = 16; // more strips = smoother curve (heavier)
const PAGE_SLICES = 12;
const SPREAD_BEND = 58; // degrees the free edge trails the spine mid-turn
const PAGE_BEND = 46;
const PAGE_LIFT = 34; // px the leaf rises toward the viewer mid-turn

/* Front cover is a stiff board: it bends far less than paper and opens a bit slower */
const COVER_STIFFNESS = 0.22; // 1 = bends like paper, 0 = perfectly rigid
const COVER_LIFT = 0.35; // how much of PAGE_LIFT the cover rises
const COVER_SLOWDOWN = 1.3; // duration multiplier for the cover

/* Longer lens while a cover swings, so the board does not balloon toward the viewer */
const PERSPECTIVE_PAPER = 3600;
const PERSPECTIVE_COVER = 7200;
const PERSPECTIVE_PAPER_MOBILE = 1800;
const PERSPECTIVE_COVER_MOBILE = 4200;

/* Pointer + physics feel */
const DRAG_THRESHOLD = 6; // px before a press becomes a drag
const DRAG_FOLLOW = 26; // how tightly the paper chases the cursor (higher = snappier)
const FLING_LOOKAHEAD = 0.13; // seconds of momentum considered when you let go
const SPRING_K = 150; // settle stiffness
const SPRING_C = 2 * Math.sqrt(SPRING_K) * 0.96; // near-critical damping: no bounce

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Quintic smootherstep: gentle peel, no hard velocity spike, soft landing */
const easeInOut = (t: number) => t * t * t * (t * (6 * t - 15) + 10);

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/*
 * Turns a pointer x position into turn progress (0..1).
 * Desktop: the point of the page you grabbed follows the cursor along a real arc.
 * Mobile: simple horizontal swipe distance.
 */
function dragProgress(d: DragInfo, x: number): number {
  if (!d.desktop) {
    const span = d.pw * 0.85;
    return clamp01(d.dir === "next" ? (d.x0 - x) / span : (x - d.x0) / span);
  }

  const grab = Math.max(0.3, Math.min(1, Math.abs(d.x0 - d.spineX) / d.pw));
  const reach = grab * d.pw;
  const dn =
    d.dir === "next" ? (x - d.spineX) / reach : (d.spineX - x) / reach;

  return Math.acos(Math.min(1, Math.max(-1, dn))) / Math.PI;
}

/* ------------------------------------------------------------------ */
/* Hardcover that frames the album. Purely decorative.                  */
/* ------------------------------------------------------------------ */

function AlbumCover({ variant }: { variant: "spread" | "single" }) {
  const spread = variant === "spread";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-0 ${
        spread
          ? "-inset-x-3 -top-3 -bottom-4 sm:-inset-x-5 sm:-top-4 sm:-bottom-6"
          : "-inset-x-2 -top-2.5 -bottom-3.5"
      }`}
    >
      {/* Board with thickness */}
      <div
        className="absolute inset-0 rounded-[10px]"
        style={{ ...COVER_SURFACE, boxShadow: COVER_SHADOW }}
      />
      {/* Leather grain */}
      <div
        className="absolute inset-0 rounded-[10px] opacity-60"
        style={{ backgroundImage: LEATHER_GRAIN, backgroundSize: "220px 220px" }}
      />
      {/* Light falling across the board */}
      <div
        className="absolute inset-0 rounded-[10px]"
        style={{
          background:
            "linear-gradient(125deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 32%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      {/* Gold foil rule and stitching */}
      <div className="absolute inset-[5px] rounded-[6px] border border-[#d4b06a]/50" />
      <div className="absolute inset-[9px] rounded-[4px] border border-dashed border-[#e8cf98]/20" />
      {/* Hinge groove where the two boards meet */}
      {spread && (
        <div
          className="absolute inset-y-0 left-1/2 w-[14px] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0) 100%)",
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Front cover face with the studio logo + name.                        */
/* It fills exactly one page, so it is the same size as the album.      */
/* ------------------------------------------------------------------ */

function StudioCoverFace({
  name,
  logoUrl,
  variant = "front",
}: StudioBrand & { variant?: "front" | "back" }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={COVER_SURFACE}
    >
      {/* Leather grain */}
      <div
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: LEATHER_GRAIN, backgroundSize: "220px 220px" }}
      />
      {/* Light falling across the board */}
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0)_32%,rgba(0,0,0,0)_62%,rgba(0,0,0,0.3)_100%)]" />
      {/* Hinge groove on the spine side (left edge on the front, right edge on the back) */}
      <div
        className={`absolute inset-y-0 w-[7%] ${
          variant === "front"
            ? "left-0 bg-gradient-to-r from-black/55 to-transparent"
            : "right-0 bg-gradient-to-l from-black/55 to-transparent"
        }`}
      />
      {/* Gold foil rule and stitching */}
      <div className="absolute inset-[10px] rounded-[4px] border border-[#d4b06a]/50" />
      <div className="absolute inset-[16px] rounded-[3px] border border-dashed border-[#e8cf98]/20" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 sm:gap-5">
        {/* Studio logo */}
        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[#d4b06a] bg-black/20 text-[#e8cf98] shadow-[0_0_0_6px_rgba(212,176,106,0.12)] sm:h-36 sm:w-36">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name ? `${name} logo` : "Studio logo"}
              fill
              unoptimized
              draggable={false}
              sizes="144px"
              className="object-contain p-4"
            />
          ) : (
            <BookOpen size={40} />
          )}
        </div>

        {/* Studio name in gold foil */}
        {name && (
          <span className="bg-gradient-to-r from-[#9c7a38] via-[#f1dca4] to-[#b48d45] bg-clip-text text-center font-serif text-lg uppercase tracking-[0.42em] text-transparent sm:text-xl">
            {name}
          </span>
        )}

        <span className="h-px w-16 bg-[#d4b06a]/60" />
        <span className="text-[10px] tracking-[0.4em] text-[#e8cf98]/60">
          {variant === "front" ? "TAP TO OPEN" : "THANK YOU"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Existing helpers (unchanged)                                        */
/* ------------------------------------------------------------------ */

function createPage(
  images: AlbumImage[],
  index: number,
): AlbumPage {
  return {
    id: `page-${index}`,
    images,
  };
}

function createSpreads(images: AlbumImage[]): AlbumSpread[] {
  const spreads: AlbumSpread[] = [];

  /* One photo per page, so a spread (left + right page) holds two photos. */
  for (let i = 0; i < images.length; i += 2) {
    const group = images.slice(i, i + 2);

    spreads.push({
      id: `spread-${i}`,
      left: createPage(group.slice(0, 1), i),
      right: createPage(group.slice(1, 2), i + 1),
    });
  }

  return spreads;
}

function AlbumPhoto({
  image,
  className = "",
}: {
  image: AlbumImage;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-0 overflow-hidden bg-[#e8e0d4] ${className}`}
    >
      <Image
        src={image.imageUrl}
        alt={image.fileName || "Selected wedding photograph"}
        fill
        unoptimized
        draggable={false}
        sizes="(max-width: 768px) 90vw, 45vw"
        className="object-contain"
      />
    </div>
  );
}

function AlbumPageContent({
  page,
  pageNumber,
}: {
  page: AlbumPage;
  pageNumber: number;
}) {
  const photos = page.images;
  const layout = pageNumber % 3;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#f5f0e7] p-4 sm:p-6 lg:p-9">
      <div className="mb-3 flex items-center justify-between sm:mb-5">
        <span className="font-serif text-[9px] tracking-[0.28em] text-[#9a8974] sm:text-[10px]">
          YOUR WEDDING STORY
        </span>
        <span className="text-[9px] tracking-[0.2em] text-[#aa9b88]">
          {String(pageNumber).padStart(2, "0")}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {photos.length === 1 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <AlbumPhoto
              image={photos[0]}
              className="min-h-0 flex-1"
            />
            <p className="mt-4 text-center font-serif text-sm italic tracking-wide text-[#85735f] sm:mt-5 sm:text-base">
              A moment to remember
            </p>
          </div>
        )}

        {photos.length === 2 && (
          <div
            className={`grid min-h-0 flex-1 gap-3 sm:gap-4 ${
              layout === 1
                ? "grid-rows-[1.35fr_0.85fr]"
                : layout === 2
                  ? "grid-rows-[0.85fr_1.35fr]"
                  : "grid-rows-2"
            }`}
          >
            <AlbumPhoto image={photos[0]} />
            <AlbumPhoto image={photos[1]} />
          </div>
        )}

        {photos.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <span className="font-serif text-sm italic text-[#b0a18d]">
              The story continues...
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center sm:mt-5">
        <span className="h-px w-8 bg-[#c9bba8]" />
        <span className="mx-3 font-serif text-[9px] tracking-[0.3em] text-[#a08f79]">
          FOREVER
        </span>
        <span className="h-px w-8 bg-[#c9bba8]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Magazine paper finish: bound-spine curve, edge roll-off, coated     */
/* sheen, grain. Pure overlay - never changes the page content.        */
/* ------------------------------------------------------------------ */

function PageFinish({ side }: { side: "left" | "right" }) {
  // The spine sits on the right edge of a left page and the left edge of a right page.
  const toward = side === "left" ? "to left" : "to right";
  const away = side === "left" ? "to right" : "to left";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
      {/* Gutter: the paper dives into the binding, then rises into a soft crown */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            `linear-gradient(${toward}, rgba(28,18,8,0.56) 0%, rgba(28,18,8,0.36) 1.6%, rgba(28,18,8,0.19) 4.5%, rgba(28,18,8,0.08) 9%, rgba(28,18,8,0) 18%)`,
            `linear-gradient(${toward}, rgba(255,248,235,0) 7%, rgba(255,248,235,0.17) 12.5%, rgba(255,248,235,0.05) 17.5%, rgba(255,248,235,0) 25%)`,
          ].join(", "),
        }}
      />

      {/* Outer edge roll-off and head / foot falloff, so the sheet reads as a curved object */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            `linear-gradient(${away}, rgba(60,44,24,0.15) 0%, rgba(60,44,24,0) 2.4%)`,
            "linear-gradient(to bottom, rgba(60,44,24,0.07) 0%, rgba(60,44,24,0) 3.5%, rgba(60,44,24,0) 95%, rgba(60,44,24,0.1) 100%)",
          ].join(", "),
        }}
      />

      {/* Satin sheen of coated magazine stock */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${side === "left" ? "250deg" : "110deg"}, rgba(255,255,255,0) 26%, rgba(255,255,255,0.13) 45%, rgba(255,255,255,0.03) 58%, rgba(255,255,255,0) 66%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: PAPER_GRAIN, backgroundSize: "160px 160px" }}
      />
    </div>
  );
}

/* One side of a turning sheet: either the studio cover or a normal page. */
function FaceContent({
  face,
  side,
  studio,
}: {
  face: TurnFace;
  side: "left" | "right";
  studio?: StudioBrand;
}) {
  if (face.cover) {
    return (
      <StudioCoverFace
        name={studio?.name}
        logoUrl={studio?.logoUrl}
        variant={face.cover}
      />
    );
  }

  return (
    <>
      <AlbumPageContent page={face.page} pageNumber={face.pageNumber} />
      <PageFinish side={side} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Bendable paper leaf.                                                */
/* The page is cut into thin vertical strips. Each strip is nested in  */
/* the previous one and rotated a little more, so the sheet curves     */
/* like paper instead of staying stiff like cardboard.                 */
/* ------------------------------------------------------------------ */

interface BendSliceProps {
  index: number;
  count: number;
  sw: number;
  pw: number;
  ph: number;
  front: TurnFace;
  back: TurnFace | null;
  frontSide: "left" | "right";
  backSide: "left" | "right";
  studio?: StudioBrand;
  reg: (kind: SliceKind, index: number, el: HTMLDivElement | null) => void;
}

function BendSlice({
  index,
  count,
  sw,
  pw,
  ph,
  front,
  back,
  frontSide,
  backSide,
  studio,
  reg,
}: BendSliceProps) {
  const isLast = index === count - 1;
  /* Cover strips sit on a dark base and overlap a touch more, so no light seams show between them */
  const overlap = front.cover || back?.cover ? 2 : 1;

  return (
    <div
      ref={(el) => reg("slice", index, el)}
      className="absolute top-0"
      style={{
        left: index === 0 ? 0 : sw,
        width: isLast ? sw : sw + overlap, // overlap hides hairline seams
        height: ph,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Front of the paper */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          ...FACE_HIDDEN,
          backgroundColor: front.cover ? COVER_STRIP_BG : "#f5f0e7",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -index * sw,
            width: pw,
            height: ph,
          }}
        >
          <FaceContent face={front} side={frontSide} studio={studio} />
        </div>
        {/* Light + shade, blended continuously across neighbouring strips */}
        <div
          ref={(el) => reg("front", index, el)}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[7]"
          style={{ willChange: "transform" }}
        />
        {/* Paper thickness catching light on the free edge */}
        {isLast && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-[8] w-px bg-white/70"
          />
        )}
      </div>

      {/* Back of the paper */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          ...FACE_HIDDEN,
          transform: "rotateY(180deg)",
          backgroundColor: back?.cover ? COVER_STRIP_BG : "#ece4d5",
        }}
      >
        {back && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: -(count - 1 - index) * sw,
              width: pw,
              height: ph,
            }}
          >
            <FaceContent face={back} side={backSide} studio={studio} />
          </div>
        )}
        <div
          ref={(el) => reg("back", index, el)}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[7]"
          style={{ willChange: "transform" }}
        />
        {isLast && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[8] w-px bg-white/70"
          />
        )}
      </div>

      {!isLast && (
        <BendSlice
          index={index + 1}
          count={count}
          sw={sw}
          pw={pw}
          ph={ph}
          front={front}
          back={back}
          frontSide={frontSide}
          backSide={backSide}
          studio={studio}
          reg={reg}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function SelectedAlbumPreview({
  images,
  onClose,
  studioName,
  studioLogoUrl,
}: SelectedAlbumPreviewProps) {
  const spreads = useMemo(() => createSpreads(images), [images]);

  const pages = useMemo(
    () => spreads.flatMap((spread) => [spread.left, spread.right]),
    [spreads],
  );

  const studio: StudioBrand = { name: studioName, logoUrl: studioLogoUrl };

  const [currentSpread, setCurrentSpread] = useState(0);
  const [currentMobilePage, setCurrentMobilePage] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const [turn, setTurn] = useState<TurnState | null>(null);
  const [hinted, setHinted] = useState(false);
  /* false = the book is closed and shows the studio cover */
  const [opened, setOpened] = useState(false);
  /* true = the book has been closed from the back and shows the back cover */
  const [ended, setEnded] = useState(false);
  /* set when "back to cover" is pressed away from the first spread */
  const [wantClose, setWantClose] = useState(false);

  const turningRef = useRef(false);
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});
  const bookRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const castLeftRef = useRef<HTMLDivElement>(null);
  const castRightRef = useRef<HTMLDivElement>(null);
  const sliceEls = useRef<(HTMLDivElement | null)[]>([]);
  const frontEls = useRef<(HTMLDivElement | null)[]>([]);
  const backEls = useRef<(HTMLDivElement | null)[]>([]);

  const ctlRef = useRef<TurnCtl>({
    mode: "tween",
    k: 0,
    kTarget: 0,
    v: 0,
    vis: 0,
    target: 1,
    t0: 0,
  });
  const dragRef = useRef<DragInfo | null>(null);
  const startTurnRef = useRef<(dir: "next" | "prev", drag?: boolean) => boolean>(
    () => false,
  );
  const moveRef = useRef<(ev: PointerEvent) => void>(() => {});
  const upRef = useRef<(ev: PointerEvent) => void>(() => {});

  const reg = useCallback(
    (kind: SliceKind, index: number, el: HTMLDivElement | null) => {
      const list =
        kind === "slice" ? sliceEls : kind === "front" ? frontEls : backEls;
      list.current[index] = el;
    },
    [],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      // One step, clamped - plays the page turn.
      if (event.key === "ArrowRight") nextRef.current();
      if (event.key === "ArrowLeft") prevRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, spreads.length, pages.length]);

  /* Pointer gestures are tracked on the window so a drag never "drops" at the book's edge. */
  useEffect(() => {
    const move = (ev: PointerEvent) => moveRef.current(ev);
    const up = (ev: PointerEvent) => upRef.current(ev);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  /* "Back to cover" from a later page: jump to the first spread, then close the book. */
  useEffect(() => {
    if (!wantClose || turningRef.current) return;

    if (currentSpread === 0 && currentMobilePage === 0) {
      setWantClose(false);
      startTurnRef.current("prev");
    }
  }, [wantClose, currentSpread, currentMobilePage]);

  /* Same state updates as the original, applied when the turn lands. */
  const commit = (dir: "next" | "prev") => {
    if (dir === "next") {
      setCurrentSpread((current) =>
        Math.min(current + 1, spreads.length - 1),
      );
      setCurrentMobilePage((current) =>
        Math.min(current + 1, pages.length - 1),
      );
    } else {
      setCurrentSpread((current) => Math.max(current - 1, 0));
      setCurrentMobilePage((current) => Math.max(current - 1, 0));
    }
  };

  /* Returns true when a physical page turn was started. */
  const startTurn = (dir: "next" | "prev", drag = false): boolean => {
    if (turningRef.current) return false;

    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const s = currentSpread;
    const p = currentMobilePage;

    /* The front cover is the first sheet of the book, the back cover is the last one. */
    const coverOpen = !opened && dir === "next";
    const coverClose =
      opened && !ended && dir === "prev" && (desktop ? s === 0 : p === 0);
    const backClose =
      opened &&
      !ended &&
      dir === "next" &&
      (desktop ? s === spreads.length - 1 : p === pages.length - 1);
    const backOpen = ended && dir === "prev";

    if (!opened && dir === "prev") return false;
    if (ended && dir === "next") return false;

    const canMove =
      coverOpen ||
      coverClose ||
      backClose ||
      backOpen ||
      (dir === "next"
        ? desktop
          ? s < spreads.length - 1
          : p < pages.length - 1
        : desktop
          ? s > 0
          : p > 0);

    if (!canMove) return false;

    setHinted(true);

    if (reduced) {
      if (coverOpen) setOpened(true);
      else if (coverClose) setOpened(false);
      else if (backClose) setEnded(true);
      else if (backOpen) setEnded(false);
      else commit(dir);
      return false;
    }

    let next: TurnState;

    if (backClose || backOpen) {
      const kind = backClose ? "end" : "unend";
      const last = spreads.length - 1;
      const lastPage = pages.length - 1;
      const backFace: TurnFace = {
        page: spreads[last].right,
        pageNumber: 0,
        cover: "back",
      };

      if (desktop) {
        const box = bookRef.current;
        if (!box) return false;
        const pw = (box.clientWidth - 2) / 2;
        const ph = box.clientHeight;

        next = {
          dir,
          mode: "spread",
          cover: kind,
          n: SPREAD_SLICES,
          pw,
          ph,
          baseLeft: { page: spreads[last].left, pageNumber: last * 2 + 1 },
          front: { page: spreads[last].right, pageNumber: last * 2 + 2 },
          back: backFace,
        };
      } else {
        const box = mobileRef.current;
        if (!box) return false;
        const pw = box.clientWidth;
        const ph = box.clientHeight;

        next = {
          dir,
          mode: "page",
          cover: kind,
          n: PAGE_SLICES,
          pw,
          ph,
          front: { page: pages[lastPage], pageNumber: lastPage + 1 },
          base: backFace,
        };
      }
    } else if (coverOpen || coverClose) {
      const cover: TurnFace = {
        page: spreads[0].left,
        pageNumber: 0,
        cover: "front",
      };
      const coverMode = coverOpen ? "open" : "close";

      if (desktop) {
        const box = bookRef.current;
        if (!box) return false;
        const pw = (box.clientWidth - 2) / 2;
        const ph = box.clientHeight;

        next = {
          dir,
          mode: "spread",
          cover: coverMode,
          n: SPREAD_SLICES,
          pw,
          ph,
          baseRight: { page: spreads[0].right, pageNumber: 2 },
          front: cover,
          back: { page: spreads[0].left, pageNumber: 1 },
        };
      } else {
        const box = mobileRef.current;
        if (!box) return false;
        const pw = box.clientWidth;
        const ph = box.clientHeight;

        next = {
          dir,
          mode: "page",
          cover: coverMode,
          n: PAGE_SLICES,
          pw,
          ph,
          front: cover,
          base: { page: pages[0], pageNumber: 1 },
        };
      }
    } else if (desktop) {
      const box = bookRef.current;
      if (!box) return false;
      const pw = (box.clientWidth - 2) / 2;
      const ph = box.clientHeight;

      if (dir === "next") {
        const cur = spreads[s];
        const nxt = spreads[s + 1];
        next = {
          dir,
          mode: "spread",
          n: SPREAD_SLICES,
          pw,
          ph,
          baseLeft: { page: cur.left, pageNumber: s * 2 + 1 },
          baseRight: { page: nxt.right, pageNumber: (s + 1) * 2 + 2 },
          front: { page: cur.right, pageNumber: s * 2 + 2 },
          back: { page: nxt.left, pageNumber: (s + 1) * 2 + 1 },
        };
      } else {
        const cur = spreads[s];
        const prv = spreads[s - 1];
        next = {
          dir,
          mode: "spread",
          n: SPREAD_SLICES,
          pw,
          ph,
          baseLeft: { page: prv.left, pageNumber: (s - 1) * 2 + 1 },
          baseRight: { page: cur.right, pageNumber: s * 2 + 2 },
          front: { page: prv.right, pageNumber: (s - 1) * 2 + 2 },
          back: { page: cur.left, pageNumber: s * 2 + 1 },
        };
      }
    } else {
      const box = mobileRef.current;
      if (!box) return false;
      const pw = box.clientWidth;
      const ph = box.clientHeight;

      next =
        dir === "next"
          ? {
              dir,
              mode: "page",
              n: PAGE_SLICES,
              pw,
              ph,
              front: { page: pages[p], pageNumber: p + 1 },
              base: { page: pages[p + 1], pageNumber: p + 2 },
            }
          : {
              dir,
              mode: "page",
              n: PAGE_SLICES,
              pw,
              ph,
              front: { page: pages[p - 1], pageNumber: p },
              base: { page: pages[p], pageNumber: p + 1 },
            };
    }

    ctlRef.current = {
      mode: drag ? "drag" : "tween",
      k: 0,
      kTarget: 0,
      v: 0,
      vis: 0,
      target: 1,
      t0: 0,
    };

    turningRef.current = true;
    setIsTurning(true);
    setTurn(next);
    return true;
  };

  /* Drives the paper: bends every strip each frame (DOM writes only, no React renders). */
  useIsoLayoutEffect(() => {
    if (!turn) return;

    const { n, pw, mode } = turn;
    const spread = mode === "spread";
    const isCover = !!turn.cover;
    const sw = pw / n;
    const maxAngle = spread ? 180 : 140;
    const bendMax =
      (spread ? SPREAD_BEND : PAGE_BEND) * (isCover ? COVER_STIFFNESS : 1);
    const liftMax = PAGE_LIFT * (isCover ? COVER_LIFT : 1);
    const forward = turn.dir === "next";
    const angles: number[] = new Array(n).fill(0);
    const boxW = bookRef.current?.clientWidth ?? 0;

    const D2R = Math.PI / 180;
    const mag: number[] = new Array(n).fill(0); // absolute turn angle of each strip, degrees

    /* Light from the upper right. Returns [darkAlpha, sheenAlpha] for a surface at `deg`. */
    const lightFront = (deg: number): [number, number] => {
      const r = deg * D2R;
      const ratio = Math.max(
        0,
        (-0.45 * Math.sin(r) + 0.66 * Math.cos(r)) / 0.66,
      );
      const lit = 0.52 + 0.48 * ratio;
      const sheen =
        0.2 * Math.exp(-Math.pow((deg - 28) / 18, 2)) * Math.min(1, deg / 12);
      return [Math.max(0, 1 - lit), sheen];
    };

    const lightBack = (deg: number): [number, number] => {
      const r = deg * D2R;
      const ratio = Math.max(
        0,
        (0.45 * Math.sin(r) - 0.66 * Math.cos(r)) / 0.66,
      );
      const lit = 0.52 + 0.48 * ratio;
      const settle = Math.max(0, Math.min(1, (180 - deg) / 12));
      const sheen =
        (Math.max(0, lit - 1) * 0.8 +
          0.18 * Math.exp(-Math.pow((deg - 152) / 16, 2))) *
        settle;
      return [Math.max(0, 1 - lit), sheen];
    };

    const grad = (dl: number, dr: number, wl: number, wr: number) =>
      `linear-gradient(to right, rgba(20,12,4,${dl.toFixed(3)}), rgba(20,12,4,${dr.toFixed(3)})), linear-gradient(to right, rgba(255,247,230,${wl.toFixed(3)}), rgba(255,247,230,${wr.toFixed(3)}))`;

    const paint = (e: number, speed: number) => {
      // e: 0 = page resting on the right, 1 = page fully turned
      const amp = Math.sin(Math.PI * e);
      const ce = Math.cos(Math.PI * e);
      const hinge = maxAngle * e; // degrees the spine edge has turned
      const lift = liftMax * amp;
      // Air drag: the free edge trails more while the leaf peels up, then catches up and floats down.
      const drag = 1 + 0.3 * ce;
      // Fast movement makes the paper ripple a little, like a real sheet moving through air.
      // A stiff cover does not ripple.
      const flutter = isCover ? 0 : Math.min(1, Math.abs(speed) / 2.5);

      // 1) Shape of the sheet
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n; // 0 at the spine, 1 at the free edge

        // The free end rolls back a little more than the middle, like a real curl.
        const tip = Math.max(0, (u - 0.55) / 0.45);

        // Trailing curl + a slight arch rising out of the gutter. Flat at both ends.
        const lag =
          amp *
            drag *
            (0.7 * u - 0.18 * Math.sin(u * Math.PI * 1.4) + 0.2 * tip * tip) -
          0.2 * amp * ce * Math.pow(1 - u, 3);

        const ripple =
          3.4 * flutter * amp * u * Math.sin(u * Math.PI * 2.6 + e * 10);

        // Never dip beneath the pages below, never overshoot the landing.
        mag[i] = Math.min(
          maxAngle + 6,
          Math.max(0.15, hinge - bendMax * lag + ripple),
        );
        angles[i] = -mag[i];
      }

      // 2) Place + light every strip
      let reach = 0; // how far the free edge reaches from the spine, in px

      for (let i = 0; i < n; i++) {
        const a = mag[i];

        const el = sliceEls.current[i];
        if (el) {
          el.style.transform =
            i === 0
              ? `translate3d(0,0,${lift}px) rotateY(${angles[i]}deg)`
              : `rotateY(${angles[i] - angles[i - 1]}deg)`;
        }

        reach += sw * Math.cos(a * D2R);

        // Light is evaluated at the joints between strips and blended across each strip,
        // so the sheet reads as one smoothly curved surface instead of flat stripes.
        const vl = i === 0 ? a : (mag[i - 1] + a) / 2;
        const vr = i === n - 1 ? a : (a + mag[i + 1]) / 2;

        if (a < 90) {
          const f = frontEls.current[i];
          if (f) {
            const l = lightFront(vl);
            const r = lightFront(vr);
            f.style.background = grad(l[0], r[0], l[1], r[1]);
          }
        } else {
          const b = backEls.current[i];
          if (b) {
            const l = lightBack(vl);
            const r = lightBack(vr);
            b.style.background = grad(l[0], r[0], l[1], r[1]);
          }
        }
      }

      // shadow cast on the pages beneath, following the sheet's real footprint.
      // Scaled with transform (compositor only) instead of animating width (layout).
      const cr = castRightRef.current;
      const cl = castLeftRef.current;

      if (spread) {
        if (cr) {
          cr.style.transform = `scaleX(${Math.min(1, Math.max(reach, 0) / pw + 0.07)})`;
          cr.style.opacity = String(
            e < 0.62 ? 0.6 * Math.sin((Math.PI * e) / 0.62) : 0,
          );
        }
        if (cl) {
          cl.style.transform = `scaleX(${Math.min(1, Math.max(-reach, 0) / pw + 0.07)})`;
          cl.style.opacity = String(
            e > 0.38 ? 0.6 * Math.sin((Math.PI * (e - 0.38)) / 0.62) : 0,
          );
        }
      } else if (cr) {
        cr.style.transform = `scaleX(${Math.min(1, Math.max(reach, 0) / pw + 0.06)})`;
        cr.style.opacity = String(
          0.55 * Math.sin(Math.PI * Math.min(e / 0.85, 1)),
        );
      }

      // 3) Cover turns (desktop): a closed book sits centred on its cover, so slide the whole
      //    book into place as the cover swings, and fade the leather frame in/out smoothly
      //    over the second half of the swing (starts once the cover has passed upright,
      //    so it never shows up as a second "cover" behind the turning sheet).
      if (isCover && spread) {
        const front = turn.cover === "open" || turn.cover === "close";
        const openness = front ? e : 1 - e; // 0 = closed, 1 = fully open
        const dx = (boxW / 4) * (1 - openness) * (front ? -1 : 1);
        const shift = `translateX(${dx}px)`;

        const b = bookRef.current;
        if (b) b.style.transform = shift;

        // The frame must travel with the book, otherwise the spine and the frame drift apart.
        const fr = frameRef.current;
        if (fr) {
          fr.style.transform = shift;
          fr.style.opacity = String(
            easeInOut(clamp01((openness - 0.55) / 0.45)),
          );
        }
      }
    };

    const ctl = ctlRef.current;
    const duration = (spread ? SPREAD_MS : PAGE_MS) * (isCover ? COVER_SLOWDOWN : 1);

    // first frame matches the resting page, so nothing jumps
    paint(forward ? ctl.k : 1 - ctl.k, 0);

    let raf = 0;
    let last = 0;
    let lastK = ctl.k;
    let cancelled = false;

    const finish = (landed: boolean) => {
      if (landed) {
        if (turn.cover === "open") setOpened(true);
        else if (turn.cover === "close") setOpened(false);
        else if (turn.cover === "end") setEnded(true);
        else if (turn.cover === "unend") setEnded(false);
        else commit(turn.dir);
      }
      setTurn(null);
      setIsTurning(false);
      turningRef.current = false;
    };

    const tick = (now: number) => {
      if (cancelled) return;

      const dt = last
        ? Math.min(0.05, Math.max(0.001, (now - last) / 1000))
        : 1 / 60;
      last = now;

      let done = false;
      let landed = false;

      if (ctl.mode === "tween") {
        if (!ctl.t0) ctl.t0 = now;
        const t = Math.min(1, (now - ctl.t0) / duration);
        ctl.k = easeInOut(t);
        if (t >= 1) {
          done = true;
          landed = true;
        }
      } else if (ctl.mode === "drag") {
        // The paper chases the cursor with a little inertia instead of snapping to it.
        ctl.k += (ctl.kTarget - ctl.k) * (1 - Math.exp(-dt * DRAG_FOLLOW));
      } else {
        // Released: a near-critically damped spring carries the page home or over.
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
        const h = dt / steps;

        for (let s = 0; s < steps; s++) {
          const acc = -SPRING_K * (ctl.k - ctl.target) - SPRING_C * ctl.v;
          ctl.v += acc * h;
          ctl.k += ctl.v * h;
        }

        if (ctl.k < 0) {
          ctl.k = 0;
          ctl.v = 0;
        } else if (ctl.k > 1) {
          ctl.k = 1;
          ctl.v = 0;
        }

        if (
          Math.abs(ctl.k - ctl.target) < 0.0015 &&
          Math.abs(ctl.v) < 0.04
        ) {
          ctl.k = ctl.target;
          done = true;
          landed = ctl.target === 1;
        }
      }

      ctl.vis = ctl.vis * 0.7 + ((ctl.k - lastK) / dt) * 0.3;
      lastK = ctl.k;

      paint(forward ? ctl.k : 1 - ctl.k, ctl.vis);

      if (done) {
        finish(landed);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  /* ---------------------------------------------------------------- */
  /* Pointer interaction: drag a page, flick it, or just click a side  */
  /* ---------------------------------------------------------------- */

  const handlePointerDown = (ev: ReactPointerEvent<HTMLDivElement>) => {
    if (turningRef.current || dragRef.current) return;
    if (ev.pointerType === "mouse" && ev.button !== 0) return;

    const el = ev.currentTarget;
    const rect = el.getBoundingClientRect();
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const spineX = rect.left + rect.width / 2;

    dragRef.current = {
      id: ev.pointerId,
      x0: ev.clientX,
      y0: ev.clientY,
      desktop,
      side: ev.clientX >= spineX ? "right" : "left",
      spineX,
      pw: desktop ? (rect.width - 2) / 2 : rect.width,
      dir: "next",
      moved: false,
      started: false,
      dead: false,
      el,
    };
  };

  startTurnRef.current = startTurn;

  moveRef.current = (ev: PointerEvent) => {
    const d = dragRef.current;
    if (!d || ev.pointerId !== d.id || d.dead) return;

    const dx = ev.clientX - d.x0;
    const dy = ev.clientY - d.y0;

    if (!d.started) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
        return;
      }

      d.moved = true;

      // Only the natural direction starts a turn: right page leftwards, left page rightwards.
      const dir: "next" | "prev" | null = d.desktop
        ? d.side === "right"
          ? dx < 0
            ? "next"
            : null
          : dx > 0
            ? "prev"
            : null
        : dx < 0
          ? "next"
          : "prev";

      if (!dir) return;
      if (Math.abs(dx) < DRAG_THRESHOLD) return;

      d.dir = dir;

      if (!startTurnRef.current(dir, true)) {
        d.dead = true;
        return;
      }

      d.started = true;
      d.el.style.cursor = "grabbing";
      ctlRef.current.kTarget = dragProgress(d, ev.clientX);
      return;
    }

    ctlRef.current.kTarget = dragProgress(d, ev.clientX);
  };

  upRef.current = (ev: PointerEvent) => {
    const d = dragRef.current;
    if (!d || ev.pointerId !== d.id) return;

    dragRef.current = null;
    d.el.style.cursor = "";

    if (d.started) {
      const c = ctlRef.current;

      if (ev.type === "pointercancel") {
        c.target = 0;
      } else {
        // Momentum decides: a quick flick carries the page over even from a short drag.
        const projected = c.k + c.vis * FLING_LOOKAHEAD;
        c.target = projected > 0.5 ? 1 : 0;
      }

      c.v = c.vis;
      c.mode = "spring";
      return;
    }

    // A simple click turns the page on that side
    if (!d.moved && !d.dead && ev.type === "pointerup") {
      const rect = d.el.getBoundingClientRect();

      if (d.desktop) {
        startTurnRef.current(d.side === "right" ? "next" : "prev");
      } else {
        const rx = (ev.clientX - rect.left) / rect.width;
        startTurnRef.current(rx < 0.3 ? "prev" : "next");
      }
    }
  };

  const preventNativeDrag = (ev: ReactDragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  };

  const grabStyle: CSSProperties = {
    cursor: "grab",
    touchAction: "pan-y",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  const goToNext = () => startTurn("next");
  const goToPrevious = () => startTurn("prev");

  /* Header icon: close the book and show the cover again. */
  const backToCover = () => {
    if (!opened || turningRef.current) return;

    if (!ended && currentSpread === 0 && currentMobilePage === 0) {
      startTurn("prev");
      return;
    }

    setEnded(false);
    setCurrentSpread(0);
    setCurrentMobilePage(0);
    setWantClose(true);
  };

  nextRef.current = goToNext;
  prevRef.current = goToPrevious;

  if (images.length === 0 || spreads.length === 0) return null;

  const activeSpread = spreads[currentSpread];
  const activePage = pages[currentMobilePage];

  const spreadTurn = turn && turn.mode === "spread" ? turn : null;
  const pageTurn = turn && turn.mode === "page" ? turn : null;

  const leftFace: TurnFace = spreadTurn?.baseLeft ?? {
    page: activeSpread.left,
    pageNumber: currentSpread * 2 + 1,
  };
  const rightFace: TurnFace = spreadTurn?.baseRight ?? {
    page: activeSpread.right,
    pageNumber: currentSpread * 2 + 2,
  };

  const frontTurn = turn?.cover === "open" || turn?.cover === "close";
  const endTurn = turn?.cover === "end" || turn?.cover === "unend";
  const closedIdle = !opened && !turn; // closed, showing the front cover
  const closedBack = ended && !turn; // closed, showing the back cover
  /* Closed from the front: only the right half exists. Closed from the back: only the left. */
  const leftHidden = !opened || frontTurn;
  const rightHidden = endTurn || closedBack;
  const bare = !opened || ended || !!turn?.cover;
  const bookShift = ended
    ? "translateX(25%)"
    : opened
      ? undefined
      : "translateX(-25%)";

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#171613] text-white">
      {/* Header */}
      <header className="relative z-10 flex h-[64px] shrink-0 items-center justify-between border-b border-white/10 px-4 sm:h-[72px] sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={backToCover}
            aria-label="Back to cover"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c8b89e]/40 text-[#d6c6aa]"
          >
            <BookOpen size={17} />
          </button>

          <div className="min-w-0">
            <p className="truncate font-serif text-sm tracking-wide text-[#f1e8d9] sm:text-base">
              Your Wedding Album
            </p>
            <p className="text-[9px] tracking-[0.2em] text-white/40 sm:text-[10px]">
              A COLLECTION OF YOUR SELECTED MOMENTS
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Close album preview"
        >
          <X size={19} />
        </button>
      </header>

      {/* Album area */}
      <main
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-5 sm:px-8 sm:py-7"
        style={{ backgroundImage: STAGE_GLOW }}
      >
        {/* Desktop and tablet: two-page spread */}
        <div className="hidden h-full max-h-[680px] w-full max-w-[1100px] items-center justify-center px-6 py-7 md:flex">
          <div className="relative aspect-[1.5/1] max-h-full w-full">
          {/* Leather frame + ribbon: hidden while the book is closed, fades in as the cover opens */}
          <div
            ref={frameRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: opened && !ended ? 1 : 0,
              transform: bookShift,
            }}
          >
            <AlbumCover variant="spread" />

            {/* Bookmark ribbon hanging out of the gutter */}
            <div
              className="pointer-events-none absolute left-1/2 top-full z-0 -ml-[5px] h-9 w-[10px]"
              style={{
                marginTop: "-10px",
                background:
                  "linear-gradient(to right, #6e0f20, #b32642 50%, #6e0f20)",
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)",
              }}
            />
          </div>

          <div
            ref={bookRef}
            onPointerDown={handlePointerDown}
            onDragStart={preventNativeDrag}
            className="absolute inset-0 z-[1] flex rounded-[3px] bg-[#f5f0e7]"
            style={{
              perspective: `${turn?.cover ? PERSPECTIVE_COVER : PERSPECTIVE_PAPER}px`,
              boxShadow: bare ? "none" : BOOK_SHADOW,
              background: bare ? "transparent" : undefined,
              transform: bookShift,
              transition: "box-shadow 500ms ease",
              ...grabStyle,
            }}
          >
            <div
              className={`relative min-w-0 flex-1 overflow-hidden rounded-l-[3px] transition-shadow duration-500 ${
                leftHidden ? "invisible" : ""
              }`}
              style={closedBack ? { boxShadow: COVER_SHADOW } : undefined}
            >
              {closedBack ? (
                <StudioCoverFace
                  name={studio.name}
                  logoUrl={studio.logoUrl}
                  variant="back"
                />
              ) : (
                <>
                  <AlbumPageContent
                    page={leftFace.page}
                    pageNumber={leftFace.pageNumber}
                  />
                  <PageFinish side="left" />
                </>
              )}
            </div>

            {/* Binding crease */}
            <div
              className={`relative z-10 w-[2px] shrink-0 ${
                leftHidden || rightHidden ? "invisible" : ""
              }`}
              style={{
                background:
                  "linear-gradient(to right, #b3a590, #e6dccb 50%, #b3a590)",
                boxShadow: "0 0 14px rgba(0,0,0,0.3)",
              }}
            />

            <div
              className={`relative min-w-0 flex-1 overflow-hidden rounded-r-[3px] transition-shadow duration-500 ${
                rightHidden ? "invisible" : ""
              }`}
              style={closedIdle ? { boxShadow: COVER_SHADOW } : undefined}
            >
              {closedIdle ? (
                <StudioCoverFace name={studio.name} logoUrl={studio.logoUrl} />
              ) : (
                <>
                  <AlbumPageContent
                    page={rightFace.page}
                    pageNumber={rightFace.pageNumber}
                  />
                  <PageFinish side="right" />
                </>
              )}
            </div>

            {spreadTurn && (
              <>
                {/* Shadow the lifted paper casts on the pages beneath it */}
                <div
                  ref={castLeftRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 z-[15] opacity-0"
                  style={{
                    right: "50%",
                    width: spreadTurn.pw,
                    transform: "scaleX(0)",
                    transformOrigin: "right center",
                    willChange: "transform, opacity",
                    background:
                      "linear-gradient(to left, rgba(20,12,4,0.65) 0%, rgba(20,12,4,0.28) 45%, rgba(20,12,4,0) 100%)",
                  }}
                />
                <div
                  ref={castRightRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 z-[15] opacity-0"
                  style={{
                    left: "50%",
                    width: spreadTurn.pw,
                    transform: "scaleX(0)",
                    transformOrigin: "left center",
                    willChange: "transform, opacity",
                    background:
                      "linear-gradient(to right, rgba(20,12,4,0.65) 0%, rgba(20,12,4,0.28) 45%, rgba(20,12,4,0) 100%)",
                  }}
                />

                {/* The turning sheet, hinged on the spine */}
                <div
                  className="absolute inset-y-0 z-20"
                  style={{
                    left: "50%",
                    width: spreadTurn.pw,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <BendSlice
                    index={0}
                    count={spreadTurn.n}
                    sw={spreadTurn.pw / spreadTurn.n}
                    pw={spreadTurn.pw}
                    ph={spreadTurn.ph}
                    front={spreadTurn.front}
                    back={spreadTurn.back ?? null}
                    frontSide="right"
                    backSide="left"
                    studio={studio}
                    reg={reg}
                  />
                </div>
              </>
            )}
          </div>
          </div>
        </div>

        {/* Mobile: individual pages */}
        <div className="relative h-full max-h-[680px] w-full max-w-[440px] px-3 py-4 md:hidden">
          <div className="relative h-full w-full">
          <AlbumCover variant="single" />
        <div
          ref={mobileRef}
          onPointerDown={handlePointerDown}
          onDragStart={preventNativeDrag}
          className="relative z-[1] flex h-full w-full flex-col rounded-[3px] bg-[#f5f0e7]"
          style={{ boxShadow: PAGE_SHADOW, ...grabStyle }}
        >
          {pageTurn && pageTurn.base ? (
            <>
              <div className="relative h-full w-full overflow-hidden">
                <FaceContent
                  face={pageTurn.base}
                  side="right"
                  studio={studio}
                />
                <div
                  ref={castRightRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 z-[15] opacity-0"
                  style={{
                    width: pageTurn.pw,
                    transform: "scaleX(0)",
                    transformOrigin: "left center",
                    willChange: "transform, opacity",
                    background:
                      "linear-gradient(to right, rgba(20,12,4,0.65) 0%, rgba(20,12,4,0.28) 45%, rgba(20,12,4,0) 100%)",
                  }}
                />
              </div>

              {/* The sheet swings off the left edge and is clipped to the page */}
              <div
                className="absolute inset-0 z-20 overflow-hidden"
                style={{
                  perspective: `${pageTurn.cover ? PERSPECTIVE_COVER_MOBILE : PERSPECTIVE_PAPER_MOBILE}px`,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <BendSlice
                    index={0}
                    count={pageTurn.n}
                    sw={pageTurn.pw / pageTurn.n}
                    pw={pageTurn.pw}
                    ph={pageTurn.ph}
                    front={pageTurn.front}
                    back={null}
                    frontSide="right"
                    backSide="left"
                    studio={studio}
                    reg={reg}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="relative h-full w-full overflow-hidden">
              {!opened ? (
                <StudioCoverFace name={studio.name} logoUrl={studio.logoUrl} />
              ) : ended ? (
                <StudioCoverFace
                  name={studio.name}
                  logoUrl={studio.logoUrl}
                  variant="back"
                />
              ) : (
                <>
                  <AlbumPageContent
                    page={activePage}
                    pageNumber={currentMobilePage + 1}
                  />
                  <PageFinish side="right" />
                </>
              )}
            </div>
          )}
        </div>
          </div>
        </div>

        {/* First-visit hint, fades once the album has been turned */}
        <p
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-[0.18em] text-white/35 transition-opacity duration-700 ${
            hinted ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="md:hidden">SWIPE OR TAP TO TURN</span>
          <span className="hidden md:inline">
            DRAG A PAGE, OR CLICK ITS SIDE, TO TURN
          </span>
        </p>

        {/* Desktop navigation */}
        <button
          type="button"
          onClick={goToPrevious}
          disabled={!opened || isTurning}
          className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20 md:flex lg:left-6"
          aria-label="Previous spread"
        >
          <ChevronLeft size={23} />
        </button>

        <button
          type="button"
          onClick={goToNext}
          disabled={ended || isTurning}
          className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20 md:flex lg:right-6"
          aria-label="Next spread"
        >
          <ChevronRight size={23} />
        </button>
      </main>

      {/* Footer navigation */}
      <footer className="flex h-[76px] shrink-0 items-center justify-between border-t border-white/10 px-4 sm:h-[84px] sm:px-8">
        <div className="min-w-[75px]">
          <p className="text-[10px] tracking-[0.18em] text-white/40">
            PHOTOS
          </p>
          <p className="mt-1 text-sm tabular-nums text-[#e6d7c2]">
            {images.length}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={!opened || isTurning}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 disabled:opacity-25 md:hidden"
            aria-label="Previous page"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="min-w-[95px] text-center">
            <p className="text-[10px] tracking-[0.15em] text-white/45">
              <span className="md:hidden">
                {ended
                  ? "BACK COVER"
                  : opened
                    ? `PAGE ${currentMobilePage + 1} / ${pages.length}`
                    : "COVER"}
              </span>
              <span className="hidden md:inline">
                {ended
                  ? "BACK COVER"
                  : opened
                    ? `SPREAD ${currentSpread + 1} / ${spreads.length}`
                    : "COVER"}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={ended || isTurning}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 disabled:opacity-25 md:hidden"
            aria-label="Next page"
          >
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="min-w-[75px] text-right">
          <p className="text-[10px] tracking-[0.18em] text-white/40">
            PREVIEW
          </p>
          <p className="mt-1 text-xs text-[#e6d7c2]">
            Digital album
          </p>
        </div>
      </footer>
    </div>
  );
}