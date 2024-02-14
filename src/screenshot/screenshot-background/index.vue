<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import ScreenshotMagnifier from '../screenshot-magnifier/index.vue'
import { useStore } from '../store'
import { getBoundsByPoints } from './utils'

const store = useStore()
const oScreenshotBackground = ref<HTMLDivElement>(null)
const point = ref<Point>(null)
// 用来判断鼠标是否移动过
// 如果没有移动过位置，则 mouseup 时不更新
const isMoveRef = ref(false)
const position = ref<Position>(null)

const updateBounds = (p1: Point, p2: Point) => {
	if (!oScreenshotBackground.value) return

	const { x, y } = oScreenshotBackground.value.getBoundingClientRect()

	store.bounds = getBoundsByPoints(
		{
			x: p1.x - x,
			y: p1.y - y,
		},
		{
			x: p2.x - x,
			y: p2.y - y,
		},
		store.width,
		store.height,
	)
}

const onMouseDown = (e: MouseEvent) => {
	// e.button 鼠标左键
	if (point.value || store.bounds || e.button !== 0) {
		return
	}

	point.value = {
		x: e.clientX,
		y: e.clientY,
	}
	isMoveRef.value = false
}

watch(store.bounds, () => {
	// 重置位置
	position.value = null
})

onMounted(() => {
	const onMouseMove = (e: MouseEvent) => {
		if (oScreenshotBackground.value) {
			const rect = oScreenshotBackground.value.getBoundingClientRect()
			if (
				e.clientX < rect.left ||
				e.clientY < rect.top ||
				e.clientX > rect.right ||
				e.clientY > rect.bottom
			) {
				position.value = null
			} else {
				position.value = {
					x: e.clientX - rect.x,
					y: e.clientY - rect.y,
				}
			}
		}

		if (!point.value) {
			return
		}
		updateBounds(point.value, {
			x: e.clientX,
			y: e.clientY,
		})
		isMoveRef.value = true
	}

	const onMouseUp = (e: MouseEvent) => {
		if (!point.value) {
			return
		}

		if (isMoveRef.value) {
			updateBounds(point.value, {
				x: e.clientX,
				y: e.clientY,
			})
		}
		point.value = null
		isMoveRef.value = false
	}
	window.addEventListener('mousemove', onMouseMove)
	window.addEventListener('mouseup', onMouseUp)

	return () => {
		window.removeEventListener('mousemove', onMouseMove)
		window.removeEventListener('mouseup', onMouseUp)
	}
})

</script>

<template>
	<div ref='oScreenshotBackground' class='screenshot-background' @mousedown='onMouseDown'>
		<img class='screenshot-background-image' :src='store.url' />
		<div class='screenshot-background-mask' />
		<ScreenshotMagnifier v-if='position && !store.bounds' :x='position.x' :y='position.y' />
	</div>
</template>

<style lang="scss">
.screenshot-background {
	width: 100%;
	height: 100%;
	position: relative;

	&-image {
		width: 100%;
		height: 100%;
		display: block;
		border: none;
		outline: none;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: crisp-edges;
		-webkit-font-smooting: antialiased;
	}

	&-mask {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
	}
}
</style>
