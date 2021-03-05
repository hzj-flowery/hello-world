import { Path } from "../../../utils/Path";
import { TextHelper } from "../../../utils/TextHelper";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CampRacePlayerInfoNode extends cc.Component {
    _imageBg: any;
    _imageFirst: any;
    _textPower: any;
    _textPlayerName: any;
    _textCount: any;
    _textTip: any;
    _imagePower: any;

    ctor(pos) {
        this._imageBg = this.node.getChildByName('ImageBg');
        var resBg = Path.getCampImg('img_camp_player0' + (pos + 'b'));
        UIHelper.loadTexture(this._imageBg.getComponent(cc.Sprite), resBg);
        this._imageFirst = this._imageBg.getChildByName('ImageFirst');
        this._textPower = this._imageBg.getChildByName('TextPower').getComponent(cc.Label);
        this._textPlayerName = this._imageBg.getChildByName('TextPlayerName').getComponent(cc.Label);
        this._textCount = this._imageBg.getChildByName('TextCount').getComponent(cc.Label);
        this._textTip = this.node.getChildByName('TextTip');
        this._imagePower = this._imageBg.getChildByName('ImagePower');
    }

    updateUI(playerData) {
        if (playerData) {
            this._imageFirst.active = (playerData.isFirst_hand());
            var strPower = TextHelper.getAmountText2(playerData.getPower());
            this._textPower.string = (strPower);
            this._textPlayerName.string = (playerData.getName());
            this._textPlayerName.node.color = (Colors.getOfficialColor(playerData.getOfficer_level()));
            this._textCount.string = (Lang.get('camp_play_off_win_count', { count: playerData.getWin_num() }));
            this._textCount.node.active = (true);
            this._textTip.active = (false);
            this._imagePower.active = (true);
        } else {
            this._imageFirst.active = (false);
            this._textPower.string = ('');
            this._textPlayerName.string = ('');
            this._textPlayerName.node.color = (Colors.getCampGray());
            this._textCount.node.active = (false);
            this._textTip.active = (true);
            this._imagePower.active = (false);
        }
    }
}