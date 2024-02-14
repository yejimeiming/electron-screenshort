<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { OperationsRectKey } from '../operations'

const props = defineProps<{
	open?: boolean
}>()

export enum Placement {
	Bottom = 'bottom',
	Top = 'top',
}

const childrenRef = ref<HTMLDivElement | null>(null)
const popoverRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)
const operationsRect = inject<Bounds>(OperationsRectKey)
const placement = ref<Placement>(Placement.Bottom)
const position = ref<Position | null>(null)
const offsetX = ref(0)

const getPopoverEl = () => {
	if (!popoverRef.value) {
		popoverRef.value = document.createElement('div')
	}
	return popoverRef.value
}

watch([props.open], open => {
	const $el = getPopoverEl()
	if (open) {
		document.body.appendChild($el)
	}
	return () => {
		$el.remove()
	}
})

watch([
	placement,
	position,
	offsetX,
], () => {
	if (
		!open ||
		!operationsRect ||
		!childrenRef.value ||
		!contentRef.value
	) {
		return
	}

	const childrenRect = childrenRef.value.getBoundingClientRect()
	const contentRect = contentRef.value.getBoundingClientRect()

	let currentPlacement = placement
	let x = childrenRect.left + childrenRect.width / 2
	let y = childrenRect.top + childrenRect.height
	let currentOffsetX = offsetX

	// 如果左右都越界了，就以左边界为准
	if (x + contentRect.width / 2 > operationsRect.x + operationsRect.width) {
		const ox = x
		x = operationsRect.x + operationsRect.width - contentRect.width / 2
		currentOffsetX.value = ox - x
	}

	// 左边不能超出
	if (x < operationsRect.x + contentRect.width / 2) {
		const ox = x
		x = operationsRect.x + contentRect.width / 2
		currentOffsetX.value = ox - x
	}

	// 如果上下都越界了，就以上边界为准
	if (y > window.innerHeight - contentRect.height) {
		if (currentPlacement.value === Placement.Bottom) {
			currentPlacement.value = Placement.Top
		}
		y = childrenRect.top - contentRect.height
	}

	if (y < 0) {
		if (currentPlacement.value === Placement.Top) {
			currentPlacement.value = Placement.Bottom
		}
		y = childrenRect.top + childrenRect.height
	}
	if (currentPlacement.value !== placement.value) {
		placement.value = currentPlacement.value
	}
	if (position.value?.x !== x || position.value.y !== y) {
		position.value = { x, y }
	}

	if (currentOffsetX.value !== offsetX.value) {
		offsetX.value = currentOffsetX.value
	}
})
</script>

<template>
	<slot ref="childrenRef" />

	<Teleport v-if="open && content" :to="getPopoverEl">
		<div ref="contentRef" class="screenshot-option" :style="{
			visibility: position ? 'visible' : 'hidden',
			transform: `translate(${position?.x ?? 0}px, ${position?.y ?? 0}px)`,
		}" data-placement="placement">
			<div class="screenshot-option-container">
				<slot name="content" />
			</div>
			<div class="screenshot-option-arrow" :style="{ marginLeft: offsetX }" />
		</div>
	</Teleport>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshot-option {
	position: absolute;
	left: 0;
	top: 0;
	font-family: $font-family;

	&,
	* {
		box-sizing: border-box;
		user-select: none;
	}

	&-container {
		height: $button-size + 3 * 2 + 2;
		background-color: #fff;
		padding: 3px;
		border-radius: 2px;
		border: 1px solid #ddd;
		background-color: #fff;
	}

	&-arrow {
		position: absolute;
		border: 6px solid transparent;
	}

	&[data-placement="top"] {
		transform: translate(-50%, -11px);
	}

	&[data-placement="top"] &-arrow {
		transform: translate(-50%, -1px);
		border-top-color: #fff;
		top: 100%;
		left: 50%;
	}

	&[data-placement="bottom"] {
		transform: translate(-50%, 11px);
	}

	&[data-placement="bottom"] &-arrow {
		transform: translate(-50%, 1px);
		border-bottom-color: #fff;
		bottom: 100%;
		left: 50%;
	}
}
</style>
