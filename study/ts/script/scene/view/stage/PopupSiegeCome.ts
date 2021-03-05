const { ccclass, property } = cc._decorator;

import CommonContinueNode from '../../../ui/component/CommonContinueNode'
import { G_ConfigLoader, G_UserData, G_SignalManager, G_AudioManager, G_EffectGfxMgr, G_SceneManager, G_Prompt, G_TutorialManager } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import SiegeNameNode from '../siege/SiegeNameNode';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar';
import { Lang } from '../../../lang/Lang';
import { AudioConst } from '../../../const/AudioConst';
import PopupBase from '../../../ui/PopupBase';

@ccclass
export default class PopupSiegeCome extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _imageBG: cc.Node = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _continueNode: CommonContinueNode = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonShare: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonFight: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonStoryAvatar,
        visible: true
    })
    _roleNode: CommonStoryAvatar = null;

    @property({
        type: SiegeNameNode,
        visible: true
    })
    _siegeNameNode: SiegeNameNode = null;

    private _data;
    private _level;
    private _signalShare;
    private _isEffectFinish;

    init(data) {
        var id = data.id;
        this._data = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_BASE).get(id);
        this._level = data.level;
        this._signalShare = null;
        this._isEffectFinish = false;

        this._panelTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this._onCloseClick));

        this._buttonShare.addClickEventListenerEx(handler(this, this._onShareClick));
        this._buttonShare.setString(Lang.get('siege_share'));
        this._buttonShare.node.removeFromParent();

        this._buttonFight.addClickEventListenerEx(handler(this, this._onChallengeClick));
        this._buttonFight.setString(Lang.get('siege_go_challenge'));
        this._buttonFight.node.name = ('buttonFight');
        this._buttonFight.node.removeFromParent();

        this._roleNode.updateUI(this._data.res);
        this._roleNode.node.removeFromParent();

        this._siegeNameNode.updateUI(this._data, this._level);
        this._siegeNameNode.node.removeFromParent();
    }

    public onCreate() {
        this._continueNode.node.active = (false);
        G_UserData.getSiegeData().refreshRebelArmy();
    }

    public onEnter() {
        this._signalShare = G_SignalManager.add(SignalConst.EVENT_SIEGE_SHARE, handler(this, this._onEventSiegeShare));
        this._createEffect();
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_START, "PopupSiegeCome");
    }

    public onExit() {
        this._signalShare.remove();
        this._signalShare = null;
    }

    private _createActionNode(effect): cc.Node {
        if (effect == 'name') {
            return this._siegeNameNode.node;
        } else if (effect == 'button_1') {
            return this._buttonShare.node;
        } else if (effect == 'button_2') {
            return this._buttonFight.node;
        } else if (effect == 'role') {
            this._roleNode.updateUI(this._data.res);
            return this._roleNode.node;
        }
    }

    private _createEffect() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_NANMAN);
        G_EffectGfxMgr.createPlayMovingGfx(this._imageBG, 'moving_nanman',
            handler(this, this._createActionNode), handler(this, this._checkFinish), false);
    }

    private _checkFinish(event) {
        if (event == 'finish') {
            if (G_TutorialManager.isDoingStep(80)) {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupSiegeCome");
            }
            this._isEffectFinish = true;
            this._continueNode.node.active = (true);
        }
    }

    public _onChallengeClick(sender?) {
        G_SceneManager.showScene('siege');
        this.close();
    }

    private _onShareClick(sender) {
        G_UserData.getSiegeData().c2sRebArmyPublic(this._data.id);
    }

    private _onEventSiegeShare() {
        this.closeWithAction();
        G_Prompt.showTip(Lang.get('siege_share_success'));
    }

    private _onCloseClick() {
        if (this._isEffectFinish) {
            this.close();
        }
    }
}