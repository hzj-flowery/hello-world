import { AudioConst } from "../../const/AudioConst";
import { SignalConst } from "../../const/SignalConst";
import { G_AudioManager, G_EffectGfxMgr, G_SceneManager, G_SignalManager } from "../../init";
import { handler } from "../../utils/handler";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Util } from "../../utils/Util";
import { ComponentIconHelper } from "../component/ComponentIconHelper";

export default class PromptRewards {

    private _queue: any[];
    private _isStart;
    private _curViewQueue: any[];
    private _signalChangeScene;

    constructor() {
        this._queue = [];
        this._isStart = false;
        this._curViewQueue = [];
    }

    show(awards) {
        // assert(awards || type(awards) == 'table', 'Invalid awards ' + tostring(awards));
        if (awards.length == 0) {
            // print('awards length is 0');
            return;
        }
        for (var _ in awards) {
            var v = awards[_];
            this._queue.push(v);
        }
        if (!this._isStart) {
            this._start();
        }
    }

    _start() {
        if (!this._signalChangeScene) {
            this._signalChangeScene = G_SignalManager.add(SignalConst.EVENT_CHANGE_SCENE, handler(this, this._onEventChangeScene));
        }
        this._isStart = true;
        this._next();
    }

    _clear() {
        if (this._signalChangeScene) {
            this._signalChangeScene.remove();
            this._signalChangeScene = null;
        }
        for (var i: number = this._curViewQueue.length - 1; i >= 0; i--) {
            var curViewInfo = this._curViewQueue[i];
            curViewInfo.view.runAction(cc.destroySelf());
        }
        this._curViewQueue.splice(0, this._curViewQueue.length);
        this._queue.splice(0, this._queue.length);
        this._isStart = false;
    }

    _onEventChangeScene() {
        this._clear();
    }

    _createRewardAndRun(award) {
        // assert(type(award) == 'table' || award.type || award.value || award.size, 'Invalid award ' + tostring(award));
        cc.resources.load('prefab/common/PromptRewardNode', () => {
            var view: cc.Node = Util.getNode('prefab/common/PromptRewardNode');
            var item = view.getChildByName('Item') as cc.Node;
            var itemName = view.getChildByName('ItemName').getComponent(cc.Label);
            var itemNum = view.getChildByName('ItemNum').getComponent(cc.Label);
            var iconNode: cc.Node = ComponentIconHelper.createIcon(award.type, award.value, award.size) as cc.Node;
            var className = TypeConvertHelper.getTypeClass(award.type);
            var component: any = iconNode.getComponent(className);
            iconNode.setScale(0.8);
            item.addChild(iconNode);
            var itemParams = component.getItemParams();
            // assert(type(itemParams) == 'table', 'Invalid itemParams ' + tostring(itemParams));
            itemName.string = (itemParams.name);
            itemName.node.color = (itemParams.icon_color);
            var outLine: cc.LabelOutline = itemName.node.getComponent(cc.LabelOutline);
            outLine.color = itemParams.icon_color_outline;
            outLine.width = 2;
            Util.updatelabelRenderData(itemName);
            itemNum.node.x = (itemName.node.x + itemName.node.width + 20);
            itemNum.string = 'x' + award.size;
            view.opacity = 0;
            var scene = G_SceneManager.getRunningScene();
            scene.addChildToPopup(view);
            // view.setPosition(G_ResolutionManager.getDesignCCPoint());
            G_AudioManager.playSoundWithId(AudioConst.SOUND_TIP_REARD);
            var effect = G_EffectGfxMgr.applySingleGfx(view, 'smoving_lianxuhuode', (event, frameIndex, effectNode) => {
                if (event == 'next') {
                    this._next();
                } else if (event == 'finish') {
                    this._curViewQueue.pop();
                    view.runAction(cc.destroySelf());
                }
            }, null, null);
            this._curViewQueue.push({
                view: view,
                effect: effect
            });
        });

    }

    _next() {
        var award = this._queue.pop();
        if (!award) {
            this._isStart = false;
            return;
        }
        this._createRewardAndRun(award);
    }

}