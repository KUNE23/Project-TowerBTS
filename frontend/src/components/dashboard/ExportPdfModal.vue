<template>
  <BaseModal :open="open" title="Export Laporan Sensor" size="md" @close="$emit('close')">
    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.startDate" label="Tanggal Mulai" type="date" />
        <BaseInput v-model="form.endDate" label="Tanggal Akhir" type="date" />
      </div>
      <BaseInput v-model="form.device" label="Device" type="select" :options="deviceOptions" />
      <BaseInput v-model="form.dataType" label="Jenis Data" type="select" :options="dataTypeOptions" />
      <div class="rounded-sm border border-dashed border-hairline bg-[#fbfafa] p-4 text-sm leading-6 text-body">
        Laporan akan berisi ringkasan sensor, grafik, riwayat data, dan alert terbaru.
      </div>
    </form>

    <template #footer>
      <BaseButton label="Cancel" variant="secondary" @click="$emit('close')" />
      <BaseButton label="Export PDF" :loading="loading" @click="submit">
        <template #icon>
          <Download class="h-4 w-4" />
        </template>
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { reactive, ref } from "vue";
import { Download } from "lucide-vue-next";
import BaseButton from "../common/BaseButton.vue";
import BaseInput from "../common/BaseInput.vue";
import BaseModal from "../common/BaseModal.vue";
import { exportSensorReport } from "../../services/dashboardService.js";

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "exported"]);
const loading = ref(false);

const form = reactive({
  startDate: "2024-05-01",
  endDate: "2024-05-07",
  device: "all",
  dataType: "all",
});

const deviceOptions = [
  { label: "Semua Device", value: "all" },
  { label: "BTS-DEMO-001", value: "BTS-DEMO-001" },
];

const dataTypeOptions = [
  { label: "Semua Sensor", value: "all" },
  { label: "Suhu", value: "temperature" },
  { label: "Fan", value: "fan" },
  { label: "Kabel", value: "cable" },
  { label: "Pintu", value: "door" },
];

const submit = async () => {
  loading.value = true;

  try {
    const result = await exportSensorReport({ ...form });
    emit("exported", result);
    emit("close");
  } finally {
    loading.value = false;
  }
};
</script>
