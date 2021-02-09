import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonHistoryHeroIcon from "../../../ui/component/CommonHistoryHeroIcon";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetailAwakenCell extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    _heroName: cc.Label = null;
    @property({ type: CommonHistoryHeroIcon, visible: true })
    _historyIcon: CommonHistoryHeroIcon = null;
    @property({ type: cc.Label, visible: true })
    _tips: cc.Label = null;
    _configId: any;
    _label: cc.Label;

    ctor(configId) {
        this._configId = configId;
        var type = TypeConvertHelper.TYPE_HISTORY_HERO;
        var param = TypeConvertHelper.convert(type, this._configId, 1);
        this._historyIcon.onLoad();
        this._historyIcon.updateUI(this._configId, 1);
        this._historyIcon.setRoundType(false);
        this._historyIcon.setTouchEnabled(false);
        this._historyIcon.updateUIBreakThrough(2);
        this._heroName.string = (param.name);
        this._heroName.node.color = (param.icon_color);
        UIHelper.updateTextOutline(this._heroName, param);
        this._tips.string = (Lang.get('historyhero_weapon_detail_awaken_tips'));
        this._updateDesc(this._configId);
    }
    _updateDesc(configId) {
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(configId, 1);
        if (this._label == null) {
            this._label = UIHelper.createWithTTF('', Path.getCommonFont(), 20);
            this._label.node.color = (Colors.BRIGHT_BG_TWO);
            this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._label.node.width = (270);
            this._label.node.setAnchorPoint(cc.v2(0, 1));
            this._panelBg.addChild(this._label.node);
        }
        this._label.string = (heroStepInfo.description);
        var BG_WIDTH = 402;
        var MARGIN = 10;
        var HERO_NAME_HEIGHT = 30;
        UIHelper.updateLabelSize(this._label);
        var height = this._panelBg.getContentSize().height;
        var desHeight = this._label.node.getContentSize().height + MARGIN * 2 + HERO_NAME_HEIGHT;
        height = Math.max(height, desHeight);
        this._label.node.setPosition(cc.v2(115, height - MARGIN - HERO_NAME_HEIGHT));
        var size = cc.size(BG_WIDTH, height);
        this._panelBg.setContentSize(size);
        this.node.setContentSize(size);
    }
}