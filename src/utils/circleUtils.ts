import type { Circle } from '../types/types'

export const isInsideCircle = (x: number, y: number, circle: Circle) => {
  const dx = x - circle.x
  const dy = y - circle.y
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

export const isOnEdge = (x: number, y: number, circle: Circle) => {
  const dx = x - circle.x
  const dy = y - circle.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return Math.abs(distance - circle.radius) < 10 // due to this 10 px buffer, this should always be 
                                                 // checked first, otherwise isInsideCircle() will overlap some of this space
}

export const isOverlapping = (circle1: Circle, circle2: Circle) => {
  const dx = circle2.x - circle1.x
  const dy = circle2.y - circle1.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < circle1.radius + circle2.radius
}