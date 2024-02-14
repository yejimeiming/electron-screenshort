<script setup lang="ts">
import { useCall } from '../../hooks/useCall'
import { useReset } from '../../hooks/useReset'
import ScreenshotsButton from '../../screenshot-button/index.vue'

const call = useCall()
const reset = useReset()

const onClick = () => {
  call.onCancel()
  reset()
}
</script>

<template>
  <ScreenshotsButton title="取消" icon="icon-cancel" @click="onClick" />
</template>
