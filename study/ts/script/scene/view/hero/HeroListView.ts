import CommonDlgBackground from "../../../ui/component/CommonDlgBackground";

import CommonFullScreen from "../../../ui/component/CommonFullScreen";

import CommonTabGroup from "../../../ui/component/CommonTabGroup";

import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import CommonEmptyTipNode from "../../../ui/component/CommonEmptyTipNode";
import CommonListView from "../../../ui/component/CommonListView";
import { HeroConst } from "../../../const/HeroConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { G_SignalManager, G_SceneManager, G_UserData, G_Prompt, G_ResolutionManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { FunctionConst } from "../../../const/FunctionConst";
import { Lang } from "../../../lang/Lang";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { assert } from "../../../utils/GlobleFunc";
import { stringUtil } from "../../../utils/StringUtil";
import { FragmentData } from "../../../data/FragmentData";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import PopupSellFragment from "../sell/PopupSellFragment";
import ViewBase from "../../ViewBase";
import { Path } from "../../../utils/Path";


const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroListView extends ViewBase {
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
    HeroListCell: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    HeroFragListCell: cc.Prefab = null;


    _signalMerageItemMsg: any;
    _signalRedPointUpdate;
    _signalSellObjects;
    _selectTabIndex = 1;
    _count: number;
    _datas: any[];
    _listView: any;

    ctor(index) {
        this._selectTabIndex = index || HeroConst.HERO_LIST_TYPE1;
    }
    onCreate() {
        this.setSceneSize()
        // this.node.setPosition(-this.node.width / 2, -this.node.height / 2);
        this._topbarBase.setImageTitle('txt_sys_com_wujiang');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._topbarBase.node.x = (1136 - G_ResolutionManager.getDesignWidth()) / 2;
        this._initTabGroup();
    }
    onEnter(){

    }
    onExit(){

    }
    start() {

    }

    onEnable() {
        this._signalMerageItemMsg = G_SignalManager.add(SignalConst.EVENT_EQUIPMENT_COMPOSE_OK, handler(this, this._onSyntheticFragments));
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));

        var param = G_SceneManager.getViewArgs('hero');
        var tabIdx = this._selectTabIndex;
        if (param && param.length > 0) {
            tabIdx = param[0];
        }
        this._selectTabIndex = -1;
        this._nodeTabRoot.setTabIndex(tabIdx -1);
    }

    onDisable(): void {
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
        if (funcId == FunctionConst.FUNC_HERO_LIST) {
            this._refreshRedPoint();
        }
    }
    _refreshRedPoint() {
        var redPointShow = G_UserData.getFragments().hasRedPoint({ fragType: 1 });
        this._nodeTabRoot.setRedPointByTabIndex(HeroConst.HERO_LIST_TYPE2, redPointShow);
    }
    _initTabGroup() {
        var tabNameList = [];
        tabNameList.push(Lang.get('hero_list_tab_1'));
        tabNameList.push(Lang.get('hero_list_tab_2'));
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
        this._refreshRedPoint();
        return true;
    }

    _updateListView() {
        var scrollViewParam = {
            template: this.HeroListCell,
        };
        if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE2) {
            scrollViewParam.template = this.HeroFragListCell;
            this._listView = this._listView2;
            this._listView1.scrollView.node.active = false;
        }else {
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
        this._fileNodeBg.setTitle(Lang.get('hero_list_title_' + this._selectTabIndex));
        var count1 = G_UserData.getHero().getHeroTotalCount();
        var count2 = HeroDataHelper.getHeroListLimitCount();
        this._fileNodeBg.setCount(Lang.get('common_list_count', {
            count1: count1,
            count2: count2
        }));
        this._fileNodeBg.showCount(this._selectTabIndex == HeroConst.HERO_LIST_TYPE1);
        this._buttonSale.node.active = (this._selectTabIndex == HeroConst.HERO_LIST_TYPE2);

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
        if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE1) {
            emptyType = 1;
        } else if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE2) {
            emptyType = 2;
        }
      //assert((emptyType, 'HeroListView _selectTabIndex is wrong = %d'.format(this._selectTabIndex));
        return emptyType;
    }
    _initData() {
        this._datas = [];
        if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE1) {
            this._datas = G_UserData.getHero().getListDataBySort();
        } else if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE2) {
            this._datas = G_UserData.getFragments().getFragListByType(1, FragmentData.SORT_FUNC_HEROLIST);
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
        if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE1) {
            G_SceneManager.showScene('heroDetail', data, HeroConst.HERO_RANGE_TYPE_1);
        } else if (this._selectTabIndex == HeroConst.HERO_LIST_TYPE2) {
            var itemId = data.getId();
            UIPopupHelper.popupFragmentDlg(itemId);
        }
    }
    _onSyntheticFragments(id, message) {
        var fragId = message['id'];
        var itemSize = message['num'];
        if (fragId && fragId > 0) {
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragId);
            var heroId = itemParam.cfg.comp_value;
            var count = itemSize;
            G_SceneManager.showScene('heroMerge', heroId, count);
            this._updateView();
        }
    }
    onButtonSaleClicked() {
        if (this._datas && this._datas.length == 0) {
            G_Prompt.showTip(Lang.get('lang_sellfragment_fragment_empty'));
            return;
        }

        G_SceneManager.openPopup(Path.getPrefab("PopupSellFragment","sell"),function(pop:PopupSellFragment){
            pop.ctor(PopupSellFragment.HERO_FRAGMENT_SELL);
            pop.openWithAction();
        });
    }
    _onSellFragmentsSuccess() {
        this._updateView();
        this._refreshRedPoint();
    }

}