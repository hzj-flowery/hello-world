import { CrossWorldBossConst } from "../../../const/CrossWorldBossConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonEmptyListNode from "../../../ui/component/CommonEmptyListNode";
import CommonListItem from "../../../ui/component/CommonListItem";
import CommonListView from "../../../ui/component/CommonListView";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import TabScrollView from "../../../utils/TabScrollView";
import { TextHelper } from "../../../utils/TextHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";


const {ccclass, property} = cc._decorator;

@ccclass

export default class  CrossWorldBossRankNode extends ViewBase{
    name: 'CrossWorldBossRankNode';

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _imageNoTimes: CommonEmptyListNode = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabIcon1: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _tabIcon2: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _guild_rank_bk: cc.Sprite = null;

    
    @property({
        type: cc.Label,
        visible: true
    })
    _name1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _name2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textSelfScore: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textSelfRank: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _self_rank_bk: cc.Sprite = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _panelGuildRank: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelPersonalRank: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelNoGuild: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeContent: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;
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
        type: cc.Node,
        visible: true
    })
    _tab1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _tab2: cc.Node = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _btnArrow: cc.Button = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _listView: CommonListView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _CrossWorldBossRankCell: cc.Prefab = null;

    
    

    private _tabIndex:number;
    private _oriPosition:cc.Vec2;
    private _newTargetPos:cc.Vec2;
    private _isAutoArrow:boolean;
    private _signalUpdateRankInfo:any;
    private _dataList:any;
    onCreate() {
        this.setSceneSize();
        this._dataList = {};
        this._tabIndex = 1;
        this.node.name = "CrossWorldBossRankNode";
        this._tab1.on(cc.Node.EventType.TOUCH_START,this._onClickMidTab1Icon,this);
        this._tab2.on(cc.Node.EventType.TOUCH_START,this._onClickMidTab2Icon,this);
        let listen1 = new cc.Component.EventHandler();
        listen1.target = this.node;
        listen1.handler = "_onButtonArrow";
        listen1.component = 'CrossWorldBossRankNode';
        this._btnArrow.clickEvents = [];
        this._btnArrow.clickEvents.push(listen1);
      
        this._imageNoTimes.node.active = (false);
        this._panelGuildRank.active = (false);
        this._panelPersonalRank.active = (false);
        this._panelNoGuild.active = (false);
        this._initPosition();
    }
    _initItemTabName() {
    }
    _onClickMidTab1Icon() {
        if (this._tabIndex == 1) {
            return;
        }
        this._tabIndex = 1;
        this._switchTab();
        this._updateListView(this._tabIndex);
    }
    _onClickMidTab2Icon() {
        if (this._tabIndex == 2) {
            return;
        }
        this._tabIndex = 2;
        this._switchTab();
        this._updateListView(this._tabIndex);
    }
    _switchTab() {
        this._tabIcon1.node.active = (this._tabIndex == 1);
        this._tabIcon2.node.active = (this._tabIndex == 2);
        if (this._tabIndex == 1) {
            this._name1.node.color = (new cc.Color(199, 93, 9));
            this._name2.node.color = (new cc.Color(229, 137, 70));
        } else {
            this._name1.node.color = (new cc.Color(229, 137, 70));
            this._name2.node.color = (new cc.Color(199, 93, 9));
        }
    }
    _initPosition() {
        this._oriPosition = cc.v2(this._nodeContent.getPosition());
        var oriSize = this._panelBase.getContentSize();
        this._newTargetPos = cc.v2(this._oriPosition.x - oriSize.width, this._oriPosition.y);
    }
    _updateListView(tabIndex) {
        tabIndex = tabIndex || 1;
        this._dataList[CrossWorldBossConst.TAB_INDEX_GUILD] = G_UserData.getCrossWorldBoss().getGuild_rank();
        this._dataList[CrossWorldBossConst.TAB_INDEX_PERSONAL] = G_UserData.getCrossWorldBoss().getUser_rank();
        this._updateMyData(this._tabIndex);
        if (this._dataList[tabIndex]) {
            this._listView.init(this._CrossWorldBossRankCell,handler(this, this._onItemUpdate),handler(this, this._onItemSelected),handler(this, this._onItemTouch))
            this._listView.resize(this._dataList[tabIndex].length)
        }
    }
    _onButtonArrow(sender) {
        if (sender) {
            this._isAutoArrow = !this._isAutoArrow;
        }
        var bVisible = !this._panelBase.active;
        this._imageArrow.spriteFrame.setFlipX(!bVisible);
        if (bVisible) {
            this._panelBase.active = (true);
            this._nodeContent.runAction(cc.sequence(cc.callFunc(()=> {
            }),cc.moveBy(0.2,this._oriPosition.sub(this._newTargetPos))));
        } else {
            this._nodeContent.runAction(cc.sequence(cc.moveBy(0.2, this._newTargetPos.sub(this._oriPosition)),cc.callFunc(()=> {
                this._panelBase.active = (false);
            })));
        }
    }
    _updateMyData(tabIndex) {
        var list = this._dataList[tabIndex];
        this._panelGuildRank.active = (false);
        this._panelPersonalRank.active = (false);
        this._panelNoGuild.active = (false);
        this._imageNoTimes.node.active = (false);
        if (tabIndex == CrossWorldBossConst.TAB_INDEX_GUILD) {
            var isInGuild = G_UserData.getGuild().isInGuild();
            if (isInGuild) {
                var guildRank = G_UserData.getCrossWorldBoss().getSelf_guild_rank();
                var guildPoint = G_UserData.getCrossWorldBoss().getGuild_point();
                this._panelGuildRank.active = (true);
                if (guildPoint > 0) {
                    this._textGuildScore.string = (TextHelper.getAmountText(guildPoint));
                } else {
                    this._textGuildScore.string = (Lang.get('worldboss_no'));
                }
                this._textGuildRank.node.active = (false);
                if (guildRank > 0) {
                    this._guild_rank_bk.node.active = (true);
                    if (guildRank <= 3) {
                        UIHelper.loadTexture(this._guild_rank_bk,Path.getArenaUI('img_qizhi0' + guildRank));
                    } else {
                        UIHelper.loadTexture(this._guild_rank_bk,Path.getArenaUI('img_qizhi04'));
                        this._textGuildRank.node.active = (true);
                        this._textGuildRank.string = ''+(guildRank);
                    }
                    this._guild_rank_bk.node.setContentSize(cc.size(30, 40));
                } else {
                    this._guild_rank_bk.node.active = (false);
                }
            } else {
                this._panelNoGuild.active = (true);
            }
            if (!list || list.length == 0) {
                this._imageNoTimes.node.active = (true);
                this._imageNoTimes.setTipsString(Lang.get('worldboss_no_guild_rank'));
            }
        }
        if (tabIndex == CrossWorldBossConst.TAB_INDEX_PERSONAL) {
            var userRank = G_UserData.getCrossWorldBoss().getSelf_user_rank();
            var userPoint = G_UserData.getCrossWorldBoss().getUser_point();
            this._panelPersonalRank.active = (true);
            if (userPoint > 0) {
                this._textSelfScore.string = (TextHelper.getAmountText(userPoint));
            } else {
                this._textSelfScore.string = (Lang.get('worldboss_no'));
            }
            if (userRank > 0) {
                this._textSelfRank.string =''+(userRank);
                this._self_rank_bk.node.active = (true);
                this._textSelfRank.node.active = (true);
                if (userRank <= 3) {
                    this._textSelfRank.node.active = (false);
                    UIHelper.loadTexture(this._self_rank_bk,Path.getArenaUI('img_qizhi0' + userRank));
                } else {
                    this._textSelfRank.node.active = (true);
                    UIHelper.loadTexture(this._self_rank_bk,Path.getArenaUI('img_qizhi04'));
                }
                this._self_rank_bk.node.setContentSize(cc.size(30, 40));
            } else {
                this._textSelfRank.string = (Lang.get('worldboss_no'));
                this._self_rank_bk.node.active = (false);
                this._textSelfRank.node.active = (false);
            }
            if (!list || list.length == 0) {
                this._imageNoTimes.node.active = (true);
                this._imageNoTimes.setTipsString(Lang.get('worldboss_no_personal_rank'));
            }
        }
    }
    _onItemTouch(index, id) {
    }
    _onItemUpdate(item:CommonListItem, index) {
        var dataList = this._dataList[this._tabIndex];
        if (dataList && dataList.length > 0) {
            var data = dataList[index];
            if (data != null) {
                item.updateItem(index, [data,this._tabIndex]);
            }
        }
    }
    _onItemSelected(item, index) {
    }
    onEnter() {
        this._signalUpdateRankInfo = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_UPDATE_RANK, handler(this, this.updateUI));
        cc.warn('CrossWorldBossRankNode:onEnter');
        if (this._tabIndex == null) {
            this._updateListView(1);
        } else {
            this._updateListView(this._tabIndex);
        }
    }
    onExit() {
        this._signalUpdateRankInfo.remove();
        this._signalUpdateRankInfo = null;
    }
    updateUI() {
        this._updateListView(this._tabIndex);
    }
}