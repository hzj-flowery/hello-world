const { ccclass, property } = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonNormalSmallPop from '../../../ui/component/CommonNormalSmallPop'
import PopupGuildAnnouncement from './PopupGuildAnnouncement';
import { TextInputConst } from '../../../const/TextInputConst';
import { Lang } from '../../../lang/Lang';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { DataConst } from '../../../const/DataConst';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { G_Prompt, G_UserData } from '../../../init';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class PopupGuildSendMail extends PopupGuildAnnouncement {

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _resCost: CommonResourceInfo = null;

    onCreate() {
        this.setOnClickListener(handler(this, this._onSendMail));
        this.setInputLength(PopupGuildSendMail.MAX_COUNT);
        this.setPlaceHolderTxt(Lang.get('guild_mail_empty_hint'));
        this.setTextInputType(TextInputConst.INPUT_TYPE_GUILD_MAIL);
        this._panelBg.setTitle(Lang.get('guild_pop_mail_title'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        this._buttonSave.setString(Lang.get('mail_send_msg'));
        var cost = UserDataHelper.getParameter(ParameterIDConst.GUILD_MAIL_COST);
        this._resCost.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, cost);
        this._createInput();
    }
    _onSendMail(content) {
        var cost = UserDataHelper.getParameter(ParameterIDConst.GUILD_MAIL_COST);
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, cost);
        if (!success) {
            return false;
        }
        if (content == '') {
            G_Prompt.showTip(Lang.get('guild_mail_empty_hint'));
            return false;
        }
        G_UserData.getMails().c2sMail(0, null, content);
        return true;
    }

}