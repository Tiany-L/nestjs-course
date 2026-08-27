<script setup lang="ts">
import {
  ArrowRight,
  Boxes,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Cloud,
  Code2,
  Database,
  FlaskConical,
  KeyRound,
  Rocket,
  ShieldCheck,
  UserRound,
  Workflow,
} from '@lucide/vue';

type IconName =
  | 'arrow-right'
  | 'boxes'
  | 'briefcase'
  | 'chart'
  | 'cloud'
  | 'code'
  | 'database'
  | 'flask'
  | 'key'
  | 'rocket'
  | 'shield'
  | 'user'
  | 'workflow';

withDefaults(
  defineProps<{
    name: IconName;
    size?: number;
  }>(),
  { size: 22 },
);

const icons = {
  'arrow-right': ArrowRight,
  boxes: Boxes,
  briefcase: BriefcaseBusiness,
  chart: ChartNoAxesCombined,
  cloud: Cloud,
  code: Code2,
  database: Database,
  flask: FlaskConical,
  key: KeyRound,
  rocket: Rocket,
  shield: ShieldCheck,
  user: UserRound,
  workflow: Workflow,
} as const;
</script>

<template>
  <component :is="icons[name]" :size="size" :stroke-width="1.8" aria-hidden="true" />
</template>
