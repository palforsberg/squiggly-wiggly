import { getPackedCircles } from "./../utils.js";

// noprotect
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");


getPackedCircles(700, 700).forEach(drawCircle)

function drawCircle(c) {
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
    ctx.fill()
}