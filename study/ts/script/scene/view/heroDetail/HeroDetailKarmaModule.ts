import { HeroUnitData } from "../../../data/HeroUnitData";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroDetailKarmaModule extends ListViewCellBase implements CommonDetailModule {

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;
    private _heroUnitData: HeroUnitData;
    private _rangeType;
    private _bForceShowKarma: boolean;
    private _allKarmaData;

    //预制体需要实例化
    private _commonDetailTitleWithBg;
    private _commonButtonLevel2Highlight;

    public setInitData(heroUnitData: HeroUnitData, rangeType, bForceShowKarma?): void {
        this._heroUnitData = heroUnitData;
        this._rangeType = rangeType;
        this._bForceShowKarma = bForceShowKarma || false;
        this._allKarmaData = HeroDataHelper.getHeroKarmaData(this._heroUnitData.getConfig());
    }

    public numberOfCell(): number {
        if (this._heroUnitData.isUserHero()) {
            return this._allKarmaData.length + 2;
        }
        return this._allKarmaData.length + 1;
    }

    public cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            var title = this._createTitle();
            return title.node;
        } else {
            if (this._heroUnitData.isUserHero()) {
                if (i == this._allKarmaData.length + 1) {
                    var btnWidget = this._createButton();
                    return btnWidget.node;
                }
                return this._createDes(i - 1)
            }

            return this._createDes(i - 1);
        }
    }

    public sectionView(): cc.Node {
        return (this._listView.getChildByName("content") as cc.Node);
    }

    footerHeight(): number {
        return 36;
    }

    updateData(heroUnitData) {
        this._heroUnitData = heroUnitData;
    }

    _createTitle() {
        var node3 = cc.instantiate(this._commonDetailTitleWithBg) as cc.Node;
        var title = node3.getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_detail_title_karma'));
        var titleSize = cc.size(402, 36);
        title.node.setContentSize(titleSize);
        title.node.setAnchorPoint(0, 0);
        title.node.x = titleSize.width / 2;
        return title;
    }
    _createButton() {
        var node2 = new cc.Node();
        var widget = node2.addComponent(cc.Widget);
        widget.node.setContentSize(cc.size(402, 70));
        var node4 = cc.instantiate(this._commonButtonLevel2Highlight) as cc.Node;
        var btn = node4.getComponent(CommonButtonLevel2Highlight) as CommonButtonLevel2Highlight;
        btn._text.string = (Lang.get('hero_detail_btn_active'));
        btn.node.x = 320;
        btn.addClickEventListenerEx(handler(this, this._onButtonActiveClicked));
        widget.node.addChild(btn.node);
        return widget;
    }
    _createDes(i): cc.Node {
        let data = this._allKarmaData[i];
        if (!data) {
            return;
        }

        var node1 = new cc.Node();
        var widget = node1.addComponent(cc.Widget);
        var isReach = HeroDataHelper.getReachCond(this._heroUnitData, data['cond1'], data['cond2']);
        var isActive = this._heroUnitData.isUserHero() && G_UserData.getKarma().isActivated(data.id);
        var desColor = isActive && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        if (!this._bForceShowKarma) {
            if (!isReach && !isActive) {
                return;
            }
        }
        var name = Lang.get('hero_detail_karma_name', { name: data.karmaName });
        var tbDesInfo = [];
        for (let i in data.heroIds) {
            var heroId = data.heroIds[i];
            var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId);
            var heroName = heroParam.name;
            var isHaveHero = this._heroUnitData.isUserHero() && G_UserData.getKarma().isHaveHero(heroId);
            var heroColor = isHaveHero && 'c103' || 'c102';
            var parma = [
                heroName,
                heroColor
            ];
            tbDesInfo.push(parma);
        }

        let labelName = UIHelper.createWithTTF(name, Path.getCommonFont(), 20);

        labelName.node.setAnchorPoint(new cc.Vec2(0, 1));
        labelName.lineHeight = (26);
        labelName.node.width = (140);
        labelName.node.color = (desColor);
        widget.node.addChild(labelName.node);
        var params = {
            defaultColor: desColor,
            defaultSize: 20
        };
        var heroNames = '';
        for (let i = 0; i < tbDesInfo.length; i++) {
            var info = tbDesInfo[i];
            name = info[0];
            if (i != tbDesInfo.length - 1) {
                heroNames = heroNames + "$" + info[1] + "_" + name + "$" + '、';
            }
            else
                heroNames = heroNames + "$" + info[1] + "_" + name + "$";

            // heroNames = heroNames + ('$' + (info[1] + ('_' + (name + '$'))));
        }
        var formatStr = Lang.get('hero_detail_karma_des', {
            attr: data.attrName,
            value: data.attrValue,
            names: heroNames
        });

        let richTextDes = RichTextExtend.createRichTextByFormatString(formatStr, params)
        richTextDes.node.setAnchorPoint(new cc.Vec2(0, 1));
        richTextDes.maxWidth = 250;
        widget.node.addChild(richTextDes.node);
        var height = richTextDes.node.getContentSize().height;
        labelName.node.x = 24;
        richTextDes.node.x = 134;


        var size = cc.size(402, height + 10);
        widget.node.setContentSize(size);


        i++;
        widget.node.setSiblingIndex(i)

        return node1;
    }
    _onButtonActiveClicked() {

        // var popupHeroKarma = new PopupHeroKarma(this, this._heroUnitData, this._rangeType);
        // popupHeroKarma.openWithAction();
    }
    

    public onCreate() {

        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
        this._commonButtonLevel2Highlight = cc.resources.get(Path.getCommonPrefab("CommonButtonLevel2Highlight"));
        this.node.name = "HeroDetailKarmaModule";
    }
}