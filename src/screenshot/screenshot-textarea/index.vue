<script setup lang="ts">
import {
	computed,
	onMounted,
	ref,
} from 'vue'
import { type Size, calculateNodeSize } from './utils'

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

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const boxSize = computed<Size>(() => {
	const value = props.value
	const maxWidth = props.maxWidth
	const maxHeight = props.maxHeight

	return textareaRef.value
		? calculateNodeSize(
			textareaRef.value,
			value,
			maxWidth,
			maxHeight,
		)
		: { width: 20, height: 20 } // 默认最小宽高
})

onMounted(() => {
	requestAnimationFrame(() => {
		textareaRef.value?.focus()
	});
})
</script>

<template>
	<Teleport to="#teleport-operations">
		<textarea ref="textareaRef" class="screenshot-textarea" :style="{
			color,
			width: `${boxSize.width}px`,
			height: `${boxSize.height}px`,
			maxWidth: `${maxWidth}px`,
			maxHeight: `${maxHeight}px`,
			fontSize: `${size}px`,
			lineHeight: `${size}px`,
			transform: `translate(${x}px, ${y}px)`,
		}" :value="value" @input="onChange?.(($event.target as any).value)" @blur="onBlur?.($event)" />
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
