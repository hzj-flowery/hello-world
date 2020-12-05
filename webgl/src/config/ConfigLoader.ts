
import { BaseConfig } from "./BaseConfig";
import { ConfigNameConst } from "../const/ConfigNameConst";
export default class ConfigLoader {
    private name2CfgDatas: { [key: string]: BaseConfig } = {};

    public init(callback: Function) {
        let AllConfigName = 'config/all';
        // cc.resources.load(AllConfigName, cc.BufferAsset, (err, resource: cc.BufferAsset) => {

        //     let buffer: ArrayBuffer = resource._buffer;
        //     pako.inflate(AllConfigName, buffer, true, (err, str) => {
        //         if (err) {
        //             return;
        //         }
        //         let json = JSON.parse(str);
        //         let keys = Object.keys(json);
        //         for (let i = 0; i < keys.length; i++) {
        //             let name = keys[i];
        //             let cfg = BaseConfig.create(name);
        //             cfg.asset = json[name];
        //             this.name2CfgDatas[name] = cfg;
        //         }

        //         cc.assetManager.releaseAsset(resource);
        //         callback();
        //     });
        // })
    }

    private configName(name: string): string {
        return 'config/' + name;
    }

    public loadConfig(name: string, complete: (cfg: BaseConfig) => void) {
        // this.scheduleOnce(() => {
        //     complete(this.name2CfgDatas[name]);
        // }, 1);
    }

    public loadConifgArray(names: string[], complete?: Function) {
        // this.scheduleOnce(() => {
        //     let cfgs = [];
        //     for (let i = 0; i < names.length; i++) {
        //         cfgs.push(this.name2CfgDatas[names[i]])
        //     }

        //     complete(cfgs);
        // })
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
        // 4 服测一下商店数据
        if (name == ConfigNameConst.STORY_BOX || name == ConfigNameConst.STORY_PERIOD_BOX || name == ConfigNameConst.DAILY_TASK) {
          //  if (5001000004 == G_GameAgent.getLoginServer().getServer() || 5001000005 == G_GameAgent.getLoginServer().getServer()) {
                name += '_b';
          //  }
        }
        return this.name2CfgDatas[name];
    }

    public onDestroy() {
        this.releaseUnusedData();
        this.name2CfgDatas = null;

    }
}

export var G_ConfigLoader = new ConfigLoader();