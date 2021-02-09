import PopupBase from "../PopupBase";
import { G_ConfigLoader, Colors, G_EffectGfxMgr, G_AudioManager, G_SignalManager } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import { Lang } from "../../lang/Lang";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import { handler } from "../../utils/handler";
import { AudioConst } from "../../const/AudioConst";
import { SignalConst } from "../../const/SignalConst";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupNewFunction extends PopupBase {
    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonButtonLevel0HighlightPrefab: cc.Prefab = null;
    private _funcId;
    private _funcInfo;
    private _callback;
    private _callOnShow;
    private _nodeOpenFuncDesc;
    private _textFuncDesc;
    private _commonBtn;
    private _textFuncName;
    private _imgFuncIcon;
    init(funcId, callback?, onShowCall?) {
        this._funcId = funcId;
        var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(funcId);
        this._funcInfo = funcLevelInfo;
        this._callback = callback;
        this._callOnShow = onShowCall;
        this._nodeOpenFuncDesc = null;
        this._textFuncDesc = null;
        this._commonBtn = null;
        this._textFuncName = null;
        this._imgFuncIcon = null;
    }

    onShowFinish() {
        if (this._callOnShow) {
            this._callOnShow();
        }
    }

    _updateFuncInfo() {
    }

    onCreate() {
        this._updateFuncInfo();
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
        function effectFunction(effect): cc.Node {
            if (effect == 'icon_zi') {
                var params1 = {
                    name: 'label1',
                    text: this._funcInfo.name,
                    fontSize: 26,
                    color: Colors.BUTTON_TWO_NOTE,
                    outlineColor: Colors.BUTTON_TWO_NOTE_OUTLINE
                };
                var label = UIHelper.createLabel(params1);
                return label;
            } else if (effect == 'icon_tubiao') {
                var sprite = UIHelper.newSprite(Path.getCommonIcon('main', this._funcInfo.icon));
                return sprite.node;
            }
        }
        function eventFunction(event) {
        }

        if (effect == 'xingongneng_shuoming') {
            var paramList = {
                1: {
                    name: 'label1',
                    text: Lang.get('common_txt_open_new_func1'),
                    fontSize: 22,
                    color: Colors.SYSTEM_TIP,
                    outlineColor: Colors.SYSTEM_TIP_OUTLINE
                },
                2: {
                    name: 'label2',
                    text: Lang.get('common_txt_open_new_func2', { fuc_name: this._funcInfo.name }),
                    fontSize: 22,
                    color: Colors.CLASS_GREEN,
                    outlineColor: Colors.CLASS_GREEN_OUTLINE
                },
                3: {
                    name: 'label3',
                    text: Lang.get('common_txt_open_new_func3'),
                    fontSize: 22,
                    color: Colors.SYSTEM_TIP,
                    outlineColor: Colors.SYSTEM_TIP_OUTLINE
                }
            };
            var labelNode = UIHelper.createLabels(paramList);
            return labelNode;
        } else if (effect == 'moving_xingongneng_tubiao') {
            var node = new cc.Node();
            let effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_xingongneng_tubiao', effectFunction.bind(this), eventFunction.bind(this), false);
            return node;
        } else if (effect == 'button') {
            var btn = cc.instantiate(this._commonButtonLevel0HighlightPrefab).getComponent(CommonButtonLevel0Highlight);
            btn.setString(Lang.get('common_btn_go_look'));
            btn.addClickEventListenerEx(handler(this, this._onGoLook));
            btn.setButtonName('_commonBtn');
            return btn.node;
        }
    }

    play() {
        function effectFunction(effect) {
            return this._createActionNode(effect);
        }
        function eventFunction(event) {
            if (event == 'finish') {
                this._isAction = false;
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupNewFunction");
            }
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_NEW_FUNC_OPEN);
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.getResourceNode(), 'moving_xingongneng', effectFunction.bind(this), eventFunction.bind(this), false);
        var size = this.getResourceNode().getContentSize();
        effect.node.setPosition(0, 0);
    }
}