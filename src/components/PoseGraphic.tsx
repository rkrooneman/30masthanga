/**
 * PoseGraphic — resolve a pose id to its stick-figure icon, with a fallback.
 *
 * Looks the pose up in the icon registry ({@link getPoseIcon}) and renders the
 * matching component. The registry has full catalog coverage, so the fallback
 * should never trigger in practice — but if an id is ever missing, we render the
 * neutral {@link PosePlaceholder} rather than nothing.
 *
 * The icons draw with `stroke="currentColor"`, so their colour is controlled by
 * the CSS `color` of an ancestor (e.g. `.pose-card__graphic`). This component
 * stays presentation-agnostic and passes `size`/`className` straight through.
 */

import { getPoseIcon } from './poses/registry';
import PosePlaceholder from './PosePlaceholder';

interface PoseGraphicProps {
  /** Catalog pose id used to look up the icon. */
  poseId: string;
  /** English name of the pose (used for the fallback placeholder). */
  name: string;
  /** Optional pose category (used for the fallback placeholder). */
  category?: string;
  /** Pixel size of the icon. */
  size?: number;
  /** Optional class for positioning/animation by the caller. */
  className?: string;
}

function PoseGraphic({
  poseId,
  name,
  category,
  size,
  className,
}: PoseGraphicProps) {
  const Icon = getPoseIcon(poseId);

  if (Icon) {
    return <Icon size={size} className={className} />;
  }

  return <PosePlaceholder name={name} category={category} size={size} />;
}

export default PoseGraphic;
