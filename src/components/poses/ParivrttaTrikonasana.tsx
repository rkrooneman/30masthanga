/**
 * ParivrttaTrikonasana - Revolved Triangle Pose (Parivrtta Trikonasana).
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

function ParivrttaTrikonasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Revolved Triangle Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M185.7 53.7c-1.8 1.9-2.7 4.7-3.2 10.2-.7 7-1 7.5-2.7 5.9-3.2-2.9-3.7-2-2.9 5.3.6 5 1.8 8.6 4.4 12.6 4 6.5 3.8 2.5 2.7 58.5l-.6 30.3-3.7 9c-3.2 7.7-3.7 10.4-3.8 18.8 0 10.9-2.3 15.8-7.6 16.4-4.5.6-6-2.2-4.3-8.2s1.2-7-6.6-10.7c-3.5-1.8-5.7-3.6-6-5-.2-1.7-1-2.2-3.1-1.9-4.7.7-11.5.5-17-.4-22-3.5-35.6 30.2-17.7 43.6 8.4 6.3 16 7.3 27.9 3.8 7-2.2 12-.6 16.2 5.2 2.5 3.4 1.8 12-2.1 25.5-1.9 6.5-1.6 16.4.7 22.3 2.1 5.6 1.2 32.3-1.4 40.6-1.3 4.4-2.7 13.2-3.3 21.6-.6 7.9-1.5 17.7-2.2 22-.6 4.2-1 8.3-1 9 0 .8-1.8 3.4-4 5.7-2 2.3-4.8 6.8-6 9.8l-3 7.8c-.8 1.8-.6 2 2 1.5 2.9-.5 3-.4 2.4 3l-1.4 9c-.7 5.3-1.1 5.8-8 10.4-8.7 5.8-21.2 12-28.1 14-5.7 1.7-6.7 3.2-3.8 6 1.7 1.8 3.2 1.9 13.2 1 6.2-.4 18-.9 26.4-1 17 0 16.4.3 17.5-9.8.8-7.5 3.4-10.2 26-27.5 16.5-12.6 22-18.4 29-31 6-10.7 8-12.7 30-30.2 8.3-6.6 22.5-19.6 31.7-29 9-9.3 17-17 17.6-17s2.5 2 4.2 4.2 6.7 8.2 11 13.2c4.4 5 11.7 14.1 16.2 20.3s12.4 15.6 17.4 20.8c6.1 6.4 10.8 12.6 14 18.9 2.9 5.3 10.5 16 17.8 24.7 8.8 10.7 13.4 17.3 15 21.6 1.2 3.4 2.9 7.3 3.5 8.7.8 1.5 1 4.8.6 8.6-1 8.2.1 9 11.6 8.3 13.2-.7 15.2-3.4 8.8-12.2-2-2.7-4.2-7-5-9.7s-2.9-7-4.7-9.6-4.2-7.6-5.2-11c-8.9-27.1-16.1-41.5-28.8-57-10.7-13-11.7-15-22.4-41.9-5-12.6-11-26.5-13.1-30.9-12-24-28-37.3-52.7-44.5-14-4-15.2-4.5-29.2-13.1-5.6-3.5-16.7-9.4-24.7-13.2-8-3.9-15.9-8.3-17.3-10l-2.7-2.9-.4-37.6c-.3-28-.8-40.6-2.2-49.2-1-6.4-1.8-15.4-1.8-20 .5-35.3.5-35-2-37.6-1.2-1.4-2.3-3-2.3-3.7 0-1.2-4.8-4.8-6.5-4.8-.5 0-2 1.1-3.3 2.5M187 282c-6.7 2.3-7 3.2-7.7 18.6-1.1 28.6-6.1 55.9-14.1 77.5-4 10.6-6.2 28-3.3 25 7.7-7.8 25.5-30.9 30-38.7 3.1-5.4 7.2-11.5 9.1-13.7s6.7-8.8 10.6-14.8 12-16.6 18-23.5c11.5-13.4 12-14.6 8.6-19.4-4.3-6-14.8-9.6-28.2-9.7-6.5 0-13.5-.7-15.7-1.4l-4-1.2z" />
      </g>
    </svg>
  );
}

export default ParivrttaTrikonasana;
