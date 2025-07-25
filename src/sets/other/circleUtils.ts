import type { Circle } from '../types/types'

export const getCircle = (circles: Circle[], circleLabel: Circle['label']) => {
  const circle = circles.find((c) => c.label === circleLabel)
  if (!circle) throw 'circle missing in call to getCircle'
  return circle
}

export const isInsideCircle = (x: number, y: number, circle: Circle) => {
  const dx = x - circle.at.x
  const dy = y - circle.at.y
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

export const isOnEdge = (x: number, y: number, circle: Circle) => {
  const dx = x - circle.at.x
  const dy = y - circle.at.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return Math.abs(distance - circle.radius) < 10 // due to this 10 px buffer, this should always be
  // checked first, otherwise isInsideCircle() will overlap some of this space
}

export const isOverlapping = (circle1: Circle, circle2: Circle) => {
  const dx = circle2.at.x - circle1.at.x
  const dy = circle2.at.y - circle1.at.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < circle1.radius + circle2.radius
}