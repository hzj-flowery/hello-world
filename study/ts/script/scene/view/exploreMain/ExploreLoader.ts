import { BaseConfig } from "../../../config/BaseConfig";
import { G_ConfigLoader } from "../../../init";
import ResourceLoader, { ResourceData } from "../../../utils/resource/ResourceLoader";

export class ExploreLoader {

    public load(cfg: string[], resArr: ResourceData[], callback: Function, onLoadCfg: Function=null){
        this.loadCfg(cfg, () => {
            onLoadCfg && onLoadCfg();
            this.loadRes(resArr, callback);
        })
    }
    
    private callback: Function;
    public loadRes(resArr: ResourceData[], callback: Function): void {
        if (resArr.length <= 0) {
            callback && callback();
        }
        else {
            this.callback = callback;
            ResourceLoader.loadResArrayWithType(resArr, this.onLoadRes.bind(this));
        }
    }

    private onLoadRes(err, resource): void {
        console.log(err, resource);
        this.callback && this.callback();
    }

    private cfgKeyArr: string[] = [];
    private cfgLoadIndex: number;
    private cfgCallback: Function;
    public loadCfg(resArr: string[], callback: Function): void {
        this.cfgKeyArr = resArr;
        this.cfgLoadIndex = 0;
        this.cfgCallback = callback;
        this.loadCfgByIndex();
    }

    private loadCfgByIndex(): void{
        G_ConfigLoader.loadConfig(this.cfgKeyArr[this.cfgLoadIndex], this.onLoadCfg.bind(this));
    }

    private onLoadCfg(cfg: BaseConfig): void {
        this.cfgLoadIndex++;
        if(this.cfgLoadIndex >= this.cfgKeyArr.length){
            this.cfgCallback && this.cfgCallback();
        }
        else{
            this.loadCfgByIndex();
        }
    }
}