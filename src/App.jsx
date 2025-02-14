import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function App() {
  const mountRef = useRef(null); // Referência para o elemento DOM onde o Three.js será renderizado
  const [autoRotate, setAutoRotate] = useState(false); // Estado para controlar a rotação automática
  const [orbitEnabled, setOrbitEnabled] = useState(true); // Estado para controlar o OrbitControls
  const [ lightHelperEnabled, setLightHelperEnabled ] = useState(false); // Estado para controlar o helper da luz
  const [gradientBackgroundEnabled, setGradientBackgroundEnabled] = useState(false); // Estado para controlar o fundo gradiente
  
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


    // Cores para cada canto da tela, dependendo da face visível do cubo
    const gradients = {
      front: [['#4A00A5', '#42265B'], ['#212C40', '#4A1F37'],['#CB007E', '#AC728C'] , ['red', '#3C0B16']],
      back: [['#376834', '#5C9A53'], ['#018ADB', '#01AFDD'], ['#ECDD01', '#C4C579'], ['#D7CFBA', '#BDF3C5']],
      left: [['#352A2A', '#4E3014'], ['#26490A', '#252A10'], ['#A91122', '#B75F2C'], ['#DDB106', '#A8A12D']],
      right: [['#058BCB', '#316A9A'], ['#191e83', '#7F4A9A'], ['#F7F6EC', '#BBACD6'], ['#D50E84', '#9A5282']],
      top: [['#BD1D76', '#D26477'], ['#851E28', '#BC5A45'], ['#FBF0EE', '#F7CDB3'], ['#DDC928', '#F8CE64']],
      bottom: [['#64A1E2', '#5495B0'], ['#83B244', '#435A47'], ['#14223D', '#013A55'], ['#252413', '#45543D']],
    };


    const createGradientTexture = (color1, color2, color3, color4) => {
      const size = 512; // Tamanho da textura
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
    
      // Criamos quatro gradientes radiais, um para cada canto
      const gradient1 = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 0.6);
      gradient1.addColorStop(0, color1[0]);
      gradient1.addColorStop(1, color1[1]);
    
      const gradient2 = ctx.createRadialGradient(size, 0, size * 0.2, size, 0, size * 0.6);
      gradient2.addColorStop(0, color2[0]);
      gradient2.addColorStop(1, color2[1]);
    
      const gradient3 = ctx.createRadialGradient(0, size, size * 0.2, 0, size, size * 0.6);
      gradient3.addColorStop(0, color3[0]);
      gradient3.addColorStop(1, color3[1]);
    
      const gradient4 = ctx.createRadialGradient(size, size, size * 0.2, size, size, size * 0.6);
      gradient4.addColorStop(0, color4[0]);
      gradient4.addColorStop(1, color4[1]);
    
      // Aplicamos os gradientes ao canvas
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, size / 2, size / 2);
    
      ctx.fillStyle = gradient2;
      ctx.fillRect(size / 2, 0, size / 2, size / 2);
    
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, size / 2, size / 2, size / 2);
    
      ctx.fillStyle = gradient4;
      ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
    
      return new THREE.CanvasTexture(canvas);
    };
    

    // Atualiza o fundo da cena de acordo com a face visível do cubo
    const updateBackground = () => {
      if (!model) return;

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const absX = Math.abs(cameraDirection.x);
      const absY = Math.abs(cameraDirection.y);
      const absZ = Math.abs(cameraDirection.z);

      let dominantAxis = 'front';
      if (absX > absY && absX > absZ) {
        dominantAxis = cameraDirection.x > 0 ? 'right' : 'left';
      } else if (absY > absX && absY > absZ) {
        dominantAxis = cameraDirection.y > 0 ? 'top' : 'bottom';
      } else {
        dominantAxis = cameraDirection.z > 0 ? 'back' : 'front';
      }

      const colors = gradients[dominantAxis];
      scene.background = createGradientTexture(colors[0], colors[1], colors[2], colors[3]);
    };

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotaciona o modelo no eixo Y se autoRotate for true
      if (autoRotate && model) {
        model.rotation.x += 0.005;
        model.rotation.y += 0.01;
        // model.rotation.z += 0.005;
      }

      if (gradientBackgroundEnabled){
        updateBackground();
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
  }, [autoRotate, orbitEnabled, lightHelperEnabled, gradientBackgroundEnabled]); // Dependências do useEffect

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
          onClick={() => {
            setAutoRotate(!autoRotate)
            setGradientBackgroundEnabled(false)
          }}
          style={{  backgroundColor: 'transparent',
            // caso o fundo gradiente esteja habilitado
            // a cor da borda e do texto será preta, caso contrário, será branca
            border: `2px solid ${gradientBackgroundEnabled ? 'black' : 'white'}`,
            color: `${gradientBackgroundEnabled ? 'black' : 'white'}`,
            fontWeight: 'bold',
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
            // caso o fundo gradiente esteja habilitado
            // a cor da borda e do texto será preta, caso contrário, será branca
            border: `2px solid ${gradientBackgroundEnabled ? 'black' : 'white'}`,
            color: `${gradientBackgroundEnabled ? 'black' : 'white'}`,
            fontWeight: 'bold',
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
            // caso o fundo gradiente esteja habilitado
            // a cor da borda e do texto será preta, caso contrário, será branca
            border: `2px solid ${gradientBackgroundEnabled ? 'black' : 'white'}`,
            color: `${gradientBackgroundEnabled ? 'black' : 'white'}`,
            fontWeight: 'bold',
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
        <button
          onClick={() => {
            setGradientBackgroundEnabled(!gradientBackgroundEnabled)
            setAutoRotate(false)
          }}
          style = {{ backgroundColor: 'transparent',
            // caso o fundo gradiente esteja habilitado
            // a cor da borda e do texto será preta, caso contrário, será branca
            border: `2px solid ${gradientBackgroundEnabled ? 'black' : 'white'}`,
            color: `${gradientBackgroundEnabled ? 'black' : 'white'}`,
            fontWeight: 'bold',
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
          {gradientBackgroundEnabled ? 'Desabilitar fundo gradiente' : 'Habilitar fundo gradiente'}
        </button>
      </div>

      {/* Elemento DOM onde o Three.js será renderizado */}
      <div ref={mountRef} /></div>
    </div>
  );
}

export default App;