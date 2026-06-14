<template>
  <section class="rounded-md border border-hairline bg-[#fffafa] p-4 shadow-sm">
    <div class="mb-4 flex items-center justify-between gap-4 border-b border-hairline pb-3">
      <h2 class="text-sm font-semibold text-primary">{{ title }}</h2>
      <span class="text-xs text-body">Last 1 Hour</span>
    </div>
    <div class="h-56 rounded-sm border border-dashed border-hairline bg-white p-4">
      <Line v-if="type === 'line'" :data="chartData" :options="lineOptions" />
      <Bar v-else :data="chartData" :options="barOptions" />
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "line",
  },
  points: {
    type: Array,
    default: () => [],
  },
});

const chartData = computed(() => ({
  labels: props.points.map((item) => item.label),
  datasets: [
    {
      data: props.points.map((item) => item.value),
      borderColor: props.type === "line" ? "#7a3dff" : "#3b89ff",
      backgroundColor: props.type === "line" ? "rgba(122, 61, 255, 0.14)" : "#3b89ff",
      borderWidth: 2,
      pointRadius: 0,
      fill: props.type === "line",
      tension: 0.42,
      borderRadius: 3,
      barThickness: 18,
    },
  ],
}));

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxTicksLimit: 3,
        color: "#363636",
        font: {
          size: 10,
        },
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "#d8d8d8",
        borderDash: [4, 4],
      },
      ticks: {
        color: "#363636",
        font: {
          size: 10,
        },
      },
      border: {
        display: false,
      },
    },
  },
};

const lineOptions = baseOptions;
const barOptions = baseOptions;
</script>
