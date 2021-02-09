import { Colors, G_UserData } from "../../init";
import { Lang } from "../../lang/Lang";
import { TacticsDataHelper } from "../../utils/data/TacticsDataHelper";
import { handler } from "../../utils/handler";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import CommonButtonSwitchLevel1 from "../component/CommonButtonSwitchLevel1";
import CommonListCellBase from "../component/CommonListCellBase";
import CommonTacticsIcon from "../component/CommonTacticsIcon";
import ListViewCellBase from "../ListViewCellBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupChooseTacticsCell extends ListViewCellBase {
    @property({
        type: cc.Node,
        visible: true
    }) _resourceNode: cc.Node = null;
    private _pos: any;
    private _slot: any;
    private _dataList: any;

    @property({
        type: CommonListCellBase,
        visible: true
    }) _item1: CommonListCellBase = null;

    @property({
        type: CommonTacticsIcon,
        visible: true
    }) _fileIcon1: CommonTacticsIcon = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName1: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgTip1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtTip1: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    }) _buttonChoose1: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonListCellBase,
        visible: true
    }) _item2: CommonListCellBase = null;

    @property({
        type: CommonTacticsIcon,
        visible: true
    }) _fileIcon2: CommonTacticsIcon = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName2: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgTip2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtTip2: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    }) _buttonChoose2: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonListCellBase,
        visible: true
    }) _item3: CommonListCellBase = null;

    @property({
        type: CommonTacticsIcon,
        visible: true
    }) _fileIcon3: CommonTacticsIcon = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName3: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgTip3: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtTip3: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    }) _buttonChoose3: CommonButtonSwitchLevel1 = null;

    ctor() {
    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(pos, slot, dataList, notSlot) {
        this._pos = pos;
        this._slot = slot;
        this._dataList = dataList;
        var self = this;
        function updateCell(index, id) {
            if (id) {
                var data = G_UserData.getTactics().getUnitDataWithId(id);
                self['_item' + index].setVisible(true);
                var baseId = data.getBase_id();
                self['_item' + index].updateUI(TypeConvertHelper.TYPE_TACTICS, baseId);
                self['_item' + index].getCommonIcon().node.active = (false);
                self['_fileIcon' + index].updateUI(baseId);
                var heroId = data.getHero_id();
                if (heroId > 0) {
                    var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                    var heroBaseId = heroUnitData.getBase_id();
                    var limitLevel = heroUnitData.getLimit_level();
                    var limitRedLevel = heroUnitData.getLimit_rtg();
                    var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, null, null, limitLevel, limitRedLevel);
                    if (heroUnitData.isLeader()) {
                        self['_textHeroName' + index].string = (Lang.get('main_role'));
                    } else {
                        self['_textHeroName' + index].string = (heroParam.name);
                    }
                    self['_textHeroName' + index].node.color = (heroParam.icon_color);
                    self['_textHeroName' + index].node.active = (true);
                    UIHelper.updateTextOutline(self['_textHeroName' + index], heroParam);
                } else {
                    self['_textHeroName' + index].node.active = (false);
                }
                var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
                var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
                var isEffect = G_UserData.getTactics().isSuitTacticsToHero(baseId, heroBaseId);
                var isEffective = TacticsDataHelper.isEffectiveTacticsToHero(data.getBase_id(), pos);
                if (isEffect && isEffective) {
                    self['_imgTip' + index].node.active = (false);
                    self['_txtTip' + index].node.active = (false);
                } else {
                    self['_imgTip' + index].node.active = (true);
                    self['_txtTip' + index].node.active = (true);
                    self['_txtTip' + index].string = (Lang.get('tactics_suit_not'));
                    self['_txtTip' + index].node.color = (Colors.RED);
                }
                self._updateButton(index);
            } else {
                self['_item' + index].setVisible(false);
            }
        }
        for (var i = 1; i <= 3; i++) {
            updateCell(i, dataList[i]);
        }
    }
    _updateButton(index) {
        var pos = this._pos;
        var slot = this._slot;
        var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
        var id = this._dataList[index];
        var unitData = G_UserData.getTactics().getUnitDataWithId(id);
        if (unitData.getHero_id() == 0) {
            this['_buttonChoose' + index].setString(Lang.get('tactics_choose_puton'));
            this['_buttonChoose' + index].switchToNormal();
        } else if (unitData.getHero_id() == heroId) {
            this['_buttonChoose' + index].setString(Lang.get('tactics_choose_unload'));
            this['_buttonChoose' + index].switchToHightLight();
        } else {
            this['_buttonChoose' + index].setString(Lang.get('equipment_btn_grab'));
            this['_buttonChoose' + index].switchToNormal();
        }
        this['_buttonChoose' + index].addClickEventListenerEx(handler(this, this['_onButtonClicked' + index]))
    }
    _onButtonClicked1() {
        this.dispatchCustomCallback(1);
    }
    _onButtonClicked2() {
        this.dispatchCustomCallback(2);
    }
    _onButtonClicked3() {
        this.dispatchCustomCallback(3);
    }
}