const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonResourceInfoList from '../../../ui/component/CommonResourceInfoList'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager, G_ConfigLoader, G_Prompt, Colors } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { DataConst } from '../../../const/DataConst';
import { FragmentData } from '../../../data/FragmentData';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import CommonCustomListView from '../../../ui/component/CommonCustomListView';
import { assert } from '../../../utils/GlobleFunc';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import PopupSellFragmentCell from './PopupSellFragmentCell';
import PopupSellSelect from './PopupSellSelect';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import PopupAlert from '../../../ui/PopupAlert';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class PopupSellFragment extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _selectNum: cc.Label = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _totalGet: CommonResourceInfoList = null;

    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _totalGet1: CommonResourceInfoList = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnSell: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnSelectType: CommonButtonLevel0Normal = null;

    @property(cc.Prefab)
    sellFragmentCell: cc.Prefab = null;

    @property(cc.Prefab)
    popupSellSelect: cc.Prefab = null;

    static HERO_FRAGMENT_SELL = 1;
    static EQUIPMENT_FRAGMENT_SELL = 2;
    static TREASURE_FRAGMENT_SELL = 3;
    static INSTRUMENT_FRAGMENT_SELL = 4;
    static GEMSTONE_SELL = 8;
    static PET_FRAGMENT_SELL = 10;
    static SILKBAG_SELL = 11;
    static HORSE_FRAGMENT_SELL = 13;
    static HORSE_EQUIP_FRAGMENT_SELL = 14;
    static ITEM_SEAL_SELL = 101;
    static JADESTONE_SELL = 102;

    private _sellType: number;
    private _data: any;
    private _signalSellObjects: any;
    private _signalSellOnlyObjects: any;


    static CHANGE_MODEL = {
        1: {
            selectQualitys: [
                3,
                4
            ],
            getData: function () {
                return G_UserData.getFragments().getFragListByType(PopupSellFragment.HERO_FRAGMENT_SELL, FragmentData.SORT_FUNC_HERO_FRAGMENT_SELL);
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_hero_title');
                data.recycleValue = DataConst.RES_SOUL;
            }
        },
        2: {
            selectQualitys: [
                3,
                4
            ],
            getData: function () {
                return G_UserData.getFragments().getFragListByType(PopupSellFragment.EQUIPMENT_FRAGMENT_SELL, FragmentData.SORT_FUNC_SELL);
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_equipment_title');
                data.recycleValue = DataConst.RES_JADE;
            }
        },
        3: {
            selectQualitys: [
                3,
                4
            ],
            getData: function () {
                return G_UserData.getFragments().getFragListByType(PopupSellFragment.TREASURE_FRAGMENT_SELL, FragmentData.SORT_FUNC_SELL);
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_treasure_title');
                data.recycleValue = DataConst.RES_BAOWUZHIHUN;
            }
        },
        4: {
            selectQualitys: [
                3,
                4
            ],
            getData: function () {
                return G_UserData.getFragments().getFragListByType(PopupSellFragment.INSTRUMENT_FRAGMENT_SELL, FragmentData.SORT_FUNC_SELL);
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_instrument_title');
                data.recycleValue = DataConst.RES_HONOR;
            }
        },
        8: {
            selectQualitys: [
                2,
                3
            ],
            getData: function () {
                var data = [];
                var isInsertGemstone = false;
                var gemstoneData = G_UserData.getGemstone().getGemstonesData(1);
                var gemstoneFragmentData = G_UserData.getFragments().getFragListByType(PopupSellFragment.GEMSTONE_SELL, FragmentData.SORT_FUNC_SELL);
                for (var k = 0; k < gemstoneFragmentData.length; k++) {
                    var gemstoneFragment = gemstoneFragmentData[k];
                    data.push(gemstoneFragment);
                }
                for (var i = 0; i < gemstoneData.length; i++) {
                    var gemstone = gemstoneData[i];
                    data.push(gemstone);
                }
                return data;
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_gemstone_title');
                data.recycleValue = DataConst.RES_SHENHUN;
            }
        },
        10: {
            selectQualitys: [
                3,
                4
            ],
            getData: function () {
                return G_UserData.getFragments().getFragListByType(PopupSellFragment.PET_FRAGMENT_SELL, FragmentData.SORT_FUNC_SELL);
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_pet_title');
                data.recycleValue = DataConst.RES_PET;
            }
        },
        11: {
            selectQualitys: [4],
            getData: function () {
                return G_UserData.getSilkbag().getListDataOfSell();
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_silkbag_title');
                data.recycleValue = DataConst.RES_DIAMOND;
            }
        },
        13: {
            selectQualitys: [
                3,
                4
            ],
            getData: function () {
                var data = G_UserData.getFragments().getFragListByType(TypeConvertHelper.TYPE_HORSE, FragmentData.SORT_FUNC_COMMON);
                return data;
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_horse_title');
                data.recycleValue = DataConst.RES_HORSE_SOUL;
            }
        },
        14: {
            selectQualitys: [4],
            getData: function () {
                var data = G_UserData.getFragments().getFragListByType(TypeConvertHelper.TYPE_HORSE_EQUIP, FragmentData.SORT_FUNC_COMMON);
                return data;
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_horse_equip_title');
                data.recycleValue = DataConst.RES_HORSE_SOUL;
            }
        },
        101: {
            selectQualitys: [
                3,
                4
            ],
            getData: function () {
                return G_UserData.getItems().getItemSellData();
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_office_seal_title');
                data.recycleValue = DataConst.RES_DIAMOND;
                data.recycleValue1 = DataConst.RES_GOLD;
                data.recycleSize1 = 0;
            }
        },
        102: {
            selectQualitys: [4],
            getData: function (data) {
                return G_UserData.getJade().getJadeListBySell();
            },
            getBaseData: function (data) {
                data.title = Lang.get('lang_sellfragment_jade_title');
                data.recycleValue = DataConst.RES_JADE_SOUL;
            }
        }
    }

    ctor(sellType) {
        this._sellType = sellType;
        if (!this._sellType) {
            this._sellType = PopupSellFragment.HERO_FRAGMENT_SELL;
        }
        this._data = this._getBaseDataBySellType();
    }
    onCreate() {
        this._commonNodeBk.setTitle(this._data.title);
        this._commonNodeBk.addCloseEventListener(handler(this, this.close));
        this._btnSelectType.setString(Lang.get('lang_sellfragment_btnselecttype_text'));
        this._btnSell.setString(Lang.get('lang_sellfragment_btnsell_text'));
        this._selectNum.string = (this._data.selectNum);
        this._totalGet.updateUI(this._data.recycleType, this._data.recycleValue, this._data.recycleSize);
        this._totalGet1.setVisible(this._sellType == PopupSellFragment.ITEM_SEAL_SELL);
        if (this._totalGet1.isVisible()) {
            this._totalGet1.updateUI(this._data.recycleType, this._data.recycleValue1, this._data.recycleSize1);
        }
        this._initSelectBtnState();
        this._initListView();
    }
    onEnter() {
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        this._signalSellOnlyObjects = G_SignalManager.add(SignalConst.EVENT_SELL_ONLY_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
    }
    onExit() {
        this._signalSellObjects.remove();
        this._signalSellObjects = null;
        this._signalSellOnlyObjects.remove();
        this._signalSellOnlyObjects = null;
    }
    _initListView() {
        // var count = Math.ceil(this._data.sellDatas.length / 2);
        // for(var i=0;i<count;i++){
        //     var item = cc.instantiate(this.sellFragmentCell);
        //     this._listView.pushBackCustomItem(item);
        //     var component = item.getComponent(PopupSellFragmentCell);
        //     component.initItem(i);
        //     this._onListViewItemUpdate(component,i);
        //     component.setCustomCallback(handler(this, this._onListViewItemTouch));
        // }

        this._listView.setTemplate(this.sellFragmentCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
        this._listView.resize(Math.ceil(this._data.sellDatas.length / 2));
    }
    _onListViewItemUpdate(item, index) {
        index = index * 2;
        item.updateUI(this._data.sellDatas[index], this._data.sellDatas[index + 1], this._data.selectIndexs[index] == true, this._data.selectIndexs[index + 1] == true);
    }
    _onListViewItemTouch(index, singleCellIndex) {
        var targetDataIndex = index * 2 + singleCellIndex - 1;
        var fragmentData = this._data.sellDatas[targetDataIndex];
      //assert((fragmentData, 'can not find fragmentData');
        var size = this._getRecycleSizeByData(fragmentData);
        var num = this._getUnitNum(fragmentData);
        var config = fragmentData.getConfig();
        size = size * num;
        if (this._data.selectIndexs[targetDataIndex]) {
            this._data.selectIndexs[targetDataIndex] = null;
            this._data.selectNum = this._data.selectNum - num;
            if (this._totalGet1.isVisible() && config.recycle_value == DataConst.RES_GOLD) {
                this._data.recycleSize1 = this._data.recycleSize1 || 0;
                this._data.recycleSize1 = this._data.recycleSize1 - size;
            } else {
                this._data.recycleSize = this._data.recycleSize - size;
            }
        } else {
            this._data.selectIndexs[targetDataIndex] = true;
            this._data.selectNum = this._data.selectNum + num;
            if (this._totalGet1.isVisible() && config.recycle_value == DataConst.RES_GOLD) {
                this._data.recycleSize1 = this._data.recycleSize1 || 0;
                this._data.recycleSize1 = this._data.recycleSize1 + size;
            } else {
                this._data.recycleSize = this._data.recycleSize + size;
            }
        }
        this._updateUIBySelectedChange();
    }

    _getRecycleSizeByData(data) {
        var tp = data.getType();
        var size = 0;
        var config = data.getConfig();
        if (tp == TypeConvertHelper.TYPE_GEMSTONE) {
            var fragmentId = config.fragment_id;
            var fragmentConfig = G_ConfigLoader.getConfig(ConfigNameConst.FRAGMENT).get(fragmentId);
          //assert((fragmentConfig != null, 'fragmentConfig == nil');
            size = fragmentConfig.recycle_size * fragmentConfig.fragment_num;
        } else {
            size = config.recycle_size;
        }
        return size;
    }
    _getData() {
        var data = PopupSellFragment.CHANGE_MODEL[this._sellType].getData();
        return data;
    }
    _getBaseDataBySellType() {
        var data = {};
        data['recycleType'] = 5;
        data['recycleSize'] = 0;
        data['sellDatas'] = this._getData();
        PopupSellFragment.CHANGE_MODEL[this._sellType].getBaseData(data);
        data['selectIndexs'] = {};
        data['selectNum'] = 0;
        return data;
    }
    onBtnSell() {
        var richTextConfig = null;
        if (this._sellType == PopupSellFragment.GEMSTONE_SELL) {
            this._gemStoneSellTips();
        } else if (this._sellType == PopupSellFragment.SILKBAG_SELL) {
            this._silkbagSellTips();
        } else {
            this._normalTips();
        }
    }
    onBtnSelectType() {
        var params = PopupSellFragment.CHANGE_MODEL[this._sellType].selectQualitys;
        var popupSellFragment = cc.instantiate(this.popupSellSelect);
        var component = popupSellFragment.getComponent(PopupSellSelect);
        component.ctor(params, handler(this, this._selectByType));
        component.openWithAction();
    }
    _reset() {
        this._data.selectIndexs = {};
        this._data.selectNum = 0;
        this._data.recycleSize = 0;
        this._data.recycleSize1 = 0;
        this._data.sellDatas = this._getData();
        this._listView.resize(Math.ceil(this._data.sellDatas.length / 2));
        this._updateUIBySelectedChange();
    }
    _onSellFragmentsSuccess(id, awards) {
        this._reset();
        if (this._data.sellDatas && this._data.sellDatas.length == 0) {
            this.close();
        }
        PopupGetRewards.showRewardsWithAutoMerge(awards);
    }
    _updateUIBySelectedChange() {
        this._totalGet.setCount(this._data.recycleSize);
        if (this._totalGet1.isVisible()) {
            this._totalGet1.setCount(this._data.recycleSize1 || 0);
        }
        this._selectNum.string = (this._data.selectNum);
    }
    _initSelectBtnState() {
        if (this._sellType == PopupSellFragment.ITEM_SEAL_SELL) {
            this.setSelectBtnVisible(false);
        } else {
            this.setSelectBtnVisible(true);
        }
    }
    setSelectBtnVisible(trueOrFalse) {
        this._btnSelectType.setVisible(trueOrFalse);
    }
    _getUnitNum(unitData) {
        if (this._sellType == PopupSellFragment.SILKBAG_SELL || this._sellType == PopupSellFragment.JADESTONE_SELL) {
            return 1;
        } else {
            return unitData.getNum();
        }
    }
    _selectByType(selectQualitys) {
        if (!(selectQualitys && selectQualitys.length > 0)) {
            return;
        }
        this._data.selectIndexs = {};
        this._data.selectNum = 0;
        this._data.recycleSize = 0;
        for (var k = 0; k < this._data.sellDatas.length; k++) {
            var v = this._data.sellDatas[k];
            var config = v.getConfig();
            var color = config.color;
            if (color <= selectQualitys.length && selectQualitys[color - 1]) {
                this._data.selectIndexs[k] = true;
                var size = this._getRecycleSizeByData(v);
                var num = this._getUnitNum(v);
                size = size * num;
                this._data.selectNum = this._data.selectNum + num;
                this._data.recycleSize = this._data.recycleSize + size;
            }
        }
        this._listView.resize(Math.ceil(this._data.sellDatas.length / 2));
        this._updateUIBySelectedChange();
    }
    _gemStoneSellTips() {
        if (this._data.selectNum <= 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_gemstone_notselected'));
            return;
        }
        var objects = [];
        var isHighQuality = false;
        var num1 = 0;
        var num2 = 0;
        for (var k in this._data.selectIndexs) {
            var v = this._data.selectIndexs[k];
            if(!v){
                continue;
            }
            var temp = this._data.sellDatas[k];
            var singleData = { num: 0, type: 0, id: 0 };
            var tp = temp.getType();
            singleData['type'] = tp;
            singleData['id'] = temp.getConfig().id;
            singleData['num'] = this._getUnitNum(temp);
            objects.push(singleData);
            if (!isHighQuality && temp.getConfig().color >= 5) {
                isHighQuality = true;
            }
            if (tp == TypeConvertHelper.TYPE_GEMSTONE) {
                num2 = num2 + singleData.num;
            } else {
                num1 = num1 + singleData.num;
            }
        }
        var itemParams = TypeConvertHelper.convert(this._data.recycleType, this._data.recycleValue);
        var tipsContent = '';
        if (num1 > 0 && num2 > 0) {
            tipsContent = Lang.get('lang_sellfragment_tips_content_gemstone_3', {
                num1: num1,
                num2: num2,
                size: this._data.recycleSize,
                name: itemParams.name
            });
        } else if (num1 > 0) {
            tipsContent = Lang.get('lang_sellfragment_tips_content_gemstone_1', {
                num1: num1,
                size: this._data.recycleSize,
                name: itemParams.name
            });
        } else if (num2 > 0) {
            tipsContent = Lang.get('lang_sellfragment_tips_content_gemstone_2', {
                num2: num2,
                size: this._data.recycleSize,
                name: itemParams.name
            });
        }
        if (isHighQuality) {
            tipsContent = ('%s|%s' as any).format(tipsContent, Lang.get('lang_sellfragment_tips_content_gemstone_highlight'));
            //tipsContent = string.format('%s|%s', tipsContent, Lang.get('lang_sellfragment_tips_content_gemstone_highlight'));
        }
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(Lang.get('lang_sellfragment_tips_title'), '', function () {
                G_UserData.c2sSellObjects(objects);
            });
            popup.addRichTextType2(tipsContent, Colors.BRIGHT_BG_TWO, 22);
            popup.openWithAction();
        });
    }
    _silkbagSellTips() {
        if (this._data.selectNum <= 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_silkbag_notselected'));
            return;
        }
        var objects = [];
        var isHighQuality = false;
        var num1 = 0;
        for (var k in this._data.selectIndexs) {
            var v = this._data.selectIndexs[k];
            if(!v){
                continue;
            }
            var temp = this._data.sellDatas[k];
            var singleData = { object_type: 0, object_id: 0 };
            var tp = temp.getType();
            singleData.object_type = tp;
            singleData.object_id = temp.getId();
            objects.push(singleData);
            if (!isHighQuality && temp.getConfig().color >= 5) {
                isHighQuality = true;
            }
            num1 = num1 + 1;
        }
        var itemParams = TypeConvertHelper.convert(this._data.recycleType, this._data.recycleValue);
        var tipsContent = Lang.get('lang_sellfragment_tips_content_silkbag', {
            num: num1,
            size: this._data.recycleSize,
            name: itemParams.name
        });
        if (isHighQuality) {
            tipsContent = ('%s|%s' as any).format(tipsContent, Lang.get('lang_sellfragment_tips_content_silkbag_highlight'));
        }
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(Lang.get('lang_sellfragment_tips_title'), '', function () {
                G_UserData.c2sSellOnlyObjects(objects);
            });
            popup.addRichTextType2(tipsContent, Colors.BRIGHT_BG_TWO, 22);
            popup.openWithAction();
        });
    }
    _normalTips() {
        if (this._data.selectNum <= 0) {
            G_Prompt.showTip(this._getNotSelectedTipsContent());
            return;
        }
        var objects = [];
        var isHighQuality = false;
        var num1 = 0;
        for (let k in this._data.selectIndexs) {
            var v = this._data.selectIndexs[k];
            if(!v){
                continue;
            }
            var temp = this._data.sellDatas[k];
            var singleData = { type: 0, id: 0, num: 0 };
            var tp = temp.getType();
            singleData.type = tp;
            if (this._sellType == PopupSellFragment.JADESTONE_SELL) {
                singleData.id = temp.getId();
            } else {
                singleData.id = temp.getConfig().id;
            }
            singleData.num = this._getUnitNum(temp);
            objects.push(singleData);
            if (!isHighQuality && temp.getConfig().color >= 5) {
                isHighQuality = true;
            }
            num1 = num1 + singleData.num;
        }
        var itemParams = TypeConvertHelper.convert(this._data.recycleType, this._data.recycleValue);
        var name1 = itemParams.name;
        var name2 = null;
        if (this._data.recycleValue1) {
            var itemParams2 = TypeConvertHelper.convert(this._data.recycleType, this._data.recycleValue1);
            name2 = itemParams2.name;
        }
        var tipsContent = this._getNormalTipsContent(num1, this._data.recycleSize, this._data.recycleSize1, name1, name2, isHighQuality);

        var tipsContent = this._getNormalTipsContent(num1, this._data.recycleSize, this._data.recycleSize1, name1, name2, isHighQuality);
        var sellType = this._sellType;
        UIPopupHelper.popupCommonView(PopupAlert, function (popup: PopupAlert) {
            popup.init(Lang.get('lang_sellfragment_tips_title'), '', function () {
                if (sellType == PopupSellFragment.JADESTONE_SELL) {
                    G_UserData.getJade().c2sJadeSell(objects);
                } else {
                    G_UserData.c2sSellObjects(objects);
                }
            });
            popup.addRichTextType2(tipsContent, Colors.BRIGHT_BG_TWO, 22);
            popup.openWithAction();
        });
    }
    _getNormalTipsContent(num, size, size1, name, name1, isHighQuality) {
        var str = '';
        if (this._sellType == PopupSellFragment.ITEM_SEAL_SELL) {
            str = Lang.get('lang_sellfragment_tips_content_item', {
                num: num,
                size: size,
                name: name
            });
            if (size1 && size1 > 0) {
                str = ('%s|%s' as any).format(str, Lang.get('lang_sellfragment_tips_content_item_gold', {
                    size: size1,
                    name: name1
                }));
            }
            if (isHighQuality) {
                str = ('%s|%s' as any).format(str, Lang.get('lang_sellfragment_tips_content_item_highlight'));
            }
        } else {
            var content = 'lang_sellfragment_tips_content_fragment';
            if (this._sellType == PopupSellFragment.JADESTONE_SELL) {
                content = 'lang_sellfragment_tips_content_Jade';
            }
            var content1 = 'lang_sellfragment_tips_content_fragment_highlight';
            if (this._sellType == PopupSellFragment.JADESTONE_SELL) {
                content1 = 'lang_sellfragment_tips_content_jade_highlight';
            }
            str = Lang.get(content, {
                num: num,
                size: size,
                name: name
            });
            if (isHighQuality) {
                str = ('%s|%s' as any).format(str, Lang.get(content1));
            }
        }
        return str;
    }
    _getNotSelectedTipsContent(): string {
        if (this._sellType == PopupSellFragment.ITEM_SEAL_SELL) {
            return Lang.get('lang_sellfragment_office_seal_notselected');
        } else if (this._sellType == PopupSellFragment.JADESTONE_SELL) {
            return Lang.get('lang_sellfragment_jade_notselected');
        } else {
            return Lang.get('lang_sellfragment_fragment_notselected');
        }
    }
}
