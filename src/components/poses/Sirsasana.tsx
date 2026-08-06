/**
 * Sirsasana - Headstand (Sirsasana).
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

function Sirsasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Headstand pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M227 52.3c-2 1-2 1.5.2 7 2.3 6.1 2.7 8 3.3 13.8l2 13.2c4.3 21.5 4.8 29.5 3.4 55.6-1.7 32.5-1.5 30.3-4.3 38.8-2.7 8-3.4 11.1-4 17.9-.1 2.2-.7 6.3-1.2 9.2-4.2 22.6-5.5 46.4-3.1 61.6 1.3 8.7 1.3 7.8-.7 27.4-.7 6.7-1.3 13.8-1.3 15.8 0 5.5-1 11.6-2.9 19.4-2 8.5-2.1 10.5-.4 20.8 1 6 1.2 9.5 1.2 14.8-.1 7.2.3 10 2.2 13.6 2.3 4.4 6.4 10 11.2 14.9 2.8 2.8 5 5.3 5 5.5 0 .6-1.4 3.1-4.3 7.4-9.6 14.4-18.5 42.3-15.4 48.7 1.4 3 1.7 3 15.5 3 11.8.1 13.5 0 25.5-1.7 13.2-1.9 26-3 28.5-2.5 2 .4 3.8-1 4.3-3.2.2-1 .7-1.9 1.2-2 2.7-.9 4.3-4.7 3-7-.4-.7-.6-1.8-.5-2.6.2-2-.9-5-2-5.5-.6-.3-1-1.1-1-1.9 0-3.8-2.4-4.2-6.3-1l-5.6 4.3c-1.7 1.2-3.7 3.2-4.5 4.4-.9 1.1-2.2 2.4-2.9 2.8-1.8 1-10.5 1.8-15.5 1.4-4-.3-17.5-1.8-17.8-2 0-.1 1.1-2.6 2.7-5.5 1.5-3 3.4-7 4.1-8.9 2-5.4 2.7-6.4 6.6-10.5 4.4-4.5 7.4-9 9-13.4.7-1.8 1.3-2.8 1.4-2.3.6 2.7-3.5 10.3-8.4 15.7-5 5.6-5 5.8-7.9 12.4l-2.3 5.6 1.2 2.3c.6 1.3 1.2 2.7 1.2 3 0 1.3 2.7 1.8 11.2 2.1 11.5.4 13.2 0 16.7-3.8 2.5-2.8 11.5-9.7 13.7-10.5.8-.3.9-.7.6-2.2-1.3-6.7-5.5-12-11.8-15l-4.3-2c-3.1-1.6-4.4-11.3-2.2-17 2.9-7.5 3.4-14 1.7-22.7l-1.6-10.2c-.7-6.4-2.4-13.8-5.9-26-5.5-19-5.2-23.2 2.9-36.7 4-7 5.3-11.3 5.3-19 0-7.8-.6-10-5.1-19s-4.8-10.2-6.4-27.5c-.6-6.8-1.8-15.5-3.1-22.5-2.6-14-2.6-19.6 0-32.5 3.5-18 3.5-18.3-1.7-47.3-.7-3.8-1.6-10.6-2.2-15-1-9.8-.7-12.2 2.3-16.7 5.6-8.2 5.3-9.8-3.4-17.8-5.6-5.2-7.8-8.1-9-12.1-1.2-3.5-2.4-5.4-5.8-9.2-1.5-1.7-3-3.7-3.2-4.3-.3-.7-.8-1.2-1.1-1.2s-1.7-.7-3-1.5c-2.5-1.8-2.7-1.8-5-.7" />
    </svg>
  );
}

export default Sirsasana;
