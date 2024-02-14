<script setup lang="ts">
import { provide } from 'vue'
import ScreenshotBackground from './screenshot-background/index.vue'
import ScreenshotCanvas from './screenshot-canvas/index.vue'
import ScreenshotOperations from './screenshot-operations/index.vue'
import { composeImage } from './utils/image'
import { useStore } from './store'
import { USE_CALL_KEY } from './hooks/use-call'

import './styles/icons/iconfont.scss'
import './styles/screenshot.scss'

const props = defineProps<ScreenshotProps>()
const store = useStore()

// 将 onOk, onCancel 抛向后代组件
provide(USE_CALL_KEY, props)

const reset = () => {
	store.emiter = {}
	store.history = {
		index: -1,
		stack: [],
	}
	store.bounds = null
	store.cursor = 'move'
	store.operation = undefined
}

const onDoubleClick = async (e: MouseEvent) => {
	if (e.button !== 0 || !store.image) {
		return
	}
	if (store.bounds && store.canvasContext) {
		composeImage({
			image: store.image,
			width: store.width,
			height: store.height,
			history: store.history,
			bounds: store.bounds,
		}).then((blob) => {
			props.onOk(blob, store.bounds)
			reset()
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
			history: store.history,
			bounds: targetBounds,
		}).then((blob) => {
			props.onOk(blob, targetBounds)
			reset()
		})
	}
}

const onContextMenu = (e: MouseEvent) => {
	if (e.button !== 2) {
		return
	}
	e.preventDefault()
	props.onCancel()
	reset()
}

// url 变化，重置截图区域
// watch(() => store.url, () => reset())

</script>

<template>
	<div class='screenshot-index' :style='{ width, height }' @dblclick='onDoubleClick' @contextmenu='onContextMenu'>
		<ScreenshotBackground />
		<ScreenshotCanvas ref='store.canvasContext' />
		<ScreenshotOperations />
	</div>
</template>
