import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { CustomPass } from './shader/glass/customShader.js'

import GUI from 'lil-gui'
import VirtualScroll from 'virtual-scroll'

import glassVertex from './shader/glass/vertex.glsl'
import glassFragment from './shader/glass/fragment.glsl'
import glassFragmentQuad from './shader/glass/fragmentQuad.glsl'


/**
 * Base
 */
// Debug
const gui = new GUI()
const debugObject = {}
debugObject.progress = 0
gui.add(debugObject, 'progress').min(0).max(1).step(.1)

// Scroller
const scroller = new VirtualScroll()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const modelTexture = textureLoader.load('./model.webp')
const grainTexture = textureLoader.load('./grain.jpg')

/**
 * Model Loader
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(100, 100, 1, 1)

// Material
const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        uTime: new THREE.Uniform(0),
        uResolution: new THREE.Uniform(new THREE.Vector4()),
        uTexture: new THREE.Uniform(modelTexture)
    },
    vertexShader: glassVertex,
    fragmentShader: glassFragment
})

// Mesh
const meshPlane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff}))
meshPlane.position.z = -2
scene.add(meshPlane)


let model = null
gltfLoader.load('./cat.glb', (gltf) => {
    model = gltf.scene.children[0]
    model.scale.set(0.4, 0.4, 0.4)
    model.rotation.set(Math.PI * .01, Math.PI*2.2, 0)
    model.material = material
    
    let uv = model.geometry.attributes.uv.array
    for(let i = 0 ; i < uv.length ; i+=4){
        uv[i + 0] = 0
        uv[i + 1] = 0
        uv[i + 2] = 1
        uv[i + 3] = 0
    }

    scene.add(model)
})

// Events
const target = new THREE.Vector2(0, 0)
const mouse = new THREE.Vector2(0, 0)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width - .5
    mouse.y = - (e.clientY / sizes.height - .5)
})

const imageAspect = 1;

let a1
let a2

if(sizes.height/sizes.width > imageAspect){
    a1 = (sizes.width/sizes.height) * imageAspect
    a2 = 1
} else {
    a1 = 1
    a2 = (sizes.height/sizes.width) * imageAspect
}

material.uniforms.uResolution.value.x = sizes.width
material.uniforms.uResolution.value.y = sizes.height
material.uniforms.uResolution.value.z = a1
material.uniforms.uResolution.value.w = a2

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    const imageAspect = 1

    if(sizes.height/sizes.width > imageAspect){
        a1 = (sizes.width/sizes.height) * imageAspect
        a2 = 1
    } else {
        a1 = 1
        a2 = (sizes.height/sizes.width) * imageAspect
    }

    material.uniforms.uResolution.value.x = sizes.width
    material.uniforms.uResolution.value.y = sizes.height
    material.uniforms.uResolution.value.z = a1
    material.uniforms.uResolution.value.w = a2

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 1000)
camera.position.set(0, 0, 2)
scene.add(camera)

/**
 * Render Target
 */
const renderTarget = new THREE.WebGLRenderTarget(sizes.width, sizes.height)

/**
 * Rendering Scene
 */
const finalScene = new THREE.Scene()
const finalCamera = new THREE.OrthographicCamera(-1 * camera.aspect, 1 * camera.aspect, 1, -1, -100, 100)

const materialQuad = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        uTime: new THREE.Uniform(0),
        uResolution: new THREE.Uniform(new THREE.Vector4()),
        uTexture: new THREE.Uniform(),
        uGrainTexture: new THREE.Uniform(grainTexture)
    },
    vertexShader: glassVertex,
    fragmentShader: glassFragmentQuad
})

const scrollGroup = new THREE.Group()

const renderedMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    materialQuad
)
scrollGroup.add(renderedMesh)

finalScene.add(scrollGroup, finalCamera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post Processing
 */
const composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( finalScene, finalCamera ) );

const effect1 = new ShaderPass( CustomPass )
composer.addPass( effect1 )

// scroller.on(event => {
//     scrollGroup.position.y = event.y/1000
// })

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Move Scene
    target.lerp(mouse, .1)
    renderedMesh.position.x = target.x * 0.5
    renderedMesh.position.y = target.y * 0.5

    if(model){
        model.position.x = -target.x + .36
        model.position.y = -target.y
    }

    // Update controls
    // controls.update()

    // Render
    renderer.setRenderTarget(renderTarget)
    materialQuad.uniforms.uTexture.value = renderTarget.texture
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    renderer.render(finalScene, finalCamera)
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()