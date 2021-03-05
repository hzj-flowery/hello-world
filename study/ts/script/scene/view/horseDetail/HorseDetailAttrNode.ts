const { ccclass, property } = cc._decorator;

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import AttributeConst from '../../../const/AttributeConst';
import { G_ResolutionManager, G_Prompt, G_UserData, G_SceneManager } from '../../../init';
import { FunctionConst } from '../../../const/FunctionConst';
import UIConst from '../../../const/UIConst';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';

var RECORD_ATTR_LIST = [
    [
        AttributeConst.ATK,
        '_nodeAttr1'
    ],
    [
        AttributeConst.HP,
        '_nodeAttr2'
    ],
    [
        AttributeConst.PD,
        '_nodeAttr3'
    ],
    [
        AttributeConst.MD,
        '_nodeAttr4'
    ],
    [
        AttributeConst.CRIT,
        null
    ],
    [
        AttributeConst.NO_CRIT,
        '_nodeAttr5'
    ],
    [
        AttributeConst.HIT,
        '_nodeAttr6'
    ],
    [
        AttributeConst.NO_HIT,
        null
    ],
    [
        AttributeConst.HURT,
        null
    ],
    [
        AttributeConst.HURT_RED,
        null
    ]
];
var ATTR_MAP = [
    1,
    2,
    3,
    4,
    6,
    7
];

@ccclass
export default class HorseDetailAttrNode extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCommon: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr5: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr6: CommonAttrNode = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonUpStar: CommonButtonLevel2Highlight = null;


    private _horseData: any;
    private _rangeType: number;
    private _recordAttr: any;
    private _isInit: boolean;

    ctor(horseData, rangeType?, recordAttr?) {
        this._horseData = horseData;
        this._rangeType = rangeType;
        if (recordAttr) {
            this._recordAttr = recordAttr;
        } else {
            this._recordAttr = G_UserData.getAttr().createRecordData(this._horseData.getId());
            var attrInfo = HorseDataHelper.getHorseAttrInfo(this._horseData);
            this._recordAttr.updateData(attrInfo);
        }
        this._buttonUpStar.addClickEventListenerEx(handler(this, this._onButtonUpStarClicked));
        G_UserData.getAttr().recordPowerWithKey(FunctionConst.FUNC_TEAM);
        this.onInit();
    }
    onInit() {
        var contentSize = this._panelBg.getContentSize();
        var posY = this._nodeCommon.y;
        if (this._horseData.isUser() == false && !this._isInit) {
            contentSize.height = contentSize.height - 65;
            posY = posY - 65;
            this._isInit = true;
        }
        this.node.setContentSize(contentSize);
        this._panelBg.setContentSize(contentSize);
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('horse_detail_title_attr'));
        this._buttonUpStar.setString(Lang.get('horse_btn_advance'));
        this._updateAttrDes();
        this._nodeCommon.y = (posY);
        this._buttonUpStar.setVisible(this._horseData.isUser());
        if (this._horseData.isUser()) {
            var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_TRAIN, 'slotRP', this._horseData);
            this._buttonUpStar.showRedPoint(reach);
        }
    }
    _updateAttrDes(recordAttr?) {
        recordAttr = recordAttr || this._recordAttr;
        //logWarn('战马属性信息');
        //dump(recordAttr.getAttr());
        var index = 0;
        for (var i = 1; i <= 6; i++) {
            var attrId = RECORD_ATTR_LIST[ATTR_MAP[i - 1] - 1][0];
            var value = recordAttr.getCurValue(attrId);
            //logWarn('attrId = ' + (tostring(attrId) + (', value = ' + tostring(value))));
            if (value && value != 0) {
                this['_nodeAttr' + i].updateView(attrId, value, null, 4);
                this['_nodeAttr' + i].setVisible(true);
            } else {
                this['_nodeAttr' + i].setVisible(false);
            }
        }
    }
    _onButtonUpStarClicked() {
        var [isOpen, des] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE_TRAIN);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var horseId = this._horseData.getId();
        G_SceneManager.showScene('horseTrain', horseId, this._rangeType, true);
    }
    _updateBaseAttr() {
        var attrInfo = HorseDataHelper.getHorseAttrInfo(this._horseData);
        this._recordAttr.updateData(attrInfo);
    }
    playBaseAttrPromptSummary(recordAttr, refresh?) {
        if (!this._horseData.isInBattle() || refresh) {
            this._updateAttrDes(recordAttr);
            return;
        }
        var summary = [];
        this._addBaseAttrPromptSummary(summary, recordAttr);
        G_Prompt.showSummary(summary);
        if (summary.length > 0) {
            G_UserData.getAttr().recordPowerWithKey(FunctionConst.FUNC_TEAM);
            G_Prompt.playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_TEAM, -5);
        }
    }
    _addBaseAttrPromptSummary(summary: any[], recordAttr) {
        var size = G_ResolutionManager.getDesignSize();
        for (let i = 0; i < RECORD_ATTR_LIST.length; i++) {
            var one = RECORD_ATTR_LIST[i];
            var attrId = one[0];
            var dstNodeName = one[1];
            var diffValue = recordAttr.getDiffValue(attrId);
            if (diffValue && diffValue != 0) {
                var pos = cc.v2(0, 0);
                if (this[dstNodeName]) {
                    pos = this[dstNodeName].node.getPosition();
                }
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: cc.v2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: cc.v2(pos.x + size[0] / 5, pos.y + size[1] / 6),
                    finishCallback: function () {
                        if (attrId && dstNodeName) {
                            if (recordAttr && this[dstNodeName]) {
                                var curValue = recordAttr.getCurValue(attrId);
                                this[dstNodeName].updateTxtValue(curValue);
                            }
                        }
                    }.bind(this)
                };
                summary.push(param);
            }
        }
        return summary;
    }
}
