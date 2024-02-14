<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
	value: number
	onChange: (value: number) => void
}>()

const sizes = ref([3, 6, 9])
</script>

<template>
	<div class="screenshot-size">
		<div v-for="size of sizes" :key="size" :class="['screenshot-size-item', { 'screenshot-size-active': size === value }]"
			@click="onChange?.(size)">
			<div class="screenshot-size-pointer" :style="{ width: size * 1.8, height: size * 1.8 }" />
		</div>
	</div>
</template>

<style lang="scss">
@import "../var.scss";

.screenshot-size {
	height: $sizecolor-size;
	display: flex;
	align-items: center;

	&-item {
		width: $sizecolor-size;
		height: $sizecolor-size;
		position: relative;
		margin: 0 3px;
		cursor: pointer;
	}

	&-pointer {
		background-color: #555;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	&-active>&-pointer {
		background-color: #39f;
	}
}
</style>
