<script setup lang="ts">
import { useCall } from '../../hooks/use-call'
import { useHistory } from '../../hooks/use-history'
import { useReset } from '../../hooks/use-reset'
import { composeImage } from '../../utils/image'
import { useStore } from '../../store'
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
      bounds,
    }).then((blob) => {
      // call('onSearch', blob)
      reset()
    })
  })
}
</script>

<template>
  <ScreenshotButton title="搜图" icon="icon-search" @click="onClick" />
</template>
