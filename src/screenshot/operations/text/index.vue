<script setup lang="ts">
import {
  computed,
  onUnmounted,
  ref,
} from 'vue'
import { Canvas } from '../../screenshot-canvas/canvas'
import { Events } from '../../screenshot-canvas/events'
import { DHistory } from '../../funcs/draw.history'
import { HistoryItemType } from '../../enums'
import { useStore } from '../../store'
import type {
  TextData,
  TextEditData,
  TextareaBounds,
} from './types'
import type { HistoryItemEdit, HistoryItemSource } from '../../types'
import { draw, isHit, sizes } from './draw'
import ScreenshotTextarea from '../../screenshot-textarea/index.vue'
import ScreenshotButton from '../../screenshot-button/index.vue'
import ScreenshotSize from '../../screenshot-size/index.vue'
import ScreenshotColor from '../../screenshot-color/index.vue'

const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const textRef = ref<HistoryItemSource<TextData, TextEditData> | null>(null)
const textEditRef = ref<HistoryItemEdit<TextEditData, TextData> | null>(null)
const textareaBounds = ref<TextareaBounds | null>(null)
const text = ref('')

const checked = computed(() => store.operation === 'Text')

const selectText = () => {
  store.setOperation('Text')
  store.setCursor('default')
}

const onSelectText = () => {
  if (checked.value) {
    return
  }
  selectText()
  DHistory.clearSelect()
}

const onSizeChange = (s: number) => {
  if (textRef.value) {
    textRef.value.data.size = sizes[s]
  }
  size.value = s
}

const onColorChange = (c: string) => {
  if (textRef.value) {
    textRef.value.data.color = c
  }
  color.value = c
}

const onTextareaChange = (value: string) => {
  text.value = value
  if (checked.value && textRef.value) {
    textRef.value.data.text = value
  }
}

const onTextareaBlur = () => {
  if (textRef.value && textRef.value.data.text) {
    DHistory.push(textRef.value)
  }
  textRef.value = null
  text.value = ''
  textareaBounds.value = null
}

const stopDrawSelect = Events.on('drawselect', (
  e: MouseEvent,
  action: HistoryItemSource<unknown, unknown>,
) => {
  if (action.name !== 'Text') {
    return
  }

  selectText()

  textEditRef.value = {
    type: HistoryItemType.Edit,
    data: {
      x1: e.clientX,
      y1: e.clientY,
      x2: e.clientX,
      y2: e.clientY
    },
    source: action as HistoryItemSource<TextData, TextEditData>
  }

  DHistory.select(action)
})

const stopMousedown = Events.on('mousedown', (e: MouseEvent) => {
  if (!checked.value || !Canvas.ctx || textRef.value || !store.bounds) {
    return
  }
  const { left, top } =
    Canvas.ctx.canvas.getBoundingClientRect()
  const fontFamily = window.getComputedStyle(
    Canvas.ctx.canvas
  ).fontFamily
  const x = e.clientX - left
  const y = e.clientY - top

  textRef.value = {
    name: 'Text',
    type: HistoryItemType.Source,
    data: {
      size: sizes[size.value],
      color: color.value,
      fontFamily,
      x,
      y,
      text: '',
    },
    editHistory: [],
    draw,
    isHit,
  }

  textareaBounds.value = {
    x: e.clientX,
    y: e.clientY,
    maxWidth: store.bounds.width - x,
    maxHeight: store.bounds.height - y,
  }
})

const stopMousemove = Events.on('mousemove', (e: MouseEvent): void => {
  if (!checked.value) {
    return
  }

  if (textEditRef.value) {
    textEditRef.value.data.x2 = e.clientX
    textEditRef.value.data.y2 = e.clientY
    if (DHistory.history.top !== textEditRef.value) {
      textEditRef.value.source.editHistory.push(textEditRef.value)
      DHistory.push(textEditRef.value)
    } else {
      DHistory.set(DHistory.history)
    }
  }
})

const stopMouseup = Events.on('mouseup', (): void => {
  if (!checked.value) {
    return
  }

  textEditRef.value = null
})

onUnmounted(() => {
  stopDrawSelect()
  stopMousedown()
  stopMousemove()
  stopMouseup()
})
</script>

<template>
  <ScreenshotButton title="文本" icon="icon-text" :checked="checked" @click="onSelectText">
    <template v-slot:option>
      <ScreenshotSize :value="size" :onChange="onSizeChange" />
      <ScreenshotColor :value="color" :onChange="onColorChange" />
    </template>
  </ScreenshotButton>
  <ScreenshotTextarea v-if="checked && textareaBounds" :x="textareaBounds.x" :y="textareaBounds.y"
    :maxWidth="textareaBounds.maxWidth" :maxHeight="textareaBounds.maxHeight" :size="sizes[size]" :color="color"
    :value="text" :onChange="onTextareaChange" :onBlur="onTextareaBlur" />
</template>
