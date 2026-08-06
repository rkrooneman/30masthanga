/**
 * ParivrttaParsvakonasana - Revolved Side Angle Pose (Parivrtta Parsvakonasana).
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

function ParivrttaParsvakonasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Revolved Side Angle Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M76.2 52.4c-2.2 1.5.5 8 5.2 12.6 2.2 2.2 5 5.3 6.2 6.9l2.1 3-2.6-.6c-4.5-.8-5 2.1-.8 5.3l8.8 7.2c3.8 3.2 6 4.2 9.2 4.2 5.4 0 11.2 6 23.9 24.8 5.2 7.7 13 17.8 17.2 22.6 4.6 5 8.5 10.7 9.7 13.8 1 2.9 4.7 10.5 8 16.9 4.4 8.2 6.4 13.5 6.8 17.6.4 3.2 2 9.8 3.5 14.7 2.6 8.2 2.7 9 1 11.6-2.8 4.3-6 5.5-9.8 3.9s-4-2.3-1.5-9.4c2.2-6.4 1.6-8.4-3-10-1.8-.7-3.4-1.6-3.4-2.1s-1.5-1.3-3.4-1.7c-2-.5-3.4-1.5-3.4-2.7 0-4.4-1.6-5-8.3-3-6 1.8-6.8 1.8-11.5 0-17-6.5-36.4 11.5-34.3 31.8 1.1 11 8.6 20.2 19 23.6 7.9 2.5 11.5 2.4 21-1 10-3.5 11-3.5 15.8.7 4.7 4.2 4.7 4.5 2.1 22.4-2.3 15.9-1.4 22 5.2 36.3 2.4 5.4 5.3 14 6.2 19s3 13.5 4.6 19 2.8 12 2.7 14.2l-.2 4.1-.4-4c-.2-2.1-2-9.5-3.7-16.4-1.9-6.8-4.4-16.8-5.7-22-1.2-5.3-2.7-10-3.1-10.5-1.5-1.4-13.2 5.2-15.7 9-3.2 4.6-4.3 39.8-2.5 75.8 1.3 27 .5 36.4-3.8 41-4.7 5-19.2 13-26.8 15-8.2 2-10.8 4.4-8.2 7.5 1.4 1.7 3.3 1.8 16.4 1 8.1-.4 21-.8 28.6-1 19-.1 19.1-.4 16.5-19.4-1.5-10.4 0-26.5 4.3-45.1 1.9-8 3.4-16.2 3.5-18.2.2-3.3.3-3.2.9 1l.7 4.5 6.4-7.7c11.6-14 11.8-14.8 10.4-35-.8-11.5-2.3-21.8-4.4-30.3-2.2-9.1-2.8-13.5-2-14.7 1.8-3 6.5-3.5 13.4-1.6 5.3 1.5 7.5 1.6 12.7.5 6.8-1.4 11.8-.2 15 3.6 2.2 2.6 2.4 2.5-14.7 4-26.7 2.3-25 1.4-22 12.6.9 3.4 2 10.6 2.3 16 1 12.3 1.1 12.6 9.2 13.6 19.5 2.4 49.9.4 63.8-4.3 7.2-2.4 9.2-2.6 12.5-1.6 3.7 1.1 32.8 22.5 54.6 40 5.2 4.3 13.4 9.8 18 12.2 6 3.2 11 7 16.5 12.6 4.4 4.5 15.4 14.2 24.6 21.6s17.3 14.7 18.1 16l4 8 2.4 5.2-2.8 5.3c-4 7.6-2.9 8.5 10.6 8.5 9.9 0 10.9-.2 13.5-2.9 2.3-2.3 2.7-3.5 2.1-6.3-1.3-5.9-9.3-20.5-14-25.3-2.3-2.6-7-9.2-10.3-14.8-15-25.6-21.5-33.1-40.3-47.4-12.1-9.2-15.3-12.9-27.2-31.5-16.1-25-18.1-28-23.4-34-3-3.4-7.3-9.6-9.6-13.6-6-10.2-13.1-16.9-32.5-30.4-9.2-6.4-21.5-16-27.2-21.5-5.8-5.4-17.8-15.2-26.6-21.8-18.4-13.7-21.7-17.3-27.8-30.4-5.4-11.6-11.7-21.9-20.8-33.7-3.8-5-8.3-11.5-10-14.4-7.7-13.4-52.6-56-78-73.9-9.8-6.9-11.5-7.7-13.5-6.5" />
      </g>
    </svg>
  );
}

export default ParivrttaParsvakonasana;
