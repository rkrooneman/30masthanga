/**
 * Karnapidasana - Ear-Pressure Pose (Karnapidasana).
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

function Karnapidasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Ear-Pressure Pose pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M220.3 169.9c-16 1.5-29.3 10.4-35.9 23.9-4.3 8.8-5.4 17.8-4 33.4 2 25 4.4 37.9 11.1 59.4 2.8 9.2 5.2 20 5.2 24.1v1.8l-1.7-.5c-12.9-4-25.6-4.1-41.3-.2-10.2 2.5-24.4 4.3-34.2 4.3-8 0-9.5-.6-13.7-5.7-2.9-3.6-5-4.8-8.3-4.8-4.2 0-6 1.2-12.5 9-4.7 5.4-8.1 7.8-16.6 11.4-4 1.6-5.8 2.7-7.3 4.1-1.3 1.2-2 1.5-3.7 1.8-4.1.6-6.2 2.7-5.1 5 1 2.2 7.4 3.3 12.6 2.2 1.6-.3 4.8-.5 11-.4 9.2 0 14-.2 21.6-1.4 15.6-2.4 28.7-2.2 53.9.6 13 1.4 19.5 2.1 27.8 2.8 3.4.3 8.3.9 11 1.3 6 1 21.7 1.4 25.9.8 8.3-1.3 13.5-7.3 15.6-18.2 4.5-23 6-67.8 3-93-.2-2-.3-3.6-.2-3.7.2-.2 1.8 8 2.2 11 .3 1.6.5 1.9 2.2 3.2 3.1 2.3 3.1 2.3 3.2 9.8.1 6 .2 6.8 1 9.6 1.3 4 1.3 3.9-1.3 6.6-3.3 3.3-3.4 3.6-3.8 12.4-.7 15.8-2 30-3.6 39-.6 3.7-1 5.6-2.3 11.2-.2.7 0 .8 2.2 1.2 2.3.5 2.6.6 4.8 2.9 3.2 3.3 5.3 4.8 8 5.7 8.3 2.7 20.5 2.4 33.8-.8 7.2-1.8 8.4-2 17.7-2.7 9.4-.9 15.4-1.7 25.1-3.5 7.9-1.5 14.3-1.7 20.9-.7 7.1 1.1 18.5 1.4 36.6 1 25.5-.7 27.6-.6 30 .5 4.2 2 4.6 2 20.7 2.3 13 .3 15.2.3 16.3-.1.7-.3 3-.6 5-.8 5.4-.2 7.6-1.1 7.6-2.9s-1.6-2.5-11.7-5l-9.5-2.5c-4.6-1.3-6.3-1.6-14-2.2-9.2-.7-32-3.8-47-6.5-8-1.4-18.3-3-25.3-3.7-6-.7-7.5-.8-15.2-.5-10.5.4-19.9.3-34.3-.3-6-.2-16.7-.4-23.7-.4s-12.6 0-12.4-.1c2.3-.7 12-1.4 20.2-1.6l10.3-.2 1-2c5.2-10.4 8.7-26.1 8.7-39.8 0-27.7-9.1-51.3-27-69.9-6.2-6.3-14.4-13.7-17.7-15.8-13.8-9.1-29.7-13.7-43-12.4m-40.8 116c-7.5 1.4-13.4 5.2-17.5 11.2-1.7 2.7-3.5 7.3-4 10.2l-.2 1.7 1.3-.2c10.5-2.3 22-2.2 32.4.2l3.3.6c.8-.9-4.7-23-5.8-23.5s-7.8-.5-9.5-.2m-74 14.6c-1 .3-2.4 1.2-3.3 2-1.7 1.6-1.8 1.4 1.2 3.2.8.5 2.7 2.3 4.1 4 3.7 4.2 4.8 4.8 10.3 5 7.5.2 22.3-1.6 33.5-4.2 2.4-.5 4.4-1.1 4.6-1.3.3-.6.8-3.9.5-4.1 0-.1-2 .2-4.4.7-10.5 2.3-23.9 3.7-28.2 3.1-3.4-.4-5-1.3-8-4.4-3.8-3.8-7-5-10.3-4" />
    </svg>
  );
}

export default Karnapidasana;
