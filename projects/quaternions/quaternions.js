"use strict"

const WebGLProgram = (function(){
    let gl, shaderProgram;
    const fps = 60;
    
    let quaternionCubeVertexBuffer;
    let quaternionCubeColorBuffer;
    let quaternionCubeIndexBuffer;
    
    let pMatrix = mat4.create();
    let mvMatrix = mat4.create();
    
    let qSlerp = [1, 0, 0, 0];
    let qRotate;
    
    // Inputs
    let txtHeading = 0;
    let txtPitch = 0
    let txtBank = 0;
    
    function drawScene(){
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        mat4.perspective(45, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);
        
        sceneUtility.pushMatrix();
        mat4.translate(mvMatrix, [-2.0, 0, -8.0]);
        
        //quaternion slerp
        let qAxisAngle = mathOperations.quaternionToAxisAnglePair(qSlerp);
        mat4.rotate(mvMatrix, qAxisAngle[0], qAxisAngle.slice(1)); // angle is already in radians
        document.getElementById("axis-angle").innerHTML = "Cube oriented by <br/>Angle: " + sceneUtility.radToDeg(qAxisAngle[0]).toFixed(2) + " degrees around axis [ x:" + (1 * qAxisAngle[1]).toFixed(1) + ", y: " + (1 * qAxisAngle[2]).toFixed(1) + ", z: " + (1 * qAxisAngle[3]).toFixed(1) + "]";
        
        gl.bindBuffer(gl.ARRAY_BUFFER, quaternionCubeVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.aVertexPosition, quaternionCubeVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, quaternionCubeColorBuffer);
        gl.vertexAttribPointer(shaderProgram.aVertexColor, quaternionCubeColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quaternionCubeIndexBuffer);
        sceneUtility.setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, quaternionCubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        sceneUtility.popMatrix();
        
        // repeat for second cube
        sceneUtility.pushMatrix();
        mat4.translate(mvMatrix, [2.0, 0, -8.0]);
        mat4.rotate(mvMatrix, qAxisAngle[0], qAxisAngle.slice(1)); // angle is already in radians
        
        gl.bindBuffer(gl.ARRAY_BUFFER, quaternionCubeVertexBuffer);
        gl.vertexAttribPointer(shaderProgram.aVertexPosition, quaternionCubeVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, quaternionCubeColorBuffer);
        gl.vertexAttribPointer(shaderProgram.aVertexColor, quaternionCubeColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quaternionCubeIndexBuffer);
        sceneUtility.setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, quaternionCubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        sceneUtility.popMatrix();
        
    }
    
    let timeRecorded = 0
    function animate(){
        let timeNow = new Date().getTime();
        if(timeRecorded != 0){
            let elapsedTime = timeNow - timeRecorded;
            const perSecond = 1/1000.0;
            
            if(!mathOperations.quaternionEquals(qSlerp,qRotate)){
                qSlerp = mathOperations.slerp(qSlerp, qRotate, elapsedTime * perSecond);
                document.getElementById("slerp").innerHTML = "w: " + qSlerp[0] + "<br/> x: " + qSlerp[1] + "<br/> y: " + qSlerp[2] + "<br/> z: " + qSlerp[3];
            }
            
        }
        timeRecorded = timeNow;
    }
    
    const sceneUtility = {
        matrixStack: [],
        pushMatrix: function(){
            let copy = mat4.create();
            mat4.set(mvMatrix, copy);
            this.matrixStack.push(copy);
        },
        popMatrix: function(){
            if(this.matrixStack.length == 0){
                alert("Invalid pop matrix");
            }
            mvMatrix = this.matrixStack.pop();
        },
        setMatrixUniforms: function(){
            gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.uMvMatrix, false, mvMatrix);
        },
        degToRad: function(deg){
            return deg * (Math.PI/ 180);
        },
        radToDeg: function(rad){
            return rad * (180/Math.PI);
        }
    };
    
    const mathOperations ={
        eulerToQuaternion: function(heading, pitch, bank){
            const cosHOver2 = Math.cos(sceneUtility.degToRad(heading * 0.5)).toFixed(15);
            const sinHOver2 = Math.sqrt(1 - Math.pow(cosHOver2,2));
            const cosPOver2 = Math.cos(sceneUtility.degToRad(pitch * 0.5)).toFixed(15);
            const sinPOver2 = Math.sqrt(1 - Math.pow(cosPOver2,2));
            const cosBOver2 = Math.cos(sceneUtility.degToRad(bank * 0.5)).toFixed(15);
            const sinBOver2 = Math.sqrt(1 - Math.pow(cosBOver2,2));
            
            let q = new Array();
            q.push(((cosHOver2 * cosPOver2 * cosBOver2) + (sinHOver2 * sinPOver2 * sinBOver2)).toFixed(10));
            q.push(((sinHOver2 * sinPOver2 * cosBOver2) + (cosHOver2 * cosPOver2 * sinBOver2)).toFixed(10));
            q.push(((sinHOver2 * cosPOver2 * cosBOver2) + (cosHOver2 * sinPOver2 * sinBOver2)).toFixed(10));
            q.push(((cosHOver2 * sinPOver2 * cosBOver2) - (sinHOver2 * cosPOver2 * sinBOver2)).toFixed(10));
            return q; // represented by 4 element array [w x y z]
        },
        slerp: function(q1, q2, delta){ // q1 and q2 are 4 element arrays
            let result = new Array();
            let k0, k1;
            let cosOmega = q1[0]*q2[0] + q1[1]*q2[1] + q1[2]*q2[2] + q1[3]*q2[3];
            if(cosOmega < 0.001){
                // negate any one input to take the shorter arc between quaternions
                q1[0] = -q1[0];
                q1[1] = -q1[1];
                q1[2] = -q1[2];
                q1[3] = -q1[3];
            }
            if(cosOmega > 0.999){
                // quaternions are too close - use linear interpolation
                k0 = 1-delta;
                k1 = delta;
            }
            else
                {
                let sinOmega = Math.sqrt(1 - Math.pow(cosOmega, 2));
                let omega = Math.atan2(sinOmega, cosOmega);
                let oneBySinOmega = 1 / sinOmega;
                k0 = Math.sin((1-delta) * omega) * oneBySinOmega;
                k1 = Math.sin(delta * omega) * oneBySinOmega;
            }
            result.push((k0 * q1[0] + k1 * q2[0]).toFixed(4));
            result.push((k0 * q1[1] + k1 * q2[1]).toFixed(4));
            result.push((k0 * q1[2] + k1 * q2[2]).toFixed(4));
            result.push((k0 * q1[3] + k1 * q2[3]).toFixed(4));
            return result;
        },
        quaternionToAxisAnglePair: function(quaternion){ 
            let theta = 2 * Math.acos(quaternion[0]);
            let result = new Array();
            result.push(theta);
            let sinComponent = Math.sqrt(1 - Math.pow(quaternion[0],2));
            let oneOverSinComponent = 1 / sinComponent;
            if(sinComponent < 0.1){
                result.push(quaternion[1]);
                result.push(quaternion[2]);
                result.push(quaternion[3]);
            }
            else{
                result.push(quaternion[1] * oneOverSinComponent);
                result.push(quaternion[2] * oneOverSinComponent);
                result.push(quaternion[3] * oneOverSinComponent);	
            }
            return result; // represented by 4 element array [theta n.x n.y n.z]
        },
        multiplyQuaternions: function(q1, q2){
            let result = new Array();
            result.push(q1[0]*q2[0] - q1[1]*q2[1] - q1[2]*q2[2] - q1[3]*q2[3]);
            result.push(q1[0]*q2[1] + q1[1]*q2[0] + q1[3]*q2[2] - q1[2]*q2[3]);
            result.push(q1[0]*q2[2] + q1[2]*q2[0] + q1[1]*q2[3] - q1[3]*q2[1]);
            result.push(q1[0]*q2[3] + q1[3]*q2[0] + q1[2]*q2[1] - q1[1]*q2[2]);
            return result;
        },
        quaternionPower: function(q, power){
            if(q[0]> 0.999){
                return q;
            }
            let alpha = Math.acos(q[0]);
            let newAlpha = alpha * power;
            let mult = Math.sin(newAlpha)/ Math.sin(alpha);
            let result = new Array();
            result.push(Math.cos(newAlpha));
            result.push(q[1] * mult);
            result.push(q[2] * mult);
            result.push(q[3] * mult);
            return result;
        },
        quaternionEquals: function(q1, q2){
            if((Math.abs(q1[0] - q2[0]) < 0.0001) && 
            (Math.abs(q1[1] - q2[1]) < 0.0001) &&
            (Math.abs(q1[2] - q2[2]) < 0.0001) &&
            (Math.abs(q1[3] - q2[3]) < 0.0001)){
                return true;
            }
            return false;
        }
    }
    
    function initGL(canvas){
        try{
            gl = WebGLUtils.setupWebGL(canvas);
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        }
        catch(e){}
        if(!gl){
            alert("Could not initialize gl context");
        }
    }
    
    function initShaders(){
        const fragmentShader = getShader(gl, "shader-fs");
        const vertexShader = getShader(gl, "shader-vs");
        
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        
        if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
            alert("Could not link shader programs");
        }
        
        gl.useProgram(shaderProgram);
        
        shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.aVertexPosition);
        
        shaderProgram.aVertexColor = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.aVertexColor);
        
        shaderProgram.uPMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.uMvMatrix = gl.getUniformLocation(shaderProgram, "uMvMatrix");
        
    }
    
    function getShader(gl, id){
        var shaderScript = document.getElementById(id);
        if(!shaderScript){
            return null;
        }
        
        var str = "";
        var k = shaderScript.firstChild;
        while(k){
            if(k.nodeType == 3){
                str += k.textContent;
            }
            k =  k.nextSibling;
        }
        
        var shader;
        if(shaderScript.type == "x-shader/x-fragment"){
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if(shaderScript.type == "x-shader/x-vertex"){
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else{
            return null;
        }
        
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }
    
    function initBuffers(){
        
        var vertices = [
            //Front Face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
            
            //Back Face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            
            //Top Face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            
            //Bottom Face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
            
            //Right Face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
            
            //Left Face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ];
        
        var colors = [
            [1.0, 0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0, 1.0],
            [0.0, 0.5, 0.5, 1.0],
            [0.5, 0.0, 0.5, 1.0],
            [0.5, 0.5, 0.0, 1.0],
            [0.0, 0.0, 1.0, 1.0]
        ];
        var unpackedColors = [];
        for(var i=0;i<colors.length; i++){
            var color = colors[i];
            for(var j=0;j<4;j++){
                unpackedColors = unpackedColors.concat(color);
            }
        }
        
        var cubeVertexIndices=[
            0, 1, 2,     0, 2, 3,
            4, 5, 6,     4, 6, 7,
            8, 9, 10,    8, 10, 11,
            12, 13, 14,  12, 14, 15,
            16, 17, 18,  16, 18, 19,
            20, 21, 22,  20, 22, 23
        ];
        
        quaternionCubeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quaternionCubeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        quaternionCubeVertexBuffer.itemSize = 3;
        quaternionCubeVertexBuffer.numItems = 24;
        
        quaternionCubeColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quaternionCubeColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
        quaternionCubeColorBuffer.itemSize = 4;
        quaternionCubeColorBuffer.numItems = 24;
        
        quaternionCubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quaternionCubeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        quaternionCubeIndexBuffer.itemSize = 1;
        quaternionCubeIndexBuffer.numItems = 36;
    }
    
    function tick(){
        window.setTimeout(function(){
            window.requestAnimFrame(tick);
            animate();
            drawScene();
        }, 1000/fps);
        
    }
    return {
        recalculate: function() {
            qSlerp = [1, 0, 0, 0];
            this.reset();
        },
        reset: function(){
            txtHeading =  document.getElementById("heading").value;
            txtPitch = document.getElementById("pitch").value;
            txtBank = document.getElementById("bank").value;
            
            document.getElementById("headingValue").innerHTML = txtHeading;
            document.getElementById("pitchValue").innerHTML = txtPitch;
            document.getElementById("bankValue").innerHTML = txtBank;
            
            qRotate = mathOperations.eulerToQuaternion(parseFloat(txtHeading), parseFloat(txtPitch), parseFloat(txtBank));
            document.getElementById("quaternion-w").innerHTML = "w: " + qRotate[0] + "<br/>";
            document.getElementById("quaternion-v").innerHTML = "x: " + qRotate[1] + "<br/> y: " + qRotate[2] + "<br/> z: " + qRotate[3];
        },
        webGLStart: function(){
            var canvas = document.getElementById("gl-canvas");
            initGL(canvas);
            initShaders();
            initBuffers();
            this.reset();
            
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            
            tick();
        }
    }
})();

window.onload = WebGLProgram.webGLStart();