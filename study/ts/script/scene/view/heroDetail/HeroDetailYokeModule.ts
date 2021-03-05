import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import YokeDesNode from "../team/YokeDesNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroDetailYokeModule extends ListViewCellBase implements CommonDetailModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;

    private _heroYoke;
    private _commonDetailTitleWithBg;

    onCreate() {
        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
    }

    public setInitData(heroYoke): void {
        this._heroYoke = heroYoke;
    }

    public numberOfCell(): number {
        return this._heroYoke.yokeInfo.length + 1;
    }

    public cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            var title = this._createTitle();
            return title.node;
        } else {
            return this._createDes(i)
        }
    }

    public sectionView(): cc.Node {
        return (this._listView.getChildByName("content") as cc.Node);

    }

    public footerHeight(): number {
        return 36;
    }
    _createTitle() {
        var node2 = cc.instantiate(this._commonDetailTitleWithBg) as cc.Node;
        var title = node2.getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_detail_title_yoke'));
        var titleSize = cc.size(402, 36);
        title.node.setContentSize(titleSize);
        title.node.setAnchorPoint(0, 0);
        title.node.x = titleSize.width / 2;
        return title;
    }
    _createDes(i): cc.Node {
        var info = this._heroYoke.yokeInfo[i];
        if (!info) {
            return;
        }

        var node1 = new cc.Node();
        var isActive = info.isActivated;
        var desColor = isActive && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        var fateType = info.fateType;
        var name = Lang.get('hero_detail_yoke_name', { name: info.name });
        var labelName = UIHelper.createLabel({ fontSize: 20 }).getComponent(cc.Label);
        labelName.string = name;
        labelName.node.setAnchorPoint(new cc.Vec2(0, 1));
        labelName.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelName.node.width = (125);
        labelName.node.color = (desColor);
        node1.addChild(labelName.node);

        var yokeDesNode = new YokeDesNode();
        node1.addChild(yokeDesNode);
        yokeDesNode.updateView(info, 250, 0);
        yokeDesNode.setAnchorPoint(new cc.Vec2(0, 1));
        var height = yokeDesNode.getContentSize().height;
        labelName.node.x = 24;
        yokeDesNode.x = 145;


        var size = cc.size(402, height);
        node1.setContentSize(size);

        return node1;
    }

}