const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonNormalLargePop3 from '../../../ui/component/CommonNormalLargePop3'
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import { G_ConfigLoader, G_UserData, G_SignalManager, G_ServerTime, G_Prompt } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { assert } from '../../../utils/GlobleFunc';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { FriendUnitData } from '../../../data/FriendUnitData';
import { SignalConst } from '../../../const/SignalConst';
import { Util } from '../../../utils/Util';
import UIActionHelper from '../../../utils/UIActionHelper';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { FriendConst } from '../../../const/FriendConst';
import { table } from '../../../utils/table';

@ccclass
export default class PopupFriendSuggest extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonNormalLargePop3,
        visible: true
    })
    _commonLargePop2: CommonNormalLargePop3 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRoot: cc.Sprite = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnRefresh: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab)
    FriendSuggestCell:cc.Prefab = null;

    _countDownStartTime: number = 0;
    _suggestInterval: number;
    _listData: FriendUnitData[];
    _signalSuggestList: any;
    _signalAddFriend: any;

    public static path:string = 'friend/PopupFriendSuggest';
    
    ctor() {
        UIHelper.addEventListener(this.node, this._btnRefresh._button, 'PopupFriendSuggest', '_onBtnRefresh');
    }
    onCreate() {
        this.ctor();
        var Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);//require('app.config.parameter');
        var config = Parameter.get(141);
      //assert((config != null, 'can not find param 141 value');
        this._suggestInterval = parseInt(config.content) || 10;
        this._commonLargePop2.setTitle(Lang.get('lang_friend_suggest_title'));
        this._commonLargePop2.addCloseEventListener(handler(this, this.close));
        this._initListView();
        this._refreshBtnState();
        this._listData = G_UserData.getFriend().getSuggestTempListData();
        this.updateListView();
    }
    onEnter() {
        this._signalSuggestList = G_SignalManager.add(SignalConst.EVENT_RECOMMAND_FRIEND_SUCCESS, handler(this, this._onGetSuggestList));
        this._signalAddFriend = G_SignalManager.add(SignalConst.EVENT_ADD_FRIEND_SUCCESS, handler(this, this._onAddFriendSuccess));
        if (this._countDownStartTime + this._suggestInterval - G_ServerTime.getTime() < 0) {
            this.requestSuggestList();
        }
    }
    onExit() {
        this._signalSuggestList.remove();
        this._signalSuggestList = null;
        this._signalAddFriend.remove();
        this._signalAddFriend = null;
    }
    requestSuggestList() {
        G_UserData.getFriend().c2sRecommandFriend();
    }
    _onGetSuggestList(event, data) {
        this._listData = data;
        this.updateListView();
        this._refreshBtnState();
    }
    _onBtnRefresh() {
        if (this._countDownStartTime == 0) {
            this.requestSuggestList();
        }
    }
    _refreshBtnState() {
        var desc = this._btnRefresh.getDesc();
        if (desc) {
            desc.node.stopAllActions();
            this._countDownStartTime = G_UserData.getFriend().getSuggestRefreshTime();
            if (this._countDownStartTime + this._suggestInterval - G_ServerTime.getTime() >= 0) {
                this._btnRefresh.setEnabled(false);
                this._btnRefresh.setString(Util.format('%ds', this._countDownStartTime + this._suggestInterval - G_ServerTime.getTime()));
                var action = UIActionHelper.createUpdateAction(function () {
                    var leftTime = this._countDownStartTime + this._suggestInterval - G_ServerTime.getTime();
                    if (leftTime > 0) {
                        var desc1 = this._btnRefresh.getDesc();
                        if (desc1) {
                            this._btnRefresh.setString(Util.format('%ds', leftTime));
                        }
                    } else {
                        desc.node.stopAllActions();
                        this._countDownStartTime = 0;
                        this._btnRefresh.setEnabled(true);
                        this._btnRefresh.setString(Lang.get('lang_friend_suggest_btn_refresh'));
                    }
                }.bind(this), 0.5);
                desc.node.runAction(action);
            } else {
                this._btnRefresh.setEnabled(true);
                this._btnRefresh.setString(Lang.get('lang_friend_suggest_btn_refresh'));
            }
        }
    }
    _initListView() {
        this._listView.setTemplate(this.FriendSuggestCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    _onListViewItemUpdate(item, index) {
        if (this._listData) {
            item.updateUI(index + 1, this._listData[index]);
        }
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, data) {
        if (data) {
            G_UserData.getFriend().c2sAddFriend(data.getName(), FriendConst.FRIEND_ADD_FRIEND_TYPE);
        }
    }
    updateListView() {
        if (!this._listData) {
            this._listData = [];
        }
        this._listView.resize(this._listData.length, 2, true);
    }
    _onAddFriendSuccess(event, message) {
        var uid = (message['uid']);
        if (uid && this._listData) {
            for (var k=0; k<this._listData.length; k++) {
                var v = this._listData[k];
                if (v.getId() == uid) {
                    this._listData.splice(k,1);
                    this.updateListView();
                    break;
                }
            }
        }
        var friend_type = (message['friend_type']);
        if (friend_type) {
            if (friend_type == FriendConst.FRIEND_ADD_FRIEND_TYPE) {
                G_Prompt.showTip(Lang.get('lang_friend_apply_success_tip'));
            }
        }
    }

}
