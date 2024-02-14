<script setup lang="ts">
import { ref } from 'vue'
import { useCursor } from '../../hooks/useCursor'
import { useHistory } from '../../hooks/useHistory'
import { useOperation } from '../../hooks/useOperation'
import { useCanvasMousedown } from '../../hooks/useCanvasMousedown'
import { useCanvasMousemove } from '../../hooks/useCanvasMousemove'
import { useCanvasMouseup } from '../../hooks/useCanvasMouseup'
import { useDrawSelect } from '../../hooks/useDrawSelect'
import { HistoryItemType } from '../../enums'
import { useStore } from '../../store'
import type { TextData, TextEditData, TextareaBounds } from './types'
import { draw, isHit, sizes } from './utils'
import ScreenshotButton from '../../screenshot-button/index.vue'
import ScreenshotsTextarea from '../../screenshot-textarea/index.vue'
import ScreenshotsSizeColor from '../../screenshot-size-color/index.vue'

const [history, historyDispatcher] = useHistory()
const [operation, operationDispatcher] = useOperation()
const [, cursorDispatcher] = useCursor()
const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const textRef = ref<HistoryItemSource<TextData, TextEditData> | null>(null)
const textEditRef = ref<HistoryItemEdit<TextEditData, TextData> | null>(null)
const textareaBounds = ref<TextareaBounds | null>(null)
const text = ref('')

const checked = operation === 'Text'

const selectText = () => {
  operationDispatcher.set('Text')
  cursorDispatcher.set('default')
}

const onSelectText = () => {
  if (checked) {
    return
  }
  selectText()
  historyDispatcher.clearSelect()
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
  if (checked && textRef.value) {
    textRef.value.data.text = value
  }
}

const onTextareaBlur = () => {
  if (textRef.value && textRef.value.data.text) {
    historyDispatcher.push(textRef.value)
  }
  textRef.value = null
  text.value = ''
  textareaBounds.value = null
}

const onDrawSelect = (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
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

  historyDispatcher.select(action)
}

const onMousedown = (e: MouseEvent) => {
  if (!checked || !store.canvasContext || textRef.value || !store.bounds) {
    return
  }
  const { left, top } =
    store.canvasContext.canvas.getBoundingClientRect()
  const fontFamily = window.getComputedStyle(
    store.canvasContext.canvas
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
    isHit
  }

  textareaBounds.value = {
    x: e.clientX,
    y: e.clientY,
    maxWidth: store.bounds.width - x,
    maxHeight: store.bounds.height - y,
  }
}

const onMousemove = (e: MouseEvent): void => {
  if (!checked) {
    return
  }

  if (textEditRef.value) {
    textEditRef.value.data.x2 = e.clientX
    textEditRef.value.data.y2 = e.clientY
    if (history.top !== textEditRef.value) {
      textEditRef.value.source.editHistory.push(textEditRef.value)
      historyDispatcher.push(textEditRef.value)
    } else {
      historyDispatcher.set(history)
    }
  }
}

const onMouseup = (): void => {
  if (!checked) {
    return
  }

  textEditRef.value = null
}

useDrawSelect(onDrawSelect)
useCanvasMousedown(onMousedown)
useCanvasMousemove(onMousemove)
useCanvasMouseup(onMouseup)
</script>

<template>
  <ScreenshotButton title="文本" icon="icon-text" :checked="checked" @click="onSelectText">
    <template v-slot:option>
      <ScreenshotsSizeColor :size="size" :color="color" :onSizeChange="onSizeChange" :onColorChange="onColorChange" />
    </template>
  </ScreenshotButton>
  <ScreenshotsTextarea v-if="checked && textareaBounds" :x="textareaBounds.x" :y="textareaBounds.y"
    :maxWidth="textareaBounds.maxWidth" :maxHeight="textareaBounds.maxHeight" :size="sizes[size]" :color="color"
    :value="text" :onChange="onTextareaChange" :onBlur="onTextareaBlur" />
</template>
