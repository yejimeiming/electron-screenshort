<script setup lang="ts">
import Screenshot from './screenshot/index.vue'

const onOk = async (blob: Blob) => {
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])

  alert('已经复制截图到剪切板 ^_^')

  window.ipcRenderer.invoke('exit-screenshot')
}

const onCancel = () => {
  window.ipcRenderer.invoke('exit-screenshot')
}
</script>

<template>
  <div class='app-screenshot'>
    <Screenshot :onOk="onOk" :onCancel="onCancel" />
  </div>
</template>
