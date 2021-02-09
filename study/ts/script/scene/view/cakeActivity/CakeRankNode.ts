import { CakeActivityConst } from "../../../const/CakeActivityConst";
import { handler } from "../../../utils/handler";
import CakeGuildIcon from "./CakeGuildIcon";
import CakePlayerIcon from "./CakePlayerIcon";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { Colors, G_UserData } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { Util } from "../../../utils/Util";
import CakeRankGuildCell from "./CakeRankGuildCell";
import CakeRankPlayerCell from "./CakeRankPlayerCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeRankNode extends cc.Component {
    _target: cc.Node;
    _selectTabIndex: number;
    _showArrowPanel: boolean;
    _guildRankTop: {};
    _guildRankList: any[];
    _userRankList: any[];
    _userRankTop: {};

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTabGuild: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTabUser: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuild: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textUser: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonGuild: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonUser: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeGuild: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePlayer: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeGuildIcon: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePlayerIcon: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildEmpty: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPlayerEmpty: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBgGuild: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBgPlayer: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewGuild: cc.ScrollView = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageGuildTip: cc.Sprite = null;

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
        type: cc.ScrollView,
        visible: true
    })
    _listViewPlayer: cc.ScrollView = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevelTitle: cc.Label = null;

    

    @property({
        type: cc.Label,
        visible: true
    })
    _textMyScore: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonArrow: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: CakeGuildIcon,
        visible: true
    })
    _guildIcon1: CakeGuildIcon = null;

    @property({
        type: CakeGuildIcon,
        visible: true
    })
    _guildIcon2: CakeGuildIcon = null;

    @property({
        type: CakeGuildIcon,
        visible: true
    })
    _guildIcon3: CakeGuildIcon = null;

    @property({
        type: CakePlayerIcon,
        visible: true
    })
    _playerIcon1: CakePlayerIcon = null;

    @property({
        type: CakePlayerIcon,
        visible: true
    })
    _playerIcon2: CakePlayerIcon = null;
    @property({
        type: CakePlayerIcon,
        visible: true
    })
    _playerIcon3: CakePlayerIcon = null;

    onLoad(){
        this.initData();
    }
    initData() {
        this._selectTabIndex = CakeActivityConst.RANK_TYPE_1;
        this._showArrowPanel = false;
        this._guildRankTop = {};
        this._guildRankList = [];
        this._userRankTop = {};
        this._userRankList = [];
        this._initUI();
        this._switchTab();
        this._updateInfoPanel();
    }
    _initUI() {
        for (var i = 1; i <= 3; i++) {
            this['_guildIcon' + i].initData(i);
            this['_playerIcon' + i].ctor(i);
        }

        var name = CakeActivityDataHelper.getFoodName();
        this._textLevelTitle.string = (Lang.get('cake_activity_rank_level_title', { name: name }));
        this.updateStage();
    }
    onClickTabGuild() {
        if (this._selectTabIndex == CakeActivityConst.RANK_TYPE_1) {
            return;
        }
        this._selectTabIndex = CakeActivityConst.RANK_TYPE_1;
        this._switchTab();
    }
    onClickTabUser() {
        if (this._selectTabIndex == CakeActivityConst.RANK_TYPE_2) {
            return;
        }
        this._selectTabIndex = CakeActivityConst.RANK_TYPE_2;
        this._switchTab();
    }
    updateStage() {
        var actStage = CakeActivityDataHelper.getActStage()[0];
        if (actStage == CakeActivityConst.ACT_STAGE_1 || actStage == CakeActivityConst.ACT_STAGE_2) {
            this._textGuild.string = (Lang.get('cake_activity_rank_tab_title_1'));
            this._textUser.string = (Lang.get('cake_activity_rank_tab_title_2'));
            this._imageGuildTip.node.active = (true);
        } else {
            this._textGuild.string = (Lang.get('cake_activity_rank_tab_title_3'));
            this._textUser.string = (Lang.get('cake_activity_rank_tab_title_4'));
            this._imageGuildTip.node.active = (false);
        }
    }
    _switchTab() {
        this._imageTabGuild.node.active = (this._selectTabIndex == CakeActivityConst.RANK_TYPE_1);
        this._imageTabUser.node.active = (this._selectTabIndex == CakeActivityConst.RANK_TYPE_2);
        this._nodeGuild.active = (this._selectTabIndex == CakeActivityConst.RANK_TYPE_1);
        this._nodePlayer.active = (this._selectTabIndex == CakeActivityConst.RANK_TYPE_2);
        if (this._selectTabIndex == CakeActivityConst.RANK_TYPE_1) {
            this._textGuild.node.color = (new cc.Color(200, 94, 9));
            this._textUser.node.color = (new cc.Color(237, 153, 91));
        } else {
            this._textGuild.node.color = (new cc.Color(237, 153, 91));
            this._textUser.node.color = (new cc.Color(200, 94, 9));
        }
        this.updateRank();
    }
    onClickArrow() {
        this._showArrowPanel = !this._showArrowPanel;
        this._updateInfoPanel();
    }
    _updateInfoPanel() {
        if (this._showArrowPanel) {
            UIHelper.loadTexture(this._imageArrow, Path.getTextAnniversaryImg('txt_anniversary01', null));
        } else {
            UIHelper.loadTexture(this._imageArrow, Path.getTextAnniversaryImg('txt_anniversary02', null));
        }
        this._imageBgGuild.node.active = (this._showArrowPanel);
        this._imageBgPlayer.node.active = (this._showArrowPanel);
    }
    updateRank() {
        if (this._selectTabIndex == CakeActivityConst.RANK_TYPE_1) {
            this.updateGuildRank();
        } else if (this._selectTabIndex == CakeActivityConst.RANK_TYPE_2) {
            this.updatePlayerRank();
            this.updateMyScore();
        }
    }
    updateGuildRank() {
        var rankData = G_UserData.getCakeActivity().getSelfGuildRank();
        if (rankData) {
            this._textGuildRank.string = (rankData.getRank());
            this._textGuildScore.string = (rankData.getCake_level());
        } else {
            this._textGuildRank.string = (Lang.get('cake_activity_no_rank'));
            this._textGuildScore.string = (Lang.get('cake_activity_no_level'));
        }
        this._guildRankTop = {};
        this._guildRankList = [];
        var listDatas = G_UserData.getCakeActivity().getGuildRankList();
        if (listDatas.length == 0) {
            this._nodeGuildIcon.active = (false);
            this._textGuildEmpty.node.active = (true);
        } else {
            this._nodeGuildIcon.active = (true);
            this._textGuildEmpty.node.active = (false);
        }
        for (var i = 0; i < 3; i++) {
            this._guildRankTop[i] = listDatas[i];
        }
        for (var i = 3; i < listDatas.length; i++) {
            this._guildRankList.push(listDatas[i]);
        }
        for (var i = 1; i <= 3; i++) {
            var data = this._guildRankTop[i - 1];
            this['_guildIcon' + i].updateUI(data);
        }
        this._listViewGuild.content.removeAllChildren();
        this._listViewGuild.content.height = 334;
        for (let i = 0; i < this._guildRankList.length; i++) {
            let cell = Util.getNode("prefab/cakeActivity/CakeRankGuildCell", CakeRankGuildCell) as CakeRankGuildCell;
            this._listViewGuild.content.addChild(cell.node);
            cell.updateUI(this._guildRankList[i]);
            cell.node.x = 0;
            cell.node.y = (-i - 1) * 40;
            if (Math.abs(cell.node.y) > 334) {
                this._listViewGuild.content.height = Math.abs(cell.node.y);
            }
        }
    }
    updatePlayerRank() {
        var rankData = G_UserData.getCakeActivity().getSelfUserRank();
        if (rankData) {
            this._textMyRank.string = (rankData.getRank());
        } else {
            this._textMyRank.string = (Lang.get('cake_activity_no_rank'));
        }
        this._userRankTop = {};
        this._userRankList = [];
        var listDatas = G_UserData.getCakeActivity().getUserRankList();
        if (listDatas.length == 0) {
            this._nodePlayerIcon.active = (false);
            this._textPlayerEmpty.node.active = (true);
        } else {
            this._nodePlayerIcon.active = (true);
            this._textPlayerEmpty.node.active = (false);
        }
        for (var i = 0; i < 3; i++) {
            this._userRankTop[i] = listDatas[i];
        }
        for (var i = 3; i < listDatas.length; i++) {
            this._userRankList.push(listDatas[i]);
        }
        for (var i = 1; i <= 3; i++) {
            var data = this._userRankTop[i - 1];
            this['_playerIcon' + i].updateUI(data);
        }
        this._listViewPlayer.content.removeAllChildren();
        this._listViewPlayer.content.height = 360;
        for (let i = 0; i < this._userRankList.length; i++) {
            let cell = Util.getNode("prefab/cakeActivity/CakeRankPlayerCell", CakeRankPlayerCell) as CakeRankPlayerCell;
            this._listViewPlayer.content.addChild(cell.node);
            cell.updateUI(this._userRankList[i]);
            cell.node.x = 0;
            cell.node.y = (-i - 1) * 40;
            if (Math.abs(cell.node.y) > 360) {
                this._listViewPlayer.content.height = Math.abs(cell.node.y);
            }
        }
    }
    updateMyScore() {
        var point = G_UserData.getCakeActivity().getSelfPoint();
        this._textMyScore.string = (point);
    }
    _onItemUpdate1(item, index) {
        var index = index + 1;
        var data = this._guildRankList[index];
        if (data) {
            item.update(data);
        }
    }
    _onItemSelected1(item, index) {
    }
    _onItemTouch1(index, t) {
    }
    _onItemUpdate2(item, index) {
        var index = index + 1;
        var data = this._userRankList[index];
        if (data) {
            item.update(data);
        }
    }
    _onItemSelected2(item, index) {
    }
    _onItemTouch2(index, t) {
    }

}