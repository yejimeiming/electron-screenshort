<script setup lang="ts">
import { useCall } from '../../hooks/useCall'
import { useHistory } from '../../hooks/useHistory'
import { useReset } from '../../hooks/useReset'
import { composeImage } from '../../utils/image'
import { useStore } from '../../store'
import ScreenshotsButton from '../../screenshot-button/index.vue'

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
  <ScreenshotsButton title="搜图" icon="icon-search" @click="onClick" />
</template>
