<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-body">
      {{ label }}
    </span>
    <select
      v-if="type === 'select'"
      :value="modelValue"
      class="h-10 w-full rounded-sm border border-hairline bg-white px-3 text-sm text-body outline-none transition focus:border-primary"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      class="h-10 w-full rounded-sm border border-hairline bg-white px-3 text-sm text-body outline-none transition placeholder:text-mute focus:border-primary read-only:bg-[#f8f8f8]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:modelValue"]);
</script>
