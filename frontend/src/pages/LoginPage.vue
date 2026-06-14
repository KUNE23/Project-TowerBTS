<template>
  <AuthLayout>
    <section class="w-full max-w-[420px] rounded-md border border-hairline bg-white p-8 shadow-sm">
      <div class="mb-8 text-center lg:hidden">
        <p class="text-3xl font-semibold tracking-[-0.03em]">BTSense</p>
        <p class="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-mute">Network Operations</p>
      </div>

      <div class="mb-7 text-center">
        <h1 class="text-2xl font-semibold tracking-[-0.02em] text-primary">Masuk ke Dashboard</h1>
        <p class="mt-2 text-sm text-body">Pantau suhu, fan, kabel, dan pintu secara realtime.</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <BaseInput v-model="form.email" label="Email" type="email" placeholder="teknisi@btsense.com" />
        <BaseInput v-model="form.password" label="Password" type="password" placeholder="••••••••" />

        <div class="flex items-center justify-between gap-4 text-sm text-body">
          <label class="flex items-center gap-2">
            <input v-model="form.remember" class="h-4 w-4 rounded-sm border-hairline" type="checkbox" />
            Remember me
          </label>
          <button class="text-primary hover:text-purple" type="button">Forgot password?</button>
        </div>

        <BaseButton class="w-full" label="Login" type="submit" :loading="auth.state.loading" />

        <p v-if="auth.state.error" class="text-sm text-red">{{ auth.state.error }}</p>
      </form>

      <p class="mt-8 text-center text-xs text-mute">Monitoring Sensor Tower BTS Berbasis IoT</p>
    </section>
  </AuthLayout>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import AuthLayout from "../layouts/AuthLayout.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseInput from "../components/common/BaseInput.vue";
import { useAuthStore } from "../stores/authStore.js";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  email: "teknisi@btsense.com",
  password: "password",
  remember: false,
});

const submit = async () => {
  await auth.login({
    email: form.email,
    password: form.password,
    remember: form.remember,
  });

  router.push("/dashboard");
};
</script>
