<script setup lang="ts">
import { resolveImage } from './screenshot/utils/image'
import { useStore } from './screenshot/store'
import Screenshot from './screenshot/index.vue'

const store = useStore()

window
  .ipcRenderer
  .invoke('get-screenshort-image')
  .then(async (screenshortDataURL: string) => {
    const image = await resolveImage(screenshortDataURL)

    if (!image) {
      throw new Error('加载截图失败')
    }

    store.set({
      url: screenshortDataURL,
      width: window.innerWidth,
      height: window.innerHeight,
      image,
    })
  })
</script>

<template>
  <div class="app-screenshot">
    <Screenshot v-if="store.image" />
  </div>
</template>
