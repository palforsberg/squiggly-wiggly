<script>
    import { getPackedCircles, lim } from "./utils";


    let grid = []
    let used_grid = []

    const width = 700
    const height = 700
    const left_x = Math.floor(width * -0.5)
    const right_x = Math.floor(width * 1.5)
    const top_y = Math.floor(height * -0.5)
    const bottom_y = Math.floor(height * 1.5) 
    const resolution = Math.floor(width * 0.01) 
    const num_columns = (right_x - left_x) / resolution
    const num_rows = (bottom_y - top_y) / resolution
    let polylines = []
    let visible = true

    function getPolyLine(start_x, start_y, num_steps, index) {
        const line_points = []
        var x = start_x
        var y = start_y

        for (var i = 0; i < num_steps; i++) {
            const x_offset = x - left_x
            const y_offset = y - top_y

            const col_index = lim(Math.floor(x_offset / resolution), 0, num_columns - 1)
            const row_index = lim(Math.floor(y_offset / resolution), 0, num_rows - 1)

            const used = used_grid[col_index][row_index]
            if (used !== undefined && used !== index) break
            used_grid[col_index][row_index] = index

            line_points.push(`${x},${y}`)

            const angle = grid[col_index][row_index]

            const x_step = 5 * Math.cos(angle)
            const y_step = 5 * Math.sin(angle)

            x += x_step
            y += y_step
            
        }

        return line_points.join(' ')
    }
    function generate() {
        // generate flow field
        for (var row = 0; row < num_rows; row++) {
            for (var col = 0; col < num_columns; col++) {
                if (!grid[col]) grid[col] = []
                if (!used_grid[col]) used_grid[col] = []
                
                const noise_val = perlin.get(col * 0.02, row * 0.02)
                grid[col][row] = Math.PI * 2 * noise_val
            }
        }

        const points = getPackedCircles(700, 700, 10_000, 2, 2)
        for (var i = 0; i < points.length; i++) {
            const length = 200 + Math.random() * 100
            const p = points[i]
            polylines.push(getPolyLine(p.x, p.y, length, i))
        }

        // for (var i = 0; i < 4_000; i++) {
        //     const x = Math.random() * 700
        //     const y = Math.random() * 700
        //     const length = Math.random() * 1000
        //     polylines.push(getPolyLine(x, y, length, i))
        // }
    }
	// $: {
        generate()
	// }
</script>

<main>
	<svg height="700px" width="700px" viewBox="0 0 700 700" style="background-color:hsl(220, 100%, 100%)">
		<!-- {#each grid as columns, x}
            {#each columns as angle, y}
                <circle cx={x * resolution + left_x} cy={y * resolution + top_y} r="2" fill="red" />
                <line x1={x * resolution + left_x} y1={y * resolution + top_y} x2={x * resolution + Math.cos(angle) * resolution + left_x} y2={y * resolution + Math.sin(angle) * resolution + top_y} stroke="red" />
            {/each}
		{/each} -->
        {#each polylines as pl, i}
            <polyline style={`stroke-linecap:round;stroke-width:2px;`} points={pl} fill="none" stroke={`hsl(220, 100%, ${(0) + 45}%)`} />
        {/each}
	</svg>
</main>

<style>
</style>