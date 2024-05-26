<template>
  <div>
    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      @mousedown="startDrag"
      @mousemove="drag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @dblclick="createCircle"
      @click.left="handleCanvasClick"
    >Sorry, your browser does not support canvas.</canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive, watch } from 'vue'

import type { Circle, Overlap } from '../types/types'
import useRenderCanvas from '../composables/useRenderCanvas'
import { isInsideCircle, isOnEdge } from '../utils/circleUtils'
import { convertNameListToIdList } from '../utils/idToNameUtils'
import useGetAllSelectablePieces from '../composables/useGetAllSelectablePieces'
import { highlightColor, backgroundColor } from '../utils/constants'


const allSections = defineModel<string[][]>()

const props = defineProps<{
  sectionsToHighlight: string[][],
}>()

const width = window.innerWidth
const height = window.innerHeight

const currentCircleId = ref(1)
const circlesSelectedByDrag = ref(false)

const canvas = ref<HTMLCanvasElement | null>(null)
const dragging = ref(false)
const resizing = ref(false)
const currentCircleIndex = ref<number | null>(null)
const isSelecting = ref(false)
const selectionStartPoint = reactive({ x: 0, y: 0 })

const currentOverlapId = ref(1)
const overlaps = reactive<Overlap[]>([])
const selectedOverlap = ref<Overlap | null>(null)

const circles = reactive<Circle[]>([])


const canvasColor = ref<typeof backgroundColor | typeof highlightColor>(backgroundColor)

const getAllSelectablePieces = useGetAllSelectablePieces()

const { drawCircles } = useRenderCanvas(canvas, circles, overlaps, currentOverlapId, selectedOverlap)

const watchAndRerenderProps = watch(props, () => {
  canvasColor.value = props.sectionsToHighlight.some(arr => JSON.stringify(arr) === JSON.stringify(['S'])) ? highlightColor : backgroundColor
  drawCircles(convertNameListToIdList(props.sectionsToHighlight))
  drawCircles(convertNameListToIdList(props.sectionsToHighlight))
})

type CursorStyle = 'auto' | 'grab' | 'grabbing' | 'ew-resize'

const cursorStyle = ref<CursorStyle>('auto')

const updateCursorStyle = (mouseX: number, mouseY: number): CursorStyle => {
  if (circles.findIndex(circle => isOnEdge(mouseX, mouseY, circle)) !== -1) return 'ew-resize'
  if (circles.findIndex(circle => isInsideCircle(mouseX, mouseY, circle)) !== -1) return 'grab'
  return 'auto'
}

const getMousePos = (event: MouseEvent) => {

  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

const findLastIndex = <T>(arr: T[], predicate: (value: T, index: number, obj: T[]) => boolean) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) {
      return i
    }
  }
  return -1
}

const startDrag = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  currentCircleIndex.value = findLastIndex(circles, circle => isInsideCircle(x, y, circle) || isOnEdge(x, y, circle))

  if (currentCircleIndex.value !== -1) {
    const circle = circles[currentCircleIndex.value]
    if (isOnEdge(x, y, circle)) {
      resizing.value = true
      cursorStyle.value = 'ew-resize'
    } else {
      dragging.value = true
      cursorStyle.value = 'grabbing'
    }

    const selectedCirclesCount = circles.filter(c => c.selected).length
    // If no circles are selected, select the clicked circle
    if (selectedCirclesCount < 2) {
      circles.forEach((c, index) => c.selected = index === currentCircleIndex.value)
    }

    circles.forEach(c => {
      if (c.selected) {
        c.offsetX = x - c.x
        c.offsetY = y - c.y
      }
    })

    // larger circles on bottom
    circles.sort((a, b) => b.radius - a.radius)

    // this is for last licked goes on top
    // circles.push(circles.splice(currentCircleIndex.value, 1)[0])
    // currentCircleIndex.value = circles.length - 1
    drawCircles(convertNameListToIdList(props.sectionsToHighlight))
  } else {
    startSelection(event)
  }
}

