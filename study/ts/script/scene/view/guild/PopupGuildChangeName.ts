
const { ccclass, property } = cc._decorator;
import PopupBase from "../../../ui/PopupBase";
import { Lang } from "../../../lang/Lang";
import { G_ConfigLoader, G_UserData, Colors, G_NetworkManager, G_Prompt, G_GameAgent } from "../../../init";
import CommonButtonLevel0Normal from "../../../ui/component/CommonButtonLevel0Normal";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import CommonNormalMiniPop from "../../../ui/component/CommonNormalMiniPop";
import { handler } from "../../../utils/handler";
import InputUtils from "../../../utils/InputUtils";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import { MessageIDConst } from "../../../const/MessageIDConst";
import { TextHelper } from "../../../utils/TextHelper";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { UserBaseData } from "../../../data/UserBaseData";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { GuildConst } from "../../../const/GuildConst";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
@ccclass

export default class PopupGuildChangeName extends PopupBase {

    @property({
        type: cc.Label,
        visible: true
    })
    _title: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFreeCost: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHint: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInput: cc.Sprite = null;

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

    @property({
        type: cc.EditBox,
        visible: true
    })
    _editBox: cc.EditBox = null;

    _callback: any;
    _costItem: any;


    onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this._btnConfirm.setString(Lang.get('common_btn_sure'));
        let param: any = {
            bgPanel: this._imageInput,
            placeholderFontColor: Colors.INPUT_PLACEHOLDER,
            fontColor: Colors.BRIGHT_BG_ONE,
            placeholder: Lang.get('guild_create_name_placeholder'),
            maxLength: GuildConst.GUILD_NAME_MAX_LENGTH
        }

        param.fontSize = param.fontSize || 22;
        param.fontColor = param.fontColor || Colors.BRIGHT_BG_ONE;
        param.placeholder = param.placeholder || '';
        param.placeholderFontColor = param.placeholderFontColor || Colors.INPUT_PLACEHOLDER;
        param.placeholderFontSize = param.placeholderFontSize || param.fontSize;
        param.inputMode = param.inputMode || cc.EditBox.InputMode.SINGLE_LINE;
        param.inputFlag = param.inputFlag || cc.EditBox.InputFlag.SENSITIVE;
        param.returnType = param.returnType || 1;
        param.maxLength = param.maxLength || 7;
        param.maxLenTip = param.maxLenTip;
        var contentSize = param.bgPanel.node.getContentSize();
        UIHelper.loadTexture(this._editBox.background, Path.getUICommon('input_bg'));
        // // this._editBox.setCascadeOpacityEnabled(true);
        // this._editBox.textLabel.useSystemFont = true;
        // this._editBox.textLabel.fontFamily = (Path.getCommonFont());
        // this._editBox.textLabel.fontSize = (param.fontSize);
        this._editBox.placeholderLabel.useSystemFont = true;
        this._editBox.placeholderLabel.fontFamily = (param.placeholder);
        this._editBox.placeholderLabel.node.color = (param.placeholderFontColor);
        this._editBox.placeholderLabel.fontSize = (param.placeholderFontSize);
        this._editBox.fontColor = (param.fontColor);
        this._editBox.inputMode = (param.inputMode);
        this._editBox.inputFlag = (param.inputFlag);
        this._editBox.returnType = (param.returnType);
        this._editBox.maxLength = param.maxLength;
        // // this._editBox.node.setAnchorPoint(0, 0.5);
        // // this._editBox.node.y = (contentSize.height * 0.5);
        this._editBox.node.setContentSize = contentSize;
    }
    updateUI(title, hint, costItem, callback) {
        this._callback = callback;
        this._costItem = costItem;
        this._commonNodeBk.setTitle(title);
        this._textHint.string = (hint);
        this._updateResCost(costItem);
    }
    updateFreeDes(des) {
        this._textFreeCost.string = (des || Lang.get('player_detail_change_name_free'));
    }
    _updateResCost(costItem) {
        if (costItem.size == 0) {
            this._textFreeCost.node.active = (true);
            this._resCost.node.active = (false);
        } else {
            this._textFreeCost.node.active = (false);
            this._resCost.node.active = (true);
            this._resCost.updateUI(costItem.type, costItem.value, costItem.size);
        }
    }
    onEnter() {
    }
    onExit() {
    }
    onBtnConfirm(sender) {
        var playerName = this._editBox.string;
        playerName = playerName.trim();
        if (TextHelper.isNameLegal(playerName, GuildConst.GUILD_NAME_MIN_LENGTH, GuildConst.GUILD_NAME_MAX_LENGTH) && this._costItem) {
            var success = LogicCheckHelper.enoughValue(this._costItem.type, this._costItem.value, this._costItem.size);
            if (success) {
                G_GameAgent.checkContent(playerName, function () {
                    if (this._callback) {
                        this._callback(playerName);
                    }
                    this.close();
                }.bind(this));
            }
        }
    }
    onBtnCancel() {
        this.close();
    }
}