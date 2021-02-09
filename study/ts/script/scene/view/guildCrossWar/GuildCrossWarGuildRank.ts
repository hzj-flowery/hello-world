import ViewBase from "../../ViewBase";
import { G_NetworkManager, G_UserData } from "../../../init";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { handler } from "../../../utils/handler";
import GuildCrossWarGuildRankCell from "./GuildCrossWarGuildRankCell";
import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";
import { GuildCrossWarHelper } from "./GuildCrossWarHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildCrossWarGuildRank extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _scrollView: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnRank: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;
    _msgGuildCrossLadder: any;
    _rankData: any;
    _imageOwn: any;


    onCreate() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._initListView();
    }
    onEnter() {
        this._msgGuildCrossLadder = G_NetworkManager.add(MessageIDConst.ID_S2C_BrawlGuildsLadder, handler(this, this._s2cBrawlGuildsLadder));
        this._updateListView();
    }
    onExit() {
        this._msgGuildCrossLadder.remove();
        this._msgGuildCrossLadder = null;
    }
    _initListView() {
        this._imageOwn.setVisible(false);
        var scrollViewParam = {
            template: GuildCrossWarGuildRankCell,
            updateFunc: handler(this, this._onCellUpdate),
            selectFunc: handler(this, this._onCellSelected),
            touchFunc: handler(this, this._onCellTouch)
        };
        // this._tabListView = new TabScrollView(this._listView, scrollViewParam, 1);
    }
    _updateListView() {
        // var maxGroup = table.nums(this._rankData);
        // if (maxGroup <= 0) {
        //     return;
        // }
        // this._updateOwnRank();
        // this._tabListView.updateListView(1, maxGroup);
    }
    _onCellUpdate(cell, index) {
        // if (table.nums(this._rankData) <= 0) {
        //     return;
        // }
        // var cellIndex = index + 1;
        // var cellData = this._rankData[cellIndex];
        // if (typeof(cellData) != 'object') {
        //     return;
        // }
        // cellData.index = cellIndex;
        // cell.updateUI(cellData);
    }
    _onCellSelected(cell, index) {
    }
    _onCellTouch(index, data) {
    }
    _updateOwnRank() {
        var ownData: any = {};
        for (var k in this._rankData) {
            var v = this._rankData[k];
            if (v.guild_id == G_UserData.getGuild().getMyGuildId()) {
                ownData = v;
                ownData.index = k;
                break;
            }
        }
        // if (table.nums(ownData) > 0) {
        //     this._imageOwn.setVisible(true);
        //     if (ownData.index <= 3) {
        //         this._imageOwnback.loadTexture(Path.getArenaUI(GuildCrossWarConst.GUILD_LADDER_RANKNUM[ownData.index]));
        //     } else {
        //         this._imageOwnback.loadTexture(Path.getArenaUI(GuildCrossWarConst.GUILD_LADDER_RANKNUM[4]));
        //     }
        //     this._textOwnRank.setString(parseInt(ownData.index));
        //     this._textOwnGuildName.setString(ownData.guild_name);
        //     this._textOwnGuildName.setColor(GuildCrossWarHelper.getGuildNameColor(ownData.index));
        //     this._textOwnHurt.setString(TextHelper.getAmountText(ownData.score));
        // }
    }
    _s2cBrawlGuildsLadder(id, message) {
        if (message.guild_ladders == null) {
            return;
        }
        this._rankData = [];
        this._rankData = message.guild_ladders;
        this._rankData.sort(function (item1, item2) {
            if (item1.score == item2.score) {
                return item1.guild_id - item2.guild_id;
            } else {
                return item2.score - item1.score;
            }
        });
        this._updateListView();
    }

}