const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonSweep from '../../../ui/component/CommonSweep'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import DailySweepBoxNode from './DailySweepBoxNode';
import DailySweepNode from './DailySweepNode';
import PopupBase from '../../../ui/PopupBase';
import DailyChallengeNode from './DailyChallengeNode';
import { G_ConfigLoader, G_SignalManager } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { withDefault } from '../../../utils/withDefault';
import { SignalConst } from '../../../const/SignalConst';

@ccclass
export default class DailyChallenge extends PopupBase {

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

        const op_type = this._results[0].op_type;
        const title = [null, 'challenge_title', 'sweep_title']
        this._sweepBG.setTitle(Lang.get(title[op_type]));
        //允许玩家提前关闭
        // this._sweepBG.setCloseVisible(false);
    }

    public onEnter() {
        this.unschedule(handler(this, this._update));
        this.schedule(handler(this, this._update), this._sweepTimeDelay);
        for (let i = 0; i < this._results.length; i++) {
            this._addItem(i)
        }
        this._btnFinish.setVisible(true);
        this._isSweepFinish = true;
        this._isClickOtherClose = true;
        this._sweepBG.setCloseVisible(true);
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
        return
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
        var layer = 0;
        var cell = null;
        title = Excluded[(result.id / 1000).toFixed()];
        layer = result.id % 1000 - 1;
        cell = cc.instantiate(this._sweepNodePrefab).getComponent(DailyChallengeNode);
        cell.init(result.rewards, result.addRewards, result.pass, title, layer,idx);
        this._sweepBG.pushItem(cell.node);
        this._sweepBG.scrollToBottom();
    }
}

const Excluded = {
    1: "校场（武将经验）",
    2: "山贼营寨（银两）",
    3: "七星台（突破丹）",
    4: "锻造炉（装备精炼）",
    5: "楼兰古城（宝物经验）",
    6: "秦始皇陵（宝物精炼）",
    7: "神兵进阶石",
    8: "神兽经验"
}