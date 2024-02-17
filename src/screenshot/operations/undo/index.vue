<script setup lang="ts">
import { DHistory } from '../../funcs/draw.history'
import ScreenshotButton from '../../screenshot-button/index.vue'

const onClick = () => {
  DHistory.undo()
}
</script>

<template>
  <ScreenshotButton title="撤销" icon="icon-undo" :disabled="DHistory.history.index === -1" @click="onClick" />
</template>
