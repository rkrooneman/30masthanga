/**
 * Pose-icon registry - maps every catalog pose `id` to its icon component, so
 * screens can look an icon up by id without importing each one.
 *
 * The icon components all share the same shape: a default export taking
 * `{ size?, className? }` and inheriting their colour from CSS `color` via
 * `currentColor`. Two drawing styles coexist: the older stroke-based line
 * figures draw with `stroke="currentColor"`, while the newer filled silhouettes
 * (the current convention, e.g. AdhoMukhaSvanasana.tsx) draw with
 * `fill="currentColor"`. See any component or PosePilot.tsx for the shared
 * conventions.
 *
 * === coverage / gaps ===
 * The registry is built ONLY from icon components that actually exist, and it is
 * keyed by CATALOG pose `id`. Every catalog pose now has an icon: `utkatasana`
 * (Fierce / Chair Pose) is mapped to its own `Utkatasana` silhouette below (it
 * does NOT reuse SuryaNamaskaraB's chair emblem).
 *
 * Salutation / UHP FLOW positions are a separate concern: they are
 * `flow[].label` strings (not catalog ids) and most have no catalog `id`, so
 * they are not in this map. They are handled by the label-keyed lookup in
 * `flowIcons.ts` (`flowIconFor(label)`). Several silhouettes exist only to serve
 * that flow map - e.g. `AdhoMukhaSvanasana.tsx` (Down Dog) is a wired flow
 * silhouette with no catalog id, so it is intentionally absent here but IS used
 * via `flowIcons.ts`.
 *
 * Run `npx tsx src/components/poses/verify-coverage.ts` to check this registry
 * against the catalog (missing icons + orphaned entries).
 */

import type { ReactElement } from 'react';

import SuryaNamaskaraA from './SuryaNamaskaraA';
import SuryaNamaskaraB from './SuryaNamaskaraB';
import Padangusthasana from './Padangusthasana';
import Padahastasana from './Padahastasana';
import UtthitaTrikonasana from './UtthitaTrikonasana';
import ParivrttaTrikonasana from './ParivrttaTrikonasana';
import UtthitaParsvakonasana from './UtthitaParsvakonasana';
import ParivrttaParsvakonasana from './ParivrttaParsvakonasana';
import PrasaritaPadottanasanaA from './PrasaritaPadottanasanaA';
import PrasaritaPadottanasanaB from './PrasaritaPadottanasanaB';
import PrasaritaPadottanasanaC from './PrasaritaPadottanasanaC';
import PrasaritaPadottanasanaD from './PrasaritaPadottanasanaD';
import Parsvottanasana from './Parsvottanasana';
import UtthitaHastaPadangusthasana from './UtthitaHastaPadangusthasana';
import ArdhaBaddhaPadmottanasana from './ArdhaBaddhaPadmottanasana';
import Utkatasana from './Utkatasana';
import VirabhadrasanaA from './VirabhadrasanaA';
import Virabhadrasana2 from './Virabhadrasana2';
import Dandasana from './Dandasana';
import Paschimottanasana from './Paschimottanasana';
import Purvottanasana from './Purvottanasana';
import ArdhaBaddhaPadmaPaschimottanasana from './ArdhaBaddhaPadmaPaschimottanasana';
import TriangaMukhaikapadaPaschimottanasana from './TriangaMukhaikapadaPaschimottanasana';
import JanuSirsasanaA from './JanuSirsasanaA';
import JanuSirsasanaB from './JanuSirsasanaB';
import JanuSirsasanaC from './JanuSirsasanaC';
import MarichyasanaA from './MarichyasanaA';
import MarichyasanaB from './MarichyasanaB';
import MarichyasanaC from './MarichyasanaC';
import MarichyasanaD from './MarichyasanaD';
import Navasana from './Navasana';
import Bhujapidasana from './Bhujapidasana';
import Kurmasana from './Kurmasana';
import SuptaKurmasana from './SuptaKurmasana';
import GarbhaPindasana from './GarbhaPindasana';
import Kukkutasana from './Kukkutasana';
import BaddhaKonasana from './BaddhaKonasana';
import UpavisthaKonasana from './UpavisthaKonasana';
import SuptaKonasana from './SuptaKonasana';
import SuptaPadangusthasana from './SuptaPadangusthasana';
import UbhayaPadangusthasana from './UbhayaPadangusthasana';
import UrdhvaMukhaPaschimottanasana from './UrdhvaMukhaPaschimottanasana';
import SetuBandhasana from './SetuBandhasana';
import UrdhvaDhanurasana from './UrdhvaDhanurasana';
import PaschimottanasanaClosing from './PaschimottanasanaClosing';
import SalambaSarvangasana from './SalambaSarvangasana';
import Halasana from './Halasana';
import Karnapidasana from './Karnapidasana';
import UrdhvaPadmasana from './UrdhvaPadmasana';
import Pindasana from './Pindasana';
import Matsyasana from './Matsyasana';
import UttanaPadasana from './UttanaPadasana';
import Sirsasana from './Sirsasana';
import BaddhaPadmasana from './BaddhaPadmasana';
import YogaMudra from './YogaMudra';
import Padmasana from './Padmasana';
import Utpluthih from './Utpluthih';
import Savasana from './Savasana';

