import { createApp } from 'vue'
import Screenshot from './screenshot.vue'
import Main from './main.vue'

import './index.scss'

const search = import.meta.url.split('?')[1]
const query = Object.fromEntries(new URLSearchParams(search).entries()) as { view: 'main' | 'screenshot' }
const root = document.getElementById('app')!

if (query.view === 'screenshot') {
  createApp(Screenshot).mount(root)
} else {
  createApp(Main).mount(root)
}
