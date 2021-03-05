const { ccclass, property } = cc._decorator;

import { Colors, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import { handler } from '../../../utils/handler';
import ViewBase from '../../ViewBase';
import HandBookHelper from './HandBookHelper';
import HandBookViewCell from './HandBookViewCell';


@ccclass
export default class HandBookTabView extends ViewBase {

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot: CommonTabGroup = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewTab: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountryNum1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountryNum2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountryProcess: cc.Label = null;

    _tabGroup2: any;
    _callback: any;
    _tabIndex: any;
    _forceShowFunctionId: any;
    _title: any;
    _selectTabIndex: number;
    _infos: any;
    _ownerCount: any;


    private _curY: number = 0;

    initData(index, forceShowFunctionId) {
        this._tabGroup2 = null;
        this._curY = 0;
        // this._callback = callback;
        this._tabIndex = index || 0;
        this._forceShowFunctionId = forceShowFunctionId;
        var tabType = HandBookHelper.getHandBookTypeByIndex(this._tabIndex, this._forceShowFunctionId);
        this._title = Lang.get('handbook_tab' + tabType);
        // this._selectTabIndex = 0;
    }
    onCreate() {
        this._commonFullScreen.setTitle(this._title);
        var tabType = HandBookHelper.getHandBookTypeByIndex(this._tabIndex, this._forceShowFunctionId);
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: 2,
            textList: HandBookHelper.getHandBookTabViewTabs(tabType)
        };

        cc.resources.load("prefab/handbook/HandBookViewCell", cc.Prefab, () => {
            this._nodeTabRoot.recreateTabs(param);
            this._nodeTabRoot.setTabIndex(0);
        });
    }
    _onTabSelect(index, sender) {
        if (this._selectTabIndex == index) {
            return;
        }
        this._listViewTab.content.height = 0;
        this._curY = 0;
        this._selectTabIndex = index;
        this.recordIndex = 0;
        this._listViewTab.content.removeAllChildren();
        this._listViewTab.content.setContentSize(this._listViewTab.content.getContentSize().width, 2000)
        this._updateListView(index);
        this.schedule(this._updateListView, 0.3);
        // this._updateListView(index);
    }
    private recordIndex = 0;
    _updateListView(index) {
        index = this._selectTabIndex;
        var tabType = HandBookHelper.getHandBookTypeByIndex(this._tabIndex, this._forceShowFunctionId);
        var res = G_UserData.getHandBook().getInfosByType(tabType);
        this._infos = res[0];
        this._ownerCount = res[1];
        if (this._infos[index + 1] == null) {
            return;
        }
        this._updateSelectTab(index);
        var begin = HandBookHelper.COLOR_GO_TO[tabType].begin;
        var ended = HandBookHelper.COLOR_GO_TO[tabType].ended;
        let count = 0;
        for (var color = ended + this.recordIndex; color <= begin; color++) {
            var array = this._infos[index + 1][color];
            var ownerCount = this._ownerCount[index + 1][color];
            if (array) {
                var resource = cc.resources.get("prefab/handbook/HandBookViewCell");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(HandBookViewCell) as HandBookViewCell;
                this._listViewTab.content.addChild(cell.node);
                cell.updateUI(HandBookHelper.TAB_TYPE_TO_ITEM_TYPE[tabType], color, array, ownerCount, this._curY);
                // this._listViewTab.content.setContentSize(this._listViewTab.content.getContentSize().width, this._listViewTab.content.getContentSize().height + cell.node.getContentSize().height);
                this._curY += cell.node.getContentSize().height;
            }
            if (color == begin) {
                this._listViewTab.content.height = Math.abs(this._curY);
                this.unschedule(this._updateListView);
            }
            count++;
            this.recordIndex++;
            if (count > 1) {
                break;
            }
        }
        this._listViewTab.scrollToTop();
    }
    _updateSelectTab(index) {
        var country = this._ownerCount[index + 1];
        country.totalNum = country.totalNum || 0;
        if (country && country.ownNum && country.totalNum) {
        }
        if (country.ownNum == country.totalNum) {
            this._textCountryNum1.node.color = (Colors.BRIGHT_BG_ONE);
            this._textCountryNum2.node.color = (Colors.BRIGHT_BG_ONE);
        } else {
            this._textCountryNum1.node.color = (Colors.DARK_BG_RED);
            this._textCountryNum2.node.color = (Colors.BRIGHT_BG_ONE);
        }
        this._textCountryNum1.string = (country.ownNum);
        HandBookHelper.fitBookTextContent(this._textCountryNum1);
        var num2Pos = this._textCountryNum1.node.x + this._textCountryNum1.node.getContentSize().width;
        this._textCountryNum2.string = ('/' + country.totalNum);
        this._textCountryNum2.node.x = (num2Pos + 2);
        var tabType = HandBookHelper.getHandBookTypeByIndex(this._tabIndex, this._forceShowFunctionId) as number;
        this._textCountryProcess.string = (Lang.get(HandBookHelper.TITLE_PREFIX[tabType] + (index + 1)));
    }
    onEnter() {
    }
    onExit() {
        this.unschedule(this._updateListView);
    }

}