/**
 * Navasana - Boat Pose (Navasana).
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

function Navasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Boat Pose pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M447.9 98.4c-.7.5-2 3.8-3 7.4-.8 3.6-3.5 10.3-6 15l-12.8 25c-14 27.3-23.2 40-40.7 56.2-8.5 7.8-23 21.5-32.4 30.6-15.7 15.2-18.1 17-30.6 23-9 4.2-15.2 8.2-18.6 11.8-2.9 3-10.5 9.3-17 14.1-17.7 13.2-36 28-52.2 42.3l-14.7 12.9-8.7-8.2c-6.6-6.2-10.5-11.4-16-21.4-4-7.3-8.4-14.8-10-16.7-2-2.6-2.5-4.6-2-8 .5-2.6-.1-7.2-1.4-11.1-1.2-3.7-2-6.9-1.8-7 1-1 30.7-5.9 35.7-5.9 9.5 0 31.6-5 55.7-12.4 21.4-6.7 24-7.3 31.5-6.5 12.3 1.2 38.9-3.7 42.5-7.9 1.4-1.7 3.8-3 5.2-3 1.4-.1 3.6-1.6 5-3.4 2.3-3.3 2.3-3.4-.7-6.6-2.9-3-3.7-3.2-14.4-2.8-10.4.4-11.2.2-11-2 .5-5-18.4-2.7-26.6 3.2-4.8 3.4-23.8 5.8-53.7 6.9-13.4.4-24.9 1.5-29.2 2.7-25.8 7.2-49.7 8-74.6 2.6-8.2-1.8-16.6-3.2-18.7-3.2-6.2 0-10.7-7-10.9-17-.2-7.9-.1-8 8.8-9.1 10.5-1.5 11-2 10.5-15.7-.3-8.4.1-12 1.4-13 2.6-2.1 2.2-3.1-4-8.9-4-3.7-6-6.9-6.6-10-3.2-17-16.8-27.7-35-27.7-23 0-39.7 15.5-39.7 36.4 0 12.2 3.8 19.5 15.3 29.8 11.8 10.4 12.7 13 12 33.8-1 36.3-.9 37 9.8 59.1 3.6 7.7 8.4 15 13.9 21.1 4.5 5.2 14.2 17.4 21.5 27.3l22.2 30.2c5 6.8 11.6 17 14.7 22.5 9.4 17.3 13 22 19.7 26.2l6.4 4 27 .3 27.1.4 6.5-3.6c8-4.3 13.5-10.2 25.7-27.3 5.2-7.3 14.1-19 19.9-26 9.8-11.9 15.5-20 30.3-43.1 8.8-13.8 18-22.8 30.4-30.2 25-14.8 33.3-23.4 53.5-55.3 25.6-40.6 26.8-41.9 38.9-43.9 13.3-2.1 14.8-6.5 10.6-30.8-.7-3.6-.6-9.4.3-14.3 1.7-10.6 1.5-30.4-.5-36.5-1.8-5.6-5.6-8.4-8.5-6.3" />
    </svg>
  );
}

export default Navasana;
