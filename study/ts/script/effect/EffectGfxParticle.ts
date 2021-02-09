import { Path } from "../utils/Path";
import ResourceLoader from "../utils/resource/ResourceLoader";

export default class EffectGfxParticle extends cc.Component {

    public effectKey: string;
    public particlePath: string;

    private particleSystem: cc.ParticleSystem;

    private sceneName: string;

    public setSceneName(name: string) {
        this.sceneName = name;
    }

    public setParticle(key: string) {
        this.effectKey = key;
        let strArray = key.split('_');
        let path = '';
        let lastCount: string = strArray[strArray.length - 1];
        if (lastCount.indexOf('copy') > -1) {
            strArray.splice(strArray.length - 1, 1);//如果结尾有copy字样，则说明是需要重复使用的特效，去掉copy拿到前面的就是特效名字
        }
        strArray.splice(0, 1);

        for (let i = 0; i < strArray.length; i++) {
            let v = strArray[i];
            path = path + v;
            if (i < strArray.length - 1) {
                path = path + '_';
            }
        }

        this.node.name = key;
        this.particleSystem = this.node.addComponent(cc.ParticleSystem);
        this.particleSystem.positionType = 1;
        this.particleSystem.stopSystem();
        this.particlePath = Path.getParticle(path);
    }

    public load(completeCallback?: Function) {
        ResourceLoader.loadRes(this.particlePath, cc.ParticleAsset, null, (err, res) => {
            if (this.node == null || !this.node.isValid) {
                return;
            }
            if (res) {
                this.particleSystem.file = res;
            }
            completeCallback();
        }, this.sceneName)
    }

    public play() {
        this.particleSystem.resetSystem();
    }
}