import { HeroUnitData } from "../../../data/HeroUnitData";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroDetailAwakeModule extends ListViewCellBase implements CommonDetailModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;

    private _commonDetailTitleWithBg;

    onCreate() {
        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
    }

    private desInfo: any[];
    private _rangeType: number;
    public setInitData(heroUnitData: HeroUnitData, rangeType: number): void {
        this._rangeType = rangeType;
        this.desInfo = HeroDataHelper.getHeroAwakeTalentDesInfo(heroUnitData);
    }

    public numberOfCell(): number {
        return this.desInfo.length + 1;
    }

    public cellAtIndex(i: number) {
        var content = (this._listView.getChildByName("content") as cc.Node);
        if (i == 0) {
            var title = this._createTitle();
            return title.node;
        } else {
            return this._createDes(this.desInfo, i - 1);
        }
    }

    public sectionView(): cc.Node {
        return this._listView.getChildByName('content');
    }

    public footerHeight(): number {
        return 36;
    }

    _createTitle() {
        var node1 = cc.instantiate(this._commonDetailTitleWithBg) as cc.Node;
        var title = node1.getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_detail_title_awake'));
        var titleSize = cc.size(402, 36);
        title.node.setContentSize(titleSize);
        title.node.setAnchorPoint(0, 0);
        title.node.x = titleSize.width / 2;
        return title;
    }
    _createDes(desInfo, index) {
        var info = desInfo[index];
        if (!info) {
            return;
        }
        var node = new cc.Node();
        var widget = node.addComponent(cc.Widget);
        // (this._listView.getChildByName("content") as cc.Node).addChild(widget.node);
        var isActive = info.isActive;
        var desColor = isActive && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        var name = '[觉醒天赋' + (index + 1) + ']';
        var des = info.des;

        var labelName = UIHelper.createLabel({ fontSize: 20 }).getComponent(cc.Label);
        labelName.node.width = 125;
        labelName.lineHeight = 30;
        labelName.string = name;
        widget.node.addChild(labelName.node);
        labelName.node.setAnchorPoint(new cc.Vec2(0, 1));

        labelName.node.color = (desColor);
        labelName.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelName.cacheMode = cc.Label.CacheMode.CHAR;

        var labelDes = UIHelper.createLabel({ fontSize: 20 }).getComponent(cc.Label);
        labelDes.node.width = 250;
        labelDes.node.setAnchorPoint(new cc.Vec2(0, 1));
        labelDes.lineHeight = 30;
        labelDes.string = des;
        widget.node.addChild(labelDes.node);
        labelDes.node.color = (desColor);
        labelDes.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        labelDes.cacheMode = cc.Label.CacheMode.CHAR;
        labelName.node.x = 24;
        labelDes.node.x = 145;

        labelDes['_updateRenderData'](true);

        var height = labelDes.node.getContentSize().height;
        var size = cc.size(402, height + 10);
        node.setContentSize(size);

        return node;
    }

}