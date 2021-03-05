import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { Colors } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CampRaceVSNode extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;
    @property({ type: CommonHeroIcon, visible: true })
    _heroIcon: CommonHeroIcon = null;
    _pos: any;

    ctor(pos) {
        this._pos = pos;
    }
    updateUI(userData, isLight) {
        if (userData) {
            this._heroIcon.node.active = (true);
            var name = userData.getName();
            var officerLevel = userData.getOfficer_level();
            var nameColor = isLight && Colors.getOfficialColor(officerLevel) || Colors.getCampGray();
            this._heroIcon.updateUI(userData.getCoverId(), null, userData.getLimitLevel(), userData.getLimitRedLevel());
            this._heroIcon.setIconMask(!isLight);
            // UIHelper.setFontName(this._textName, Path.getCommonFont());
            this._textName.string = (name);
            this._textName.node.color = (nameColor);
        } else {
            this._heroIcon.node.active = (false);
            // UIHelper.setFontName(this._textName, Path.getFontW8());
            this._textName.string = ('');
            this._textName.node.color = (Colors.OBVIOUS_YELLOW);
        }
    }
    setDesc(desc) {
        UIHelper.setFontName(this._textName, Path.getFontW8());
        this._textName.string = (desc);
        this._textName.node.color = (Colors.OBVIOUS_YELLOW);
    }
}