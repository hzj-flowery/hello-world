import CommonDetailTitle from "../../../ui/component/CommonDetailTitle";

import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";

import CommonHeroName from "../../../ui/component/CommonHeroName";

import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroTransformPreviewCommon extends cc.Component {
    @property({ type: CommonDetailTitle, visible: true })
    _nodeTitle: CommonDetailTitle = null;
    @property({ type: CommonHeroIcon, visible: true })
    _nodeHeroIcon: CommonHeroIcon = null;
    @property({ type: CommonHeroName, visible: true })
    _nodeHeroName: CommonHeroName = null;
    onLoad() {
        this._initData();
        this._initView();
    }
    _initData() {
    }
    _initView() {
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setImageBaseSize(cc.size(242, 44));
        this._nodeTitle.setFontImageBgSize(cc.size(226, 34));
        this._nodeHeroName.setFontSize(20);
    }
    updateUI(type, heroBaseId, limitLevel, rankLevel) {
        if (type == 1) {
            this._nodeTitle.setTitle(Lang.get('hero_transform_preview_before'));
        } else if (type == 2) {
            this._nodeTitle.setTitle(Lang.get('hero_transform_preview_after'));
        }
        this._nodeHeroIcon.updateUI(heroBaseId, null, limitLevel);
        this._nodeHeroName.setName(heroBaseId, rankLevel, limitLevel);
    }
}