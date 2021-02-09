const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem'
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { G_NetworkManager, G_UserData, G_ConfigLoader, G_Prompt, G_SceneManager } from '../../../init';
import { MessageIDConst } from '../../../const/MessageIDConst';
import { handler } from '../../../utils/handler';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { DropHelper } from '../../../utils/DropHelper';
import { ReportParser } from '../../../fight/report/ReportParser';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';

@ccclass
export default class PopupBossDetail extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _ImageHero: CommonHeroAvatar = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _drop1: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _drop2: CommonResourceInfo = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _listDrop: CommonListViewLineItem = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _cost: CommonResourceInfo = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnFormation: cc.Button = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnAttack: CommonButtonLevel0Highlight = null;

    private _chapterType;
    private _chapterId;
    private _bossData;
    private _isBossPage;
    private _listenerBossFight;
    private _awardsList: any[];
    _isPopStageView: any;

    init(chapterType, chapterId, bossData, isBossPage, isPopStageView) {
        this._chapterType = chapterType;
        this._chapterId = chapterId;
        this._bossData = bossData;
        this._isBossPage = isBossPage;
        this._isPopStageView = isPopStageView;
        this._listenerBossFight = null;
        this._ImageHero.init();
    }
    onCreate() {
        this._createHeroSpine();
        this._btnAttack.setString(Lang.get('stage_fight'));
        this._btnAttack.addClickEventListenerEx(handler(this, this._onFightClick))
    }
    onEnter() {
        this._listenerBossFight = G_NetworkManager.add(MessageIDConst.ID_S2C_ActDailyBoss, handler(this, this._recvBossFight));
        var myLevel = G_UserData.getBase().getLevel();
        let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var exp = Parameter.get(ParameterIDConst.MISSION_DROP_EXP).content * myLevel * this._bossData.cost;
        var money = Parameter.get(ParameterIDConst.MISSION_DROP_MONEY).content * myLevel * this._bossData.cost;
        this._drop1.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_EXP, exp);
        this._drop2.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, money);
        this._cost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, this._bossData.cost);
        this._textTitle.string = (this._bossData.name);
        this._updateDropList();
    }
    onExit() {
        if (this._listenerBossFight) {
            this._listenerBossFight.remove();
            this._listenerBossFight = null;
        }
    }
    _createHeroSpine() {
        this._ImageHero.updateUI(this._bossData.res_id);
    }
    public onCloseClick() {
        this.closeWithAction();
        if (this._isPopStageView) {
            G_SceneManager.popScene();
        }
    }
    _onFightClick() {
        var chapterId = this._chapterId;
        var bossId = this._bossData.id;
        var needVit = this._bossData.cost;
        var chapterData = G_UserData.getChapter().getChapterByTypeId(this._chapterType, chapterId);
        if (chapterData.getBossId() == 0 || chapterData.getBossState() != 0) {
            G_Prompt.showTip(Lang.get('chapter_boss_not_find'));
            return;
        }
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit);
        if (success) {
            G_NetworkManager.send(MessageIDConst.ID_C2S_ActDailyBoss, {
                chapter_id: chapterId,
                boss_id: bossId
            });
        }
    }
    public onFormationClick() {
        G_SceneManager.openPopup(Path.getPrefab("PopupEmbattle", "team"))
    }
    _updateDropList() {
        var awards = DropHelper.getDropReward(this._bossData.drop);
        this._listDrop.setListViewSize(450, 100);
        for (let i in awards) {
            var v = awards[i];
            v.size = 1;
        }
        this._listDrop.updateUI(awards, 1, false, true);
        this._listDrop.setItemsMargin(20);
        this._awardsList = awards;
    }
    _recvBossFight(id, message) {
        if (message.ret != 1) {
            return;
        }
        var reportData = ReportParser.parse(message.battle_report);
        var battleData = BattleDataHelper.parseDailyBossData(message, this._bossData.in_res, true);
        var win = reportData.getIsWin();
        var isPop = this._isPopStageView
        if (win) {
            var chapterData = G_UserData.getChapter();
            chapterData.defeatBoss(message.chapter_id);
        }
        G_SceneManager.showScene('fight', reportData, battleData, false, isPop);
    }
}