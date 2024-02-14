<script setup lang="ts">
import { ref } from 'vue'
import ScreenshotsButton from '../../screenshot-button/index.vue'
import ScreenshotsSizeColor from '../../screenshot-size-color/index.vue'
import { useCanvasMousedown } from '../../hooks/useCanvasMousedown'
import { useCanvasMousemove } from '../../hooks/useCanvasMousemove'
import { useCanvasMouseup } from '../../hooks/useCanvasMouseup'
import { useCursor } from '../../hooks/useCursor'
import { useOperation } from '../../hooks/useOperation'
import { useHistory } from '../../hooks/useHistory'
import { isHit, isHitCircle } from '../utils'
import { useDrawSelect } from '../../hooks/useDrawSelect'
import { HistoryItemType } from '../../enums'
import { useStore } from '../../store'
import { draw, getEditedArrowData } from './draw'
import { ArrowData, ArrowEditData, ArrowEditType } from './types'

const store = useStore()
const [, cursorDispatcher] = useCursor()
const [operation, operationDispatcher] = useOperation()
const [history, historyDispatcher] = useHistory()
const size = ref(3)
const color = ref('#ee5126')
const arrowRef = ref<HistoryItemSource<ArrowData, ArrowEditData> | null>(null)
const arrowEditRef = ref<HistoryItemEdit<ArrowEditData, ArrowData> | null>(null)

const checked = operation === 'Arrow'

const selectArrow = () => {
  operationDispatcher.set('Arrow')
  cursorDispatcher.set('default')
}

const onSelectArrow = () => {
  if (checked) {
    return
  }
  selectArrow()
  historyDispatcher.clearSelect()
}

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const onDrawSelect = (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
  if (action.name !== 'Arrow' || !store.canvasContext) {
    return
  }

  const source = action as HistoryItemSource<ArrowData, ArrowEditData>
  selectArrow()

  const { x1, y1, x2, y2 } = getEditedArrowData(source)
  let type = ArrowEditType.Move
  if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x1,
      y: y1
    })
  ) {
    type = ArrowEditType.MoveStart
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x2,
      y: y2
    })
  ) {
    type = ArrowEditType.MoveEnd
  }

  arrowEditRef.value = {
    type: HistoryItemType.Edit,
    data: {
      type,
      x1: e.clientX,
      y1: e.clientY,
      x2: e.clientX,
      y2: e.clientY
    },
    source
  }

  historyDispatcher.select(action)
}

const onMousedown = (e: MouseEvent) => {
  if (!checked || arrowRef.value || !store.canvasContext) {
    return
  }

  const { left, top } = store.canvasContext.canvas.getBoundingClientRect()
  arrowRef.value = {
    name: 'Arrow',
    type: HistoryItemType.Source,
    data: {
      size: size.value,
      color: color.value,
      x1: e.clientX - left,
      y1: e.clientY - top,
      x2: e.clientX - left,
      y2: e.clientY - top
    },
    editHistory: [],
    draw,
    isHit
  }
}

const onMousemove = (e: MouseEvent) => {
  if (!checked || !store.canvasContext) {
    return
  }
  if (arrowEditRef.value) {
    arrowEditRef.value.data.x2 = e.clientX
    arrowEditRef.value.data.y2 = e.clientY
    if (history.top !== arrowEditRef.value) {
      arrowEditRef.value.source.editHistory.push(arrowEditRef.value)
      historyDispatcher.push(arrowEditRef.value)
    } else {
      historyDispatcher.set(history)
    }
  } else if (arrowRef.value) {
    const { left, top } = store.canvasContext.canvas.getBoundingClientRect()

    arrowRef.value.data.x2 = e.clientX - left
    arrowRef.value.data.y2 = e.clientY - top

    if (history.top !== arrowRef.value) {
      historyDispatcher.push(arrowRef.value)
    } else {
      historyDispatcher.set(history)
    }
  }
}

const onMouseup = () => {
  if (!checked) {
    return
  }

  if (arrowRef.value) {
    historyDispatcher.clearSelect()
  }

  arrowRef.value = null
  arrowEditRef.value = null
}

useDrawSelect(onDrawSelect)
useCanvasMousedown(onMousedown)
useCanvasMousemove(onMousemove)
useCanvasMouseup(onMouseup)
</script>

<template>
  <ScreenshotsButton title="箭头" icon='icon-arrow' :checked="checked" @click="onSelectArrow">
    <template v-slot:option>
      <ScreenshotsSizeColor :size="size" :color="color" :onSizeChange="onSizeChange" :onColorChange="onColorChange" />
    </template>
  </ScreenshotsButton>
</template>
