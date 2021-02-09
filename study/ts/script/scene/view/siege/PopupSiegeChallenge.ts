const { ccclass, property } = cc._decorator;

import CommonContinueNode from '../../../ui/component/CommonContinueNode'
import SiegeChallengeBtns from './SiegeChallengeBtns';
import SiegeChallengeInfo from './SiegeChallengeInfo';
import { handler } from '../../../utils/handler';
import PopupBase from '../../../ui/PopupBase';
import { G_SignalManager, G_EffectGfxMgr, G_UserData, G_Prompt, G_ConfigLoader, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar';
import { Lang } from '../../../lang/Lang';
import { ReportParser } from '../../../fight/report/ReportParser';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { Path } from '../../../utils/Path';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class PopupSiegeChallenge extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: CommonContinueNode,
        visible: true
    })
    _continueNode: CommonContinueNode = null;

    @property({
        type: SiegeChallengeBtns,
        visible: true
    })
    _siegeChallengeBtns: SiegeChallengeBtns = null;

    @property({
        type: SiegeChallengeInfo,
        visible: true
    })
    _siegeChallengeInfo: SiegeChallengeInfo = null;

    @property({
        type: CommonStoryAvatar,
        visible: true
    })
    _roleNode: CommonStoryAvatar = null;

    private _siegeData;
    private _siegeUid;
    private _siegeId;
    private _siegeInfo;
    private _bossId;
    private _effect: cc.Node;
    private _isEffectFinish;
    private _signalBattle;

    public init(siegeData, siegeUid, siegeId) {
        this._siegeData = siegeData;
        this._siegeUid = siegeUid;
        this._siegeId = siegeId;
        this._bossId = 0;
        this._effect = null;
        this._isEffectFinish = false;
        this._signalBattle = null;

        this._panelTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this._onCloseClick));
    }

    public onCreate() {
        this._continueNode.node.active = false;
        this._siegeChallengeBtns.node.removeFromParent();
        this._siegeChallengeInfo.node.removeFromParent();
        this._roleNode.node.removeFromParent();
    }

    public onEnter() {
        this.schedule(this._update, 1);
        this._signalBattle = G_SignalManager.add(SignalConst.EVENT_SIEGE_BATTLE, handler(this, this._onEventSiegeBattle));
        this._createAnim();
    }

    public onExit() {
        this.unschedule(this._update);
        this._signalBattle.remove();
        this._signalBattle = null;
    }

    private _createAnim() {
        if (this._effect == null) {
            var effect = G_EffectGfxMgr.createPlayMovingGfx(this._imageBG.node, 'moving_jiaofei',
                this._createActionNode.bind(this), handler(this, this._checkFinish), false);
            this._effect = effect.node;
        }
        else {
            this._createActionNode("name");
            this._createActionNode("button");
            this._createActionNode("role");
        }
    }

    private _createActionNode(effect): cc.Node {
        this._siegeInfo = G_UserData.getSiegeData().getSiegeEnemyData(this._siegeUid, this._siegeId);
        if (effect == 'name') {
            this._siegeChallengeInfo.init();
            this._siegeChallengeInfo.updateUI(this._siegeData, this._siegeInfo);
            return this._siegeChallengeInfo.node;
        } else if (effect == 'button') {
            this._siegeChallengeBtns.init(this._siegeChallengeInfo.isHalfTime(), this._siegeUid, this._siegeData.id, this._siegeChallengeInfo.isLeave());
            this._siegeChallengeBtns.setShareFunc(handler(this, this._onShareClick));
            if (this._siegeInfo.isPublic()) {
                this._siegeChallengeBtns.setShareVisible(false);
            }
            return this._siegeChallengeBtns.node;
        } else if (effect == 'role') {
            this._roleNode.updateUI(this._siegeData.res);
            return this._roleNode.node;
        }
    }

    private _checkFinish(event) {
        if (event == 'finish') {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupSiegeChallenge");
            this._continueNode.node.active = true;
            this._isEffectFinish = true;
        }
    }

    private _onCloseClick() {
        if (this._isEffectFinish) {
            this.close();
        }
    }

    private _update(f) {
        if (this._siegeChallengeInfo && this._isEffectFinish) {
            this._siegeChallengeInfo.setUpdate();
        }
    }

    private _onEventSiegeBattle(eventName, message) {
        var reportData = ReportParser.parse(message.battle_report);
        var bossId = message.boss_id;
        var background = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_BASE).get(bossId).in_res;
        var battleData = BattleDataHelper.parseSiegeBattleData(message, background);
        this._bossId = bossId;
        G_SceneManager.showScene('fight', reportData, battleData);
        if (reportData.getIsWin()) {
            this.close();
            return;
        }
        if (this._siegeUid != G_UserData.getBase().getId()) {
            return;
        }
        var shareInfo = G_UserData.getSiegeData().getMyEnemyById(bossId);
        if (shareInfo && shareInfo.getKiller_id() == 0 && !shareInfo.isPublic()) {
            var isNotNeedConfirm = UserDataHelper.getPopModuleShow('PopupSiegeChallenge');
            if (isNotNeedConfirm) {
            } else {
                var alertInfo = Lang.get('siege_share_text');
                G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popupSystemAlert: PopupSystemAlert) => {
                    popupSystemAlert.setup(Lang.get('siege_share'), alertInfo, handler(this, this._shareBoss));
                    popupSystemAlert.setCheckBoxCallback(handler(this, this._onCheckBoxClick));
                    popupSystemAlert.openWithAction();
                })
            }
        }
    }
    _onCheckBoxClick(isCheck) {
        UserDataHelper.setPopModuleShow('PopupSiegeChallenge', isCheck);
    }

    private _onShareClick() {
        var siegeInfo = G_UserData.getSiegeData().getSiegeEnemyData(this._siegeUid, this._siegeId);
        if (!siegeInfo) {
            G_Prompt.showTip(Lang.get('siege_wrong_share'));
            this.close();
            return;
        }
        if (!siegeInfo.isPublic()) {
            G_UserData.getSiegeData().c2sRebArmyPublic(this._siegeId);
        } else {
            G_Prompt.showTip(Lang.get('siege_already_share'));
        }
    }

    private _shareBoss() {
        if (!G_UserData.getGuild().isInGuild()) {
            G_Prompt.showTip(Lang.get('siege_no_guild'));
            return;
        }
        G_UserData.getSiegeData().c2sRebArmyPublic(this._bossId);
    }
}