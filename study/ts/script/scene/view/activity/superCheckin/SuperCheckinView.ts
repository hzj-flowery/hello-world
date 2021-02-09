const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight'

import CommonFullScreenActivityTitle from '../../../../ui/component/CommonFullScreenActivityTitle'
import ActivitySubView from '../ActivitySubView';
import { G_UserData, G_Prompt, G_SignalManager } from '../../../../init';
import UIHelper from '../../../../utils/UIHelper';
import { Lang } from '../../../../lang/Lang';
import { handler } from '../../../../utils/handler';
import { SuperCheckinConst } from '../../../../const/SuperCheckinConst';
import { SignalConst } from '../../../../const/SignalConst';
import { SuperCheckinHelper } from './SuperCheckinHelper';
import CommonCustomListViewEx from '../../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class SuperCheckinView extends ActivitySubView {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _scrollView: CommonCustomListViewEx = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _mask: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _moduleFlg: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnGet: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _alreadyGet: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _curSelect: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _curSelect2: cc.Label = null;

    @property(cc.Prefab)
    SuperCheckinItemCell:cc.Prefab = null;

    _curSelectNum: number;
    _curSelectIndexs: any;
    _signalGetReward: any;
    _signalCleanData: any;

    ctor() {
        this._curSelectIndexs = {};
        this._curSelectNum = 0;
        UIHelper.addEventListener(this.node, this._btnGet._button, 'SuperCheckinView', '_onBtnGet');
    }
    onCreate() {
        this.ctor();
        this._btnGet.setString(Lang.get('common_receive'));
        this._scrollView.setTemplate(this.SuperCheckinItemCell);
        this._scrollView.setCallback(handler(this, this._onCellUpdate), handler(this, this._onCellSelected), handler(this, this._scrollEventCallback));
        this._scrollView.setCustomCallback(handler(this, this._onCellTouch));

        this._mask.node.zIndex = (SuperCheckinConst.ZORDER_GETBTN);
        this._moduleFlg.node.zIndex = (SuperCheckinConst.ZORDER_MODULE);
        this._btnGet.node.zIndex = (SuperCheckinConst.ZORDER_GETBTN);
        this._alreadyGet.node.zIndex = (SuperCheckinConst.ZORDER_ALREADYGET);
    }
    _updateListView() {
        var awards = SuperCheckinHelper.getAwardList();
        var lineCount = Math.ceil(awards.length / SuperCheckinConst.CELLITEM_NUM);
        this._scrollView.clearAll();
        this._scrollView.resize(lineCount);
    }
    _onCellUpdate(cellItem, cellIndex) {
        var curCellFirstItemIndex = cellIndex * SuperCheckinConst.CELLITEM_NUM + SuperCheckinConst.CELLITEM_FIRST;
        var curCelllastItemIndex = (cellIndex + 1) * SuperCheckinConst.CELLITEM_NUM;
        var cellData = [];
        var awards = SuperCheckinHelper.getAwardList();
        if (awards.length > 0) {
            for (var index = curCellFirstItemIndex; index<=curCelllastItemIndex; index++) {
                var award = awards[index-1];
                if (award) {
                    if (this._curSelectIndexs[index]) {
                        award.selected = true;
                    } else {
                        award.selected = false;
                    }
                    cellData.push(award);
                }
            }
            cellItem.updateUI(cellIndex, cellData);
        }
    }
    _onCellSelected(cellItem, cellIndex) {
    }
    _onCellTouch(cellIndex, itemTag) {
        this.selectIndex(itemTag);
    }
    _scrollEventCallback(sender, eventType) {
    }
    enterModule() {
        this._refreshAwards();
    }
    exitModule(){
        this._scrollView.clearAll();
    }
    _refreshAwards() {
        var isTodayCheckin = G_UserData.getActivitySuperCheckin().isTodayCheckin();
        if (isTodayCheckin) {
            this._curSelectIndexs = G_UserData.getActivitySuperCheckin().getLastCheckinIndexs();
            this._curSelectNum = SuperCheckinHelper.getMaxSelectNum();
        } else {
            this._curSelectIndexs = {};
            this._curSelectNum = 0;
        }
        this._refreshItemsState();
        if (isTodayCheckin) {
            this._btnGet.node.active = (false);
            this._alreadyGet.node.active = (true);
        } else {
            this._btnGet.node.active = (true);
            this._alreadyGet.node.active = (false);
        }
    }
    selectIndex(itemTag) {
        var isTodayCheckin = G_UserData.getActivitySuperCheckin().isTodayCheckin();
        if (isTodayCheckin) {
            return;
        }
        if (this._curSelectIndexs[itemTag]) {
            this._curSelectIndexs[itemTag] = false;
            this._curSelectNum = this._curSelectNum - 1;
        } else {
            var maxNum = SuperCheckinHelper.getMaxSelectNum();
            if (this._curSelectNum >= maxNum) {
                G_Prompt.showTip(Lang.get('lang_activity_super_checkin_full', { num: maxNum }));
                return;
            }
            this._curSelectIndexs[itemTag] = true;
            this._curSelectNum = this._curSelectNum + 1;
        }
        this._refreshItemsState();
    }
    _refreshItemsState() {
        this._updateListView();
        this._curSelect.string = (this._curSelectNum).toString();
        this._curSelect2.string = (SuperCheckinHelper.getMaxSelectNum()).toString();
    }
    onEnter() {
        this._signalGetReward = G_SignalManager.add(SignalConst.EVENT_ACT_CHECKIN_SUPER_SUCCESS, handler(this, this._onEventCheckin));
        this._signalCleanData = G_SignalManager.add(SignalConst.EVENT_CLEAN_DATA_CLOCK, handler(this, this._onEventCleanData));
        this._updateListView();
    }
    onExit() {
        this._signalGetReward.remove();
        this._signalGetReward = null;
        this._signalCleanData.remove();
        this._signalCleanData = null;
    }
    _onEventCheckin(event, awards) {
        this._refreshAwards();
        if (awards) {
            G_Prompt.showAwards(awards);
        }
    }
    _onEventCleanData() {
        this._refreshAwards();
    }
    _onBtnGet() {
        var isTodayCheckin = G_UserData.getActivitySuperCheckin().isTodayCheckin();
        if (isTodayCheckin) {
            return;
        }
        var maxNum = SuperCheckinHelper.getMaxSelectNum();
        if (this._curSelectNum != maxNum) {
            G_Prompt.showTip(Lang.get('lang_activity_super_checkin_not_enough', { num: maxNum }));
            return;
        }
        var selectIndexs = [];
        var awards = SuperCheckinHelper.getAwardList();
        for (var i = 1; i<=awards.length; i++) {
            if (this._curSelectIndexs[i]) {
                selectIndexs.push(i);
            }
        }
        G_UserData.getActivitySuperCheckin().c2sActCheckinSuper(selectIndexs);
    }

}
