const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import { G_UserData, G_SignalManager, G_Prompt } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { SiegeHelper } from './SiegeHelper';
import { TextHelper } from '../../../utils/TextHelper';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import PopupBase from '../../../ui/PopupBase';
import ListView from '../recovery/ListView';
import PopupHurtRewardCell from './PopupHurtRewardCell';

@ccclass
export default class PopupHurtReward extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _popupBG: CommonNormalMidPop = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHurtNum: cc.Label = null;

    @property({
        type: ListView,
        visible: true
    })
    _listReward: ListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCon: cc.Node = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBar: cc.ProgressBar = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _loadingHightlight: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item1: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount1: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item2: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount2: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item3: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount3: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item4: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCount4: cc.Label = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _popupHurtRewardCellPrefab: cc.Prefab = null;

    private static REWARD_TYPE_DAMAGE = 1
    private static REWARD_TYPE_COUNT = 2
    private static REWARD_COUNT = 4 	//次数奖励的数量

    private _level;
    private _rewardList;
    private _sortedPersonList: any[];
    private _signalHurtReward;

    public onCreate() {
        this.setClickOtherClose(true);
        this._level = G_UserData.getSiegeData().getUserLevel();
        this._rewardList = {};

        this._popupBG.setTitle(Lang.get('siege_damage_reward'));
        this._popupBG.addCloseEventListener(() => {
            this.closeWithAction();
        });
        this._rewardList[PopupHurtReward.REWARD_TYPE_DAMAGE] = SiegeHelper.parseRewardList(this._level, PopupHurtReward.REWARD_TYPE_DAMAGE);
        this._rewardList[PopupHurtReward.REWARD_TYPE_COUNT] = SiegeHelper.parseRewardList(this._level, PopupHurtReward.REWARD_TYPE_COUNT);
    }

    public onEnter() {
        var myDamage = G_UserData.getSiegeData().getTotal_hurt();
        var myDamageStr = TextHelper.getAmountText2(myDamage);
        this._textHurtNum.string = (myDamageStr);
        this._refreshHurtReward();
        this._refreshCountReward();
        this._signalHurtReward = G_SignalManager.add(SignalConst.EVENT_SIEGE_HURT_REWARD, handler(this, this._onEventHurtReward));
    }

    public onExit() {
        this._signalHurtReward.remove();
        this._signalHurtReward = null;
    }

    private _refreshHurtReward() {
        this._sortedPersonList = SiegeHelper.getSortedRewardList(this._rewardList[PopupHurtReward.REWARD_TYPE_DAMAGE]);
        var listView = this._listReward;
        listView.clearAll();
        listView.setTemplate(this._popupHurtRewardCellPrefab);
        listView.setCallback(handler(this, this._onItemUpdate));
        listView.setData(this._sortedPersonList);
    }

    private _onItemUpdate(node: cc.Node, index) {
        let item: PopupHurtRewardCell = node.getComponent(PopupHurtRewardCell);
        item.updateUI(this._sortedPersonList[index]);
    }

    private _refreshCountReward() {
        var rewardList:any[] = this._rewardList[PopupHurtReward.REWARD_TYPE_COUNT];
        var getNum = G_UserData.getSiegeData().getRewardCount();
        this._textCount.string = (Lang.get('siege_reward_count', { count: getNum }));
        var totalSize = rewardList[rewardList.length - 1].target_size;
        var percent = getNum / totalSize;
        this._loadingBar.progress = (percent);
        for (let i = 1; i <= PopupHurtReward.REWARD_COUNT; i++) {
            let rewardData = rewardList[i - 1];
            let iconText: cc.Label = this['_textCount' + i];
            iconText.string = (Lang.get('siege_reward_count', { count: rewardData.target_size }));
            let iconNode: CommonIconTemplate = this['_item' + i];
            iconNode.unInitUI();
            iconNode.initUI(rewardData.award_type, rewardData.award_value, rewardData.award_size);
            iconNode.setTouchEnabled(true);
            iconNode.removeLightEffect();
            let isget = G_UserData.getSiegeData().isCountRewardGet(rewardData.id);
            if (getNum >= rewardData.target_size) {
                if (isget) {
                    iconNode.setIconMask(true);
                } else {
                    iconNode.setIconSelect(true);
                    iconNode.setIconMask(false);
                    iconNode.showLightEffect();
                }
            } else {
                iconNode.setIconSelect(false);
                iconNode.setIconMask(false);
            }
            if (getNum >= rewardData.target_size && isget == false) {
                iconNode.setCallBack(() => {
                    if (G_UserData.getSiegeData().isExpired()) {
                        G_UserData.getSiegeData().refreshRebelArmy();
                        return;
                    }
                    G_UserData.getSiegeData().c2sRebArmyHurtReward(rewardData.id);
                });
            } else {
                iconNode.setCallBack(null);
            }
        }
    }

    private _onEventHurtReward(eventName, rewards) {
        G_Prompt.showAwards(rewards);
        this._listReward.clearAll();
        this._refreshHurtReward();
        this._refreshCountReward();
    }
}