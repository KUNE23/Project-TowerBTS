<template>
  <span class="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium" :class="toneClass">
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full" :class="dotClass" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: "gray",
  },
  dot: {
    type: Boolean,
    default: false,
  },
});

const toneClass = computed(() => {
  const tones = {
    purple: "bg-purple/12 text-purple",
    green: "bg-green/10 text-[#008f18]",
    yellow: "bg-yellow/15 text-[#8a5a00]",
    red: "bg-red/10 text-red",
    blue: "bg-blueInfo/10 text-blueInfo",
    gray: "bg-[#f2f2f2] text-body",
  };

  return tones[props.tone] || tones.gray;
});

const dotClass = computed(() => {
  const dots = {
    purple: "bg-purple",
    green: "bg-green",
    yellow: "bg-yellow",
    red: "bg-red",
    blue: "bg-blueInfo",
    gray: "bg-mute",
  };

  return dots[props.tone] || dots.gray;
});
</script>
