
<script setup lang="ts">
import ScreenshotSize from '../screenshot-size/index.vue'
import ScreenshotColor from '../screenshot-color/index.vue'

const props = defineProps<{
	size: number
	color: string
	onSizeChange: (value: number) => void
	onColorChange: (value: string) => void
}>()

</script>

<template>
	<div class="screenshot-sizecolor">
		<ScreenshotSize :value="size" :onChange="onSizeChange" />
		<ScreenshotColor :value="color" :onChange="onColorChange" />
	</div>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshot-sizecolor {
	height: $sizecolor-size;
	padding: 3px 0;
	display: flex;
	align-items: center;
}
</style>
