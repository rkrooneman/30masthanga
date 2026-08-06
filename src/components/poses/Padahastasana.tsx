/**
 * Padahastasana - Hand Under Foot Pose (Padahastasana).
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

function Padahastasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Hand Under Foot Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M280.5 56.6C265.1 59.8 240.8 75.2 223 93c-36.5 36.6-61.1 103.3-53.7 145.8 2.3 13.3 9 34.5 12.7 40.7 1.4 2.2 4 4.9 6 6 4 2 9.7 13 9.7 18.4 0 1.9-1.4 5.4-3.2 7.9-12 16.3-13.8 20.7-13.8 32.8 0 29.4 39 46.5 62.3 27.3 6-4.9 12.6-18 12.6-24.9 0-3.3 1.2-6.2 4-9.7 4.5-5.6 4.9-8.2 1.7-10.5-1.3-1-2.3-3.6-2.4-6.3-.2-5.3-.2-5.3 10.7 1l6.8 3.8 1 21c2.6 57.3 0 70.6-13.6 70.6-2.3 0-6.5 1-9.2 2.2s-8.4 3.1-12.8 4.4c-12.3 3.5-10.7 10.2 2 7.9 3.3-.6 6.1-.9 6.4-.6 1.2 1.2-27 13.8-30.9 13.8-4 0-8.4 2.7-8.4 5.2 0 3.3 5.2 6.7 12.5 8 15.6 2.9 74.5 1.3 83.1-2.1 5.2-2.1 6.8-8.4 4.6-18l-1.5-6.4 8.7-17.4c14-27.9 18.7-39.5 24.8-61 6.8-23.8 6.9-23.5-4.7-33.5-15-12.8-15.7-13.7-15.7-19.1 0-2.8-1.2-10.4-2.6-16.8-4.1-18.7-2.7-31.5 7.2-64 1.9-6 5.8-24.1 8.7-40 2.9-16 6.4-33.4 7.8-38.9 6.5-26.2 6.1-42-1.4-57.4-10.2-21-36-32.1-61.8-26.7M265 148.9c-1.6 3.4-3.2 10.5-4 18.2-.6 6.8-2.5 17.3-4 23.2l-3 10.7 3.3 13c5.5 20.9 4.5 28.7-6 44.7l-5.6 8.7 3.7 3c3.7 3 20.6 10.2 21.5 9.2.3-.2-.5-3.3-1.7-6.9-3.5-10.1-5.2-105.3-2.2-120.7 2-9.6 1.4-10.4-2.2-3.1m10 282.7-4.2 4 4.9-3.5c2.7-2 5-3.8 5-4 0-1.3-1.6-.3-5.6 3.5m-11 7.2c-2.4 2-2.4 2 .4.6 1.6-.8 3-1.7 3-2 0-1-.7-.7-3.4 1.4m-6.4 4c-3.5 3.4-2.6 7.1 1.5 7 2 0 4.5-.5 5.6-1.2 1.4-.9.5-1-3-.5-5.4 1-6.4-.9-2.7-5 2.7-3 1.5-3.2-1.4-.3m-20.5 11c-1 .7-1.6 1.5-1.3 1.8s1.8-.2 3.2-1.2c2.8-2 1.3-2.5-1.8-.6" />
      </g>
    </svg>
  );
}

export default Padahastasana;
