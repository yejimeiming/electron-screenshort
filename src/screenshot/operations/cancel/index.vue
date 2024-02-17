<script setup lang="ts">
import { Call } from '../../funcs/call'
import { useStore } from '../../store'
import ScreenshotButton from '../../screenshot-button/index.vue'

const store = useStore()

const onClick = () => {
  Call.onCancel()
  store.reset()
}
</script>

<template>
  <ScreenshotButton title="取消" icon="icon-cancel" @click="onClick" />
</template>
