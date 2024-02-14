<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasMousedown } from '../../hooks/useCanvasMousedown'
import { useCanvasMousemove } from '../../hooks/useCanvasMousemove'
import { useCanvasMouseup } from '../../hooks/useCanvasMouseup'
import { useCursor } from '../../hooks/useCursor'
import { useDrawSelect } from '../../hooks/useDrawSelect'
import { useHistory } from '../../hooks/useHistory'
import { useOperation } from '../../hooks/useOperation'
import { isHit, isHitCircle } from '../utils'
import { useStore } from '../../store'
import { HistoryItemType } from '../../enums'
import { draw, getEditedRectangleData } from './draw'
import { RectangleData, RectangleEditData, RectangleEditType } from './types'
import ScreenshotsButton from '../../screenshot-button/index.vue'
import ScreenshotsSizeColor from '../../screenshot-size-color/index.vue'

const [history, historyDispatcher] = useHistory()
const [operation, operationDispatcher] = useOperation()
const [, cursorDispatcher] = useCursor()
const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const rectangleRef = ref<HistoryItemSource<RectangleData, RectangleEditData> | null>(null)
const rectangleEditRef = ref<HistoryItemEdit<RectangleEditData, RectangleData> | null>(null)

const checked = operation === 'Rectangle'

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const selectRectangle = () => {
  operationDispatcher.set('Rectangle')
  cursorDispatcher.set('crosshair')
}

const onSelectRectangle = () => {
  if (checked) {
    return
  }
  selectRectangle()
  historyDispatcher.clearSelect()
}

const onDrawSelect = (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
  if (action.name !== 'Rectangle' || !store.canvasContext) {
    return
  }

  const source = action as HistoryItemSource<RectangleData, RectangleEditData>
  selectRectangle()

  const { x1, y1, x2, y2 } = getEditedRectangleData(source)

  let type = RectangleEditType.Move
  if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: (x1 + x2) / 2,
      y: y1
    })
  ) {
    type = RectangleEditType.ResizeTop
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x2,
      y: y1
    })
  ) {
    type = RectangleEditType.ResizeRightTop
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x2,
      y: (y1 + y2) / 2
    })
  ) {
    type = RectangleEditType.ResizeRight
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x2,
      y: y2
    })
  ) {
    type = RectangleEditType.ResizeRightBottom
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: (x1 + x2) / 2,
      y: y2
    })
  ) {
    type = RectangleEditType.ResizeBottom
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x1,
      y: y2
    })
  ) {
    type = RectangleEditType.ResizeLeftBottom
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x1,
      y: (y1 + y2) / 2
    })
  ) {
    type = RectangleEditType.ResizeLeft
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x1,
      y: y1
    })
  ) {
    type = RectangleEditType.ResizeLeftTop
  }

  rectangleEditRef.value = {
    type: HistoryItemType.Edit,
    data: {
      type,
      x1: e.clientX,
      y1: e.clientY,
      x2: e.clientX,
      y2: e.clientY
    },
    source: action as HistoryItemSource<RectangleData, RectangleEditData>
  }

  historyDispatcher.select(action)
}

const onMousedown = (e: MouseEvent) => {
  if (!checked || !store.canvasContext || rectangleRef.value) {
    return
  }

  const { left, top } = store.canvasContext.canvas.getBoundingClientRect()
  const x = e.clientX - left
  const y = e.clientY - top
  rectangleRef.value = {
    name: 'Rectangle',
    type: HistoryItemType.Source,
    data: {
      size: size.value,
      color: color.value,
      x1: x,
      y1: y,
      x2: x,
      y2: y
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

  if (rectangleEditRef.value) {
    rectangleEditRef.value.data.x2 = e.clientX
    rectangleEditRef.value.data.y2 = e.clientY
    if (history.top !== rectangleEditRef.value) {
      rectangleEditRef.value.source.editHistory.push(rectangleEditRef.value)
      historyDispatcher.push(rectangleEditRef.value)
    } else {
      historyDispatcher.set(history)
    }
  } else if (rectangleRef.value) {
    const { left, top } = store.canvasContext.canvas.getBoundingClientRect()
    const rectangleData = rectangleRef.value.data
    rectangleData.x2 = e.clientX - left
    rectangleData.y2 = e.clientY - top

    if (history.top !== rectangleRef.value) {
      historyDispatcher.push(rectangleRef.value)
    } else {
      historyDispatcher.set(history)
    }
  }
}

const onMouseup = () => {
  if (!checked) {
    return
  }

  if (rectangleRef.value) {
    historyDispatcher.clearSelect()
  }

  rectangleRef.value = null
  rectangleEditRef.value = null
}

useDrawSelect(onDrawSelect)
useCanvasMousedown(onMousedown)
useCanvasMousemove(onMousemove)
useCanvasMouseup(onMouseup)

</script>

<template>
  <ScreenshotsButton title="矩形" icon="icon-rectangle" :checked="checked" @click="onSelectRectangle">
    <template v-slot:option>
      <ScreenshotsSizeColor :size="size" :color="color" :onSizeChange="onSizeChange" :onColorChange="onColorChange" />
    </template>
  </ScreenshotsButton>
</template>
