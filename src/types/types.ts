
export type CircleLabel = string

export type Circle = {
  label: CircleLabel,
  x: number,
  y: number,
  radius: number,
}

export type Overlap = {
  id: number,
  circles: Circle['label'][],
}