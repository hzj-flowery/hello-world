const { ccclass, property } = cc._decorator;

import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel5Highlight from '../../../ui/component/CommonButtonLevel5Highlight';
import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag';
import CommonPageItem from '../../../ui/component/CommonPageItem';
import CommonTreasureAvatar from '../../../ui/component/CommonTreasureAvatar';
import CommonTreasureProperty from '../../../ui/component/CommonTreasureProperty';
import PopupBase from '../../../ui/PopupBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';





@ccclass
export default class PopupTreasureDetail extends PopupBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: CommonHeroCountryFlag,
        visible: true
    })
    _fileNodeCountryFlag: CommonHeroCountryFlag = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroStage: cc.Node = null;

    @property({
        type: CommonTreasureAvatar,
        visible: true
    })
    _fileNodeEquip: CommonTreasureAvatar = null;

    @property({
        type: CommonPageItem,
        visible: true
    })
    _scrollPage: CommonPageItem = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPotential: cc.Label = null;

    @property({
        type: CommonButtonLevel5Highlight,
        visible: true
    })
    _btnWayGet: CommonButtonLevel5Highlight = null;

    @property({
        type: CommonTreasureProperty,
        visible: true
    })
    _detailWindow: CommonTreasureProperty = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    _isSelf: boolean;
    _treasureUnitData: any;
    _dataList: any;
    _value: any;
    _type: any;

    onCreate() {
        this._btnWayGet.addClickEventListenerEx(handler(this, this._onBtnWayGetClicked));

        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "PopupTreasureDetail";// 这个是代码文件名
        clickEventHandler.handler = "_onBtnClose";
        this._buttonClose.clickEvents.push(clickEventHandler);

        this._updateInfo(this._value);
        this._fileNodeEquip.node.active = (true);
        this._fileNodeEquip.showShadow(false);
        this._scrollPage.node.active = (false);
    }

    initData(type, value, isSelf?) {
        this._type = type;
        this._value = value;
        this._isSelf = isSelf;
        this._updateUnitData(type, value);
    }

    onEnter() {
    }
    onExit() {
    }
    _updateEquipQuilityName(treasureBaseId) {
        var treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId);
        this._textPotential.string = (Lang.get('treasure_detail_txt_potential', { value: treasureParam.potential }));
        this._textPotential.node.color = (treasureParam.icon_color);
        UIHelper.enableOutline(this._textPotential, treasureParam.icon_color_outline, 2);
        // this._textPotential.enableOutline(treasureParam.icon_color_outline, 2);
    }
    _onBtnWayGetClicked() {
        var data: Array<string> = [];
        data.push("prefab/common/PopupItemGuider");
        cc.resources.load(data,cc.Prefab,handler(this, (err,res) => {
            var resource = cc.resources.get("prefab/common/PopupItemGuider",cc.Prefab);
            var node1 = cc.instantiate(resource) as cc.Node;
            let cell = node1.getComponent(PopupItemGuider) as PopupItemGuider;
            cell.setTitle(Lang.get('way_type_get'));
            cell.updateUI(this._type, this._value);
            cell.openWithAction();
        }));
    }
    _onBtnClose() {
        this.close();
    }
    _updateUnitData(type, value) {
        var convertData = TypeConvertHelper.convert(type, value);
        if (convertData == null) {
            return;
        }
        var unitData;
        if (type == TypeConvertHelper.TYPE_TREASURE && this._isSelf) {
            unitData = G_UserData.getTreasure().getTreasureDataWithId(value);
            this._treasureUnitData = unitData;
        } else if (type == TypeConvertHelper.TYPE_TREASURE) {
            unitData = G_UserData.getTreasure().createTempTreasureUnitData(value);
            this._treasureUnitData = unitData;
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            var baseId = convertData.cfg.comp_value;
            unitData = G_UserData.getTreasure().createTempTreasureUnitData(baseId);
            this._treasureUnitData = unitData;
        }
        if (this._treasureUnitData == null) {
          //assert((false, 'can\'t find treasure by id : ' + value);
        }
    }
    _updateInfo(baseId) {
        this._value = baseId;
        this._updateUnitData(this._type, this._value);
        this._detailWindow.updateUI(this._treasureUnitData);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_TREASURE, this._treasureUnitData.getBase_id());
        this._fileNodeEquip.updateUI(this._treasureUnitData.getBase_id());
        this._updateEquipQuilityName(this._treasureUnitData.getBase_id());
    }
    setPageData(dataList, params?: any) {
        this._dataList = dataList;
        this._scrollPage.setCallBack(handler(this, this._updateItemAvatar));
        this._scrollPage.node.active = (true);
        this._fileNodeEquip.node.active = (false);
        var selectPos = 0;
        for (let i = 0; i < this._dataList.length; i++) {
            var data = this._dataList[i];
            if (data.cfg.id == this._value) {
                selectPos = i;
            }
        }
        this._scrollPage.setUserData(dataList, selectPos);
    }
    _updateItemAvatar(sender, widget, index, selectPos) {
        var data = this._dataList[index];
        if (data == null) {
            return;
        }
        var baseId = data.cfg.id;
        var count = widget.getChildrenCount();
        if (count == 0) {
            var data1: Array<string> = [];
            data1.push("prefab/common/CommonTreasureAvatar");
            cc.resources.load(data1,cc.Prefab,handler(this, (err,res) => {
                var resource = cc.resources.get("prefab/drawCard/CommonTreasureAvatar",cc.Prefab);
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(CommonTreasureAvatar) as CommonTreasureAvatar;
                cell.updateUI(baseId);
                cell.showShadow(false);
                cell.node.setPosition(cc.v2(this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2));
                widget.addChild(cell);
            }));
        }
        if (selectPos == index) {
            this._updateInfo(baseId);
        }
    }
}