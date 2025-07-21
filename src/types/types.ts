
export type CircleDisplayName = string

export type Circle = {
  id: CircleDisplayName,
  x: number,
  y: number,
  radius: number,
  color: string,
}

export type Overlap = {
  id: string,
  circles: Circle[],
  color: string,
  originalColor: string,
}