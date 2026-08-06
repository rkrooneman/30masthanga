/**
 * Purvottanasana - Upward Plank / Intense East Stretch (Purvottanasana).
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

function Purvottanasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Upward Plank / Intense East Stretch pose"
    >
      <g transform="translate(512,0) scale(-1,1)">
        <path fill="currentColor" fillRule="evenodd" d="M419.2 144c-3.4 2-4.5 2.2-8.7 1.1-7.3-1.8-8.4-1.6-8.4 1.6 0 1.6-.6 2.9-1.3 2.9s-4 2-7.4 4.5c-6.7 5-7 6.8-2.5 14.2 2.9 4.6 2.7 6.2-1.4 11.8s-11.4 9.4-17 8.7c-2.2-.3-10.3-.9-18.2-1.3-17.1-1-22 .6-28 9-2.7 3.7-5.2 5.6-10 7.6-12.9 5.1-42.4 20.4-51.2 26.4-4.9 3.3-14 8.5-20.1 11.5-14.2 7-30.7 18-45.4 30.3-6.3 5.2-14.2 11.4-17.6 13.6-3.4 2.3-8.8 7-12 10.7-3.7 4.2-9.3 8.7-15.3 12.2l-22 13.6c-6.8 4.3-21 11.9-31.7 16.7s-23 10.8-27.8 13.3c-4.6 2.5-10.9 5-13.8 5.3-6.5 1-8.2 3.9-4.4 7.7 2.3 2.3 3.6 2.4 20.8 2.5 10.2 0 21.8.5 25.9 1 7.3.9 7.5.8 9.9-2.2 1.4-1.7 2.5-4.1 2.5-5.3 0-6 3-7.4 32.3-15.7 16.5-4.7 24.1-8.6 35.7-18.3 13-10.8 16.8-12.8 34.3-18.5 8.3-2.7 19.9-7 25.8-9.8 10.6-4.8 11-4.9 23.8-5 19.5 0 27.9-4.8 37.4-21 8-13.4 13.7-16.8 33-19.7 6.5-1 15.5-2.5 20.1-3.5s9-1.7 10-1.7c1.3 0 1.6 4.5 1.6 28.8 0 23.2.4 32 2.3 44.8 1.3 8.7 2.2 18.8 2 22.4l-.4 6.6-7.4 1.4c-17.3 3.3-25.5 5.6-25.8 7.4-.4 2.3 5.9 3.7 11.5 2.7 6.1-1.2 9 .6 3.5 2-5 1.5-5.9 4.2-1.6 5.3 8.4 2.4 42.7.5 44.2-2.4 3.5-6.4 4.7-38.1 2.3-60.2-1.6-14.1 0-30.6 5.7-59.4 1.6-8.4 2.1-15.2 2-26.9-.3-21.5 0-22 15.8-21.4 13.2.4 19.4-1.6 26.6-8.6 12-11.7 9.3-34-5.4-44.5-7.1-5.2-18-6.2-24.2-2.3m-35 210.3c0 1.9.2 2.5.5 1.4.3-1 .3-2.6 0-3.4s-.6.2-.6 2" />
      </g>
    </svg>
  );
}

export default Purvottanasana;
