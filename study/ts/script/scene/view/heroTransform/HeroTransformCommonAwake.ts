const { ccclass, property } = cc._decorator;

import CommonGemstoneIcon from '../../../ui/component/CommonGemstoneIcon'

import CommonHeroStar from '../../../ui/component/CommonHeroStar'

import CommonDesValue from '../../../ui/component/CommonDesValue'
import { Colors } from '../../../init';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class HeroTransformCommonAwake extends cc.Component {

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeDesValue: CommonDesValue = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _nodeStar: CommonHeroStar = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _nodeGemstone1: CommonGemstoneIcon = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _nodeGemstone2: CommonGemstoneIcon = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _nodeGemstone3: CommonGemstoneIcon = null;

    @property({
        type: CommonGemstoneIcon,
        visible: true
    })
    _nodeGemstone4: CommonGemstoneIcon = null;

    onLoad() {
        this._initView();
    }
    onEnter() {
    }
    onExit() {
    }
    _initView() {
        this._nodeDesValue.setFontSize(20);
        this._nodeDesValue.setDesColor(Colors.BRIGHT_BG_TWO);
        this._nodeDesValue.setValueColor(Colors.BRIGHT_BG_TWO);
    }
    updateUI(baseId, awakeLevel, gemstones) {
        for (var i = 1; i <= 4; i++) {
            this['_nodeGemstone' + i].onLoad();
        }
        this._updateDesAndStar(awakeLevel);
        this._updateGemstone(baseId, awakeLevel, gemstones);
    }
    _updateDesAndStar(awakeLevel) {
        var [star, level] = HeroDataHelper.convertAwakeLevel(awakeLevel);
        var des = Lang.get('hero_transform_preview_awake_title');
        var value = Lang.get('hero_transform_preview_awake_value', {
            star: star,
            level: level
        });
        this._nodeDesValue.updateUI(des, value);
        this._nodeStar.setStarOrMoon(star);
    }
    _updateGemstone(baseId, awakeLevel, gemstones) {
        var heroConfig = HeroDataHelper.getHeroConfig(baseId);
        var awakeCost = heroConfig.awaken_cost;
        var info = HeroDataHelper.getHeroAwakenConfig(awakeLevel, awakeCost);
        for (var i = 1; i <= 4; i++) {
            var baseId = info['gemstone_value' + i];
            var stoneId = gemstones[i -1];
            var mask = stoneId <= 0;
            this['_nodeGemstone' + i].updateUI(baseId);
            this['_nodeGemstone' + i].setIconMask(mask);
        }
    }
}