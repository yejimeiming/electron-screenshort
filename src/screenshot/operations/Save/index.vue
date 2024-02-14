<script setup lang="ts">
import { composeImage } from '../../utils/image'
import { useStore } from '../../store'
import { useCall } from '../../hooks/useCall'
import { useHistory } from '../../hooks/useHistory'
import { useReset } from '../../hooks/useReset'
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
      bounds
    }).then(blob => {
      // call('onSave', blob, bounds)
      call.onOk(blob, bounds)
      reset()
    })
  })
}
</script>

<template>
  <ScreenshotsButton title="保存" icon="icon-save" @click="onClick" />
</template>
