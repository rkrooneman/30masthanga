/**
 * PrasaritaPadottanasanaB - Wide-Legged Forward Fold B (Prasarita Padottanasana B).
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

function PrasaritaPadottanasanaB({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Wide-Legged Forward Fold B pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M250.7 97.8c-25.1.8-31.2 2.3-43.2 10.9-2.2 1.5-4.5 2.5-5.2 2-1.7-1-21 16.2-24.4 21.5-1.3 2.2-12.4 13.8-24.5 25.6-20.9 20.5-40.1 42-41.8 46.6-1.3 3.7 3.6 12 16.3 28l12.2 15.3-2.5 4.9c-1.4 2.7-6.9 10.8-12.2 18.1-15.2 21-24.5 40.7-37.6 80.7-2.4 7.1-6.2 15.5-8.4 18.6s-5 8.6-6 12.2c-1.4 4.7-4.3 9.1-10 15.2-12.2 13-10.8 15.7 8.8 16.7 13.2.7 18.2-1 18.2-5.8 0-1 .9-2.4 2-3.3 1.3-1.1 2-4.1 2-8.6 0-4 1-8 2-9.5 1.2-1.5 2-4 2-5.5 0-6 11-22.5 34-51 3.5-4.4 10-15.4 14.5-24.3s10.8-19.3 14-23l6-6.7 8.6 8.2c10.6 10.3 16.7 13.4 28.7 14.6 11.5 1 25.3 5.6 29.7 9.7 6 5.5 2.6 28.7-4.1 28.7-3.5 0-7.9 19-4.8 20.8.7.5 1.6 4.3 2.1 8.6 2.5 20.7 15.3 32.6 33.1 31 14.9-1.5 25.5-13.3 27.5-30.7.5-4.5 1.5-8.5 2.1-8.9 3.2-1.9-1.3-20.8-4.9-20.8-2.7 0-7.3-11.6-7.3-18.8 0-10.4 9.9-16.5 31-19.2 14.3-1.8 20-4.5 30.7-15l8.5-8.2 6.6 7.2c4.2 4.6 9.7 13.4 14.7 23.6 5.8 11.7 11.5 20.7 20.4 31.8 16 20.1 25.2 34 26.3 40.2.5 2.7 1.7 6.1 2.7 7.6 1 1.4 1.9 5.3 1.9 8.5 0 7.4 5.5 17.4 10.3 18.6 5 1.3 24.5-.3 26.8-2.2 3.3-2.8 2.2-5.4-6.1-14.3-5.5-6-8.6-10.5-10-15-1-3.5-4-10-6.7-14.3-2.6-4.3-6.7-13.7-9-20.9-12.3-37-22-57.5-35.4-75.6-4.7-6.3-10.2-14.2-12.2-17.7l-3.7-6.3 8.4-9.8c13.5-16.2 20.2-26.3 20.3-30.7.2-5.6-10-18-41-49.3-14-14-29.9-30.3-35.5-36s-11.4-10.4-12.7-10.4c-1.4 0-5.3-2-8.6-4.2-13.4-9-21.5-10.4-54.6-9.4m-84.8 72.5c-3.7 5-10.2 15.7-14.4 23.7l-7.6 14.6 4.8 4.8c3.6 3.6 5 4.4 5.5 3 5.7-17 12.2-35.2 15.5-44.1 2.2-6.1 3.9-11.1 3.6-11.1s-3.6 4-7.4 9m177.5-2.9c1.5 3.7 6.1 16.6 10.4 28.7l7.8 22 4.5-4.7 4.6-4.6-6.3-12.6c-6.8-13.5-12.9-23.2-19.5-30.9l-4-4.7zm-36.6 53.2c2.5 13.6 5.2 22.5 8.8 28.8 3.8 6.6 4.8 7 9.7 3l4-3.2-9-15.3c-5-8.5-10.4-17.2-12.2-19.3l-3.2-4zm-101.2-4.3c-3.7 4.9-19.6 31.4-19.6 32.7 0 .5 2 2.2 4.3 3.7 5.8 3.6 7.9 1.8 12.4-11 3.2-9.3 7-27.5 6-28.5-.2-.2-1.7 1.1-3.1 3.1" />
    </svg>
  );
}

export default PrasaritaPadottanasanaB;
