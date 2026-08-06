/**
 * AdhoMukhaSvanasana - Downward-Facing Dog (Adho Mukha Svanasana).
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

function AdhoMukhaSvanasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Downward-Facing Dog pose"
    >
      {/* Horizontally mirrored within the 512 viewBox so the figure faces
          RIGHT, matching the standing/lunge/updog icons in the set. The mirror
          (translate(512,0) scale(-1,1)) reflects the traced path in place; the
          path data itself is unchanged. */}
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M315.5 118.9c-8.4 1-15.3 3.6-24 9-9.3 6-19 13.8-29.4 24.3-11 11-18.3 19.6-44 51.8-20 24.8-21.6 27.3-23.4 36.3-1.2 5.8-1.3 8-.5 8 .3 0 2.6-2 5-4.4 3.8-4 4.3-4.3 4-2.9-.7 2.6-2.8 6-6.6 10.2-5.9 6.8-8.3 11.2-12.3 22.3-1.2 3.3-2.7 7.1-3.4 8.5-2.7 5.4-16.5 25.2-21.1 30.2-1.5 1.6-5.4 5-8.7 7.4-6.9 5.2-11.6 10-22.2 22.4-16 18.8-27.6 31-31.5 33-2.3 1.2-3.7 1.5-10.8 2-6 .3-9.2.8-12.2 1.7-2.2.7-9.8 2.8-16.8 4.6s-13 3.5-13.4 3.8c-.4.4-.7 1.2-.7 2 0 1.8 2.5 2.8 6.8 2.8 2.8 0 4 .3 5 1.1 1.7 1.4 5 1.4 10.8.2 3-.6 8.5-1 19-1.2l14.7-.3 2.2-1.6 8.3-6.3c3.4-2.6 13.2-9.6 21.8-15.7 27.9-19.5 32.5-23.4 41.4-35 2.7-3.5 8.5-10.6 12.9-15.7 9.5-11 17.8-22 22-29l7.2-12.4c4.8-8.2 9.5-13.4 14.2-16 1.6-.8 3-1.3 3.2-1.2s-1.7 2.6-4.2 5.4c-5.4 6.1-8.3 10.3-13.8 20.2-7 12.7-13.7 21.8-28 38.3-3.5 4-6.4 7.6-6.4 8 0 .6 5.2 2 10.5 2.8 5 .7 10.5 0 15.9-2 6.9-2.6 11.2-6.2 14-11.7 2-3.8 2.6-4.2 9-6.2.7-.2 2.2-.8 3.3-1.4 1.6-.8 2-1.3 2-2.5 0-.8-.5-2-1-2.8-1.5-1.9-1.4-2.5.5-4 1.3-.9 1.6-1.5 1.6-3.1 0-1.3.3-2.1.8-2.3s.9-1.1.9-2.6c0-1.6.3-2.7 1.3-3.8 1.8-2.2 1.8-5 .1-6.7-.7-.6-3.5-2.4-6.2-3.8s-5.3-3-5.6-3.6c-1.5-2.9 1.6-7 6.3-8.3 1.6-.5 6.8-1 12-1.3 10-.6 12.5-1.2 17.6-4.4 5-3.3 8.3-8.6 11.3-18.4 2.4-7.9 3.5-9.8 9.2-16.3 7.2-8 8.6-10.6 11.9-20.3 4.2-13 6.5-16.6 12.6-20.5l2.6-1.7-1-4.1c-1.3-4.7-1.3-4.9-.7-4.9.9 0 3.5 5.1 7.9 15 8.5 19.4 18.8 35 36.3 55 4.6 5.4 7.7 9.4 10.3 14 5.1 8.8 7.5 11.6 15.6 18.5 7.4 6.4 10 9.6 16.1 19.7 4.4 7.3 11.5 18 15 22.5l7.4 10.6c12.3 18.2 16.4 27.1 15 32.5-1 3.6-4.3 6-15 11.5-11 5.6-16.7 7.7-20.9 7.7-3.6 0-5.3 1-5.3 3.5 0 4.5 5.2 5.8 22.5 6 7.8 0 13.5-.3 16.3-.7 2.6-.5 9.5-.8 17.4-.9 12.6 0 13.1-.1 15.7-1.4 3.7-1.9 4.7-3.9 4.4-9.2-.2-4.4-1.1-6.4-7-16.8-3.6-6.6-11.5-27-19.7-51.2-4.8-14-10-25-15-31.7-2-2.6-6.6-8-10.5-12.1-14.8-15.8-16-18-25.4-45.3-5.3-15.6-6.5-18.5-14.6-35.3-7-14.1-8.6-18.5-11.9-30.4-4.3-15.5-8.6-23.1-17.1-30.4-7.9-6.7-20.6-10.3-31.5-9M178.7 261.7c-3 .7-7.4 2.3-10 3.5-7.5 3.7-13.5 10.7-16 18.8-1.3 4-1.6 11.7-.6 16.2.8 3.9 3.4 10 4.2 10 .6 0 10.1-12.8 15.3-20.5 5-7.4 6.8-10.9 9.5-18.5 1.1-3.2 2.6-6.8 3.2-8 1.8-3.5 2.2-3.4-5.6-1.5" />
      </g>
    </svg>
  );
}

export default AdhoMukhaSvanasana;
