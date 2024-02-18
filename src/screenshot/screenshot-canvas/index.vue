<script setup lang="ts">
import {
	computed,
	ref,
	watch,
	onMounted,
	onUnmounted,
} from 'vue'
import { Mouse } from '../funcs/mouse'
import { resizeOrMoveBounds, getPointsByMouseMove } from '../funcs/mouse.utils'
import { useStore } from '../store'
import { DHistory } from '../funcs/draw.history'
import { HistoryItemType, ResizePoints } from '../enums'
import type { Bounds, ResizeOrMove } from '../types'
import { isPointInDraw } from './utils'
import { Canvas } from './canvas'
import { Events } from './events'

const borders = ['top', 'right', 'bottom', 'left']
const $temp: {
	bounds?: Bounds // 快照，用在 move 时 += 操作
	resizeOrMove?: ResizeOrMove
} = {}

const store = useStore()
const oCanvas = ref<HTMLCanvasElement | null>(null)
const isResizeable = computed(() => store.bounds && !DHistory.history.stack.length && !store.operation)
const $bounds = computed<Bounds>(() => store.bounds ?? { x: 0, y: 0, width: 0, height: 0 })

const draw = () => {
	const { bounds } = store
	const ctx = Canvas.ctx
	if (!bounds || !ctx) {
		throw new Error('加载绘制画布失败')
	}

	ctx.imageSmoothingEnabled = true
	// 设置太高，图片会模糊
	ctx.imageSmoothingQuality = 'low'
	ctx.clearRect(0, 0, bounds.width, bounds.height)

	DHistory.history.stack.slice(0, DHistory.history.index + 1).forEach((item) => {
		if (item.type === HistoryItemType.Source) {
			item.draw(ctx, item)
		}
	})
}

const updateBounds = (mousedownEvent: MouseEvent, mousemoveEvent: MouseEvent) => {
	const [startPoint, endPoint] = getPointsByMouseMove(
		{ x: mousedownEvent.clientX, y: mousedownEvent.clientY },
		{ x: mousemoveEvent.clientX, y: mousemoveEvent.clientY },
		$temp.bounds!,
		$temp.resizeOrMove!,
	)

	store.setBounds(resizeOrMoveBounds(
		startPoint,
		endPoint,
		store.width,
		store.height,
		$temp.bounds!,
		$temp.resizeOrMove!,
	))
}

const unlistenHistory = DHistory.listen(() => draw())

Mouse.move(({ event, mousedown }) => {
	if (store.operation) { // 二次绘制
		Events.emit('mousemove', event)
	} else if (store.bounds && $temp.resizeOrMove) {
		updateBounds(mousedown?.event!, event)
	}
})

Mouse.up(({ event }) => {
	if (store.operation) {
		Events.emit('mouseup', event)
	} else {
		$temp.resizeOrMove = undefined
	}
})

Mouse.down(({ event, dataset }) => {
	const prefix = 'bounds:'
	const mouseEvent = dataset.mouseEvent
	if (mouseEvent?.startsWith(prefix)) {
		const resizeOrMove = mouseEvent.replace(prefix, '') as ResizeOrMove
		const isMouseLeftButton = event.button === 0
		if (!isMouseLeftButton || !store.bounds) {
			return
		}

		if (store.operation) {
			const draw = isPointInDraw(
				store.bounds,
				Canvas.ctx?.canvas!,
				DHistory.history,
				event,
			)

			if (draw) {
				Events.emit('drawselect', event, draw)
			} else {
				Events.emit('mousedown', event)
			}
		} else {
			$temp.bounds = { ...store.bounds }
			$temp.resizeOrMove = resizeOrMove
		}
	}
})

onMounted(() => Canvas.ctx = oCanvas.value?.getContext('2d')!)
onUnmounted(() => {
	Canvas.ctx = null
	unlistenHistory()
})
</script>

<template>
	<div class="screenshot-canvas" :style="{
		width: `${$bounds.width}px`,
		height: `${$bounds.height}px`,
		transform: `translate(${$bounds.x}px, ${$bounds.y}px)`,
	}">
		<div class="screenshot-canvas-body">
			<!-- 保证一开始就显示，减少加载时间 -->
			<img class="screenshot-canvas-image" :src="store.url" :style="{
				width: `${store.width}px`,
				height: `${store.height}px`,
				transform: `translate(${-$bounds.x}px, ${-$bounds.y}px)`,
			}" />
			<canvas ref="oCanvas" class="screenshot-canvas-panel" :width="$bounds.width" :height="$bounds.height" />
		</div>
		<div class="screenshot-canvas-mask" :style="{ cursor: store.cursor }" data-mouse-event="bounds:move">
			<div v-if="isResizeable" class="screenshot-canvas-size">
				{{ $bounds.width }} &times; {{ $bounds.height }}
			</div>
		</div>
		<div v-for="border of borders" :key="border" :class="`screenshot-canvas-border-${border}`" />
		<div v-if="isResizeable" v-for="point of Object.values(ResizePoints)" :key="point"
			:class="`screenshot-canvas-point-${point}`" :data-mouse-event="`bounds:${point}`" />
	</div>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshot-canvas {
	position: absolute;
	left: 0;
	top: 0;
	will-change: width, height, transform;

	&-body,
	&-mask {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		overflow: hidden;
	}

	&-image {
		display: block;
		border: none;
		outline: none;
		will-change: transform;
		max-width: unset;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: crisp-edges;
		-webkit-font-smooting: antialiased;
	}

	&-panel {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		will-change: width, height;
	}

	&-size {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		background-color: rgba(0, 0, 0, 0.8);
		color: #fff;
		font-size: 12px;
		padding: 3px 4px;
		border-radius: 2px;
		white-space: nowrap;
		pointer-events: none;
	}

	@each $border in $borders {
		@each $key, $value in $border {
			&-border-#{$key} {
				@each $j, $val in $value {
					#{$j}: $val;
				}

				position: absolute;
				background-color: $border-color;
				pointer-events: none;
			}
		}
	}

	@each $point in $points {
		@each $key, $value in $point {
			&-point-#{$key} {
				@each $j, $val in $value {
					#{$j}: $val;
				}

				width: 8px;
				height: 8px;
				position: absolute;
				background-color: $point-color;
				border-radius: 50%;
				transform: translate(-50%, -50%);
			}
		}
	}
}
</style>
