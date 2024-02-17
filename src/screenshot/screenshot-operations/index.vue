<script setup lang="ts">
import {
	computed,
	ref,
	watch,
} from 'vue'
import { useStore } from '../store'
import { operationsRect } from '../operations/state'
import OperationButtons from '../operations'

const offset = 10 // 间距
const store = useStore()
const oScreenshotOperations = ref<HTMLDivElement | null>(null)

const position = computed(() => {
	const bounds = store.bounds
	const width = operationsRect.width
	const height = operationsRect.height
	if (!(bounds && width != null && height != null)) return

	let x = bounds.x + bounds.width - width // 右对齐
	let y = bounds.y + bounds.height + offset // 下对齐

	if (x < 0) { // 左碰撞
		x = 0
	}

	if (x > store.width - width) { // 右碰撞
		x = store.width - width
	}

	if (y > store.height - height) { // 下碰撞
		y = store.height - height
	}

	return { x, y }
})

const onDoubleClick = (e: MouseEvent) => {
	e.stopPropagation()
}

const onContextMenu = (e: MouseEvent) => {
	e.preventDefault()
	e.stopPropagation()
}

// 实时计算操作框信息
watch(() => store.bounds, (bounds) => {
	if (!bounds) return

	const rect = oScreenshotOperations.value?.getBoundingClientRect()
	if (rect) {
		operationsRect.x = rect.x
		operationsRect.y = rect.y
		operationsRect.width = rect.width
		operationsRect.height = rect.height
	}
})
</script>

<template>
	<div ref="oScreenshotOperations" class="screenshot-operations" :style="{
		visibility: position ? undefined : 'hidden',
		transform: `translate(${position?.x ?? 0}px, ${position?.y ?? 0}px)`,
	}" @dblclick="onDoubleClick" @contextmenu="onContextMenu">
		<div class="screenshot-operations-buttons">
			<template v-for="(OperationButton, index) of OperationButtons" :key="index">
				<div v-if="OperationButton === '|'" class="screenshot-operations-divider" />
				<component v-else :is="OperationButton" />
			</template>
		</div>
	</div>
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
