const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonSweep from '../../../ui/component/CommonSweep'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import DailySweepBoxNode from './DailySweepBoxNode';
import DailySweepNode from './DailySweepNode';
import PopupBase from '../../../ui/PopupBase';

@ccclass
export default class DailySweep extends PopupBase {

    @property({
        type: CommonSweep,
        visible: true
    })
    _sweepBG: CommonSweep = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnFinish: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _sweepBoxNodePrefab: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _sweepNodePrefab: cc.Prefab = null;

    private _sweepTimeDelay;
    private _count;
    private _layer;
    private _callBack;
    private _isSweepFinish;
    private _results: any[];

    public init(nextLayer, results, callback) {
        this._sweepTimeDelay = 0.25;
        this._count = 0;
        this._layer = nextLayer;
        this._callBack = callback;
        this._isSweepFinish = false;
        this._results = results;
    }

    public onCreate() {
        this._btnFinish.setString(Lang.get('challenge_tower_sweep_finish'));
        this._btnFinish.setVisible(false);
        this._sweepBG.setCloseFunc(handler(this, this.closeWithAction));
        this._sweepBG.setTitle(Lang.get('sweep_title'));
        //允许玩家提前关闭
        // this._sweepBG.setCloseVisible(false);
    }

    public onEnter() {
        this.unschedule(handler(this, this._update));
        this.schedule(handler(this, this._update), this._sweepTimeDelay)
    }

    public onExit() {
        this.unschedule(handler(this, this._update));
    }

    public closeWithAction() {
        this._isSweepFinish = true;
            this._isClickOtherClose = true;
        if (this._isSweepFinish) {
            super.closeWithAction();
            this._callBack();
        }
    }

    public onCloseClick() {
        this.closeWithAction();
    }

    private _update(dt) {
        this._count = this._count + 1;
        if (this._count > this._results.length) {
            this._btnFinish.setVisible(true);
            this._isSweepFinish = true;
            this._isClickOtherClose = true;
            this._sweepBG.setCloseVisible(true);
        } else {
            this._addItem(this._count - 1);
        }
    }

    private _addItem(idx) {
        var result = this._results[idx];
        var title = '';
        var cell = null;
        if (result.from == 'box') {
            title = Lang.get('challenge_dailyChallenge_sweep_title2');
            cell = cc.instantiate(this._sweepBoxNodePrefab).getComponent(DailySweepBoxNode);
            cell.init(result.rewards, title);
        } else if (result.from == 'dailyChallenge') {
            title = Lang.get('challenge_dailyChallenge_sweep_title1', { count: this._layer });
            this._layer = this._layer + 1;
            cell = cc.instantiate(this._sweepNodePrefab).getComponent(DailySweepNode);
            cell.init(result.rewards, result.addRewards, title);
        }
        this._sweepBG.pushItem(cell.node);
        this._sweepBG.scrollToBottom();
    }
}