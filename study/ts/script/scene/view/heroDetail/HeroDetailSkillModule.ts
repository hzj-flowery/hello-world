import { Lang } from "../../../lang/Lang";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import HeroDetailSkillCell from "./HeroDetailSkillCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroDetailSkillModule extends ListViewCellBase implements CommonDetailModule{

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;
    onCreate() {
        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
        this._heroDetailSkillCell = cc.resources.get(Path.getPrefab("HeroDetailSkillCell","heroDetail"));
    }

    private _skillIds: Array<any>;
    private _commonDetailTitleWithBg;//需要实例化
    private _heroDetailSkillCell;//需要实例化

    public numberOfCell(): number {
        return this._skillIds.length + 1;
    }

    public cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            let title = this._createTitle()
            return title;
        } else {
            var skillId = this._skillIds[i-1];
            var node1 = cc.instantiate(this._heroDetailSkillCell) as cc.Node;
            var cell = node1.getComponent(HeroDetailSkillCell) as HeroDetailSkillCell;
            cell.setInitData(skillId);
            return node1;
        }
    }
    public sectionView(): cc.Node {
        var content = (this._listView.getChildByName("content") as cc.Node);
        return content;
    }

    onLoad(): void {
        super.onLoad();
    }
    setInitData(skillIds): void {
        this._skillIds = skillIds;
    }
    _createTitle() {
        var node2 = cc.instantiate(this._commonDetailTitleWithBg) as cc.Node;
        var title = node2.getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_detail_title_skill'));
        var titleSize = cc.size(402, 41);
        node2.setContentSize(titleSize);
        title.node.setAnchorPoint(0.5, 0.5);
        title.node.x = titleSize.width / 2;
        return node2;
    }
}