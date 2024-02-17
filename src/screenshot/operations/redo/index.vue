<script setup lang="ts">
import { DHistory } from '../../funcs/draw.history'
import ScreenshotButton from '../../screenshot-button/index.vue'

const onClick = () => {
  DHistory.redo()
}
</script>

<template>
  <ScreenshotButton title="重做" icon="icon-redo"
    :disabled="!DHistory.history.stack.length || DHistory.history.stack.length - 1 === DHistory.history.index"
    @click="onClick" />
</template>
