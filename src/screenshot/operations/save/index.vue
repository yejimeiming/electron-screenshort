<script setup lang="ts">
import { composeImage } from '../../utils/image'
import { useStore } from '../../store'
import { DHistory } from '../../funcs/draw.history'
import { Call } from '../../funcs/call'
import { Canvas } from '../../screenshot-canvas/canvas'
import ScreenshotButton from '../../screenshot-button/index.vue'

const store = useStore()

const onClick = () => {
  const { image, width, height, bounds } = store
  DHistory.clearSelect()
  setTimeout(() => {
    if (!Canvas.ctx || !image || !bounds) {
      return
    }
    composeImage({
      image,
      width,
      height,
      history: DHistory.history,
      bounds
    }).then(blob => {
      Call.onSave(blob, bounds)
      store.reset()
    })
  })
}
</script>

<template>
  <ScreenshotButton title="保存" icon="icon-save" @click="onClick" />
</template>
