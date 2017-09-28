function render () {
  var height;
	uniforms.time.value += 0.05
	window.requestAnimationFrame(render);
  if(lastTime > 0.0){
    var currentTime = Date.now();
    var delta = (currentTime - lastTime)/1000;
    for (var i = cubes.length - 1; i >= 0; i--) {
      cubes[i].position.x += cubes[i].speed * delta;
      cubes[i].rotation.x += 0.2 * cubes[i].speed * delta;
      cubes[i].rotation.y += 0.2 * delta;

      if(cubes[i].position.x >= 12 + (-cubes[i].position.z * Math.tan(camera.fov/2))){
        cubes[i].position.x = -cubes[i].position.x;
      }
    }
    lastTime = currentTime
  }
  else{
    lastTime = Date.now();
  }
	renderer.render(scene, camera);
}

function fitToContainer(canvas){
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  canvas.style.zIndex = 1;
  canvas.style.position= 'absolute';
  canvas.style.left='0px';
  canvas.style.top='0px';
}

var lastTime = 0;
var container = document.getElementById("intro");
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 100);
camera.position.z=5;
var renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000,0); //transparent background
container.appendChild(renderer.domElement);
fitToContainer(renderer.domElement);

var uniforms={
	resolution: {type:"v2", value:new THREE.Vector2(container.clientWidth, container.clientHeight)},
	time: {type:"f",value:0}
}

//var shaderCode = document.getElementById('fragShader').innerHTML;
// var geometry = new THREE.PlaneGeometry(10, 10);
// var material = new THREE.ShaderMaterial({uniforms:uniforms, fragmentShader: shaderCode});
// var plane = new THREE.Mesh(geometry, material);
//scene.add(plane);

var cubes = [];
var yPosition;
var zPosition = -5;
for(var zCubes = 0; zCubes < 10; ++zCubes){
  yPosition = -5;
  for(var yCubes=0; yCubes< 10; ++yCubes){
    var cubeGeometry = new THREE.BoxGeometry(0.5,0.5,0.5);
    var cubeMaterial = new THREE.MeshLambertMaterial({color:Math.random() * 0xffffff});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    
    cube.position.y = yPosition;
    cube.position.z = zPosition;
    cube.rotation.z = Math.random();
    cube.position.x = -10 + Math.round(Math.random() * 10);
    cube.speed = Math.round(3 + Math.random() * 5);
    cubes.push(cube);
    scene.add(cube);       
    yPosition += 1;
  }
  zPosition -= 2;
}

var spotLight = new THREE.PointLight(0xffffff);
spotLight.position.set(0, 0, 10);
scene.add(spotLight);
render();

