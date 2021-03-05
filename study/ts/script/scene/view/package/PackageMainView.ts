const { ccclass, property } = cc._decorator;

import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical'
import { handler } from '../../../utils/handler';
import { G_UserData, G_SignalManager, G_WaitingMask, G_SceneManager } from '../../../init';
import { PackageViewConst } from '../../../const/PackageViewConst';
import { SignalConst } from '../../../const/SignalConst';
import ResourceLoader from '../../../utils/resource/ResourceLoader';
import { PackageHelper } from './PackageHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import ViewBase from '../../ViewBase';
import PackageView from './PackageView';



@ccclass
export default class PackageMainView extends ViewBase {

    private static viewList = [
        'PackageView',
        'PackageView',
        'PackageView',
        'PackageView',
        'PackageView',
        'EquipmentListView',
        'TreasureListView',
        'InstrumentListView',

    ]

    private static tab2viewIdx = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 1,
        5: 2,
        6: 3,

    }

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRight: cc.Node = null;

    @property({
        type: CommonTabGroupScrollVertical,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupScrollVertical = null;

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
        type: cc.Prefab,
        visible: true
    })
    _packageViewPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _packageViewPrefab1: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _equipmentListViewPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _treasureListViewPrefab: cc.Prefab = null;
    @property({
        type: cc.Prefab,
        visible: true
    })
    _instrumentListViewPrefab: cc.Prefab = null;


    _tabViewList = [];
    _selectTabIndex = -1;
    _signalRedPointUpdate;
    _signalSellObjects;
    _signalSellOnlyObjects;
    _tabFuncList;
    _textList;
    _prefabs: { [key: string]: cc.Prefab };

    onCreate() {
        this.setSceneSize();
        this._prefabs = {
            'PackageView': this._packageViewPrefab,
            'PackageView1': this._packageViewPrefab1,  
            'EquipmentListView': this._equipmentListViewPrefab,
            'TreasureListView': this._treasureListViewPrefab, 
            'InstrumentListView': this._instrumentListViewPrefab,
        }
        var ret = PackageHelper.getPackageTabList();
        this._textList = ret[0];
        this._tabFuncList = ret[1];
        var param = {
            containerStyle: 2,
            callback: handler(this, this._onTabSelect),
            textList: this._textList,
            rootNode:this._nodeTabRoot._scrollViewTab,
        }
        this._nodeTabRoot.recreateTabs(param, cc.size(168, 400));
        this._buttonSale.node.active = true; //!UserDataHelper.isEnoughBagMergeLevel()[0];
        this._refreshRedPoint();
    }

    onEnter() {
        this._signalRedPointUpdate = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedPointUpdate));
        this._signalSellObjects = G_SignalManager.add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        this._signalSellOnlyObjects = G_SignalManager.add(SignalConst.EVENT_SELL_ONLY_OBJECTS_SUCCESS, handler(this, this._onSellFragmentsSuccess));
        // this._showTabView(this._selectTabIndex);
        var param = G_SceneManager.getViewArgs('package');
        var tabIdx = 0;
        if (param && param.length > 0) {
            tabIdx = param[0];
        }
        this._nodeTabRoot.setTabIndex(tabIdx);
        this.scheduleOnce(()=>{
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'PackageView');
        },0);
    }

    onExit() {
        this._signalRedPointUpdate.remove();
        this._signalRedPointUpdate = null;
        this._signalSellObjects.remove();
        this._signalSellObjects = null;
        this._signalSellOnlyObjects.remove();
        this._signalSellOnlyObjects = null;
    }


    _refreshRedPoint() {
        var fragMentData = G_UserData.getFragments();
        var redPointShow1 = fragMentData.hasRedPoint({ fragType: 8 });
        var tabIndex1 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_GEMSTONE);
        if (tabIndex1) {
            this._nodeTabRoot.setRedPointByTabIndex(Number(tabIndex1) + 1, redPointShow1);
        }
        var redPointShow2 = fragMentData.hasRedPoint({ fragType: 6 });
        var tabIndex2 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_ITEM);
        if (tabIndex2) {
            this._nodeTabRoot.setRedPointByTabIndex(Number(tabIndex2) + 1 , redPointShow2);
        }
        var redPointShow3 = fragMentData.hasRedPoint({ fragType: 2 });
        var tabIndex3 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_EQUIPMENT);
        if (tabIndex3) {
            this._nodeTabRoot.setRedPointByTabIndex(Number(tabIndex3) + 1 , redPointShow3);
        }
        var redPointShow4 = fragMentData.hasRedPoint({ fragType: 3 });
        var tabIndex4 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_TREASURE);
        if (tabIndex4) {
            this._nodeTabRoot.setRedPointByTabIndex(Number(tabIndex4) + 1 , redPointShow4);
        }
        var redPointShow5 = fragMentData.hasRedPoint({ fragType: 4 });
        var tabIndex5 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_INSTRUMENT);
        if (tabIndex5) {
            this._nodeTabRoot.setRedPointByTabIndex(Number(tabIndex5) + 1 , redPointShow5);
        }
        var redPointShow6 = G_UserData.getFragments().hasRedPoint({ fragType: 13 });
        var tabIndex6 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_HISTORYHERO);
        if (tabIndex6) {
            this._nodeTabRoot.setRedPointByTabIndex(Number(tabIndex6) + 1, redPointShow6);
            if (this._tabViewList[tabIndex6]) {
                this._tabViewList[tabIndex6].setRedPointByTabIndex(2, redPointShow6);
            }
        }
        var redPointShow7 = G_UserData.getFragments().hasRedPoint({ fragType: 14 });
        var tabIndex7 = PackageHelper.getPackTabIndex(PackageViewConst.TAB_HISTORYHERO_WEAPON);
        if (tabIndex7) {
            this._nodeTabRoot.setRedPointByTabIndex(Number(tabIndex7) + 1, redPointShow7);
            if (this._tabViewList[tabIndex7]) {
                this._tabViewList[tabIndex7].setRedPointByTabIndex(2, redPointShow7);
            }
        }
    }

    _onEventRedPointUpdate(event, funcId, param) {
        this._refreshRedPoint();
    }
    _onSellFragmentsSuccess() {
        this._refreshRedPoint();
    }
    _onTabSelect(index, sender) {
        if (this._selectTabIndex == index) {
            return false;
        }
        for (var k in this._tabViewList) {
            var v = this._tabViewList[k];
            v.node.active = (false);
        }
        this._selectTabIndex = index;
        this._showTabView(index);
        this._swithButtonSaleVisible(index);
        this._refreshRedPoint();
        return true;
    }

    _swithButtonSaleVisible(index) {
        if (this._tabFuncList[index] == PackageViewConst.TAB_HISTORYHERO || this._tabFuncList[index] == PackageViewConst.TAB_HISTORYHERO_WEAPON) {
            this._buttonSale.node.active = (false);
        } else {
            this._buttonSale.node.active = (true);
        }
    }

    _showTabView(index) {
        var tabView = this.getTabView(index, handler(this, this._showTabView, index));
        if (!tabView) {
            return;
        }
        tabView.node.active = (true);
    }

    getTabView(index, cb: Function) {
       // var viewIdx = PackageMainView.tab2viewIdx[index];
        var tabView = this._tabViewList[index];
        if (tabView == null) {
            // var tabViewName = PackageMainView.viewList[index];
            // if (tabViewName == 'PackageView') {
            //     tabViewName += '1';
            // }
            // G_WaitingMask.showWaiting(true);
            // ResourceLoader.loadPrefab('package/' + tabViewName, handler(this, (prefab) => {
            //     var node: cc.Node = cc.instantiate(prefab);
            //     this._panelRight.addChild(node);
            //     tabView = node.getComponent(PackageMainView.viewList[index]);
            //     this._tabViewList[viewIdx] = tabView;
            //     cb();
            //     G_WaitingMask.showWaiting(false);
            // }));
                var prefab = index < 4 ? this._packageViewPrefab : this._packageViewPrefab1;
                var node: cc.Node = cc.instantiate(prefab);
                this._panelRight.addChild(node);
                tabView = node.getComponent(PackageView);
                this._tabViewList[index] = tabView;
                
                if (tabView) {
                    if (tabView.setFuncTabIndex) {
                        tabView.setFuncTabIndex(this._tabFuncList[index]);
                    }
                }
                cb();
        }
        return tabView;
    }

    onButtonSaleClicked() {
        var tabView = this.getTabView(this._selectTabIndex, handler(this, this.onButtonSaleClicked));
        if (tabView.onButtonClicked) {
            tabView.onButtonClicked();
        }
    }
}