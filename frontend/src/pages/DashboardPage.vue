<template>
  <main class="min-h-screen bg-[#f7f8fa] text-primary">
    <header class="border-b border-hairline bg-white">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
            <RadioTower class="h-5 w-5" />
          </div>
          <div>
            <h1 class="text-lg font-semibold">BTSense</h1>
            <p class="text-sm text-mute">Simulasi Tower BTS Jakarta Barat</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex h-9 items-center gap-2 rounded-md border border-hairline bg-white px-3 text-sm">
            <Wifi class="h-4 w-4 text-green" />
            <span>Online</span>
          </div>
          <button class="flex h-9 items-center gap-2 rounded-md bg-blueInfo px-3 text-sm font-medium text-white">
            <FileDown class="h-4 w-4" />
            Export PDF
          </button>
          <button class="flex h-9 items-center gap-2 rounded-md border border-hairline bg-white px-3 text-sm">
            <UserCircle class="h-4 w-4" />
            Supervisor
          </button>
        </div>
      </div>
    </header>

    <div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
      <section class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article
            v-for="card in statusCards"
            :key="card.label"
            class="rounded-md border border-hairline bg-white p-4 shadow-sm"
          >
            <div class="mb-4 flex items-center justify-between">
              <p class="text-sm text-mute">{{ card.label }}</p>
              <component :is="card.icon" class="h-5 w-5" :class="card.iconColor" />
            </div>
            <p class="text-2xl font-semibold">{{ card.value }}</p>
            <p class="mt-1 text-sm" :class="card.statusColor">{{ card.status }}</p>
          </article>
        </div>

        <section class="rounded-md border border-hairline bg-white shadow-sm">
          <div class="border-b border-hairline px-4 py-3">
            <h2 class="text-base font-semibold">Realtime Sensor Status</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-hairline text-sm">
              <thead class="bg-[#f2f4f7] text-left text-mute">
                <tr>
                  <th class="px-4 py-3 font-medium">Waktu</th>
                  <th class="px-4 py-3 font-medium">Device</th>
                  <th class="px-4 py-3 font-medium">Suhu</th>
                  <th class="px-4 py-3 font-medium">Fan</th>
                  <th class="px-4 py-3 font-medium">RPM</th>
                  <th class="px-4 py-3 font-medium">Kabel</th>
                  <th class="px-4 py-3 font-medium">Pintu</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-hairline">
                <tr v-for="row in sensorRows" :key="row.time">
                  <td class="whitespace-nowrap px-4 py-3">{{ row.time }}</td>
                  <td class="whitespace-nowrap px-4 py-3">{{ row.device }}</td>
                  <td class="whitespace-nowrap px-4 py-3">{{ row.temperature }}</td>
                  <td class="whitespace-nowrap px-4 py-3">{{ row.fan }}</td>
                  <td class="whitespace-nowrap px-4 py-3">{{ row.rpm }}</td>
                  <td class="whitespace-nowrap px-4 py-3">{{ row.cable }}</td>
                  <td class="whitespace-nowrap px-4 py-3">{{ row.door }}</td>
                  <td class="whitespace-nowrap px-4 py-3">
                    <span class="rounded-sm px-2 py-1 text-xs font-medium" :class="row.badgeClass">
                      {{ row.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside class="space-y-6">
        <section class="rounded-md border border-hairline bg-white shadow-sm">
          <div class="flex items-center gap-2 border-b border-hairline px-4 py-3">
            <Bell class="h-5 w-5 text-orange" />
            <h2 class="text-base font-semibold">Alert Terbaru</h2>
          </div>
          <div class="divide-y divide-hairline">
            <article v-for="alert in alerts" :key="alert.message" class="p-4">
              <div class="mb-2 flex items-center justify-between gap-3">
                <p class="font-medium">{{ alert.type }}</p>
                <span class="rounded-sm px-2 py-1 text-xs font-medium" :class="alert.badgeClass">
                  {{ alert.severity }}
                </span>
              </div>
              <p class="text-sm text-body">{{ alert.message }}</p>
              <p class="mt-2 text-xs text-mute">{{ alert.time }}</p>
            </article>
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { markRaw } from "vue";
import {
  Activity,
  Bell,
  Cable,
  DoorOpen,
  Fan,
  FileDown,
  Gauge,
  RadioTower,
  Thermometer,
  UserCircle,
  Wifi,
} from "@lucide/vue";

const statusCards = [
  {
    label: "Suhu Rak",
    value: "34.8 C",
    status: "Normal",
    statusColor: "text-green",
    icon: markRaw(Thermometer),
    iconColor: "text-blueInfo",
  },
  {
    label: "Status Fan",
    value: "Running",
    status: "Stabil",
    statusColor: "text-green",
    icon: markRaw(Fan),
    iconColor: "text-green",
  },
  {
    label: "RPM Fan",
    value: "1,820",
    status: "Dalam batas aman",
    statusColor: "text-body",
    icon: markRaw(Gauge),
    iconColor: "text-purple",
  },
  {
    label: "Status Kabel",
    value: "Connected",
    status: "Tidak ada gangguan",
    statusColor: "text-green",
    icon: markRaw(Cable),
    iconColor: "text-blue",
  },
  {
    label: "Status Pintu",
    value: "Closed",
    status: "Terkunci",
    statusColor: "text-body",
    icon: markRaw(DoorOpen),
    iconColor: "text-orange",
  },
];

const sensorRows = [
  {
    time: "10:24:12",
    device: "BTS-JKT-001",
    temperature: "34.8 C",
    fan: "running",
    rpm: "1,820",
    cable: "connected",
    door: "closed",
    status: "normal",
    badgeClass: "bg-green/10 text-green",
  },
  {
    time: "10:23:42",
    device: "BTS-JKT-001",
    temperature: "42.3 C",
    fan: "running",
    rpm: "1,760",
    cable: "connected",
    door: "closed",
    status: "warning",
    badgeClass: "bg-yellow/15 text-[#9a6500]",
  },
  {
    time: "10:23:05",
    device: "BTS-JKT-001",
    temperature: "36.1 C",
    fan: "running",
    rpm: "1,810",
    cable: "connected",
    door: "open",
    status: "warning",
    badgeClass: "bg-yellow/15 text-[#9a6500]",
  },
];

const alerts = [
  {
    type: "Temperature",
    severity: "warning",
    message: "Suhu rak melewati ambang batas warning pada BTS-JKT-001.",
    time: "2 menit lalu",
    badgeClass: "bg-yellow/15 text-[#9a6500]",
  },
  {
    type: "Door",
    severity: "info",
    message: "Pintu panel sempat terbuka saat pembacaan sensor terakhir.",
    time: "7 menit lalu",
    badgeClass: "bg-blueInfo/10 text-blueInfo",
  },
  {
    type: "Fan",
    severity: "critical",
    message: "Simulasi penurunan RPM fan terdeteksi pada sensor dummy.",
    time: "18 menit lalu",
    badgeClass: "bg-red/10 text-red",
  },
];
</script>
