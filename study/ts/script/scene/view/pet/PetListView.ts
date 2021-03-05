const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonListView from '../../../ui/component/CommonListView';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import CommonEmptyTipNode from '../../../ui/component/CommonEmptyTipNode';
import PetConst from '../../../const/PetConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_ResolutionManager, G_SignalManager, G_SceneManager, G_UserData, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Lang } from '../../../lang/Lang';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { assert } from '../../../utils/GlobleFunc';
import { HeroConst } from '../../../const/HeroConst';
import { FragmentData } from '../../../data/FragmentData';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import PopupSellFragment from '../sell/PopupSellFragment';
import ViewBase from '../../ViewBase';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';

@ccclass
export default class PetListView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;
    @property({
        type: CommonFullScreen,
        visible: true
    })
    _fileNodeBg: CommonFullScreen = null;
    @property({
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot: CommonTabGroup = null;
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
    @property({
        type: CommonEmptyTipNode,
        visible: true
    })
    _fileNodeEmpty: CommonEmptyTipNode = null;
    @property({
        type: CommonListView,
        visible: true
    })
    _listView1: CommonListView = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView2: CommonListView = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    petListCell: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    petFragListCell: cc.Prefab = null;

    _signalMerageItemMsg: any;
    _signalRedPointUpdate;
    _signalSellObjects;
    _selectTabIndex = 1;
    _count: number;
    _datas: any[];
    _listView: any;

    ctor(index) {
        this._selectTabIndex = index || PetConst.PET_LIST_TYPE1;
    }
    onCreate() {
        this.setSceneSize();
        this._initTabGroup();
    }

    start() {
        this._topbarBase.setImageTitle('txt_sys_com_shenshou');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
    }

    onEnter() {
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        this._refreshRedPoint();
        var param = G_SceneManager.getViewArgs('pet');
        var tabIdx = this._selectTabIndex;
        if (param && param.length > 0) {
            tabIdx = param[0];
        }
        this._selectTabIndex = -1;
        this._nodeTabRoot.setTabIndex(tabIdx -1);
    }

    onExit(): void {
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
        if (funcId == FunctionConst.FUNC_PET_LIST) {
            this._refreshRedPoint();
        }
    }
    _refreshRedPoint() {
        var redPointShow = G_UserData.getFragments().hasRedPoint({ fragType: TypeConvertHelper.TYPE_PET });
        this._nodeTabRoot.setRedPointByTabIndex(PetConst.PET_LIST_TYPE2, redPointShow);
    }
    _initTabGroup() {
        var tabNameList = [];
        tabNameList.push(Lang.get('pet_list_tab_1'));
        tabNameList.push(Lang.get('pet_list_tab_2'));
        var param = {
            callback: handler(this, this._onTabSelect),
            textList: tabNameList
        };
        this._nodeTabRoot.recreateTabs(param);
    }
    _onTabSelect(index, sender) {
        index += 1;
        if (index == this._selectTabIndex) {
            return false;
        }
        this._selectTabIndex = index;
        this._updateListView();
        this._updateView();
        this._refreshRedPoint();
        return true;
    }

    _updateListView() {
        var scrollViewParam = {
            template: this.petListCell,
        };
        if (this._selectTabIndex == PetConst.PET_LIST_TYPE2) {
            scrollViewParam.template = this.petFragListCell;
            this._listView = this._listView2;
            this._listView1.scrollView.node.active = false;
        } else {
            this._listView = this._listView1;
            this._listView2.scrollView.node.active = false;
        }
        this._listView.scrollView.node.active = true;
        if (!this._listView.updateFunc) {
            this._listView.init(scrollViewParam.template, handler(this, this._onItemUpdate), handler(this, this._onItemTouch));
            this._updateView(true);
        }else {
            this._updateView();
        }
    }

    _updateView(reset:boolean = false) {
        this._fileNodeBg.setTitle(Lang.get('pet_list_title_' + this._selectTabIndex));
        var count1 = G_UserData.getPet().getPetTotalCount();
        var count2 = UserDataHelper.getPetListLimitCount();
        this._fileNodeBg.setCount(Lang.get('common_list_count', {
            count1: count1,
            count2: count2
        }));
        this._fileNodeBg.showCount(this._selectTabIndex == PetConst.PET_LIST_TYPE1);
        this._buttonSale.node.active = (this._selectTabIndex == PetConst.PET_LIST_TYPE2);

        this._initData();

        if (this._count == 0) {
            var emptyType = this._getEmptyType();
            this._fileNodeEmpty.updateView(emptyType);
            this._fileNodeEmpty.node.active = (true);
        } else {
            this._fileNodeEmpty.node.active = (false);
        }
        this._listView.setData(this._count, this._selectTabIndex, reset);
    }
    _getEmptyType() {
        var emptyType = null;
        if (this._selectTabIndex == PetConst.PET_LIST_TYPE1) {
            emptyType = 10;
        } else if (this._selectTabIndex == PetConst.PET_LIST_TYPE2) {
            emptyType = 10;
        }
        //assert((emptyType, 'PetListView _selectTabIndex is wrong = %d'.format(this._selectTabIndex));
        return emptyType;
    }
    _initData() {
        this._datas = [];
        if (this._selectTabIndex == PetConst.PET_LIST_TYPE1) {
            this._datas = G_UserData.getPet().getListDataBySort();
        } else if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE2) {
            this._datas = G_UserData.getFragments().getFragListByType(TypeConvertHelper.TYPE_PET, FragmentData.SORT_FUNC_PETLIST);
        }
        this._count = Math.ceil(this._datas.length / 2);
    }
    _onItemUpdate(item, index, type) {
        var startIndex = index * 2 + 0;
        var endIndex = startIndex + 1;
        var itemLine = [];
        if (this._datas.length > 0) {
            for (var i = startIndex; i <= endIndex && i < this._datas.length; i++) {
                var itemData = this._datas[i];
                itemLine.push(itemData);
            }
        }
        if (itemLine.length <= 0) {
            itemLine = null;
        }
        item.updateItem(index, itemLine, type);
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, t) {
        var index = index * 2 + t;
        var data = this._datas[index];
        if (this._selectTabIndex == PetConst.PET_LIST_TYPE1) {
            G_SceneManager.showScene('petDetail', data, PetConst.PET_RANGE_TYPE_1);
        } else if (this._selectTabIndex == PetConst.PET_LIST_TYPE2) {
            var itemId = data.getId();
            UIPopupHelper.popupFragmentDlg(itemId);
        }
    }
    _onSyntheticFragments(id, message) {
        var fragId = message['id'];
        var itemSize = message['num'];
        if (fragId && fragId > 0) {
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId);
            var petId = itemParam.cfg.comp_value;
            var count = itemSize;
            G_SceneManager.showScene('petMerge', petId, count);
            this._updateView();
        }
    }
    onButtonSaleClicked() {
        if (this._datas && this._datas.length == 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_fragment_empty'));
            return;
        }
        UIPopupHelper.popupSellFragment(PopupSellFragment.PET_FRAGMENT_SELL);
    }
    _onSellFragmentsSuccess() {
        this._updateView();
        this._refreshRedPoint();
    }

}