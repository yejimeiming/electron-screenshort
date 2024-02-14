<script setup lang="ts">
const clickScreenshot = () => {
  window.ipcRenderer.invoke('call-screenshot')
}
</script>

<template>
  <div class='app-main'>
    <div class='inner-box'>
      <button @click="clickScreenshot">点击截图</button>
      <br />
      <span>快捷键: Command/Control + Shift + S</span>
    </div>
  </div>
</template>

<style lang="scss">
.app-main {
  display: flex;
  align-items: center;
  justify-content: center;

  .inner-box {
    text-align: center;

    button {
      margin-bottom: 10px;
      cursor: pointer;
    }
  }
}
</style>
