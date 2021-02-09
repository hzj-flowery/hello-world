const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { Colors, G_UserData, G_Prompt, G_GameAgent } from '../../../init';
import { GuildConst } from '../../../const/GuildConst';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { GuildDataHelper } from '../../../utils/data/GuildDataHelper';
import { DataConst } from '../../../const/DataConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { FunctionConst } from '../../../const/FunctionConst';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { TextHelper } from '../../../utils/TextHelper';
import InputUtils from '../../../utils/InputUtils';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupCreateGuild extends PopupBase {

    @property({
        type: CommonNormalMiniPop,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageInput: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textHint: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFreeCost: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resCost: CommonResourceInfo = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnConfirm: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.EditBox,
        visible: true
    })
    _nameText: cc.EditBox = null;
    _onClickCreate: any;


    initData(onClickCreate) {
        this._onClickCreate = onClickCreate;
    }
    onCreate() {
        this._commonNodeBk.setTitle(Lang.get('guild_title_create'));
        this._btnConfirm.setString(Lang.get('guild_btn_create'));
        this._btnCancel.setString(Lang.get('guild_btn_create_cancel'));
        let param: any = {
            bgPanel: this._imageInput,
            fontSize: 20,
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
        UIHelper.loadTexture(this._nameText.background, Path.getUICommon('input_bg'));
        // this._nameText.setCascadeOpacityEnabled(true);
        this._nameText.textLabel.useSystemFont = true;
        this._nameText.textLabel.fontFamily = (Path.getCommonFont());
        this._nameText.textLabel.fontSize = (param.fontSize);
        this._nameText.placeholderLabel.useSystemFont = true;
        this._nameText.placeholderLabel.fontFamily = (param.placeholder);
        this._nameText.placeholderLabel.node.color = (param.placeholderFontColor);
        this._nameText.placeholderLabel.fontSize = (param.placeholderFontSize);
        this._nameText.fontColor = (param.fontColor);
        this._nameText.inputMode = (param.inputMode);
        this._nameText.inputFlag = (param.inputFlag);
        this._nameText.returnType = (param.returnType);
        this._nameText.maxLength = (999);
        // this._nameText.node.setAnchorPoint(0, 0.5);
        // this._nameText.node.y = (contentSize.height * 0.5);
        this._nameText.node.setContentSize = contentSize;

        this._btnConfirm.addClickEventListenerEx(handler(this, this.onButtonCreate));
        this._btnCancel.addClickEventListenerEx(handler(this, this.onButtonCancel));

        var needMoney = GuildDataHelper.getCreateGuildNeedMoney();
        this._resCost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, needMoney);
        this._nameText.focus();
    }
    onEnter() {
    }
    onExit() {
    }
    onButtonCreate() {
        var guildName = this._nameText.textLabel.string;
        if (TextHelper.isNameLegal(guildName, GuildConst.GUILD_NAME_MIN_LENGTH, GuildConst.GUILD_NAME_MAX_LENGTH)) {
            var userGuildData = G_UserData.getGuild().getUserGuildInfo();
            var remainCnt = UserDataHelper.getParameter(ParameterIDConst.GUILD_CREATE_DAILY_MAX) - userGuildData.getCreate_guild_cnt();
            if (remainCnt <= 0) {
                G_Prompt.showTip(Lang.get('guild_create_cnt_not_enough'));
                return;
            }
            var needMoney = GuildDataHelper.getCreateGuildNeedMoney();
            var res1 = UserCheck.enoughCash(needMoney);
            let success = res1[0];
            let popFunc: any = res1[1];
            if (!success) {
                popFunc();
                return;
            }
            var res = FunctionCheck.funcIsOpened(FunctionConst.FUNC_GUILD_CREATE);
            if (!res[0]) {
                G_Prompt.showTip(res[1]);
                return;
            }
            if (this._onClickCreate) {
                //--not complete-lqs
                // G_GameAgent.checkContent(guildName, function () {
                //     this._onClickCreate(guildName);
                //     this.close();
                // });
                this.close();
                this._onClickCreate(guildName);
                
            }
        }
    }
    onButtonCancel() {
        this.close();
    }
    onClickClose() {
        this.close();
    }

}