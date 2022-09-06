import { Entity } from "../entities/entity";

export const generateUUID = (length: number) => { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    var result = '';
    if (length)
        for (var i = 0; i < length; i++) result += 'x';
    else
        result = 'xxxxxxxxxxxxxx';
    return result.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
export const getResRatio = (MAX_RES_WIDTH = 1920, MAX_RES_HEIGHT = 1080) => {
    if (window.innerWidth > MAX_RES_WIDTH) {
        return MAX_RES_WIDTH / window.innerWidth;
    }

    if (window.innerHeight > MAX_RES_HEIGHT) {
        return MAX_RES_HEIGHT / window.innerHeight;
    }

    return window.devicePixelRatio;
}

export const loadEntitiesInOrder = (entities: [Entity], onEach: (arg: any) => void, onComplete: (arg: any) => void) => {
    if (!entities || entities.length < 1) return;
    var arrayToLoad = entities.slice();

    const loadNextEnt = () => {
        let ent = arrayToLoad.pop();
        ent!.loadAsset(() => {
            onEach(ent);

            if (arrayToLoad.length < 1) {
                if (onComplete) onComplete(ent);
                return;
            } else {
                loadNextEnt();
            }
        });
    };
    loadNextEnt();
}
