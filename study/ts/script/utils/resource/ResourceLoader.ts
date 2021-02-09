import { G_EffectGfxMgr, G_SceneManager } from "../../init";
import { Lang } from "../../lang/Lang";
import { EffectGfxData } from "../../manager/EffectGfxManager";
import { LoadLogger } from "../../scene/view/login/LoadLogger";
import ALDStatistics from "../ALDStatistics";
import { UIPopupHelper } from "../UIPopupHelper";

export interface ResourceData {
    path: string;
    type: typeof cc.Asset;
}


function checkResourcesExist(path: string, type: typeof cc.Asset, bundle: string): boolean {
    let config = (cc.assetManager.getBundle(bundle) as any)._config;
    let info = config.getInfoWithPath(path, type)
    if (!info) {
        return false;
    }

    return true;
}

//删除文件路径后缀，容易误删。以后要修改
function formatUrl(path: string) {
    if (!path) {
        return path;
    }

    let index = path.indexOf('.');
    if (index < 0) {
        return path;
    }

    return path.substring(0, index);
}

//过滤掉不存在的资源下载
function filterTask(task, done) {
    let input = task.input, options = task.options;
    input = Array.isArray(input) ? input : [input];

    task.output = [];
    for (let i = 0; i < input.length; i++) {
        let item = input[i];
        let path: string = undefined;
        let type: typeof cc.Asset;
        let bundle: string;
        if (typeof item === 'string') {
            if (options.__requestType__ === 'path') {
                path = item = formatUrl(item);
                type = options.type;
                bundle = options.bundle;
            }
        } else if (typeof item === 'object' && item && item.path) { //item没有path不可以给path赋值，赋值undefined也不可以，后面的task会认为有path这个key，会报错
            path = item.path = formatUrl(item.path);
            type = item.type || options.type;
            bundle = item.bundle || options.bundle;
        }

        if (item && (!path || (path && checkResourcesExist(path, type, bundle)))) {
            task.output.push(item);
        }

    }

    done();
}

function getRunningSceneName() {
    let name = G_SceneManager && G_SceneManager.getRunningSceneName();
    return name ? name : 'NoSceneName';
}

//给资源加上场景
function addSceneNameTask(task, done) {
    let options = task.options;
    if (!options) {
        task.options = { sceneName: getRunningSceneName() }
    } else if (!options.sceneName) {
        options.sceneName = getRunningSceneName();
    }

    task.output = task.input;

    done();
}

const MAX_RETRY = 2;
//下载资源添加失败报错
function transformCompleteTask(task, done) {
    let onComplete = task.onComplete;
    let input = task.input;
    let options = task.options;
    let onError = task.onError;
    let onProgress = task.onProgress;
    let progress = task.progress;
    if (onComplete) {
        task.onComplete = function (err: Error, assets) {
            //资源不存在不报错
            if (err) {
                let __zm_retry = options.__zm_retry || 0;
                if (__zm_retry < MAX_RETRY) {
                    options.__zm_retry = __zm_retry + 1;
                    //必须用原来的task，loadDepends里面会用到这个task的引用，所以不能create新的task
                    task.set({
                        input: input,
                        options: options,
                        onComplete: onComplete,
                        onError: onError,
                        onProgress: onProgress,
                        progress: progress,
                    })
                    cc.assetManager.pipeline.async(task);
                    return;
                }
                console.error(err);
                UIPopupHelper.showOfflineDialog(Lang.get("login_network_timeout"))
                return;
            }

            onComplete(err, assets);
        }
    }

    task.output = task.input;

    done();
}

function addAssetsRefTask(task, done) {
    let options = task.options
    let sceneName = options && options.sceneName;
    let input = task.input;
    if (input instanceof cc.Asset) {
        ResourceLoader.addAssetSceneBit(input, sceneName);
    }

    if (Array.isArray(input)) {
        input.forEach((v) => {
            if (v instanceof cc.Asset) {
                ResourceLoader.addAssetSceneBit(v, sceneName);
            }
        })
    }

    task.output = task.input;
    done();
}


export default class ResourceLoader {
    // private static ref: {[key: string]: string[]} = {};  //调试时用
    // private static ref: {[key: string]: number} = {};
    private static resources: { [key: string]: { [key: string]: boolean } } = {};

    // private static downloading = 0;

    // private static scenes: string[] = [];

    // private static willAddRef: {[key: string]: boolean} = {};

    // private static sceneDependAssets: string[];

    // private static removeScene: boolean = false;
    private static memoryWarning: number = 0;
    // private static memoryWarningTime: number = 0;

    public static loadLog: LoadLogger;

    // private static getSceneBitIndex(name?: string): number {
    //     if (!G_SceneManager) {
    //         return -1;
    //     }
    //     name = name || G_SceneManager.getRunningSceneName();
    //     if (!name) {
    //         return -1;
    //     }
    //     let index = this.scenes.indexOf(name);
    //     if (index < 0) {
    //         index = this.scenes.push(name) - 1;
    //     }

