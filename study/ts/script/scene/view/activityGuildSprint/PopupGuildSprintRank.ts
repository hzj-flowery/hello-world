const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import PopupBase from '../../../ui/PopupBase';
import { handler } from '../../../utils/handler';
import { Util } from '../../../utils/Util';
import GuildSprintRankItemCell from './GuildSprintRankItemCell';


@ccclass
export default class PopupGuildSprintRank extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMidPop = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRankTitle: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _titleBG: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listviewItem: cc.ScrollView = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;


    private static _rankUnitDataList: any;
    private static _myRank: number;

    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, rankUnitDataList, myRank) {
            PopupGuildSprintRank._rankUnitDataList = rankUnitDataList;
            PopupGuildSprintRank._myRank = myRank;
            cc.resources.load("prefab/activityGuildSprint/GuildSprintRankItemCell", cc.Prefab, () => {
                callBack();
            });
        }
        G_UserData.getGuildSprint().c2sGetSevenDaysSprintGuildRank();
        return G_SignalManager.addOnce(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_GET_RANK_LIST, onMsgCallBack);
    }

    private _myRank: number;
    private _listData: Array<any>;
    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('common_title_rank'));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
    }
    onEnter() {
        this.updateList(PopupGuildSprintRank._rankUnitDataList, PopupGuildSprintRank._myRank);
    }
    onExit() {
    }
    onShowFinish() {
    }
    _onItemTouch(index) {
    }
    _onItemUpdate(item: CommonListItem, index) {
        var itemData = this._listData[index - 1];
        item.updateItem(index, itemData != null ? itemData : null);
    }
    _onItemSelected(item, index) {
    }
    updateList(rankUnitDataList, myRank) {
        this._listData = rankUnitDataList;
        this._myRank = myRank;
        if (myRank <= 0) {
            this._textMyRank.string = (Lang.get('activity_guild_sprint_no_crops'));
        } else {
            this._textMyRank.string = (myRank);
        }
        var lineCount = this._listData.length;
        this._nodeEmpty.node.active = (lineCount <= 0);

        this._listviewItem.content.height = 420;
        for (let i = 0; i < this._listData.length; i++) {
            let cell = Util.getNode("prefab/activityGuildSprint/GuildSprintRankItemCell", GuildSprintRankItemCell) as GuildSprintRankItemCell;
            this._listviewItem.content.addChild(cell.node);
            cell.updateUI(0, this._listData[i]);
            cell.node.x = 0;
            cell.node.y = -(i + 1) * 40;
            this._listviewItem.content.height = Math.abs(cell.node.y) > 420 ? Math.abs(cell.node.y) : 420;
        }

    }
    onBtnCancel() {
        this.close();
    }


}