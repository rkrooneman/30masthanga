/**
 * Bhujapidasana - Shoulder-Pressing Pose (Bhujapidasana).
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

function Bhujapidasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Shoulder-Pressing Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M307.1 77.2c-14.5 1.9-31 5.7-45.7 10.6-53.2 17.8-80 40-112 92.2-1.8 2.8-4 5.6-5.2 6.3-3 1.9-9.3 1.5-11.1-.7-1-1-6.4-4.2-12.1-6.8-35.4-16.5-69.8 4.1-69.6 41.6.1 17.2 5.8 28.7 18.2 36.7 9.4 6 16.3 8.5 24 8.5 3.4 0 6.3 1.5 11 5.8 7 6.6 7.5 6.7 11.3 3.3 1.6-1.5 5.6-2.6 10.2-2.8 19-1 20-1.3 22.1-4 1.3-1.7 2-6.5 2-12.3 0-12 1.4-14.3 13.8-23.2l10-7.4 2.8 4c7 10.2 18 19 31.7 25.5 14.2 6.8 15.1 7.5 53.6 44.4 3.4 3.2 4.7 6.5 6.7 16 1.4 6.7 3.8 18.1 5.5 25.5s3.5 21.2 4 30.6c1.1 20 1.3 19.8-15.3 22-19.7 2.5-43.4 7.9-45.8 10.3-.4.4.1 2.2 1.2 4 1.8 3 2.5 3 16 2.2 7.8-.5 15.2-1.3 16.3-1.8 1.5-.5 1.9 0 1.3 1.4-1.2 3.3 3.8 4.3 11.2 2.4 3.6-.8 9-1.3 12.1-1 5.5.6 5.5.6-1.2.8-3.9.2-8.7 1.2-10.9 2.3-2.1 1-6.5 2.4-9.7 3-16.9 3-32.7 10-30.5 13.6 1.7 2.7 12.5 4.8 20 3.8 6-.9 7.4-.6 9 1.6 1.9 2.5 2.4 2.5 11.9.3 5.4-1.4 16.3-2.8 24.2-3.2 17.5-1 20.3-2.5 23.2-12.8 3.8-13.8 7-53.5 6-73.4-3-54.7-2.1-51.6-18.9-71.3-9.1-10.7-8.8-11.2 3.7-6.1 4.8 2 20.2 6.8 34.3 10.9 31.1 8.9 38.6 12.4 59 27.9 8.9 6.7 19.6 14 23.9 16.5 8.8 5 20.6 16.4 23 22.4 1.2 2.7 2.8 4 4.8 4 3.8 0 12.4-7.8 12.7-11.6.9-9.6.7-12.5-.9-15.1-1-1.6-2.2-4.5-2.6-6.5-.5-2-5.2-8.4-10.4-14.3-8-9.1-10-12.4-13.3-22.8-2.8-9-5-13-8-15.4l-8.2-6.4c-5-3.8-9.8-4.1-17-1.1-11 4.5-17.4 1.6-45.4-20.1-5.2-4-13.2-9.4-18-12-8.6-4.5-8.6-4.6-4.3-5.5 44.2-9.9 79.2-33 92-60.9 11.3-24.3-4-57.7-32.5-71.3-19.7-9.3-57.6-14.1-84.2-10.7m-4.9 76.4c-21.8 12.5-33 20.6-47.7 34.6-18 17.3-22.3 28.6-16.1 42.4 3.3 7.3 5.1 8.3 2.1 1.1-3.6-8.6-2.7-18.1 2.5-26 8.5-12.8 38.9-37.2 74.4-59.6 1.5-1 2.4-1.8 2-1.8s-8.1 4.1-17.2 9.3" />
      </g>
    </svg>
  );
}

export default Bhujapidasana;
