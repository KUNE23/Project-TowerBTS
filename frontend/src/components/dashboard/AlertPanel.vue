<template>
  <section class="rounded-md border border-hairline bg-[#fffafa] p-4 shadow-sm">
    <div class="mb-4 border-b border-hairline pb-3">
      <h2 class="text-sm font-semibold text-primary">Alert Terbaru</h2>
    </div>
    <div class="space-y-2">
      <article v-for="alert in alerts" :key="alert.id" class="border p-3" :class="alertClass(alert.severity)">
        <div class="mb-1 flex items-start justify-between gap-3">
          <div class="flex items-center gap-1.5">
            <CircleAlert v-if="alert.severity !== 'info'" class="h-4 w-4" />
            <Info v-else class="h-4 w-4" />
            <span class="text-xs font-semibold uppercase tracking-[0.08em]">{{ getSeverityLabel(alert.severity) }}</span>
          </div>
          <span class="text-xs text-body">{{ alert.createdAt }}</span>
        </div>
        <h3 class="text-sm font-semibold text-primary">{{ alert.title }}</h3>
        <p class="mt-1 text-sm leading-5 text-body">{{ alert.message }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { CircleAlert, Info } from "lucide-vue-next";
import { getSeverityLabel } from "../../utils/status.js";

defineProps({
  alerts: {
    type: Array,
    default: () => [],
  },
});

const alertClass = (severity) => {
  const classes = {
    critical: "border-red/25 bg-red/5 text-red",
    warning: "border-yellow/40 bg-yellow/5 text-purple",
    info: "border-hairline bg-white text-primary",
  };

  return classes[severity] || classes.info;
};
</script>
