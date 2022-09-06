import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { DataManager } from './data';

export const preloadAssets = (assetPaths: string[], onLoadingCompleted: () => void, onProgress: (arg: any) => void) => {
    let loadingPaths = assetPaths.slice();
    var completed = false;

    const loadNextAnim = () => {
        let path = loadingPaths.pop();

        let onLoop = () => {
            if (loadingPaths.length > 0) {
                loadNextAnim();
            } else {
                if (!completed && onLoadingCompleted) {
                    completed = true;
                    onLoadingCompleted();
                }
            }
        };
        loadAsset(path!, 
            onLoop, 
            xhr => {
            var loaded = assetPaths.length - loadingPaths.length - 1 + (xhr.loaded / xhr.total);
            onProgress(Math.round((loaded / assetPaths.length) * 100));
        }, 
        () => { console.log('SHIT')},
        onLoop);
    };
    loadNextAnim();
}

export const loadAsset = (path: string, onCompleted?: (arg: any) => void, xhr?: (arg: any) => void, onError?: () => void, storePreloaded?: null | (() => void) ) => {
    const dataManager = DataManager.getInstance();
    if (!dataManager.preloadedAssets) dataManager.preloadedAssets = {};

    if (dataManager.preloadedAssets[path]) {
        onCompleted!(dataManager.preloadedAssets[path]);
        return;
    }

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '../../libs/draco/gltf/' );

    const loadingComplete = (asset: any) => {
        if (storePreloaded) dataManager.preloadedAssets[path] = asset;
        onCompleted!(asset);
    }
    if (path.endsWith(".fbx")) {
        const loader = new FBXLoader();
        loader.load(path, fbx => {
            loadingComplete(fbx);
        }, xhr, onError);
    } else if (path.endsWith(".gltf")) {
        const loader = new GLTFLoader();
        loader.setDRACOLoader( dracoLoader );
        loader.load(path, gltf => {
            loadingComplete(gltf.scene);
        }, xhr, onError);
    } else {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(path, texture => {
            loadingComplete(texture);
        }, xhr, onError);
    }
}