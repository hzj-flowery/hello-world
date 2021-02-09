import { G_UserData, G_ServerTime, Colors } from "../../../init";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupPlayerDetailItem extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitile: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue: cc.Label = null;

    public updateUI(unitInfo) {
        let resId = unitInfo.getResId();
        let recoverCfg = unitInfo.getConfig();
        this._textTitile.string = Lang.get('player_detail_restore_desc', { value: recoverCfg.name });
        let miniIcon = Path.getCommonIcon('resourcemini', resId);
        UIHelper.loadTexture(this._imageIcon,miniIcon);

        let currValue = G_UserData.getBase().getResValue(unitInfo.getResId());
        let needRestore = unitInfo.getMaxLimit() - currValue;
        needRestore = needRestore >= 0 && needRestore || 0;
        let restoreFullTime = 0;
        let totalRestoreDesc = '';
        if (needRestore > 0) {
            let time1 = UserDataHelper.getRefreshTime(unitInfo.getResId());
            restoreFullTime = time1 - G_ServerTime.getTime();
            totalRestoreDesc = G_ServerTime._secondToString(restoreFullTime);
        }
        UIHelper.updateLabel(this._textValue, {
            text: restoreFullTime == 0 && Lang.get('player_detail_restore_full') || totalRestoreDesc,
            color: restoreFullTime == 0 && Colors.COLOR_POPUP_ADD_PROPERTY || Colors.COLOR_POPUP_DESC_NOTE
        });
    }
}