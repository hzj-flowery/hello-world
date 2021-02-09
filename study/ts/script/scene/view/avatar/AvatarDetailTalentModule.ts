const { ccclass, property } = cc._decorator;
import { HeroConst } from "../../../const/HeroConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Path } from "../../../utils/Path";

@ccclass
export default class AvatarDetailTalentModule extends ListViewCellBase implements CommonDetailModule {
    @property(CommonCustomListView)
    listView: CommonCustomListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _newlistView: cc.Node = null;

    @property(cc.Prefab)
    commonDetailTitleWithBg: cc.Prefab = null;

    private _data: any;
    private _heroUnitData: any;
    private _noActive: boolean;

    updateUI(data, noActive?) {
        this._data = data;
        this._noActive = noActive;
        var heroId = G_UserData.getTeam().getHeroIdWithPos(1);
        this._heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
    }
    // onCreate(){
    //     var heroId = G_UserData.getTeam().getHeroIdWithPos(1);
    //     this._heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);

    //     var baseId = AvatarDataHelper.getAvatarConfig(this._data.getBase_id()).hero_id;
    //     var rankMax = HeroDataHelper.getHeroConfig(baseId).rank_max;
    //     var title = this._createTitle();
    //     this._newlistView.addChild(title);
    //     for (var i = 1; i<=rankMax; i++) {
    //         var des = this._createDes(i, this._noActive);
    //     }
    //     // var contentSize = this._newlistView.getContentSize();
    //     // contentSize.height = contentSize.height + 10;
    //     // this._newlistView.setContentSize(contentSize);
    //     // this.node.setContentSize(contentSize);
    // }
    _createTitle() {
        var node = cc.instantiate(this.commonDetailTitleWithBg);
        var title = node.getComponent(CommonDetailTitleWithBg);
        // var title = CSHelper.loadResourceNode(Path.getCSB('CommonDetailTitleWithBg', 'common'));
        title.setFontSize(24);
        title.setTitle(Lang.get('avatar_detail_talent_title'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 34);
        var widgetSize = cc.size(402, 34 + 10);
        widget.setContentSize(widgetSize);
        title.node.setPosition(titleSize.width / 2, titleSize.height / 2 - 15);
        widget.addChild(title.node);
        return widget;
    }
    _isActiveWithRank(rank) {
        var rankLevel = this._heroUnitData.getRank_lv();
        return rankLevel >= rank;
    }
    _createDes(rank, noActive) {
        var widget = new cc.Node();//ccui.Widget.create();
        // this._newlistView.addChild(widget);
        var isActive = this._isActiveWithRank(rank);
        if (noActive == true) {
            isActive = false;
        }
        var color = isActive && Colors.colorToHexStr(Colors.BRIGHT_BG_GREEN) || Colors.colorToHexStr(Colors.BRIGHT_BG_TWO);
        var info = AvatarDataHelper.getAvatarConfig(this._data.getBase_id());
        var baseId = info.hero_id;
        var limitLevel = 0;
        if (info.limit == 1) {
            limitLevel = HeroConst.HERO_LIMIT_MAX_LEVEL;
        }
        var config = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel);
        var name = '[' + (config.talent_name + (rank + '] '));
        var des = config.talent_description;
        var breakDes = isActive && '' || Lang.get('hero_break_txt_break_des', { rank: rank });
        var txt = name + (des + breakDes);
        var isFeature = config.talent_target == 0;
        var content = '';
        var downDis = 0;
        if (isFeature) {
            content = Lang.get('hero_detail_talent_des_2', {
                urlIcon: Path.getTextSignet('txt_tianfu_texing'),
                des: txt,
                color: color
            });
            downDis = 15;
        } else {
            content = Lang.get('hero_detail_talent_des_1', {
                des: txt,
                color: color
            });
        }
        var label = RichTextExtend.createWithContent(content);
        label.lineHeight = 20;
        label.maxWidth = 360;
        label.node.setAnchorPoint(cc.v2(0, 1));
        widget.addChild(label.node);
        //label.ignoreContentAdaptWithSize(false);
        // label.node.setContentSize(cc.size(360, 0));
        //label.formatText();
        var height = label.node.getContentSize().height;
        label.node.setPosition(cc.v2(24, height-downDis));

        var size = cc.size(402, height + 10+downDis);
        widget.setContentSize(size);
        return widget;
    }

    numberOfCell(): number {
        var baseId = AvatarDataHelper.getAvatarConfig(this._data.getBase_id()).hero_id;
        var rankMax = HeroDataHelper.getHeroConfig(baseId).rank_max;
        return rankMax + 1;
    }
    cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            return this._createTitle();
        } else {
            return this._createDes(i, this._noActive);
        }
    }
    sectionView(): cc.Node {
        return this._newlistView;
    }
}
