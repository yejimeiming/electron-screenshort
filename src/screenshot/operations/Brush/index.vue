<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasMousedown } from '../../hooks/useCanvasMousedown'
import { useCanvasMousemove } from '../../hooks/useCanvasMousemove'
import { useCanvasMouseup } from '../../hooks/useCanvasMouseup'
import { useCursor } from '../../hooks/useCursor'
import { useOperation } from '../../hooks/useOperation'
import { useHistory } from '../../hooks/useHistory'
import { useDrawSelect } from '../../hooks/useDrawSelect'
import { useStore } from '../../store'
import { HistoryItemType } from '../../enums'
import { isHit } from '../utils'
import { draw } from './draw'
import { BrushData, BrushEditData } from './types'
import ScreenshotsSizeColor from '../../screenshot-size-color/index.vue'
import ScreenshotsButton from '../../screenshot-button/index.vue'

const [, cursorDispatcher] = useCursor()
const [operation, operationDispatcher] = useOperation()
const [history, historyDispatcher] = useHistory()
const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const brushRef = ref<HistoryItemSource<BrushData, BrushEditData> | null>(null)
const brushEditRef = ref<HistoryItemEdit<BrushEditData, BrushData> | null>(null)

const checked = operation === 'Brush'

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const selectBrush = () => {
  operationDispatcher.set('Brush')
  cursorDispatcher.set('default')
}

const onSelectBrush = () => {
  if (checked) {
    return
  }
  selectBrush()
  historyDispatcher.clearSelect()
}

const onDrawSelect = (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
  if (action.name !== 'Brush') {
    return
  }

  selectBrush()

  brushEditRef.value = {
    type: HistoryItemType.Edit,
    data: {
      x1: e.clientX,
      y1: e.clientY,
      x2: e.clientX,
      y2: e.clientY
    },
    source: action as HistoryItemSource<BrushData, BrushEditData>
  }

  historyDispatcher.select(action)
}

const onMousedown = (e: MouseEvent): void => {
  if (!checked || brushRef.value || !store.canvasContext) {
    return
  }

  const { left, top } = store.canvasContext.canvas.getBoundingClientRect()

  brushRef.value = {
    name: 'Brush',
    type: HistoryItemType.Source,
    data: {
      size: size.value,
      color: color.value,
      points: [
        {
          x: e.clientX - left,
          y: e.clientY - top,
        }
      ]
    },
    editHistory: [],
    draw,
    isHit,
  }
}

const onMousemove = (e: MouseEvent): void => {
  if (!checked || !store.canvasContext) {
    return
  }

  if (brushEditRef.value) {
    brushEditRef.value.data.x2 = e.clientX
    brushEditRef.value.data.y2 = e.clientY
    if (history.top !== brushEditRef.value) {
      brushEditRef.value.source.editHistory.push(brushEditRef.value)
      historyDispatcher.push(brushEditRef.value)
    } else {
      historyDispatcher.set(history)
    }
  } else if (brushRef.value) {
    const { left, top } = store.canvasContext.canvas.getBoundingClientRect()

    brushRef.value.data.points.push({
      x: e.clientX - left,
      y: e.clientY - top
    })

    if (history.top !== brushRef.value) {
      historyDispatcher.push(brushRef.value)
    } else {
      historyDispatcher.set(history)
    }
  }
}

const onMouseup = (): void => {
  if (!checked) {
    return
  }

  if (brushRef.value) {
    historyDispatcher.clearSelect()
  }

  brushRef.value = null
  brushEditRef.value = null
}

useDrawSelect(onDrawSelect)
useCanvasMousedown(onMousedown)
useCanvasMousemove(onMousemove)
useCanvasMouseup(onMouseup)
</script>

<template>
  <ScreenshotsButton title="画笔" icon="icon-brush" :checked="checked" @click="onSelectBrush">
    <template v-slot:option>
      <ScreenshotsSizeColor :size="size" :color="color" :onSizeChange="onSizeChange" :onColorChange="onColorChange" />
    </template>
  </ScreenshotsButton>
</template>
