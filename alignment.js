/* alignment.js - provides javascript calculation and rendering code for the prop shaft alignment tool */

FlangeCanvas = {};
FlangeCanvas.ctx2d = null;
FlangeCanvas.mouseDownPt = null;

FlangeCanvas.renderArrow = function(deg) {
	$('#gapDegrees').html(deg.toFixed(2) + ' &deg;');
	
	var centerX = 150;
	var centerY = 150;
	var radius = 120;
	var arrowLength = 25;
	var arrowSideAngle = 3;
	var arrowSideSweep = 8;
	var rad = deg * Math.PI / 180;
	
	var pt1 = { x: (radius - arrowLength) * Math.sin(rad), y: -1 * (radius - arrowLength) * Math.cos(rad) };
	var pt2 = { x: radius * Math.sin(rad), y: -1 * radius * Math.cos(rad) };
	
	// console.log ('pt1.x = ' + pt1.x + ', pt1.y = ' + pt1.y);
	
	var ctx = FlangeCanvas.ctx2d;
	ctx.clearRect(0, 0, 300, 300);
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(centerX + pt1.x, centerY + pt1.y);
	ctx.lineTo(centerX + pt2.x, centerY + pt2.y);
	ctx.stroke();
	
	// draw the arrow side
	var pt3 = { x: (radius - arrowSideSweep) * Math.sin(rad - (arrowSideAngle * Math.PI / 180)), y: -1 * (radius - arrowSideSweep) * Math.cos(rad - (arrowSideAngle * Math.PI / 180)) };
	var pt4 = { x: (radius - arrowSideSweep) * Math.sin(rad + (arrowSideAngle * Math.PI / 180)), y: -1 * (radius - arrowSideSweep) * Math.cos(rad + (arrowSideAngle * Math.PI / 180)) };
	
	ctx.beginPath();
	ctx.moveTo(centerX + pt3.x, centerY + pt3.y);
	ctx.lineTo(centerX + pt2.x, centerY + pt2.y);
	ctx.lineTo(centerX + pt4.x, centerY + pt4.y);
	ctx.stroke();
};

FlangeCanvas.mouseDown = function (e) {
	var canvasOffset = $('#flangeCanvas').offset();
	
	var x = e.pageX - canvasOffset.left;
	var y = e.pageY - canvasOffset.top;
	FlangeCanvas.mouseDownPt = { x: x, y: y };
	
	FlangeCanvas.findDegAndDrawArrow(x, y);
	e.preventDefault();
};

FlangeCanvas.mouseMove = function(e) {
	if (FlangeCanvas.mouseDownPt == null) {
		return;
	}
	var canvasOffset = $('#flangeCanvas').offset();
	
	// find the angle to the center of circle
	var x = e.pageX - canvasOffset.left;
	var y = e.pageY - canvasOffset.top;
	// console.log('x = ' + x + ', y = ' + y);
	
	FlangeCanvas.findDegAndDrawArrow(x, y);
	e.preventDefault();
};

FlangeCanvas.mouseUp = function(e) {
	FlangeCanvas.mouseDownPt = null;
};

FlangeCanvas.findDegAndDrawArrow = function (x, y) {
	// find the quadrant
	var quadrant = null;
	var tanArg = null;
	x = x - 150;
	y = y - 150;

	if ( x >= 0 && y < 0 ) {
		quadrant = 0;
		tanArg = x / y;
	} else if ( x >= 0 && y >= 0 ) {
		quadrant = 1;
		tanArg = y / x;
	} else if ( x < 0 && y >= 0 ) {
		quadrant = 2;
		tanArg = x / y;
	} else {
		quadrant = 3;
		tanArg = y / x;
	}
	
	tanArg = Math.abs(tanArg);
	var deg = Math.atan(tanArg) * 180 / Math.PI;
	deg = deg + ( 90 * quadrant );
	console.log('angle = ' + deg);
	
	FlangeCanvas.renderArrow(deg);
	calculateAlignment(deg);
};

