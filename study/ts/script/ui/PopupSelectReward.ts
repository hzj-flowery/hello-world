const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Normal from './component/CommonButtonLevel0Normal'

import CommonButtonLevel0Highlight from './component/CommonButtonLevel0Highlight'

import CommonNormalMidPop from './component/CommonNormalMidPop'
import CommonCustomListView from './component/CommonCustomListView';
import PopupBase from './PopupBase';
import { Lang } from '../lang/Lang';
import { handler } from '../utils/handler';
import PopupSelectRewardItemCell from './PopupSelectRewardItemCell';
import UIHelper from '../utils/UIHelper';
import { G_ResolutionManager } from '../init';

@ccclass
export default class PopupSelectReward extends PopupBase {
    public static path = 'common/PopupSelectReward';

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listItem: CommonCustomListView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _labelTips: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOK: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    popupSelectRewardItemCell: cc.Prefab = null;
    _title: any;
    _callback: any;
    _isShowCheck: boolean;
    _listCell: any[];
    _itemList: any;
    _boxIndex: number = -1;

    ctor(title, callback) {
        this._title = title || Lang.get('common_btn_help');
        this._callback = callback;
        this._isShowCheck = true;
        this._isClickOtherClose = true;
        this.init();
    }
    init() {
        this._commonNodeBk.setTitle(this._title);
        this._btnOK.setString(Lang.get('common_btn_sure'));
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._btnOK.addClickEventListenerEx(handler(this, this.onBtnOk));
        this._btnCancel.addClickEventListenerEx(handler(this, this.onBtnCancel));
    }
    updateUI(awards) {
        this._listItem.removeAllChildren();
        this._listCell = [];
        this._itemList = awards;
        for (var index in awards) {
            var award = awards[index];
            var iconCell = this._createReward(index);
            iconCell.updateUI(award.type, award.value, award.size);
            this._listCell.push(iconCell);
            this._listItem.pushBackCustomItem(iconCell.node);
        }
        // if (awards.length > 3) {
        //     this._listItem.setTouchEnabled(true);
        //     this._listItem.doLayout();
        // } else {
        //     this._listItem.adaptWithContainerSize();
        //     this._listItem.setTouchEnabled(false);
        // }
    }
    _createReward(index) {
        var iconTemplate = cc.instantiate(this.popupSelectRewardItemCell).getComponent(PopupSelectRewardItemCell);
        iconTemplate.ctor(index, handler(this, this._onClickCheckBox));
        iconTemplate.showCheck(this._isShowCheck);
        return iconTemplate;
    }
    onlyShowOkButton() {
        this._btnCancel.setVisible(false);
        this._btnOK.node.x = (0);
    }
    showCheck(show) {
        this._isShowCheck = show;
        for (var i in this._listCell) {
            var cell = this._listCell[i];
            cell.showCheck(show);
        }
    }
    _onClickCheckBox(boxIndex) {
        for (var i in this._listCell) {
            var cell = this._listCell[i];
            cell.setCheck(false);
            if (i == boxIndex) {
                cell.setCheck(true);
            }
        }
        this._boxIndex = boxIndex;
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
    onBtnCancel() {
        this.close();
    }
    onBtnOk() {
        if (!this._isShowCheck) {
            this.close();
            return;
        }
        var isBreak;
        if (this._callback) {
            var awardItem = this._itemList[this._boxIndex];
            isBreak = this._callback(awardItem, this._boxIndex);
        }
        if (!isBreak) {
            this.close();
        }
    }
    setTip(tip) {
        this._labelTips.string = (tip);
    }

}