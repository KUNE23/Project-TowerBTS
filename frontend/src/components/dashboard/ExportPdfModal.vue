<template>
  <BaseModal :open="open" title="Export Laporan Sensor" size="md" @close="$emit('close')">
    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="form.startDate" label="Tanggal Mulai" type="date" />
        <BaseInput v-model="form.endDate" label="Tanggal Akhir" type="date" />
      </div>
      <BaseInput v-model="form.deviceId" label="Device" type="select" :options="deviceOptions" />
      <BaseInput v-model="form.dataType" label="Jenis Data" type="select" :options="dataTypeOptions" />
      <div class="rounded-sm border border-dashed border-hairline bg-[#fbfafa] p-4 text-sm leading-6 text-body">
        Laporan akan berisi ringkasan sensor, grafik, riwayat data, dan alert terbaru.
      </div>
      <p v-if="error" class="text-sm text-red">{{ error }}</p>
    </form>

    <template #footer>
      <BaseButton label="Cancel" variant="secondary" @click="$emit('close')" />
      <BaseButton label="Export PDF" :loading="loading" :disabled="!form.deviceId" @click="submit">
        <template #icon>
          <Download class="h-4 w-4" />
        </template>
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { Download } from "lucide-vue-next";
import BaseButton from "../common/BaseButton.vue";
import BaseInput from "../common/BaseInput.vue";
import BaseModal from "../common/BaseModal.vue";
import { exportSensorReport } from "../../services/dashboardService.js";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  device: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "exported"]);
const loading = ref(false);
const error = ref("");

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const today = new Date();
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(today.getDate() - 6);

const form = reactive({
  startDate: toDateInput(sevenDaysAgo),
  endDate: toDateInput(today),
  deviceId: props.device?.id || "",
  dataType: "all",
});

const deviceOptions = computed(() => [
  {
    label: props.device?.code && props.device?.id ? props.device.code : "Device aktif belum tersedia",
    value: props.device?.id || "",
  },
]);

const dataTypeOptions = [
  { label: "Semua Sensor", value: "all" },
  { label: "Suhu", value: "temperature" },
  { label: "Fan", value: "fan" },
  { label: "Kabel", value: "cable" },
  { label: "Pintu", value: "door" },
];

const getFilename = (disposition) => {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || `btsense-report-${form.startDate}-${form.endDate}.pdf`;
};

const downloadBlob = (response) => {
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = getFilename(response.headers?.["content-disposition"]);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const submit = async () => {
  if (!form.deviceId) {
    error.value = "Device aktif belum tersedia. Tunggu data dashboard masuk lalu coba lagi.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await exportSensorReport({
      device_id: form.deviceId,
      start_date: form.startDate,
      end_date: form.endDate,
      type: form.dataType,
    });

    downloadBlob(response);
    emit("exported");
    emit("close");
  } catch (err) {
    error.value = err.message || "Gagal export PDF.";
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.device?.id,
  (deviceId) => {
    form.deviceId = deviceId || "";
  },
  { immediate: true },
);
</script>
