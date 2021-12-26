<script>
	import { bez_lerp, random } from './utils'
	import { fade } from 'svelte/transition';
	import * as knobby from 'svelte-knobby';

	const controls = knobby.panel({
		rand: {
			$label: 'Seed',
			value: Math.floor(random() * 100),
			min: 0,
			max: 100,
			step: 1
		},
		dx: {
			$label: 'X Delta',
			value: 30,
			min: 0,
			max: 70,
			step: 0.5
		},
		dy: {
			$label: 'Y Delta',
			value: 100,
			min: 0,
			max: 250,
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
		lineWidth: {
			$label: 'Line Width',
			value: 10,
			min: 2,
			max: 100,
			step: 1
		},
		redraw: () => {
			$controls.rand++
		}
	});
	let circles = []
	let innerWidth = 0


	$: {
		if (innerWidth > 0) {
			const points = generatePoints(100, 200, $controls.dx, $controls.dy, 20)
			const bezierPoints = pointsToBezier(points)
			circles = generate(bezierPoints, 0.01, $controls.dc, $controls.c1)
			console.log('circles ', circles.length)
		}
	}

	function generate(bezierPoints, dt, dc, start_c) {
		var c = []
		var cc = start_c
		var t = 0
		let last = bez_lerp(0, bezierPoints)
		const minDist = $controls.lineWidth / 4
		while (t < bezierPoints.length - 1) {
			cc += dc
			t += dt
			const p = bez_lerp(t, bezierPoints)
			if (Math.abs(p.x - last.x) < minDist &&
				Math.abs(p.y - last.y) < minDist) {
				// try to limit number of circles, if distance from last is not enough, dont draw it
				continue;
			}
			c.push({ key: $controls.rand, cx: p.x, cy: p.y, r: $controls.lineWidth, fill: 'hsl(' + cc + ', 100%, 50%)' })
			last = p

		}

		return c
	}

	function generatePoints(startx, starty, dx, dy, nrPoints = 10) {
		const points = [{ x: startx, y: starty }]
		var true_dy = dy
		for (var i = 1; i < nrPoints; i++) {
			const last = points[i - 1]
			const x = Math.min(innerWidth - 40, last.x + addVariance(dx, dx, i))
			const y = Math.min(400, Math.max(20, last.y + addVariance(true_dy, dy, i)))
			points.push({ x, y })
			true_dy = -1 * true_dy
		}
		return points
	}

	function addVariance(val, variance, i) {
		const i2 = i % 5
		const rand = random($controls.rand + i)
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
	<svelte:window bind:innerWidth={innerWidth}/>
	<svg height="100%" width="100%" fill="#000">
		{#each circles as c, i}
			{#key c.key}
				<circle
					{...c}
					in:fade="{{ delay: 500 + i*2, duration: 0 }}"
					out:fade="{{ delay: i*2, duration: 0 }}"
				/>
			{/key}
		{/each}
	</svg>

<style>
	:global(body) {
        background-color: black;
    }
</style>