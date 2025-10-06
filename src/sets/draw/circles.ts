import type { Circle } from '@/sets/types/types'
import { COLORS } from '@/sets/other/constants'
import { circle } from '@/shapes/shapes/circle'

type DrawCircleBackgroundProps = {
  circle: Circle,
  isHighlighted: boolean,
}

export const drawCircleBackground = (ctx: CanvasRenderingContext2D, props: DrawCircleBackgroundProps) => {
  circle({
    ...props.circle,
    fillColor: props.isHighlighted ? COLORS.HIGHLIGHT : COLORS.BACKGROUND,
  }).draw(ctx)
}

type DrawCircleOutlineProps = {
  circle: Circle,
  isFocused: boolean,
}

export const drawCircleOutline = (ctx: CanvasRenderingContext2D, props: DrawCircleOutlineProps) => {
  const { at: { x, y }, radius } = props.circle;
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.lineWidth = 3
  ctx.strokeStyle = props.isFocused ? COLORS.CIRCLE_FOCUSED : COLORS.CIRCLE_OUTLINE
  ctx.stroke()
}

type DrawCircleLabelProps = {
  circle: Circle,
  isFocused: boolean,
}

export const drawCircleLabel = (ctx: CanvasRenderingContext2D, props: DrawCircleLabelProps) => {
  const { at: { x, y }, label } = props.circle;
  ctx.font = '15px Arial';
  ctx.fillStyle = props.isFocused ? COLORS.CIRCLE_FOCUSED : COLORS.CIRCLE_OUTLINE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.stroke();
}