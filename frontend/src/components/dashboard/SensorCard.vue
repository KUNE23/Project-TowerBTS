<template>
  <article class="rounded-md border border-hairline bg-[#fffafa] p-4 shadow-sm">
    <div class="mb-6 flex items-start justify-between gap-3">
      <p class="text-sm font-medium text-body">{{ title }}</p>
      <component :is="icon" class="h-5 w-5" :class="iconClass" />
    </div>
    <p class="text-2xl font-semibold tracking-[-0.02em] text-primary">{{ value }}</p>
    <p class="mt-2 text-sm text-purple">{{ status }}</p>
  </article>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
  iconClass: {
    type: String,
    default: "text-purple",
  },
});
</script>
