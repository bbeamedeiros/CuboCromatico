import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function App() {
  const mountRef = useRef(null); // Referência para o elemento DOM onde o Three.js será renderizado
  const [autoRotate, setAutoRotate] = useState(false); // Estado para controlar a rotação automática
  const [orbitEnabled, setOrbitEnabled] = useState(true); // Estado para controlar o OrbitControls
  const [ lightHelperEnabled, setLightHelperEnabled ] = useState(true); // Estado para controlar o helper da luz
  useEffect(() => {
    // Configuração da cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Adiciona o renderizador ao DOM
    mountRef.current.appendChild(renderer.domElement);

    // Variável para armazenar o modelo 3D
    let model;

    // Carrega o modelo 3D
    const loader = new GLTFLoader();
    loader.load(
      '/cubo/cubopv1.glb', // Caminho para o modelo
      (gltf) => {
        model = gltf.scene; // Armazena o modelo na variável
        scene.add(model);
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
    if (lightHelperEnabled) {
      const directionalLightHelper = new THREE.DirectionalLightHelper(light, 1);
      scene.add(directionalLightHelper);
    }

    const light2 = new THREE.DirectionalLight(0xffffff, 2);
    light2.position.set(-10, 10, -10);
    light2.castShadow = true;
    scene.add(light2);


    if (lightHelperEnabled) {
      const directionalLightHelper2 = new THREE.DirectionalLightHelper(light2, 1);
      scene.add(directionalLightHelper2);
    }

    // Adiciona uma luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    // Adiciona controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = orbitEnabled; // Define o estado inicial do OrbitControls

    // Posiciona a câmera
    if(autoRotate) {
      camera.position.set(5, 10, 5);
    } else {
      camera.position.set(10, 10, 10);
    }

    controls.update();

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotaciona o modelo no eixo Y se autoRotate for true
      if (autoRotate && model) {
        model.rotation.x += 0.005;
        model.rotation.y += 0.01;
        // model.rotation.z += 0.005;
      }

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
  }, [autoRotate, orbitEnabled, lightHelperEnabled]); // Dependências do useEffect
  
  return (
  <div>
    {/* Título e nomes */}
    <div style={{ position: 'absolute', top: '15px', left: '10px', textAlign: 'initial', zIndex: 2 }}>
      <h1 style={{
        fontFamily: 'Arial, sans-serif', 
        fontWeight: 'bold',             
        fontSize: '36px',              
        color: '#ffffff',              
        margin: 0,                     
      }}>
        Momentos³
      </h1>
      <p style={{
        fontFamily: 'Arial, sans-serif', 
        fontWeight: 'normal',           
        fontSize: '15px',                
        color: '#ffffff',               
        marginTop: '10px',                           
      }}>
        Por: Beatriz Benevinuto, Lara Maria, Natan Henrique, Melk Ineude, Yasmin Almeida.
      </p>
    </div>
    <div>
      {/* Botões para controlar a rotação e o OrbitControls */}
      <div style={{ position: 'absolute', bottom: '15px', right: '10px', zIndex: 1, display: 'flex', flexDirection: 'column', gap:'5px' }}>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{  backgroundColor: 'transparent',
            border: '2px solid #ffffff',
            color: 'white',
            padding: '5px',
            textAlign: 'center',
            fontSize: '15px',
            margin: '4px',
            opacity: 0.6,
            transition: 'opacity 0.3s',
            cursor: 'pointer',
            borderRadius:'5px',
            fontFamily: "monospace"
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.6}
        >
          {autoRotate ? 'Parar Rotação' : 'Girar Modelo'}
        </button>
        <button
          onClick={() => setOrbitEnabled(!orbitEnabled)}
          style = {{ backgroundColor: 'transparent',
            border: '2px solid #ffffff',
            color: 'white',
            padding: '5px',
            textAlign: 'center',
            fontSize: '15px',
            margin: '4px',
            opacity: 0.6,
            transition: 'opacity 0.3s',
            cursor: 'pointer',
            borderRadius:'5px',
            fontFamily: "monospace",
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.6}
        >
          {orbitEnabled ? 'Desabilitar Controle' : 'Habilitar Controle'}
        </button>
        <button
          onClick={() => setLightHelperEnabled(!lightHelperEnabled)}
          style = {{ backgroundColor: 'transparent',
            border: '2px solid #ffffff',
            color: 'white',
            padding: '5px',
            textAlign: 'center',
            fontSize: '15px',
            margin: '4px',
            opacity: 0.6,
            transition: 'opacity 0.3s',
            cursor: 'pointer',
            borderRadius:'5px',
            fontFamily: "monospace",
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0.6}
        >
          {lightHelperEnabled ? 'Desabilitar visualização das luzes' : 'Habilitar visualização das luzes'}
        </button>
      </div>

      {/* Elemento DOM onde o Three.js será renderizado */}
      <div ref={mountRef} /></div>
    </div>
  );
}

export default App;