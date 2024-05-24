
export interface Circle {
    id: number
    x: number
    y: number
    radius: number
    selected: boolean
    color: string
    offsetX: number
    offsetY: number
}

export interface Overlap {
    id: number
    circles: Circle[]
    color: string
    originalColor: string
}