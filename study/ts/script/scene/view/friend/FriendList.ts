const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'
import ViewBase from '../../ViewBase';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { G_Prompt, G_UserData } from '../../../init';
import { FriendConst } from '../../../const/FriendConst';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { handler } from '../../../utils/handler';
import PopupBase from '../../../ui/PopupBase';
import PopupInput from '../../../ui/PopupInput';
import PopupFriendApply from './PopupFriendApply';
import PopupFriendSuggest from './PopupFriendSuggest';
import { clone2 } from '../../../utils/GlobleFunc';

@ccclass
export default class FriendList extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listView: CommonCustomListViewEx = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRoot: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnFriendSuggest: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnAddFriend: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnFriendApply: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnOnekeyGive: CommonButtonLevel0Highlight = null;

    @property(cc.Sprite)
    applyRedPoint:cc.Sprite = null;

    @property(cc.Prefab)
    FriendListViewCell:cc.Prefab = null;


    _data: any;

    ctor() {
        UIHelper.addEventListener(this.node, this._btnAddFriend._button, 'FriendList', '_onBtnAddFriend');
        UIHelper.addEventListener(this.node, this._btnFriendApply._button, 'FriendList', '_onBtnFriendApply');
        UIHelper.addEventListener(this.node, this._btnFriendSuggest._button, 'FriendList', '_onBtnFriendSuggest');
        UIHelper.addEventListener(this.node, this._btnOnekeyGive._button, 'FriendList', '_onBtnOnekeyGive');
    }
    onCreate() {
        this.ctor();
        this._initListView();
        this._btnAddFriend.setString(Lang.get('lang_friend_btn_add'));
        this._btnFriendApply.setString(Lang.get('lang_friend_btn_apply'));
        this._btnFriendSuggest.setString(Lang.get('lang_friend_btn_suggest'));
        this._btnOnekeyGive.setString(Lang.get('lang_friend_btn_one_key_give'));
    }
    onEnter() {
    }
    onExit() {
    }
    _onBtnAddFriend() {
        var okCallback = function (name) {
            if (G_UserData.getBase().getName() == name) {
                G_Prompt.showTip(Lang.get('lang_friend_add_friend_not_self'));
                return true;
            }
            G_UserData.getFriend().c2sAddFriend(name, FriendConst.FRIEND_ADD_FRIEND_TYPE);
        };
        PopupBase.loadCommonPrefab('PopupInput', (popup:PopupInput)=>{
            popup.ctor(okCallback, null, Lang.get('lang_friend_btn_add'), Lang.get('lang_friend_input_tips'), Lang.get('lang_friend_input_tips'), Lang.get('lang_friend_input_placeholder'), 7);
            popup.setBtnOkName(Lang.get('lang_friend_input_btn_ok'));
            popup.openWithAction();
        });
    }
    _onBtnFriendApply() {
        PopupBase.loadCommonPrefab('PopupFriendApply',(popup:PopupFriendApply)=>{
            popup.openWithAction();
        });
    }
    _onBtnFriendSuggest() {
        // var popupFriendSuggest = new (require('PopupFriendSuggest'))();
        // popupFriendSuggest.openWithAction();

        PopupBase.loadCommonPrefab('PopupFriendSuggest',(popup:PopupFriendSuggest)=>{
            popup.openWithAction();
        });
    }
    _initListView() {
        this._listView.setTemplate(this.FriendListViewCell);
        this._listView.setCallback(handler(this, this._onListViewItemUpdate), handler(this, this._onListViewItemSelected));
        this._listView.setCustomCallback(handler(this, this._onListViewItemTouch));
    }
    _onListViewItemUpdate(item, index) {
        if (this._data) {
            var itemData = this._data[index];
            item.updateUI(itemData, FriendConst.FRIEND_LIST, index + 1);
        }
    }
    _onListViewItemSelected(item, index) {
    }
    _onListViewItemTouch(index, data) {
        if (data) {
            G_UserData.getFriend().c2sFriendPresent(data.getId());
        }
    }
    updateView(data, applyListData?) {

        var delFriendIndex = -1;
        if(this._data&&data&&this._data.length&&data.length&&this._data.length-data.length==1)
        {
            for(var j = 0;j<this._data.length;j++)
            {
                var id = this._data[j].getId();
                var isExist:boolean = false;
                for(var i = 0;i<data.length;i++)
                {
                    if(data[i].getId()==id)
                    {
                        isExist = true;
                    }
                }
                if(isExist==false)
                {
                    //找到了
                    delFriendIndex = j;
                    break;
                }
            }
        }
        
        this._data = [];
        for(var i = 0;i<data.length;i++)
        {
            this._data.push(data[i]);
        }

        if (data) {
            this._listView.resize(data.length);
            if(delFriendIndex>=0)
            {
                this.scheduleOnce(function(){
                    this._listView.setLocation(delFriendIndex);
                });
             }
        } else {
            this._listView.resize(0);
        }
    }
    updateRedPoint() {
        this.applyRedPoint.node.active = (G_UserData.getFriend().hasApplyRedPoint());
    }
    _onBtnOnekeyGive() {
        if (!this._data) {
            return;
        }
        var canGive = false;
        for (let k in this._data) {
            var v = this._data[k];
            if (v.isCanGivePresent()) {
                canGive = true;
                break;
            }
        }
        if (!canGive) {
            G_Prompt.showTip(Lang.get('lang_friend_today_can_not_one_key_give'));
            return;
        }
        G_UserData.getFriend().c2sFriendPresent(0);
    }

}
