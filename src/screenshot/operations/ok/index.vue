<script setup lang="ts">
import { Call } from '../../funcs/call'
import { DHistory } from '../../funcs/draw.history'
import { Canvas } from '../../screenshot-canvas/canvas'
import { composeImage } from '../../utils/image'
import { useStore } from '../../store'
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
      Call.onOk(blob, bounds)
      store.reset()
    })
  })
}
</script>

<template>
  <ScreenshotButton title="确定" icon='icon-ok' @click="onClick" />
</template>
