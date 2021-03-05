const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { ExploreUIHelper } from './ExploreUIHelper';
import { Lang } from '../../../lang/Lang';
import { ExploreConst } from '../../../const/ExploreConst';
import { DataConst } from '../../../const/DataConst';
import { G_ServerTime, G_UserData, G_ConfigLoader } from '../../../init';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { ExploreData } from '../../../data/ExploreData';
import { ExploreEventData } from '../../../data/ExploreEventData';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import UIHelper from '../../../utils/UIHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';

@ccclass
export default class EventRebelNode extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _rebelBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRebelContent: cc.Label = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar2: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar1: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvatar3: CommonHeroAvatar = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _costInfo: CommonResourceInfo = null;

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
        this._discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(eventData.getEvent_type());
        this._configData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_REBEL).get(eventData.getValue1());
        this._iconDrops = [
            this._iconDrop1,
            this._iconDrop2,
            this._iconDrop3
        ];

        this._textRebelContent.string = this._discoverData.description;
        this._textRebelContent.spacingX = 6;
        var rewards = ExploreUIHelper.makeExploreRebelRewards(this._configData);
        for (var k in this._iconDrops) {
            var v = this._iconDrops[k];
            var reward = rewards[k];
            if (reward) {
                v.initUI(reward.type, reward.value, reward.size);
                v.node.active = true;
            } else {
                v.node.active = false;
            }
        }
        this._refreshBtn();
        this._costInfo.onLoad();
        this._costInfo.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, this._configData.cost);
        this._costInfo.showResName(true, Lang.get('explore_rebel_cost'));
        this._costInfo.setResNameFontSize(ExploreConst.COST_NAME_SIZE);
        this._costInfo.setTextColorToDTypeColor(null);
        this._costInfo.setResNameColor(ExploreConst.COST_NAME_COLOR);
        
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');

        this._heroAvatar1.init();
        this._heroAvatar2.init();
        this._heroAvatar3.init();

        this._heroAvatar1.updateUI(6021, null, false, 0);
        this._heroAvatar2.updateUI(6011, null, false, 0);
        this._heroAvatar3.updateUI(6041, null, false, 0);
        this._scheduleHandler = handler(this, this._onTimer);
        this.schedule(this._scheduleHandler, 0.5);
    }

    onDestroy() {
        this.unschedule( this._scheduleHandler);
        this._scheduleHandler = null;
    }
    _refreshBtn() {
        var param = this._eventData.getParam();
        if (param == 0) {
            this._btnFight.setString(Lang.get('explore_rebel_fight'));
        } else {
            this._btnFight.setEnabled(false);
            this._btnFight.setString(Lang.get('explore_rebel_beat'));
        }
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
        this._refreshBtn();
    }
    _onTimer() {
        this._leftTimeLabel.string = G_ServerTime.getLeftSecondsString(this._eventData.getEndTime(), '00:00:00');
    }

}