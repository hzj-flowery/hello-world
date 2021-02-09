import { Lang } from "../../../lang/Lang";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import HistoryHeroDetailSkillCell from "./HistoryHeroDetailSkillCell";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetailSkillModule extends CommonDetailDynamicModule {
    @property(cc.Prefab)
    detailTitleWithBg: cc.Prefab = null;
    @property(cc.Prefab)
    skillPrefab: cc.Prefab = null;
    _skillIds: any;
    _breakthrough: any;

    ctor(skillIds, breakthrough) {
        this._skillIds = skillIds;
        this._breakthrough = breakthrough;
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        for (var i in this._skillIds) {
            var skillId = this._skillIds[i];
            var cell = cc.instantiate(this.skillPrefab).getComponent(HistoryHeroDetailSkillCell);
            cell.ctor(i, skillId, this._breakthrough);
            this._listView.pushBackCustomItem(cell.node);
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        this._listView.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
    }
    _createTitle() {
        var node = cc.instantiate(this.detailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        title.setTitle(Lang.get('hero_detail_title_skill'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 41);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2);
        widget.addChild(title.node);
        return widget;
    }
}