/**
 * PosePilot — pose-icon CONTACT SHEET (dev/review tool).
 *
 * Renders EVERY catalog pose in canonical Primary Series order, looking each
 * icon up in the registry (`getPoseIcon`) and drawing it in the sage accent
 * colour. Poses without an icon (currently `utkatasana`) show a muted
 * "— no icon —" placeholder so the gap is visible at a glance.
 *
 * This is a review surface, NOT part of the shipped app. It is reached only via
 * the `?pilot` query string (wired in App.tsx). Once the icon set is signed off
 * this file (and the App.tsx escape hatch) can be deleted.
 *
 * The icon components use stroke="currentColor", so colour is set purely via CSS
 * `color` — here the grid carries `color: var(--color-accent)` so all strokes
 * render sage. Layout/styles live in index.css under the `.contact-sheet*`
 * classes.
 */

import { poses } from '../../data/poses';
import type { Pose, PoseCategory } from '../../types/pose';
import { getPoseIcon } from './registry';

const ICON_SIZE = 110;

/**
 * The five review sections, in order, and which catalog categories feed each.
 * The two sun-salutation categories are merged into a single "Sun Salutations"
 * section; the rest map one-to-one.
 */
const SECTIONS: ReadonlyArray<{
  title: string;
  categories: readonly PoseCategory[];
}> = [
  { title: 'Sun Salutations', categories: ['sun_a', 'sun_b'] },
  { title: 'Standing', categories: ['standing'] },
  { title: 'Seated', categories: ['seated'] },
  { title: 'Closing', categories: ['closing'] },
  { title: 'Finishing', categories: ['finishing'] },
];

/** How many catalog poses currently have an icon in the registry. */
const iconCount = poses.filter((p) => getPoseIcon(p.id) !== undefined).length;

/** One contact-sheet cell: icon (or placeholder) + English + Sanskrit names. */
function PoseCell({ pose }: { pose: Pose }) {
  const Icon = getPoseIcon(pose.id);
  return (
    <li className="contact-sheet__cell">
      <div className="contact-sheet__figure">
        {Icon ? (
          <Icon size={ICON_SIZE} />
        ) : (
          <span className="contact-sheet__no-icon">— no icon —</span>
        )}
      </div>
      <p className="contact-sheet__english">{pose.english}</p>
      <p className="contact-sheet__sanskrit">{pose.sanskrit}</p>
    </li>
  );
}

function PosePilot() {
  return (
    <div className="contact-sheet">
      <header className="contact-sheet__header">
        <h1 className="contact-sheet__title">
          Pose icons — contact sheet ({iconCount} of {poses.length})
        </h1>
        <p className="contact-sheet__subtitle">
          Every Primary Series pose in canonical order, icons in sage. Poses
          without an icon show a placeholder.
        </p>
      </header>

      {SECTIONS.map((section) => {
        // Poses are already stored in canonical `order`, so filtering preserves
        // sequence within each section.
        const sectionPoses = poses.filter((p) =>
          section.categories.includes(p.category),
        );
        if (sectionPoses.length === 0) return null;
        return (
          <section key={section.title} className="contact-sheet__section">
            <h2 className="contact-sheet__section-title">{section.title}</h2>
            <ul className="contact-sheet__grid">
              {sectionPoses.map((pose) => (
                <PoseCell key={pose.id} pose={pose} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export default PosePilot;
