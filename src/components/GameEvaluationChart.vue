<script setup lang="ts">
import Chart from 'chart.js/auto'
import {onMounted, ref} from "vue";

const elementId = (Math.random() + 1).toString(36).substring(10);

interface Eval {
  eval: number
}

const props = defineProps({
  analysis: Array<Eval>
})

const evaluationChartData = ref({
  datasets: []
});
const evaluationChartOptions = ref({});

onMounted(() => {
  new Chart(
      document.getElementById(elementId),
      {
        type: 'line',
        plugins: [{
          afterLayout: chart => {
            let ctx = chart.ctx;
            ctx.save();
            let yAxis = chart.scales.y;
            let yThreshold = yAxis.getPixelForValue(1);
            let gradient = ctx.createLinearGradient(0, yAxis.top, 0, yAxis.bottom);
            gradient.addColorStop(0, 'rgb(245, 243, 242)');
            let offset = 1 / yAxis.bottom * yThreshold;
            gradient.addColorStop(offset, 'rgb(245, 243, 242)');
            gradient.addColorStop(offset, 'rgb(56, 54, 53)');
            gradient.addColorStop(1, 'rgb(56, 54, 53)');
            chart.data.datasets[0].borderColor = gradient;
            chart.data.datasets[0].backgroundColor = gradient;
            ctx.restore();
          }
        }],
        data: {
          labels: props.analysis.map((_, idx) => idx),
          datasets: [
            {
              label: 'Game evaluation',
              data: props.analysis.map(e => e.eval >= 0 ? Math.min(e.eval, 100) : Math.max(e.eval, -100)),
              pointRadius: 0,
              fill: true,
              tension: 0.5
            }
          ]
        },
        options: {
          responsive: true,
          aspectRatio: 4
        }
      }
  );
})

</script>

<template>
    <canvas :id="elementId" style="width: 100%"></canvas>
</template>

<style scoped>

</style>