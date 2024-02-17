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
import { isHit } from '../utils'
import { draw } from './draw'
import type { BrushData, BrushEditData } from './types'
import type { HistoryItemEdit, HistoryItemSource } from '../../types'
import ScreenshotButton from '../../screenshot-button/index.vue'
import ScreenshotSize from '../../screenshot-size/index.vue'
import ScreenshotColor from '../../screenshot-color/index.vue'

const store = useStore()
const size = ref(3)
const color = ref('#ee5126')
const brushRef = ref<HistoryItemSource<BrushData, BrushEditData> | null>(null)
const brushEditRef = ref<HistoryItemEdit<BrushEditData, BrushData> | null>(null)

const checked = computed(() => store.operation === 'Brush')

const onSizeChange = (s: number) => {
  size.value = s
}

const onColorChange = (c: string) => {
  color.value = c
}

const selectBrush = () => {
  store.setOperation('Brush')
  store.setCursor('default')
}

const onSelectBrush = () => {
  if (checked.value) {
    return
  }
  selectBrush()
  DHistory.clearSelect()
}

const stopDrawSelect = Events.on('drawselect', (
  e: MouseEvent,
  action: HistoryItemSource<unknown, unknown>,
) => {
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

  DHistory.select(action)
})

const stopMousedown = Events.on('mousedown', (e: MouseEvent) => {
  if (!checked.value || brushRef.value || !Canvas.ctx) {
    return
  }

  const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()

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
})

const stopMousemove = Events.on('mousemove', (e: MouseEvent) => {
  if (!checked.value || !Canvas.ctx) {
    return
  }

  if (brushEditRef.value) {
    brushEditRef.value.data.x2 = e.clientX
    brushEditRef.value.data.y2 = e.clientY
    if (DHistory.history.top !== brushEditRef.value) {
      brushEditRef.value.source.editHistory.push(brushEditRef.value)
      DHistory.push(brushEditRef.value)
    } else {
      DHistory.set(DHistory.history)
    }
  } else if (brushRef.value) {
    const { left, top } = Canvas.ctx.canvas.getBoundingClientRect()

    brushRef.value.data.points.push({
      x: e.clientX - left,
      y: e.clientY - top
    })

    if (DHistory.history.top !== brushRef.value) {
      DHistory.push(brushRef.value)
    } else {
      DHistory.set(DHistory.history)
    }
  }
})

const stopMouseup = Events.on('mouseup', () => {
  if (!checked.value) {
    return
  }

  if (brushRef.value) {
    DHistory.clearSelect()
  }

  brushRef.value = null
  brushEditRef.value = null
})

onUnmounted(() => {
  stopDrawSelect()
  stopMousedown()
  stopMousemove()
  stopMouseup()
})
</script>

<template>
  <ScreenshotButton title="画笔" icon="icon-brush" :checked="checked" @click="onSelectBrush">
    <template v-slot:option>
      <ScreenshotSize :value="size" :onChange="onSizeChange" />
      <ScreenshotColor :value="color" :onChange="onColorChange" />
    </template>
  </ScreenshotButton>
</template>
