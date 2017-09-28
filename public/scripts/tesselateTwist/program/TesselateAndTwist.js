"use strict";

var WebGLProgram = (function(){
    var canvas, gl, program, points = [], NumTimesToSubdivide = 5, TwistAngle = 40,
    shape = {
        TRIANGLE: 0,
        SQUARE: 1,
        TRIANGLE_GASKET: 2,
        SQUARE_GASKET: 3
    }, currentShape= shape.TRIANGLE;
    

    var twist = function(point){
        var theta = radians(TwistAngle), d = Math.sqrt(Math.pow(point[0],2) + Math.pow(point[1],2)),
        costhetad = Math.cos(theta * d), sinthetad =  Math.sin(theta * d);

        return vec2(point[0] * costhetad - point[1] * sinthetad,
                point[0] * sinthetad + point[1] * costhetad
            );
    };

    var triangle = function( a, b, c )
    {
        points.push( twist(a), twist(b), twist(c) );
    }

    var divideTriangle = function( a, b, c, count, isGasket)
    {

        // check for end of recursion

        if ( count === 0 ) {
            triangle( a, b, c );
        }
        else {

            //bisect the sides

            var ab = mix( a, b, 0.5 );
            var ac = mix( a, c, 0.5 );
            var bc = mix( b, c, 0.5 );

            --count;

            //new triangles

            divideTriangle( a, ab, ac, count, isGasket);
            divideTriangle( c, ac, bc, count, isGasket);
            divideTriangle( b, bc, ab, count, isGasket);
            if(!isGasket){
                divideTriangle(ab, bc, ac, count, isGasket);
            }
        }
    }

    var renderTriangles = function(){
        gl.clear( gl.COLOR_BUFFER_BIT );
        gl.drawArrays( gl.TRIANGLES, 0, points.length );
    }

    var loadAndRender = function(isStrip)
    {
        // Load the data into the GPU
        var bufferId = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

        // Associate out shader variables with our data buffer
        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.enableVertexAttribArray( vPosition );
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
        
        renderTriangles();
    }
    var draw = function(value){
        currentShape = currentShape || 0; // check for null
        switch(currentShape){
            case shape.TRIANGLE: drawTriangle();
                            break;
            case shape.SQUARE: drawSquare();
                            break;
            case shape.TRIANGLE_GASKET: drawTriangle(true);   
                            break;
            case shape.SQUARE_GASKET: drawSquare(true);
                            break;
        }
    }
    var drawTriangle = function(asGasket){
            points = [];
            
            var vertices = [
                vec2( -0.5, -0.5 ),
                vec2(  0,  0.5 ),
                vec2(  0.5, -0.5 )
            ];

            divideTriangle( vertices[0], vertices[1], vertices[2],
                            NumTimesToSubdivide, asGasket);

            loadAndRender();
    }
    var drawSquare = function(asGasket){
        points = [];

        var vertices1 = [
            vec2( -0.5, 0.5),
            vec2( -0.5, -0.5),
            vec2( 0.5, 0.5),
        ];

        var vertices2 = [
            vec2( -0.5, -0.5),
            vec2( 0.5, 0.5),
            vec2( 0.5, -0.5)
        ];

        divideTriangle( vertices1[0], vertices1[1], vertices1[2], NumTimesToSubdivide, asGasket);
        divideTriangle( vertices2[0], vertices2[1], vertices2[2], NumTimesToSubdivide, asGasket);

        loadAndRender(true);
    }
    return {
        changeLevel: function(level){
            NumTimesToSubdivide = parseInt(level);
            document.getElementById("levelValue").innerHTML=level;
            draw();
        },
        changeAngle: function(angle){
            TwistAngle = parseInt(angle);
            document.getElementById("angleValue").innerHTML = angle;
            draw();
        },
        changeShape: function(shapeValue){
            currentShape = parseInt(shapeValue);
            draw();
        },
        init: function(){
            document.getElementById("levelValue").innerHTML=NumTimesToSubdivide;
            document.getElementById("angleValue").innerHTML = TwistAngle;

            canvas = document.getElementById( "gl-canvas" );
            gl = WebGLUtils.setupWebGL( canvas );
            if ( !gl ) { alert( "WebGL isn't available" ); }
            
            //  Configure WebGL
            gl.viewport( 0, 0, canvas.width, canvas.height );
            gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

            //  Load shaders and initialize attribute buffers
            program = initShaders( gl, "vertex-shader", "fragment-shader" );
            gl.useProgram( program );

            draw();
        }
    }
})();

window.onload = WebGLProgram.init;


