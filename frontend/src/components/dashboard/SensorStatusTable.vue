<template>
  <section class="rounded-md border border-hairline bg-[#fffafa] p-4 shadow-sm">
    <div class="mb-4 flex items-center justify-between border-b border-hairline pb-3">
      <h2 class="text-sm font-semibold text-primary">Realtime Sensor Status</h2>
      <button class="text-xs font-medium text-purple" type="button">View Full Log</button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-hairline text-body">
            <th class="px-2 py-3 font-medium">Sensor</th>
            <th class="px-2 py-3 font-medium">Nilai</th>
            <th class="px-2 py-3 font-medium">Status</th>
            <th class="px-2 py-3 font-medium">Update Terakhir</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-b border-hairline last:border-0">
            <td class="whitespace-nowrap px-2 py-3 font-medium text-primary">{{ row.sensor }}</td>
            <td class="whitespace-nowrap px-2 py-3 text-body">{{ row.value }}</td>
            <td class="whitespace-nowrap px-2 py-3">
              <StatusBadge :label="getStatusLabel(row.status).toUpperCase()" :tone="getStatusTone(row.status)" />
            </td>
            <td class="whitespace-nowrap px-2 py-3 text-body">{{ row.updatedAt }}</td>
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
});
</script>
