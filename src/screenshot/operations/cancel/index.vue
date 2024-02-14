<script setup lang="ts">
import { useCall } from '../../hooks/use-call'
import { useReset } from '../../hooks/use-reset'
import ScreenshotButton from '../../screenshot-button/index.vue'

const call = useCall()
const reset = useReset()

const onClick = () => {
  call.onCancel()
  reset()
}
</script>

<template>
  <ScreenshotButton title="取消" icon="icon-cancel" @click="onClick" />
</template>
