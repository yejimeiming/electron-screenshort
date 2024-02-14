<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCursor } from '../hooks/useCursor'
import { useEmiter } from '../hooks/useEmiter'
import { useHistory } from '../hooks/useHistory'
import { useOperation } from '../hooks/useOperation'
import { getBoundsByPoints, getPoints, isPointInDraw } from './utils'
import { useStore } from '../store'

const borders = ['top', 'right', 'bottom', 'left']
enum ResizePoints {
	ResizeTop = 'top',
	ResizetopRight = 'top-right',
	ResizeRight = 'right',
	ResizeRightBottom = 'right-bottom',
	ResizeBottom = 'bottom',
	ResizeBottomLeft = 'bottom-left',
	ResizeLeft = 'left',
	ResizeLeftTop = 'left-top',
	Move = 'move',
}
const resizePoints = [
	ResizePoints.ResizeTop,
	ResizePoints.ResizetopRight,
	ResizePoints.ResizeRight,
	ResizePoints.ResizeRightBottom,
	ResizePoints.ResizeBottom,
	ResizePoints.ResizeBottomLeft,
	ResizePoints.ResizeLeft,
	ResizePoints.ResizeLeftTop,
]

const store = useStore()
const emiter = useEmiter()
const [history] = useHistory()
const [cursor] = useCursor()
const [operation] = useOperation()
const resizeOrMoveRef = ref<string>()
const pointRef = ref<Point | null>(null)
const boundsRef = ref<Bounds | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctxRef = ref<CanvasRenderingContext2D | null>(null)

const isCanResize = store.bounds && !history.stack.length && !operation

const draw = () => {
	if (!store.bounds || !ctxRef.value) {
		return
	}

	const ctx = ctxRef.value
	ctx.imageSmoothingEnabled = true
	// 设置太高，图片会模糊
	ctx.imageSmoothingQuality = 'low'
	ctx.clearRect(0, 0, bounds.width, bounds.height)

	history.stack.slice(0, history.index + 1).forEach((item) => {
		if (item.type === HistoryItemType.Source) {
			item.draw(ctx, item)
		}
	})
}

const onMouseDown = (e: React.MouseEvent, resizeOrMove: string) => {
	if (e.button !== 0 || !bounds) {
		return
	}
	if (!operation) {
		resizeOrMoveRef.value = resizeOrMove
		pointRef.value = {
			x: e.clientX,
			y: e.clientY,
		}
		boundsRef.value = {
			x: bounds.x,
			y: bounds.y,
			width: bounds.width,
			height: bounds.height,
		}
	} else {
		const draw = isPointInDraw(
			bounds,
			canvasRef.value,
			history,
			e.nativeEvent,
		)
		if (draw) {
			emiter.emit('drawselect', draw, e.nativeEvent)
		} else {
			emiter.emit('mousedown', e.nativeEvent)
		}
	}
}

const updateBounds = (e: MouseEvent) => {
	if (
		!resizeOrMoveRef.value ||
		!pointRef.value ||
		!boundsRef.value ||
		!bounds
	) {
		return
	}
	const points = getPoints(
		e,
		resizeOrMoveRef.value,
		pointRef.value,
		boundsRef.value,
	)
	boundsDispatcher.set(
		getBoundsByPoints(
			points[0],
			points[1],
			bounds,
			width,
			height,
			resizeOrMoveRef.value,
		),
	)
}

watch(
	[
		store.image,
		store.bounds,
		store.draw,
	],
	() => {
		if (!store.image || !store.bounds || !canvasRef.value) {
			ctxRef.value = null
			return
		}

		if (!ctxRef.value) {
			ctxRef.value = canvasRef.value.getContext('2d')
		}

		draw()
	})

watch([store.operation], () => {
	const onMouseMove = (e: MouseEvent) => {
		if (!operation) {
			if (
				!resizeOrMoveRef.value ||
				!pointRef.value ||
				!boundsRef.value
			) {
				return
			}
			updateBounds(e)
		} else {
			emiter.emit('mousemove', e)
		}
	}

	const onMouseUp = (e: MouseEvent) => {
		if (!operation) {
			if (
				!resizeOrMoveRef.value ||
				!pointRef.value ||
				!boundsRef.value
			) {
				return
			}
			updateBounds(e)
			resizeOrMoveRef.value = undefined
			pointRef.value = null
			boundsRef.value = null
		} else {
			emiter.emit('mouseup', e)
		}
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
	<div class='screenshots-canvas' :style="{
		width: bounds?.width || 0,
		height: bounds?.height || 0,
		transform: bounds ? `translate(${bounds.x}px, ${bounds.y}px)` : 'none',
	}">
		<div class='screenshots-canvas-body'>
			<!-- 保证一开始就显示，减少加载时间 -->
			<img class='screenshots-canvas-image' :src="url" style="{ 
				width,
				height,
				transform: bounds ? `translate(${-bounds.x}px, ${-bounds.y}px)` : 'none',
			}" />
			<canvas :ref='canvasRef' class='screenshots-canvas-panel' :width="bounds?.width || 0"
				:height="bounds?.height || 0" />
		</div>
		<div class='screenshots-canvas-mask' :style="{ cursor }" @mousedown="onMouseDown($event, 'move')">
			<div v-if='isCanResize' class='screenshots-canvas-size'>
				{{ bounds.width }} &times; {{ bounds.height }}
			</div>
		</div>
		<div v-for="border of borders" :key="border" :class="`screenshots-canvas-border-${border}`" />
		<div v-if="isCanResize" v-for="resizePoint of resizePoints" :key="resizePoint"
			:class="`screenshots-canvas-point-${resizePoint}`" @mousedown="onMouseDown($event, resizePoint)" />
	</div>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshots-canvas {
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