const drag = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)

  allSections.value = getAllSelectablePieces(circles, overlaps)
  if ((dragging.value || resizing.value) && currentCircleIndex.value !== null) {

    if (dragging.value) {
      circles.forEach(c => {
        if (c.selected) {
          c.x = x - c.offsetX
          c.y = y - c.offsetY
        }
      })
    } else if (resizing.value) {
      const circle = circles[currentCircleIndex.value]
      const dx = x - circle.x
      const dy = y - circle.y
      circle.radius = Math.max(30, Math.sqrt(dx * dx + dy * dy))
    }

    drawCircles(convertNameListToIdList(props.sectionsToHighlight))
  } else {
    drawSelection(event)
    if (!isSelecting.value) cursorStyle.value = updateCursorStyle(x, y)
  }
}

const endDrag = () => {
  dragging.value = false
  resizing.value = false
  cursorStyle.value = 'auto'
  currentCircleIndex.value = null
  endSelection()
}

const createCircle = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  circles.push({
    id: currentCircleId.value,
    x,
    y,
    radius: 70,
    selected: true,
    color: backgroundColor,
    offsetX: 0,
    offsetY: 0,
  })
  currentCircleId.value++
  drawCircles(convertNameListToIdList(props.sectionsToHighlight))
}

const handleCanvasClick = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)

  // Selecting Circle Sections:
  // TODO: INCOMPLETE needs to be able to select subsections

  // let foundOverlap = false

  // for (let i = overlaps.length - 1; i >= 0; i--) {
  //   const allInside = overlaps[i].circles.every(circle => isInsideCircle(x, y, circle))
  //   if (allInside && !foundOverlap) {
  //     foundOverlap = true
  //     break
  //   }
  // }

  const clickedCircleIndex = circles.findIndex(circle => isInsideCircle(x, y, circle))

  if (clickedCircleIndex === -1 && !circlesSelectedByDrag.value) {
    circles.forEach(circle => circle.selected = false)
    selectedOverlap.value = null
  }
  drawCircles(convertNameListToIdList(props.sectionsToHighlight))


  circlesSelectedByDrag.value = false
}

const deleteCircle = () => {
  for (let i = circles.length - 1; i >= 0; i--) {
    if (circles[i].selected) circles.splice(i, 1);
  }
  drawCircles(convertNameListToIdList(props.sectionsToHighlight))
}

const startSelection = (event: MouseEvent) => {
  const { x, y } = getMousePos(event)
  Object.assign(selectionStartPoint, { x, y })
  isSelecting.value = true
}

const drawSelection = (event: MouseEvent) => {
  if (!isSelecting.value || !canvas.value) return

  const ctx = canvas.value.getContext('2d')!
  const { x, y } = getMousePos(event)
  const currentPoint = { x, y }

  const width = currentPoint.x - selectionStartPoint.x
  const height = currentPoint.y - selectionStartPoint.y

  drawCircles(convertNameListToIdList(props.sectionsToHighlight))

  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 1
  ctx.strokeRect(selectionStartPoint.x, selectionStartPoint.y, width, height)
  ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
  ctx.fillRect(selectionStartPoint.x, selectionStartPoint.y, width, height)

  const minX = Math.min(selectionStartPoint.x, currentPoint.x)
  const maxX = Math.max(selectionStartPoint.x, currentPoint.x)
  const minY = Math.min(selectionStartPoint.y, currentPoint.y)
  const maxY = Math.max(selectionStartPoint.y, currentPoint.y)

  circles.forEach(circle => {
    circle.selected = (
      circle.x >= minX && circle.x <= maxX &&
      circle.y >= minY && circle.y <= maxY
    )
    if (circle.selected) circlesSelectedByDrag.value = true
  })
}

const endSelection = () => {
  isSelecting.value = false
}

const eventListeners = [
  {
    keyCode: 'Backspace',
    action: () => deleteCircle()
  },
  {
    keyCode: 'Escape',
    action: () => circles.forEach(circle => circle.selected = false)
  }
]

const handleKeyPress = (event: KeyboardEvent) => {
  eventListeners.forEach(listener => {
    if (event.code === listener.keyCode) {
      listener.action()
      drawCircles(convertNameListToIdList(props.sectionsToHighlight))
    }
  })
}

const handleClickOutside = (event: MouseEvent) => {
  if (canvas.value && !canvas.value.contains(event.target as Node)) circles.forEach(circle => circle.selected = false)
};

onBeforeUnmount(() => {
  window.removeEventListener('keydown', () => {})
  window.removeEventListener('click', handleClickOutside)
})
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  window.addEventListener('click', handleClickOutside)

})
</script>

<style scoped>
canvas {
  background: v-bind(canvasColor);
  cursor: v-bind(cursorStyle);
}
</style>
