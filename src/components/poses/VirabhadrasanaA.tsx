/**
 * VirabhadrasanaA - Warrior I (Virabhadrasana A).
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

function VirabhadrasanaA({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Warrior I pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M238.9 54.5c0 .8-1.1 2.1-2.4 3-2.2 1.3-2.3 2-1.5 10.4l.8 9-2.9-1.9c-1.9-1.2-3-1.4-3.5-.6-1.4 2.1 4 14 8.3 18.5 5.2 5.4 6.5 11 7.4 31.9.3 7.7 1 16.9 1.7 20.4l1.1 6.4-6 6c-6.3 6-8.6 11-8.6 18.2 0 5.4 5.3 14.8 10.1 18 4.3 2.8 4.3 3 3.6 8-1.4 9 .5 27.3 3.5 34.4 3.5 8.2 10.7 34.2 11.4 41.4 1 10-1.6 17.5-7.6 22-2.5 1.7-5.2 3.2-6 3.2-2.2 0-11.7 9-13.9 13.3-1.1 2.3-2.4 6.1-2.9 8.6-1.2 6.5-2 7.5-11.4 15.2-4.8 4-12.6 10.7-17.3 15.2-10.8 10-16.2 13.2-26.1 15.4-13.2 3-24.4 7.2-29.3 11l-16.5 12.9c-13.2 10.5-19.2 14-29 17.4-10.1 3.5-11.2 6-7.2 17.2 1.7 4.8 3.5 12 4.1 16.1 1.3 9.3 2.7 12 7.2 13.9 4.4 1.8 18 1 20-1.3 1.4-1.8-.6-4.9-3.2-4.9-.9 0-2.8-1.2-4.2-2.6-2.6-2.6-2.6-2.8-1.2-11.7 1.7-10.6 3.4-13.3 11.7-19 9-6 52-23.6 63-25.7 18.8-3.5 59.2-23.8 75.8-38 3.8-3.3 3.9-3.4 10-1.9 20.3 4.8 31.6 6 50.2 5.9 22-.3 24.4.1 23.3 4.4-2.3 9.8-2 24.3 1 35.3 5 19.4 6.3 39 3.4 52.2-.4 1.6 0 3.7 1 5 1.6 2.1 3.1 2.3 21.6 2.5 11 0 23.5.3 27.7.3 12 .3 15.1-5.5 3.8-7-6.1-.8-25-10.5-28.4-14.5-3.7-4.4-4.2-9-3.4-27 3.1-64.1 3-67.5-2.4-72.7-5.8-5.6-38.8-18-57.4-21.5-14.4-2.7-14.6-2.8-14-3.8 1.3-2.1 5.4-32.9 6.3-47.1.5-8.4 1.2-16.5 1.6-18 1.8-7.2-1.2-12.1-15.2-25.7l-13.4-12.9v-8.1c0-8.3 2-12.6 6-12.6 2 0 6.4-4.7 6.4-7 0-.9-.8-2.3-1.7-3-1-.8-1.7-2.4-1.7-3.4 0-1.1-.7-2.6-1.6-3.4s-1.4-2.4-1-4.4c.6-3 .3-3.2-4.9-4.5-4-1-5.9-2-7.3-4.6-1-1.8-3.1-3.9-4.6-4.5-2.2-1-2.8-2.4-3.4-7.2-.4-3.2-3.5-15.6-7-27.6-5.4-19-6-22.4-5.4-28 .4-4.1 0-9.5-1.2-15.7-2.2-10.5-3.3-13.2-5.6-13.2-.9 0-2-1.3-2.3-2.8-1-3.8-9.4-8.1-9.4-4.8" />
    </svg>
  );
}

export default VirabhadrasanaA;
