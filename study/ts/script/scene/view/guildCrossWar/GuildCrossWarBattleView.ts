const { ccclass, property } = cc._decorator;

import { FunctionConst } from '../../../const/FunctionConst';
import { GuildCrossWarConst } from '../../../const/GuildCrossWarConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { Colors, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonCountdown from '../../../ui/component/CommonCountdown';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import GuildCrossWarBattleMapNode from './GuildCrossWarBattleMapNode';
import { GuildCrossWarHelper } from './GuildCrossWarHelper';
import GuildCrossWarMiniMap from './GuildCrossWarMiniMap';
import GuildCrossWarRebornCDNode from './GuildCrossWarRebornCDNode';
import PopupGuildCrossWarHelp from './PopupGuildCrossWarHelp';


@ccclass
export default class GuildCrossWarBattleView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _mapNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeReadyCountdown: cc.Node = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnReport: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnMail: CommonMainMenu = null;

    @property({
        type: CommonCountdown,
        visible: true
    })
    _commonCountDown: CommonCountdown = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRebornCDParent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _autoMovingNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _miniNode: cc.Node = null;


    _battleMapNode: any;
    _miniMapNode: any;
    _rebornCDNode: any;
    _signalFightSelfDie: any;
    _delayUpdate: any;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            var data: Array<ResourceData> = [
                {path: "prefab/guildCrossWar/GuildCrossWarMiniMap", type: cc.Prefab},
                {path: "prefab/guildCrossWar/PopupGuildCrossWarSmallMap", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildCrossWarAttackCell", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildCrossStrongHold", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildCrossWarBattleMapNode", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildCrossWarRebornCDNode", type: cc.Prefab},
                {path: "prefab/guildCrossWar/PopupHelpInfoCell", type: cc.Prefab},
                {path: "prefab/guildCrossWar/PopupHelpInfoTitleCell", type: cc.Prefab},
                {path: "prefab/guildCrossWar/PopupGuildCrossWarHelp", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildWarNoticeNode", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildCrossWarGuildRank", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildCrossWarAvatar", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildCrossWarBosssAvatar", type: cc.Prefab},
                {path: "prefab/guildCrossWar/GuildWarNotice", type: cc.Prefab},
            ];
            ResourceLoader.loadResArrayWithType(data, (err, data) => {
                callBack();
            });
        }
        var state = GuildCrossWarHelper.getCurCrossWarStage()[0];
        if (GuildCrossWarConst.ACTIVITY_STAGE_1 == state || GuildCrossWarConst.ACTIVITY_STAGE_2 == state) {
            G_UserData.getGuildCrossWar().c2sBrawlGuildsEntry();
        } else {
            G_Prompt.showTip(Lang.get('未开启'));
        }
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_GUILDCROSS_WAR_ENTRY, onMsgCallBack);
        return signal;
    }

    onCreate() {
        var mapNode = Util.getNode("prefab/guildCrossWar/GuildCrossWarBattleMapNode", GuildCrossWarBattleMapNode) as GuildCrossWarBattleMapNode;
        var miniMapNode = Util.getNode("prefab/guildCrossWar/GuildCrossWarMiniMap", GuildCrossWarMiniMap) as GuildCrossWarMiniMap;
        this._battleMapNode = mapNode;
        this._mapNode.addChild(mapNode.node);
        this._miniMapNode = miniMapNode;
        this._miniNode.addChild(miniMapNode.node);
        this._btnReport.updateUI(FunctionConst.FUNC_GUILD_CROSS_REWARDRANK);
        this._btnMail.node.active = (false);
        this._initTopBar();
        this._initCountDown();
        this._initRebornView();
        this._initAotuFindingEffect();
    }
    _initTopBar() {
        this._topbarBase.setImageTitle('txt_sys_qintombo');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_SEASONSPORT);
        this._commonHelp.addClickEventListenerEx(handler(this, this._onClickHelp));
        this._topbarBase.setCallBackOnBack(handler(this, this._onReturnBack));
    }
    _initCountDown() {
        var __ = GuildCrossWarHelper.getCurCrossWarStage(), endTime;
        if (endTime == 0) {
            return;
        }
        function endCallback() {
            var __ = GuildCrossWarHelper.getCurCrossWarStage(), endTime;
            if (endTime != 0) {
                this._commonCountDown.startCountDown(Lang.get('groups_remaining_time'), endTime);
                G_UserData.getGuildCrossWar().c2sBrawlGuildsEntry();
            }
        }
        this._commonCountDown.setCountdownTimeParam({
            color: Colors.WHITE,
            outlineColor: Colors.DEFAULT_OUTLINE_COLOR
        });
        this._commonCountDown.startCountDown(Lang.get('groups_remaining_time'), endTime, endCallback, null);
    }
    _initAotuFindingEffect() {
        G_EffectGfxMgr.createPlayGfx(this._autoMovingNode, 'effect_xianqinhuangling_zidongxunluzhong', null, true);
        this._autoMovingNode.active = (false);
    }
    _initRebornView() {
        var rebornCDNode = Util.getNode("prefab/guildCrossWar/GuildCrossWarRebornCDNode", GuildCrossWarRebornCDNode) as GuildCrossWarRebornCDNode;
        this._rebornCDNode = rebornCDNode;
        this._rebornCDNode.node.active = (false);
        this._nodeRebornCDParent.addChild(rebornCDNode.node);
    }
    _onReturnBack() {
        G_SceneManager.popScene();
    }
    _onBtnReport() {
        G_SceneManager.showDialog('app.scene.view.guildCrossWar.PopupGuildCrossWarRank', null, null);
    }
    _onClickHelp(sender) {
        G_SceneManager.openPopup("prefab/guildCrossWar/PopupGuildCrossWarHelp", (popup: PopupGuildCrossWarHelp) => {
            popup.updateByFunctionId(FunctionConst.FUNC_GUILD_CROSS_WAR);
            popup.open();
        });
    }
    _onClickButton(sender) {
    }
    onEnter() {
        this._signalFightSelfDie = G_SignalManager.add(SignalConst.EVENT_GUILDCROSS_WAR_SELFDIE, handler(this, this._onEventFightSelfDie));
        this._rebornCDNode.updateVisible();
    }
    onExit() {
        this._signalFightSelfDie.remove();
        this._signalFightSelfDie = null;
        this.unscheduleAllCallbacks();
    }
    _updateAuotMovingEffect() {
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null) {
            return;
        }
        if (this._autoMovingNode.active != selfUnit.isMoving()) {
            this._autoMovingNode.active = (selfUnit.isMoving());
        }
    }
    update(dt) {
        var scaleFator = GuildCrossWarConst.CAMERA_SCALE_SMALL;
        var [cameraPos, cameraSize] = this._battleMapNode.getCameraPos();
        this._miniMapNode.updateCamera(cameraPos.x * scaleFator, cameraPos.y * scaleFator);
        var selfPosX = this._battleMapNode.getSelfPosition().x;
        var selfPosY = this._battleMapNode.getSelfPosition().y;
        if (selfPosX && selfPosY) {
            this._miniMapNode.updateSelf(selfPosX, selfPosY);
        }
        this._delayUpdate = this._delayUpdate + dt;
        if (this._delayUpdate >= 2) {
            this._delayUpdate = 0;
            var userlist = this._battleMapNode.getUserList();
            this._miniMapNode.updateSelfGuildNumber(userlist);
        }
        this._updateAuotMovingEffect();
        if (this._rebornCDNode.isInReborn()) {
            this._rebornCDNode.refreshCdTimeView();
        }
    }
    _onEventFightSelfDie(id, message) {
        this._rebornCDNode.startCD();
    }

}