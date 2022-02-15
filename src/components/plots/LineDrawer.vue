<template>
  <div class="plot-container">

    <svg width="100%" height="100%"
    @click="addPoint"
    @contextmenu.prevent="clearPoints"
    >

      <!-- Circles -->
      <circle v-for="(point, index) in points"
      :key="index" 
      r="10" :cx="point.x" :cy="point.y" />

      <!-- Path -->
      <path fill="transparent" 
            stroke="black" 
            stroke-width="1"
            :d="lineGenerator(points)"
            />
    </svg>
  </div>
</template>

<script>
import { reactive, ref, onMounted, onUpdated } from "vue";

import * as d3 from "d3";


export default {
  name: "LineDrawer",
  setup() {
    console.log("Hello there");


    const points = ref([])

    const lineGenerator = ref(
      d3.line([])
      .x(item => item.x)
      .y(item => item.y)
      .curve(d3.curveNatural)
    )

    const addPoint = function (ev) {
      const {layerX: x, layerY: y} = ev
      points.value.push({
        x: x,
        y: y
      })
    }

    const clearPoints = function () {
      points.value = []
    }

    onMounted( () => {
      console.log("Mounted")
    })

    onUpdated( () => {
      console.log("Updated")
    })

    return {
      points,
      addPoint,
      clearPoints,
      lineGenerator
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.plot-container {
  height: 100%;
  width: 100%;
}
</style>
