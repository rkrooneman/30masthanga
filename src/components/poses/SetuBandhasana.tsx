/**
 * SetuBandhasana - Bridge Pose (Primary Series variant) (Setu Bandhasana).
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

function SetuBandhasana({ size = 120, className }: PoseIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Bridge Pose (Primary Series variant) pose"
    >
      <path fill="currentColor" fillRule="evenodd" d="M260 135c-2.8.2-7.9.4-11.4.4-12.5.2-23 2.3-42 8.4-6 2-16.4 5-23 6.6-22.2 5.5-25.3 7.2-39 20.5-9.3 9-10.6 10-18 13-10.5 4-16.7 10.3-20.3 20.2-2.2 6.2-2.8 16.4-1.6 32 1 13.3.4 16-4.7 23.4l-7.4 11.3c-5.5 9-5.3 8.8-16.8 8.3l-9.5-.4-2 2.1c-2 2-2.2 2.4-2.2 5.8 0 3.1-.3 4.1-1.5 5.8-1.3 1.7-1.5 2.2-.9 3.3s.5 1.5-.6 2.7c-1 1-1.2 1.8-1 3l.8 3c.3 1.2 0 1.6-1.6 2.5-6 3.3-6.1 4.3-.8 12.4l4 6 .1 8.4c0 9.6.9 12.7 5.2 19.2 1.3 1.9 2.3 3.7 2.3 4 0 3.2 5.1 8.3 11.6 11.6 14.6 7.3 34.5 6.7 46-1.5l1.8-1.2 1.9 2.1c3.2 3.7 6 4.8 11.9 4.8 4.4 0 5.5-.2 8.3-1.7 10.3-5.4 16-17.5 13-27.7-2.2-7.6-8-12.1-14.3-11.5l-3.1.3.2-4.4c.4-9-3-17.2-10.5-25.2-4.8-5.2-5.4-6.7-4.4-10.5 1-4 4.1-6.5 10.2-8.6 18.5-6.3 30-16.6 40.8-36.5 4.2-7.7 4.3-8 14.3-20.5 14.4-18.1 20.7-23 30.1-23.6 5.8-.3 8 .6 15.5 6.7 11.2 9 19.8 12 34 12 9.7 0 14.3-1.2 25.7-6.2 11.1-4.9 12.1-5 25.1-2.7 21 3.5 30 3.9 53.8 2 11.4-.8 17.6-.2 20.2 2.1l1.4 1.3-3.6 6.3c-4.6 7.8-9 17.3-11 23.9-2.7 8.4-3.4 13.6-5.5 39.5-1 13-4 33.6-6 43.4-1.5 6.4-2.4 9.4-7.7 24.3-3 8.5-2.8 13.5.9 16.8 2.6 2.3 5.2 2.8 20.3 3.3 8.1.3 18.2.9 22.5 1.4 10.4 1.2 24 1.3 34.5.2 10.3-1 14.8-9.7 5.6-10.8-6.4-.8-34.7-13.7-42.4-19.3-5.5-4-6.4-12.9-2.6-26.7 3-11.2 4.9-16.5 12.5-34.5 8.4-19.9 10.3-24.9 15.1-40.3 2.2-6.9 4.8-14.3 5.8-16.6 4-8.7 7-23.7 6.5-31.8-.4-5.7-2.5-9.7-8-15.2-5.2-5.3-10.8-8-34.8-17.7-36.1-14.3-55.8-19.6-87.3-23.4-10.2-1.2-18.2-2.5-24-4-9.5-2.2-21-3-32.3-1.9m126.8 85.2c-9.8 15.3-13.3 26.6-14.7 47-2.5 38-4.7 51.5-11.3 69.5-4.4 11.9-4.2 17.8 1 21 2.5 1.5 2.5 1.6 5.5-6.7 7-19.2 10.6-39 13-71.2 1.8-25.8 4.8-36.9 14.6-54 2-3.3 3.6-6.5 3.6-7 0-1-2.4-1.9-6.4-2.5l-2.6-.3zm19.3 116.7c-.6.7 1.4 5.9 3 7.5 2.4 2.6 21.4 12.6 25 13.3 6 1.1 10.6-.8 10.6-4.4 0-2.1-1.4-3.1-4.5-3.3-5.1-.3-14.6-3.8-26.8-9.9-3.8-2-7.1-3.3-7.3-3.2" />
    </svg>
  );
}

export default SetuBandhasana;
