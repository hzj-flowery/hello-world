const { ccclass, property } = cc._decorator;

import { Colors, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import ViewBase from '../../ViewBase';
import HandBookHelper from './HandBookHelper';
import HandBookViewCell from './HandBookViewCell';

@ccclass
export default class HandBookOtherView extends ViewBase {

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountryProcess: cc.Label = null;

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
        type: cc.ScrollView,
        visible: true
    })
    _listViewTab: cc.ScrollView = null;

    _itemInfos: any;
    _forceShowFunctionId: any;
    _itemOwnerCount: any;
    _tabIndex: any;
    _title: string;

    private _curY: number = 0;


    initData(tabIndex, forceShowFunctionId) {
        this._forceShowFunctionId = forceShowFunctionId;
        this._tabIndex = tabIndex;
        this._curY = 0;
        var tabType = HandBookHelper.getHandBookTypeByIndex(this._tabIndex, this._forceShowFunctionId);
        this._title = Lang.get('handbook_tab' + tabType);
    }

    onCreate() {
        this._commonFullScreen.setTitle(this._title);
        this._updateUI(this._tabIndex);

    }
    onEnter() {
    }
    onExit() {
    }
    _updateUI(tabIndex) {
        this._updateListView();
    }
    _updateListView() {
        var tabType = HandBookHelper.getHandBookTypeByIndex(this._tabIndex, this._forceShowFunctionId);
        var res = G_UserData.getHandBook().getInfosByType(tabType);
        this._itemInfos = res[0];
        this._itemOwnerCount = res[1];
        this._listViewTab.content.removeAllChildren();
        this._listViewTab.content.height = 0;
        var itemType = HandBookHelper.TAB_TYPE_TO_ITEM_TYPE[tabType];
        var begin = HandBookHelper.COLOR_GO_TO[tabType].begin;
        var ended = HandBookHelper.COLOR_GO_TO[tabType].ended;
        for (var color = ended; color <= begin; color++) {
            var itemArray = this._itemInfos[color];
            var itemOwnerCount = this._itemOwnerCount[color];
            if (itemArray) {
                var resource = cc.resources.get("prefab/handbook/HandBookViewCell");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(HandBookViewCell) as HandBookViewCell;
                this._listViewTab.content.addChild(cell.node);
                cell.updateUI(itemType, color, itemArray, itemOwnerCount, this._curY);
                this._listViewTab.content.setContentSize(this._listViewTab.content.getContentSize().width, this._listViewTab.content.getContentSize().height + cell.node.getContentSize().height);
                this._curY += cell.node.getContentSize().height;
            }
        }
        this._listViewTab.scrollToTop();
        this._updateAllProcess();
    }
    _updateAllProcess() {
        var totalTable = this._itemOwnerCount;
        if (totalTable["ownNum"] == totalTable["totalNum"]) {
            this._textCountryNum1.node.color = (Colors.DARK_BG_THREE);
            this._textCountryNum2.node.color = (Colors.DARK_BG_THREE);
        } else {
            this._textCountryNum1.node.color = (Colors.DARK_BG_RED);
            this._textCountryNum2.node.color = (Colors.DARK_BG_THREE);
        }
        this._textCountryNum1.string = (totalTable["ownNum"]);
        var num2Pos = this._textCountryNum1.node.x + this._textCountryNum1.node.getContentSize().width;
        this._textCountryNum2.string = ('/' + totalTable["totalNum"]);
        this._textCountryNum2.node.x = (num2Pos + 2);
        var tabType = HandBookHelper.getHandBookTypeByIndex(this._tabIndex, this._forceShowFunctionId);
        this._textCountryProcess.string = (Lang.get('handbook_process_tab' + tabType));
    }

}