import { G_SpineManager } from "../init";
import { HeroSpineNode } from "../ui/node/HeroSpineNode";
import { SpineNode } from "../ui/node/SpineNode";
import { StorySpineNode } from "../ui/node/StorySpineNode";
import { Path } from "../utils/Path";
import ResourceLoader from "../utils/resource/ResourceLoader";

export default class EffectGfxSpine extends cc.Component {

    public effectKey: string;
    public spineName: string;
    public spinePath: string;

    private spineAnim: string;
    private isBigSpine: boolean;
    private spineLoop: boolean;

    private spineNode: SpineNode | StorySpineNode;
    private isHeroSpine: boolean;

    private sceneName: string;

    public setScnenName(name: string) {
        this.sceneName = name;
    }

    public setSpine(key: string) {
        this.isHeroSpine = false;
        this.effectKey = key;

        // spine_aaa_bbb_big_1_copy
        let strArray = key.split('_');
        this.isBigSpine = false;
        this.spineLoop = true;

        if (strArray[strArray.length - 1].indexOf("copy") == 0) {
            strArray.splice(strArray.length - 1, 1);
        }

        if (strArray[strArray.length - 1] == "1" || strArray[strArray.length - 1] == "2") {
            this.spineLoop = !(strArray[strArray.length - 1] == "1");
            strArray.splice(strArray.length - 1, 1);
        }

        for (let i = 0; i < strArray.length; i++) {
            let str: string = strArray[i];
            if (str == "big") {
                this.isBigSpine = true;
                strArray.splice(i, 1);
                break;
            }
        }

        this.spineAnim = strArray[strArray.length - 1];
        strArray.splice(strArray.length - 1, 1);

        strArray.splice(0, 1); //spine_
        this.spineName = "";
        for (let i = 0; i < strArray.length; i++) {
            this.spineName += strArray[i];
            if (i < strArray.length - 1) {
                this.spineName += "_";
            }
        }

        this.spinePath = Path.getEffectSpine(this.spineName);
        if (this.isBigSpine) {
            this.spinePath = Path.getStorySpine(this.spineName);
            this.spineNode = StorySpineNode.create(1, cc.size(500, 640))
        }
        else {
            this.spineNode = SpineNode.create(1, cc.size(500, 640));
        }
        this.node.addChild(this.spineNode.node);
        this.node.name = key;
    }

    public load(completeCallback?: Function) {
        if (this.isBigSpine) {
            ResourceLoader.loadRes(this.spinePath, cc.SpriteFrame, null, (err, res: cc.SpriteFrame) => {
                this._onLoadComplete(res, completeCallback);
            }, this.sceneName);
            return;
        }
        G_SpineManager.loadSpine(this.spinePath, (sk) => {
            if (sk != null) {
                this._onLoadComplete(sk, completeCallback);
                return;
            }
            if (sk == null && this.isHeroSpine) {
                console.error("[EffectGfxSpine] load:not have effect spine:", this.spineName);
                return;
            }
            if (sk == null && !this.isHeroSpine) {
                this.isHeroSpine = true;
                this.spinePath = Path.getSpine(this.spineName);
                this.spineNode.node.destroy();
                this.spineNode = HeroSpineNode.create()
                this.node.addChild(this.spineNode.node);
                this.load(completeCallback);
                return;
            }
        }, this.sceneName)
    }

    public play() {
        this.spineNode.setAnimation(this.spineAnim, this.spineLoop);
    }

    private _onLoadComplete(sk, completeCallback?: Function) {
        if (this.node == null || !this.node.isValid) {
            return;
        }
        this.spineNode.setData(sk);
        if (completeCallback != null) completeCallback();
    }
}