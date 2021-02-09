const { ccclass, property } = cc._decorator;

import WorldBossConst from '../../../const/WorldBossConst';
import { Colors, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import WorldBossRankCell from './WorldBossRankCell';


@ccclass
export default class WorldBossRankNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot: CommonTabGroup = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageNoTimes: CommonEmptyListNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _guild_rank_bk: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildScore: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _self_rank_bk: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSelfRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSelfScore: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    _rankView: any[];
    _dataList: any[];
    _tabIndex: any;


    initData() {
        this._rankView = [];
        this._dataList = [];
        this._tabIndex = null;
        this.node.name = ('WorldBossRankNode');
    }
    onCreate() {
        this.initData();
    }

    _onTabSelect(index, sender) {
        if (this._tabIndex == index) {
            return;
        }
        for (var i in this._rankView) {
            var view = this._rankView[i];
            view.setVisible(false);
        }
        this._tabIndex = index;
        this._updateListView(this._tabIndex);
        var tabIndex = this._tabIndex;
    }
    _updateListView(tabIndex) {
        tabIndex = tabIndex || 0;
        this._dataList[WorldBossConst.TAB_INDEX_GUILD] = G_UserData.getWorldBoss().getGuild_rank();
        this._dataList[WorldBossConst.TAB_INDEX_PERSONAL] = G_UserData.getWorldBoss().getUser_rank();
        this._updateMyData(this._tabIndex + 1);

        this._listView.content.removeAllChildren();
        this._listView.content.height = 276;
        if (tabIndex == 0) {
            //军团积分
            for (let i = 0; i < this._dataList[WorldBossConst.TAB_INDEX_GUILD].length; i++) {
                let cell = Util.getNode("prefab/worldBoss/WorldBossRankCell", WorldBossRankCell) as WorldBossRankCell;
                cell.updateUI(tabIndex, this._dataList[WorldBossConst.TAB_INDEX_GUILD][i]);
                this._listView.content.addChild(cell.node);
                cell.node.x = 0;
                cell.node.y = (-1 - i) * 64;
                if (Math.abs(cell.node.y) > 276) {
                    this._listView.content.height = Math.abs(cell.node.y);
                }
            }
        }
        else {
            //个人积分
            for (let i = 0; i < this._dataList[WorldBossConst.TAB_INDEX_PERSONAL].length; i++) {
                let cell = Util.getNode("prefab/worldBoss/WorldBossRankCell", WorldBossRankCell) as WorldBossRankCell;
                cell.updateUI(tabIndex, this._dataList[WorldBossConst.TAB_INDEX_PERSONAL][i]);
                this._listView.content.addChild(cell.node);
                cell.node.x = 0;
                cell.node.y = (-1 - i) * 64;
                if (Math.abs(cell.node.y) > 276) {
                    this._listView.content.height = Math.abs(cell.node.y);
                }
            }
        }

    }
    _updateMyData(tabIndex) {
        var list = this._dataList[tabIndex];
        this._panelBase.getChildByName('Image_guild_rank_bg').active = (false);
        this._panelBase.getChildByName('Image_personal_rank_bg').active = (false);
        this._panelBase.getChildByName('Image_no_guild').active = (false);
        if (tabIndex == WorldBossConst.TAB_INDEX_GUILD) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                var guildRank = G_UserData.getWorldBoss().getSelf_guild_rank();
                var guildPoint = G_UserData.getWorldBoss().getGuild_point();
                this._panelBase.getChildByName('Image_guild_rank_bg').active = (true);
                if (guildPoint > 0) {
                    this._textGuildScore.string = (guildPoint.toString());
                    this._textGuildScore.node.color = (Colors.BRIGHT_BG_ONE);
                } else {
                    this._textGuildScore.string = (Lang.get('worldboss_no'));
                    this._textGuildScore.node.color = (Colors.BRIGHT_BG_ONE);
                }
                this._textGuildRank.node.active = (false);
                if (guildRank > 0) {
                    this._guild_rank_bk.node.active = (true);
                    if (guildRank <= 3) {
                        UIHelper.loadTexture(this._guild_rank_bk, Path.getArenaUI('img_qizhi0' + guildRank));
                    } else {
                        UIHelper.loadTexture(this._guild_rank_bk, Path.getArenaUI('img_qizhi0' + 4));
                        this._textGuildRank.node.active = (true);
                        this._textGuildRank.string = (guildRank.toString());
                    }
                    this._guild_rank_bk.node.setContentSize(cc.size(30, 40));
                } else {
                    this._guild_rank_bk.node.active = (false);
                }
            } else {
                this._panelBase.getChildByName('Image_no_guild').active = (true);
            }
            if (list.length == 0) {
                this._imageNoTimes.node.active = (true);
                this._imageNoTimes.setTipsString(Lang.get('worldboss_no_guild_rank'));
            }
        }
        if (tabIndex == WorldBossConst.TAB_INDEX_PERSONAL) {
            var userRank = G_UserData.getWorldBoss().getSelf_user_rank();
            var userPoint = G_UserData.getWorldBoss().getUser_point();
            this._panelBase.getChildByName('Image_personal_rank_bg').active = (true);
            if (userPoint > 0) {
                this._textSelfScore.string = (userPoint.toString());
                this._textSelfScore.node.color = (Colors.BRIGHT_BG_ONE);
            } else {
                this._textSelfScore.string = (Lang.get('worldboss_no'));
                this._textSelfScore.node.color = (Colors.BRIGHT_BG_ONE);
            }
            if (userRank > 0) {
                this._textSelfRank.string = (userRank.toString());
                this._self_rank_bk.node.active = (false);
                this._textSelfRank.node.active = (true);
            } else {
                this._textSelfRank.string = (Lang.get('worldboss_no'));
                this._self_rank_bk.node.active = (false);
                this._textSelfRank.node.active = (false);
            }
            if (list.length == 0) {
                this._imageNoTimes.node.active = (true);
                this._imageNoTimes.setTipsString(Lang.get('worldboss_no_personal_rank'));
            }
        }
    }
    getRankView(index) {
        var rankView = this._rankView[index];
        if (rankView == null) {
            rankView = this['_listViewTab' + index];
            rankView.setTemplate(WorldBossRankCell);
            rankView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
            rankView.setCustomCallback(handler(this, this._onItemTouch));
            this._rankView[index] = rankView;
        }
        return rankView;
    }
    _onItemTouch(index, id) {
    }
    _onItemUpdate(item, index) {
        var dataList = this._dataList[this._tabIndex + 1];
        if (dataList.length > 0) {
            var data = dataList[index];
            if (data != null) {
                item.updateItem(index, data);
            }
        }
    }
    _onItemSelected(item, index) {
    }
    onEnter() {
        // logWarn('WorldBossRankNode:onEnter');
        if (this._tabIndex == null) {
            this._nodeTabRoot.setTabIndex(0);
        } else {
            this._updateListView(this._tabIndex);
        }

        var tabParams = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: -15,
            textList: [
                Lang.get('worldboss_guild_rank_tab'),
                Lang.get('worldboss_user_rank_tab')
            ]
        };

        this._nodeTabRoot.recreateTabs(tabParams);
        this._imageNoTimes.node.active = (false);
        this._panelBase.getChildByName('Image_guild_rank_bg').active = (false);
        this._panelBase.getChildByName('Image_personal_rank_bg').active = (false);
        this._panelBase.getChildByName('Image_no_guild').active = (false);
        this._nodeTabRoot.setTabIndex(0);

    }
    onExit() {
    }
    updateUI() {
        this._updateListView(this._tabIndex);
        var tabIndex = this._tabIndex;
    }

}