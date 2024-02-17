<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '../store'
import ScreenshotMagnifier from '../screenshot-magnifier/index.vue'

// 组件职责: 渲染背景图、鼠标悬浮缩略图

const store = useStore()
const showMagnifier = computed(() => {
	// 画图状态下不显示缩略图
	if (store.bounds) return false
	return store.clientX != null
})
</script>

<template>
	<div class="screenshot-background">
		<img class="screenshot-background-image" :src="store.url" />
		<!-- 遮罩除了降低图片亮度，还可以防止直接鼠标拖到 <img> 标签出现 🌏 标记 -->
		<div class="screenshot-background-mask" />
		<ScreenshotMagnifier v-if="showMagnifier" />
	</div>
</template>

<style lang="scss">
.screenshot-background {
	width: 100%;
	height: 100%;
	position: relative;

	&-image {
		width: 100%;
		height: 100%;
		display: block;
		border: none;
		outline: none;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: crisp-edges;
		-webkit-font-smooting: antialiased;
	}

	&-mask {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
	}
}
</style>
