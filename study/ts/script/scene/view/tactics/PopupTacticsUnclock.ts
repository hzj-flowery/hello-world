import { DataConst } from "../../../const/DataConst";
import { HeroUnitData } from "../../../data/HeroUnitData";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_Prompt, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import PopupBase from "../../../ui/PopupBase";
import { TacticsDataHelper } from "../../../utils/data/TacticsDataHelper";
import { handler } from "../../../utils/handler";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupTacticsUnclock extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    }) _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: cc.Node,
        visible: true
    }) _txtUnlockTip: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    }) _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Node,
        visible: true
    }) _txtEmpty: cc.Node = null;

    @property({
        type: CommonDesValue,
        visible: true
    }) _fileNodeDes1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    }) _fileNodeDes2: CommonDesValue = null;


    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    }) _btnUnlock: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab) popupTacticsUnclockCell: cc.Prefab = null;

    private _parentView: any;
    private _selectList: {} = {};
    private _maxNum: number;
    private _clickOk: any;
    private _herosData: HeroUnitData[];
    private _cost: any;
    private _count: any;


    ctor(parentView) {
        this._parentView = parentView;
        this._commonNodeBk = null;
    }
    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('tactics_unlock_position'));
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        this._btnUnlock.setString(Lang.get('tactics_unlock_tip'));
        this._btnUnlock.addClickEventListenerEx(handler(this, this._onButtonUnlock))
        this._fileNodeDes2.updateUI(Lang.get('tactics_unlock_pos_click_tip'), '');
        this._fileNodeDes1.setValueColor(Colors.TacticsActiveColor);
        this._fileNodeDes1.setMaxColor(Colors.TacticsActiveColor);
        this._fileNodeDes1.setFontSize(20);
        this._fileNodeDes2.setFontSize(20);
        this._selectList = {};
        this._maxNum = 2;
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(pos, slot, clickOk) {
        this._clickOk = clickOk;
        var [needColor, needNum, needCost] = TacticsDataHelper.getTacticsPosUnlockParam(slot);
        this._herosData = G_UserData.getHero().getHeroByTacticsPosUnlock(slot);
        this._maxNum = needNum;
        this._cost = needCost;
        var colorTip = Lang.get('lang_sellfragmentselect_quality_' + needColor);
        var color = Colors.COLOR_QUALITY[needColor - 1];
        var colorStr = Colors.colorToHexStr(color);
        var outlineColor = Colors.COLOR_QUALITY_OUTLINE[needColor - 1];
        var outlineColorStr = Colors.colorToHexStr(outlineColor);
        var outlineSize = 0;
        if (needColor == 7) {
            outlineSize = 2;
            colorTip = ' ' + (colorTip + ' ');
        }
        var params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        var tipStr = Lang.get('tactics_unlock_pos_color', {
            num: needNum,
            colorTip: colorTip,
            colorStr: colorStr,
            outlineColorStr: outlineColorStr,
            outlineSize: outlineSize,
            imgPath: params.res_mini,
            costNum: needCost
        });
        var widget = RichTextExtend.createWithContent(tipStr);
        widget.node.setPosition(this._txtUnlockTip.getPosition());
        this._txtUnlockTip.active = (false);
        this._txtUnlockTip.getParent().addChild(widget.node);
        this._count = Math.ceil(this._herosData.length / 6);
        if (this._count == 0) {
            this._listView.node.active = (false);
            this._txtEmpty.active = (true);
        } else {
            this._listView.setTemplate(this.popupTacticsUnclockCell);
            this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
            this._listView.setCustomCallback(handler(this, this._onItemTouch));
            this._listView.resize(this._count);
            this._listView.node.active = (true);
            this._txtEmpty.active = (false);
        }
        this._updateInfo();
    }
    _onItemUpdate(item, index) {
        index = index * 6;
        var dataList = {};
        var isAddedList = {};
        if (!this._selectList) this._selectList = {};
        for (var i = 0; i < 6; i++) {
            if (this._herosData[index + i]) {
                var heroData = this._herosData[index + i];
                dataList[i] = heroData;
                isAddedList[i] = this._selectList[index + i] ?? false;
            }
        }
        item.updateUI(dataList, isAddedList);
    }
    _onItemSelected(item, index) {
    }
    getSelectedHeroNum() {
        var num = table.nums(this._selectList);
        return num;
    }
    _onItemTouch(index, t, selected, item) {
        if (selected && this.getSelectedHeroNum() >= this._maxNum) {
            G_Prompt.showTip(Lang.get('tactics_unlock_position_max_tip'));
            item.setSelectState(t, false);
            return;
        }
        var trueIndex = index * 6 + Number(t);
        var heroData = this._herosData[trueIndex - 1];
        if (selected) {
            this._selectList[trueIndex] = heroData;
        } else {
            this._selectList[trueIndex] = null;
        }
        item.setSelectState(t, selected);
        this._updateInfo();
    }
    _onButtonClose() {
        this.close();
    }
    _onButtonUnlock() {
        var num = 0;
        for (var k in this._selectList) {
            var v = this._selectList[k];
            num = num + 1;
        }
        if (num < this._maxNum) {
            return;
        }
        var [retValue, dlgFunc] = UserCheck.enoughJade2(this._cost);
        if (retValue == false) {
            (dlgFunc as Function)();
            return;
        }
        if (this._clickOk) {
            this._clickOk(this._selectList);
        }
        this.close();
    }
    _updateInfo() {
        var curNum = this.getSelectedHeroNum();
        this._fileNodeDes1.updateUI(Lang.get('tactics_unlock_position_select_tip'), curNum, this._maxNum);
        if (curNum < this._maxNum) {
            this._fileNodeDes1.setValueColor(Colors.TacticsCommonColor);
            this._fileNodeDes1.setMaxColor(Colors.TacticsCommonColor);
            this._btnUnlock.setEnabled(false);
        } else {
            this._fileNodeDes1.setValueColor(Colors.BRIGHT_BG_GREEN);
            this._fileNodeDes1.setMaxColor(Colors.TacticsCommonColor);
            this._btnUnlock.setEnabled(true);
        }
    }
}