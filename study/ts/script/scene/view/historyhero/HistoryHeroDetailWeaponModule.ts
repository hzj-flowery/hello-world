import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import { HistoryHeroDataHelper } from "../../../utils/data/HistoryHeroDataHelper";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetailWeaponModule extends cc.Component {
    @property({ type: cc.Node, visible: true })
    _panelBg: cc.Node = null;
    @property({ type: CommonIconTemplate, visible: true })
    _commonItem: CommonIconTemplate = null;
    @property({ type: cc.Label, visible: true })
    _weaponName: cc.Label = null;
    @property({ type: CommonDetailTitleWithBg, visible: true })
    _nodeTitle: CommonDetailTitleWithBg = null;
    _configId: any;
    _label: cc.Label;

    ctor(configId) {
        this._configId = configId;
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('historyhero_weapon_detail_title_weapon'));
        this._updateIcon(this._configId);
        this._updateDesc(this._configId);
    }
    _updateIcon(configId) {
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(configId, 1);
        this['_commonItem'].unInitUI();
        this['_commonItem'].initUI(heroStepInfo.type_1, heroStepInfo.value_1, heroStepInfo.size_1);
        this['_commonItem'].setTouchEnabled(false);
        var weaponParam = TypeConvertHelper.convert(heroStepInfo.type_1, heroStepInfo.value_1, heroStepInfo.size_1);
        this['_commonItem'].loadIcon(weaponParam.icon);
        this['_commonItem'].setIconMask(false);
        this._weaponName.string = (weaponParam.name);
        this._weaponName.node.color = (weaponParam.icon_color);
        UIHelper.updateTextOutline(this._weaponName, weaponParam);
    }
    _updateDesc(configId) {
        var heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(configId, 1);
        if (this._label == null) {
            this._label = UIHelper.createWithTTF('', Path.getCommonFont(), 20);
            this._label.node.color =  (Colors.BRIGHT_BG_TWO);
            this._label.node.width = (270);
            this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._label.node.setAnchorPoint(cc.v2(0, 1));
            this._panelBg.addChild(this._label.node);
        }
        this._label.string = (heroStepInfo.description);
        var BG_WIDTH = 402;
        var ORG_HEIGHT = 164;
        var MARGIN = 10;
        var WEAPON_NAME_HEIGHT = 30;
        var height = this._panelBg.getContentSize().height;
        UIHelper.updateLabelSize(this._label);
        var desHeight = this._label.node.getContentSize().height + 41 + MARGIN * 2 + WEAPON_NAME_HEIGHT;
        height = Math.max(height, desHeight);
        this._label.node.setPosition(cc.v2(115, height - 41 - MARGIN - WEAPON_NAME_HEIGHT));
        var size = cc.size(BG_WIDTH, height);
        this._panelBg.setContentSize(size);
        this.node.setContentSize(size);
        var offset = Math.max(0, height - ORG_HEIGHT);
        this._commonItem.node.y = (this._commonItem.node.y + offset);
        this._weaponName.node.y = (this._weaponName.node.y + offset);
        this._nodeTitle.node.y = (this._nodeTitle.node.y + offset);
    }
}