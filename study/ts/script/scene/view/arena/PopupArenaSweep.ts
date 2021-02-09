const { ccclass, property } = cc._decorator;

import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonSweep from '../../../ui/component/CommonSweep';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import PopupArenaSweepCell from './PopupArenaSweepCell';


@ccclass
export default class PopupArenaSweep extends PopupBase {

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

    protected preloadResList = [
        {path:Path.getPrefab("PopupArenaSweepCell","arena"),type:cc.Prefab}
    ]

    private _sweepTimeDelay = 0;
    private _sweepCurrTime = 0;
    private _count = 0;
    private _isWin: boolean;
    private _rewards: any;
    private _popupArenaSweepCell: any;

    public setInitData(rewards, isWin) {
        this._sweepTimeDelay = 0.5;
        this._sweepCurrTime = 0;
        this._count = 0;
        this._isWin = isWin;
        this._rewards = rewards;
    }
    onCreate() {
        this._popupArenaSweepCell = cc.resources.get(Path.getPrefab("PopupArenaSweepCell","arena"));
        this._btnFinish.setString(Lang.get('arena_sweep_finish'));
        this._btnFinish.setVisible(false);
        this._btnFinish.addClickEventListenerEx(handler(this,this.onCloseClick));
        this._sweepBG.setCloseFunc(handler(this, this.onCloseClick));
        this._sweepBG.setTitle(Lang.get('arena_sweep_title'));
        this.setClickOtherClose(true);
    }
    onEnter() {
        this.schedule(handler(this, this._update),0)
    }
    onExit() {
        this.unschedule(handler(this, this._update));
    }
    private onCloseClick() {
        this.close();
    }
    _update(dt) {
        if (this._sweepCurrTime > this._sweepTimeDelay) {
            this._updateCell();
            this._sweepCurrTime = 0;
        }
        this._sweepCurrTime = this._sweepCurrTime + dt;
    }
    _updateCell() {
        
        if (this._count >= this._rewards.length) {
            this._btnFinish.setVisible(true);
        } else {
            this._addItem(this._count);
        }
        this._count = this._count + 1;
    }
    _addItem(idx) {
        var reward = this._rewards[idx];
        var title = Lang.get('arena_sweep_title1', { count: idx+1 });
        var cell = (cc.instantiate(this._popupArenaSweepCell) as cc.Node).getComponent(PopupArenaSweepCell);
        this._sweepBG.pushItem(cell.node);
        cell.updateInitData(title, reward.rewards, reward.turnRewards, reward.result, reward.addRewards);
        
        var [levelUp, upValue] = UserCheck.isLevelUp();
    }

}