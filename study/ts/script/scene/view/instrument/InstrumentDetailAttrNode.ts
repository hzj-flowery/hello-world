const { ccclass, property } = cc._decorator;

import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import { G_SceneManager, Colors, G_Prompt } from "../../../init";
import InstrumentConst from "../../../const/InstrumentConst";
import { handler } from "../../../utils/handler";
import { Lang } from "../../../lang/Lang";
import { InstrumentUnitData } from "../../../data/InstrumentUnitData";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { RedPointHelper } from '../../../data/RedPointHelper';
import { FunctionConst } from "../../../const/FunctionConst";
import { TextHelper } from "../../../utils/TextHelper";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import CommonAttrNode from "../../../ui/component/CommonAttrNode";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";

@ccclass
export default class InstrumentDetailAttrNode extends ListViewCellBase {

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonAdvance:CommonButtonLevel2Highlight = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonLimit:CommonButtonLevel2Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg:cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle:CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel:CommonDesValue = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1:CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2:CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3:CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4:CommonAttrNode = null;

    private _instrumentData:InstrumentUnitData;
    private _rangeType:number;

    onCreate(){
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
    }
    onEnter(){
        this._buttonAdvance.addTouchEventListenerEx(handler(this,this._onButtonAdvanceClicked),true);
        this._buttonLimit.addTouchEventListenerEx(handler(this,this._onButtonLimitClicked),true);

        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('instrument_detail_title_attr'));
        this._buttonAdvance.setString(Lang.get('instrument_btn_advance'));
        this._buttonLimit.setString(Lang.get('instrument_btn_limit'));
        var des = Lang.get('instrument_detail_advance_level');
        var value = this._instrumentData.getLevel();
        var max = this._instrumentData.getAdvanceMaxLevel();
        var color = value < max && Colors.BRIGHT_BG_ONE || Colors.BRIGHT_BG_GREEN;
        this._nodeLevel.setFontSize(20);
        this._nodeLevel.updateUI(des, value, max);
        this._nodeLevel.setValueColor(color);
        this._nodeLevel.setMaxColor(color);
        this._updateAttrDes();
        var isUser = this._instrumentData.isUser();
        this._buttonAdvance.setVisible(isUser);
        //var isCanLimit = this._instrumentData.isCanLimitBreak();
        // var isShow = LogicCheckHelper['funcIsShow'](FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
        // this._buttonLimit.setVisible(isUser && isCanLimit && isShow);
        this._showLimitBtnProc();
        if (isUser) {
            var reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, 'slotRP', this._instrumentData);
            this._buttonAdvance.showRedPoint(reach1);
            var reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2, 'slotRP', this._instrumentData);
            this._buttonLimit.showRedPoint(reach2);
        }
    }

    init(instrumentData, rangeType){
        this._instrumentData = instrumentData;
        this._rangeType = rangeType;
    }

    _onButtonAdvanceClicked() {
        var result = LogicCheckHelper['funcIsOpened'](FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1);
        var isOpen = result[0], des = result[1];
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var instrumentId = this._instrumentData.getId();
        G_SceneManager.showScene('instrumentTrain', instrumentId, InstrumentConst.INSTRUMENT_TRAIN_ADVANCE, this._rangeType, true);
    }
    _onButtonLimitClicked() {
        var [isOpen, des] = LogicCheckHelper['funcIsOpened'](FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var instrumentId = this._instrumentData.getId();
       G_SceneManager.showScene('instrumentTrain', instrumentId, InstrumentConst.INSTRUMENT_TRAIN_LIMIT, this._rangeType, true);
    }
    _updateAttrDes(){
        var attrInfo = InstrumentDataHelper.getInstrumentAttrInfo(this._instrumentData);
        var desInfo = TextHelper.getAttrInfoBySort(attrInfo);
        for (var i = 1; i<=4; i++) {
            var info = desInfo[i-1];
            if (info) {
                this['_nodeAttr' + i].updateView(info.id, info.value, null, 4);
                this['_nodeAttr' + i].node.active = (true);
            } else {
                this['_nodeAttr' + i].node.active = (false);
            }
        }
    }

    _showLimitBtnProc() {
        var isUser = this._instrumentData.isUser();
        var isCanLimit = this._instrumentData.isCanLimitBreak();
        var isShow = this._instrumentData.getLimitFuncShow();
        this._buttonLimit.node.active = (isUser && isCanLimit && isShow);
    }
}
