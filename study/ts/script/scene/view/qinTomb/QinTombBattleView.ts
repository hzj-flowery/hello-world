const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { MessageErrorConst } from '../../../const/MessageErrorConst';
import { QinTombConst } from '../../../const/QinTombConst';
import { ShopConst } from '../../../const/ShopConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonGroupsActiveTimeNode from '../../../ui/component/CommonGroupsActiveTimeNode';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import BigImagesNode from '../../../utils/BigImagesNode';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { DropHelper } from '../../../utils/DropHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import { GroupsViewHelper } from '../groups/GroupsViewHelper';
import PopupQinTombHelp from './PopupQinTombHelp';
import QinTombBattleMapNode from './QinTombBattleMapNode';
import QinTombBattleResultAnimation from './QinTombBattleResultAnimation';
import QinTombMiniMap from './QinTombMiniMap';
import QinTombRebornCDNode from './QinTombRebornCDNode';

@ccclass
export default class QinTombBattleView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _mapNode: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _miniNode: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeRebornCDParent: cc.Node = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnReport: CommonMainMenu = null;

    @property({ type: CommonMainMenu, visible: true })
    _btnMail: CommonMainMenu = null;

    @property({ type: CommonMiniChat, visible: true })
    _commonChat: CommonMiniChat = null;

    @property({ type: CommonHelp, visible: true })
    _commonHelp: CommonHelp = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: CommonGroupsActiveTimeNode, visible: true })
    _commonNodeTime: CommonGroupsActiveTimeNode = null;

    @property({ type: cc.Node, visible: true })
    _autoMovingNode: cc.Node = null;

    @property({ type: QinTombBattleMapNode, visible: true })
    _battleMapNode: QinTombBattleMapNode = null;

    @property({ type: QinTombMiniMap, visible: true })
    _miniMapNode: QinTombMiniMap = null;

    @property({ type: QinTombRebornCDNode, visible: true })
    _rebornCDNode: QinTombRebornCDNode = null;

    private _popupBattleResult: QinTombBattleResultAnimation;
    private _popSceneTimes = 1;

    private _signalGraveBattleNotice;
    private _signalGraveLeaveBattle;
    private _signalGraveLeaveScene;
    private _signalGraveTimeFinish;
    private _signalUserDataUpdate;
    private _signalRedPointUpdate;
    private _signalGraveReward;

    public preloadRes(callBack: Function, params?) {
        cc.resources.load(Path.getStageBG('qin_bk_stage'), cc.JsonAsset, (err, res: cc.JsonAsset) => {
            if (res == null) {
                callBack();
                return;
            }
            let imgPaths: string[] = BigImagesNode.getImages(Path.getStageBG('qin_bk_stage'));
            this.preloadResList = [];
            for (let i = 0; i < imgPaths.length; i++) {
                this.preloadResList.push({ path: imgPaths[i], type: cc.SpriteFrame });
            }
            super.preloadRes(callBack, params);
        })
    }

    public onCreate() {
        this.setSceneSize();
        this._btnReport.updateUI(FunctionConst.FUNC_ARENA_REPORT);
        this._topbarBase.setImageTitle('txt_sys_qintombo');
        this._commonHelp.addClickEventListenerEx(handler(this, this._onClickHelp));
        this._topbarBase.setCallBackOnBack(handler(this, this._onBtnOut));
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_QINTOMB);
        G_EffectGfxMgr.createPlayGfx(this._autoMovingNode, 'effect_xianqinhuangling_zidongxunluzhong', null, true);
        this._autoMovingNode.active = (false);
        this._btnMail.updateUI(FunctionConst.FUNC_MAIL_RED);
        this._btnMail.node.active = (false);
        this._commonChat.setDanmuVisible(false);
        this._updateMailShow();
    }

    private _onBtnOut() {
        GroupsViewHelper.quitGroupTip();
    }

    public onBtnMail() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MAIL_RED);
    }

    public onBtnReport() {
        G_SceneManager.openPopup(Path.getPrefab("PopupQinTombReport", "qinTomb"));
    }

    private _onClickHelp(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupQinTombHelp", "qinTomb"), (dlg: PopupQinTombHelp) => {
            dlg.updateByFunctionId(FunctionConst.FUNC_MAUSOLEUM);
            dlg.open();
        });
    }

    public onEnter() {
        this._popSceneTimes = 1;
        this._signalGraveBattleNotice = G_SignalManager.add(SignalConst.EVENT_GRAVE_BATTLE_NOTICE, handler(this, this._onEventGraveBattleNotice));
        this._signalGraveLeaveBattle = G_SignalManager.add(SignalConst.EVENT_GRAVE_LEAVE_BATTLE, handler(this, this._onEventGraveLeaveBattle));
        this._signalGraveLeaveScene = G_SignalManager.add(SignalConst.EVENT_GROUP_OUTSIDE_STATE, handler(this, this._onEventGraveLeaveScene));
        this._signalGraveTimeFinish = G_SignalManager.add(SignalConst.EVENT_GRAVE_TIME_FINISH, handler(this, this._onEventUserDataUpdate));
        this._signalUserDataUpdate = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onEventUserDataUpdate));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalGraveReward = G_SignalManager.add(SignalConst.EVENT_GRAVE_GETREWARD, handler(this, this._onEventGraveReward));
        this._commonNodeTime.updateQinTomb();

        G_AudioManager.playMusicWithId(AudioConst.MUSIC_BGM_HUANGLIN);
        this._rebornCDNode.updateVisible();
        this._refreshRedPoint();
    }

    private _onEventUserDataUpdate(_, param) {
        this._commonNodeTime.updateQinTomb();
    }

    private _onEventRedPointUpdate(id, funcId, param) {
        this._updateMailShow();
        this._refreshRedPoint();
    }

    private _onEventGraveReward(id, message) {
        var awards = message.awards || [];
        if (awards.length > 0) {
            var merageAwards = DropHelper.merageAwardList(awards);
            G_Prompt.showAwards(merageAwards);
        }
    }

    private _updateMailShow() {
        var visible = RedPointHelper.isModuleReach(FunctionConst.FUNC_MAIL);
        this._btnMail.node.active = (visible);
        if (visible && visible == true) {
            this._btnMail.showRedPoint(true);
            this._btnMail.playFuncGfx();
        }
    }

    public onExit() {
        this._signalGraveBattleNotice.remove();
        this._signalGraveBattleNotice = null;
        this._signalGraveLeaveBattle.remove();
        this._signalGraveLeaveBattle = null;
        this._signalGraveLeaveScene.remove();
        this._signalGraveLeaveScene = null;
        this._signalUserDataUpdate.remove();
        this._signalUserDataUpdate = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalGraveReward.remove();
        this._signalGraveReward = null;
        this._signalGraveTimeFinish.remove();
        this._signalGraveTimeFinish = null;
    }

    update(dt) {
        var scaleFator = QinTombConst.CAMERA_SCALE_MIN;
        var [cameraPos, cameraSize] = this._battleMapNode.getCameraPos();
        this._miniMapNode.updateCamera(cameraPos.x * scaleFator, cameraPos.y * scaleFator);
        var monsterKey = this._battleMapNode.getMonsterInTheCamera(cameraPos, cameraSize);
        var selfPos = this._battleMapNode.getSelfTeamPos();
        if (selfPos) {
            this._miniMapNode.updateSelf(selfPos.x, selfPos.y, monsterKey);
        }
        this._battleMapNode.updateUI(monsterKey);
        if (this._rebornCDNode.node.active == true) {
            let finishCall = function () {
                this.updateToRebornPos();
            }.bind(this);
            this._rebornCDNode.refreshCdTimeView(finishCall);
        }
        this.updateAuotMovingEffect();
    }

    public updateAuotMovingEffect() {
        var selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam == null) {
            return;
        }
        this._autoMovingNode.active = (false);
        if (selfTeam.getCurrState() == QinTombConst.TEAM_STATE_MOVING) {
            this._autoMovingNode.active = (true);
        }
    }

    public updateToRebornPos() {
        this._battleMapNode.gotoMyPosition(true);
    }

    private _onEventGraveLeaveBattle(event, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
        }
    }

    private _onEventGraveLeaveScene(event, reason) {
        if (this._popSceneTimes == 1) {
            var reasonIndex = reason || 0;
            var langStr = Lang.get('qin_tomb_leave_out' + reasonIndex);
            let onClick = function () {
                G_SceneManager.showScene('main');
            }.bind(this);
            UIPopupHelper.popupOkDialog(null, langStr, onClick, Lang.get('recovery_btn_ok'));
        }
        this._popSceneTimes = this._popSceneTimes + 1;
    }

    private _refreshRedPoint() {
        var value = G_UserData.getRedPoint().isQinTombReport();
        this._btnReport.showRedPoint(value);
    }

    private _onEventGraveBattleNotice(event, message) {
        var report = message.report;
        if (report) {
            var is_win = report.is_win;
            if (this._popupBattleResult != null) {
                if (is_win == false) {
                    this._rebornCDNode.startCD();
                }
                return;
            }
            let finishCallBack = function () {
                this._popupBattleResult = null;
                if (is_win == false) {
                    this._rebornCDNode.startCD();
                }
            }.bind(this);
            G_SceneManager.openPopup(Path.getPrefab("QinTombBattleResultAnimation", "qinTomb"), (popupBattleResult: QinTombBattleResultAnimation) => {
                this._popupBattleResult = popupBattleResult;
                this._popupBattleResult.updateUI(report);
                this._popupBattleResult.showResult(finishCallBack);
            })

        } else {
        }
    }
}