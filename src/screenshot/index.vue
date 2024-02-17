<script setup lang="ts">
import { DHistory } from './funcs/draw.history'
import { Call } from './funcs/call'
import { Canvas } from './screenshot-canvas/canvas'
import { useStore } from './store'
import { composeImage } from './utils/image'
import ScreenshotBackground from './screenshot-background/index.vue'
import ScreenshotCanvas from './screenshot-canvas/index.vue'
import ScreenshotOperations from './screenshot-operations/index.vue'

import './styles/icons/iconfont.scss'

const store = useStore()

const onDoubleClick = async (e: MouseEvent) => {
	if (e.button !== 0 || !store.image) {
		return
	}
	if (store.bounds && Canvas.ctx) {
		composeImage({
			image: store.image,
			width: store.width,
			height: store.height,
			history: DHistory.history,
			bounds: store.bounds,
		}).then((blob) => {
			Call.onOk(blob, store.bounds!)
			store.reset()
		})
	} else {
		const targetBounds = {
			x: 0,
			y: 0,
			width: store.width,
			height: store.height,
		}
		composeImage({
			image: store.image,
			width: store.width,
			height: store.height,
			history: DHistory.history,
			bounds: targetBounds,
		}).then((blob) => {
			Call.onOk(blob, targetBounds)
			store.reset()
		})
	}
}

const onContextMenu = (e: MouseEvent) => {
	if (e.button !== 2) {
		return
	}
	e.preventDefault()
	Call.onCancel()
	store.reset()
}

</script>

<template>
	<div class="screenshot-index" :style="{ width: store.width, height: store.height }" @dblclick="onDoubleClick" @contextmenu="onContextMenu">
		<!-- 背景图、悬浮框 -->
		<ScreenshotBackground />
		<!-- 截图框、二次绘制 -->
		<ScreenshotCanvas />
		<!-- 操作按钮 -->
		<ScreenshotOperations />
	</div>
</template>

<style lang="scss">
@import "./styles/var.scss";

.screenshot-index {
	width: 100%;
	height: 100%;
	position: relative;
	transform: translateZ(0);
	cursor: crosshair;
	font-family: $font-family;
	&,
	* {
		box-sizing: border-box;
		user-select: none;
	}
}
</style>
