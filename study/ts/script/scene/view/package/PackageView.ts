const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical'


import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import CommonListView from '../../../ui/component/CommonListView';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import { handler } from '../../../utils/handler';
import { PackageViewConst } from '../../../const/PackageViewConst';
import CommonListItem from '../../../ui/component/CommonListItem';
import { G_SignalManager, G_UserData, G_Prompt, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { ItemsData } from '../../../data/ItemsData';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { PackageHelper } from './PackageHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { FragmentData } from '../../../data/FragmentData';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { JadeStoneData } from '../../../data/JadeStoneData';
import { assert } from '../../../utils/GlobleFunc';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { FunctionConst } from '../../../const/FunctionConst';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { stringUtil } from '../../../utils/StringUtil';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import PopupSellFragment from '../sell/PopupSellFragment';
import ViewBase from '../../ViewBase';
import { HistoryHeroDataHelper } from '../../../utils/data/HistoryHeroDataHelper';

@ccclass
export default class PackageView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;


    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSale: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _saleImage: cc.Sprite = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _tabGroup2: CommonTabGroup = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    PackageItemCell: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    PackageGemstoneCell: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    PackageSilkbagCell: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    PackageJadeCell: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    PackageHistoryHeroCell: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    PackageHistoryHeroFragmentCell: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    PackageHistoryHeroWeaponCell: cc.Prefab = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageListBg: cc.Sprite = null;



    _tabFuncIndex;
    _textList;
    _curSelectData;
    _subTabIndex;

    _merageItemMsg;
    _updateItemMsg;
    _deleteItemMsg;
    _intertItemMsg;
    _signalSellObjects;
    _signalSellOnlyObjects;

    onCreate() {
        this.setSceneSize();
        var ret = PackageHelper.getPackageTabList();
        this._textList = ret[0];
        this._subTabIndex = 0;
        this._topbarBase.node.x = (1136 - G_ResolutionManager.getDesignWidth()) / 2;
        // this._initImageListBg();
    }

    _initImageListBg() {
        var show = this._tabFuncIndex == PackageViewConst.TAB_HISTORYHERO || this._tabFuncIndex == PackageViewConst.TAB_HISTORYHERO_WEAPON;
        if (this._imageListBg) {
            this._imageListBg.node.active = (show);
        }
    }

    setFuncTabIndex(tabFuncIndex) {
        this._tabFuncIndex = tabFuncIndex;
        var index = PackageHelper.getPackTabIndex(tabFuncIndex) || 0;
        this._commonFullScreen.setTitle(TextHelper.expandTextByLen(this._textList[index], 3));
        if (this._tabGroup2) {
            var param2 = {
                callback: handler(this, this._onTabSelect2History),
                isVertical: 2,
                offset: -2,
                textList: PackageHelper.getHistoryHeroSubTab(this._tabFuncIndex==PackageViewConst.TAB_HISTORYHERO_WEAPON)[0]
            };
            this._tabGroup2.recreateTabs(param2);
            this._tabGroup2.setTabIndex(0);
        }else {
            this.resetList();
            this._onTabSelect(index);
        }
    }

    resetList() {
        var scrollViewParam = {
            template: this.PackageItemCell,
            updateFunc: handler(this, this._onItemUpdate),
            //  selectFunc: handler(this, this._onItemSelected),
            //    touchFunc: handler(this, this._onItemTouch)
        };
        if (this._tabFuncIndex == PackageViewConst.TAB_GEMSTONE) {
            scrollViewParam.template = this.PackageGemstoneCell;
        } else if (this._tabFuncIndex == PackageViewConst.TAB_SILKBAG) {
            scrollViewParam.template = this.PackageSilkbagCell;
        } else if (this._tabFuncIndex == PackageViewConst.TAB_JADESTONE) {
            scrollViewParam.template = this.PackageJadeCell;
            this._topbarBase.updateUIByResList(PackageViewConst.JADE_STONE_TOPBAR_RES);
        }
        else if (this._tabFuncIndex == PackageViewConst.TAB_HISTORYHERO) {
            if (this._subTabIndex == 1) {
                scrollViewParam.template = this.PackageHistoryHeroCell;
            } else {
                scrollViewParam.template = this.PackageHistoryHeroFragmentCell;
            }
        } else if (this._tabFuncIndex == PackageViewConst.TAB_HISTORYHERO_WEAPON) {
            if (this._subTabIndex == 1) {
                scrollViewParam.template = this.PackageHistoryHeroWeaponCell;
            } else {
                scrollViewParam.template = this.PackageHistoryHeroFragmentCell;
            }
        }
        this._listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
    }

    _onTabSelect2() {
    }
    _onTabSelect(index) {
        this._commonFullScreen.setTitle(TextHelper.expandTextByLen(this._textList[index], 3));
        this._updateListView(true, false);
    }

    setRedPointByTabIndex(index, redValue) {
        if (this._tabGroup2) {
            this._tabGroup2.setRedPointByTabIndex(index, redValue);
        }
    }
    _onTabSelect2History(index, sender) {
        index += 1;
        if (this._subTabIndex == index) {
            return;
        }
        var lastIndex = this._subTabIndex;
        this._subTabIndex = index;
        if (this._subTabIndex > 0) {
            this.resetList();
            this._updateListView(true, false);
        }
    }

    _onItemSelected(item, index) {
    }

    _onItemTouchItem(index, itemPos) {
        var lineIndex = index;
        var itemData = this._curSelectData[index * 2 + itemPos];
        if (itemData) {
            if (itemData.getType() == TypeConvertHelper.TYPE_ITEM) {
                PackageHelper.popupUseItem(itemData.getId());
            } else if (itemData.getType() == TypeConvertHelper.TYPE_FRAGMENT) {
                UIPopupHelper.popupFragmentDlg(itemData.getId());
            }
        }
    }
    _onItemTouchGemstone(index, itemPos) {
        var itemData = this._curSelectData[index * 2 + itemPos];
        if (itemData) {
            UIPopupHelper.popupFragmentDlg(itemData.getId());
        } else {
            //assert((false, 'itemData == nil index = %s itemPos = %s'.format(index, itemPos));
        }
    }
    _onItemTouchSilkbag(index, itemPos) {
        var [isOpen, comment] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SILKBAG);
        if (!isOpen) {
            G_Prompt.showTip(comment);
            return;
        }
        var itemData = this._curSelectData[index * 2 + itemPos];
        if (itemData) {
            var functionId = itemData.getConfig().function_id;
            WayFuncDataHelper.gotoModuleByFuncId(functionId);
        }
    }
    _onItemTouchJadeStone(index, itemPos) {
        var [isOpen, comment] = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3);
        if (!isOpen) {
            G_Prompt.showTip(comment);
            return;
        }
        var itemData = this._curSelectData[index * 2 + itemPos];
        if (itemData) {
            var functionId = itemData.getConfig().function_id;
            WayFuncDataHelper.gotoModuleByFuncId(functionId);
        }
    }
    _onItemTouchHistoryHero(index, itemPos) {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO), comment;
        if (!isOpen) {
            G_Prompt.showTip(comment);
            return;
        }
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_TEAM);
    }
    _onItemTouchHistoryHeroWeapon(index, itemPos) {
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO), comment;
        if (!isOpen) {
            G_Prompt.showTip(comment);
            return;
        }
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HISTORY_HERO, 1);
    }
    _onItemTouchHistoryHeroFragment(index, itemPos) {
        var newIndex = index * 2 + itemPos;
        var data = this._curSelectData[newIndex];
        var itemId = data.getId();
        UIPopupHelper.popupFragmentDlg(itemId);
    }
    _onItemTouch(index, itemPos) {
        itemPos--;
        var funcTabIndex = this._tabFuncIndex;
        if (funcTabIndex == PackageViewConst.TAB_GEMSTONE) {
            this._onItemTouchGemstone(index, itemPos);
        } else if (funcTabIndex == PackageViewConst.TAB_ITEM) {
            this._onItemTouchItem(index, itemPos);
        } else if (funcTabIndex == PackageViewConst.TAB_SILKBAG) {
            this._onItemTouchSilkbag(index, itemPos);
        } else if (funcTabIndex == PackageViewConst.TAB_JADESTONE) {
            this._onItemTouchJadeStone(index, itemPos);
        } else if (funcTabIndex == PackageViewConst.TAB_HISTORYHERO) {
            if (this._subTabIndex == 1) {
                this._onItemTouchHistoryHero(index, itemPos);
            } else {
                this._onItemTouchHistoryHeroFragment(index, itemPos);
            }
        } else if (funcTabIndex == PackageViewConst.TAB_HISTORYHERO_WEAPON) {
            if (this._subTabIndex == 1) {
                this._onItemTouchHistoryHeroWeapon(index, itemPos);
            } else {
                this._onItemTouchHistoryHeroFragment(index, itemPos);
            }
        }
    }


    _onItemUpdate(item: CommonListItem, index, type) {
        var startIndex = index * 2 + 0;
        var endIndex = startIndex + 1;
        var itemLine = [];
        var itemList = this._curSelectData;

        if (itemList.length > 0) {
            for (var i = startIndex; i <= endIndex && i < itemList.length; i++) {
                var itemData = itemList[i];
                itemData && itemLine.push(itemData);
            }
        }
        if (itemLine.length <= 0) {
            itemLine = null;
        }
        item.updateItem(index, itemLine, type);
    }

    isRootScene() {
        return true;
    }
    onEnter() {
        this._topbarBase.setImageTitle('txt_sys_com_beibao');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);

        this._merageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._updateItemMsg = G_SignalManager.add(SignalConst.EVENT_ITEM_OP_UPDATE, handler(this, this._onEventUpdateItem));
        this._deleteItemMsg = G_SignalManager.add(SignalConst.EVENT_ITEM_OP_DELETE, handler(this, this._onEventDeleteItem));
        this._intertItemMsg = G_SignalManager.add(SignalConst.EVENT_ITEM_OP_INSERT, handler(this, this._onEventInsertItem));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        this._signalSellOnlyObjects = G_SignalManager.add(SignalConst.EVENT_SELL_ONLY_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
    }
    onExit() {
        this._merageItemMsg.remove();
        this._merageItemMsg = null;
        this._updateItemMsg.remove();
        this._updateItemMsg = null;
        this._deleteItemMsg.remove();
        this._deleteItemMsg = null;
        this._intertItemMsg.remove();
        this._intertItemMsg = null;
        this._signalSellObjects.remove();
        this._signalSellObjects = null;
        this._signalSellOnlyObjects.remove();
        this._signalSellOnlyObjects = null;
    }

    _getGemStoneData() {
        var data = [];
        var isInsertGemstone = false;
        var gemstoneData = G_UserData.getGemstone().getGemstonesData();
        var gemstoneFragmentData = G_UserData.getFragments().getFragListByType(TypeConvertHelper.TYPE_GEMSTONE, FragmentData.SORT_FUNC_COMMON);
        for (var k in gemstoneFragmentData) {
            var gemstoneFragment = gemstoneFragmentData[k];
            if (!isInsertGemstone) {
                var canMerge = gemstoneFragment.getNum() >= gemstoneFragment.getConfig().fragment_num;
                if (!canMerge) {
                    isInsertGemstone = true;
                    for (var i in gemstoneData) {
                        var gemstone = gemstoneData[i];
                        data.push(gemstone);
                    }
                }
            }
            data.push(gemstoneFragment);
        }
        if (!isInsertGemstone) {
            isInsertGemstone = true;
            for (i in gemstoneData) {
                var gemstone = gemstoneData[i];
                data.push(gemstone);
            }
        }
        return data;
    }


    _getItemData() {
        var sortFunc = function (a, b) {
            var qa = a.cfg.color, qb = b.cfg.color;
            var id_a = a.cfg.item_sorting, id_b = b.cfg.item_sorting;
            var itemId_a = a.cfg.id, itemId_b = b.cfg.id;
            if (id_a != id_b) {
                return id_a - id_b;
            }
            if (qa != qb) {
                return qa - qb;
            }
            return itemId_a - itemId_b;
        };
        var result = [];
        var itemList = G_UserData.getItems().getItemsData();
        var fragmentsList = G_UserData.getFragments().getFragListOfItemList();
        for (var i in itemList) {
            var data = itemList[i];
            data.cfg = data.getConfig();
            result.push(data);
        }
        for (i in fragmentsList) {
            var data = fragmentsList[i];
            var info = data.getConfig();
            data.cfg = TypeConvertHelper.convert(info.comp_type, info.comp_value).cfg;
            result.push(data);
        }
        result.sort(sortFunc);
        return result;
    }

    _resetData() {
        var funcTabIndex = this._tabFuncIndex;
        if (funcTabIndex == PackageViewConst.TAB_GEMSTONE) {
            console.warn('TAB_GEMSTONE this');
            this._curSelectData = this._getGemStoneData();
        } else if (funcTabIndex == PackageViewConst.TAB_ITEM) {
            console.warn('TAB_ITEM this');
            this._curSelectData = this._getItemData();
            console.warn(this._curSelectData.length);
        } else if (funcTabIndex == PackageViewConst.TAB_SILKBAG) {
            console.warn('TAB_SILKBAG this');
            this._curSelectData = G_UserData.getSilkbag().getListDataOfPackage();
        } else if (funcTabIndex == PackageViewConst.TAB_JADESTONE) {
            this._curSelectData = G_UserData.getJade().getJadeListByPackage();
        } else if (funcTabIndex == PackageViewConst.TAB_HISTORYHERO) {
            if (this._subTabIndex == 1) {
                this._curSelectData = G_UserData.getHistoryHero().getHeroList();
                this._curSelectData = HistoryHeroDataHelper.sortList(this._curSelectData);
            } else {
                this._curSelectData = G_UserData.getFragments().getFragListByType(13, FragmentData.SORT_FUNC_HISTORYHEROLIST);
            }
        } else if (funcTabIndex == PackageViewConst.TAB_HISTORYHERO_WEAPON) {
            if (this._subTabIndex == 1) {
                this._curSelectData = G_UserData.getHistoryHero().getWeaponList();
                this._curSelectData = HistoryHeroDataHelper.sortWeaponList(this._curSelectData);
            } else {
                this._curSelectData = G_UserData.getFragments().getFragListByType(14, FragmentData.SORT_FUNC_HISTORYHEROLIST);
            }
        }
    }
    _updateListView(resetList: boolean = false, delay: boolean = true) {
        this._resetData();
        var lineCount = Math.ceil(this._curSelectData.length / 2);
        this._listView.setData(lineCount, this._tabFuncIndex, resetList, delay);
        this._updateSaleBtn();
        this._nodeEmpty.node.active = (this._curSelectData.length <= 0);
    }

    _updateSaleBtn() {
        var funcTabIndex = this._tabFuncIndex;
        this._buttonSale.node.active = (false);
    }

    _onEventUpdateItem(eventName, updateItems) {
        var funcTabIndex = this._tabFuncIndex;
        if (funcTabIndex == PackageViewConst.TAB_ITEM) {
            this._updateListView();
        }
    }
    _onEventDeleteItem(eventName, deleteIds) {
        this._updateListView();
    }
    _onEventInsertItem() {
        this._updateListView();
    }

    _onSyntheticFragments(id, message) {
        if (!this.node.active) {
            return;
        }
        var fragId = message['id'];
        var itemSize = message['num'];
        if (fragId && fragId > 0) {
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId);
            var awards = {
                1: {
                    type: itemParam.cfg.comp_type,
                    value: itemParam.cfg.comp_value,
                    size: itemSize
                }
            };
            PopupGetRewards.showRewards(awards);
            this._updateListView();
        }
    }
    onButtonClicked() {
        this.onButtonSaleClicked();
    }

    onButtonSaleClicked() {
        var funcTabIndex = this._tabFuncIndex;
        if (funcTabIndex == PackageViewConst.TAB_GEMSTONE) {
            if (this._curSelectData && this._curSelectData.length == 0) {
                G_Prompt.showTip(Lang.get('lang_sellfragment_gemstone_empty'));
                return;
            }
            UIPopupHelper.popupSellFragment(PopupSellFragment.GEMSTONE_SELL);
        } else if (funcTabIndex == PackageViewConst.TAB_ITEM) {
            var officeSealData = G_UserData.getItems().getItemSellData();
            if (officeSealData && officeSealData.length == 0) {
                G_Prompt.showTip(Lang.get('lang_sellfragment_office_seal_empty'));
                return;
            }
            UIPopupHelper.popupSellFragment(PopupSellFragment.ITEM_SEAL_SELL);
        } else if (funcTabIndex == PackageViewConst.TAB_SILKBAG) {
            var sellData = G_UserData.getSilkbag().getListDataOfSell();
            if (sellData && sellData.length == 0) {
                G_Prompt.showTip(Lang.get('lang_sellfragment_silkbag_empty'));
                return;
            }
            UIPopupHelper.popupSellFragment(PopupSellFragment.SILKBAG_SELL);
        } else if (funcTabIndex == PackageViewConst.TAB_JADESTONE) {
            if (this._curSelectData && this._curSelectData.length == 0) {
                G_Prompt.showTip(Lang.get('lang_sellfragment_jadestone_empty'));
                return;
            }
            UIPopupHelper.popupSellFragment(PopupSellFragment.JADESTONE_SELL);
        }
    }

    _onSellFragmentsSuccess() {
        this._updateListView();
    }
}