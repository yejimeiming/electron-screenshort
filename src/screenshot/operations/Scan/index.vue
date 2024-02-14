<script setup lang="ts">
import QrScanner from 'qr-scanner'
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
    }).then(async (blob) => {
      try {
        const result = await QrScanner.scanImage(blob)
        if (result) {
          // call('onScan', result) - 扫码
        }
      } catch (error) {
        console.error('Error:', error)
      }

      reset()
    })
  })
}
</script>

<template>
  <ScreenshotsButton title="扫码" icon="icon-scan" @click="onClick" />
</template>
