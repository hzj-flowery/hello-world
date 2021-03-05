import { HeroUnitData } from "../../../data/HeroUnitData";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroDetailBriefModule extends ListViewCellBase implements CommonDetailModule {
    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;

    onCreate() {
        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
    }

    private _commonDetailTitleWithBg;
    private _heroUnitData: HeroUnitData;
    public setInitData(heroUnitData: HeroUnitData): void {
        this._heroUnitData = heroUnitData;
    }

    public numberOfCell(): number {
        return 2;
    }

    public cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            var title = this._createTitle();
            return title;
        } else {
            var des = this._createDes();
            return des.node;
        }
    }

    public sectionView(): cc.Node {
        return (this._listView.getChildByName("content") as cc.Node);
    }

    public footerHeight(): number {
        return 10;
    }

    _createTitle() {
        var title = (cc.instantiate(cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"))) as cc.Node).getComponent(CommonDetailTitleWithBg)
        title.setFontSize(24);
        title.setTitle(Lang.get('avatar_detail_brief_title'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 36);
        var widgetSize = cc.size(402, 36 + 10);
        widget.setContentSize(widgetSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2-20);
        widget.addChild(title.node);
        return widget;
    }
    _createDes() {
        var briefDes = this._heroUnitData.getConfig().description;
        var color = Colors.BRIGHT_BG_TWO;

        var labelDes: cc.Label = UIHelper.createWithTTF(briefDes, Path.getCommonFont(), 20);
        //自动换行

        labelDes.node.setAnchorPoint(new cc.Vec2(0, 1));
        labelDes.verticalAlign = cc.Label.VerticalAlign.TOP;
        labelDes.lineHeight = (26);
        labelDes.node.width = 350;
        labelDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelDes.node.color = (color);
        labelDes.node.x = 24;

        labelDes['_updateRenderData']();
        return labelDes;
    }

}