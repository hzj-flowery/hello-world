const { ccclass, property } = cc._decorator;

import CommonEquipProperty from '../../../ui/component/CommonEquipProperty'

import CommonButtonLevel5Highlight from '../../../ui/component/CommonButtonLevel5Highlight'

import CommonPageItem from '../../../ui/component/CommonPageItem'

import CommonEquipAvatar from '../../../ui/component/CommonEquipAvatar'

import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'
import PopupBase from '../../../ui/PopupBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Lang } from '../../../lang/Lang';
import { G_UserData } from '../../../init';
import { assert } from '../../../utils/GlobleFunc';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';

@ccclass
export default class PopupEquipDetail extends PopupBase {
    public static path = 'equipment/PopupEquipDetail';
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
        type: CommonEquipAvatar,
        visible: true
    })
    _fileNodeEquip: CommonEquipAvatar = null;

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
        type: CommonEquipProperty,
        visible: true
    })
    _detailWindow: CommonEquipProperty = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;
    _type: any;
    _value: any;
    _equipUnitData;
    _dataList: any;

    ctor(type, value) {
        this._type = type;
        this._value = value;
        this._updateUnitData(type, value);
    }
    initData(type, value) {
        this._type = type;
        this._value = value;
        this._updateUnitData(type, value);
    }
    start() {
        this._updateEquipInfo(this._value);
        this._fileNodeEquip.node.active = (true);
        this._fileNodeEquip.showShadow(false);
        this._scrollPage.node.active = (false);
        this._btnWayGet.addClickEventListenerEx(handler(this, this._onBtnWayGetClicked));

        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "PopupEquipDetail";// 这个是代码文件名
        clickEventHandler.handler = "_onBtnClose";
        this._buttonClose.clickEvents.push(clickEventHandler);

        this._btnWayGet.addClickEventListenerEx(handler(this, this._onBtnWayGetClicked));

    }
    _updateEquipQuilityName(equipBaseId) {
        var equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId);
        this._textPotential.string = (Lang.get('equipment_detail_txt_potential2', { value: equipParam.potential }));
        this._textPotential.node.color = (equipParam.icon_color);
        UIHelper.enableOutline(this._textPotential, equipParam.icon_color_outline, 2);
    }
    _onBtnWayGetClicked() {
        UIPopupHelper.popupItemGuiderByType(this._type, this._value)
    }
    _onBtnClose() {
        this.close();
    }
    _updateUnitData(type, value) {
        var convertData = TypeConvertHelper.convert(type, value);
        if (convertData == null) {
            return;
        }
        if (type == TypeConvertHelper.TYPE_EQUIPMENT) {
            var unitData = G_UserData.getEquipment().createTempEquipUnitData(value);
            this._equipUnitData = unitData;
        } else if (type == TypeConvertHelper.TYPE_FRAGMENT) {
            var heroId = convertData.cfg.comp_value;
            var unitData = G_UserData.getEquipment().createTempEquipUnitData(heroId);
            this._equipUnitData = unitData;
        }
        if (this._equipUnitData == null) {
          //assert((false, 'can\'t find equipment by id : ' + value);
        }
    }
    _updateEquipInfo(baseId) {
        this._value = baseId;
        this._updateUnitData(this._type, this._value);
        this._detailWindow.updateUI(this._equipUnitData);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_EQUIPMENT, this._equipUnitData.getBase_id());
        this._fileNodeEquip.updateUI(this._equipUnitData.getBase_id());
        this._updateEquipQuilityName(this._equipUnitData.getBase_id());
    }

    //使用了翻页功能
    setPageData(dataList, params?: any) {
        this._dataList = dataList;
        this._scrollPage.setCallBack(handler(this, this._updateItemAvatar));
        this._scrollPage.node.active = (true);
        this._fileNodeEquip.node.active = (false);
        var selectPos = 0;
        for (var i in this._dataList) {
            var data = this._dataList[i];
            if (data.cfg.id == this._value) {
                selectPos = parseFloat(i);
            }
        }
        this._scrollPage.setUserData(dataList, selectPos);
    }
    _updateItemAvatar(sender, widget, index, selectPos) {
        // var data = this._dataList[index];
        // if (data == null) {
        //     return;
        // }
        // var baseId = data.cfg.id;
        // var count = widget.getChildrenCount();
        // if (count == 0) {
        //     var CSHelper = require('CSHelper');
        //     var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonEquipAvatar', 'common'));
        //     avatar.updateUI(baseId);
        //     avatar.showShadow(false);
        //     avatar.setPosition(cc.v2(this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2));
        //     widget.addChild(avatar);
        // }
        // if (selectPos == index) {
        //     this._updateEquipInfo(baseId);
        // }
    }

}