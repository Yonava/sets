import type { Coordinate } from "@/shapes/types/utility"

export type CircleLabel = string

export type Token = "cup" | "cap" | "delta" | "S" | "omega" | "sup-c"

export type Circle = {
  at: Coordinate
  label: CircleLabel,
  radius: number,
}

export type Overlap = {
  id: number,
  circles: Circle['label'][],
}