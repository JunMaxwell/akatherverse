import * as THREE from 'three';
import * as Utils from '../utils/utils.js';
import * as AssetCompat from '../utils/assets.js';

interface datasets {
    id?: string,
    position?: THREE.Vector3,
    rotation?: THREE.Euler,
    assetPath?: string,
    texturePath?: string,
    scale?: number
}

export class Entity {
    //DATA
    id: string
    position: THREE.Vector3
    rotation: THREE.Euler
    assetPath: string
    texturePath: string
    scale: number

    //CONTROLS
    directControl: Boolean

    //ENTITES
    children: Entity[]
    proxies: [THREE.Mesh?]
    actionBlock: { [index: string | number]: any }

    //Mutable objects
    model?: THREE.Object3D
    object?: THREE.Object3D
    collider?: THREE.Mesh
    bbHelper?: THREE.BoxHelper
    clickable?: boolean
    parent?: Entity
    lights?: [THREE.Light?]
    hidden?: boolean

    constructor(existedData: datasets) {
        this.id = existedData.id ? existedData.id : Utils.generateUUID(20);
        this.position = existedData.position ? existedData.position : new THREE.Vector3();
        this.rotation = existedData.rotation ? existedData.rotation : new THREE.Euler();
        this.assetPath = existedData.assetPath ? existedData.assetPath : '';
        this.texturePath = existedData.texturePath ? existedData.texturePath : '';
        this.scale = existedData.scale ? existedData.scale : 1;

        this.directControl = false;
        this.children = [];
        this.proxies = []
        this.actionBlock = {}
    }

    constructWithMesh(mesh: THREE.Mesh): void {
        this.id = mesh.name;
        this.position = mesh.position;
        this.rotation = mesh.rotation;

        this.model = mesh;
        this.object = mesh;
        this.collider = mesh;

        this.bbHelper = new THREE.BoxHelper(mesh);
        this.bbHelper.visible = false;

        this.children = [];
        this.proxies = [];
        this.actionBlock = {};

        if (mesh.userData.clickable) {
            this.clickable = true;
        }
        if (this.object.parent === undefined || this.object.parent === null) return
        this.object!.parent.add(this.bbHelper);
    }

    asRootEntity(scene: THREE.Scene): Entity {
        this.id = 'RootOfMetav';
        this.object = scene;
        this.directControl = true;
        return this;
    }

    addChild(childEntity: Entity) {
        if (!this.children.includes(childEntity)) {
            childEntity.parent = this;
            this.children.push(childEntity);
        }
    }

    renderFrame(dt: number) {
        this.children.forEach(ent => ent!.renderFrame(dt));

        if (!this.directControl && this.object) {
            this.object.position.set(this.position.x, this.position.y, this.position.z);
            const euler = new THREE.Euler(this.rotation.x, this.rotation.y, this.rotation.x);
            this.object.quaternion.setFromEuler(euler);
            this.object.scale.setScalar(this.scale);
        }
    }

    addLight(light: THREE.Light) {
        if (!this.lights)
            this.lights = [];

        this.object!.add(light);
        if (!this.lights.includes(light))
            this.lights.push(light);
    }

    //--------------------------------------------------------Asset Loading-------------------------------------------------------

    updateExistData(data: datasets) {
        this.position = data.position ? data.position : this.position;
        this.rotation = data.rotation ? data.rotation : this.rotation;
        this.scale = data.scale ? data.scale : this.scale;
        // this.assetPath = existanceData.assetPath;
        // this.texturePath = existanceData.texturePath;

        // this.object.position.set(data.position.x, data.position.y, data.position.z);
        // const euler = new THREE.Euler(data.rotation.x, data.rotation.y, data.rotation.x);
        // this.object.quaternion.setFromEuler( euler );
        // this.object.scale.setScalar(data.scale);
    }

