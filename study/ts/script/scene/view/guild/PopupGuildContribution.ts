const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop';
import PopupBase from '../../../ui/PopupBase';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import GuildContributionBoxNode from './GuildContributionBoxNode';
import GuildContributionItemCell from './GuildContributionItemCell';

@ccclass
export default class PopupGuildContribution extends PopupBase {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _panelBg: CommonNormalLargePop = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRemainCount: cc.Label = null;

    @property({
        type: GuildContributionBoxNode,
        visible: true
    })
    _guildContributionBoxNode: GuildContributionBoxNode = null;



    _guildContributionList: any[];
    _signalGuildContribution: any;
    _signalGuildContributionBoxReward: any;
    _signalGuildBaseInfoUpdate: any;
    _signalGuildGetUserGuild: any;



    onCreate() {
        this._guildContributionBoxNode.initData();
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        this._panelBg.setTitle('军团祭祀');
    }
    onEnter() {
        this._signalGuildContribution = G_SignalManager.add(SignalConst.EVENT_GUILD_CONTRIBUTION, handler(this, this._onEventGuildContribution));
        this._signalGuildContributionBoxReward = G_SignalManager.add(SignalConst.EVENT_GUILD_CONTRIBUTION_BOX_REWARD, handler(this, this._onEventGuildContributionBoxReward));
        this._signalGuildBaseInfoUpdate = G_SignalManager.add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(this, this._onEventGuildBaseInfoUpdate));
        this._signalGuildGetUserGuild = G_SignalManager.add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(this, this._onEventGuildGetUserGuild));
        G_UserData.getGuild().c2sGetGuildBase();
    }
    onExit() {
        this._signalGuildContribution.remove();
        this._signalGuildContribution = null;
        this._signalGuildContributionBoxReward.remove();
        this._signalGuildContributionBoxReward = null;
        this._signalGuildBaseInfoUpdate.remove();
        this._signalGuildBaseInfoUpdate = null;
        this._signalGuildGetUserGuild.remove();
        this._signalGuildGetUserGuild = null;
    }
    _onClickClose() {
        this.close();
    }
    _updateList() {
        this._guildContributionList = GuildDataHelper.getGuildContributionList();

        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.setContentSize(883, 372);

        //更新任务的数据
        for (let i = 0; i < this._guildContributionList.length; i++) {
            if (this._guildContributionList[i]) {
                var resource = cc.resources.get("prefab/guild/GuildContributionItemCell");
                var node1 = cc.instantiate(resource) as cc.Node;
                let cell = node1.getComponent(GuildContributionItemCell) as GuildContributionItemCell;
                this._listItemSource.content.addChild(cell.node);
                cell.setIdx(i);
                cell.setCustomCallback(handler(this, this._onItemTouch));
                cell.node.y = -372;
                cell.node.x = 300 * i;
                cell.updateData(this._guildContributionList[i]);
            }
        }
        this._listItemSource.scrollToTop();
    }
    _onItemUpdate(item, index) {
        if (this._guildContributionList[index]) {
            item.update(this._guildContributionList[index]);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index) {
        var data = this._guildContributionList[index];
        if (!data) {
            return;
        }
        var remainCount = GuildDataHelper.getGuildContributionRemainCount();
        if (remainCount <= 0) {
            G_Prompt.showTip(Lang.get('guild_contribution_not_count'));
            return;
        }
        var success = UserCheck.enoughValue(data.cost_type, data.cost_value, data.cost_size), errorMsg, funcName;
        if (!success) {
            return;
        }
        G_UserData.getGuild().c2sGuildDonate(data.id);
    }
    _onEventGuildContribution(event, rewards) {
        if (rewards) {
            G_Prompt.showAwards(rewards);
        }
        G_Prompt.showTip(Lang.get('guild_contribution_success'));
    }
    _onEventGuildContributionBoxReward(event, rewards) {
        if (rewards) {
            G_Prompt.showAwards(rewards);
        }
    }
    _onEventGuildBaseInfoUpdate(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._refreshRemainCount();
        this._updateList();
        this._guildContributionBoxNode.refreshBoxView();
    }
    _onEventGuildGetUserGuild(event) {
        if (!G_UserData.getGuild().isInGuild()) {
            return;
        }
        this._refreshRemainCount();
        this._updateList();
        this._guildContributionBoxNode.refreshBoxView();
    }
    _refreshRemainCount() {
        var remainCount = GuildDataHelper.getGuildContributionRemainCount();
        this._textRemainCount.string = (Lang.get('guild_contribution_remain_count', { value: remainCount }));
    }

}