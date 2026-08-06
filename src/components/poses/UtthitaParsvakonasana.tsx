/**
 * UtthitaParsvakonasana - Extended Side Angle Pose (Utthita Parsvakonasana).
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

function UtthitaParsvakonasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Extended Side Angle Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M68.5 53c-1.6 2.5 1.2 7.8 7 13.4 3.4 3.3 5.7 6.2 5 6.4-4.5 1.5 9.7 16.4 16.9 17.8 8.6 1.7 10.5 3.6 25 25 4.8 7.2 11.6 16.3 15.2 20.3s8.3 11.1 10.6 15.7 7.2 12.6 10.9 17.7c5.6 7.7 7.2 11 9.4 19.4 1.5 5.5 3.5 11.6 4.4 13.4 3.1 6 1.2 9-6 9-5.2 0-6.2-2.2-4.2-9.1 1-3.3 1.8-6.3 1.8-6.8 0-1.1-9.9-7.7-11.6-7.7-.7 0-2-1.6-2.7-3.5-1.1-3-1.6-3.3-3.9-2.5-3 1.1-10 1-15.7-.1-15.4-3.3-29.4 9.6-29.5 27 0 9.4 3.1 15.2 11.6 21.2 5.3 3.7 13.7 4.4 26.8 2.3 7-1.1 10.6.7 13.3 6.5 1.7 3.3 1.5 4.7-1.7 20.3-4 19.7-4 20.5-1.2 34.2 1.3 5.8 2.3 12.7 2.3 15.4 0 4.6-.2 4.9-6 8-9.5 5-10 7-9.3 31.7.3 11.4 1.4 26 2.3 32.5 2.4 17 2.3 19.3-1.6 25.5-1.9 2.9-3.4 6.4-3.4 7.9 0 1.4-.8 4.4-1.7 6.7-2.2 5.3-2.1 6.3.6 5.6 2.5-.6 3 1.4 1.2 4.8-1.7 3-13.4 9.5-22.4 12.3-8.4 2.5-10.4 4.4-7.9 7.5 1.3 1.6 3.2 1.7 14 1 6.7-.5 18.6-1 26.3-1.1 22.3-.3 22.7-.6 20.2-17-1.7-10.9-.8-33 1.8-44.2.9-4 2-14.1 2.6-22.4 1.3-19.7 1.9-22.3 5.4-23.2 1.5-.4 8.9.1 16.4 1.1 17.4 2.4 20.5 2.3 38.9-.4 17.2-2.6 25-4.6 32.7-8.5 7.9-4 9.8-3.6 22 4.8l19 12.9c4.4 3 13.7 10 20.6 15.5s16.7 12.3 21.7 14.9c6.6 3.4 11.5 7.2 18 13.7 5.9 5.8 15 13 25.7 20 9 6.2 17.7 12.6 19 14.4l5.8 7.2c3 3.7 3.2 4.4 2.5 10.6-1 9.1 1.2 10.7 13 9.5 15-1.4 15.5-5.8 2.9-23.4-1.7-2.4-3.1-5-3.1-5.9 0-.8-2-2.8-4.6-4.5-2.8-1.8-9-9-16.4-19.2-15.4-21-22-28-35.1-37.2-17-12.2-22.8-18.5-45.3-50.1-5.6-8-13.1-16.9-18-21.4-4.6-4.2-10.6-10.8-13.4-14.6-3.7-5-9.3-10-20.1-18.1-11.8-8.8-16.8-13.5-23.6-21.7-4.7-5.8-17.7-19.1-28.9-29.6-20.3-19-24.7-24.3-32-38.7-4-7.8-9.7-15.6-22.5-30.3-5.6-6.5-13.3-16-17.3-21.2-13.1-17.4-43.1-46-59.5-57-3.4-2.3-9-6.2-12.4-8.8-6.4-5-10.7-6.7-11.8-5m107.4 229.7c-2.2 1.8-2.3 2.8-1.7 13.3l.7 11.3 6.9-1.4c3.7-.8 13.1-2 20.9-2.7 17.9-1.6 17.3-1.4 15.2-5.5-3-5.8-13.6-12.5-19.8-12.5-3 0-7.7-1-10.6-2.2-6.4-2.8-8.6-2.8-11.6-.3" />
      </g>
    </svg>
  );
}

export default UtthitaParsvakonasana;
