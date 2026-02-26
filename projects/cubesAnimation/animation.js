let lastTime = 0;

const container = document.getElementById("demo");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 100);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000,0); //transparent background
container.appendChild(renderer.domElement);

const uniforms={
	resolution: {type:"v2", value:new THREE.Vector2(container.clientWidth, container.clientHeight)},
	time: {type:"f",value:0}
}

let cubes = [];
let yPosition;
let zPosition = 0;
for(let zCubes = 0; zCubes < 10; ++zCubes){
  yPosition = -5;
  for(let yCubes=0; yCubes< 10; ++yCubes){
    const cubeGeometry = new THREE.BoxGeometry(0.5,0.5,0.5);
    const cubeMaterial = new THREE.MeshLambertMaterial({color:Math.random() * 0xffffff});
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    
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

const spotLight = new THREE.PointLight(0xffffff);
spotLight.position.set(0, 0, 10);
scene.add(spotLight);
render();


function render () {
	uniforms.time.value += 0.05
	window.requestAnimationFrame(render);
  if(lastTime > 0.0){
    let currentTime = Date.now();
    let delta = (currentTime - lastTime)/1000;
    for (let i = cubes.length - 1; i >= 0; i--) {
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