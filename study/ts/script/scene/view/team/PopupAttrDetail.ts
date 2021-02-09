const { ccclass, property } = cc._decorator;

import CommonDesValue from '../../../ui/component/CommonDesValue'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import AttributeConst from '../../../const/AttributeConst';
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { HeroUnitData } from '../../../data/HeroUnitData';
import { APP_DEVELOP_MODE } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import {TextHelper} from '../../../utils/TextHelper';
import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';


var BASE_ATTR = [
    AttributeConst.ATK,
    AttributeConst.HP,
    AttributeConst.PD,
    AttributeConst.MD,
    AttributeConst.ATK_PER,
    AttributeConst.HP_PER,
    AttributeConst.PD_PER,
    AttributeConst.MD_PER
];
var SENIOR_ATTR = [
    AttributeConst.CRIT,
    AttributeConst.NO_CRIT,
    AttributeConst.CRIT_HURT,
    AttributeConst.CRIT_HURT_RED,
    AttributeConst.HIT,
    AttributeConst.NO_HIT,
    AttributeConst.HURT,
    AttributeConst.HURT_RED,
    AttributeConst.HEAL_PER,
    AttributeConst.BE_HEALED_PER,
    AttributeConst.PVP_HURT,
    AttributeConst.PVP_HURT_RED
];
var CAMP_ATTR = [
    AttributeConst.BREAK_WEI,
    AttributeConst.BREAK_WU,
    AttributeConst.BREAK_SHU,
    AttributeConst.BREAK_QUN,
    AttributeConst.RESIST_WEI,
    AttributeConst.RESIST_WU,
    AttributeConst.RESIST_SHU,
    AttributeConst.RESIST_QUN
];

@ccclass
export default class PopupAttrDetail extends PopupBase {

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _nodeBg: CommonNormalMidPop = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel1: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle1: CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr2: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr3: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr4: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr5: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr6: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr7: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeBaseAttr8: CommonDesValue = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel2: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle2: CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr2: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr3: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr4: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr5: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr6: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr7: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr8: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr9: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr10: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr11: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeSeniorAttr12: CommonDesValue = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel3: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle3: CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr2: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr3: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr4: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr5: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr6: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr7: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeCampAttr8: CommonDesValue = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnDebug: cc.Button = null;

    private _heroUnitData: HeroUnitData;

    public setInitData(heroUnitData: HeroUnitData): void {
        this._heroUnitData = heroUnitData;
    }

    onCreate() {
        this._isClickOtherClose = true;
        this._btnDebug.node.active = (APP_DEVELOP_MODE);
        this._nodeBg.setTitle(Lang.get('team_attr_detail_title'));
        this._nodeBg.addCloseEventListener(handler(this, this._onButtonClose));
        this._nodeTitle1.setTitle(Lang.get('team_attr_detail_title_1'));
        this._nodeTitle2.setTitle(Lang.get('team_attr_detail_title_2'));
        this._nodeTitle3.setTitle(Lang.get('team_attr_detail_title_3'));
        for (var i = 1; i <= 8; i++) {
            (this['_nodeBaseAttr' + i] as CommonDesValue).setFontSize(20);
        }
        for (var i = 1; i <= 12; i++) {
            (this['_nodeSeniorAttr' + i] as CommonDesValue).setFontSize(20);
        }
        this._panel3.active = (false);

        this._panel1.y = this._listView.content.height - this._panel1.height;
        this._panel2.y = this._listView.content.height - this._panel2.height - this._panel1.height;
        this._listView.scrollToBottom();

    }
    onEnter() {
        this._updateView();
    }
    onExit() {
    }
    _updateView() {
        var param = {
            heroUnitData: this._heroUnitData,
            notAddPer: true
        };
        var attrInfo = HeroDataHelper.getTotalBaseAttr(param);
        AttrDataHelper.processDef(attrInfo);
        for (var i = 1;i<=8;i++) {
            var attrId = BASE_ATTR[i-1];
            var value = attrInfo[attrId] || 0;
            var ret = TextHelper.getAttrBasicText(attrId, value);
            var attrName = ret[0];
            var attrValue  =ret[1];
            attrName = TextHelper.expandTextByLen(attrName, 4);
            this['_nodeBaseAttr' + i].updateUI(attrName + '\uFF1A', attrValue);
        }
        for (var i = 1;i<=12;i++) {
            var attrId = SENIOR_ATTR[i-1];
            var value = attrInfo[attrId] || 0;
            var ret = TextHelper.getAttrBasicText(attrId, value);
            var attrName = ret[0];
            var attrValue = ret[1];
            attrName = TextHelper.expandTextByLen(attrName, 4);
            this['_nodeSeniorAttr' + i].updateUI(attrName + '\uFF1A', attrValue);
        }
    }
    _onButtonClose() {
        this.close();
    }
    onClickDebugButton() {
        // var popup = require('PopupAttrStatistics').new(this._heroUnitData);
        // popup.openWithAction();
    }





}