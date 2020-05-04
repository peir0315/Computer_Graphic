
var gl;
var points;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var depthTest = 1;

var matrixLoc;

var numVertices  = 30;

var vertices = [
	vec3( -0.5, -0.5,  0.5 ),
	vec3( -0.5,  0.5,  0.5 ),
	vec3(  0.5,  0.5,  0.5 ),
	vec3(  0.5, -0.5,  0.5 ),
	vec3( -0.5, -0.5, -0.5 ),
	vec3( -0.5,  0.5, -0.5 ),
	vec3(  0.5,  0.5, -0.5 ),
	vec3(  0.5, -0.5, -0.5 )
];

var vertexColors = [
	vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
	vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
	vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
	vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
	vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
	vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
	vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
	vec4( 1.0, 1.0, 1.0, 1.0 )   // white
];

// indices of the 12 triangles that compise the cube

var indices = [
//    1, 0, 3,
//    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];

var program;  // shader program

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    matrixLoc = gl.getUniformLocation(program, "transform"); 

    //event listeners for buttons 
    document.getElementById( "xRange" ).oninput = Lmove;
    document.getElementById( "yRange" ).oninput = Mmove;
    document.getElementById( "zRange" ).oninput = Rmove;
    document.getElementById( "dButton" ).onclick = function() {depthTest=!depthTest;};
	
    render();
};

var Lcube=0.25,Mcube=0,Rcube=0;
function Lmove() {
	Lcube = document.getElementById( "xRange" ).value/100;
};
function Mmove() {
	Mcube = -(document.getElementById( "yRange" ).value)/100;
};
function Rmove() {
	Rcube = document.getElementById( "zRange" ).value/100;
};


function render() {
	var modeling = mult(rotate(theta[xAxis], 1, 0, 0),
	                 mult(rotate(theta[yAxis], 0, 1, 0),rotate(theta[zAxis], 0, 0, 1)));
	var viewing = lookAt([0,0,2], [0,0,0], [0,1,0]);
	var projection = perspective(45, 1.0, 1.0, 3.0);

 	var mvpMatrix = mult(projection, mult(viewing, modeling));
	
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mvpMatrix));

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	if (depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);

    // array element buffer   
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    
    // color array atrribute buffer   
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // vertex array attribute buffer   
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );
	
	// draw ad additional small cube
	viewing = lookAt([0,0,2], [Mcube,Mcube,0], [0,1,0]);
	modeling = scale(0.2, 0.2, 0.2);
	mvpMatrix = mult(projection, mult(viewing, modeling));
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mvpMatrix));
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );
	
	viewing = lookAt([0,0,2], [Lcube,0,0], [0,1,0]);
	modeling = scale(0.2, 0.2, 0.2);
	mvpMatrix = mult(projection, mult(viewing, modeling));
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mvpMatrix));
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );
	
	viewing = lookAt([0,0,2], [-0.25,Rcube,0], [0,1,0]);
	modeling = scale(0.2, 0.2, 0.2);
	mvpMatrix = mult(projection, mult(viewing, modeling));
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mvpMatrix));
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );

    requestAnimFrame( render );
}
