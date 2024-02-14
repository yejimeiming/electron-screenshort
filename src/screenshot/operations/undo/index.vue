<script setup lang="ts">
import { useHistory } from '../../hooks/use-history'
import ScreenshotButton from '../../screenshot-button/index.vue'

const [history, historyDispatcher] = useHistory()

const onClick = () => {
  historyDispatcher.undo()
}
</script>

<template>
  <ScreenshotButton title="撤销" icon="icon-undo" :disabled="history.index === -1" @click="onClick" />
</template>