    //     return index;
    // }

    public static init() {
        let pipeline = cc.assetManager.pipeline;

        cc.assetManager.fetchPipeline.insert(filterTask, 0);
        pipeline.insert(addSceneNameTask, 0)
        pipeline.insert(filterTask, 0)
        pipeline.insert(transformCompleteTask, 0);
        pipeline.insert(addAssetsRefTask, pipeline.pipes.length);
    }

    public static addAssetSceneBit(asset: cc.Asset, name: string) {
        let resources = this.resources[name];
        if (!resources) {
            resources = this.resources[name] = {};
        }
        let uuid = (asset as any)._uuid;
        if (!uuid) {
            return;
        }
        if (resources[uuid]) {
            return;
        }

        resources[uuid] = true;
        asset.addRef();
        // this.addAssetSceneBitWithUuid((asset as any)._uuid, name);
    }

    // private static addAssetSceneBitWithUuid(uuid: string, name?: string) {
    //     let index = ResourceLoader.getSceneBitIndex(name);
    //     if (index < 0) {
    //         return;
    //     }

    //     let bits = ResourceLoader.resources[uuid] || [];
    //     let length = Math.floor(index / 64);
    //     let offset = index % 64;
    //     let oldValue = bits[length];
    //     if (oldValue && ((oldValue >> offset) & 1) == 1) {
    //         return;
    //     }
    //     for (let i = bits.length; i < length; i++) {
    //         bits[i] = 0;
    //     }
    //     bits[length] |= 1 << offset;
    //     ResourceLoader.resources[uuid] = bits;
    // }

    // private static removeAssetSceneBitWithUuid(uuid: string, name: string) {
    //     let index = ResourceLoader.getSceneBitIndex(name);
    //     if (index < 0) {
    //         return;
    //     }

    //     let length = Math.floor(index / 64);
    //     let offset = index % 64;

    //     let bits = ResourceLoader.resources[uuid]
    //     if (!bits || bits.length <= length) {
    //         console.warn('资源没有被场景引用：', uuid, name)
    //         return;
    //     }

    //     bits[length] &= ~(1 << offset);
    //     while (length >= 0) {
    //         if (bits[length] == 0) {
    //             bits.pop();
    //             length--;
    //         } else {
    //             break;
    //         }
    //     }
    // }

    static loadResArrayWithType(url: ResourceData[], progressCallback?: (completedCount: number, totalCount: number, item: any) => void, completeCallback?: ((error: Error, resource: any[]) => void), name?: string) {
        if (!completeCallback && progressCallback) {
            completeCallback = progressCallback as any;
            progressCallback = null;
        }

        cc.assetManager.loadAny(url, { __requestType__: 'path', bundle: cc.AssetManager.BuiltinBundleName.RESOURCES, sceneName: name }, progressCallback, completeCallback);
    }

    static loadResAndEffectArray(resList: ResourceData[], effectList: EffectGfxData[], completeCallback: Function) {
        let loadedNum: number = 0;
        let loadNum: number = 2;
        function loadCallback() {
            loadedNum++;
            if (loadedNum >= loadNum) {
                if (completeCallback) {
                    completeCallback();
                }
            }
        }
        ResourceLoader.loadResArrayWithType(resList, null, loadCallback);
        G_EffectGfxMgr.loadEffectGfxList(effectList, loadCallback);
    }

    static loadRes(url: string | string[], type: typeof cc.Asset, progressCallback: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: cc.Asset) => void) | null, name?: string) {
        cc.assetManager.loadAny(url, { type: type, __requestType__: 'path', bundle: cc.AssetManager.BuiltinBundleName.RESOURCES, sceneName: name }, progressCallback, completeCallback)
    }

    public static releaseSceneRef(name: string) {
        let resources = ResourceLoader.resources[name];
        for (let uuid in resources) {
            let asset = cc.assetManager.assets.get(uuid)
            asset && asset.decRef(false);
            // this.removeAssetSceneBitWithUuid(uuid, name);
        }

        delete ResourceLoader.resources[name];
        // this.removeScene = true;
    }

    private static releaseUnused() {
        cc.assetManager.releaseUnusedAssets();
    }

    public static onMemoryWarning(res: { level: number }) {
        let level = res && res.level || 99;
        cc.warn("onMemoryWarningReceive:", level);
        ALDStatistics.instance.aldSendEvent("内存警告", { "level": level });
        if (level === 99) {
            // iOS
            ResourceLoader.releaseUnused();
        } else if (this.memoryWarning == 0) {
            //Android
            cc.director.getScheduler().schedule(ResourceLoader.releaseUnused, ResourceLoader, 0, 0, 60, false);
        }
        ResourceLoader.memoryWarning = level;
        let wx = window['wx'] as any;
        wx && wx.triggerGC();
    }
}

if (CC_DEBUG) {
    window["ResourceLoader"] = ResourceLoader
}