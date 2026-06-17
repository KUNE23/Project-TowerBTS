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

    <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <section class="flex flex-col justify-between gap-5 mb-8 lg:flex-row lg:items-end">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.12em] text-body">Live Monitoring</p>
          <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] text-primary sm:text-3xl">Dashboard Sensor BTS</h1>
          <p class="mt-2 text-base text-body">Pantau suhu, fan, kabel, dan pintu secara realtime.</p>
          <div class="flex flex-wrap items-center gap-3 mt-5">
            <span class="border border-hairline bg-[#fbfafa] px-2 py-1 text-xs text-body">
              Device: {{ dashboard.state.device.code }}
            </span>
            <StatusBadge :label="getStatusLabel(dashboard.state.device.status)" :tone="getStatusTone(dashboard.state.device.status)" dot />
            <span class="text-sm text-body">Last update: {{ dashboard.latestUpdate.value }}</span>
          </div>
        </div>
        <button
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-primary disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="dashboard.state.loading || dashboard.state.refreshing"
          @click="refreshDashboard"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': dashboard.state.loading || dashboard.state.refreshing }" />
          Refresh
        </button>
      </section>

      <section v-if="dashboard.state.error" class="p-4 mb-5 text-sm border rounded-md border-red/25 bg-red/10 text-red">
        {{ dashboard.state.error }}
      </section>

      <section v-if="dashboard.state.loading" class="mb-5 rounded-md border border-hairline bg-[#fffafa] p-4 text-sm text-body">
        Mengambil data terbaru dari backend...
      </section>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SensorCard
          v-for="card in sensorCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :status="card.status"
          :status-tone="card.statusTone"
          :icon="card.icon"
          :icon-class="card.iconClass"
        />
      </section>

      <section class="mt-8">
        <ChartPanel title="Grafik Suhu Realtime" type="line" :points="dashboard.state.temperatureHistory" />
      </section>

      <section class="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
        <SensorStatusTable :rows="dashboard.state.sensorRows" :loading="dashboard.state.loading" />
        <AlertPanel :alerts="dashboard.state.alerts" :loading="dashboard.state.loading" />
      </section>
    </div>

    <footer class="border-t border-hairline bg-[#fbfafa]">
      <div class="flex flex-col gap-2 px-4 py-5 mx-auto text-xs max-w-7xl text-body sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span class="font-semibold text-primary">BTSense</span>
        <span>© 2026 BTSense IoT Infrastructure. All rights reserved.</span>
      </div>
    </footer>

    <ExportPdfModal
      v-if="auth.isSupervisor.value"
      :open="showExportModal"
      :device="dashboard.state.device"
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
import { Activity, Cable, DoorClosed, Fan, RefreshCw, Thermometer } from "lucide-vue-next";
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
import { getStatusLabel, getStatusTone } from "../utils/status.js";

const ExportPdfModal = defineAsyncComponent(() => import("../components/dashboard/ExportPdfModal.vue"));
const EditProfileModal = defineAsyncComponent(() => import("../components/profile/EditProfileModal.vue"));

const router = useRouter();
const auth = useAuthStore();
const dashboard = useDashboardStore();
const showExportModal = ref(false);
const showProfileModal = ref(false);
let cleanupSocket = [];
let pollingInterval = null;

const sensorCards = computed(() => {
  const summary = dashboard.state.sensorSummary;

  return [
    {
      title: "Temperature",
      value: summary.temperature.value === null || summary.temperature.value === undefined ? "-" : `${summary.temperature.value}${summary.temperature.unit}`,
      status: getStatusLabel(summary.temperature.status),
      statusTone: getStatusTone(summary.temperature.status),
      icon: markRaw(Thermometer),
      iconClass: "text-purple",
    },
    {
      title: "Temperature Status",
      value: getStatusLabel(summary.temperature.status),
      status: getStatusLabel(summary.temperature.status),
      statusTone: getStatusTone(summary.temperature.status),
      icon: markRaw(Activity),
      iconClass: "text-mute",
    },
    {
      title: "Fan Status",
      value: getStatusLabel(summary.fan.status),
      status: getStatusLabel(summary.fan.status),
      statusTone: getStatusTone(summary.fan.status),
      icon: markRaw(Fan),
      iconClass: "text-mute",
    },
    {
      title: "Cable Status",
      value: getStatusLabel(summary.cable.status),
      status: getStatusLabel(summary.cable.status),
      statusTone: getStatusTone(summary.cable.status),
      icon: markRaw(Cable),
      iconClass: "text-mute",
    },
    {
      title: "Door Status",
      value: getStatusLabel(summary.door.status),
      status: getStatusLabel(summary.door.status),
      statusTone: getStatusTone(summary.door.status),
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

const refreshDashboard = () => {
  dashboard.loadDashboard();
};

onMounted(() => {
  dashboard.loadDashboard();
  pollingInterval = window.setInterval(() => {
    dashboard.loadDashboard();
  }, 3000);

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
  if (pollingInterval) {
    window.clearInterval(pollingInterval);
  }

  cleanupSocket.forEach((cleanup) => cleanup());
});
</script>
