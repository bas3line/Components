"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { nearestTo, noWhere, readWhere, subscribe, type GuessRules } from "./guess";
import { MapPanel, type MapPin } from "./MapPanel";
import { Leds, Screw, Strip, Vents } from "./parts";
import { SAMPLE_INSET, SAMPLE_PINS } from "./sample";
import type { Bounds, DotMapInset, DotMapPin } from "./types";
import { WORLD } from "./worldmask";

export type { Bounds, DotMapInset, DotMapPin, LatLon, Side } from "./types";

const EXTENT = `${Math.abs(WORLD.west)}°W–${WORLD.east}°E · ${Math.abs(WORLD.south)}°S–${WORLD.north}°N`;

const coords = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? "E" : "W"}`;
const inside = (p: { lat: number; lon: number }, b: Bounds) =>
  p.lon >= b.west && p.lon <= b.east && p.lat >= b.south && p.lat <= b.north;
const sameBounds = (a: Bounds, b: Bounds) =>
  a.west === b.west && a.east === b.east && a.north === b.north && a.south === b.south;

export type DotMapProps = {
  /** The pins. Only those on the world crop (130°W–150°E, 72°N–10°S) are drawn. */
  pins?: DotMapPin[];
  /** An enlarged window for a crowded area; null for none. The sample's inset comes with the sample pins only. */
  inset?: DotMapInset | null;
  /** Guess the reader's nearest pin from the time zone, in the browser. On by default. */
  guess?: boolean;
  /** Zones ("Asia/Dubai") or whole tz areas ("Africa") sent to a pin by id, whatever the distance. */
  rules?: GuessRules;
  /** Guess for this IANA zone instead of the reader's. */
  timeZone?: string;
  /** The pin in focus before a guess or a pick; the first pin by default. */
  initial?: string;
  /** Names the faceplate. */
  title?: string;
  /** Told when a pin is picked, on the map or in the list. */
  onPick?: (id: string) => void;
  className?: string;
};

/**
 * A world map drawn as a dot lattice, with pins and labelled chips, an inset
 * that enlarges a crowded area, and a guess at the reader's nearest pin from
 * the time zone, all in a faceplate of slate strips and screws.
 *
 * Hover or click a marker to pick it. The row of pins under the map is the
 * keyboard and screen-reader control: focus one to bring it into focus on the
 * map, press it to pin it there.
 */
export function DotMap({
  pins = SAMPLE_PINS,
  inset: insetProp,
  guess = true,
  rules,
  timeZone,
  initial,
  title = "Coverage",
  onPick,
  className,
}: DotMapProps) {
  const inset = insetProp !== undefined ? insetProp : pins === SAMPLE_PINS ? SAMPLE_INSET : null;
  const mapPins = useMemo<MapPin[]>(
    () => pins.filter((p) => inside(p, WORLD)).map((p) => ({ ...p, inset: !!inset && inside(p, inset.bounds) })),
    [pins, inset],
  );

  // Null in the server render and while hydrating, then the browser's own guess.
  const where = useSyncExternalStore(subscribe, () => readWhere(timeZone), noWhere);
  const guessed = guess ? where : null;
  const nearest = guessed ? nearestTo(mapPins, guessed, rules) : null;

  // A pin picked by hand wins over the guess; until then the map follows the guess.
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // The window the inset settled on, so the world map can bracket it.
  const [frame, setFrame] = useState<Bounds | null>(null);
  const onFrame = useCallback((f: Bounds) => setFrame((prev) => (prev && sameBounds(prev, f) ? prev : f)), []);

  const known = (id: string | null | undefined) => (id && mapPins.some((p) => p.id === id) ? id : null);
  const active = known(hovered) ?? known(pinned) ?? nearest ?? known(initial) ?? mapPins[0]?.id ?? null;
  const activePin = mapPins.find((p) => p.id === active) ?? null;
  const nearestPin = mapPins.find((p) => p.id === nearest) ?? null;
  const name = (p: DotMapPin) => p.code ?? p.label;

  const pin = (id: string) => {
    setPinned(id);
    setHovered(null);
    onPick?.(id);
  };
  // Shared handlers so a list item and its marker behave as one control.
  const bind = (id: string) => ({
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered((h) => (h === id ? null : h)),
    onFocus: () => setHovered(id),
    onBlur: () => setHovered((h) => (h === id ? null : h)),
    onClick: () => {
      setPinned(id);
      onPick?.(id);
    },
  });
  const map = { pins: mapPins, inset, active, nearest, you: guessed?.at ?? null, onHover: setHovered, onPick: pin };

  const described =
    `Map of ${mapPins.length} pins: ${mapPins.map((p) => p.label).join(", ")}.` +
    (nearestPin ? ` Nearest to you, guessed from your time zone: ${nearestPin.label}.` : "");

  return (
    <div className={cn("@container relative border border-night-line bg-night text-white", className)}>
      <Screw className="top-[18px] left-2.5" turn={20} />
      <Screw className="top-[18px] right-2.5" turn={75} />
      <Screw className="bottom-[18px] left-2.5" turn={130} />
      <Screw className="right-2.5 bottom-[18px]" turn={45} />

      <Strip>
        <span className="flex items-center gap-4">
          <span className="text-mint-pale">U1</span>
          <span>{title}</span>
        </span>
        <Vents />
        <span className="flex items-center gap-4">
          <span className="hidden @xl:inline">{EXTENT}</span>
          <Leds count={mapPins.length} />
        </span>
      </Strip>

      {/* World and inset side by side when there is room, stacked below that. */}
      <div role="img" aria-label={described} className={cn("grid", inset && "@6xl:grid-cols-[minmax(0,1fr)_26rem]")}>
        <MapPanel kind="world" frame={frame} className="aspect-[280/82]" {...map} />
        {inset ? (
          <div className="h-[208px] border-t border-night-line @xl:h-[280px] @6xl:h-auto @6xl:border-t-0 @6xl:border-l">
            <MapPanel kind="inset" onFrame={onFrame} className="h-full" {...map} />
          </div>
        ) : null}
      </div>

      <ul aria-label="Pins" className="flex flex-wrap gap-2 border-t border-night-line px-5 py-4 @xl:px-8">
        {mapPins.map((p) => {
          const on = p.id === active;
          const near = p.id === nearest;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={p.id === pinned}
                {...bind(p.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 border px-[6px] py-[5px] font-mono text-[12px] leading-none whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
                  near
                    ? "border-lime bg-lime text-ink focus-visible:outline-lime"
                    : on
                      ? "border-mint bg-mint text-ink focus-visible:outline-mint"
                      : "border-night-line bg-night-2 text-white hover:border-peri-soft focus-visible:outline-mint",
                )}
              >
                {p.code ? (
                  <span className={cn("font-medium tracking-[0.08em] uppercase", !near && !on && "text-mint-pale")}>
                    {p.code}
                  </span>
                ) : null}
                <span className={near || on ? "text-ink" : "text-white/80"}>{p.label}</span>
                {p.tag ? (
                  <span className="-my-[3px] bg-pink px-[5px] py-[3px] text-[11px] tracking-[0.08em] text-ink uppercase">
                    {p.tag}
                  </span>
                ) : null}
                {near ? (
                  <span className="-my-[3px] bg-ink px-[5px] py-[3px] text-[11px] tracking-[0.08em] text-lime uppercase">
                    Nearest
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="flex min-h-11 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-night-line bg-night-2 px-5 py-2.5 font-mono text-[12px] leading-snug @xl:px-8">
        <span className="min-w-0 text-white/75">
          {!guess ? (
            "Hover a pin, or pick one from the list"
          ) : where === null ? (
            "Guessing the nearest pin from your clock…"
          ) : nearestPin ? (
            <>
              <span className="font-medium text-lime">you → {name(nearestPin)}</span>, guessed from {where.zone}
            </>
          ) : (
            <>
              <span className="font-medium text-lime">no guess</span>: {where.zone || "no time zone"} says nothing
              about where you are
            </>
          )}
        </span>
        {activePin ? (
          <span className="shrink-0 text-white/75 tabular-nums">
            <span className="font-medium text-mint">{name(activePin)}</span> {coords(activePin.lat, activePin.lon)}
          </span>
        ) : null}
      </p>
    </div>
  );
}
