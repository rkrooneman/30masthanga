/**
 * Dandasana - Staff Pose (Dandasana).
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

function Dandasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Staff Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M399.5 69.5c-18.6 5.3-29.3 19.1-29.3 38.1 0 6.4-.8 9-4.5 14.7l-4.4 7 4 3.1c2.4 2 3.6 4 3 5.4-.4 1.2-.2 2.5.5 3s1 1.6.5 2.7c-.4 1 0 2.3.8 2.8s1.5 3 1.5 5.6c0 7.2 3 9.4 13.1 9.1h10c1.7 0 4.8 12 4.8 18 0 2.5-3.4 8.6-10 17.8-28.6 39.7-28.8 40.3-26.4 86 1 17.2 2 42 2.5 55.2l.8 23.9-24.3 1c-13.4.4-34 2.1-46 3.7-12 1.5-29.5 3.4-39.1 4.3-12.8 1-21.8 2.8-33.3 6.3-12.4 3.8-21.4 5.4-42 7.6-14.3 1.4-30.8 3.3-36.6 4-14 1.9-37.1 1.8-43.8 0-3-.9-7.9-3.8-10.8-6.7-6.6-6.2-19.1-26.8-20-32.9l-1.6-11c-.7-5.7-1.3-6.6-4-6.6-4 0-9.2 5.5-9.2 9.9 0 1.8-1 7.6-2.3 12.8-2.2 9-2.2 9.9.7 21.9 2 8.5 3 17 3 26.7 0 23.8 3.6 26.8 26 21.5 12.2-2.9 34.7-2 64.1 2.4 31.8 4.7 48.4 4.2 72.2-2 23.2-6.2 24.8-6.2 51-1 24.1 5 70.8 11.2 83.4 11.2 5 0 14-1.5 21.3-3.5 6.9-2 17-4.2 22.3-5 17.9-2.7 16.1-1.2 16.1-13.7 0-6.1-1.2-23-2.8-37.4-1.7-16.2-2.7-33.3-2.4-44.5.2-10-.4-26-1.4-35.7-.9-9.6-2-25.6-2.3-35.6-1-27.4 1.5-14.4 3.2 17 .9 14.7 2.2 30 3 34s1 14.3.4 22.9c-.5 10.4 0 23.4 1.5 39.3 1.3 13 2.2 30.4 2 38.5l-.5 14.6-10.5 1.5c-16.4 2.3-49 11.6-50 14.3-1.3 4.1 6 5.2 36 5.2 33.3 0 37.8-.8 41.4-8 4.8-9.2 9.6-64.4 8.3-94.7-.9-18.8-.5-25.7 2.7-51.8 2-16.5 4.3-36 5-43.3 1.2-13 1.2-13 .6 4.8-.4 9.9-2 27.8-3.6 39.8-2.4 17.6-2.9 28.5-2.7 56.8.1 26.6-.5 40.4-2.5 58-1.5 12.6-2.5 23.3-2.3 23.5 1 1 7.4-4.7 10-8.9 7.9-12 9.5-29.7 5.2-56.6-3.8-23.8-3.2-51 2-89.9 7-52.4 5.9-67.5-7-93.2-6.9-13.6-7.5-15.5-8-26.3-.4-11-.2-12 3.7-17.5 15.2-21.2 15.7-43.6 1.5-59-10-11-28.5-15.5-44.5-11" />
      </g>
    </svg>
  );
}

export default Dandasana;
