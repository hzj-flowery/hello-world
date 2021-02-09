const { ccclass, property } = cc._decorator;

import RankTabButton from './RankTabButton'
import ViewBase from '../../ViewBase';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import GuildServerAnswerRankCell from './GuildServerAnswerRankCell';
import { GuildServerAnswerHelper } from './GuildServerAnswerHelper';
import { Util } from '../../../utils/Util';

@ccclass
export default class GuildServerAnswerRankLayer extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_LeftTop: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBg: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listItemSource: cc.ScrollView = null;

    @property({
        type: RankTabButton,
        visible: true
    })
    _buttonTab1: RankTabButton = null;

    @property({
        type: RankTabButton,
        visible: true
    })
    _buttonTab2: RankTabButton = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _myNode: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _imageArrow1: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _arrow: cc.Sprite = null;

    public static readonly TAB_GUILD = 1;
    public static readonly TAB_PERSON = 2;
    public static readonly MAX_CELLS = 20;
    _signalEventGuildAnswerPublicSuccess: any;
    _guildRankData: any;
    _personRankData: any;
    _tabSelect: number;
    _tabListView: any;
    _myRankCell: GuildServerAnswerRankCell;
    _isFold1: any;

    onCreate() {
        this._initUI();
        this._initListItemSource();
    }
    onEnter() {
        this._signalEventGuildAnswerPublicSuccess = G_SignalManager.add(SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_RANK, handler(this, this._onEventUpdateRankData));
        var ranks = G_UserData.getGuildServerAnswer().getRanks();
        this._updateData(ranks);
        this._updateView();
    }
    _updateData(ranks) {
        this._guildRankData = ranks.guild;
        this._personRankData = ranks.person;
    }
    _initUI() {
        this._buttonTab1.setString(Lang.get('answer_rank_tab1'));
        this._buttonTab2.setString(Lang.get('answer_rank_tab2'));
        this._buttonTab1.setSelected(true);
        this._buttonTab2.setSelected(false);
        this._myRankCell = Util.getNode("prefab/guildServerAnswer/GuildServerAnswerRankCell", GuildServerAnswerRankCell) as GuildServerAnswerRankCell;
        this._myNode.addChild(this._myRankCell.node);
        this._myRankCell.setImageBg(Path.getAnswerImg('img_server_answer_01c'));
    }
    onExit() {
        this._signalEventGuildAnswerPublicSuccess.remove();
        this._signalEventGuildAnswerPublicSuccess = null;
    }
    _onEventUpdateRankData(id, ranks) {
        this._updateData(ranks);
        this._updateView();
    }
    _initListItemSource() {
        // var TabScrollView = require('TabScrollView');
        // var scrollViewParam = {
        //     template: GuildServerAnswerRankCell,
        //     updateFunc: handler(this, this._onListItemSourceItemUpdate),
        //     selectFunc: handler(this, this._onListItemSourceItemSelected),
        //     touchFunc: handler(this, this._onListItemSourceItemTouch)
        // };
        // this._tabListView = new TabScrollView(this._listItemSource, scrollViewParam);
    }
    _onListItemSourceItemUpdate(index) {
        var rankData = this._guildRankData;
        if (this._tabSelect == GuildServerAnswerRankLayer.TAB_PERSON) {
            rankData = this._personRankData;
        }

        this._listItemSource.content.removeAllChildren();
        this._listItemSource.content.setContentSize(236, 0);
        for (let i = 0; i < rankData.length; i++) {
            let cell = Util.getNode("prefab/guildServerAnswer/GuildServerAnswerRankCell", GuildServerAnswerRankCell) as GuildServerAnswerRankCell;
            this._listItemSource.content.addChild(cell.node);
            cell.updateUI(rankData[i], false);
            cell.node.x = 0;
            cell.node.y = (-1 - i) * 36;
            this._listItemSource.content.height = Math.abs(cell.node.y) > 189 ? Math.abs(cell.node.y) : 189;
        }
    }
    _updateView() {
        var lineCount = 0;
        var [myRankData, myGuildRankData] = GuildServerAnswerHelper.getMyAndMyGuildRankData(this._personRankData, this._guildRankData);
        if (this._tabSelect == GuildServerAnswerRankLayer.TAB_GUILD) {
            lineCount = Math.min(this._guildRankData.length, GuildServerAnswerRankLayer.MAX_CELLS);
            this._updateRankCell(myGuildRankData);
        } else {
            lineCount = Math.min(this._personRankData.length, GuildServerAnswerRankLayer.MAX_CELLS);
            this._updateRankCell(myRankData);
        }
        this._onListItemSourceItemUpdate(this._tabSelect);
        // this._tabListView.updateListView(this._tabSelect, lineCount);
    }
    _updateRankCell(rankData) {
        if (rankData) {
            this._myNode.active = (true);
            this._myRankCell.updateUI(rankData, true);
        } else {
            this._myNode.active = (false);
        }
    }
    onButtonLeftArrow(sender) {
        this._isFold1 = !this._isFold1;
        this._imageRankBg.node.stopAllActions();
        var posX = this._imageRankBg.node.getContentSize().width;
        var callAction = cc.callFunc(function () {
            this._arrow.node.setScale(this._isFold1 ? -1 : 1);
        }.bind(this));
        var action = cc.moveTo(0.3, cc.v2(this._isFold1 ? -posX * 0.5 : posX * 0.5, this._imageRankBg.node.y));
        var runningAction = cc.sequence(action, callAction);
        this._imageRankBg.node.runAction(runningAction);
    }
    onButtonGuildRank() {
        this._tabSelect = GuildServerAnswerRankLayer.TAB_GUILD;
        this._buttonTab1.setSelected(true);
        this._buttonTab2.setSelected(false);
        this._updateView();
    }
    onButtonPersonRank() {
        this._tabSelect = GuildServerAnswerRankLayer.TAB_PERSON;
        this._buttonTab2.setSelected(true);
        this._buttonTab1.setSelected(false);
        this._updateView();
    }

}