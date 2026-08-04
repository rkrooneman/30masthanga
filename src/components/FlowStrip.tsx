/**
 * FlowStrip - a compact horizontal strip of a flow's position icons.
 *
 * Shown in the pose-icon slot of the Guided player stage during a live
 * salutation / UHP flow (Surya A, Surya B, UHP), it renders one small
 * silhouette per position in the pose's `flow`, highlighting the CURRENT
 * position (the sage active cell) while the rest stay muted. It is purely
 * presentational: given the ordered flow labels and the active index, it draws
 * the row. It has no timers, no history, and (now) no effects or refs.
 *
 * Fixed-center slide (filmstrip): the ACTIVE cell is ALWAYS horizontally
 * centered in the strip's viewport, and the other cells slide left/right past
 * that fixed center as `activeIndex` changes. A viewport element clips the row
 * (`overflow: hidden`) and an inner track holds every cell at its natural full
 * width. The track's origin is placed at the viewport center (CSS `left: 50%`)
 * and then translated left by the active cell's center offset, so the active
 * cell lands dead-center. Empty gutters are allowed at both ends (the translate
 * is NOT clamped): at index 0 there is blank space to the left of the centered
 * active icon, and at the last index there is blank space to the right. This
 * replaces the old native-scroll model (`overflow-x: auto` + `scrollIntoView`),
 * which fought `justify-content: center` and visibly jumped mid-flow.
 *
 * The centering is pure CSS math driven by two inline custom properties on the
 * track: `--active-index` (the active position number) and the fixed per-cell
 * width `--cell` (which bakes in the horizontal rhythm; cells have no flex gap,
 * so `--cell` is exactly the cell box). The active cell's center sits at
 * `activeIndex * cell + cell / 2` from the track's left, and translating by the
 * negative of that (from the center origin) centers it. No JS measurement, no
 * ResizeObserver, no refs. The slide animates via a 300ms transform transition
 * on the track; under `prefers-reduced-motion: reduce` it snaps instantly (see
 * index.css).
 *
 * Icon lookup goes through {@link flowIconFor} (label-keyed, not catalog-id
 * keyed), matching how the flow positions are stored (`flow[].label` strings).
 * If a label has no icon (should not happen for in-scope poses), a small neutral
 * dot is rendered instead so the position count stays correct.
 *
 * The icons draw with `currentColor`, so active vs inactive colour is set purely
 * via CSS on the surrounding cell. The icons themselves are decorative here (the
 * large pose name + "Pose N of M" already announce state), so each SVG is
 * `aria-hidden`; the strip container carries the accessible label
 * ("Pose sequence progress") and the active cell is marked with
 * `aria-current="step"`. The label is deliberately generic ("Pose sequence",
 * not "Salutation"): the strip serves Surya A, Surya B AND UHP (Utthita Hasta
 * Padangusthasana), and UHP is not a salutation, so a salutation-specific label
 * would be inaccurate for it.
 */

import type { CSSProperties } from 'react';
import { flowIconFor } from './poses/flowIcons';

interface FlowStripProps {
  /** The ordered flow positions (pass `currentStep.pose.flow`). */
  flow: readonly { label: string }[];
  /** 0-based index of the active position (pass `currentStep.flowIndex`). */
  activeIndex: number;
  /** Optional extra class for positioning by the caller. */
  className?: string;
}

/**
 * Pixel size of the ACTIVE (centered) strip icon. Matched to the normal single
 * pose icon (`<PoseGraphic size={44}>` / `<FlowMark size={44}>`) so the focal
 * icon does NOT shrink when the stage swaps its single pose icon for the strip:
 * the centered cell is a proper peer of that 44px pose icon.
 */
const ACTIVE_ICON_SIZE = 44;

/**
 * Pixel size of the INACTIVE (context) strip icons - deliberately smaller than
 * the active icon so the neighbours read as quiet context and the centered
 * position gets clear "this is where I am" emphasis. Sits centered in the same
 * fixed cell box as the active icon (see `--cell` in index.css), so all cells
 * keep one constant box width and the fixed-center slide math stays exact.
 */
const INACTIVE_ICON_SIZE = 28;

/**
 * Track style carrying the custom properties the fixed-center CSS math reads:
 * `--active-index` is the (clamped) active position, and the CSS multiplies it
 * by the fixed `--cell` width (defined in index.css) to know how far to slide.
 * Extends CSSProperties so the custom property is accepted by the type checker.
 */
interface FlowTrackStyle extends CSSProperties {
  '--active-index': number;
}

function FlowStrip({ flow, activeIndex, className }: FlowStripProps) {
  const viewportClass = className
    ? `guided-player__flow-strip ${className}`
    : 'guided-player__flow-strip';

  // Guard: with an empty or single-position flow there is nothing to slide, and
  // GuidedScreen already gates the strip on length > 1. Clamp the active index
  // into range so the translate math (and the highlight) stays sane even if a
  // stray out-of-range index arrives - the CSS just centers whichever cell it
  // resolves to, so a bad index can never crash or scroll off into nothing.
  const lastIndex = flow.length > 0 ? flow.length - 1 : 0;
  const safeActiveIndex = Math.min(Math.max(activeIndex, 0), lastIndex);

  // The only dynamic bit: hand the active index to the CSS as a number. The
  // track's origin is the viewport center (CSS `left: 50%`), and it translates
  // left by `activeIndex * --cell + --cell / 2` so the active cell's center
  // lands on the viewport center. Not clamped -> gutters at the ends (option A).
  const trackStyle: FlowTrackStyle = { '--active-index': safeActiveIndex };

  return (
    <div
      className={viewportClass}
      role="group"
      aria-label="Pose sequence progress"
    >
      <div className="guided-player__flow-track" style={trackStyle}>
        {flow.map((position, index) => {
          const isActive = index === safeActiveIndex;
          const Icon = flowIconFor(position.label);
          const cellClass = isActive
            ? 'guided-player__flow-cell guided-player__flow-cell--active'
            : 'guided-player__flow-cell';

          return (
            <span
              // Positions can repeat within a flow, so index is the stable key.
              key={index}
              className={cellClass}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* The icon is decorative here (the pose name + "Pose N of M"
                  already announce state), so it is hidden from assistive tech
                  via this wrapping span; the strip container carries the label.
                  The pose-icon components do not forward arbitrary SVG props, so
                  aria-hidden lives on the wrapper rather than the SVG. */}
              <span className="guided-player__flow-glyph" aria-hidden="true">
                {Icon ? (
                  <Icon size={isActive ? ACTIVE_ICON_SIZE : INACTIVE_ICON_SIZE} />
                ) : (
                  <span className="guided-player__flow-dot" />
                )}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default FlowStrip;
