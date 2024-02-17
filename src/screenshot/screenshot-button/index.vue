<script setup lang="ts">
import { computed } from 'vue'
import ScreenshotOption from '../screenshot-option/index.vue'

const props = defineProps<{
	title: string
	icon: string
	checked?: boolean
	disabled?: boolean
	onClick?: (e: MouseEvent) => unknown
}>()

const classNames = computed(() => [
	props.checked && 'screenshot-button-checked',
	props.disabled && 'screenshot-button-disabled',
].filter(Boolean) as string[])

const onButtonClick = (e: MouseEvent) => {
	if (props.disabled || !props.onClick) {
		return
	}
	props.onClick(e)
}
</script>

<template>
	<ScreenshotOption :open="checked">
		<template v-slot:option>
			<!-- slot 二段传送 -->
			<slot name="option" />
		</template>
		<template v-slot:children>
			<div :class="['screenshot-button'].concat(classNames)" :title="title" @click="onButtonClick">
				<span :class="icon" />
			</div>
		</template>
	</ScreenshotOption>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshot-button {
	width: $button-size;
	height: $button-size;
	line-height: $button-size;
	color: #333;
	font-size: 22px;
	text-align: center;
	margin: 0 3px;
	vertical-align: middle;
	cursor: pointer;

	&-checked {
		background-color: #eee;
		outline: 1px solid #777;
	}

	&-disabled {
		color: #bbb;
		cursor: not-allowed;

		&:hover {
			background-color: #fff;
			outline: none;
		}
	}
}
</style>
