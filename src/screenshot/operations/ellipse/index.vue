<script setup lang="ts">
import {
  computed,
  onUnmounted,
  ref,
} from 'vue'
import { DHistory } from '../../funcs/draw.history'
import { Canvas } from '../../screenshot-canvas/canvas'
import { Events } from '../../screenshot-canvas/events'
import { useStore } from '../../store'
import { HistoryItemType } from '../../enums'
import { isHit, isHitCircle } from '../utils'
import { draw, getEditedEllipseData } from './draw'
import {
  type EllipseData,
  type EllipseEditData,
  EllipseEditType,
} from './types'
import type { HistoryItemEdit, HistoryItemSource } from '../../types'
import ScreenshotButton from '../../screenshot-button/index.vue'
import ScreenshotSize from '../../screenshot-size/index.vue'
import ScreenshotColor from '../../screenshot-color/index.vue'

const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const ellipseRef = ref<HistoryItemSource<EllipseData, EllipseEditData> | null>(null)
const ellipseEditRef = ref<HistoryItemEdit<EllipseEditData, EllipseData> | null>(null)

const checked = computed(() => store.operation === 'Ellipse')

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const selectEllipse = () => {
  store.setOperation('Ellipse')
  store.setCursor('default')
}

const onSelectEllipse = () => {
  if (checked.value) {
    return
  }
  selectEllipse()
  DHistory.clearSelect()
}

const stopDrawSelect = Events.on('drawselect', (
  e: MouseEvent,
  action: HistoryItemSource<unknown, unknown>,
) => {
  if (action.name !== 'Ellipse' || !Canvas.ctx) {
    return
  }

  const source = action as HistoryItemSource<EllipseData, EllipseEditData>

  selectEllipse()

  const { x1, y1, x2, y2 } = getEditedEllipseData(source)

  let type = EllipseEditType.Move
  if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: (x1 + x2) / 2,
      y: y1
    })
  ) {
    type = EllipseEditType.ResizeTop
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x2,
      y: y1
    })
  ) {
    type = EllipseEditType.ResizeRightTop
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x2,
      y: (y1 + y2) / 2
    })
  ) {
    type = EllipseEditType.ResizeRight
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x2,
      y: y2
    })
  ) {
    type = EllipseEditType.ResizeRightBottom
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: (x1 + x2) / 2,
      y: y2
    })
  ) {
    type = EllipseEditType.ResizeBottom
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x1,
      y: y2
    })
  ) {
    type = EllipseEditType.ResizeLeftBottom
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x1,
      y: (y1 + y2) / 2
    })
  ) {
    type = EllipseEditType.ResizeLeft
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
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

  DHistory.select(action)
})

const stopMousedown = Events.on('mousedown', (e: MouseEvent) => {
  if (!checked.value || !Canvas.ctx || ellipseRef.value) {
    return
  }

  const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()
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
})

const stopMousemove = Events.on('mousemove', (e: MouseEvent) => {
  if (!checked.value || !Canvas.ctx) {
    return
  }

  if (ellipseEditRef.value) {
    ellipseEditRef.value.data.x2 = e.clientX
    ellipseEditRef.value.data.y2 = e.clientY
    if (DHistory.history.top !== ellipseEditRef.value) {
      ellipseEditRef.value.source.editHistory.push(ellipseEditRef.value)
      DHistory.push(ellipseEditRef.value)
    } else {
      DHistory.set(DHistory.history)
    }
  } else if (ellipseRef.value) {
    const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()
    ellipseRef.value.data.x2 = e.clientX - left
    ellipseRef.value.data.y2 = e.clientY - top

    if (DHistory.history.top !== ellipseRef.value) {
      DHistory.push(ellipseRef.value)
    } else {
      DHistory.set(DHistory.history)
    }
  }
})

const stopMouseup = Events.on('mouseup', () => {
  if (!checked.value) {
    return
  }

  if (ellipseRef.value) {
    DHistory.clearSelect()
  }

  ellipseRef.value = null
  ellipseEditRef.value = null
})

onUnmounted(() => {
  stopDrawSelect()
  stopMousedown()
  stopMousemove()
  stopMouseup()
})
</script>

<template>
  <ScreenshotButton title="椭圆" icon="icon-ellipse" :checked="checked" @click="onSelectEllipse">
    <template v-slot:option>
      <ScreenshotSize :value="size" :onChange="onSizeChange" />
      <ScreenshotColor :value="color" :onChange="onColorChange" />
    </template>
  </ScreenshotButton>
</template>
