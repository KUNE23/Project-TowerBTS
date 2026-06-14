<template>
  <BaseModal :open="open" title="Edit Profile" size="lg" @close="$emit('close')">
    <form class="space-y-6" @submit.prevent="submit">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 items-center justify-center rounded-md border border-hairline bg-[#eef3f4] text-lg font-semibold">
          {{ initials }}
        </div>
        <div>
          <p class="text-sm font-semibold text-primary">Foto Profile</p>
          <p class="mt-1 text-sm text-body">JPG, GIF or PNG. Max 2MB.</p>
          <button class="mt-2 text-sm font-medium text-purple" type="button">Upload Baru</button>
        </div>
      </div>

      <div class="border-t border-dashed border-hairline pt-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.name" label="Nama Lengkap" />
          <BaseInput v-model="form.role" label="Role" readonly />
        </div>
        <div class="mt-4 grid gap-4">
          <BaseInput v-model="form.email" label="Email" type="email" />
          <BaseInput v-model="form.phone" label="Nomor HP" />
        </div>
      </div>

      <div class="border-t border-dashed border-hairline pt-6">
        <h3 class="mb-4 text-sm font-semibold text-primary">Keamanan Akun</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.oldPassword" label="Password Lama" type="password" />
          <BaseInput v-model="form.newPassword" label="Password Baru" type="password" />
        </div>
      </div>
    </form>

    <template #footer>
      <BaseButton label="Cancel" variant="secondary" @click="$emit('close')" />
      <BaseButton label="Simpan Perubahan" :loading="loading" @click="submit" />
    </template>
  </BaseModal>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import BaseButton from "../common/BaseButton.vue";
import BaseInput from "../common/BaseInput.vue";
import BaseModal from "../common/BaseModal.vue";
import { useAuthStore } from "../../stores/authStore.js";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    required: true,
  },
  initials: {
    type: String,
    default: "SP",
  },
});

const emit = defineEmits(["close", "saved"]);
const auth = useAuthStore();
const loading = ref(false);

const form = reactive({
  name: "",
  email: "",
  phone: "",
  role: "",
  oldPassword: "",
  newPassword: "",
});

const syncForm = () => {
  form.name = props.user.name || "";
  form.email = props.user.email || "";
  form.phone = props.user.phone || "";
  form.role = props.user.role || "";
  form.oldPassword = "";
  form.newPassword = "";
};

watch(() => props.open, syncForm, { immediate: true });

const submit = async () => {
  loading.value = true;

  try {
    const result = await auth.updateProfile({ ...form });
    emit("saved", result);
    emit("close");
  } finally {
    loading.value = false;
  }
};
</script>
