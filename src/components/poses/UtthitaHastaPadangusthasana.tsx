/**
 * UtthitaHastaPadangusthasana - Extended Hand-to-Big-Toe Pose (Utthita Hasta Padangusthasana).
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

function UtthitaHastaPadangusthasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Extended Hand-to-Big-Toe Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M308.5 54.7C297.5 57 290 66 290 77.1c0 4.5-.6 6.5-3 9.2-2.8 3.5-2.8 3.6-.9 5.8 1.2 1.3 2.2 3.2 2.4 4.2 2 13.3 3 14.6 11.3 13.3 5.6-.8 6.6.7 5.9 9.1-.5 5.8-3.5 7.3-15 7.3-6.4 0-11.8.8-18.5 2.9-10.5 3.2-10.2 3.2-67 .7-27.3-1.2-30.3-1.6-39.2-4.7-5.3-2-6.4-2-13.5-.5-4.3 1-8.4 1.4-9.2 1.1-1.6-.6-5 2.8-5 5.1 0 1-1.7 3.8-3.8 6.5-2.4 3-4.2 6.7-4.6 9.6-1.2 7.6-3 12.4-6.6 17.7-2 2.8-3.6 7-4 9.8-.6 5.5 1.1 6.9 11.1 9.5 7.7 2 15.8 7 33.4 20.3s24.1 16.6 42.3 21c12.8 3 17.9 5.7 32.6 17.1 4.9 3.8 12.2 8.8 16.2 11.2s12.6 7.7 18.8 11.7l11.5 7.3.6 16c.5 11.4 1.7 20.7 4.2 32.3 1.9 9 3.4 17.5 3.4 19 0 1.4 1.6 7.6 3.6 13.7 3.8 11.7 4.6 19 6.1 55.7.9 19.8 0 25.8-5 30.3-3.8 3.5-22 12.4-27.6 13.4-4.9.8-5.8 4-1.9 6.2 3.1 1.7 18 1.9 37.2.6 18-1.2 20-2.3 18.9-10.1-2.6-16.1-2.5-18.3 2.9-50.5 2.7-16.4 2.5-22.2-1.9-41.7l-3.1-14 1.9-13.1c1-7.2 2.3-19.9 3-28.1 1.1-17 1.2-17.2 6.3-24.7 7.2-10.5 8.7-21 5-35l-2-7.6h3.7c8.4 0 52.5-38.6 52.5-46 0-5.6-10-22.7-18.8-32.3-2.6-2.9-6.7-8.2-9-11.9-7.3-11.5-11.7-16-18.4-19.2-15.5-7.4-20.6-16.2-15.2-26 8.7-15.7 8.5-15.2 8-23.1-.8-16-14-25-31.2-21.5m-163.3 82.1c-1.4 3.6-1.4 12.4 0 21.9 1.7 12 6.3 15.3 41.8 30.5 18.7 8 25.4 10.4 29.4 10.4 2.9 0 8.8 1.3 13.2 3l21.5 7.1c7.5 2.4 18 6 23.5 8.3 5.4 2.1 10.1 3.6 10.4 3.3 2.4-2.3-1.1-39.5-4.3-46.9-2.3-5.2-2.4-11-.2-16.3 1-2.2 1.7-4.3 1.7-4.5s-5.5-.4-12.2-.4-15.4-.6-19.5-1.2-14.7-1.6-23.8-2.2c-11.6-.7-20.8-2-31.7-4.5-11.3-2.7-16.7-3.5-20.9-3-19 2.2-21.8 2.2-22.6-.3-.4-1.3-1.2-2.4-1.8-2.4s-1-1.3-1-2.8c0-3.7-2-3.7-3.5 0m201.7 27.4c-6 11.9-13.7 37-13.7 45.4 0 4.8 3.8 10.4 7.2 10.4 4.9 0 29-28.9 29-34.7 0-.6-2.3-3.4-5.2-6.1-2.8-2.8-7.2-7.7-9.9-11-5.2-6.5-5.9-7-7.4-4" />
      </g>
    </svg>
  );
}

export default UtthitaHastaPadangusthasana;
