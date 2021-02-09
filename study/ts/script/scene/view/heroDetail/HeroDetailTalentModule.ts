import { HeroUnitData } from "../../../data/HeroUnitData";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { CommonDetailModule } from "../../../ui/component/CommonDetailModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Path } from "../../../utils/Path";
import HeroGoldHelper from "../heroGoldTrain/HeroGoldHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroDetailTalentModule extends ListViewCellBase implements CommonDetailModule{

    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;
    
    private _commonDetailTitleWithBg;//需要实例化
    private _heroUnitData: HeroUnitData;
    private _notCheckAvatar: boolean;
    private _limitLevel: boolean;
    private _isGoldTrain: boolean;
    private _hideActive: boolean;
    _limitRedLevel: any;
    onCreate() {
        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
    }

    public setInitData(heroUnitData: HeroUnitData, notCheckAvatar?, limitLevel?, isGoldTrain?, hideActive?, limitRedLevel?)
    {
        this._heroUnitData = heroUnitData;
        this._notCheckAvatar = notCheckAvatar;
        this._limitLevel = limitLevel;
        this._limitRedLevel = limitRedLevel;
        this._isGoldTrain = isGoldTrain || false;
        this._hideActive = hideActive || false;
    }

    public numberOfCell(): number {
        var rankMax = this._heroUnitData.getConfig().rank_max;
        return rankMax + 1;
    }

    public cellAtIndex(i: number): cc.Node {
        if (i == 0) {
            var title = this._createTitle();
            return title.node;
        } else {
            return this._createDes(i);
        }
    }

    public sectionView(): cc.Node {
        return this._listView.getChildByName('content')
    }

    public footerHeight(): number {
        return 36;
    }
    
    _isActiveWithRank(rank) {
        var rankLevel = this._heroUnitData.getRank_lv();
        return rankLevel >= rank;
    }
    _createTitle() {
        var node1 = cc.instantiate(this._commonDetailTitleWithBg) as cc.Node;
        var title = node1.getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_detail_title_talent'));
        var titleSize = cc.size(402, 36);
        title.node.setContentSize(titleSize);
        title.node.setAnchorPoint(0,0);
        title.node.x = titleSize.width / 2;
        return title
    }
    _createDes(rank): cc.Node {
        var rankMax = this._heroUnitData.getConfig().rank_max;
        if (rank > rankMax) {
            return;
        }
        var node = new cc.Node();
        var isActive = this._heroUnitData.isUserHero() && this._isActiveWithRank(rank);
        var color = isActive && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        var [baseId, avatarLimitLevel, isEquipAvatar, avatarRedLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(this._heroUnitData);
        var limitLevel = avatarLimitLevel || this._limitLevel || this._heroUnitData.getLimit_level();
        var limitRedLevel = avatarRedLimitLevel || this._limitRedLevel || this._heroUnitData.getLimit_rtg();
        if (this._notCheckAvatar) {
            baseId = this._heroUnitData.getBase_id();
            limitLevel = this._heroUnitData.getLimit_level();
            limitRedLevel = this._heroUnitData.getLimit_rtg();
        }
        var config = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel);
        if (config == null) {
            return null;
        }
        var name = '[' + (config.talent_name + (rank + '] '));
        var des = config.talent_description;
        var breakDes = '';
        if (HeroGoldHelper.isPureHeroGold(this._heroUnitData)) {
            breakDes = (isActive || this._hideActive) ? '' : Lang.get('hero_gold_txt_break_des', { rank: rank });
        } else {
            breakDes = isActive ? '' : Lang.get('hero_break_txt_break_des', { rank: rank });
        }
        var isFeature = config.talent_target == 0;
        var content = '';
        var downDis = 0;
        var color2 = color;
        if (this._isGoldTrain) {
            color2 = Colors.SYSTEM_TARGET_RED;
        }
        if (isFeature) {
            content = Lang.get('hero_limit_talent_des_2', {
                urlIcon: Path.getTextSignet('txt_tianfu_texing'),
                name: name,
                des: des,
                breakDes: breakDes,
                color1: color,
                color2: color2
            });
            downDis = 15;
        } else {
            content = Lang.get('hero_limit_talent_des_1', {
                name: name,
                des: des,
                breakDes: breakDes,
                color1: color,
                color2: color2
            });
        }

        let label = RichTextExtend.createWithContent(content);
        node.addChild(label.node);
        label.node.setAnchorPoint(new cc.Vec2(0, 0));
        //label.node.ignoreContentAdaptWithSize(false);
        label.maxWidth = 360;
        // label.lineHeight = 20;
        //label.formatText();
        var height = label.node.getContentSize().height;
        label.node.setPosition(new cc.Vec2(24,-20-downDis));
        label.node.x = 24;
        
        var size = cc.size(402, height+10);
        node.setContentSize(size);
        node.setAnchorPoint(0,0);

        return node;
    }

}