    loadAsset(onComplete?: () => void) {
        const ent = this;
        AssetCompat.loadAsset(
            ent.assetPath,
            (fbx: THREE.Object3D) => {
                if (ent.texturePath) {
                    AssetCompat.loadAsset(ent.texturePath, texture => {
                        fbx.traverse(child => {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                                texture.minFilter = THREE.NearestFilter;
                                var prevMaterial = child.material;
                                child.material = new THREE.MeshLambertMaterial({ map: texture });
                                THREE.MeshBasicMaterial.prototype.copy.call(child.material, prevMaterial);
                                child.material.needsUpdate = true;
                                child.material.map = texture;
                            }
                        });
                    });
                }
                ent.model = fbx;

                ent.object = new THREE.Object3D();
                ent.object.add(fbx);

                ent.object.position.set(ent.position.x, ent.position.y, ent.position.z);
                ent.object.rotation.set(ent.rotation.x, ent.rotation.y, ent.rotation.z);
                ent.object.scale.setScalar(ent.scale);

                let boundingBox = new THREE.Box3();
                boundingBox.setFromObject(fbx);
                var size = new THREE.Vector3();
                boundingBox.getSize(size);

                const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                const material = new THREE.MeshBasicMaterial({ visible: false });
                const box = new THREE.Mesh(geometry, material);
                box.userData.objId = ent.id;
                box.position.set(0, size.y / 2, 0);
                ent.object.add(box);
                ent.collider = box;
                ent.proxies = [box];

                ent.bbHelper = new THREE.BoxHelper(box);
                ent.bbHelper.visible = false;
                ent.object.add(ent.bbHelper);

                if (onComplete) onComplete();
            }
        )
    }

    //---------------------------------------------------------Properties---------------------------------------------------------

    getProxies(): [THREE.Mesh?] {
        let proxies: [THREE.Mesh?] = [];
        if (!this.hidden) proxies = [...this.proxies];
        this.children.forEach(ent => proxies = [...ent!.getProxies()]);
        return proxies;
    }

    getClickableEntities(): [Entity?] {
        let clickables: [Entity?] = [];
        if (this.clickable) {
            clickables.push(this);
        }
        this.children.forEach(ent => clickables = [...ent!.getClickableEntities()]);
        return clickables;
    }

    setHelpBoxVisibility(visible: boolean) {
        if (this.bbHelper) this.bbHelper.visible = visible;
        this.children.forEach(ent => ent!.setHelpBoxVisibility(visible));
    }

    removeEntity(entity: Entity) {
        this.children = this.children.filter(ent => ent!.id !== entity.id);
    }

    hideFromParent() {
        this.object!.parent?.remove(this.object!);
        this.hidden = true;
    }

    removeFromParent() {
        this.object!.parent?.remove(this.object!);
        this.parent?.removeEntity(this);
    }
    //------------------------------------------------------Broadcast Protocol------------------------------------------------------

    broadcastAction(action: string, payload: any) {
        if (this.parent) {
            this.parent.broadcastAction(action, payload);
        }

        if (this.actionBlock[action]) {
            this.actionBlock[action].forEach((callBlock: ((arg: any) => void)) => callBlock(payload));
        }
    }

    listenToBroadcast(action: string, actionBlock: { [index: number | string]: any }) {
        if (!this.actionBlock[action]) {
            this.actionBlock[action] = [];
        }

        this.actionBlock[action].push(actionBlock);
    }

    findEntity(entityId: string): Entity | boolean {
        if (this.id === entityId)
            return this;

        let found = this.children.find(ent => ent.id === entityId);
        if (found)
            return found;

        for (var i = 0; i < this.children.length; i++) {
            let childFound = this.children[i].findEntity(entityId);
            if (childFound)
                return childFound;
        }

        return false;
    }

    executeAction(data: { id: string, action: string, params: any }) {
        if (data.action) {
            // if (this[data.action]<Function>) this[data.action](data.params);
        }
    }

}