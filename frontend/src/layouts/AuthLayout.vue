<template>
  <main class="grid min-h-screen bg-white lg:grid-cols-2">
    <section class="hidden items-center bg-gradient-to-br from-purple/18 via-white to-white px-12 lg:flex">
      <div class="mx-auto max-w-lg">
        <div class="mb-8 flex items-center gap-2">
          <RadioTower class="h-6 w-6 text-primary" />
          <div>
            <p class="text-3xl font-semibold tracking-[-0.03em]">BTSense</p>
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-mute">Network Operations</p>
          </div>
        </div>
        <h1 class="max-w-md text-4xl font-semibold leading-tight tracking-[-0.03em] text-primary">
          Pantau kondisi sensor Tower BTS secara realtime
        </h1>
        <p class="mt-5 max-w-md text-base leading-7 text-body">
          Platform monitoring operasional jaringan dengan presisi tinggi untuk menjaga keandalan infrastruktur komunikasi.
        </p>
        <div class="mt-8 grid max-w-md grid-cols-2 gap-2">
          <div class="rounded-md border border-hairline bg-white/75 p-4">
            <div class="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-mute">
              Uptime
              <span class="h-2 w-2 rounded-full bg-green" />
            </div>
            <p class="text-xl font-semibold">99.9%</p>
          </div>
          <div class="rounded-md border border-hairline bg-white/75 p-4">
            <div class="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-mute">
              Anomalies
              <span class="h-2 w-2 rounded-full bg-red" />
            </div>
            <p class="text-xl font-semibold">2 Active</p>
          </div>
        </div>
      </div>
    </section>
    <section class="flex items-center justify-center px-4 py-10">
      <slot />
    </section>
  </main>
</template>

<script setup>
import { RadioTower } from "lucide-vue-next";
</script>
