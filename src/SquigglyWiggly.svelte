<script>
	import { bez_lerp, random } from './utils'
	import * as knobby from 'svelte-knobby';

	const controls = knobby.panel({
		dx: {
			$label: 'X Delta',
			value: 40,
			min: 0,
			max: 70,
			step: 0.5
		},
		dy: {
			$label: 'Y Delta',
			value: 100,
			min: 0,
			max: 70,
			step: 0.5
		},
		dc: {
			$label: 'Color Delta',
			value: 0.7,
			min: 0,
			max: 3,
			step: 0.01
		},
		c1: {
			$label: 'Start Color',
			value: 0,
			min: 0,
			max: 720,
			step: 1
		},
		stepsize: {
			$label: 'Stepsize',
			value: 0.01,
			min: 0.015,
			max: 2,
			step: 0.001
		},
	});
	let circles = []

	const rand = Math.floor(random() * 100)
	console.log('rand', rand)
	
	let bezierPoints
	
	$: {
		const points = generatePoints(100, 200, $controls.dx, $controls.dy, 3, 200, rand)
		bezierPoints = pointsToBezier(points)
		circles = generate($controls.stepsize, $controls.dx, $controls.dy, $controls.dc, $controls.c1)
	}

	function generate(dt, dx, dy, dc, start_c) {
		var circles = []
		var vx = dx
		var vy = dy
		var cx = 10
		var cy = 100
		var cc = start_c
		var t = 0
		while (t < 9) {
			cx += vx * dt
			cy += vy * dt
			cc += dc
			t += dt
			cx = bez_lerp(t, bezierPoints).x
			cy = bez_lerp(t, bezierPoints).y
			circles.push({ cx, cy, r: 20, fill: 'hsl(' + cc + ', 100%, 50%)' })
		}

		return circles
	}

	function generatePoints(startx, starty, dx, dy, variance_x, variance_y, rand) {
		const points = [{ x: startx, y: starty }]
		var true_dy = -dy
		for (var i = 1; i < 10; i++) {
			const last = points[i - 1]
			const y = Math.min(400, Math.max(20, last.y + addVariance(true_dy, variance_y, rand, i)))
			const x = Math.min(400, last.x + addVariance(dx, variance_x, rand, i))
			const p = { x, y }
			points.push(p)
			true_dy = -1 * true_dy
		}
		return points
	}

	function addVariance(val, variance, rand2, i) {
		const i2 = i % 5
		const rand = random(rand2 + i)
		return val + (((rand * i2)  - (0.5 * i2)) * variance)
	}

	function pointsToBezier(points) {
		const bezier = []
		const pd = 20
		for (var i = 0; i < points.length; i++) {
			const p = points[i]
			if (i == 0) {
				bezier[i] = [{ x: p.x, y: p.y }, {x: p.x + pd, y: p.y} ]
			} else if (i == points.length - 1) {
				bezier[i - 1] = [...bezier[i - 1], {x: p.x - pd, y: p.y}, {x: p.x, y: p.y} ]
				bezier[i] = [{ x: p.x, y: p.y }, {x: p.x + pd, y: p.y}, { x: p.x, y: p.y }, {x: p.x - pd, y: p.y} ]
			} else {
				bezier[i - 1] = [...bezier[i - 1], {x: p.x - pd, y: p.y}, {x: p.x, y: p.y} ]
				bezier[i] = [{x: p.x, y: p.y}, {x: p.x + pd, y: p.y} ]
			}
		}

		return bezier
	}
</script>

	<svg height="500px" width="500px" fill="#eee">
		{#each circles as c}
			<circle {...c} />
		{/each}
	</svg>