/**
 * Pose-icon registry — maps every catalog pose `id` to its stick-figure icon
 * component, so screens can look an icon up by id without importing each one.
 *
 * The icon components all share the same shape: a default export taking
 * `{ size?, className? }` and drawing with `stroke="currentColor"` (the caller
 * sets the colour via CSS `color`). See any component (e.g. SuryaNamaskaraA.tsx)
 * or PosePilot.tsx for the shared drawing conventions.
 *
 * === coverage / gaps ===
 * The registry is built ONLY from icon components that actually exist. One
 * catalog pose currently has NO dedicated icon:
 *   - `utkatasana` (Fierce / Chair Pose) — there is no Utkatasana.tsx. Surya
 *     Namaskara B was drawn with a chair emblem, but utkatasana is its own pose,
 *     so we deliberately do NOT reuse SuryaNamaskaraB for it. It is simply
 *     omitted here; `getPoseIcon('utkatasana')` returns undefined and callers
 *     should render a "no icon" placeholder. Drop an `Utkatasana.tsx` in and add
 *     the mapping below to close the gap.
 *
 * `AdhoMukhaSvanasana.tsx` also exists (a pilot sample) but Down Dog is not a
 * catalog pose id, so it is intentionally not referenced here.
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
 * Map of catalog pose `id` → icon component. Keys are the snake_case pose ids
 * from `src/data/poses.ts`. Poses without an icon (currently `utkatasana`) are
 * absent; look them up with {@link getPoseIcon}, which returns undefined.
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
 * Look up the icon component for a pose id. Returns undefined when the pose has
 * no dedicated icon (e.g. `utkatasana`), so callers can render a placeholder.
 */
export function getPoseIcon(id: string): PoseIconComponent | undefined {
  return poseIcons[id];
}
