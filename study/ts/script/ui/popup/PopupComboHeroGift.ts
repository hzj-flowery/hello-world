import PopupBase from "../PopupBase";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import { Lang } from "../../lang/Lang";
import { handler } from "../../utils/handler";
import { Colors, G_SignalManager, G_EffectGfxMgr } from "../../init";
import UIHelper from "../../utils/UIHelper";
import { SignalConst } from "../../const/SignalConst";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupComboHeroGift extends PopupBase {

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _commonBtn: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonButtonLevel0HighlightPrefab: cc.Prefab = null;

    private _callback;

    init(callback) {
        this._callback = callback;
    }

    onShowFinish() {
    }

    onCreate() {
        this._commonBtn.setString(Lang.get('common_btn_know'));
        this._commonBtn.addClickEventListenerEx(handler(this, this._onGoLook));
    }

    _onGoLook() {
        if (this._callback) {
            this._callback();
        }
        this.close();
    }

    _onInit() {
    }

    onEnter() {
        this.play();
    }

    onExit() {
    }

    _createActionNode(effect): cc.Node {
        if (effect == 'button') {
            var btn = cc.instantiate(this._commonButtonLevel0HighlightPrefab).getComponent(CommonButtonLevel0Highlight);
            btn.setString(Lang.get('common_btn_go_look'));
            btn.addClickEventListenerEx(handler(this, this._onGoLook));
            btn.setButtonName('_commonBtn');
            return btn.node;
        }
    }

    play() {
        function effectFunction(effect): cc.Node {
            if (effect == 'hejijihuo_gongxi') {
                var params1 = {
                    name: 'label1',
                    text: Lang.get('common_gift_hejijiang1'),
                    fontSize: 22,
                    color: Colors.SYSTEM_TIP,
                    outlineColor: Colors.SYSTEM_TIP_OUTLINE
                };
                var params2 = {
                    name: 'label2',
                    text: Lang.get('common_gift_hejijiang2'),
                    fontSize: 22,
                    color: Colors.getColor(4),
                    outlineColor: Colors.getColorOutline(4)
                };
                var label = UIHelper.createTwoLabel(params1, params2);
                label.children[0].x = -label.width / 2;
                label.children[1].x = -label.width / 2 + label.children[0].width;
                return label;
            } else {
                return this._createActionNode(effect);
            }
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this._isAction = false;
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupComboHeroGift");
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.getResourceNode(), 'moving_hejilibao', effectFunction.bind(this), eventFunction.bind(this), false);
        var size = this.getResourceNode().getContentSize();
        effect.node.setPosition(0, 0);
    }
}