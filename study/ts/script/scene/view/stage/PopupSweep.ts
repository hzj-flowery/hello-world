const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonSweep from '../../../ui/component/CommonSweep'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import PopupSweepNode from './PopupSweepNode';
import { G_SignalManager, Colors } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { UserCheck } from '../../../utils/logic/UserCheck';

@ccclass
export default class PopupSweep extends PopupBase {

    @property({ type: CommonSweep, visible: true })
    _sweepBase: CommonSweep = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnReset: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnDone: CommonButtonLevel0Highlight = null;

    @property({ type: cc.Node, visible: true })
    _imageItem2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeItem2: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _imageItem1: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeItem1: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _popupSweepNodePrefab: cc.Prefab = null;

    private _count;
    private _results: any[];
    private _callback;
    private _isSweepFinish;
    private _showItems: any[];

    private _nodeItems: cc.Node[];
    private _imageItems: cc.Node[];

    public init(callback) {
        this._count = 0;
        this._results = null;
        this._callback = callback;
        this._isSweepFinish = false;
        this._showItems = [];

        this._nodeItems = [this._nodeItem1, this._nodeItem2];
        this._imageItems = [this._imageItem1, this._imageItem2];
    }

    public onCreate() {
        this._btnDone.setString(Lang.get('common_btn_sure'));
        this._btnReset.setString(Lang.get('stage_fight_ten', { count: 10 }));
        this._btnDone.setVisible(false);
        this._btnReset.setVisible(false);
        this._sweepBase.setCloseFunc(handler(this, this._onCloseClick));
        this._sweepBase.setTitle(Lang.get('sweep_title'));
        this._isClickOtherClose = false;
        this._sweepBase.setCloseVisible(false);
    }

    public onEnter() {
    }

    public onExit() {
    }

    private _onCloseClick() {
        if (this._isSweepFinish) {
            this.closeWithAction();
        }
    }

    public onBtnDone() {
        this._onCloseClick();
    }

    public onBtnReset() {
        var isBreak;
        if (this._callback) {
            isBreak = this._callback();
        }
        if (!isBreak) {
            this.close();
        }
    }

