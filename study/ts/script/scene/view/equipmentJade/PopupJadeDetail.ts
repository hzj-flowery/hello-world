const { ccclass, property } = cc._decorator;

import CommonJadeProperty from '../../../ui/component/CommonJadeProperty'

import CommonButtonLevel5Highlight from '../../../ui/component/CommonButtonLevel5Highlight'

import CommonPageItem from '../../../ui/component/CommonPageItem'

import CommonJadeAvatar from '../../../ui/component/CommonJadeAvatar'

import CommonHeroCountryFlag from '../../../ui/component/CommonHeroCountryFlag'
import PopupBase from '../../../ui/PopupBase';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Lang } from '../../../lang/Lang';
import { G_ConfigLoader } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { handler } from '../../../utils/handler';

@ccclass
export default class PopupJadeDetail extends PopupBase {
    public static path = 'equipment/PopupJadeDetail';
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
        type: CommonJadeAvatar,
        visible: true
    })
    _fileNodeJade: CommonJadeAvatar = null;

    @property({
        type: CommonPageItem,
        visible: true
    })
    _scrollPage: CommonPageItem = null;

    @property({
        type: CommonButtonLevel5Highlight,
        visible: true
    })
    _btnWayGet: CommonButtonLevel5Highlight = null;

    @property({
        type: CommonJadeProperty,
        visible: true
    })
    _detailWindow: CommonJadeProperty = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;
    _type: any;
    _value: any;
    _jadeConfig: any;

    ctor(type, value) {
        this._type = type;
        this._value = value;
        this._updateUnitData(type, value);
        this._btnWayGet.addClickEventListenerEx(handler(this, this._onBtnWayGetClicked));
    }
    start() {
        this._updateJadeInfo(this._value);
        this._fileNodeJade.node.active = (true);
        //  this._scrollPage.node.active = (false);
    }
    onEnter() {
    }
    onExit() {
    }
    _onBtnWayGetClicked() {
        UIPopupHelper.popupItemGuiderByType(this._type, this._value, Lang.get("way_type_get"))
    }
    onBtnClose() {
        this.close();
    }
    _updateUnitData(type, value) {
        var convertData = TypeConvertHelper.convert(type, value);
        if (convertData == null) {
            return;
        }
        this._jadeConfig = G_ConfigLoader.getConfig(ConfigNameConst.JADE).get(value);
    }
    _updateJadeInfo(baseId) {
        this._value = baseId;
        this._jadeConfig = G_ConfigLoader.getConfig(ConfigNameConst.JADE).get(baseId);
        this._updateUnitData(this._type, this._value);
        this._detailWindow.updateUI(this._jadeConfig);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeCountryFlag.updateUI(TypeConvertHelper.TYPE_JADE_STONE, baseId);
        this._fileNodeJade.updateUI(baseId);
        var strPower = '+' + this._jadeConfig.fake;
        this._textPower.string = (strPower);
    }
    // setPageData(dataList, params) {
    //     this._dataList = dataList;
    //     this._scrollPage.setCallBack(handler(this, this._updateJadeItem));
    //     this._scrollPage.node.active = (true);
    //     this._fileNodeJade.node.active = (false);
    //     var selectPos = 0;
    //     for (i in this._dataList) {
    //         var data = this._dataList[i];
    //         if (data.cfg.id == this._value) {
    //             selectPos = i;
    //         }
    //     }
    //     this._scrollPage.setUserData(dataList, selectPos);
    // }
    // _updateJadeItem(sender, widget, index, selectPos) {
    //     var data = this._dataList[index];
    //     if (data == null) {
    //         return;
    //     }
    //     var baseId = data.cfg.id;
    //     var count = widget.getChildrenCount();
    //     if (count == 0) {
    //         var CSHelper = require('CSHelper');
    //         var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonJadeAvatar', 'common'));
    //         avatar.updateUI(baseId);
    //         avatar.setPosition(cc.v2(this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2));
    //         widget.addChild(avatar);
    //     }
    //     if (selectPos == index) {
    //         this._updateJadeInfo(baseId);
    //     }
    // }

}