const { ccclass, property } = cc._decorator;

import CommonButtonLevel5Normal from '../../../ui/component/CommonButtonLevel5Normal'

import CommonPageItemSilkbag from '../../../ui/component/CommonPageItemSilkbag'

import CommonSilkbagAvatar from '../../../ui/component/CommonSilkbagAvatar'

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import CommonListView from '../../../ui/component/CommonListView';
import { Lang } from '../../../lang/Lang';
import SilkbagDetailExCell from './SilkbagDetailExCell';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { SilkbagDataHelper } from '../../../utils/data/SilkbagDataHelper';
import { Path } from '../../../utils/Path';
import { SilkbagConst } from '../../../const/SilkbagConst';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';

var Color2Res = {
    4: 'img_bg_silkbag_01',
    5: 'img_bg_silkbag_02',
    6: 'img_bg_silkbag_03',
    7: 'img_bg_silkbag_04'
};

@ccclass
export default class PopupSilkbagDetailEx extends PopupBase {
    public static path = 'silkbag/PopupSilkbagDetailEx';
    @property({
        type: cc.Node,
        visible: true
    })
    _panelRoot: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeList: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _fileNodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEmpty: cc.Node = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageWaterFlow: CommonEmptyListNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textEmptyTip: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageColorBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;

    @property({
        type: CommonSilkbagAvatar,
        visible: true
    })
    _fileNodeSilkbag: CommonSilkbagAvatar = null;

    @property({
        type: CommonPageItemSilkbag,
        visible: true
    })
    _scrollPage: CommonPageItemSilkbag = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBtnBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;

    @property({
        type: CommonButtonLevel5Normal,
        visible: true
    })
    _btnWayGet: CommonButtonLevel5Normal = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;
    _type: any;
    _value: any;
    _silkId: number;
    _heroBaseIds;
    _callBack: any;

    ctor(type, value) {
        this._type = type;
        this._value = value;
    }
    onCreate() {
        this._silkId = 0;
        this._heroBaseIds = {};
        this._fileNodeSilkbag.node.active = (true);
        this._scrollPage.node.active = (false);
        this._btnWayGet.setString(Lang.get('way_type_goto_get'));
        this._fileNodeTitle.setTitle(Lang.get('silkbag_suit_hero_title'));
        this._btnWayGet.addClickEventListenerEx(handler(this, this._onButtonWayGetClicked));

    }
    onEnter() {
        this._listView.init(null, handler(this, this._onItemUpdate));
        // if (G_ConfigManager.isDalanVersion()) {
        //     this._nodeEmpty.getChildByName('ImageWaterFlow')..active = (false);
        // }
        this._updateUI(this._value);
    }
    onExit() {
        if (this._callBack) {
            this._callBack();
        }
    }
    setCloseCallBack(callback) {
        this._callBack = callback;
        G_SignalManager.dispatch(SignalConst.EVENT_SEASONSPORT_OPENSILKDETAIL);
    }
    _updateUI(baseId) {
        this._value = baseId;
        var silkbagBaseId = this._value;
        this._silkId = SilkbagDataHelper.getSilkbagConfig(silkbagBaseId).mapping;
        var info = SilkbagDataHelper.getSilkbagConfig(silkbagBaseId);
        var strPower = '+' + info.fake;
        var colorBgRes = Color2Res[info.color];
        this._textPower.string = (strPower);
        if (colorBgRes) {
            UIHelper.loadTexture(this._imageColorBg, Path.getBackground(colorBgRes));
        }
        this._fileNodeSilkbag.updateUI(silkbagBaseId);
        this._textDes.string = (info.description);
        this._updateListView(silkbagBaseId);
    }
    _updateListView(silkbagBaseId) {
        var [heroBaseIds,suitType] = G_UserData.getSilkbag().getHeroIdsWithSilkbagId(silkbagBaseId);
        if (suitType == SilkbagConst.SUIT_TYPE_NONE) {
            this._nodeEmpty.active = (false);
            this._nodeList.active = (true);
            this._heroBaseIds = this._filterHeroIds(heroBaseIds);
            this._listView.setData(this._heroBaseIds.length);
        } else {
            this._nodeEmpty.active = (true);
            this._nodeList.active = (false);
            if (suitType == SilkbagConst.SUIT_TYPE_ALL) {
                this._textEmptyTip.string = (Lang.get('silkbag_suit_tip_all'));
            } else if (suitType == SilkbagConst.SUIT_TYPE_MALE) {
                this._textEmptyTip.string = (Lang.get('silkbag_suit_tip_male'));
            } else if (suitType == SilkbagConst.SUIT_TYPE_FEMALE) {
                this._textEmptyTip.string = (Lang.get('silkbag_suit_tip_female'));
            }
        }
    }
    _filterHeroIds(heroBaseIds) {
        var isLeaderExist = false;
        var temp = [];
        var result = [];
        function sortFunc(a, b) {
            if (a.type != b.type) {
                return a.type - b.type;
            } else if (a.color != b.color) {
                return b.color - a.color;
            } else {
                return a.id - b.id;
            }
        }
        var gender = G_UserData.getBase().isMale() ? 1 : 2;
        for (var i in heroBaseIds) {
            var heroBaseId = heroBaseIds[i];
            var info = HeroDataHelper.getHeroConfig(heroBaseId);
            if (info.type == 1) {
                if (info.gender == gender && !isLeaderExist) {
                    temp.push(info);
                    isLeaderExist = true;
                }
            } else {
                temp.push(info);
            }
        }
        temp.sort(sortFunc);
        for (i in temp) {
            var data = temp[i];
            result.push(data.id);
        }
        return result;
    }
    _onItemUpdate(item, index, type) {
        var index = index;
        var heroBaseId = this._heroBaseIds[index];
        if (heroBaseId) {
            item.updateItem(index, [this._silkId, heroBaseId], type);
        }else {
            item.updateItem(index, null, type);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
    }
    _onButtonWayGetClicked() {
        UIPopupHelper.popupItemGuiderByType(TypeConvertHelper.TYPE_SILKBAG, this._value, Lang.get("way_type_get"))
    }
    onButtonClose() {
        this.close();
    }
    setPageData(dataList, params) {
        // this._dataList = dataList;
        // this._scrollPage.setCallBack(handler(this, this._updateItemAvatar));
        // this._scrollPage.node.active = (true);
        // this._fileNodeSilkbag.node.active = (false);
        // var selectPos = 0;
        // for (i in this._dataList) {
        //     var data = this._dataList[i];
        //     if (data.cfg.id == this._value) {
        //         selectPos = i;
        //     }
        // }
        // this._scrollPage.setUserData(dataList, selectPos);
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
        //     var avatar = CSHelper.loadResourceNode(Path.getCSB('CommonSilkbagAvatar', 'common'));
        //     avatar.updateUI(baseId);
        //     avatar.setPosition(cc.v2(this._scrollPage.getPageSize().width / 2, this._scrollPage.getPageSize().height / 2));
        //     widget.addChild(avatar);
        // }
        // if (selectPos == index) {
        //     this._updateUI(baseId);
        // }
    }
    updateInSeasonSilkView() {
        this._btnWayGet.node.active = (false);
        this._panelRoot.setScale(0.9);
    }

}