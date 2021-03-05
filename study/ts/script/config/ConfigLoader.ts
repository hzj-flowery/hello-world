const { ccclass, property } = cc._decorator;

// import { G_pako, G_NativeAgent } from "../init";
import { BaseConfig } from "./BaseConfig";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { GameAgent } from "../agent/GameAgent";
import { G_GameAgent } from "../init";


@ccclass
export default class ConfigLoader extends cc.Component {
    private name2CfgDatas: { [key: string]: BaseConfig } = {};

    public init(callback: Function) {
        let AllConfigName = 'config/all';
        cc.resources.load(AllConfigName, cc.BufferAsset, (err, resource: cc.BufferAsset) => {

            let buffer: ArrayBuffer = resource._buffer;
            pako.inflate(AllConfigName, buffer, true, (err, str) => {
                if (err) {
                    return;
                }
                let json = JSON.parse(str);
                let keys = Object.keys(json);
                for (let i = 0; i < keys.length; i++) {
                    let name = keys[i];
                    let cfg = BaseConfig.create(name);
                    cfg.asset = json[name];
                    this.name2CfgDatas[name] = cfg;
                }

                cc.assetManager.releaseAsset(resource);
                callback();
            });
        })
    }

    private configName(name: string): string {
        return 'config/' + name;
    }

    public loadConfig(name: string, complete: (cfg: BaseConfig) => void) {
        this.scheduleOnce(() => {
            complete(this.name2CfgDatas[name]);
        }, 1);
    }

    public loadConifgArray(names: string[], complete?: Function) {
        this.scheduleOnce(() => {
            let cfgs = [];
            for (let i = 0; i < names.length; i++) {
                cfgs.push(this.name2CfgDatas[names[i]])
            }

            complete(cfgs);
        })
    }

    public releaseUnusedData() {
        // for (let key in this.name2CfgDatas) {
        //     let data = this.name2CfgDatas[key];
        //     if (data.getReference() <= 0) {
        //         data.destroy();
        //         delete this.name2CfgDatas[key];
        //     }
        // }
    }

    public getConfig(name: string): BaseConfig {
        return this.name2CfgDatas[name];
    }

    public onDestroy() {
        this.releaseUnusedData();
        this.name2CfgDatas = null;

    }
}