import { createApp } from 'vue'
import Screenshot from './screenshot.vue'
import { initStore } from './screenshot/store'
import { resolveImage } from './screenshot/utils/image'
import Main from './main.vue'

import './index.scss'

const search = import.meta.url.split('?')[1]
const query = Object.fromEntries(new URLSearchParams(search).entries()) as { view: 'main' | 'screenshot' }
const root = document.getElementById('app')!

if (query.view === 'screenshot') {
  window
    .ipcRenderer
    .invoke('get-screenshort-image')
    .then(async (screenshortDataURL: string) => {
      const image = await resolveImage(screenshortDataURL)
      
      if (!image) {
        throw new Error('加载截图失败！')
      }

      initStore({
        url: screenshortDataURL,
        width: window.innerWidth,
        height: window.innerHeight,
        image,
      })
      createApp(Screenshot).mount(root)
    })
} else {
  createApp(Main).mount(root)
}
