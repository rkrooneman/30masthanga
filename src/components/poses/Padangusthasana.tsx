/**
 * Padangusthasana - Big Toe Pose (Padangusthasana).
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

function Padangusthasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Big Toe Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M291.7 54.7c-28.2 4.4-68.4 33-88.2 62.8-20.6 31-29 51.6-34.4 85.4-2.7 17.2-3 27.2-.7 39.6 1.2 6.6 1.3 11 .4 18.1-.9 7.3-.7 12.2.6 21.7 2.6 17.5 1.6 28.8-2.8 33.2-6.6 6.6-6.9 21.2-.5 28.7 1.5 1.8 3.6 6.7 4.6 10.9 2.5 9.9 8 21.3 17 35.7 14.8 23.3 17.1 29 16.9 40.8-.3 9.6-.1 10.5 3 14l6.3 8.1c3 4 3.5 4.3 12.9 5.2 17.8 1.9 76.8.5 85-2 6.3-1.8 7.8-9.2 4.5-22.7-3.5-14.3-1.5-40.2 5.8-75 6.7-32.4 6.5-43.9-1.4-77.9-3.8-16.6-3.2-22.9 5.4-53.2 5.6-19.8 8.2-31.7 12.5-59 1-6.4 3.6-19.2 5.8-28.3 7.6-31.3 7.9-40.9 1.8-57-7.3-19.6-31.7-32.6-54.5-29m-23.3 93.4-2 11c-.7 4.2-3.1 11.8-5.3 17-3.9 9-4 9.8-3.8 23.4.4 22-3.7 30.4-22 45.4-10 8.2-10.8 10-8.5 19.4l1.6 6.8h11.4c12.4 0 13.7.6 13.7 6.7 0 1.7.8 3.9 1.7 4.8 1 1 2.1 4.4 2.5 7.8.7 5 1.4 6.3 3.6 7.1 3.6 1.4 3.6 4.4 0 11.4-2.6 4.8-3 7-2.8 15.6.3 22.6-16 38.7-39.6 38.7h-8.5l2.2 9c6 23.8 8.3 29.8 14 35.5 7.6 7.6 9.3 10.5 11.2 19.6.9 4.3 2.1 8.4 2.8 9 1.9 2 29.6-12.3 33.2-17 7-9.2 9.2-29 6.8-61.4-.8-10.3-2.1-30.4-3-44.6-1.4-22.6-2-27.4-5.4-38.7-3.6-12.7-3.7-13.4-4.3-44.6-1-42-.7-62.4.9-74.3 1.2-9.4 1-14.5-.4-7.6m-44.2 289.6c0 1.9.7 2.9 1.9 2.9s1.6-.6 1.2-1.9c-.4-1-.7-2.3-.7-2.9s-.6-1-1.2-1-1.2 1.3-1.2 2.9" />
      </g>
    </svg>
  );
}

export default Padangusthasana;
