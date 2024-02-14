<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import { useStore } from '../store'
import OperationButtons, { OperationsRectKey } from '../operations'

const store = useStore()
const operationsRect = ref<Bounds | null>(null)
const position = ref<Position | null>(null)
const oScreenshotOperations = ref<HTMLDivElement>(null)

provide(OperationsRectKey, operationsRect)

const onDoubleClick = (e: MouseEvent) => {
	e.stopPropagation()
}

const onContextMenu = (e: MouseEvent) => {
	e.preventDefault()
	e.stopPropagation()
}

// eslint-disable-next-line react-hooks/exhaustive-deps
watch(store.bounds, (bounds) => {
	if (!bounds || !oScreenshotOperations.value) {
		return
	}

	const elRect = oScreenshotOperations.value.getBoundingClientRect()

	let x = bounds.x + bounds.width - elRect.width
	let y = bounds.y + bounds.height + 10

	if (x < 0) {
		x = 0
	}

	if (x > width - elRect.width) {
		x = width - elRect.width
	}

	if (y > height - elRect.height) {
		y = height - elRect.height - 10
	}

	// 小数存在精度问题
	if (
		!position ||
		Math.abs(position.x - x) > 1 ||
		Math.abs(position.y - y) > 1
	) {
		position.value = { x, y }
	}

	// 小数存在精度问题
	if (
		!operationsRect ||
		Math.abs(operationsRect.value.x - elRect.x) > 1 ||
		Math.abs(operationsRect.value.y - elRect.y) > 1 ||
		Math.abs(operationsRect.value.width - elRect.width) > 1 ||
		Math.abs(operationsRect.value.height - elRect.height) > 1
	) {
		operationsRect.value = {
			x: elRect.x,
			y: elRect.y,
			width: elRect.width,
			height: elRect.height,
		}
	}
})
</script>

<template>
	<div v-if="store.bounds" ref="oScreenshotOperations" class="screenshot-operations" style="{
			visibility: position ? 'visible' : 'hidden',
			transform: `translate(${position?.x ?? 0}px, ${position?.y ?? 0}px)`,
		}" @dblclick="onDoubleClick" @contextmenu="onContextMenu">
		<div class="screenshot-operations-buttons">
			<template v-for="(OperationButton, index) of OperationButtons">
				<div v-if="OperationButton === '|'" :key="`${index}-a`" class="screenshot-operations-divider" />
				<OperationButton v-else :key="`${index}-b`" />
			</template>
		</div>
	</div>
	<div v-else />
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshot-operations {
	position: absolute;
	left: 0;
	top: 0;
	will-change: transform;

	&-buttons {
		display: flex;
		align-items: center;
		padding: 3px;
		border-radius: 2px;
		border: 1px solid #ddd;
		background-color: #fff;
		overflow: hidden;
	}

	&-divider {
		background-color: #ddd;
		width: 1px;
		height: $button-size;
		margin: 0 3px;
	}
}
</style>
