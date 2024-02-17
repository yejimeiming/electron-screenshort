<script setup lang="ts">
import {
  computed,
  onUnmounted,
  ref,
} from 'vue'
import { DHistory } from '../../funcs/draw.history'
import { Canvas } from '../../screenshot-canvas/canvas'
import { Events } from '../../screenshot-canvas/events'
import { isHit, isHitCircle } from '../utils'
import { HistoryItemType } from '../../enums'
import { useStore } from '../../store'
import { draw, getEditedArrowData } from './draw'
import {
  type ArrowData,
  type ArrowEditData,
  ArrowEditType,
} from './types'
import type { HistoryItemSource, HistoryItemEdit } from '../../types'
import ScreenshotButton from '../../screenshot-button/index.vue'
import ScreenshotSize from '../../screenshot-size/index.vue'
import ScreenshotColor from '../../screenshot-color/index.vue'

const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const arrowRef = ref<HistoryItemSource<ArrowData, ArrowEditData> | null>(null)
const arrowEditRef = ref<HistoryItemEdit<ArrowEditData, ArrowData> | null>(null)

const checked = computed(() => store.operation === 'Arrow')

const selectArrow = () => {
  store.setOperation('Arrow')
  store.setCursor('default')
}

const onSelectArrow = () => {
  if (checked.value) {
    return
  }
  selectArrow()
  DHistory.clearSelect()
}

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const stopDrawSelect = Events.on('drawselect', (
  e: MouseEvent,
  action: HistoryItemSource<unknown, unknown>,
) => {
  if (action.name !== 'Arrow' || !Canvas.ctx) {
    return
  }

  const source = action as HistoryItemSource<ArrowData, ArrowEditData>
  selectArrow()

  const { x1, y1, x2, y2 } = getEditedArrowData(source)
  let type = ArrowEditType.Move
  if (
    isHitCircle(Canvas.ctx.canvas, e, {
      x: x1,
      y: y1
    })
  ) {
    type = ArrowEditType.MoveStart
  } else if (
    isHitCircle(Canvas.ctx.canvas, e, {
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

  DHistory.select(action)
})

const stopMousedown = Events.on('mousedown', (e: MouseEvent) => {
  if (!checked.value || arrowRef.value || !Canvas.ctx) {
    return
  }

  const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()
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
})

const stopMousemove = Events.on('mousemove', (e: MouseEvent) => {
  if (!checked.value || !Canvas.ctx) {
    return
  }
  if (arrowEditRef.value) {
    arrowEditRef.value.data.x2 = e.clientX
    arrowEditRef.value.data.y2 = e.clientY
    if (DHistory.history.top !== arrowEditRef.value) {
      arrowEditRef.value.source.editHistory.push(arrowEditRef.value)
      DHistory.push(arrowEditRef.value)
    } else {
      DHistory.set(DHistory.history)
    }
  } else if (arrowRef.value) {
    const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()

    arrowRef.value.data.x2 = e.clientX - left
    arrowRef.value.data.y2 = e.clientY - top

    if (DHistory.history.top !== arrowRef.value) {
      DHistory.push(arrowRef.value)
    } else {
      DHistory.set(DHistory.history)
    }
  }
})

const stopMouseup = Events.on('mouseup', () => {
  if (!checked.value) {
    return
  }

  if (arrowRef.value) {
    DHistory.clearSelect()
  }

  arrowRef.value = null
  arrowEditRef.value = null
})

onUnmounted(() => {
  stopDrawSelect()
  stopMousedown()
  stopMousemove()
  stopMouseup()
})
</script>

<template>
  <ScreenshotButton title="箭头" icon='icon-arrow' :checked="checked" @click="onSelectArrow">
    <template v-slot:option>
      <ScreenshotSize :value="size" :onChange="onSizeChange" />
      <ScreenshotColor :value="color" :onChange="onColorChange" />
    </template>
  </ScreenshotButton>
</template>
