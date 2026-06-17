<template>
  <header class="border-b border-hairline bg-[#fbfafa]">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-8">
        <RouterLink to="/dashboard" class="leading-tight">
          <p class="text-2xl font-semibold tracking-[-0.02em] text-primary">BTSense</p>
          <p class="text-xs font-medium uppercase tracking-[0.14em] text-mute">Network Operations</p>
        </RouterLink>
      </div>

      <div class="flex flex-1 items-center justify-end gap-3">
        <div class="hidden h-9 w-full max-w-[220px] items-center gap-2 rounded-sm border border-hairline bg-white px-3 sm:flex">
          <Search class="h-4 w-4 text-mute" />
          <input class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-mute" placeholder="Search" />
        </div>

        <StatusBadge label="System Online" tone="purple" dot />

        <BaseButton v-if="isSupervisor" label="Export PDF" variant="secondary" @click="$emit('export')">
          <template #icon>
            <Download class="h-4 w-4" />
          </template>
        </BaseButton>

        <div class="relative">
          <button
            class="flex h-9 items-center gap-2 rounded-sm border border-hairline bg-white px-2 text-sm"
            type="button"
            @click="open = !open"
          >
            <span class="hidden text-xs font-medium sm:inline">{{ user.role }}</span>
            <span class="flex h-7 w-7 items-center justify-center rounded-sm border border-hairline bg-[#eef3f4] text-xs">
              {{ initials }}
            </span>
          </button>

          <div v-if="open" class="absolute right-0 top-11 z-20 w-44 rounded-md border border-hairline bg-white py-1 shadow-sm">
            <button class="block w-full px-3 py-2 text-left text-sm hover:bg-[#f6f6f6]" type="button" @click="selectEdit">
              Edit Profile
            </button>
            <button class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red hover:bg-[#f6f6f6]" type="button" @click="selectLogout">
              <LogOut class="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { Download, LogOut, Search } from "lucide-vue-next";
import BaseButton from "./BaseButton.vue";
import StatusBadge from "./StatusBadge.vue";

defineProps({
  user: {
    type: Object,
    required: true,
  },
  initials: {
    type: String,
    required: true,
  },
  isSupervisor: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["export", "edit-profile", "logout"]);
const open = ref(false);

const selectEdit = () => {
  open.value = false;
  emit("edit-profile");
};

const selectLogout = () => {
  open.value = false;
  emit("logout");
};
</script>
