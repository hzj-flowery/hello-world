import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleRaceGuessTabNode extends cc.Component {
    _index: any;
    _callback: any;
    _imageBg: any;
    _imagePoint: any;
    _textTip: any;
    _imageRP: any;
    ctor(index, callback) {
        this._index = index;
        this._callback = callback;
        this._imageBg = this.node.getChildByName('ImageBg').getComponent(cc.Sprite);
        UIHelper.addEventListenerToNode(this.node, this._imageBg.node, 'SingleRaceGuessTabNode', '_onClick');
        this._imagePoint = this.node.getChildByName('ImagePoint').getComponent(cc.Sprite);
        this._textTip = this.node.getChildByName('TextTip').getComponent(cc.Label);
        this._textTip.string = (Lang.get('single_race_guess_tab_title' + index));
        this._imageRP = this.node.getChildByName('ImageRP').getComponent(cc.Sprite);
    }
    setSelected(selected) {
        if (selected) {
            UIHelper.loadTexture(this._imageBg, Path.getIndividualCompetitiveImg('img_guessing_topic01'));
        } else {
            UIHelper.loadTexture(this._imageBg, Path.getIndividualCompetitiveImg('img_guessing_topic02'));
        }
    }
    setVoted(voted) {
        this._imagePoint.node.active = (voted);
    }
    _onClick() {
        if (this._callback) {
            this._callback(this._index);
        }
    }
    showRP(show) {
        this._imageRP.node.active = (show);
    }
}