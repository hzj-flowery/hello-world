import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CampRaceHeroIcon extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _heroName: cc.Label = null;
    @property({ type: CommonHeroIcon, visible: true })
    _heroIcon: CommonHeroIcon = null;
    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _moveNode: cc.Node = null;

    public static ZORDER_TOUCH = 100;
    public static ZORDER_UNTOUCH = 0;

    getBoundingBox() {
        var rect = this._panelTouch.getBoundingBox();
        rect.x = rect.x + this.node.x;
        rect.y = rect.y + this.node.y;
        return rect;
    }
    setIconPosition(position) {
        position.x = position.x - this.node.x;
        position.y = position.y - this.node.y;
        this._moveNode.setPosition(position);
    }
    setLocalZOrder(z) {
        this.node.zIndex = z;
    }
    refreshIconPos() {
        this._moveNode.setPosition(cc.v2(0, 0));
    }
    updateIcon(baseId, rank, limitLevel, limitRedLevel) {
        if (baseId > 0) {
            this._heroIcon.updateUI(baseId, null, limitLevel, limitRedLevel);
            var info = HeroDataHelper.getHeroConfig(baseId);
            var name = info.name;
            if (rank > 0) {
                name = name + ('+' + rank);
            }
            this._heroIcon.showHeroUnknow(false);
            this._heroName.string = (name);
            var params = this._heroIcon.getItemParams();
            this._heroName.node.color = (params.icon_color);
        } else {
            this._heroIcon.showHeroUnknow(true);
            this._heroName.string = ('? ? ?');
        }
    }
}