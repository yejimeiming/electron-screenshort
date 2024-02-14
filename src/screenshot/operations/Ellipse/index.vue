<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasMousedown } from '../../hooks/useCanvasMousedown'
import { useCanvasMousemove } from '../../hooks/useCanvasMousemove'
import { useCanvasMouseup } from '../../hooks/useCanvasMouseup'
import { useDrawSelect } from '../../hooks/useDrawSelect'
import { useCursor } from '../../hooks/useCursor'
import { useStore } from '../../store'
import { useHistory } from '../../hooks/useHistory'
import { useOperation } from '../../hooks/useOperation'
import { HistoryItemType } from '../../enums'
import { isHit, isHitCircle } from '../utils'
import { draw, getEditedEllipseData } from './draw'
import { EllipseData, EllipseEditData, EllipseEditType } from './types'
import ScreenshotsButton from '../../screenshot-button/index.vue'
import ScreenshotsSizeColor from '../../screenshot-size-color/index.vue'

const [history, historyDispatcher] = useHistory()
const [operation, operationDispatcher] = useOperation()
const [, cursorDispatcher] = useCursor()
const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const ellipseRef = ref<HistoryItemSource<EllipseData, EllipseEditData> | null>(null)
const ellipseEditRef = ref<HistoryItemEdit<EllipseEditData, EllipseData> | null>(null)

const checked = operation === 'Ellipse'

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const selectEllipse = () => {
  operationDispatcher.set('Ellipse')
  cursorDispatcher.set('crosshair')
}

const onSelectEllipse = () => {
  if (checked) {
    return
  }
  selectEllipse()
  historyDispatcher.clearSelect()
}

const onDrawSelect = (action: HistoryItemSource<unknown, unknown>, e: MouseEvent) => {
  if (action.name !== 'Ellipse' || !store.canvasContext) {
    return
  }

  const source = action as HistoryItemSource<EllipseData, EllipseEditData>

  selectEllipse()

  const { x1, y1, x2, y2 } = getEditedEllipseData(source)

  let type = EllipseEditType.Move
  if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: (x1 + x2) / 2,
      y: y1
    })
  ) {
    type = EllipseEditType.ResizeTop
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x2,
      y: y1
    })
  ) {
    type = EllipseEditType.ResizeRightTop
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x2,
      y: (y1 + y2) / 2
    })
  ) {
    type = EllipseEditType.ResizeRight
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x2,
      y: y2
    })
  ) {
    type = EllipseEditType.ResizeRightBottom
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: (x1 + x2) / 2,
      y: y2
    })
  ) {
    type = EllipseEditType.ResizeBottom
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x1,
      y: y2
    })
  ) {
    type = EllipseEditType.ResizeLeftBottom
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x1,
      y: (y1 + y2) / 2
    })
  ) {
    type = EllipseEditType.ResizeLeft
  } else if (
    isHitCircle(store.canvasContext.canvas, e, {
      x: x1,
      y: y1
    })
  ) {
    type = EllipseEditType.ResizeLeftTop
  }

  ellipseEditRef.value = {
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
  if (!checked || !store.canvasContext || ellipseRef.value) {
    return
  }

  const { left, top } = store.canvasContext.canvas.getBoundingClientRect()
  const x = e.clientX - left
  const y = e.clientY - top
  ellipseRef.value = {
    name: 'Ellipse',
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

  if (ellipseEditRef.value) {
    ellipseEditRef.value.data.x2 = e.clientX
    ellipseEditRef.value.data.y2 = e.clientY
    if (history.top !== ellipseEditRef.value) {
      ellipseEditRef.value.source.editHistory.push(ellipseEditRef.value)
      historyDispatcher.push(ellipseEditRef.value)
    } else {
      historyDispatcher.set(history)
    }
  } else if (ellipseRef.value) {
    const { left, top } = store.canvasContext.canvas.getBoundingClientRect()
    ellipseRef.value.data.x2 = e.clientX - left
    ellipseRef.value.data.y2 = e.clientY - top

    if (history.top !== ellipseRef.value) {
      historyDispatcher.push(ellipseRef.value)
    } else {
      historyDispatcher.set(history)
    }
  }
}

const onMouseup = () => {
  if (!checked) {
    return
  }

  if (ellipseRef.value) {
    historyDispatcher.clearSelect()
  }

  ellipseRef.value = null
  ellipseEditRef.value = null
}

useDrawSelect(onDrawSelect)
useCanvasMousedown(onMousedown)
useCanvasMousemove(onMousemove)
useCanvasMouseup(onMouseup)
</script>

<template>
  <ScreenshotsButton title="椭圆" icon="icon-ellipse" :checked="checked" @click="onSelectEllipse">
    <template v-slot:option>
      <ScreenshotsSizeColor :size="size" :color="color" :onSizeChange="onSizeChange" :onColorChange="onColorChange" />
    </template>
  </ScreenshotsButton>
</template>
