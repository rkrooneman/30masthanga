import type { Pose, PoseCategory } from '../types/pose';

const SECTION_LABELS: Record<PoseCategory, string> = {
  sun_a: 'Sun Salutations',
  sun_b: 'Sun Salutations',
  standing: 'Standing',
  seated: 'Seated',
  closing: 'Closing',
  finishing: 'Rest',
};

const TEACHER_GUIDANCE_POSE_IDS = new Set([
  'marichyasana_d',
  'bhujapidasana',
  'kurmasana',
  'supta_kurmasana',
  'garbha_pindasana',
  'kukkutasana',
  'urdhva_dhanurasana',
  'sirsasana',
  'baddha_padmasana',
  'utpluthih',
]);

function formatBreaths(breaths: number): string {
  return Number.isInteger(breaths) ? `${breaths}` : `${breaths}`;
}

export function sectionLabelForPose(pose: Pose): string {
  return SECTION_LABELS[pose.category];
}

export function formatPoseDurationContext(pose: Pose): string {
  const breaths = formatBreaths(pose.breaths);

  if (pose.flow && pose.repeat > 1) {
    return `${pose.repeat} rounds, about ${breaths} breaths each`;
  }

  if (pose.flow) {
    return `Flow sequence, about ${breaths} breaths`;
  }

  if (pose.repeat > 1) {
    return `${pose.repeat} rounds, ${breaths} breaths each`;
  }

  if (pose.sides === 2) {
    return `${breaths} breaths per side`;
  }

  return `${breaths} breaths`;
}

export function posePracticeNote(pose: Pose): string | null {
  if (TEACHER_GUIDANCE_POSE_IDS.has(pose.id) || pose.isAdvanced) {
    return 'Best learned with teacher guidance.';
  }

  if (pose.group === 'backbend') {
    return 'Warm up gradually and keep the breath steady.';
  }

  if (pose.category === 'sun_a' || pose.category === 'sun_b') {
    return 'Use the flow to settle into a steady breath rhythm.';
  }

  if (pose.id === 'savasana') {
    return 'Let the body rest and the breath become natural.';
  }

  return null;
}
