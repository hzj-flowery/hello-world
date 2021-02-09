import { HeroSpineNode } from "../../ui/node/HeroSpineNode";
import { SpineNode } from "../../ui/node/SpineNode";
import { FightConfig } from "../FightConfig";
import { FightResourceManager } from "../FightResourceManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectActor extends cc.Component {

    protected root: cc.Node;
    protected efffectSpineNode: HeroSpineNode;

    public init(name) {

        this.root = new cc.Node("_root")
        this.node.addChild(this.root);

        this.efffectSpineNode = HeroSpineNode.create();
        this.efffectSpineNode.node.name = name;
        let spineData = FightResourceManager.instance.getEffectSpineData(name);
        if (spineData == null) {
            console.error("[EffectActor]", name);
        }
        this.efffectSpineNode.setData(spineData);
        this.root.addChild(this.efffectSpineNode.node);
    }

    test() {
        var action1 = cc.fadeIn(0.5);
        this.node.runAction(action1);
    }

    setAction(name, loop?) {
        this.setAnimation(this.efffectSpineNode, name, loop, true);
    }

    setTowards(towards) {
        this.root.scaleX = (towards == FightConfig.campLeft && 1 || -1);
    }

    death() {
        var action1 = cc.fadeOut(0.3);
        var action2 = cc.destroySelf();
        var action = cc.sequence(action1, action2);
        this.node.runAction(action);
    }

    getAnimation() {
        return this.efffectSpineNode;
    }

    setOnceAction(name) {
        this.setAnimation(this.efffectSpineNode, name, false, true);
        this.efffectSpineNode.signalComplet.addOnce(()=> {
            this.death();
        });
    }

    private setAnimation(spineNode: SpineNode, name: string, loop: boolean, reset: boolean) {
        if ((spineNode.getAnimationName() == 'idle' || spineNode.getAnimationName() == 'dizzy') && name == spineNode.getAnimationName()) {
            return;
        }
        var loopAction = loop;
        if (name == 'idle' || name == 'dizzy') {
            loopAction = true;
        }
        return spineNode.setAnimation(name, loopAction, reset);
    }
}