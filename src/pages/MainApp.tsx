import React, { createRef, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AmbientLight, AnimationAction, Clock, Color, DirectionalLight, Group, HemisphereLight, LinearToneMapping, LoadingManager, Mesh, MeshBasicMaterial, PCFShadowMap, PerspectiveCamera, PlaneGeometry, Quaternion, Raycaster, Scene, Vector3, VideoTexture, WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const mixers: any[] = [];
const clock = new Clock();

const MainAppComponent = (): JSX.Element => {
    const refCanvas = useRef<any>();
    const refVideo1 = useRef<any>();
    const refVideo2 = useRef<any>();
    const refCalloffer = useRef<any>();
    const scene = new THREE.Scene();
    const loader = new GLTFLoader();
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new WebGLRenderer({ antialias: true });

    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    let count = 0;
    useEffect(() => {
        if (!refCanvas.current) return;
        init();
    }, [refCanvas.current])

    useEffect(() => {

    }, []);

    const init = () => {
        refCanvas.current.innerHTML = '';
        createLights()
        load();
        // createControls();
    }

    const onLoad = (result: GLTF, position: THREE.Vector3, animation: THREE.Group | null, mode = '') => {

        const model = result.scene.children[0];
        model.position.copy(position);
        // model.scale.set(0.05, 0.05, 0.05);
        model.scale.set(3, 3, 3);

        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);

        const controls = new OrbitControls(camera, refCanvas.current);

        // const animation = result.animations[0];
        let action: null | AnimationAction = null;
        if (animation) {
            // action = mixer.clipAction(animation.animations[0]);

            // if(!withControl) {
            //     action.play();
            // }
        }
        else {
            // scene.add(model);
        }

        // ANIMATE
        function animate2() {
            controls.update()
            renderer.render(scene, camera);
            requestAnimationFrame(animate2);
        }
        animate2();
    };

    const load = () => {

        scene.background = new Color("skyblue");

        loader.load(
            // 'https://080klxk0l.csb.app/src/models/Flamingo.glb'
            'https://s5lxk2.csb.app/src/models/Rom_Pilot.glb'
            , function (gltf) {
                gltf.scene.traverse(c => {
                    c.castShadow = true;
                });
                scene.add(gltf.scene);
                onLoad(gltf, new Vector3(0, 0, -10), null)
            },
            undefined,
            function (error) {
                console.error(error);
            });



        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.setClearColor('#ffff00'); //0x );

        renderer.toneMapping = LinearToneMapping;
        renderer.toneMappingExposure = Math.pow(0.94, 5.0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFShadowMap;
        renderer.physicallyCorrectLights = true;

        camera.position.set(1.24, 10.5, -23.4);
        renderer.setAnimationLoop(() => {
            update();
            renderer.render(scene, camera);
        });
        const container: HTMLDivElement = refCanvas.current;
        container.innerHTML = '';
        container.appendChild(renderer.domElement)
    }

    const update = () => {
        const delta = clock.getDelta();
        mixers.forEach(mixer => mixer.update(delta));
    }

    function createLights() {
        const light = new DirectionalLight(0xffffff, 3);
        light.position.set(100, 1000, 1000);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 100.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 10;
        light.shadow.camera.right = -10;
        light.shadow.camera.top = 10;
        light.shadow.camera.bottom = -10;

        const hemisphereLight = new HemisphereLight(0xddeeff, 0x202020, 2);
        const ambientLight = new AmbientLight(0xFFFFFF, 0.25);
        scene.add(light, hemisphereLight, ambientLight);
    }


    const createControls = () => {
        const controls = new OrbitControls(camera, refCanvas.current);
    }

    const handleClose = () => {
        setModalOpen(false);
    }

    const toggleModal = () => {
        setModalOpen(pre => !pre);
    }

    const avartarUrlCallback = (avatarUrl: string) => {
        localStorage.setItem('avartarUrl', avatarUrl);
        init();
        loader.load(
            avatarUrl,
            function (gltf) {
                gltf.scene.traverse(c => {
                    c.castShadow = true;
                });

                const manager = new LoadingManager();
                manager.onLoad = () => {

                };
                const loader = new FBXLoader(manager);
                // loader.setPath('../assetss/animation');
                scene.add(gltf.scene);

                loader.load('https://85sxiu.csb.app/src/models/anim_walking.fbx', (animation: Group) => {
                    onLoad(gltf, new Vector3(0, 0.2, -10), animation, 'Run')
                });

                loader.load('https://85sxiu.csb.app/src/models/anim_breathing_idle.fbx', (animation: Group) => {
                    onLoad(gltf, new Vector3(0, 0.2, -10), animation, 'Idle')
                });
            }, (e) => {
                // progress
                // console.log(e)
            },
            function (error) {
                console.error(error);
            });
    }

    const animate = () => {
        // requestAnimationFrame( animate );
        update();
        renderer.render(scene, camera);
    }

    const loadAvartar = () => {
        const url = localStorage.getItem('avartarUrl');
        if (url) {
            avartarUrlCallback(url)
        }
        else {
            toggleModal();
        }
    }

    useEffect(() => {
        const videoEl = refVideo1.current as HTMLVideoElement;
        if (!videoEl) return;

        const texture = new VideoTexture(videoEl);
        const geometry = new PlaneGeometry(16, 9);
        geometry.scale(1, 1, 1);
        const material = new MeshBasicMaterial({ map: texture });
        const count = 1;
        const radius = 10;
        for (let i = 1, l = count; i <= l; i++) {

            const phi = Math.acos(- 1 + (2 * i) / l);
            const theta = Math.sqrt(l * Math.PI) * phi;

            const mesh = new Mesh(geometry, material);
            mesh.position.set(radius, phi + 10, theta + 17);
            mesh.lookAt(camera.position);
            scene.add(mesh);

        }
        update();
    }, [refVideo1.current])

    useEffect(() => {
        const videoEl = refVideo2.current as HTMLVideoElement;
        if (!videoEl) return;
        const texture = new VideoTexture(videoEl);
        const geometry = new PlaneGeometry(16, 9);
        geometry.scale(1, 1, 1);
        const material = new MeshBasicMaterial({ map: texture });
        const count = 1;
        const radius = 10;
        for (let i = 1, l = count; i <= l; i++) {

            const phi = Math.acos(- 1 + (2 * i) / l);
            const theta = Math.sqrt(l * Math.PI) * phi;

            const mesh = new Mesh(geometry, material);
            mesh.position.set(radius - 20, phi + 10, theta + 17);
            mesh.lookAt(camera.position);
            scene.add(mesh);

        }
        update();
    }, [refVideo2.current])

    return (
        <div className="h-full w-full relative">
            <div ref={refCanvas}>

            </div>
        </div>
    )
}

const MainApp = React.memo(MainAppComponent);
export default MainApp;