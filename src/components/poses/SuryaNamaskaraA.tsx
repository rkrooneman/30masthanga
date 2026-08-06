/**
 * SuryaNamaskaraA - Sun Salutation A (Surya Namaskara A).
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

function SuryaNamaskaraA({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Sun Salutation A pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M260.7 53.6c-1.8 2-2.2 3.5-2.2 8.4 0 5.8 0 6-2.6 5.4-2.3-.4-2.6-.2-2 1.6.4 1.2 1 4.4 1.5 7.2.6 3.7 1.7 6 4 8.4 2.7 2.8 3.3 4.4 4 10.2.6 5.2.7 36.7.1 49.4 0 2.4-5 1.1-8.3-2.2-5.5-5.5-13.8-6.3-21.2-2-17.4 10-14 32.7 5.4 36.6 7.7 1.5 8.9 3.8 7.1 14.5-1.4 8.7-.7 13 6 39.6 5.7 22.1 5.4 25.4-4.1 40.2-9 14-10.1 21.6-5 34.4l3 7.3.2 26.3c.2 25.5.2 26.7-2.4 37.5-3.4 14-3.4 20.6-.2 40.8 2.7 17.4 3 23.4 1.5 31.3-1 5.6-.2 9.5 2.3 10.4.9.3 10.5.9 21.3 1.2 21.8.7 24.6.2 25.1-4.6.3-2.4-.2-2.7-6-4.3-3.4-1-9.9-3.6-14.2-5.9-7.8-4-8-4.3-10-9.7-1.6-5-1.7-6.5-.6-19l2.2-25.6c.8-9.7 1.6-13.7 3.9-19.3 1.6-3.9 3.2-8.7 3.5-10.7s2-7.8 3.5-12.7c5.6-17.5 7-25.2 7.9-43.5.5-11.2 1.4-19.2 2.4-22.4 1-2.7 2.1-10.3 2.7-17 .5-6.6 1.7-16.3 2.5-21.7s1.3-11 1-12.8c-.5-1.7-.2-5.9.5-9.3 2-9.8 1-12.6-7.7-21.8-4-4.4-8.6-9.7-10-11.9l-2.6-3.9 2.6-10.2c3.4-13.9 7-40.8 6.1-47.2-1-8.2-4.5-27.8-5.1-29.4-.4-.9-.7-7.4-.9-14.5-.2-15.3-1.8-23.5-4.6-24.2-1-.3-1.9-1.4-1.9-2.4 0-1.8-3.4-4.9-5.4-4.9-.6 0-2 1.1-3.3 2.4" />
    </svg>
  );
}

export default SuryaNamaskaraA;
