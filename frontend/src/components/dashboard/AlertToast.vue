<template>
  <div class="fixed right-4 top-4 z-[60] w-[calc(100%-2rem)] max-w-sm space-y-2">
    <article v-for="toast in toasts" :key="toast.id" class="rounded-md border border-hairline bg-white p-4 shadow-sm">
      <div class="mb-1 flex items-center justify-between gap-3">
        <p class="text-sm font-semibold text-primary">{{ toast.title }}</p>
        <span class="text-xs uppercase tracking-[0.08em]" :class="severityClass(toast.severity)">
          {{ toast.severity }}
        </span>
      </div>
      <p class="text-sm leading-5 text-body">{{ toast.message }}</p>
    </article>
  </div>
</template>

<script setup>
defineProps({
  toasts: {
    type: Array,
    default: () => [],
  },
});

const severityClass = (severity) => {
  const classes = {
    critical: "text-red",
    warning: "text-[#8a5a00]",
    info: "text-blueInfo",
  };

  return classes[severity] || classes.info;
};
</script>
