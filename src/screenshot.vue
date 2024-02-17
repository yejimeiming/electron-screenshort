<script setup lang="ts">
import Screenshot from './screenshot/index.vue'
import { Call } from './screenshot/funcs/call'
import { Mouse } from './screenshot/funcs/mouse'
import { points2bounds } from './screenshot/funcs/mouse.utils'
import { useStore } from './screenshot/store'
import { resolveImage } from './screenshot/utils/image'

const store = useStore()

Call._init({
  async onOk(blob: Blob) {
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])

    alert('已经复制截图到剪切板 ^_^')

    window.ipcRenderer.invoke('exit-screenshot')
  },
  async onCancel() {
    window.ipcRenderer.invoke('exit-screenshot')
  },
  async onSave(blob: Blob) {
    console.log('点击保存:', blob)
  }
})

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

Mouse.up(args => {
  if (store.bounds) {
    store.setBoundsDrawn(true)
  }
})

Mouse.move(args => {
  const { event, mousedown } = args

  // 全局鼠标坐标
  store.setClientX(args.clientX)
  store.setClientY(args.clientY)

  if (mousedown && !store.boundsDrawn) {
    // 按住鼠标移动 - 画框
    store.setBounds(points2bounds(
      { x: args.startX, y: args.startY },
      { x: event.clientX, y: event.clientY },
      store.width,
      store.height,
    ))
  }
})

</script>

<template>
  <div class="app-screenshot">
    <Screenshot v-if="store.image" />
  </div>
</template>
