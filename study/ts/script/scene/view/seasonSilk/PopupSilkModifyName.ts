const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'
import CommonNormalMiniPop from '../../../ui/component/CommonNormalMiniPop'
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import PopupBase from '../../../ui/PopupBase';
import { Colors, G_Prompt, G_UserData } from '../../../init';
import { TextHelper } from '../../../utils/TextHelper';

@ccclass
export default class PopupSilkModifyName extends PopupBase {

    @property({ type: CommonNormalMiniPop, visible: true })
    _commonNodeBk: CommonNormalMiniPop = null;

    @property({ type: cc.Sprite, visible: true })
    _imageInput: cc.Sprite = null;

    @property({ type: cc.EditBox, visible: true })
    _editBox: cc.EditBox = null;

    @property({ type: cc.Label, visible: true })
    _textHint: cc.Label = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnCancel: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnConfirm: CommonButtonLevel0Highlight = null;

    private _curGroupData;
    private _modifiedCallBack;
    private _callBack;

    public init(data, modifiedCallBack) {
        this._curGroupData = data;
        this._modifiedCallBack = modifiedCallBack;

        this._btnConfirm.addClickEventListenerEx(handler(this, this._onBtnConfirm));
        this._btnCancel.addClickEventListenerEx(handler(this, this._onBtnCancel));
    }

    public onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onBtnCancel));
        this._commonNodeBk.setTitle(Lang.get('player_detail_change_name'));
        this._btnCancel.setString(Lang.get('common_btn_cancel'));
        this._btnConfirm.setString(Lang.get('common_btn_sure'));
        this._editBox.node.color = Colors.BRIGHT_BG_ONE;
        this._editBox.placeholderLabel.node.color = Colors.INPUT_PLACEHOLDER;
        this._editBox.textLabel.node.color = Colors.BRIGHT_BG_ONE;
        this._editBox.placeholder = Lang.get('season_silk_equip_namelength');
        this._editBox.maxLength = 5;
    }

    public onEnter() {
    }

    public onExit() {
    }

    public setCurGroupName(curname) {
        this._editBox.string = curname;
    }

    private _onBtnConfirm(sender) {
        var playerName: string = this._editBox.string;
        playerName = playerName.trim();
        if (TextHelper.isNameLegal(playerName, 1, 5)) {
            if (this._modifiedCallBack) {
                this._modifiedCallBack(playerName);
            }
            G_Prompt.showTip(Lang.get('player_detail_change_name_ok'));
            var silkbag = this._curGroupData.silkbag || null;
            G_UserData.getSeasonSport().setModifySilkGroupName(true);
            G_UserData.getSeasonSport().c2sFightsSilkbagSetting(this._curGroupData.idx, playerName, silkbag);
            if (this._callBack) {
                this._callBack();
            }
            this.close();
        }
    }

    public setCloseCallBack(callback) {
        this._callBack = callback;
    }

    private _onBtnCancel() {
        if (this._callBack) {
            this._callBack();
        }
        this.close();
    }
}