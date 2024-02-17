<script setup lang="ts">
import {
  computed,
  onUnmounted,
  ref,
} from 'vue'
import { Canvas } from '../../screenshot-canvas/canvas'
import { Events } from '../../screenshot-canvas/events'
import { DHistory } from '../../funcs/draw.history'
import { isHit, isHitCircle } from '../utils'
import { useStore } from '../../store'
import { HistoryItemType } from '../../enums'
import { draw, getEditedRectangleData } from './draw'
import {
  type RectangleData,
  type RectangleEditData,
  RectangleEditType,
} from './types'
import type { HistoryItemEdit, HistoryItemSource } from '../../types'
import ScreenshotButton from '../../screenshot-button/index.vue'
import ScreenshotSize from '../../screenshot-size/index.vue'
import ScreenshotColor from '../../screenshot-color/index.vue'

const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const rectangleRef = ref<HistoryItemSource<RectangleData, RectangleEditData> | null>(null)
const rectangleEditRef = ref<HistoryItemEdit<RectangleEditData, RectangleData> | null>(null)

const checked = computed(() => store.operation === 'Rectangle')

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const selectRectangle = () => {
  store.setOperation('Rectangle')
  store.setCursor('default')
}

const onSelectRectangle = () => {
  if (checked.value) {
    return
  }
  selectRectangle()
  DHistory.clearSelect()
}

const stopDrawSelect = Events.on('drawselect', (
  e: MouseEvent,
  action: HistoryItemSource<unknown, unknown>,
) => {
  if (action.name !== 'Rectangle' || !Canvas.ctx) {
    return
  }

  const source = action as HistoryItemSource<RectangleData, RectangleEditData>
  selectRectangle()

  const { x1, y1, x2, y2 } = getEditedRectangleData(source)

  let type = RectangleEditType.Move
  if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: (x1 + x2) / 2,
      y: y1
    })
  ) {
    type = RectangleEditType.ResizeTop
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x2,
      y: y1
    })
  ) {
    type = RectangleEditType.ResizeRightTop
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x2,
      y: (y1 + y2) / 2
    })
  ) {
    type = RectangleEditType.ResizeRight
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x2,
      y: y2
    })
  ) {
    type = RectangleEditType.ResizeRightBottom
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: (x1 + x2) / 2,
      y: y2
    })
  ) {
    type = RectangleEditType.ResizeBottom
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x1,
      y: y2
    })
  ) {
    type = RectangleEditType.ResizeLeftBottom
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x1,
      y: (y1 + y2) / 2
    })
  ) {
    type = RectangleEditType.ResizeLeft
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
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

  DHistory.select(action)
})

const stopMousedown = Events.on('mousedown', (e: MouseEvent) => {
  if (!checked.value || !Canvas.ctx || rectangleRef.value) {
    return
  }

  const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()
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
    isHit,
  }
})

const stopMousemove = Events.on('mousemove', (e: MouseEvent) => {
  if (!checked.value || !Canvas.ctx) {
    return
  }

  if (rectangleEditRef.value) {
    rectangleEditRef.value.data.x2 = e.clientX
    rectangleEditRef.value.data.y2 = e.clientY
    if (DHistory.history.top === rectangleEditRef.value) {
      DHistory.set(DHistory.history)
    } else {
      rectangleEditRef.value.source.editHistory.push(rectangleEditRef.value)
      DHistory.push(rectangleEditRef.value)
    }
  } else if (rectangleRef.value) {
    const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()
    const rectangleData = rectangleRef.value.data
    rectangleData.x2 = e.clientX - left
    rectangleData.y2 = e.clientY - top

    if (DHistory.history.top === rectangleRef.value) {
      DHistory.set(DHistory.history)
    } else {
      DHistory.push(rectangleRef.value)
    }
  }
})

const stopMouseup = Events.on('mouseup', () => {
  if (!checked.value) {
    return
  }

  if (rectangleRef.value) {
    DHistory.clearSelect()
  }

  rectangleRef.value = null
  rectangleEditRef.value = null
})

onUnmounted(() => {
  stopDrawSelect()
  stopMousedown()
  stopMousemove()
  stopMouseup()
})

</script>

<template>
  <ScreenshotButton title="矩形" icon="icon-rectangle" :checked="checked" @click="onSelectRectangle">
    <template v-slot:option>
      <ScreenshotSize :value="size" :onChange="onSizeChange" />
      <ScreenshotColor :value="color" :onChange="onColorChange" />
    </template>
  </ScreenshotButton>
</template>
