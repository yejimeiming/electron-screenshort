<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { calculateNodeSize } from './utils'

const props = defineProps<{
	x: number
	y: number
	maxWidth: number
	maxHeight: number
	size: number
	color: string
	value: string
	onChange: (value: string) => unknown
	onBlur: (e: FocusEvent) => unknown
}>()

const popoverRef = ref<HTMLDivElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const width = ref(0)
const height = ref(0)

const getPopoverEl = () => {
	if (!popoverRef.value) {
		popoverRef.value = document.createElement('div')
	}
	return popoverRef.value
}

onMounted(() => {
	if (popoverRef.value) {
		document.body.appendChild(popoverRef.value)
		requestAnimationFrame(() => {
			textareaRef.value?.focus()
		})
	}

	return () => {
		popoverRef.value?.remove()
	}
})

watch([
	props.value,
	props.maxWidth,
	props.maxHeight,
], () => {
	if (!textareaRef.value) return
	const {
		value,
		maxWidth,
		maxHeight,
	} = props
	const { width: w, height: h } = calculateNodeSize(
		textareaRef.value,
		value,
		maxWidth,
		maxHeight,
	)
	width.value = w
	height.value = h
})
</script>

<template>
	<Teleport :to="getPopoverEl">
		<textarea ref="textareaRef" class="screenshot-textarea" :style="{
			color,
			width,
			height,
			maxWidth,
			maxHeight,
			fontSize: size,
			lineHeight: `${size}px`, transform: `translate(${x}px, ${y}px)`,
		}" :value="value" @change="onChange?.(($event.target as any).value)" @blur="onBlur?.($event)" />
	</Teleport>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshot-textarea {
	box-sizing: border-box;
	position: absolute;
	left: 0;
	top: 0;
	margin: 0;
	padding: 0;
	background-color: transparent;
	border: 2px solid $border-color;
	resize: none;
	outline: none;
	white-space: nowrap;
	word-break: break-all;
	overflow: hidden;
	font-family: $font-family;
	text-align: left;
}
</style>
