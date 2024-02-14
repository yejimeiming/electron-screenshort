<script setup lang="ts">
import { useHistory } from '../../hooks/use-history'
import ScreenshotButton from '../../screenshot-button/index.vue'

const [history, historyDispatcher] = useHistory()

const onClick = () => {
  historyDispatcher.redo()
}
</script>

<template>
  <ScreenshotButton title="重做" icon="icon-redo"
    :disabled="!history.stack.length || history.stack.length - 1 === history.index" @click="onClick" />
</template>
