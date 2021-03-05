import { AudioConst } from "../../../const/AudioConst";
import { Colors, G_AudioManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCheckBox from "../../../ui/component/CommonCheckBox";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonListCellBase from "../../../ui/component/CommonListCellBase";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckHeroTacticsCell extends ListViewCellBase {
    @property({
        type: cc.Node,
        visible: true
    }) _resourceNode: cc.Node = null;
    @property({
        type: CommonCheckBox,
        visible: true
    }) _checkBox1: CommonCheckBox = null;
    @property({
        type: CommonCheckBox,
        visible: true
    }) _checkBox2: CommonCheckBox = null;
    @property({
        type: CommonCheckBox,
        visible: true
    }) _checkBox3: CommonCheckBox = null;

    @property({
        type: CommonListCellBase,
        visible: true
    }) _item1: CommonListCellBase = null;

    @property({
        type: CommonListCellBase,
        visible: true
    }) _item2: CommonListCellBase = null;

    @property({
        type: CommonListCellBase,
        visible: true
    }) _item3: CommonListCellBase = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMark1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMark2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMark3: cc.Node = null;

    @property({
        type: CommonDesValue,
        visible: true
    }) _nodeDes1: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    }) _nodeDes2: CommonDesValue = null;

    @property({
        type: CommonDesValue,
        visible: true
    }) _nodeDes3: CommonDesValue = null;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        UIHelper.addClickEventListenerEx(this._checkBox1.node, handler(this, this._onCheckBoxClicked1));
        UIHelper.addClickEventListenerEx(this._checkBox2.node, handler(this, this._onCheckBoxClicked2));
        UIHelper.addClickEventListenerEx(this._checkBox3.node, handler(this, this._onCheckBoxClicked3));
    }
    updateCell(tacticsUnitData, dataList, isAddedList) {
        var self = this;
        function updateCell(index, data, isAdded) {
            index += 1;
            if (data) {
                self['_item' + index].setVisible(true);
                var heroBaseId = data.getBase_id();
                var limitLevel = data.getLimit_level();
                var limitRedLevel = data.getLimit_rtg();
                self['_item' + index].updateUI(TypeConvertHelper.TYPE_HERO, heroBaseId);
                var icon = self['_item' + index].getCommonIcon();
                icon.getIconTemplate().updateUI(heroBaseId, null, limitLevel, limitRedLevel);
                var params = icon.getItemParams();
                var rank = data.getRank_lv();
                var heroName = params.name;
                if (rank > 0) {
                    if (params.color == 7 && limitLevel == 0 && params.type != 1) {
                        heroName = heroName + (' ' + (Lang.get('goldenhero_train_text') + rank));
                    } else {
                        heroName = heroName + ('+' + rank);
                    }
                }
                if (!data.isPureGoldHero() && params.color == 7) {
                    self['_item' + index].setName(heroName, params.icon_color, params);
                } else {
                    self['_item' + index].setName(heroName, params.icon_color);
                }
                var num = tacticsUnitData.getStudyNumByHero(data.getBase_id());
                var isYoke = UserDataHelper.isShowYokeMark(data.getBase_id());
                self['_imageMark' + index].active = (isYoke);
                self['_item' + index].setTouchEnabled(true);
                var des = Lang.get('tactics_title_study');
                var value = Lang.get('tactics_title_study_add_desc2', { num: num / 10 });
                self['_nodeDes' + index].updateUI(des, value);
                self['_nodeDes' + index].setValueColor(Colors.TacticsBlueColor);
                self['_nodeDes' + index].setVisible(true);
                self['_checkBox' + index].setSelected(isAdded);
            } else {
                self['_item' + index].setVisible(false);
            }
        }
        for (var i = 0; i < 3; i++) {
            updateCell(i, dataList[i], isAddedList[i]);
        }
    }
    _onCheckBoxClicked1(sender) {
        var selected = this._checkBox1.isSelected();
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            this.dispatchCustomCallback(1, !selected, this);
        } else {
            this._checkBox1.setSelected(!selected);
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BUTTON);
    }
    _onCheckBoxClicked2(sender) {
        var selected = this._checkBox2.isSelected();
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            this.dispatchCustomCallback(2, !selected, this);
        } else {
            this._checkBox2.setSelected(!selected);
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BUTTON);
    }
    _onCheckBoxClicked3(sender) {
        var selected = this._checkBox3.isSelected();
        var offsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var offsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (offsetX < 20 && offsetY < 20) {
            this.dispatchCustomCallback(3, !selected, this);
        } else {
            this._checkBox3.setSelected(!selected);
        }
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BUTTON);
    }
    setCheckBoxSelected(t, selected) {
        this['_checkBox' + t].setSelected(selected);
        //this.dispatchCustomCallback(t, selected, this);
    }
    getSelectedState() {
        var list = [];
        for (var i = 1; i <= 3; i++) {
            var node = this['_checkBox' + i];
            var isSelected = node.isSelected();
            table.insert(list, isSelected);
        }
        return list;
    }
    getItem(index) {
        var item = this['_item' + index];
        var icon = null;
        if (item) {
            icon = item.getCommonIcon();
        }
        return icon;
    }
}