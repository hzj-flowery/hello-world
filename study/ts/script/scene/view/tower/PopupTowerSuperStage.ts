const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData, G_Prompt, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import ListView from '../recovery/ListView';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { DropHelper } from '../../../utils/DropHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import ParameterIDConst from '../../../const/ParameterIDConst';
import PopupTowerSuperStageCell from './PopupTowerSuperStageCell';

@ccclass
export default class PopupTowerSuperStage extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: ListView, visible: true })
    _listItemSource: ListView = null;

    @property({ type: cc.Label, visible: true })
    _textZhanli: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textFightCount: cc.Label = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _commonSweep: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _commonFight: CommonButtonLevel0Highlight = null;

    @property({ type: CommonIconTemplate, visible: true })
    _item01: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _item02: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageReceived: cc.Sprite = null;

    @property({ type: CommonHeroAvatar, visible: true })
    _heroAvator: CommonHeroAvatar = null;

    @property({ type: cc.Prefab, visible: true })
    _towerSuperStageCellPrefab: cc.Prefab = null;

    private _selectIndex;
    private _canFightMaxIndex;
    private _signalTowerExecuteSuper;
    private _signalTowerGetInfo;
    private _currListData;

    public init(layerConfig) {
        this._selectIndex = null;
        this._canFightMaxIndex = null;
    }

    public onCreate() {
        this.setClickOtherClose(true);
        this._commonNodeBk.setTitle(Lang.get('challenge_tower_super_title'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onCloseClick));
        this._commonNodeBk.moveTitleToTop();
        this._commonSweep.setString(Lang.get('challenge_tower_super_sweep'));
        this._commonFight.setString(Lang.get('challenge_tower_super_fight'));
        this._initListView(this._listItemSource);
    }

    public onEnter() {
        this._signalTowerExecuteSuper = G_SignalManager.add(SignalConst.EVENT_TOWER_EXECUTE_SUPER, handler(this, this._onEventTowerExecuteSuper));
        this._signalTowerGetInfo = G_SignalManager.add(SignalConst.EVENT_TOWER_GET_INFO, handler(this, this._onEventTowerGetInfo));
        this._refreshStageView();
        this._refreshStageList();
        this._refreshBtns();
        var stageId = G_UserData.getTowerData().getShowRewardSuperStageId();
        if (stageId != 0) {
            this._showFirstRewards(stageId);
            G_UserData.getTowerData().setShowRewardSuperStageId(0);
        }
    }

    public onExit() {
        this._signalTowerExecuteSuper.remove();
        this._signalTowerExecuteSuper = null;
        this._signalTowerGetInfo.remove();
        this._signalTowerGetInfo = null;
    }

    private _onEventTowerGetInfo(event) {
        this._refreshStageView();
        this._refreshStageList();
    }

    private _initListView(listView: ListView) {
        listView.setTemplate(this._towerSuperStageCellPrefab);
        listView.setCallback(handler(this, this._onItemUpdate));
    }

    private _onItemUpdate(node: cc.Node, index) {
        let item: PopupTowerSuperStageCell = node.getComponent(PopupTowerSuperStageCell);
        var data = this._currListData[index];
        if (data) {
            item.setCustomCallback(handler(this, this._onItemTouch));
            item.updateInfo(data, index, this._selectIndex, this._canFightMaxIndex);
        }
    }

    private _onItemSelected(item, index) {

    }

    private _onItemTouch(index, itemPos) {
        var data = this._currListData[index];
        this._selectIndex = index;
        G_UserData.getTowerData().setSuperStageSelectStageId(data.getId());
        this._refreshStageUnitView(data);
        this._refreshListView(this._listItemSource, this._currListData);
        // this._listItemSource.scrollToItem(this._selectIndex, 300);
    }

    private _refreshListView(listView: ListView, listData) {
        this._currListData = listData;
        var lineCount = listData.length;
        listView.clearAll();
        listView.setData(listData);
    }

    public onSweepClick(sender) {
        var [isOpened, errMsg] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TOWER_SUPER_SWEEP);
        if (isOpened == false) {
            if (errMsg) {
                G_Prompt.showTip(errMsg);
            }
            return;
        }
        var stageUnitData = this._currListData[this._selectIndex];
        var stageId = stageUnitData.getId();
        if (!stageUnitData.isPass()) {
            G_Prompt.showTip(Lang.get('challenge_tower_super_sweep_hint'));
            return;
        }
        if (G_UserData.getTowerData().getSuperChallengeCount() <= 0) {
            G_Prompt.showTip(Lang.get('challenge_tower_super_no_count'));
            return;
        }
        G_UserData.getTowerData().c2sExecuteTowerSuperStage(stageId, 2);
    }

    public onChallengeClick(sender) {
        var stageUnitData = this._currListData[this._selectIndex];
        var open = G_UserData.getTowerData().isSuperStageOpen(stageUnitData.getId());
        if (!open) {
            var needStageUnit = G_UserData.getTowerData().getSuperStageUnitData(stageUnitData.getConfig().need_id);
            var preStageName = needStageUnit && needStageUnit.getConfig().name || '';
            G_Prompt.showTip(Lang.get('challenge_tower_pass_condition', { name: preStageName }));
            return;
        }
        if (G_UserData.getTowerData().getSuperChallengeCount() <= 0) {
            G_Prompt.showTip(Lang.get('challenge_tower_super_no_count'));
            return;
        }
        var stageId = stageUnitData.getId();
        G_UserData.getTowerData().c2sExecuteTowerSuperStage(stageId, 1);
    }

    private _onEventTowerExecuteSuper(event, message) {
        var type = message.type;
        if (type == 1) {
            var reportId = message.battle_report;
            G_SignalManager.addOnce(SignalConst.EVENT_ENTER_FIGHT_SCENE, this._enterFightView.bind(this, message));
            G_UserData.getFightReport().c2sGetNormalBattleReport(reportId);

        } else {
            this._refreshStageView();
            this._showRewards(message);
        }
    }

    private _enterFightView(message) {
        var battleReport = G_UserData.getFightReport().getReport();
        var reportData = ReportParser.parse(battleReport);
        var stageUnitData = G_UserData.getTowerData().processStageUnitData(message.stage_id, reportData.getIsWin());
        var battleData = BattleDataHelper.parseChallengeSuperTowerData(message, stageUnitData.getConfig(), stageUnitData.isPass());
        G_SceneManager.showScene('fight', reportData, battleData);
    }

    private _showRewards(message) {
        var firstRewards: any[] = message.first_reward || [];
        var rewards: any[] = message.reward || [];
        var list: any[] = [];
        for (let k in firstRewards) {
            var v = firstRewards[k];
            list.push(v);
        }
        for (let k in rewards) {
            var v = rewards[k];
            list.push(v);
        }
        PopupGetRewards.showRewards(list);
    }

    private _showFirstRewards(id) {
        var unitData = G_UserData.getTowerData().getSuperStageUnitData(id);
        if (unitData) {
            var config = unitData.getConfig();
            var firstDropRewardList = DropHelper.getDropReward(config.first_drop);
            this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                PopupGetRewards.showRewards(firstDropRewardList);
            })));
        }
    }

    private _refreshStageUnitView(stageUnitData) {
        if (!stageUnitData) {
            return;
        }
        var isReceived = stageUnitData.isPass();
        var config = stageUnitData.getConfig();
        this._textZhanli.string = (config.combat).toString();
        this._imageReceived.node.active = (isReceived);
        var firstDropRewardList = DropHelper.getDropReward(config.first_drop);
        var passDropRewardList = DropHelper.getDropReward(config.drop);
        var firstDropReward = firstDropRewardList[0];
        var passDropReward = passDropRewardList[0];
        this._item01.unInitUI();
        this._item01.initUI(firstDropReward.type, firstDropReward.value, firstDropReward.size);
        this._item01.setIconMask(isReceived);
        this._item02.unInitUI();
        this._item02.initUI(passDropReward.type, passDropReward.value, passDropReward.size);
        this._heroAvator.updateUI(config.res_id);
    }

    private _refreshStageView() {
        var count = G_UserData.getTowerData().getSpuer_cnt();
        var totalCount = UserDataHelper.getParameter(ParameterIDConst.TOWER_SUPER_CHALLENGE_MAX_TIME);
        this._textFightCount.string = (totalCount - count).toString();
    }

    private _onCloseClick() {
        this.closeWithAction();
    }

    private _getLastStageIndex(listViewData: any[]) {
        var selectIndex = 0;
        for (let k = 0; k < listViewData.length; k++) {
            var v = listViewData[k];
            if (!G_UserData.getTowerData().isSuperStageOpen(v.getId())) {
                selectIndex = k;
                break;
            }
            selectIndex = selectIndex + 1;
        }
        selectIndex = Math.max(1, selectIndex) - 1;
        return selectIndex;
    }

    private _getIndexByStageId(listViewData, id) {
        for (let k = 0; k < listViewData.length; k++) {
            var v = listViewData[k];
            if (v.getId() == id) {
                return k;
            }
        }
        return null;
    }

    private _refreshStageList() {
        var listViewData = G_UserData.getTowerData().getSuperStageList();
        this._canFightMaxIndex = this._getLastStageIndex(listViewData);
        this._selectIndex = this._getIndexByStageId(listViewData, G_UserData.getTowerData().getSuperStageSelectStageId()) || (this._canFightMaxIndex);
        this._refreshListView(this._listItemSource, listViewData);
        this._refreshStageUnitView(this._currListData[this._selectIndex]);
        this._listItemSource.scrollToItem(this._selectIndex, 0.3);
    }

    private _refreshBtns() {
        var sweepShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TOWER_SUPER_SWEEP);
        this._commonSweep.setVisible(sweepShow);
        if (!sweepShow) {
            this._commonFight.node.x = (0);
        } else {
            this._commonSweep.node.x = (-105);
            this._commonFight.node.x = (105);
        }
    }
}