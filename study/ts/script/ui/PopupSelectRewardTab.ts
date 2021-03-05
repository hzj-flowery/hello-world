const { ccclass, property } = cc._decorator;

import PopupSelectReward from './PopupSelectReward';
import CommonTabGroupSmallHorizon from './component/CommonTabGroupSmallHorizon';
import { Lang } from '../lang/Lang';
import { Path } from '../utils/Path';
import { handler } from '../utils/handler';
import { G_Prompt, G_ResolutionManager } from '../init';
import UIHelper from '../utils/UIHelper';

@ccclass
export default class PopupSelectRewardTab extends PopupSelectReward {
    public static path = 'common/PopupSelectRewardTab';
    @property({
        type: CommonTabGroupSmallHorizon,
        visible: true
    })
    _tabGroup: CommonTabGroupSmallHorizon = null;
    _selectTabIndex: number;

    ctor(title, callback) {
        super.ctor(title, callback);
        this._selectTabIndex = -1;
        this._boxIndex = -1;
    }
    init() {
        super.init();
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: 4,
            textList: [
                Lang.get('popup_select_tab1'),
                Lang.get('popup_select_tab2'),
                Lang.get('popup_select_tab3'),
                Lang.get('popup_select_tab4')
            ]
        };
        this._tabGroup.recreateTabs(param);
    }
    updateUI(itemList) {
        this._itemList = itemList;
        this._tabGroup.setTabIndex(0);
    }
    _onTabSelect(index, sender) {
        if (index + 1 == this._selectTabIndex) {
            return false;
        }
        this._selectTabIndex = index + 1;
        this._listItem.removeAllChildren();
        this._listCell = [];
        var awards = this._itemList['key' +  this._selectTabIndex];
        for (var i in awards) {
            var award = awards[i];
            var iconCell = this._createReward(i);
            iconCell.updateUI(award.type, award.value, award.size);
            this._listCell.push(iconCell);
            this._listItem.pushBackCustomItem(iconCell.node);
        }
        return true;
    }
    onEnter() {
        var touchPanel = this.node.getChildByName('touchPanel');
        if(touchPanel){
            touchPanel.setContentSize(G_ResolutionManager.getDesignCCSize());
            UIHelper.addClickEventListenerEx(touchPanel, handler(this, this.onBtnCancel));
        }
    }
    onExit() {
    }
    onBtnOk() {
        if (!this._isShowCheck) {
            this.close();
            return;
        }
        if (this._boxIndex < 0) {
            G_Prompt.showTip(Lang.get('recruit_choose_first'));
            return;
        }
        var isBreak;
        if (this._callback) {
            var awards = this._itemList['key' + this._selectTabIndex];
            var awardItem = awards[this._boxIndex];
            isBreak = this._callback(awardItem);
        }
        if (!isBreak) {
            this.close();
        }
    }
    setBtnEnabled(enable) {
        this._btnOK.setEnabled(enable);
    }
}