const { ccclass, property } = cc._decorator;

import CommonNormalSmallPop2 from '../../../ui/component/CommonNormalSmallPop2'
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal';
import { G_UserData, G_SignalManager, G_SceneManager } from '../../../init';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { HorseRaceHelper } from './HorseRaceHelper';
import PopupBase from '../../../ui/PopupBase';
import { SignalConst } from '../../../const/SignalConst';

@ccclass
export default class PopupHorseRaceNotice extends PopupBase {

    @property({ type: CommonNormalSmallPop2, visible: true })
    _popupBG: CommonNormalSmallPop2 = null;

    @property({ type: cc.Label, visible: true })
    _textRaceCount: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textGotToday: cc.Label = null;

    @property({ type: CommonResourceInfo, visible: true })
    _reward1: CommonResourceInfo = null;

    @property({ type: CommonResourceInfo, visible: true })
    _reward2: CommonResourceInfo = null;

    @property({ type: cc.Label, visible: true })
    _textTodayFull: cc.Label = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnStart: CommonButtonLevel0Normal = null;

    private _listenerHorseRaceStart;
    onCreate() {
        this.node.name = "PopupHorseRaceNotice";
        this._popupBG.addCloseEventListener(handler(this, this._onCloseClick));
        this._popupBG.setTitle(Lang.get('horse_race_title'));
        this._btnStart.setString(Lang.get('horse_race_start'));
        this._btnStart.addClickEventListenerEx(handler(this, this._onBtnStartClick));
        var raceCount = G_UserData.getHorseRace().getRaceCount() + 1;
        this._textRaceCount.string = (Lang.get('horse_race_count', { count: raceCount }));
        this._textGotToday.string = (Lang.get('horse_race_reward_title'));
        this._textTodayFull.node.active = (false);
    }

    public onEnter() {
        var soul = G_UserData.getHorseRace().getHorseSoul();
        this._reward1.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_HORSE_SOUL, soul);
        var book = G_UserData.getHorseRace().getHorseBook();
        this._reward2.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS, book);
        var isFull = HorseRaceHelper.isRewardFull();
        this._textTodayFull.node.active = (isFull);
        this._listenerHorseRaceStart = G_SignalManager.add(SignalConst.EVENT_HORSE_RACE_TOKEN, handler(this, this._onEventHorseRaceToken));
    }

    public onExit() {
        this._listenerHorseRaceStart.remove();
        this._listenerHorseRaceStart = null;
    }

    private _onBtnStartClick() {
        G_UserData.getHorseRace().c2sWarHorseRideStart();
    }

    private _onEventHorseRaceToken() {
        this.close();
    }

    private _onCloseClick() {
        G_SceneManager.popScene();
    }
}