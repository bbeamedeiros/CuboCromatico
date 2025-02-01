import  { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function App() {
  const mountRef = useRef(null); // Referência para o elemento DOM onde o Three.js será renderizado

  useEffect(() => {
    // Configuração da cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Adiciona o renderizador ao DOM
    mountRef.current.appendChild(renderer.domElement);

    // Carrega o modelo 3D
    const loader = new GLTFLoader();
    loader.load(
      '/cubo/cubopv.glb', // Caminho para o modelo
      (gltf) => {
        scene.add(gltf.scene);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Erro ao carregar o modelo:', error);
      }
    );

    // Adiciona uma luz direcional
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(10, 10, 10);
    light.castShadow = true;
    scene.add(light);

     // Adiciona um helper para a luz direcional
     const directionalLightHelper = new THREE.DirectionalLightHelper(light, 1);
     scene.add(directionalLightHelper);


    const light2 = new THREE.DirectionalLight(0xffffff, 3);
    light2.position.set(-10, 10, -10);
    light2.castShadow = true;
    scene.add(light2);
    
    // Adiciona um helper para a luz direcional
    const directionalLightHelper2 = new THREE.DirectionalLightHelper(light2, 1);
    scene.add(directionalLightHelper2);
   

    // Adiciona uma luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // Adiciona controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);

    // Posiciona a câmera
    camera.position.set(20, 20, 20);
    controls.update();

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Ajusta o tamanho do canvas e a proporção da câmera quando a janela é redimensionada
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Limpeza ao desmontar o componente
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []); // O array vazio garante que o useEffect só seja executado uma vez

  return <div ref={mountRef} />; // Elemento DOM onde o Three.js será renderizado
}

export default App;