const { ccclass, property } = cc._decorator;

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { Lang } from '../../../lang/Lang';
import AttributeConst from '../../../const/AttributeConst';
import { HeroConst } from '../../../const/HeroConst';

@ccclass
export default class HeroLimitDetailAttrNode extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle1: CommonDetailTitleWithBg = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_1: CommonAttrNode = null;  

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1_4: CommonAttrNode = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle2: CommonDetailTitleWithBg = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2_4: CommonAttrNode = null;

    private _heroUnitData;
    private _limitLevel1;
    private _limitLevel2;
    private _callBack:any;
    public setInitData(heroUnitData, limitLevel1?, limitLevel2?,callBack?:any): void {
        this._heroUnitData = heroUnitData;
        this._limitLevel1 = limitLevel1;
        this._limitLevel2 = limitLevel2;
        this._callBack = callBack;
    }

    onCreate() {
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
        for (var i = 1; i <= 2; i++) {
            this._update(this._heroUnitData, i);
        }
        if(this._callBack)
        this._callBack();
        this._callBack = null;
    }
    _update(heroUnitData, index) {
        this['_nodeTitle' + index].setFontSize(24);
        this['_nodeTitle' + index].setTitle(Lang.get('hero_detail_title_attr'));
        var limitDataType = HeroDataHelper.getLimitDataType(heroUnitData);
        var lv1, lv2;
        if (limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            if (index == 1) {
                lv1 = 0;
            } else {
                lv1 = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
            lv2 = 0;
        } else {
            lv1 = heroUnitData.getLimit_level();
            if (index == 1) {
                lv2 = 0;
            } else {
                lv2 = HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL;
            }
        }
        var attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData.getConfig(), 1);
        var attr2 = {};
        if (index == 2) {
            var heroBaseId = heroUnitData.getBase_id();
            var rank = 10;
            var attrMin;
            if (lv2 > 0) {
                attrMin = HeroDataHelper.getBreakAttrWithBaseIdAndRank(heroBaseId, rank, lv1, 0);
            } else {
                attrMin = HeroDataHelper.getBreakAttrWithBaseIdAndRank(heroBaseId, rank, 0, lv2);
            }
            var attrMax = HeroDataHelper.getBreakAttrWithBaseIdAndRank(heroBaseId, rank, lv1, lv2);
            for (var attrType in attrMax) {
                var valueMax = attrMax[attrType];
                var valueMin = attrMin[attrType];
                var value = valueMax - valueMin;
                AttrDataHelper.formatAttr(attr2, attrType, value);
            }
        }
        var attr3 = HeroDataHelper.getLimitAttr(heroUnitData, lv1, lv2);
        var attrInfo = {};
        AttrDataHelper.appendAttr(attrInfo, attr1);
        AttrDataHelper.appendAttr(attrInfo, attr2);
        AttrDataHelper.appendAttr(attrInfo, attr3);
        (this['_nodeAttr' + (index + '_1')] as CommonAttrNode).updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], 5, 4);
        (this['_nodeAttr' + (index + '_2')] as CommonAttrNode).updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], 5, 4);
        (this['_nodeAttr' + (index + '_3')] as CommonAttrNode).updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], 5, 4);
        (this['_nodeAttr' + (index + '_4')] as CommonAttrNode).updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], 5, 4);
    }


}