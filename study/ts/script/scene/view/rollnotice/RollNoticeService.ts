import { RollNoticeConst } from "../../../const/RollNoticeConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_EffectGfxMgr, G_SceneManager, G_SignalManager, G_TopLevelNode, G_UserData } from "../../../init";
import { handler } from "../../../utils/handler";
import { Util } from "../../../utils/Util";
import RollNoticeBaseNode from "./RollNoticeBaseNode";
import RollNoticeLayer from "./RollNoticeLayer";
import RollNoticeTask from "./RollNoticeTask";

export default class RollNoticeService {
    _notRecieveSelfIds: number[];
    _notRunSelfSceneList: string[];
    _typeFilterList: { main: []; };
    _rootNode: cc.Node;
    _filterSceneList: string[];
    _sceneTaskList: any[];
    _taskList: any;
    _currRollMsg: any;
    _rollMsgCache: any[];
    _signalChangeScene: any;
    _signalRollNoticeReceive: any;
    _signalSubtitlesRunEnd: any;
    _signalSubtitlesShowHide: any;
    constructor() {
        this._rootNode = null;
        this._typeFilterList = { ['main']: [] };
        this._filterSceneList = ['create'];
        this._notRunSelfSceneList = [
            'drawCard',
            'arena',
            'fight'
        ];
        this._notRecieveSelfIds = [
            RollNoticeConst.NOTICE_AVATAR_ACTIVITY_ID,
            RollNoticeConst.NOTICE_EQUIP_ACTIVITY_ID,
            RollNoticeConst.NOTICE_PET_ACTIVITY_ID,
            RollNoticeConst.NOTICE_CAMP_RACE_PRE_PASS,
            RollNoticeConst.NOTICE_CAMP_RACE_GUILD_PRE_PASS,
            RollNoticeConst.NOTICE_CAMP_RACE_ROUND_2,
            RollNoticeConst.NOTICE_CAMP_RACE_ROUND_3,
            RollNoticeConst.NOTICE_CAMP_RACE_ROUND_4,
            RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_2,
            RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_3,
            RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_4,
            RollNoticeConst.NOTICE_HORSE_CONQUER_ACTIVITY_ID
        ];
        this._sceneTaskList = [];
        this._taskList = null;
        this._rollMsgCache = [];
        this._currRollMsg = null;

        cc.resources.load("prefab/rollnotice/RollNoticeLayer", cc.Prefab, () => {
            this._registerEvents();
        });
    }
    _registerEvents() {
        if (!this._signalChangeScene) {
            this._signalChangeScene = G_SignalManager.add(SignalConst.EVENT_CHANGE_SCENE, handler(this, this._onEventChangeScene));
        }
        if (!this._signalRollNoticeReceive) {
            this._signalRollNoticeReceive = G_SignalManager.add(SignalConst.EVENT_ROLLNOTICE_RECEIVE, handler(this, this._onEventRollNotice));
        }
        if (!this._signalSubtitlesRunEnd) {
            this._signalSubtitlesRunEnd = G_SignalManager.add(SignalConst.EVENT_SUBTITLES_RUN_END, handler(this, this._onEventSubtitlesRunEnd));
        }
        if (!this._signalSubtitlesShowHide) {
            this._signalSubtitlesShowHide = G_SignalManager.add(SignalConst.EVENT_SUBTITLES_SHOW_HIDE, handler(this, this._onEventSubtitlesShowHide));
        }
    }
    _unRegisterEvents() {
        if (this._signalRollNoticeReceive) {
            this._signalRollNoticeReceive.remove();
            this._signalRollNoticeReceive = null;
        }
        if (this._signalChangeScene) {
            this._signalChangeScene.remove();
            this._signalChangeScene = null;
        }
        if (this._signalSubtitlesRunEnd) {
            this._signalSubtitlesRunEnd.remove();
            this._signalSubtitlesRunEnd = null;
        }
        if (this._signalSubtitlesShowHide) {
            this._signalSubtitlesShowHide.remove();
            this._signalSubtitlesShowHide = null;
        }
    }
    start() {
        this._registerEvents();
    }
    startTask(sType) {
        this._registerEvents();
        if (this._taskList == null) {
            this._taskList = {};
        }
        if (this._taskList['k_' + (sType)] != null) {
            return;
        }
        var idList = this._typeFilterList[sType];
        idList = idList || [];
        var notRunSelf = this._notRunSelfSceneList.indexOf(sType);
        var task = new RollNoticeTask((sType).toString(), idList, notRunSelf);
        this._taskList['k_' + (sType)] = task;
        task.start();
    }
    stop(sType) {
        if (this._taskList == null) {
            return;
        }
        var task = this._taskList['k_' + (sType)];
        if (task != null) {
            task.clear();
            this._taskList['k_' + (sType)] = null;
        }
    }
    _isMsgInNotRecieveSelfIdsList(rollMsg) {
        var isSelf = rollMsg.sendId && G_UserData.getBase().getId() == rollMsg.sendId;
        // print('___________________RollNoticeService:_isMsgInNotRecieveSelfIdsList', isSelf, rollMsg.noticeId);
        if (isSelf && rollMsg.noticeId && this._notRecieveSelfIds.indexOf(rollMsg.noticeId) != -1) {
            return true;
        }
        return false;
    }
    _onEventRollNotice(event, rollMsg) {
        if (this._taskList == null) {
            return;
        }
        // logWarn('---------------------_onEventRollNotice');
        if (rollMsg == null || typeof (rollMsg) != 'object') {
            return;
        }
        if (!rollMsg.msg || rollMsg.msg == '') {
            return;
        }
        if (this._isMsgInNotRecieveSelfIdsList(rollMsg)) {
            return;
        }
        var canReceive = false;
        for (var k in this._taskList) {
            var v = this._taskList[k];
            if (v && v.canReceiveNotice(rollMsg)) {
                canReceive = true;
                break;
            }
        }
        if (canReceive) {
            // logWarn('---------------------insert rollMsg');
            this._rollMsgCache.push(rollMsg);
        }
        this._runNextRollMsg();
    }
    _onEventSubtitlesRunEnd(event, rollMsg, node) {
        this._currRollMsg = null;
        if (this._rollMsgCache.length <= 0) {
            G_SignalManager.dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE, false);
        } else {
            this._runNextRollMsg();
        }
    }
    _onEventSubtitlesShowHide(event, show) {
        if (show) {
            this.show();
        } else {
            this.hide();
        }
    }
    _popRollMsg() {
        if (this._rollMsgCache.length > 0) {
            var msg = this._rollMsgCache.shift();
            return msg;
        }
        return null;
    }
    _runNextRollMsg() {
        if (this._currRollMsg) {
            return;
        }
        do {
            var popMsg = this._popRollMsg();
            var canRunMsg = false, runEffect = null;
            if (popMsg) {
                for (var k in this._taskList) {
                    var v = this._taskList[k];
                    if (v && v.canRunNotice(popMsg)) {
                        canRunMsg = true;
                        runEffect = v.isExistEffect(popMsg.noticeId);
                        break;
                    }
                }
            }
            if (canRunMsg) {
                // logWarn('---------------------canRunMsg');
                this._runSubtitle(popMsg, runEffect);
            }
        } while (!(!popMsg || canRunMsg));
        if (!this._currRollMsg && this._rollMsgCache.length <= 0) {
            // logWarn('---------------------hide');
            G_SignalManager.dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE, false);
        }
    }
    _onEventChangeScene(event, enter, sceneName) {
        if (enter) {
            if (this._filterSceneList.indexOf(sceneName) == -1) {
                // logWarn('RollNoticeService scene sign' + sceneName);
                this._sceneTaskList[sceneName] = true;
                this.startTask(sceneName);
            } else {
                this.clearScene();
            }
        } else {
            if (sceneName == "main") {
                return;
            }
            if (this._sceneTaskList[sceneName]) {
                // logWarn('RollNoticeService remove scene sign' + sceneName);
                this._sceneTaskList[sceneName] = null;
                this.stop(sceneName);
            }
        }
    }
    _runSubtitle(rollMsg, effect) {
        var runningScene = G_SceneManager.getRunningScene();
        if (runningScene == null) {
            return;
        }
        if (this._rootNode == null) {
            // logWarn('---------------------create rootNode');
            this._createRootNode();
        }
        G_SignalManager.dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE, true);
        var itemNode = (new cc.Node).addComponent(RollNoticeBaseNode);
        this._rootNode.getComponent(RollNoticeLayer)._panelContent.addChild(itemNode.node);
        itemNode.initData(rollMsg);
        var size = this._rootNode.getComponent(RollNoticeLayer)._panelContent.getContentSize();
        itemNode.run(size);
        this._createEffectShandian(effect);
        this._currRollMsg = rollMsg;
        // logWarn('---------------------run');
    }
    _createEffectShandian(efc) {
        this._rootNode.getComponent(RollNoticeLayer)._nodeEffect.active = (false);
        if (efc && efc != '') {
            this._rootNode.getComponent(RollNoticeLayer)._nodeEffect.active = (true);
            this._rootNode.getComponent(RollNoticeLayer)._nodeEffect.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._rootNode.getComponent(RollNoticeLayer)._nodeEffect, efc, null, true);
        }
    }
    clearScene() {
        G_SignalManager.dispatch(SignalConst.EVENT_SUBTITLES_SHOW_HIDE, false);
        if (this._rootNode != null) {
            this._rootNode.removeFromParent(true);
            this._rootNode = null;
        }
        this._currRollMsg = null;
        this._rollMsgCache = [];
    }
    _clearAllTask() {
        if (this._taskList == null) {
            return;
        }
        for (var k in this._taskList) {
            var v = this._taskList[k];
            if (v != null) {
                v.clear();
            }
            // this._taskList[k] = null;
        }
    }
    stopAllTaskAndClear() {
        this._clearAllTask();
        this.clearScene();
    }
    clear() {
        this.stopAllTaskAndClear();
        this._unRegisterEvents();
    }
    pause() {
    }
    resume() {
    }
    show() {
        if (this._rootNode != null) {
            this._rootNode.active = (true);
        }
    }
    hide() {
        if (this._rootNode != null) {
            this._rootNode.active = (false);
        }
    }
    _createRootNode() {
        if (this._rootNode == null) {
            let cell = Util.getNode("prefab/rollnotice/RollNoticeLayer", RollNoticeLayer) as RollNoticeLayer;
            this._rootNode = cell.node;
            G_TopLevelNode.addToSubtitleLayer(this._rootNode);
            this.hide();
        }
    }
}