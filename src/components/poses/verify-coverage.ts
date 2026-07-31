/**
 * Pose-icon coverage check.
 *
 * Run with:  npx tsx src/components/poses/verify-coverage.ts
 *
 * Cross-checks the icon registry (`poseIcons`) against the pose catalog and
 * reports:
 *   - total catalog poses vs total registry entries,
 *   - MISSING: catalog ids with NO icon (the gap list — expect `utkatasana`),
 *   - ORPHAN: registry ids not present in the catalog.
 *
 * This is a report tool: it ALWAYS exits 0. A non-empty MISSING/ORPHAN list is
 * printed clearly so a human can act, but it does not fail the build.
 */

import { poses } from '../../data/poses';
import { poseIcons } from './registry';

const catalogIds = poses.map((p) => p.id);
const catalogIdSet = new Set(catalogIds);
const registryIds = Object.keys(poseIcons);
const registryIdSet = new Set(registryIds);

// Catalog poses with no icon in the registry.
const missing = catalogIds.filter((id) => !registryIdSet.has(id));

// Registry entries that don't correspond to a catalog pose.
const orphan = registryIds.filter((id) => !catalogIdSet.has(id));

console.log('=== Pose-icon coverage ===\n');
console.log(`Total catalog poses:   ${catalogIds.length}`);
console.log(`Total registry entries: ${registryIds.length}`);
console.log(
  `Icons present:          ${catalogIds.length - missing.length} of ${catalogIds.length}`,
);

console.log(
  `\nMISSING: [${missing.join(', ')}]` +
    (missing.length === 0 ? '  (none — full coverage)' : ''),
);
console.log(
  `ORPHAN: [${orphan.join(', ')}]` +
    (orphan.length === 0 ? '  (none)' : ''),
);

// Always succeed — this is a review/report tool, not a gate.
process.exit(0);
