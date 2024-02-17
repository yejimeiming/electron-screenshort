<script setup lang="ts">
import {
	computed,
	onMounted,
	ref,
} from 'vue'
import { useStore } from '../store'
import type { Position } from '../types'

const magnifier = {
	width: 100,
	height: 80,
}

const offset = 20 // 缩略图与光标空隙
const store = useStore()
const oScreenshotMagnifier = ref<HTMLDivElement | null>(null)
const oCanvas = ref<HTMLCanvasElement | null>(null)
const oContext = ref<CanvasRenderingContext2D | null>(null)
const rect = ref<DOMRect>()

const position = computed<Position>(() => {
	if (!rect.value) return

	const { width, height } = rect.value
	const x = store.clientX
	const y = store.clientY
	const w = store.width
	const h = store.height

	let x2 = x + offset
	let y2 = y + offset

	if (x2 + width > w) { // 右边碰撞
		x2 = x - width - offset
	}
	if (y2 + height > h) { // 下边碰撞
		y2 = y - height - offset
	}

	return { x: x2, y: y2 }
})

const rgb = computed(() => {
	if (!oCanvas.value) {
		oContext.value = null
		return '000000'
	}
	const ctx = oContext.value ??= oCanvas.value.getContext('2d')
	if (!ctx) {
		throw new Error('获取 canvas.context 失败')
	}

	const x = store.clientX
	const y = store.clientY
	const image = store.image
	const width = store.width
	const height = store.height

	ctx.clearRect(0, 0, magnifier.width, magnifier.height)
	const rx = image.naturalWidth / width
	const ry = image.naturalHeight / height

	// 显示原图比例
	// TODO: 这里处理并不好 drawImage 也即副作用会使 computed 变得不纯粹；drawImage 频繁也会影响性能
	// TODO: 使用 image + transform 性能更高
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

	return hex
})

onMounted(() => {
	rect.value = oScreenshotMagnifier.value.getBoundingClientRect()
})
</script>

<template>
	<div ref="oScreenshotMagnifier" class="screenshot-magnifier" :style="{
		transform: `translate(${position?.x ?? 0}px, ${position?.y ?? 0}px)`,
	}">
		<div class="screenshot-magnifier-body">
			<canvas ref="oCanvas" class="screenshot-magnifier-body-canvas" :width="magnifier.width"
				:height="magnifier.height" />
		</div>
		<div class="screenshot-magnifier-footer">
			<div class="screenshot-magnifier-footer-item">
				坐标: ({{ [store.clientX, store.clientY].join(', ') }})
			</div>
			<div class="screenshot-magnifier-footer-item">RGB: #{{ rgb }}</div>
		</div>
	</div>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshot-magnifier {
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
