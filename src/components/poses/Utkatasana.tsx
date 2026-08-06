/**
 * Utkatasana - Fierce Pose / Chair Pose (Utkatasana).
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

function Utkatasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Fierce Pose / Chair Pose pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M320.4 52.4c-2.5 1-3.2 2.3-7.6 14-1.5 4-2.2 5-2.5 3.3-.5-2.5-2.3-5-3.5-5-.5 0-1.4 3.5-2.2 7.9-1.1 7.2-1 8.4 1 13 1.3 2.8 2.3 6 2.3 7.1 0 3.6-5.6 19.8-10.7 31.2-2.8 6.1-6 14.5-7 18.7-2.4 9.2-14.1 29-19.8 33.3-5.4 4.1-5 1 .6-4 5.4-5 5.5-6 .6-12.4-2-2.7-4-6.2-4.2-7.7-.3-2.3-1-2.8-5.4-3.2-3-.4-6.6-1.8-9-3.6-10.4-8-23.8-5.2-33.7 7-11.4 14.1-.2 36.8 18.2 36.8 8.5 0 10.2 4 5.4 13-1.8 3.5-4.5 10.7-6 16-6.8 24.2-14.7 43.7-20.4 50.4-1.6 2-7.8 7.5-13.9 12.4-6 4.9-12.2 10.5-13.7 12.5-10.5 13.8-10.1 31.6.9 42.6 9 9 44.5 23.6 63.3 26 6.1.7 20.1 4.5 20.1 5.5 0 .2-2.3 2.9-5.1 5.8-6.5 6.8-11 14.6-15 26.2-4.3 13-11.7 30.2-16.7 39.7-5.5 10-6.4 14.2-4.2 17.6 1.7 2.5 2.3 2.6 25.7 3.4 27.4.9 33.2.1 33.2-4.4 0-2.1-.7-3-3-3.4-9.2-2-25.4-9.6-27.5-13-2.3-3.6 1.7-11 14.8-27.2 8-9.8 15.5-20.5 24-34 11.6-18.4 10.1-25.2-8.4-39.6-12.6-9.9-28.5-20.2-39-25.4l-10-5.1c-1-1 12.1-18.5 20-26.7 4.6-5 9.6-11.5 11-14.6s4.8-7.8 7.5-10.6c8.6-8.9 9.1-14.1 3.3-31.4-5.3-15.5-5.5-20.7-1-26.4 6.4-8 10.3-14.4 19.5-31.6 9.7-18.4 11-22.4 16.2-49.8 2-10.3 4.3-18.5 6.8-24 5-11.5 8.3-28.9 5.7-30.8-1-.8-1.9-2.4-1.9-3.8 0-2.3-3.6-6.9-5.3-6.8-.5 0-2 .6-3.4 1.1" />
    </svg>
  );
}

export default Utkatasana;
