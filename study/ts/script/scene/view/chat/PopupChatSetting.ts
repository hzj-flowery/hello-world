const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import UIHelper from '../../../utils/UIHelper';
import { G_UserData } from '../../../init';
import { table } from '../../../utils/table';
import { ChatConst } from '../../../const/ChatConst';

@ccclass
export default class PopupChatSetting extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonNormalSmallPop,
        visible: true
    })
    _commonNodeBk: CommonNormalSmallPop = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _commonButtonSmallNormal: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox5: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox2: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox3: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox4: cc.Toggle = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox1: cc.Toggle = null;


    public static CHECK_BOX_NUM = 5;
    public static path:string = 'chat/PopupChatSetting';


    _title: string;
    _callback: any;


    ctor(title, callback) {
        this._title = title || Lang.get('chat_popup_title_chat_setting');
        this._callback = callback;
    }
    onCreate() {
        this._title = this._title || Lang.get('chat_popup_title_chat_setting');
        this.node.name = ('PopupChatSetting');
        this._commonNodeBk.setTitle(this._title);
        this._commonButtonSmallNormal.setString(Lang.get('common_btn_name_confirm'));
        this._commonButtonSmallNormal.addClickEventListenerEx(handler(this, this.onBtnOk));
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._refreshCheckbox();
        this._initCheckbox();
    }
    _initCheckbox() {
        for (var i = 1; i<=PopupChatSetting.CHECK_BOX_NUM; i++) {
            var checkBox = this['_checkBox' + i] as cc.Toggle;
            checkBox.node.name = (i).toString();
            UIHelper.addCheckEvent(this.node, checkBox, 'PopupChatSetting', '_onClickCheckBox');
        }
    }
    _refreshCheckbox() {
        for (var i = 1; i<=PopupChatSetting.CHECK_BOX_NUM; i++) {
            var checkBox = this['_checkBox' + i] as cc.Toggle;
            var checkValue = G_UserData.getChat().getChatSetting().getCheckBoxValue(i);
            if (checkValue == 1) {
                checkBox.isChecked = (true);
            } else {
                checkBox.isChecked = (false);
            }
        }
    }
    _onClickCheckBox(sender) {
        var checkboxData = [];
        for (var i = 1; i<=PopupChatSetting.CHECK_BOX_NUM; i++) {
            var checkBox = this['_checkBox' + i] as cc.Toggle;
            table.insert(checkboxData, checkBox.isChecked && 1 || 0);
        }
        G_UserData.getChat().getChatSetting().saveSettingValue('checkbox', checkboxData);
        var checkValue01 = G_UserData.getChat().getChatSetting().getCheckBoxValue(ChatConst.SETTING_KEY_AUTO_VOICE_WORLD);
        var checkValue02 = G_UserData.getChat().getChatSetting().getCheckBoxValue(ChatConst.SETTING_KEY_AUTO_VOICE_GANG);
        if (checkValue01 != 1) {
            G_UserData.getChat().clearWorldAutoPlayVoiceList();
        }
        if (checkValue02 != 1) {
            G_UserData.getChat().clearGuildAutoPlayVoiceList();
        }
    }
    setBtnEnable(enable) {
        this._commonButtonSmallNormal.setEnabled(enable);
    }
    setBtnText(text) {
        this._commonButtonSmallNormal.setString(text);
    }
    updateUI() {
    }
    _onInit() {
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnOk() {
        var isBreak;
        if (this._callback) {
            isBreak = this._callback();
        }
        if (!isBreak) {
            this.close();
        }
    }
    onBtnCancel() {
        this.close();
    }   

}
