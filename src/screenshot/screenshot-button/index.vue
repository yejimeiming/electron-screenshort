<script setup lang="ts">
import { ref } from 'vue'
import ScreenshotOption from '../screenshot-option/index.vue'

const props = defineProps<{
	title: string
	icon: string
	checked?: boolean
	disabled?: boolean
	onClick?: (e: MouseEvent) => unknown
}>()

const classNames = ref(['screenshots-button'])

const onButtonClick = (e: MouseEvent) => {
	if (props.disabled || !props.onClick) {
		return
	}
	props.onClick(e)
}

if (props.checked) {
	classNames.value = classNames.value.concat('screenshots-button-checked')
}

if (props.disabled) {
	classNames.value = classNames.value.concat('screenshots-button-disabled')
}
</script>

<template>
	<ScreenshotOption :open="checked">
		<template v-slot:content>
			<slot name="option" />
		</template>
		<div :class="classNames" :title="title" @click="onButtonClick">
			<span :class="icon" />
		</div>
	</ScreenshotOption>
</template>

<style lang="scss">
@import "../styles/var.scss";

.screenshots-button {
	width: $button-size;
	height: $button-size;
	line-height: $button-size;
	color: #333;
	font-size: 22px;
	text-align: center;
	margin: 0 3px;
	vertical-align: middle;
	cursor: pointer;

	&-checked,
	&:hover {
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
