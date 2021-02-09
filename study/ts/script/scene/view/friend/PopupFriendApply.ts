const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonNormalLargePop3 from '../../../ui/component/CommonNormalLargePop3'
import PopupBase from '../../../ui/PopupBase';
import { G_UserData, G_SignalManager } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { FunctionConst } from '../../../const/FunctionConst';
import { handler } from '../../../utils/handler';
import { SignalConst } from '../../../const/SignalConst';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';

@ccclass
export default class PopupFriendApply extends PopupBase {

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
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _refuseAllBtn: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _agreeAllBtn: CommonButtonLevel0Highlight = null;

    @property(cc.Prefab)
    FriendApplyCell:cc.Prefab = null;

    _listData: any[];
    _signalApply: any;
    _signalGetFriendList: any;

    public static path:string = 'friend/PopupFriendApply';


    ctor() {
        this._listData = G_UserData.getFriend().getApplyData() || [];
        UIHelper.addEventListener(this.node, this._refuseAllBtn._button, 'PopupFriendApply', '_onRefuseAllBtnClick');/*  */
        UIHelper.addEventListener(this.node, this._agreeAllBtn._button, 'PopupFriendApply', '_onAgreeAllBtnClick');/*  */
    }
    onCreate() {
        this.ctor();
        this._commonLargePop2.setTitle(Lang.get('lang_friend_btn_apply'));
        this._commonLargePop2.addCloseEventListener(handler(this, this.close));
        this._initListView();
        this.updateListView();
        this._refuseAllBtn.setString(Lang.get('guild_btn_refuse_all'));
        this._agreeAllBtn.setString(Lang.get('guild_btn_agree_all'));
        var isShowAgreeAllBtn = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_AGREE_ALL_FRIEND)[0];
        this._agreeAllBtn.setVisible(isShowAgreeAllBtn);
        var isShowrefuseAllBtn = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_REFUSE_ALL_FRIEND)[0];
        this._refuseAllBtn.setVisible(isShowrefuseAllBtn);
    }
    onEnter() {
        this._signalApply = G_SignalManager.add(SignalConst.EVENT_CONFIRM_ADD_FRIEND_SUCCESS, handler(this, this._onApply));
        this._signalGetFriendList = G_SignalManager.add(SignalConst.EVENT_GET_FRIEND_LIST_SUCCESS, handler(this, this._onGetFriendList));
    }
    onExit() {
        this._signalApply.remove();
        this._signalApply = null;
        this._signalGetFriendList.remove();
        this._signalGetFriendList = null;
    }
    _initListView() {
        this._listView.setTemplate(this.FriendApplyCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    _onRefuseAllBtnClick() {
        this._listData = G_UserData.getFriend().getApplyData();
        if (this._listData.length > 0) {
            G_UserData.getFriend().c2sConfirmAddFriend(0, false);
        }
    }
    _onAgreeAllBtnClick() {
        this._listData = G_UserData.getFriend().getApplyData();
        if (this._listData.length > 0) {
            G_UserData.getFriend().c2sConfirmAddFriend(0, true);
        }
    }
    _onListViewItemUpdate(item, index) {
        if (this._listData) {
            item.updateUI(index + 1, this._listData[index]);
        }
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, data, isAccept) {
        if (data) {
            G_UserData.getFriend().c2sConfirmAddFriend(data.getId(), isAccept);
        }
    }
    updateListView() {
        if (!this._listData) {
            this._listData = [];
        }
        this._listView.resize(this._listData.length);
    }
    _onGetFriendList() {
        this._listData = G_UserData.getFriend().getApplyData();
        this._listView.resize(this._listData.length, 2, true);
    }
    _onApply(event, message) {
        this._listData = G_UserData.getFriend().getApplyData();
        this._listView.resize(this._listData.length, 2, true);
    }

}
