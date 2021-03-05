const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { G_ServerTime, G_UserData, G_ConfigLoader } from '../../../init';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { ExploreConst } from '../../../const/ExploreConst';
import { DataConst } from '../../../const/DataConst';
import { ExploreUIHelper } from './ExploreUIHelper';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { ExploreData } from '../../../data/ExploreData';
import { ExploreEventData } from '../../../data/ExploreEventData';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import ViewBase from '../../ViewBase';

@ccclass
export default class EventRebelBossNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _hpPercent: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHpValue: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _talkString: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _priceInfo: CommonResourceInfo = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconDrop4: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconDrop3: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconDrop2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _iconDrop1: CommonIconTemplate = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnFight: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _countDownNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _leftTimeLabel: cc.Label = null;

    private _eventData: ExploreEventData;
    private _discoverData;
    private _configData;
    private _iconDrops: CommonIconTemplate[];
    private _scheduleHandler;

    setUp(eventData) {
        this._eventData = eventData;
        this._discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(this._eventData.getEvent_type());
        this._configData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_REBEL).get(this._eventData.getValue1());
        this._iconDrops = [
            this._iconDrop1,
            this._iconDrop2,
            this._iconDrop3,
            this._iconDrop4
        ];
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');
        this._heroAvatar.init();
        this._heroAvatar.updateUI(405, null, false, 0);
    }

    protected onCreate() {

    }
    protected onEnter() {
        this._setTalk();
        this._setPriceInfo();
        this._refreshHp();
        this._refreshBtn();
        this._refreshDrop();
        this._scheduleHandler = handler(this, this._onTimer);
        this.schedule(this._scheduleHandler, 0.5);
    }
    protected onExit() {
        this.unschedule( this._scheduleHandler);
        this._scheduleHandler = null;
    }

    _setTalk() {
        this._talkString.string = this._discoverData.description;
    }
    _setPriceInfo() {
        this._priceInfo.onLoad();
        this._priceInfo.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, this._configData.cost);
        this._priceInfo.showResName(true, Lang.get('explore_rebel_cost'));
        this._priceInfo.setResNameFontSize(ExploreConst.COST_NAME_SIZE);
        this._priceInfo.setTextColorToDTypeColor(null);
        this._priceInfo.setResNameColor(ExploreConst.COST_NAME_COLOR);
    }
    //刷新掉落
    _refreshDrop() {
        var rewards = ExploreUIHelper.makeExploreRebelRewards(this._configData);
        for (var k in this._iconDrops) {
            var v: CommonIconTemplate = this._iconDrops[k];
            var rewardIndex: number = parseInt(k) + 1;
            var reward = rewards[k];
            if (reward) {
                v.initUI(reward.type, reward.value, reward.size);
                v.node.active = true;
            } else {
                v.node.active = false;
            }
        }
    }
    //刷新按钮状态
    _refreshBtn() {
        var param = this._eventData.getParam();
        if (param == 0) {
            this._btnFight.setString(Lang.get('explore_rebel_fight'));
        } else {
            this._btnFight.setEnabled(false);
            this._btnFight.setString(Lang.get('explore_rebel_beat'));
        }
    }
    //刷新血量
    _refreshHp() {
        var nowHp = [
            this._eventData.getValue2(),
            this._eventData.getValue3(),
            this._eventData.getValue4(),
            this._eventData.getValue5(),
            this._eventData.getValue6(),
            this._eventData.getValue7()
        ];
        var nowTotalHp = 0;
        for (var i in nowHp) {
            var v = nowHp[i];
            nowTotalHp = nowTotalHp + v;
        }
        var totalHp = this._eventData.getValue8();
        this._textHpValue.string = nowTotalHp + (' / ' + totalHp);
        this._hpPercent.progress = Math.min(1, Math.max(0, nowTotalHp / totalHp));
    }
    //攻打
    onFightClick() {
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, this._configData.cost);
        if (success) {
            G_UserData.getExplore().c2sExploreDoEvent(this._eventData.getEvent_id());
        }
    }
    //获取背景id
    getBackground() {
        return this._configData.in_res;
    }
    //处理事件
    doEvent() {
        G_UserData.getExplore().setEventParamById(this._eventData.getEvent_id(), 1);
    }
    _onTimer() {
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');
    }

}