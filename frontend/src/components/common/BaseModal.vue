<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <section class="w-full rounded-md border border-hairline bg-white shadow-sm" :class="widthClass">
        <header class="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 class="text-lg font-semibold text-primary">{{ title }}</h2>
          <button class="rounded-sm p-1 text-body hover:bg-[#f2f2f2]" type="button" @click="$emit('close')">
            <X class="h-5 w-5" />
          </button>
        </header>
        <div class="px-6 py-6">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="flex justify-end gap-3 border-t border-hairline bg-[#fbfafa] px-6 py-4">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "md",
  },
});

defineEmits(["close"]);

const widthClass = computed(() => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
  };

  return sizes[props.size] || sizes.md;
});
</script>