function calculateIntersection(linePt1, linePt2, pt3) {
	var m = (linePt1.y - linePt2.y) / (linePt1.x - linePt2.x);
	var b = linePt1.y - (m * linePt1.x);
	
	var intersectPt = { 
		x: ((m * pt3.y) + pt3.x - (m * b)) / ((m * m) + 1),
		y: ((m * m * pt3.y) + (m * pt3.x) + b) / ((m * m) + 1)
	};
	
	return intersectPt;
};

function calculateDistance(pt1, pt2) {
	return Math.sqrt(Math.pow((pt1.x - pt2.x),2) + Math.pow((pt1.y - pt2.y),2));
};

function calculateAlignmentVals(d, r1, r2, gapDegrees, gapVal) {
	var radius = d / 2;
	var touchDegrees = (gapDegrees + 180) % 360;
	var gapRad = gapDegrees * Math.PI / 180;
	var touchRad = touchDegrees * Math.PI / 180;
	
	var gapPt = { x: radius * Math.sin(gapRad), y: radius * Math.cos(gapRad) };
	var touchPt = { x: radius * Math.sin(touchRad), y: radius * Math.cos(touchRad) };
	
	var m = (gapPt.y - touchPt.y) / (gapPt.x - touchPt.x);
	var b = gapPt.y - (m * gapPt.x);
	
	var gap0intersectPt = calculateIntersection(gapPt, touchPt, { x: 0, y: radius }); 
	var gap0 = calculateDistance(touchPt, gap0intersectPt) * gapVal / d;
	
	var gap90intersectPt = calculateIntersection(gapPt, touchPt, { x: radius, y: 0 }); 
	var gap90 = calculateDistance(touchPt, gap90intersectPt) * gapVal / d;
	
	var gap180intersectPt = calculateIntersection(gapPt, touchPt, { x: 0, y: -1 * radius }); 
	var gap180 = calculateDistance(touchPt, gap180intersectPt) * gapVal / d;
	
	var gap270intersectPt = calculateIntersection(gapPt, touchPt, { x: -1 * radius, y: 0 }); 
	var gap270 = calculateDistance(touchPt, gap270intersectPt) * gapVal / d;
	
	var h1 = (gap90 - gap270) * r1 / radius;
	var h2 = (gap90 - gap270) * r2 / radius;
	var v1 = (gap0 - gap180) * r1 / radius;
	var v2 = (gap0 - gap180) * r2 / radius;
	
	console.log('gap 0 = ' + gap0);
	
	return { 
		alignment: { h1: h1, h2: h2, v1: v1, v2: v2 },
		gapQuadrants : { gap0: gap0, gap90: gap90, gap180: gap180, gap270: gap270 } 
	};
};

function calculateAlignment(gapDegrees) {
	var d = $('#dInput').val();
	var r1 = $('#r1Input').val();
	var r2 = $('#r2Input').val();
	var gapVal = $('#gapValInput').val();
	var results = calculateAlignmentVals(d, r1, r2, gapDegrees, gapVal);
	
	$('#h1result').html(results.alignment.h1.toFixed(3));
	$('#h2result').html(results.alignment.h2.toFixed(3));
	$('#v1result').html(results.alignment.v1.toFixed(3));
	$('#v2result').html(results.alignment.v2.toFixed(3));
	
	$('#gap0result').html(results.gapQuadrants.gap0.toFixed(4));
	$('#gap90result').html(results.gapQuadrants.gap90.toFixed(4));
	$('#gap180result').html(results.gapQuadrants.gap180.toFixed(4));
	$('#gap270result').html(results.gapQuadrants.gap270.toFixed(4));			
}


function initialize() {
	var canvas = document.getElementById('flangeCanvas');
	FlangeCanvas.ctx2d = canvas.getContext('2d');
	
	$('#flangeCanvas').mousedown(FlangeCanvas.mouseDown).mousemove(FlangeCanvas.mouseMove).mouseup(FlangeCanvas.mouseUp);
	
	FlangeCanvas.renderArrow(0.00);
};


$(document).ready(initialize);