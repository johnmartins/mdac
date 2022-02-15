<template>
  <div class="plot">
			<svg width="100%" height="100%">

				<!-- Plot boundaries -->
				<text x="20" y="20" class="title">test</text>

			</svg>
	</div>
</template>

<script setup>
import { reactive, ref, onMounted, onUpdated } from "vue";

import * as d3 from "d3";

console.log("Yes");


</script>

<style scoped lang="scss">

$font-color: black;
$background-color: grey;

.plot {
	background: $background-color;
	width: 100%;
	height: 100%;

	text {
		fill: $font-color;
	}
}
</style>