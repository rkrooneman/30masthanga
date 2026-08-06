/**
 * SalambaSarvangasana - Supported Shoulderstand (Salamba Sarvangasana).
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

function SalambaSarvangasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Supported Shoulderstand pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M241.8 52.3c-1.3 1.3-1.3 2.6 0 7 1.9 5.8 2.6 10 3 17 .2 3.8 1 11.2 1.9 16.7s1.8 12 2 14.7c.8 6 .8 34.5.1 42.3-.3 3.2-.7 12.2-1 19.8-.6 15.3-1 17.4-5 28.7-1.9 5.4-2.2 7.1-2.9 15-.4 4.8-1.5 12.9-2.3 17.9-3.2 17.9-3.5 21.7-3.5 39.9 0 18 0 17.9 3.4 33.7.6 3.2 1.2 8.5 1.4 14 .3 9 1.3 19 2.7 27.6.5 2.8.9 10 1 17.4.1 6.9.4 14.3.6 16.5.3 3.7.2 4.2-1 6.4-6.3 10.8-6.7 14.2-4 31.2.8 5.2-.1 7-3.6 7.3l-2 .2.5-3.2c1-7.4.1-10.3-3.4-10.3-.7 0-2-.5-2.7-1-.7-.7-2-1.1-2.6-1.1s-1.4-.3-1.6-.6-1.1-.5-2-.5c-1.6 0-2-.2-2.2-1.5-.9-3.4-1.9-3.5-7.3-.8-4 1.9-4.1 2-10.7 2-7.8 0-10.9 1.1-15.4 5.3-10.4 9.7-10.1 29.3.4 37.8 8 6.4 18.1 6.9 30 1.4 11.3-5.2 16-4.8 31 2.2 8.6 4 11.4 4.4 29 4.8 33.2.7 50.9.5 54.2-.5 4.4-1.3 7.4-4.3 7.4-7.2 0-6.6-9.6-24-24.6-45.1-8.6-12-10-15.5-11.6-26.7-.7-4.8-1.2-6.9-2.4-9-.8-1.4-2.1-4.6-3-7.1-1.6-5-4.5-11.5-5.8-13.2-.8-1-.8-1-2 .2-1.3 1.7-1.3 5.6 0 12.1 2 9.4 2 15.8.3 15.8-.5 0-2.3-1.3-4-2.9-4.1-3.6-6-4.4-7.1-2.9s-.4 3.1 2.9 6.8c1.5 1.7 3.7 5.1 5 8 2 4 3.1 5.7 6.6 9 6.7 6.7 12 18.4 15.6 34.4 1 4.2 1.7 7.8 1.6 7.9s-3.1-.7-6.6-1.9c-8.2-2.6-12.7-3.5-21.7-4.3-5.6-.4-7.9-.9-10-1.8-3.4-1.6-3.7-2.2-.6-1 2.7 1 19.5 2.2 20.2 1.4 1-1 2.1-10.3 2.5-20.7l.3-10.6-3.6-3.3c-3-2.8-4-4.1-5.9-8.2-1.3-2.8-3.4-6.1-5-8-7.3-8.3-2-14.2 6-6.7 1.3 1.2 2.5 2.2 2.7 2.2 1 0 .3-6.7-1.5-17-.8-4.6-.8-5.4 0-7.8.4-1.6.8-5.2 1-8.2.2-4.5.5-6.1 2-9.6 3.3-8.3 3.8-9.7 4.5-13.6 2.3-11.8 0-21.6-7.8-34.3-4.8-7.8-5.3-9.6-6.7-24.7-.9-9.3-2.7-22-4.5-30.5-2.8-13.7-2.8-23.7-.1-36.1 3.4-16 3.6-26.6.4-43.7-3-16.6-4.2-25.3-4.5-33.7-.3-8.8 0-9.9 4-14.5 6.2-7 5.5-10.7-3.8-19.7-5.3-5-6.6-7-9.7-14-2.4-5.7-5.5-10.3-10-15.1-2.6-2.8-3.1-3.1-5.1-3.1-1.6 0-2.6.3-3.4 1" />
    </svg>
  );
}

export default SalambaSarvangasana;
