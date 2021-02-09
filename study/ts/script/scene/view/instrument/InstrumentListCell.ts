import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import CommonListItem from "../../../ui/component/CommonListItem";
import { handler } from "../../../utils/handler";
import { G_UserData, Colors, G_SceneManager } from "../../../init";
import CommonListCellBase from "../../../ui/component/CommonListCellBase";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import AttributeConst from "../../../const/AttributeConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { InstrumentDataHelper } from "../../../utils/data/InstrumentDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import UIHelper from "../../../utils/UIHelper";
import InstrumentConst from "../../../const/InstrumentConst";
import ListViewCellBase from "../../../ui/ListViewCellBase";
const { ccclass, property } = cc._decorator;

@ccclass
export default class InstrumentListCell extends ListViewCellBase{
    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode:cc.Node = null;
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonAdvance1:CommonButtonLevel1Highlight = null;
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonAdvance2:CommonButtonLevel1Highlight = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item1: CommonListCellBase = null;

    @property({
        type: CommonListCellBase,
        visible: true
    })
    _item2: CommonListCellBase = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRank1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRank2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHeroName2: cc.Label = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr1_1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr1_2: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeAttr2_2: CommonDesValue = null;

    private _instrumentId1:number = 0;
    private _instrumentId2:number = 0;

    onLoad() {
        this.onCreate();
    }
    start(){
        this.onEnter();
    }

    onInit(){
        if(this._resourceNode){
            this.node.setContentSize(this._resourceNode.getContentSize());
        }
        this._buttonAdvance1.setString(Lang.get('instrument_btn_train'));
        this._buttonAdvance2.setString(Lang.get('instrument_btn_train'));

        this._buttonAdvance1.addClickEventListenerEx(handler(this, this._onButtonAdvanceClicked1));
        this._buttonAdvance2.addClickEventListenerEx(handler(this, this._onButtonAdvanceClicked2));
    }
    onEnter(){

    }
    onExit(){

    }
    _onButtonAdvanceClicked1() {
        this.dispatchCustomCallback(1);
    }
    _onButtonAdvanceClicked2(){
        this.dispatchCustomCallback(2);
    }
    updateUI(index, itemList) {
        for (var i = 1; i <= 2; i++) {
            var item = this['_item' + i];
            item.node.active = (false);
        }
        for (var j in itemList) {
            var id = itemList[j];
            this.updateCell(parseFloat(j) + 1, id);
        }
    }
    updateCell(index, instrumentId) {
        if (instrumentId) {
            if (typeof(instrumentId) != 'number') {
                return;
            }
            this['_instrumentId'+index] = instrumentId;
            this['_item' + index].node.active = true;
            var data = G_UserData.getInstrument().getInstrumentDataWithId(instrumentId);
            var baseId = data.getBase_id();
            var level = data.getLevel();
            var limitLevel = data.getLimit_level();
            this['_item' + index].updateUI(TypeConvertHelper.TYPE_INSTRUMENT, baseId);
            this['_item' + index].getCommonIcon().getIconTemplate().updateUI(baseId, null, limitLevel);
            this['_item' + index].setTouchEnabled(true);
            this['_item' + index].setCallBack(handler(this, this['_onClickIcon' + index]));
            var params = this['_item' + index].getCommonIcon().getItemParams();
            this['_item' + index].setName(params.name, params.icon_color, params);
            this['_textRank' + index].string = ('+' + level);
            this['_textRank' + index].node.active = (level > 0);
            this._showAttrDes(index, data);
            var heroUnitData = UserDataHelper.getHeroDataWithInstrumentId(data.getId());
            if (heroUnitData) {
                var baseId = heroUnitData.getBase_id();
                var limitLevel = heroUnitData.getLimit_level();
                var limitRedLevel = heroUnitData.getLimit_rtg();
                var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, null, null, limitLevel, limitRedLevel);
                this['_textHeroName' + index].string = (heroParam.name);
                this['_textHeroName' + index].node.color = (heroParam.icon_color);
                UIHelper.updateTextOutline(this['_textHeroName' + index], heroParam);
                this['_textHeroName' + index].node.active = true;
            } else {
                this['_textHeroName' + index].node.active = false;
            }
        } else {
            this['_item' + index].node.active = false;
        }
    }
    _showAttrDes(index, data) {
        var showAttrIds = [
            AttributeConst.ATK,
            AttributeConst.HP
        ];
        var info = InstrumentDataHelper.getInstrumentAttrInfo(data);
        for (var i = 1; i<=2; i++) {
            var attrId = showAttrIds[i-1];
            var value = info[attrId];
            if (value) {
                var attrText = TextHelper.getAttrBasicText(attrId, value);
                var attrName = TextHelper.expandTextByLen(attrText[0], 4);//attrText[0];
                var attrValue = attrText[1];
                this['_nodeAttr' + (index + ('_' + i))].updateUI(attrName, '+' + attrValue);
                this['_nodeAttr' + (index + ('_' + i))].setValueColor(Colors.BRIGHT_BG_GREEN);
                this['_nodeAttr' + (index + ('_' + i))].node.active = true;
            } else {
                this['_nodeAttr' + (index + ('_' + i))].node.active = false;
            }
        }
    }
    _onClickIcon1(sender, itemParams) {
        var instrumentId = this._instrumentId1;
        G_SceneManager.showScene('instrumentDetail', instrumentId, InstrumentConst.INSTRUMENT_RANGE_TYPE_1);
    }
    _onClickIcon2(sender, itemParams) {
        var instrumentId = this._instrumentId2;
        G_SceneManager.showScene('instrumentDetail', instrumentId, InstrumentConst.INSTRUMENT_RANGE_TYPE_1);
    }
}
