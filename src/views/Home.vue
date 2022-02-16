<template>
  <div class="home">
    <PCPlot/>
  </div>

</template>

<script>
// @ is an alias to /src
import PCPlot from '@/components/plots/PCPlot2.vue'

export default {
  name: 'Home',
  components: {
    PCPlot
  }
}
</script>