/**
 * Shape shared by every pose-icon component: a function taking an optional
 * pixel `size` and `className` and returning an SVG element.
 */
export type PoseIconComponent = (props: {
  size?: number;
  className?: string;
}) => ReactElement;

/**
 * Map of catalog pose `id` -> icon component. Keys are the snake_case pose ids
 * from `src/data/poses.ts`. Every catalog pose currently has an icon; look ids
 * up with {@link getPoseIcon}, which returns undefined for an unknown id.
 */
export const poseIcons: Record<string, PoseIconComponent> = {
  surya_namaskara_a: SuryaNamaskaraA,
  surya_namaskara_b: SuryaNamaskaraB,
  padangusthasana: Padangusthasana,
  padahastasana: Padahastasana,
  utthita_trikonasana: UtthitaTrikonasana,
  parivrtta_trikonasana: ParivrttaTrikonasana,
  utthita_parsvakonasana: UtthitaParsvakonasana,
  parivrtta_parsvakonasana: ParivrttaParsvakonasana,
  prasarita_padottanasana_a: PrasaritaPadottanasanaA,
  prasarita_padottanasana_b: PrasaritaPadottanasanaB,
  prasarita_padottanasana_c: PrasaritaPadottanasanaC,
  prasarita_padottanasana_d: PrasaritaPadottanasanaD,
  parsvottanasana: Parsvottanasana,
  utthita_hasta_padangusthasana: UtthitaHastaPadangusthasana,
  ardha_baddha_padmottanasana: ArdhaBaddhaPadmottanasana,
  utkatasana: Utkatasana,
  virabhadrasana_a: VirabhadrasanaA,
  virabhadrasana_b: Virabhadrasana2,
  dandasana: Dandasana,
  paschimottanasana: Paschimottanasana,
  purvottanasana: Purvottanasana,
  ardha_baddha_padma_paschimottanasana: ArdhaBaddhaPadmaPaschimottanasana,
  trianga_mukhaikapada_paschimottanasana: TriangaMukhaikapadaPaschimottanasana,
  janu_sirsasana_a: JanuSirsasanaA,
  janu_sirsasana_b: JanuSirsasanaB,
  janu_sirsasana_c: JanuSirsasanaC,
  marichyasana_a: MarichyasanaA,
  marichyasana_b: MarichyasanaB,
  marichyasana_c: MarichyasanaC,
  marichyasana_d: MarichyasanaD,
  navasana: Navasana,
  bhujapidasana: Bhujapidasana,
  kurmasana: Kurmasana,
  supta_kurmasana: SuptaKurmasana,
  garbha_pindasana: GarbhaPindasana,
  kukkutasana: Kukkutasana,
  baddha_konasana: BaddhaKonasana,
  upavistha_konasana: UpavisthaKonasana,
  supta_konasana: SuptaKonasana,
  supta_padangusthasana: SuptaPadangusthasana,
  ubhaya_padangusthasana: UbhayaPadangusthasana,
  urdhva_mukha_paschimottanasana: UrdhvaMukhaPaschimottanasana,
  setu_bandhasana: SetuBandhasana,
  urdhva_dhanurasana: UrdhvaDhanurasana,
  paschimottanasana_closing: PaschimottanasanaClosing,
  salamba_sarvangasana: SalambaSarvangasana,
  halasana: Halasana,
  karnapidasana: Karnapidasana,
  urdhva_padmasana: UrdhvaPadmasana,
  pindasana: Pindasana,
  matsyasana: Matsyasana,
  uttana_padasana: UttanaPadasana,
  sirsasana: Sirsasana,
  baddha_padmasana: BaddhaPadmasana,
  yoga_mudra: YogaMudra,
  padmasana: Padmasana,
  utpluthih: Utpluthih,
  savasana: Savasana,
};

/**
 * Look up the icon component for a catalog pose id. Returns undefined for an
 * unknown id, so callers can render a placeholder. Note: salutation / UHP flow
 * positions are not catalog ids - use `flowIconFor(label)` from `flowIcons.ts`.
 */
export function getPoseIcon(id: string): PoseIconComponent | undefined {
  return poseIcons[id];
}