    public setStart() {
        this._count = 0;
        this._checkNextItem();
        for (let i = 0; i < this._results.length; i++) {
            this._count = this._count + 1;
            this._addItem();
        }
        this._addTotal();
        G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_START);
        this._btnDone.setVisible(true);
        this._btnReset.setVisible(true);
        let [levelUp, upValue] = UserCheck.isLevelUp();
        G_SignalManager.dispatch(SignalConst.EVENT_SWEEP_FINISH);
        this._isSweepFinish = true;
        this._isClickOtherClose = true;
        this._sweepBase.setCloseVisible(true);
    }

    private _addItem() {
        var result = this._results[this._count - 1];
        if (result) {
            var cell: PopupSweepNode = cc.instantiate(this._popupSweepNodePrefab).getComponent(PopupSweepNode);
            cell.init(result, this._count, handler(this, this._checkNextItem));
            this._sweepBase.pushItem(cell.node);
            this._checkFragment(result);
            cell.playEnterAction();
        }
    }

    private _addTotal() {
        var totalResults = this._getTotalResult();
        var cell: PopupSweepNode = cc.instantiate(this._popupSweepNodePrefab).getComponent(PopupSweepNode);
        cell.init(totalResults, 0, handler(this, this._checkNextItem));
        this._sweepBase.pushItem(cell.node);
        cell.playEnterAction();
    }

    private _checkNextItem() {
        return;
        this._count = this._count + 1;
        if (this._count > this._results.length + 1) {
            G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_START);
            this._btnDone.setVisible(true);
            this._btnReset.setVisible(true);
            let [levelUp, upValue] = UserCheck.isLevelUp();
            G_SignalManager.dispatch(SignalConst.EVENT_SWEEP_FINISH);
            this._isSweepFinish = true;
            this._isClickOtherClose = true;
            this._sweepBase.setCloseVisible(true);
        } else if (this._count == this._results.length + 1) {
            this._addTotal();
        } else if (this._count <= this._results.length) {
            this._addItem();
        }
    }

    private _clearTotalReward() {
    }

    public updateReward(results, awardList) {
        this._isSweepFinish = false;
        this._isClickOtherClose = false;
        this._sweepBase.setCloseVisible(false);
        this._clearTotalReward();
        this._btnDone.setVisible(false);
        this._btnReset.setVisible(false);
        this._sweepBase.clearDropList();
        this._count = 0;
        this._results = results;
        this._setShowItems(awardList);
    }

    private _getSweepCount(type, value) {
        var count = 0;
        for (let i in this._results) {
            var v = this._results[i];
            for (let _ in v.rewards) {
                var item = v.rewards[_];
                if (item.type == type && item.value == value) {
                    count = count + item.size;
                }
            }
        }
        return count;
    }

    private _setShowItems(awardList) {
        this._showItems = [];
        for (let i = 0; i < this._imageItems.length; i++) {
            this._imageItems[i].active = false;
        }
        var count = 1;
        for (let i in awardList) {
            var v = awardList[i];
            if (v.type == TypeConvertHelper.TYPE_FRAGMENT) {
                if (count > 2) {
                    return;
                }
                this._imageItems[count - 1].active = true;
                var param = TypeConvertHelper.convert(v.type, v.value);
                var hasNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value);
                var sweepNum = this._getSweepCount(v.type, v.value);
                var needNum = param.cfg.fragment_num;
                var itemColor = param.cfg.color;
                var item = {
                    name: param.name,
                    type: v.type,
                    value: v.value,
                    countNow: hasNum - sweepNum,
                    needCount: needNum,
                    color: itemColor
                };
                this._showItems.push(item);
                this._updateRichText(count - 1, item);
                count = count + 1;
            }
        }
    }

    private _updateRichText(idx, item) {
        this._nodeItems[idx].removeAllChildren();
        var countTotal = item.countNow + ('/' + item.needCount);
        var showColor = Colors.getColor(item.color);
        var label = RichTextExtend.createWithContent(Lang.get('sweep_item', {
            itemName: item.name,
            itemColor: Colors.colorToNumber(showColor),
            count: countTotal
        }));
        label.node.setAnchorPoint(0.5, 0.5);
        label.node.y = 3;
        this._nodeItems[idx].addChild(label.node);
        var action1 = cc.scaleTo(0.2, 1.2);
        var action2 = cc.scaleTo(0.1, 1);
        var action = cc.sequence(action1, action2);
        this._nodeItems[idx].runAction(action);
    }

    private _checkFragment(items) {
        for (let i in items.rewards) {
            let v = items.rewards[i];
            if (v.type != TypeConvertHelper.TYPE_FRAGMENT) {
                continue;
            }
            for (let j = 0; j < 2; j++) {
                if (v.value == this._showItems[j].value) {
                    this._showItems[j].countNow = this._showItems[j].countNow + v.size;
                    let item = this._showItems[j];
                    this._updateRichText(j, item);
                    break;
                }
            }
        }
    }

    public _getTotalResult() {
        var totalResults = {
            money: 0,
            exp: 0,
            rewards: []
        };
        for (let i = 0; i < this._results.length; i++) {
            var v = this._results[i];
            totalResults.exp = totalResults.exp + v.exp;
            totalResults.money = totalResults.money + v.money;
            if (v.addRewards) {
                for (let j in v.addRewards) {
                    var add = v.addRewards[j];
                    totalResults.money = totalResults.money + add.reward.size;
                }
            }
            for (let k in v.rewards) {
                var reward = v.rewards[k];
                this._addTotalReward(totalResults.rewards, reward);
            }
        }
        return totalResults;
    }

    public _addTotalReward(total, reward) {
        var isInTotal = false;
        for (let i in total) {
            var v = total[i];
            if (reward.type == v.type && reward.value == v.value) {
                v.size = v.size + reward.size;
                isInTotal = true;
            }
        }
        if (!isInTotal) {
            total.push(reward);
        }
    }

    public setBtnResetString(s) {
        this._btnReset.setString(s);
    }

    public setCallback(callback) {
        this._callback = callback;
    }
}