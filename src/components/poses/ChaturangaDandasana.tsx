/**
 * ChaturangaDandasana - Four-Limbed Staff Pose (Chaturanga Dandasana).
 *
 * A minimalist filled silhouette, traced to clean vector paths from an original
 * Firefly-generated pose illustration and recoloured to the app's sage accent
 * (fill: currentColor, so the icon inherits the container's colour like the
 * other pose icons). Even-odd fill preserves the open negative space between
 * the limbs. Part of the ashtanga30 pose-icon system.
 */

interface PoseIconProps {
  /** Outer width/height of the SVG box, in pixels. Default 120. */
  size?: number;
  /** Optional extra class for positioning/animation by the caller. */
  className?: string;
}

function ChaturangaDandasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Four-Limbed Staff Pose pose"
    >
      {/* Horizontally mirrored within the 512 viewBox so the figure faces
          RIGHT, matching the standing/lunge/updog icons in the set. The mirror
          (translate(512,0) scale(-1,1)) reflects the traced path in place; the
          path data itself is unchanged. */}
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M67 168c-1.7.5-4.5 1.6-6.2 2.5-4.4 2.4-10.6 8.5-12.7 12.5-4.6 8.6-3.9 18.7 1.8 26l2.2 3v6.4c0 4.7.2 6.5.7 6.6l3.4.1c2.5 0 2.7.2 3.1 2 .3 1 1 2 1.5 2s1.1.6 1.5 1.4 1.4 1.6 2.3 1.8c1 .2 2 1 2.4 2 2 5 4.9 4.7 11.5-.8 2.6-2.2 5.3-4 6.1-4.2 1.6-.4 1.4-.5 12.1 1.8 8.8 1.8 10.3 2.3 13 4.7 3.1 2.7 12.6 13.8 17.2 20 7.2 9.7 11 12.1 19 12.2 3.8 0 5.3-.3 7.6-1.4 1.5-.8 2.8-1.6 2.8-1.9s-1.8-1.8-4-3.6c-2.2-1.7-6-4.8-8.4-7-3.4-2.9-6.3-4.6-13.5-8-7.1-3.5-10-5.2-12.5-7.6-3.8-3.6-6.7-9-7.2-13.3-.4-3 .5-8 1.4-8 .2 0 .4 1.7.4 4 0 10 5.7 16.3 20.9 23 6.3 2.9 7.6 3.8 19 13 2 1.7 6 4.6 9 6.4l7.6 5 2.3 1.6-.3 3.4c-.5 5.1-2 20.5-2.8 26.9-.4 3.1-1.5 9.4-2.4 14-3.2 15.4-3 15.2-12.2 15.2-5.2 0-6.7.2-11 1.8-2.7 1-7.2 2.3-10 3-7.8 1.7-13.7 3.6-14 4.5-1 2.4 1.9 3.8 7.7 3.8 2.7 0 3.8.2 4 .9.4 1.1 4.5 1.1 11.9 0 3-.5 9.5-.8 14.4-.8 10 0 13-.7 15.1-3.6 2.8-3.9 14.5-31.8 17.3-41 1.7-6 7.2-29.9 7.2-31.8 0-2.8-3.6-7.3-15.1-18.7-7.6-7.5-13.2-12.5-16.7-14.9-9.8-6.7-15-10.7-16.9-13.3-1-1.5-1.8-2.8-1.7-3 .2 0 1.6.9 3.1 2.3 1.6 1.3 5.8 4.2 9.3 6.3 3.5 2.2 8.5 5.4 11 7.3 5.8 4.3 17.7 15.7 24.1 23 3.1 3.7 5.3 5.7 6.4 6 4.6 1 15.5 1.4 21.4.9 8-.8 11.8-.1 18.6 3 12.7 6 28 10.4 44.3 12.5 2.6.3 11.8.8 20.3 1.1 11.9.4 16.9.9 21.7 1.9 5.6 1.1 7.2 1.2 15.2.8 13.8-.8 16.4-.6 25.6 1.7 4.6 1.2 15.8 3.5 25 5.2 23.3 4.3 35.4 8.1 42.5 13.3 3.4 2.6 4.8 4.6 10 13.8l4.4 7.7c1.8 3 2.2 5.3 1.2 6.9-.3.4-2.1 1.7-4 2.6-3 1.6-3.5 2-3.7 3.7-.1 1.5.2 2.1 1.2 2.8 2 1.3 6.9 1.8 11.6 1.3 3.3-.3 4.2-.7 5.2-2l3.3-3.5c4.1-4.4 5-8.5 3.4-16.1-1.7-8.1-1.8-11.4-.4-19.5 1.6-8.7 1.4-11.9-1-14.7-2.4-2.9-5-3.6-13.9-4-7-.5-9-.8-14.3-2.6-6.7-2.3-18.6-7.7-34.4-15.6-12.3-6.2-14.8-7.2-22.7-9-5.6-1.4-7.7-1.6-20.6-1.8-7.8 0-15.4-.3-17-.5-5.5-.8-12-3-24.6-8.5-7.2-3.1-19.5-7.7-27.2-10.3-7.8-2.6-15-5.2-16.1-5.7s-4.4-3.5-7.4-6.5c-8.4-8.7-14.8-12-24.9-13.4-7-1-13 0-23 3.3-16.3 5.4-19.8 5.1-42.7-4.4-19.5-8.1-26.6-9.9-39.5-9.9-10.2 0-14.1.9-23 4.8-7.2 3.3-9.5 3.3-12.2.3-1.5-1.7-1.7-2.3-1.7-6.5 0-2.5-.3-5.7-.6-7.2-1.8-7.6-7-14.3-14-17.7-4-2-5-2.2-10-2.4-3.7-.1-6.5 0-8.7.7" />
      </g>
    </svg>
  );
}

export default ChaturangaDandasana;
