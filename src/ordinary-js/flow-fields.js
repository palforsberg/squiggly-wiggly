
import { getPackedCircles, lim, getFlowField, normal_dist } from "./utils.js";
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");

let grid = []
let used_grid = []

const width =       700
const height =      700
const left_x =      Math.floor(width * 0)
const right_x =     Math.floor(width * 1)
const top_y =       Math.floor(height * 0)
const bottom_y =    Math.floor(height * 1) 
const resolution =  Math.floor(width * 0.01) 
const num_columns = (right_x - left_x) / resolution
const num_rows =    (bottom_y - top_y) / resolution

let polylines = []
let visible = true

function getPolyLine(grid, start_x, start_y, num_steps, index) {
    const line_points = []
    var x = start_x
    var y = start_y

    const margin = 20
    const max_margin = width - (margin*2)
    for (var i = 0; i < num_steps; i++) {
        const x_offset = x - left_x
        const y_offset = y - top_y

        const col_index = lim(Math.floor(x_offset / resolution), 0, grid.length - 1)
        const row_index = lim(Math.floor(y_offset / resolution), 0, grid[0].length - 1)

        // const used = used_grid[col_index]?.[row_index]
        // if (used !== undefined && used !== index) break
        // if (used_grid == undefined) used_grid = []
        // if (used_grid[col_index] == undefined) used_grid[col_index] = []
        // used_grid[col_index][row_index] = index

        if (x < margin || y < margin || x > max_margin || y > max_margin) break
        line_points.push({x, y})

        const angle = grid[col_index][row_index]

        const x_step = 5 * Math.cos(angle)
        const y_step = 5 * Math.sin(angle)

        x += x_step
        y += y_step
        
    }

    return line_points
}

function paintLine(points, color, width) {
    ctx.lineWidth = width;
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.moveTo(points[0].x, points[0].y)
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
}

function paintAngle(x, y, angle, dist = resolution) {
    ctx.beginPath()
    ctx.arc(x * dist, y * dist, 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1
    ctx.moveTo(x * dist, y * dist)
    const x2 = x * dist + Math.cos(angle) * dist
    const y2 = y * dist + Math.sin(angle) * dist
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function generate(grid, nr_circles, color, width, height, line_width = 30) {
    // generate flow field
    const points = getPackedCircles(width, height, nr_circles, 1, 1)
    
    ctx.lineCap = 'butt'

    for (var i = 0; i < points.length; i++) {
        const progress = i / points.length
        const inv_prog = 1 - progress
        const length = 5 + Math.random() * 20
        const p = points[i]
        const line = getPolyLine(grid, p.x, p.y, length, i)
        if (line.length < 2) continue

        const middle = Math.floor(line.length / 2)
        const m = line[middle]
        // perlin, smaller value, smoother noise
        paintLine(line, color(m), line_width)
    }
}

function generateSun(num_lines, grid, hue, width) {
    // generate flow field
    
    ctx.lineCap = 'butt'

    const middle = (700 / 2) - (width * 4)
    ctx.translate(middle, middle)
    for (var i = 0; i < num_lines; i++) {
        const progress = i / 1000
        const inv_prog = 1 - progress
        const length = 10
        const x = (normal_dist() + 1) * width * 2
        const y = (normal_dist() + 1) * width * 2

        const line = getPolyLine(grid, Math.floor(x), Math.floor(y), length, i)
        if (line.length < 2) continue

        const col = Math.abs(perlin.get(line[0].x * 0.008, line[0].y * 0.008))
        const color = `hsl(${hue}, 100%, ${50 + (col * 60)}%, 1)`
        paintLine(line, color, Math.max(5, inv_prog * 10))
    }
}

function drawAngleGrid(grid, dist) {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            const angle = grid[i][j]
            paintAngle(i, j, angle, dist)
        }
    }
}

function getCircleField(radius) {
    const grid = []
    const middle = radius
    for (var i = 0; i < radius * 2; i++) {
        for (var j = 0; j < radius * 2; j++) {
            var angle = Math.atan((middle - j) / (middle - i))
            if (grid[i] == undefined) grid[i] = []
            if (i > middle) angle -= Math.PI
            grid[i][j] = angle + Math.PI / 2
        }
    }
    return grid
}

const circle = getCircleField(25)
const blueColor = m => {
    const col = Math.abs(perlin.get(m.x * 0.003, m.y * 0.003))
    return `hsl(220, 100%, ${20 + (col * 90)}%, 1)`
}
const yellow = m => {
    const col = Math.abs(perlin.get(m.x * 0.003, m.y * 0.003))
    return `hsl(40, 100%, ${20 + (col * 90)}%, 1)`
}
const white = m => {
    const col = Math.abs(perlin.get(m.x * 0.003, m.y * 0.003))
    return `hsl(220, 100%, ${50 + (col * 90)}%, 1)`
}
const black = m => {
    const col = Math.abs(perlin.get(m.x * 0.003, m.y * 0.003))
    return `hsl(220, 100%, ${0 + (col * 40)}%, 1)`
}
requestAnimationFrame(() => generate(getFlowField(num_columns, num_rows, 0.008), 1000, blueColor, 700, 700))
// requestAnimationFrame(() => generate(getFlowField(num_columns, num_rows, 0.008), 60, yellow, 700, 700, 10))
requestAnimationFrame(() => generate(getFlowField(num_columns, num_rows, 0.008), 100, black, 700, 700, 10))
requestAnimationFrame(() => generate(getFlowField(num_columns, num_rows, 0.008), 200, blueColor, 700, 700))
// requestAnimationFrame(() => generate(getFlowField(num_columns, num_rows, 0.008), 20, yellow, 700, 700, 4))

requestAnimationFrame(() => generate(getFlowField(num_columns, num_rows, 0.008), 20, white, 700, 700, 10))
// requestAnimationFrame(() => generateSun(500, circle, 50, 50))
// requestAnimationFrame(() => drawAngleGrid(circle))
// requestAnimationFrame(() => generate(500, 50))