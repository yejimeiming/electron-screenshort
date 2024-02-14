<script setup lang="ts">
import { useHistory } from '../../hooks/useHistory'
import ScreenshotsButton from '../../screenshot-button/index.vue'

const [history, historyDispatcher] = useHistory()

const onClick = () => {
  historyDispatcher.undo()
}
</script>

<template>
  <ScreenshotsButton title="撤销" icon="icon-undo" :disabled="history.index === -1" @click="onClick" />
</template>
