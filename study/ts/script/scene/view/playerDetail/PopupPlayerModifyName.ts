const { ccclass, property } = cc._decorator;
import PopupBase from "../../../ui/PopupBase";
import { Lang } from "../../../lang/Lang";
import { G_ConfigLoader, G_UserData, Colors, G_NetworkManager, G_Prompt, G_GameAgent } from "../../../init";
import CommonButtonLevel0Normal from "../../../ui/component/CommonButtonLevel0Normal";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import CommonNormalMiniPop from "../../../ui/component/CommonNormalMiniPop";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { TextHelper } from "../../../utils/TextHelper";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { FontCheck } from "../../../utils/logic/FontCheck";
@ccclass
export default class PopupPlayerModifyName extends PopupBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _textFreeCost: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInput: cc.Sprite = null;

    @property({
        type: cc.EditBox,
        visible: true
    })
    _editBox: cc.EditBox = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnConfirm: CommonButtonLevel0Highlight = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resCost: CommonResourceInfo = null;

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop = null;


    public static readonly PARAMS_RENAME = 40;
    _callback: Function;
    _renameParam: any;
    _getChangeName: any;
    private _title: string;

    initData(title, callback) {
        this._title = title || Lang.get('player_detail_change_name');
        this._callback = callback;
        this._renameParam = G_ConfigLoader.getConfig('parameter').get(PopupPlayerModifyName.PARAMS_RENAME);
        this._btnConfirm.addClickEventListenerEx(handler(this, this.onBtnConfirm));
        this._btnCancel.addClickEventListenerEx(handler(this, this.onBtnCancel));
    }
    _onPlaceRandomName() {
        var oldName = G_UserData.getBase().getName();
        this._editBox.string = (oldName);
    }
    onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk.setTitle(this._title);
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this._btnConfirm.setString(Lang.get('common_btn_sure'));
        this._editBox.placeholderLabel.node.color = Colors.INPUT_PLACEHOLDER;
        this._editBox.textLabel.node.color = Colors.BRIGHT_BG_ONE;
        this._editBox.placeholder = Lang.get('lang_create_role_error_too_long');
        this._editBox.maxLength = 7;
        this._textFreeCost.string = (Lang.get('player_detail_change_name_free'));
        this._updateResCost();
    }
    _updateResCost() {
        var needMoney = this._getResCost();
        if (needMoney == 0) {
            this._textFreeCost.node.active = (true);
            this._resCost.node.active = (false);
        } else {
            this._textFreeCost.node.active = (false);
            this._resCost.node.active = (true);
            this._resCost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, needMoney);
        }
    }
    _getResCost() {
        var changeCount = G_UserData.getBase().getChange_name_count();
        if (changeCount == 0) {
            return 0;
        }
        var money = parseInt(this._renameParam.content);
        return money;
    }
    _onCheckBoxClick(sender) {
    }
    onEnter() {
        this._getChangeName = G_NetworkManager.add(MessageIDConst.ID_S2C_ChangeName, handler(this, this.recvChangeName));
    }
    recvChangeName(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_Prompt.showTip(Lang.get('player_detail_change_name_ok'));
        this.close();
    }
    onExit() {
        this._getChangeName.remove();
        this._getChangeName = null;
    }
    onBtnConfirm(sender) {
        var playerName = this._editBox.string;
        playerName = playerName.trim();
        FontCheck.checkLegal(playerName, handler(this, this.changeName, playerName))
    }

    changeName(arg, isLegal) {
        var playerName = arg[0];
        if (!isLegal) {
            G_Prompt.showTip('取名失败,存在非法字符');
            return;
        }
        if (TextHelper.isNameLegal(playerName, 2, 7)) {
            var needMoney = this._getResCost();
            var [success, popFunc] = UserCheck.enoughCash(needMoney);
            if (success) {
                G_GameAgent.checkContent(playerName, function () {
                    var message = { name: playerName };
                    G_NetworkManager.send(MessageIDConst.ID_C2S_ChangeName, message);
                });
            } else {
                popFunc();
            }
        }
      
    }


    onBtnCancel() {
        this.close();
    }
}