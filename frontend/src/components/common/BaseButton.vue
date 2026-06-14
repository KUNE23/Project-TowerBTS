<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex h-9 items-center justify-center gap-2 rounded-sm px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
    :class="variantClass"
  >
    <slot name="icon" />
    <span>{{ loading ? loadingText : label }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: "Memproses...",
  },
});

const variantClass = computed(() => {
  const variants = {
    primary: "bg-primary text-white hover:bg-body",
    secondary: "border border-hairline bg-white text-primary hover:bg-[#f6f6f6]",
    ghost: "bg-transparent text-primary hover:bg-[#f6f6f6]",
  };

  return variants[props.variant] || variants.primary;
});
</script>
