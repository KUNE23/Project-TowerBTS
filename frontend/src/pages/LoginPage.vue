<template>
  <main class="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
    <section class="w-full max-w-sm rounded-md border border-hairline bg-white p-6 shadow-sm">
      <div class="mb-8 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
          <RadioTower class="h-5 w-5" />
        </div>
        <div>
          <h1 class="text-xl font-semibold text-primary">BTSense</h1>
          <p class="text-sm text-mute">Tower sensor monitoring</p>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="goToDashboard">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-body">Email</span>
          <input
            v-model="email"
            type="email"
            class="h-11 w-full rounded-sm border border-hairline px-3 text-sm outline-none transition focus:border-blueInfo focus:ring-2 focus:ring-blueInfo/10"
            placeholder="technician@btsense.local"
          />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-body">Password</span>
          <input
            v-model="password"
            type="password"
            class="h-11 w-full rounded-sm border border-hairline px-3 text-sm outline-none transition focus:border-blueInfo focus:ring-2 focus:ring-blueInfo/10"
            placeholder="password"
          />
        </label>

        <button
          type="submit"
          class="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-body"
        >
          <LogIn class="h-4 w-4" />
          Login
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LogIn, RadioTower } from "@lucide/vue";

const router = useRouter();
const email = ref("");
const password = ref("");

const goToDashboard = () => {
  router.push("/dashboard");
};
</script>
