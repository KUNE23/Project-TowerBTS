<template>
  <section class="rounded-md border border-hairline bg-[#fffafa] p-4 shadow-sm">
    <div class="mb-4 flex items-center justify-between border-b border-hairline pb-3">
      <h2 class="text-sm font-semibold text-primary">Riwayat Sensor Terbaru</h2>
      <span class="text-xs text-body">{{ rows.length }} log</span>
    </div>
    <div v-if="loading" class="py-10 text-center text-sm text-body">Memuat riwayat sensor...</div>
    <div v-else-if="rows.length === 0" class="py-10 text-center text-sm text-body">
      Belum ada riwayat sensor dari backend.
    </div>
    <div class="overflow-x-auto">
      <table v-if="!loading && rows.length > 0" class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-hairline text-body">
            <th class="px-2 py-3 font-medium">Waktu</th>
            <th class="px-2 py-3 font-medium">Temperature</th>
            <th class="px-2 py-3 font-medium">Fan</th>
            <th class="px-2 py-3 font-medium">Cable</th>
            <th class="px-2 py-3 font-medium">Door</th>
            <th class="px-2 py-3 font-medium">Overall</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-b border-hairline last:border-0">
            <td class="whitespace-nowrap px-2 py-3 text-body">{{ row.updatedAt }}</td>
            <td class="whitespace-nowrap px-2 py-3">
              <div class="font-medium text-primary">{{ row.temperatureLabel }}</div>
              <StatusBadge class="mt-1" :label="getStatusLabel(row.temperatureStatus)" :tone="getStatusTone(row.temperatureStatus)" />
            </td>
            <td class="whitespace-nowrap px-2 py-3">
              <div class="text-body">{{ row.fanRpmLabel }}</div>
              <StatusBadge class="mt-1" :label="getStatusLabel(row.fanStatus)" :tone="getStatusTone(row.fanStatus)" />
            </td>
            <td class="whitespace-nowrap px-2 py-3">
              <StatusBadge :label="getStatusLabel(row.cableStatus)" :tone="getStatusTone(row.cableStatus)" />
            </td>
            <td class="whitespace-nowrap px-2 py-3">
              <StatusBadge :label="getStatusLabel(row.doorStatus)" :tone="getStatusTone(row.doorStatus)" />
            </td>
            <td class="whitespace-nowrap px-2 py-3">
              <StatusBadge :label="getStatusLabel(row.overallStatus)" :tone="getStatusTone(row.overallStatus)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import StatusBadge from "../common/StatusBadge.vue";
import { getStatusLabel, getStatusTone } from "../../utils/status.js";

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
