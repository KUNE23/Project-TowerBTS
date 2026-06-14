<template>
  <main class="min-h-screen bg-[#f4f7fa] text-primary">
    <AppNavbar
      :user="auth.state.user"
      :initials="auth.initials.value"
      :is-supervisor="auth.isSupervisor.value"
      @export="openExport"
      @edit-profile="showProfileModal = true"
      @logout="handleLogout"
    />

    <AlertToast :toasts="dashboard.state.toasts" />

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.12em] text-body">Live Monitoring</p>
          <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-primary sm:text-3xl">Dashboard Sensor BTS</h1>
          <p class="mt-2 text-base text-body">Pantau suhu, fan, kabel, dan pintu secara realtime.</p>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <span class="border border-hairline bg-[#fbfafa] px-2 py-1 text-xs text-body">
              Device: {{ dashboard.state.device.code }}
            </span>
            <StatusBadge label="System Online" tone="purple" dot />
            <span class="text-sm text-body">Last update: {{ dashboard.latestUpdate.value }}</span>
          </div>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SensorCard
          v-for="card in sensorCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :status="card.status"
          :icon="card.icon"
          :icon-class="card.iconClass"
        />
      </section>

      <section class="mt-8 grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Grafik Suhu Realtime" type="line" :points="dashboard.state.temperatureHistory" />
        <ChartPanel title="Grafik RPM Fan" type="bar" :points="dashboard.state.rpmHistory" />
      </section>

      <section class="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
        <SensorStatusTable :rows="dashboard.state.sensorRows" />
        <AlertPanel :alerts="dashboard.state.alerts" />
      </section>
    </div>

    <footer class="border-t border-hairline bg-[#fbfafa]">
      <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-body sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span class="font-semibold text-primary">BTSense</span>
        <span>© 2024 BTSense IoT Infrastructure. All rights reserved.</span>
      </div>
    </footer>

    <ExportPdfModal
      v-if="auth.isSupervisor.value"
      :open="showExportModal"
      @close="showExportModal = false"
      @exported="handleExported"
    />
    <EditProfileModal
      :open="showProfileModal"
      :user="auth.state.user"
      :initials="auth.initials.value"
      @close="showProfileModal = false"
    />
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, markRaw, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Cable, DoorClosed, Fan, Gauge, Thermometer } from "lucide-vue-next";
import AlertPanel from "../components/dashboard/AlertPanel.vue";
import AlertToast from "../components/dashboard/AlertToast.vue";
import AppNavbar from "../components/common/AppNavbar.vue";
import ChartPanel from "../components/dashboard/ChartPanel.vue";
import SensorCard from "../components/dashboard/SensorCard.vue";
import SensorStatusTable from "../components/dashboard/SensorStatusTable.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import { connectSocket, onAlertNew, onDeviceStatus, onSensorNew } from "../services/socket.js";
import { useAuthStore } from "../stores/authStore.js";
import { useDashboardStore } from "../stores/dashboardStore.js";
import { compactNumber } from "../utils/formatters.js";
import { getStatusLabel } from "../utils/status.js";

const ExportPdfModal = defineAsyncComponent(() => import("../components/dashboard/ExportPdfModal.vue"));
const EditProfileModal = defineAsyncComponent(() => import("../components/profile/EditProfileModal.vue"));

const router = useRouter();
const auth = useAuthStore();
const dashboard = useDashboardStore();
const showExportModal = ref(false);
const showProfileModal = ref(false);
let cleanupSocket = [];

const sensorCards = computed(() => {
  const summary = dashboard.state.sensorSummary;

  return [
    {
      title: "Suhu Rak",
      value: `${summary.temperature.value}${summary.temperature.unit}`,
      status: getStatusLabel(summary.temperature.status),
      icon: markRaw(Thermometer),
      iconClass: "text-purple",
    },
    {
      title: "Status Fan",
      value: getStatusLabel(summary.fan.status),
      status: "Normal",
      icon: markRaw(Fan),
      iconClass: "text-mute",
    },
    {
      title: "RPM Fan",
      value: `${compactNumber(summary.fan.rpm)} RPM`,
      status: getStatusLabel(summary.fan.rpmStatus),
      icon: markRaw(Gauge),
      iconClass: "text-purple",
    },
    {
      title: "Status Kabel",
      value: getStatusLabel(summary.cable.status),
      status: "Aman",
      icon: markRaw(Cable),
      iconClass: "text-mute",
    },
    {
      title: "Status Pintu",
      value: getStatusLabel(summary.door.status),
      status: "Aman",
      icon: markRaw(DoorClosed),
      iconClass: "text-purple",
    },
  ];
});

const openExport = () => {
  if (auth.isSupervisor.value) {
    showExportModal.value = true;
  }
};

const handleExported = () => {
  dashboard.addAlert({
    title: "Export PDF",
    message: "Laporan sensor berhasil disiapkan.",
    severity: "info",
    type: "report",
  });
};

const handleLogout = async () => {
  await auth.logout();
  router.push("/login");
};

onMounted(() => {
  dashboard.loadDashboard();
  connectSocket();

  cleanupSocket = [
    onSensorNew(dashboard.applySensorPayload),
    onAlertNew(dashboard.addAlert),
    onDeviceStatus((payload) => {
      dashboard.state.device.status = payload.status || dashboard.state.device.status;
    }),
  ];
});

onUnmounted(() => {
  cleanupSocket.forEach((cleanup) => cleanup());
});
</script>
