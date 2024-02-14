<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'
import { useStore } from '../store'

const magnifier = {
	width: 100,
	height: 80,
}

const props = defineProps<{
	x: number
	y: number
}>()

const store = useStore()
const position = ref<Position>()
const oScreenshotMagnifier = ref<HTMLDivElement | null>(null)
const oCanvas = ref<HTMLCanvasElement | null>(null)
const oContext = ref<CanvasRenderingContext2D | null>(null)
const rgb = ref('000000')

watch([
	props.x,
	props.y,
	store.width,
	store.height,
], () => {
	if (!oScreenshotMagnifier.value) return

	const { x, y } = props
	const { width, height } = store

	const elRect = oScreenshotMagnifier.value.getBoundingClientRect()
	let tx = x + 20
	let ty = y + 20

	if (tx + elRect.width > width) {
		tx = x - elRect.width - 20
	}
	if (ty + elRect.height > height) {
		ty = y - elRect.height - 20
	}

	if (tx < 0) {
		tx = 0
	}
	if (ty < 0) {
		ty = 0
	}

	position.value = { x: tx, y: ty }
})

watch([
	props.x,
	props.y,
	store.width,
	store.height,
], () => {
	if (!oCanvas.value) {
		oContext.value = null
		return
	}

	const { x, y } = props
	const { width, height, image } = store

	if (!oContext.value) {
		oContext.value = oCanvas.value.getContext('2d')
	}

	if (!oContext.value) {
		throw new Error('获取 canvas.context 失败')
	}

	const ctx = oContext.value
	ctx.clearRect(0, 0, magnifier.width, magnifier.height)
	const rx = image.naturalWidth / width
	const ry = image.naturalHeight / height
	// 显示原图比例
	ctx.drawImage(
		image,
		x * rx - magnifier.width / 2,
		y * ry - magnifier.height / 2,
		magnifier.width,
		magnifier.height,
		0,
		0,
		magnifier.width,
		magnifier.height,
	)
	const { data } = ctx.getImageData(
		Math.floor(magnifier.width / 2),
		Math.floor(magnifier.height / 2),
		1,
		1,
	)
	const hex = Array.from(data.slice(0, 3))
		.map((val) => (val >= 16 ? val.toString(16) : `0${val.toString(16)}`))
		.join('')
		.toUpperCase()

	rgb.value = hex
})
</script>

<template>
	<div ref='oScreenshotMagnifier' class='screenshots-magnifier' :style='{
		transform: `translate(${position?.x}px, ${position?.y}px)`,
	}'>
		<div class='screenshots-magnifier-body'>
			<canvas ref={coCanvas class='screenshots-magnifier-body-canvas' width={magnifier.width} height={magnifier.height} />
		</div>
		<div class='screenshots-magnifier-footer'>
			<div class='screenshots-magnifier-footer-item'>
				坐标: ({x},{y})
			</div>
			<div class='screenshots-magnifier-footer-item'>RGB: #{rgb}</div>
		</div>
	</div>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshots-magnifier {
	position: absolute;
	font-family: $font-family;
	left: 0;
	top: 0;
	width: 100px;
	box-shadow: 0 0 8px 0px #000;
	z-index: 9;

	&,
	* {
		box-sizing: border-box;
		user-select: none;
	}

	&-body {
		position: relative;
		background-color: #fff;

		&:before {
			content: '';
			background-color: rgb(10, 114, 161);
			position: absolute;
			top: 50%;
			left: 0;
			width: 100%;
			height: 2px;
			z-index: 1;
		}

		&:after {
			content: '';
			background-color: rgb(10, 114, 161);
			position: absolute;
			top: 0;
			left: 50%;
			width: 2px;
			height: 100%;
			z-index: 1;
		}

		&-canvas {
			display: block;
			width: 100px;
			height: 80px;
		}
	}

	&-footer {
		height: 40px;
		color: #fff;
		font-size: 11px;
		background-color: rgb(95, 94, 94);
		padding: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-align: center;

		&-item {
			height: 18px;
			line-height: 18px;
		}
	}
}
</style>
