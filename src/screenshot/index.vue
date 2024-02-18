<script setup lang="ts">
import { DHistory } from './funcs/draw.history'
import { Call } from './funcs/call'
import { Mouse } from './funcs/mouse'
import { points2bounds } from './funcs/mouse.utils'
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

// ------- global init something -------

Call._init({
	async onOk(blob: Blob) {
		await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])

		alert('已经复制截图到剪切板 ^_^')

		window.ipcRenderer.invoke('exit-screenshot')
	},
	async onCancel() {
		window.ipcRenderer.invoke('exit-screenshot')
	},
	async onSave(blob: Blob) {
		console.log('点击保存:', blob)
	}
})

Mouse.up(args => {
	if (store.bounds) {
		store.setBoundsDrawn(true)
	}
})

Mouse.move(args => {
	const { event, mousedown } = args

	// 全局鼠标坐标
	store.setClientX(args.clientX)
	store.setClientY(args.clientY)

	if (mousedown && !store.boundsDrawn) {
		// 按住鼠标移动 - 画框
		store.setBounds(points2bounds(
			{ x: args.startX!, y: args.startY! },
			{ x: event.clientX, y: event.clientY },
			store.width,
			store.height,
		))
	}
})
</script>

<template>
	<div class="screenshot-index" :style="{ width: `${store.width}px`, height: `${store.height}px` }" @dblclick="onDoubleClick"
		@contextmenu="onContextMenu">
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
