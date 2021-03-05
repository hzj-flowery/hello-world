const { ccclass, property } = cc._decorator;

import { AuctionConst } from '../../../const/AuctionConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { GuildAnswerConst } from '../../../const/GuildAnswerConst';
import { SignalConst } from '../../../const/SignalConst';
import { GuildAnswerRankUnitData } from '../../../data/GuildAnswerRankUnitData';
import { Colors, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
// import CommonChatMiniNode from '../chat/CommonChatMiniNode'
import CommonNormalLargeWithChatPop from '../../../ui/component/CommonNormalLargeWithChatPop';
import CommonTabGroup from '../../../ui/component/CommonTabGroup';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import AnswerClientEnd from './AnswerClientEnd';
import AnswerClientStart from './AnswerClientStart';
import { GuildAnswerHelper } from './GuildAnswerHelper';
import RankListViewCell from './RankListViewCell';






@ccclass
export default class GuildAnswerView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonNormalLargeWithChatPop,
        visible: true
    })
    _commonPop: CommonNormalLargeWithChatPop = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _chatMini: CommonMiniChat = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _rankRewardListViewItem: CommonListViewLineItem = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _rankTipRichNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _rankTitle: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _rankListView: cc.ScrollView = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _emptyRank: CommonEmptyListNode = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _nodeTabRoot: CommonTabGroup = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _rankTopGuild: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _rankTopPerson: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _rankListViewBottom: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _clientParent: cc.Node = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;
    _curState: number;
    _rankListBottomInfo: any;
    _curSelectTabIndex: number;
    _enterSignal: any;
    _rankChangeSignal: any;
    _signalGetAuctionInfo: any;
    _answerData: any;
    _client: any;


    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, answerData) {
            cc.resources.load("ui3/common/img_com_board04c", cc.SpriteFrame, () => {
                var data: Array<ResourceData> = [
                    {path: "prefab/guildAnswer/RankListViewCell", type: cc.Prefab},
                    {path: "prefab/guildAnswer/ExaminationIndex", type: cc.Prefab},
                    {path: "prefab/guildAnswer/ExaminationOption", type: cc.Prefab},
                    {path: "prefab/guildAnswer/AnswerClientStart", type: cc.Prefab},
                    {path: "prefab/guildAnswer/AnswerClientEnd", type: cc.Prefab},
                    {path: "prefab/guildAnswer/AnswerClientNotStart", type: cc.Prefab},
                ];
                ResourceLoader.loadResArrayWithType(data, (err, data) => {
                    callBack();
                });
            })
        }
        G_UserData.getGuildAnswer().c2sEnterGuildAnswer();
        return G_SignalManager.addOnce(SignalConst.EVENT_ENTER_GUILD_ANSWER_SUCCESS, onMsgCallBack);
    }
    private _isFinished:boolean;
    initData() {
        this._chatMini.getPanelDanmu().active = false;
        this._curState = GuildAnswerConst.ANSWER_INIT;
        this._isFinished = false;
    }
    openWithAction() {
        // this.open();
    }
    onCreate() {
        this.initData();
        this._commonPop.setTitle(Lang.get('lang_guild_answer_title'));
        this._commonHelp.updateUI(FunctionConst.FUNC_GUILD_ANSWER);
        this._initRankTab();
        this._initRankListView();
        this._initBottomInfo();
    }
    _initBottomInfo() {
        var rankListBottomInfo = Util.getNode("prefab/guildAnswer/RankListViewCell", RankListViewCell) as RankListViewCell;
        rankListBottomInfo.node.setAnchorPoint(cc.v2(0, 0));
        this._rankListViewBottom.addChild(rankListBottomInfo.node);
        this._rankListBottomInfo = rankListBottomInfo;
        this._rankListBottomInfo.setImageBgVisible(false);
    }
    _initRankTab() {
        this._curSelectTabIndex = 0;
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: 2,
            textList: [
                Lang.get('lang_guild_answer_rank_tab_guild'),
                Lang.get('lang_guild_answer_rank_tab_person')
            ]
        };
        this._nodeTabRoot.recreateTabs(param);
        this._nodeTabRoot.setTabIndex(0);
    }
    _onTabSelect(index, sender) {
        if (this._curSelectTabIndex == index) {
            return;
        }
        this._curSelectTabIndex = index;
        this._updateRankTopState(this._curSelectTabIndex + 1 == GuildAnswerConst.RANK_PERSON);
        this._updateRankList();
    }
    onEnter() {
        this._enterSignal = G_SignalManager.add(SignalConst.EVENT_ENTER_GUILD_ANSWER_SUCCESS, handler(this, this._updateAnswerData));
        this._rankChangeSignal = G_SignalManager.add(SignalConst.EVENT_GUILD_ANSWER_PUBLIC_SUCCESS, handler(this, this._onRankChange));
        this._signalGetAuctionInfo = G_SignalManager.add(SignalConst.EVENT_GET_ALL_AUCTION_INFO, handler(this, this._onEventGetAuctionInfo));
        this._updateAnswerData();
    }
    onExit() {
        this._enterSignal.remove();
        this._enterSignal = null;
        this._rankChangeSignal.remove();
        this._rankChangeSignal = null;
        this._signalGetAuctionInfo.remove();
        this._signalGetAuctionInfo = null;
    }
    _updateAnswerData(id?: any, answerData?: any) {
        this._answerData = G_UserData.getGuildAnswer().getAnswerData();
        this._stateChange();
        this._updateRankRewardInfo();
    }
    _stateChange() {
        if (!GuildAnswerHelper.isTodayOpen()) {
            this._curState = GuildAnswerConst.ANSWER_END;
            this._stateEnd();
            return;
        }
        var curTime = G_ServerTime.getTime();
        console.log('curTime ' + curTime);
        this._clientParent.removeAllChildren();
        var startTime = GuildAnswerHelper.getGuildAnswerStartTime();
        console.log('startTime ' + startTime);
        var oldState = this._curState;
        if (this._answerData.questions.length == 0) {
            console.warn('====================questions is empty');
            this._curState = GuildAnswerConst.ANSWER_END;
            this._stateEnd();
        } else if (curTime < startTime) {
            this._curState = GuildAnswerConst.ANSWER_END;
            this._stateEnd();
        } else {
            var totalTime = GuildAnswerHelper.getGuildAnswerTotalTime();
            console.log('totalTime ' + totalTime);
            if (curTime >= startTime + totalTime || this._isFinished == true) {
                this._curState = GuildAnswerConst.ANSWER_END;
                this._stateEnd();
            } else if (this._isFinished == false) {
                this._curState = GuildAnswerConst.ANSWER_ING;
                this._stateIng();
            }
        }
    }
    _getRankListData() {
        if (this._answerData && this._answerData.ranks) {
            if (this._curSelectTabIndex + 1 == GuildAnswerConst.RANK_PERSON) {
                return this._answerData.ranks.person;
            } else {
                return this._answerData.ranks.guild;
            }
        }
        return [];
    }
    _onRankChange(id, ranks) {
        if (!this._answerData) {
            return;
        }
        this._answerData.ranks = ranks;
        this._updateRankList();
    }
    _onEventGetAuctionInfo() {
        this._checkShowDlg();
    }
    _constructionMyGuildRankData() {
        var myGuild = G_UserData.getGuild().getMyGuild();
        var myGuildName = '';
        if (myGuild) {
            myGuildName = myGuild.getName();
        }
        var data = new GuildAnswerRankUnitData();
        data.setName(myGuildName);
        return data;
    }
    _constructionMyPersonRankData() {
        var name = G_UserData.getBase().getName();
        var data = new GuildAnswerRankUnitData();
        data.setName(name);
        return data;
    }
    _updateMyRankInfo() {
        var rankData = this._getRankListData();
        var isFind = false;
        var myRankData = null;
        if (this._curSelectTabIndex + 1 == GuildAnswerConst.RANK_PERSON) {
            var userId = G_UserData.getBase().getId();
            for (var _ in rankData) {
                var v = rankData[_];
                if (v.getUser_id() == userId) {
                    isFind = true;
                    myRankData = v;
                    break;
                }
            }
            if (!isFind) {
                myRankData = this._constructionMyPersonRankData();
            }
        } else {
            var guildId = GuildAnswerHelper.getGuildId();
            for (_ in rankData) {
                var v = rankData[_];
                if (v.getGuild_id() == guildId) {
                    isFind = true;
                    myRankData = v;
                    break;
                }
            }
            if (!isFind) {
                myRankData = this._constructionMyGuildRankData();
            }
        }
        this._rankListBottomInfo.updateUI(myRankData, true);
        if (myRankData.getPoint() == 0) {
            this._rankListBottomInfo.setScoreEmpty();
        }
    }
    _updateRankList() {
        var rankData = this._getRankListData();
        // this._tabListView.updateListView(this._curSelectTabIndex, rankData.length);
        this._onRankListViewItemUpdate(this._curSelectTabIndex, rankData);
        this._updateMyRankInfo();
    }
    _updateRankTopState(isPerson) {
        this._rankTopGuild.node.active = (!isPerson);
        this._rankTopPerson.node.active = (isPerson);
    }
    _stateIng() {
        this._rankTitle.string = (Lang.get('lang_guild_answer_rank_title_score'));
        var client = Util.getNode("prefab/guildAnswer/AnswerClientStart", AnswerClientStart) as AnswerClientStart;
        client.initData(this._answerData.questions, function () {
            G_UserData.getGuildAnswer().c2sEnterGuildAnswer();
            this._isFinished = true;
        }.bind(this));
        this._client = client;
        this._clientParent.addChild(this._client.node);
        this._updateRankTopState(this._curSelectTabIndex + 1 == GuildAnswerConst.RANK_PERSON);
        this._updateRankList();
    }
    _stateEnd() {
        this._rankTitle.string = (Lang.get('lang_guild_answer_rank_title_score'));
        var client = Util.getNode("prefab/guildAnswer/AnswerClientEnd", AnswerClientEnd) as AnswerClientEnd;
        client.initData(function () {
            G_UserData.getGuildAnswer().c2sEnterGuildAnswer();
        }, this._answerData.questions.length == 0);
        this._client = client;
        this._clientParent.addChild(this._client.node);
        this._updateRankTopState(this._curSelectTabIndex + 1 == GuildAnswerConst.RANK_PERSON);
        this._updateRankList();
    }
    _initRankListView() {
        // var RankListViewCell = require('RankListViewCell');
        // var scrollViewParam = {
        //     template: RankListViewCell,
        //     updateFunc: handler(this, this._onRankListViewItemUpdate),
        //     selectFunc: handler(this, this._onRankListViewItemSelected),
        //     touchFunc: handler(this, this._onRankListViewItemTouch)
        // };
        // this._tabListView = new TabScrollView(this._rankListView, scrollViewParam);
    }
    _onRankListViewItemUpdate(index, ranksData) {
        this._rankListView.content.removeAllChildren();
        this._rankListView.content.height = 209;
        for (let i = 0; i < ranksData.length; i++) {
            let cell = Util.getNode("prefab/guildAnswer/RankListViewCell", RankListViewCell) as RankListViewCell;
            cell.updateUI(ranksData[i], false);
            this._rankListView.content.addChild(cell.node);
            cell.node.x = 0;
            cell.node.y = (-1 - i) * 40;
            if (Math.abs(cell.node.y) > 209) {
                this._rankListView.content.height = Math.abs(cell.node.y);
            }
        }
    }
    _onRankListViewItemSelected(item, index) {
    }
    _onRankListViewItemTouch(index, params) {
    }
    _updateRankRewardInfo() {
        var rewards = GuildAnswerHelper.getPreviewRankRewards(G_UserData.getGuildAnswer().getRandomAward());
        this._rankRewardListViewItem.updateUI(rewards);
        this._rankRewardListViewItem.setMaxItemSize(5);
        this._rankRewardListViewItem.setListViewSize(380, 100);
        this._rankRewardListViewItem.setItemsMargin(2);
    }
    _checkShowDlg() {
        if (GuildAnswerHelper.isTodayShowEndDialog()) {
            //logWarn('====================today is show');
            return;
        }
        var isAuctionWorldEnd = G_UserData.getAuction().isAuctionShow(AuctionConst.AC_TYPE_GUILD_ANSWER_ID);
        if (isAuctionWorldEnd == false) {
            //logWarn('====================Auction not open');
            return;
        }
        var isInGuild = G_UserData.getGuild().isInGuild();
        if (!isInGuild) {
            //logWarn('====================not in guild');
            return;
        }
        this._showEndDlg();
    }
    _showEndDlg() {
        if (this._answerData && this._answerData.endRank != 0) {
            var onBtnGo = function () {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_AUCTION);
            }
            // var PopupSystemAlert = new (require('PopupSystemAlert'))(Lang.get('lang_guild_answer_popup_title1'), null, onBtnGo);
            var content;
            content = Lang.get('lang_guild_answer_award_tip1', {
                rank: this._answerData.endRank,
                exp: this._answerData.endExp,
                score: this._answerData.endScore
            });
            GuildAnswerHelper.setTodayShowDialogTime();

            UIPopupHelper.popupSystemAlert(Lang.get('lang_guild_answer_popup_title1'), null, onBtnGo, null, (popup: PopupSystemAlert) => {
                popup.setContentWithRichTextType3(content, Colors.BRIGHT_BG_TWO, 22, 10);
                popup.setCheckBoxVisible(false);
                popup.showGoButton(Lang.get('lang_guild_answer_popup_btn_goto'));
                popup.setCloseVisible(true);
            })

        }
    }
    onButtonClose() {
        G_SceneManager.popScene();
    }

}