<script setup lang="ts">
import { useHistory } from '../../hooks/use-history'
import { useReset } from '../../hooks/use-reset'
import { composeImage } from '../../utils/image'
import { useStore } from '../../store'
import { useCall } from '../../hooks/use-call'
import ScreenshotButton from '../../screenshot-button/index.vue'

const store = useStore()
const [, historyDispatcher] = useHistory()
const call = useCall()
const reset = useReset()

const onClick = () => {
  const { image, width, height, history, bounds } = store
  historyDispatcher.clearSelect()

  setTimeout(() => {
    if (!store.canvasContext || !image || !bounds) {
      return
    }
    composeImage({
      image,
      width,
      height,
      history,
      bounds
    }).then(blob => {
      call.onOk(blob, bounds)
      reset()
    })
  })
}
</script>

<template>
  <ScreenshotButton title="确定" icon='icon-ok' @click="onClick" />
</template>
