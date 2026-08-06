/**
 * UtthitaTrikonasana - Extended Triangle Pose (Utthita Trikonasana).
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

function UtthitaTrikonasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Extended Triangle Pose pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M186 53.7c-1.8 1.9-2.6 4.8-3.2 10.7-.7 7.7-1 8-2.5 5.8-5.3-7.6-3.8 10 1.6 18.3 4.3 6.8 4.7 11.5 2.5 34.5-.8 8.6-.9 15.4-.2 20 1.7 11.1-1 35-4.8 44.2-2.6 6-3 8.9-3 16.6 0 10.6-2.5 16.3-7.6 16.8-5.2.6-6.3-1-4.6-7.5 1.7-6.8 1.4-7.4-6.5-11.3-3.7-1.9-5.9-3.7-6.3-5.5-.6-2.1-1.1-2.4-3.2-1.7-2.4.8-4 .8-19.2.2-6.5-.3-7.7 0-12 3-11.2 8-14.6 25-7.2 35.6 6.7 9.5 18.7 12.5 32.5 8.2 6.9-2.2 11-.7 15.6 5.4 2.6 3.5 2 12-2 27-2 7.3-2 8.2-.2 16.4 2.8 12.9 2.6 36-.4 45.3-1.4 4.5-2.7 13.2-3.4 23.5-1.6 22-3.4 30.3-8 35.9-4.1 5.2-9 16.6-7.5 17.5.6.4 1.8.4 2.8 0 1.5-.5 1.7 0 1.2 2.6l-1.5 9c-.7 5.2-1.2 6.1-6 9.5-9.2 6.8-20.8 12.9-27.5 14.6-8.6 2.3-10 3.6-6.3 6.6 2.6 2.1 3.6 2.2 13 1.4 5.5-.5 17-1 25.4-1 8.5 0 15.8-.4 16.2-1 .5-.4 1.3-4 1.7-7.8.8-6.7 1.1-7.2 7.9-13.6 3.8-3.6 12.6-10.7 19.5-15.8 15-11.2 21.3-18 27.4-29.5 5.3-10.2 8.5-13.5 31.1-31.5 9.8-7.8 23.4-20.2 32.3-29.5 9.5-9.8 16.1-15.8 17-15.4 1 .3 3 2.5 4.8 4.9l11 13.3c4.4 5 11.5 13.8 15.8 19.6 4.2 6 11.9 15 16.9 20.3 6.1 6.4 10.8 12.7 14.3 19 5 9.1 8.1 13.5 23.5 32.2 8.8 10.7 13.9 23 12.9 31.4-1 8.1.2 8.9 11.7 8.1 13.8-1 15-3 7.8-13.6-2.4-3.6-4.5-7.7-4.5-9.1s-1.6-4.7-3.5-7.4c-2-2.7-6-11.5-8.8-19.6-10.6-29.4-13.5-34.8-28.3-52.6-7.8-9.3-10-13.5-20.1-39-17-42.7-24.1-53.3-43.2-65.5-8.4-5.3-12.2-6.8-27.7-11.4-6.6-2-13.5-5.2-21.9-10.3-6.7-4.2-18.8-10.7-26.9-14.5s-15.8-8.3-17.3-10l-2.8-3-.3-36.8c-.2-29.7-.7-39.9-2.6-52.8-2.5-18.1-2.7-22.8-1.1-28.4 1.8-6 .1-23.4-2.5-26-1-1.1-2-2.8-2-3.6 0-1.5-4.6-5.2-6.5-5.2-.6 0-2 1.1-3.4 2.5m1.4 228c-6.3 1.8-7.1 3.8-7.6 18-1 26.1-5.5 52-13.4 75.2-3 8.8-4.6 15.8-5 22l-.7 8.9 5-6.2c2.6-3.4 9-11 14-17.1 5.2-6 11-14.3 13-18.4s5.6-9.6 7.8-12.1c2.2-2.6 7.3-9.7 11.3-15.9s12.3-16.9 18.2-23.8c6-7 10.8-13.7 10.8-14.9 0-7.2-17-15.5-29.7-14.3-5.9.5-10 .1-18.6-2-1-.2-3.2 0-5.1.6" />
      </g>
    </svg>
  );
}

export default UtthitaTrikonasana;
