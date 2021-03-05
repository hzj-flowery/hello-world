const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import PopupBase from '../../../ui/PopupBase';
import TowerChooseCell from './TowerChooseCell';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { G_SignalManager, G_UserData, G_SceneManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupTowerChoose extends PopupBase {

    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textStageName: cc.Label = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _nodeAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCondition: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnFormation: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _chooseCell1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _chooseCell2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _chooseCell3: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _chooseCellPrefab: cc.Prefab = null;

    private _layerConfig;
    private _signalExecute;
    private _signalTowerGetInfo;
    private _fightDifficulty;

    public init(layerConfig) {
        this._layerConfig = layerConfig;
        this._signalExecute = null;
        this._fightDifficulty = 0;
        this.setClickOtherClose(true);
    }

    public onCreate() {
        this._nodeAvatar.init();
        this._nodeAvatar.updateUI(this._layerConfig.res_id);
        this._nodeAvatar.setBubble(this._layerConfig.talk, null, 2, true);
        this._setChooseCell(this._chooseCell1, this._layerConfig, 1, handler(this, this._onChallengeClick));
        this._setChooseCell(this._chooseCell2, this._layerConfig, 2, handler(this, this._onChallengeClick));
        this._setChooseCell(this._chooseCell3, this._layerConfig, 3, handler(this, this._onChallengeClick));

        var winCondition = this._layerConfig.win_value;
        if (this._layerConfig.win_type == 3) {
            winCondition = winCondition / 10;
        }
        var winString = Lang.get('challenge_tower_condition_' + this._layerConfig.win_type, { count: winCondition });
        this._textCondition.string = (winString);
        this._textStageName.string = (this._layerConfig.name);
    }

    public onEnter() {
        this._signalExecute = G_SignalManager.add(SignalConst.EVENT_TOWER_EXECUTE, handler(this, this._onEventExecute));
        this._signalTowerGetInfo = G_SignalManager.add(SignalConst.EVENT_TOWER_GET_INFO, handler(this, this._onEventTowerGetInfo));
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupTowerChoose");
    }

    public onExit() {
        this._signalExecute.remove();
        this._signalExecute = null;
        this._signalTowerGetInfo.remove();
        this._signalTowerGetInfo = null;
    }

    private _setChooseCell(parentNode: cc.Node, layerConfig, difficulty, callback) {
        let chooseCell: TowerChooseCell = cc.instantiate(this._chooseCellPrefab).getComponent(TowerChooseCell);
        chooseCell.init(layerConfig, difficulty, callback);
        parentNode.addChild(chooseCell.node);
    }

    private _onEventTowerGetInfo(event) {
    }

    public _onChallengeClick(difficulty) {
        var success = LogicCheckHelper.checkTowerCanChallenge(this._layerConfig.id);
        if (!success) {
            return;
        }
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOWER_COUNT, 1);
        if (success) {
            this._fightDifficulty = difficulty;
            G_UserData.getTowerData().c2sExecuteTower(this._layerConfig.id, difficulty);
        }
    }

    private _onEventExecute(eventName, message) {
        var reportId = message.battle_report;
        G_SignalManager.addOnce(SignalConst.EVENT_ENTER_FIGHT_SCENE, handler(this, this._enterFightView, message));
        G_UserData.getFightReport().c2sGetNormalBattleReport(reportId);
    }

    private _enterFightView(args) {
        let message = args[0];
        var battleReport = G_UserData.getFightReport().getReport();
        var reportData = ReportParser.parse(battleReport);
        var battleData = BattleDataHelper.parseChallengeTowerData(message, this._layerConfig, this._fightDifficulty);
        G_SceneManager.showScene('fight', reportData, battleData);
        var win = reportData.getIsWin();
        if (win) {
            G_UserData.getTowerData().setShowStarEft(true);
            this.close();
        } else {
            G_UserData.getRedPoint().clearRedPointShowFlag(FunctionConst.FUNC_PVE_TOWER, { fullCount: true });
        }
    }

    public onFormationClick() {
        G_SceneManager.openPopup(Path.getPrefab("PopupEmbattle", "team"));
    }

    public onCloseClick() {
        this.closeWithAction();
    }
}