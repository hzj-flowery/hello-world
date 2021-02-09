const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical'

import CommonFullScreenListView from '../../../ui/component/CommonFullScreenListView'

import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import ViewBase from '../../ViewBase';
import { G_SceneManager, G_SignalManager, G_UserData, G_Prompt } from '../../../init';
import HorseConst from '../../../const/HorseConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { Lang } from '../../../lang/Lang';
import { HorseDataHelper } from '../../../utils/data/HorseDataHelper';
import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import PopupSellFragment from '../sell/PopupSellFragment';
import { Path } from '../../../utils/Path';
import { FragmentData } from '../../../data/FragmentData';

@ccclass
export default class HorseListView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonFullScreenListView,
        visible: true
    })
    _fileNodeBg: CommonFullScreenListView = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: CommonEmptyTipNode,
        visible: true
    })
    _fileNodeEmpty: CommonEmptyTipNode = null;

    @property({
        type: CommonTabGroupVertical,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupVertical = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSale: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: cc.Prefab, visible: true })
    _horseListCellPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseFragListCellPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseEquipListCellPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _horseEquipFragListCellPrefab: cc.Prefab = null;

    private _selectTabIndex;
    private _signalMerageItemMsg;
    private _signalRedPointUpdate;
    private _signalSellObjects;

    private _datas: any[];
    private _count;

    onCreate() {
        this.setSceneSize();
        this._selectTabIndex = G_SceneManager.getViewArgs()[0] || HorseConst.HORSE_LIST_TYPE1;
        this._topbarBase.setImageTitle('txt_sys_com_horse');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._initTabGroup();
    }

    onEnter() {
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        this._updateView();
        this._refreshRedPoint();
    }

    onExit() {
        this._signalMerageItemMsg.remove();
        this._signalMerageItemMsg = null;
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        if (this._signalSellObjects) {
            this._signalSellObjects.remove();
            this._signalSellObjects = null;
        }
    }

    _onEventRedPointUpdate(event, funcId, param) {
        if (funcId == FunctionConst.FUNC_HORSE_LIST) {
            this._refreshRedPoint();
        }
    }

    _refreshRedPoint() {
        var redPointShow2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, 'fraglist');
        var redPointShow4 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_LIST, 'equipFraglist');
        this._nodeTabRoot.setRedPointByTabIndex(HorseConst.HORSE_LIST_TYPE2, redPointShow2);
        this._nodeTabRoot.setRedPointByTabIndex(HorseConst.HORSE_LIST_TYPE4, redPointShow4);
    }

    _initTabGroup() {
        var scrollViewParam = {
            template: this._horseListCellPrefab,
            updateFunc: handler(this, this._onItemUpdate),
            selectFunc: handler(this, this._onItemSelected),
            touchFunc: handler(this, this._onItemTouch)
        };
        if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE2) {
            scrollViewParam.template = this._horseFragListCellPrefab;
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE3) {
            scrollViewParam.template = this._horseEquipListCellPrefab;
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE3) {
            scrollViewParam.template = this._horseEquipFragListCellPrefab;
        }
        this._listView.setTemplate(scrollViewParam.template);
        this._listView.setCallback(handler(this, this._onItemUpdate));
        this._listView.setCustomCallback(handler(this, this._onItemTouch));
        var tabNameList = [];
        tabNameList.push(Lang.get('horse_list_tab_1'));
        tabNameList.push(Lang.get('horse_list_tab_2'));
        tabNameList.push(Lang.get('horse_list_tab_3'));
        tabNameList.push(Lang.get('horse_list_tab_4'));
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: tabNameList,
        };
        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(0);
    }

    _onTabSelect(index, sender) {
        if ((index + 1) == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index + 1;
        this._updateView();
        this._refreshRedPoint();
    }

    _updateView() {
        this._fileNodeBg.setTitle(Lang.get('horse_list_title_' + this._selectTabIndex));
        var count1 = G_UserData.getHorse().getHorseTotalCount();
        var count2 = HorseDataHelper.getHorseListLimitCount();
        this._fileNodeBg.setCount(Lang.get('common_list_count', {
            count1: count1,
            count2: count2
        }));
        this._fileNodeBg.showCount(this._selectTabIndex == HorseConst.HORSE_LIST_TYPE1);
        this._buttonSale.node.active = (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE4 || this._selectTabIndex == HorseConst.HORSE_LIST_TYPE2);
        this._initData();
        if (this._count == 0) {
            this._listView.node.active = false;
            var emptyType = this._getEmptyType();
            this._fileNodeEmpty.updateView(emptyType);
            this._fileNodeEmpty.node.active = (true);
        } else {
            var scrollViewParam = {
                template: this._horseListCellPrefab,
                updateFunc: handler(this, this._onItemUpdate),
                selectFunc: handler(this, this._onItemSelected),
                touchFunc: handler(this, this._onItemTouch)
            };
            if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE2) {
                scrollViewParam.template = this._horseFragListCellPrefab;
            } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE3) {
                scrollViewParam.template = this._horseEquipListCellPrefab;
            } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE4) {
                scrollViewParam.template = this._horseEquipFragListCellPrefab;
            }
            this._listView.node.active = true;
            this._listView.setTemplate(scrollViewParam.template);
            this._listView.setCallback(handler(this, this._onItemUpdate));
            this._listView.setCustomCallback(handler(this, this._onItemTouch));
            this._listView.resize(this._count);
            this._fileNodeEmpty.node.active = (false);
        }
    }

    _getEmptyType() {
        var emptyType = null;
        if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE1) {
            emptyType = 11;
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE2) {
            emptyType = 12;
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE3) {
            emptyType = 18;
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE4) {
            emptyType = 19;
        }
        return emptyType;
    }

    _initData() {
        this._datas = [];
        if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE1) {
            this._datas = G_UserData.getHorse().getListDataBySort();
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE2) {
            this._datas = G_UserData.getFragments().getFragListByType(TypeConvertHelper.TYPE_HORSE, FragmentData.SORT_FUNC_COMMON);
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE3) {
            this._datas = G_UserData.getHorseEquipment().getListDataBySort();
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE4) {
            this._datas = G_UserData.getFragments().getFragListByType(TypeConvertHelper.TYPE_HORSE_EQUIP, FragmentData.SORT_FUNC_COMMON);
        }
        this._count = Math.ceil(this._datas.length / 2);
    }

    _onItemUpdate(item, index) {
        index = index * 2;
        item.updateUI(this._datas[index], this._datas[index + 1]);
    }

    _onItemSelected(item, index) {
    }

    _onItemTouch(index, t) {
        var index = index * 2 + t;
        var data = this._datas[index - 1];
        if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE1) {
            var [isOpen, des] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HORSE_TRAIN)
            if (!isOpen) {
                G_Prompt.showTip(des);
                return;
            }
            G_SceneManager.showScene('horseTrain', data, HorseConst.HORSE_RANGE_TYPE_1);
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE2) {
            var itemId = data.getId();
            UIPopupHelper.popupFragmentDlg(itemId);
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE3) {
        } else if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE4) {
            var itemId = data.getId();
            UIPopupHelper.popupFragmentDlg(itemId);
        }
    }

    _onSyntheticFragments(id, message) {
        var fragId = message.id;
        var itemSize = message.num;
        if (fragId && fragId > 0) {
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId);
            var awards = [
                {
                    type: itemParam.cfg.comp_type,
                    value: itemParam.cfg.comp_value,
                    size: itemSize
                }
            ];
            PopupGetRewards.showRewards(awards);
            this._updateView();
        }
    }

    _onSellFragmentsSuccess() {
        this._updateView();
        this._refreshRedPoint();
    }

    onButtonSaleClicked() {
        if (this._datas && this._datas.length == 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_fragment_empty'));
            return;
        }
        var sellType = PopupSellFragment.HORSE_FRAGMENT_SELL;
        if (this._selectTabIndex == HorseConst.HORSE_LIST_TYPE4) {
            sellType = PopupSellFragment.HORSE_EQUIP_FRAGMENT_SELL;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupSellFragment", "sell"), (popupSellFragment: PopupSellFragment) => {
            popupSellFragment.ctor(sellType);
            popupSellFragment.openWithAction();
        });
    }
}