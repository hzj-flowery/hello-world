const { ccclass, property } = cc._decorator;

import CommonHelp from '../../../ui/component/CommonHelp'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import PopupOfficialRankUpCell from './PopupOfficialRankUpCell';
import { G_UserData, G_SignalManager } from '../../../init';
import { UserBaseData } from '../../../data/UserBaseData';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { SignalConst } from '../../../const/SignalConst';
import { Slot } from '../../../utils/event/Slot';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import PopupOfficialRankUpResult from './PopupOfficialRankUpResult';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Util } from '../../../utils/Util';

@ccclass
export default class PopupOfficialRankUp extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _attrNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _attrNode2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _attrNode3: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textAddPlayerJoint: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _textNodeRes: cc.Node = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resItem1: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resItem2: CommonResourceInfo = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resItem3: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnUp: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRankMax: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _conditionTitle: cc.Sprite = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;

    @property({
        type: PopupOfficialRankUpCell,
        visible: true
    })
    _rankUpCell1: PopupOfficialRankUpCell = null;
    @property({
        type: PopupOfficialRankUpCell,
        visible: true
    })
    _rankUpCell2: PopupOfficialRankUpCell = null;
    @property({
        type: PopupOfficialRankUpCell,
        visible: true
    })
    _rankUpCell3: PopupOfficialRankUpCell = null;

    private _title: string;

    private _getRankUp: Slot;
    private _lastTotalPower: number;

    onCreate() {
        this._title = Lang.get('official_rank_title');
        this._commonNodeBk.addCloseEventListener(handler(this, this.closeWithAction));
        this._commonNodeBk.setTitle(this._title);
        this._commonHelp.updateUI(FunctionConst.FUNC_OFFICIAL);
        this._rankUpCell3.node.active = false;
        this._textRankMax.node.active = false;

        this._isClickOtherClose = true;
    }

    onEnter() {
        this._getRankUp = G_SignalManager.add(SignalConst.EVENT_OFFICIAL_LEVEL_UP, handler(this, this._onEventRankUp));
        this.updateUI();
    }

    onShowFinish()
    {
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupOfficialRankUp");
        }, 0);
    }

    onExit() {
        this._getRankUp.remove();
        this._getRankUp = null;
    }

    _onInit() { }
    updateUI() {
        this._recordTotalPower();
        var ubd: UserBaseData = G_UserData.getBase();
        var currRank = ubd.getOfficialLevel() || 0;
        var nextRank = currRank + 1;
        var currInfo = ubd.getOfficialInfo(currRank)[0];
        var nextInfo = ubd.getOfficialInfo(nextRank)[0];
        this._textAddPlayerJoint.string = currInfo.text_1 || '';
        if (nextInfo == null) {
            this._rankUpCell1.node.active = false;
            this._rankUpCell2.node.active = false;
            this._rankUpCell3.node.active = true;
            this._rankUpCell3.updateUI(currRank, true);
            this._textNodeRes.active = false;
            this._conditionTitle.node.active = false;
            this._imageArrow.node.active = false;
            this._textRankMax.node.active = true;
        } else {
            this._rankUpCell1.node.active = true;
            this._rankUpCell2.node.active = true;
            this._rankUpCell3.node.active = false;
            this._rankUpCell1.updateUI(currRank, true);
            this._rankUpCell2.updateUI(nextRank, false);
            this._textNodeRes.active = true;
            this._conditionTitle.node.active = true;
            this._imageArrow.node.active = true;
            this._textRankMax.node.active = false;
        }
        this._updateRes();
        this._btnUp.setString(Lang.get('official_btn_up'));
    }

    _updateRes() {
        var currRank = G_UserData.getBase().getOfficialLevel();
        var currInfo = G_UserData.getBase().getOfficialInfo(currRank)[0];
        var currPower = G_UserData.getBase().getPower();
        this._resItem1.showImageAdd(false, null);
        this._resItem1.updateUI(TypeConvertHelper.TYPE_POWER, currInfo.combat_demand, null);
        this._resItem1.setTextColorToDTypeColor(null);
        this._resItem1.setCount(TextHelper.getAmountText(currInfo.combat_demand));
        this._resItem1.setCountColorRed(currPower <= currInfo.combat_demand);
        this._resItem2.node.active = false;
        if (currInfo.type_1 > 0) {
            var itemCount1 = UserDataHelper.getNumByTypeAndValue(currInfo.type_1, currInfo.value_1);
            this._resItem2.updateUI(currInfo.type_1, currInfo.value_1, null);
            this._resItem2.setCount(itemCount1, currInfo.size_1);
            this._resItem2.setTextColorToATypeColor(itemCount1 >= currInfo.size_1);
            this._resItem2.showImageAdd(true, false);
            this._resItem2.node.active = true;
            this._resItem2.showResName(true, this._resItem2.getResName() + ': ');
        }
        this._resItem3.node.active = false;
        if (currInfo.type_2 > 0 && currInfo.value_2 > 0) {
            var itemCount2 = UserDataHelper.getNumByTypeAndValue(currInfo.type_2, currInfo.value_2);
            this._resItem3.updateUI(currInfo.type_2, currInfo.value_2, null);
            this._resItem3.setCount(itemCount2, currInfo.size_2);
            this._resItem3.setTextColorToATypeColor(itemCount2 >= currInfo.size_2);
            this._resItem3.showImageAdd(true, false);
            this._resItem3.node.active = true;
            this._resItem3.showResName(true, this._resItem3.getResName() + ': ');
            this._resItem2.node.y = 66.23;
        } else {
            this._resItem2.node.y = 46.22;
        }
    }
    sendRankUp() {
        G_UserData.getBase().c2sUpOfficerLevel();
    }
    onBtnUp() {
        var arr = UserCheck.checkOfficialLevelUp();
        var retValue = arr[0];
        var retFunc = arr[1];
        if (retValue) {
            this.sendRankUp();
        } else {
            retFunc && retFunc();
        }
    }
    _onEventRankUp(id, message) {
        var level = message['level'];
        var lastPower: number = this._lastTotalPower;
        PopupOfficialRankUpResult.popupResult(level, lastPower);
        this.updateUI();
    }
    _recordTotalPower() {
        var totalPower = G_UserData.getBase().getPower();
        this._lastTotalPower = totalPower || 0;
    }

}