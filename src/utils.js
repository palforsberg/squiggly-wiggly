const bezier = (t, p0, p1, p2, p3) => {
    var cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;
  
    var cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;
  
    var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
  
    return {x: x, y: y};
}

function bez_lerp(t, points) {
    const last = points.length
    if (t <= 0) return points[0][0];
      if (t >= last) return points[last - 1][3];
    const i = Math.floor(t)
    return bezier(t - i, points[i][0], points[i][1], points[i][2], points[i][3])
}

const random = (seed) => {
    if (!seed) {
        seed = Math.floor(Math.random() * 100)
    }
    return mulberry32(seed)
}

const normal_dist = () => {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return (Math.sqrt( -1.0 * Math.log( u ) ) * Math.cos( 1.0 * Math.PI * v ) + 1) / 2
}

function mulberry32(a) {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function lim(val, min, max) {
    if (val > max) return max
    if (val < min) return min
    return val
}

function getFlowField(num_columns, num_rows, perlin_constant) {
    const grid = []
    // generate flow field
    for (var row = 0; row < num_rows; row++) {
        for (var col = 0; col < num_columns; col++) {
            if (!grid[col]) grid[col] = []

            const noise_val = perlin.get(col * perlin_constant, row * perlin_constant)
            grid[col][row] = Math.PI * 2 * noise_val
        }
    }

    return grid
}

function getPackedCircles(width, heigth, nr_circles = 7_000, min = 2, max = 5) {
    const isValid = (c, circles) => {
        for (var i = 0; i < circles.length; i++) {
            const c2 = circles[i],
            dx = c2.x - c.x,
            dy = c2.y - c.y,
            dist = Math.sqrt(dx * dx + dy * dy);
    
            if (dist < c.r + c2.r) {
                return false
            }
        }
        return true
    }

    const circles = [];
    
    var counter = 0
    loop1:
    while (circles.length < nr_circles) {
        const c = {
            x: Math.random() * width,
            y: Math.random() * heigth,
            r: max,
        }
        if (counter > 100) {
            break loop1
        }
        
        while (!isValid(c, circles)) {
            c.r--;
            if (c.r < min) {
                counter++
                continue loop1
            }
        }
        counter = 0   
        circles.push(c) 
    }

    return circles
    
}


export {
      getPackedCircles,
      getFlowField,
      bezier,
      bez_lerp,
      random,
      normal_dist,
      lim,
  }