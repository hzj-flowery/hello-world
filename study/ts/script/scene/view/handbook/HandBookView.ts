const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_ResolutionManager, G_SignalManager, G_UserData } from '../../../init';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonTabGroupScrollVertical from '../../../ui/component/CommonTabGroupScrollVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import ViewBase from '../../ViewBase';
import HandBookHelper from './HandBookHelper';
import HandBookOtherView from './HandBookOtherView';
import HandBookTabView from './HandBookTabView';



@ccclass
export default class HandBookView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRight: cc.Node = null;

    @property({
        type: CommonTabGroupScrollVertical,
        visible: true
    })
    _tabGroup1: CommonTabGroupScrollVertical = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_content: cc.Node = null;


    private static _forceShowFunctionId: any;
    private static _selectedTab: any = HandBookHelper.TBA_HERO;
    _handbookView: any[];
    _selectTabIndex: any;
    private _textList: any;


    public static waitEnterMsg(callBack, param) {
        var onMsgCallBack = function () {
            var data: Array<string> = [];
            data.push("prefab/handbook/HandBookTabView");
            data.push("prefab/handbook/HandBookOtherView");
            data.push("prefab/handbook/HandBookViewCell");
            cc.resources.load(data, cc.Prefab, () => {
                callBack();
            });
        }
        if (param) {
            HandBookView._forceShowFunctionId = param[0];
            HandBookView._selectedTab = param[1];
        }
        G_UserData.getHandBook().c2sGetResPhoto();
        G_SignalManager.addOnce(SignalConst.EVENT_GET_RES_PHOTO_SUCCESS, onMsgCallBack)
    }


    initData() {
        this._handbookView = [];
        let a = HandBookHelper.SUB_TAB_VIEW;
        this.start();
    }

    start() {
        this._topbarBase.setImageTitle('txt_sys_com_tujian');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_HANDBOOK);

        this._panelRight.parent.x = (G_ResolutionManager.getDesignWidth() - 1136) / 2;
        this._panel_content.setContentSize(G_ResolutionManager.getDesignWidth(), G_ResolutionManager.getDesignHeight());

    }

    onCreate() {
        this.initData();
        let res = HandBookHelper.getHandBookTabList(HandBookView._forceShowFunctionId);
        var tabNameList = res[0];
        let funcList = res[1];
        var param = {
            containerStyle: 1,
            callback: handler(this, this._onTabSelect1),
            textList: tabNameList
        };
        this._textList = tabNameList;
        var index = 0;
        for (let i = 0; i < funcList.length; i++) {
            var tabIndex = funcList[i];
            if (HandBookView._selectedTab == tabIndex) {
                index = i;
            }
        }
        this._tabGroup1.recreateTabs(param);
        this._tabGroup1.setTabIndex(index);
    }
    _onTabSelect1(index, sender) {
        if (this._selectTabIndex == index) {
            return;
        }
        for (let i = 0; i < this._handbookView.length; i++) {
            var view = this._handbookView[i];
            if (view) {
                view.node.active = (false);
            }
        }
        this._selectTabIndex = index;
        var chooseView = this.getView(index);
        chooseView.node.active = (true);
    }
    getView(index) {
        var tabType = HandBookHelper.getHandBookTypeByIndex(index, HandBookView._forceShowFunctionId);
        var handbookView = this._handbookView[index];
        tabType = HandBookHelper.SUB_VIEW_MAPS[tabType];
        if (handbookView == null) {
            if (tabType == 1) {
                var resource = cc.resources.get("prefab/handbook/HandBookTabView");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(HandBookTabView) as HandBookTabView;
                cell.initData(index, HandBookView._forceShowFunctionId);
                this._panelRight.addChild(cell.node);
                this._handbookView[index] = cell;
                return cell;
            }
            else if (tabType == 2) {
                var resource = cc.resources.get("prefab/handbook/HandBookOtherView");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(HandBookOtherView) as HandBookOtherView;
                cell.initData(index, HandBookView._forceShowFunctionId);
                this._panelRight.addChild(cell.node);
                this._handbookView[index] = cell;
                return cell;
            }
        }
        return handbookView;
    }
    onEnter() {
    }
    onExit() {
    }
}