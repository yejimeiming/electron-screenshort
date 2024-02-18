<script setup lang="ts">
import {
	computed,
	ref,
} from 'vue'
import type { Position } from '../types'
import { operationsRect } from '../operations/state'

interface OptionBox {
	placement: Placement // 选项框位于操作按钮框位置
	position?: Position // 选项框坐标
	offsetX: number // 选项框小箭头图标
}

enum Placement {
	Bottom = 'bottom',
	Top = 'top',
}

const props = defineProps<{ open?: boolean }>()
const oChildren = ref<HTMLDivElement | null>(null)
const oOption = ref<HTMLDivElement | null>(null)

const box = computed<OptionBox>(() => {
	const box: OptionBox = {
		placement: Placement.Bottom,
		offsetX: 0,
	}

	if (!props.open) {
		return box
	}
	if (
		operationsRect.x == null ||
		operationsRect.width == null ||
		!oChildren.value ||
		!oOption.value
	) {
		throw new Error('渲染操作绘制按钮子选项失败')
	}

	const childrenRect = oChildren.value.getBoundingClientRect()
	const contentRect = oOption.value.getBoundingClientRect()

	let x = childrenRect.left + childrenRect.width / 2 // 对齐选中操作按钮中间
	let y = childrenRect.top + childrenRect.height + /* 间距 */10

	// 如果左右都越界了，就以左边界为准
	if (x + contentRect.width / 2 > operationsRect.x + operationsRect.width) {
		const ox = x
		x = operationsRect.x + operationsRect.width - contentRect.width / 2
		box.offsetX = ox - x
	}

	// 左边不能超出
	if (x < operationsRect.x + contentRect.width / 2) {
		const ox = x
		x = operationsRect.x + contentRect.width / 2
		box.offsetX = ox - x
	}

	// 如果上下都越界了，就以上边界为准
	if (y > window.innerHeight - contentRect.height) {
		box.placement = Placement.Top
		y = childrenRect.top - contentRect.height
	}

	if (y < 0) {
		box.placement = Placement.Bottom
		y = childrenRect.top + childrenRect.height
	}

	box.position = { x, y }
	return box
})
</script>

<template>
	<!-- `v-slot:name` 指令只能放到 `template` 标签，这里需要套个 div 获取 ref -->
	<div ref="oChildren" class="screenshot-button-box">
		<slot name="children" />
	</div>

	<Teleport to="#teleport-operations">
		<div ref="oOption" class="screenshot-option" :data-placement="box.placement" :style="{
			visibility: box.position ? undefined : 'hidden',
			transform: box.position ? `translate(${box.position.x}px, ${box.position.y}px)` : undefined,
		}">
			<template v-if="open">
				<div class="screenshot-option-container">
					<!-- 渲染制作图案的子选项 (尺寸、颜色) -->
					<slot name="option" />
				</div>
				<div class="screenshot-option-arrow" :style="{ marginLeft: `${box.offsetX}px` }" />
			</template>
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
		display: flex;
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
