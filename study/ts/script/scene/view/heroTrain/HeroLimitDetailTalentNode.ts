import { HeroUnitData } from "../../../data/HeroUnitData";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { HeroConst } from "../../../const/HeroConst";

const { ccclass, property } = cc._decorator;
@ccclass
export default class HeroLimitDetailTalentNode extends ListViewCellBase {
    private _heroUnitData: HeroUnitData;
    private _limitLevel1: number;
    private _limitLevel2: number;
    private _commonDetailTitleWithBg:any;
    private _treasureTrainLimitBg: any;
    @property({
        type: cc.Node,
        visible: true
    })
    _listView: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _listView1: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _listView2: cc.Sprite = null;

    public setInitData(heroUnitData, limitLevel1?, limitLevel2?): void {
        this._heroUnitData = heroUnitData;
        this._limitLevel1 = limitLevel1;
        this._limitLevel2 = limitLevel2;
        this._commonDetailTitleWithBg = cc.resources.get(Path.getCommonPrefab("CommonDetailTitleWithBg"));
        this._treasureTrainLimitBg = cc.resources.get(Path.getPrefab("TreasureTrainLimitBg", "treasure"));
    }
    onCreate() {
        var rankFilterMap = this._getSameTalentRank();
        for (var i = 1; i <= 2; i++) {
            this._updateSubView(i, rankFilterMap);
        }
    }
    _updateSubView(index, rankFilterMap) {
        var limitDataType = HeroDataHelper.getLimitDataType(this._heroUnitData);
        var rankMax = this._heroUnitData.getConfig().rank_max;
        var lv1, lv2;
        if (limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            if (index == 1) {
                lv1 = 0;
            } else {
                lv1 = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
            }
            lv2 = 0;
        } else {
            lv1 = this._heroUnitData.getLimit_level();
            if (index == 1) {
                lv2 = 0;
            } else {
                lv2 = HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL;
            }
        }
        var ranks = [];
        for (var i = 1; i <= rankMax; i++) {
            if (!rankFilterMap[i]) {
                ranks.unshift(i);
            }
        }
        for (i = 0; i < ranks.length; i++) {
            var rank = ranks[i];
            var des = this._createDes(rank, lv1, lv2);
            if (des) {
                UIHelper.insertCurstomListContent((this['_listView' + index] as cc.Sprite).node, des.node);
            }
        }


        var title = this._createTitle(index);
        UIHelper.insertCurstomListContent((this['_listView' + index] as cc.Sprite).node, title.node, 1);


        var contentSize = (this['_listView' + index] as cc.Sprite).node.getContentSize();
        contentSize.width = 402;
        contentSize.height = contentSize.height + 10;
        this['_listView' + index].node.setContentSize(contentSize);
        this._listView.setContentSize(contentSize)
        this.node.setContentSize(contentSize);

        var dis = (this['_listView' + 1] as cc.Sprite).node.height - (this['_listView' + 2] as cc.Sprite).node.height;

        var left = 0;
        var right = 0;
        if (dis > 0) {
            //左边高
            right = dis;
        }
        else {
            //右边高
            left = -dis;
        }
        this.scheduleOnce(function () {
            (this['_listView' + 1] as cc.Sprite).node.y = left;
            (this['_listView' + 2] as cc.Sprite).node.y = right;
        }.bind(this))
    }

    _getSameTalentRank() {
        var rankFilterMap = {};
        var desList = {};
        var rankMax = this._heroUnitData.getConfig().rank_max;
        var limitDataType = HeroDataHelper.getLimitDataType(this._heroUnitData);
        if (limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            return rankFilterMap;
        }
        var baseId = this._heroUnitData.getBase_id();
        for (var index = 1; index <= 2; index++) {
            desList[index] = {};
            var lv1, lv2;
            if (limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
                if (index == 1) {
                    lv1 = 0;
                } else {
                    lv1 = HeroConst.HERO_LIMIT_RED_MAX_LEVEL;
                }
                lv2 = 0;
            } else {
                lv1 = this._heroUnitData.getLimit_level();
                if (index == 1) {
                    lv2 = 0;
                } else {
                    lv2 = HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL;
                }
            }
            for (var rank = 1; rank <= rankMax; rank++) {
                var limitLevel = lv1;
                var limitRedLevel = lv2;
                var config = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel, limitRedLevel);
                if (config) {
                    var des = config.talent_description;
                    desList[index][rank] = des;
                }
            }
        }
        for (var rank = 1; rank != rankMax; rank++) {
            if (desList[1][rank] == desList[2][rank]) {
                rankFilterMap[rank] = true;
            }
        }
        return rankFilterMap;
    }
    _createTitle(index) {
        var node3 = cc.instantiate(this._commonDetailTitleWithBg);
        var title = node3.getComponent(CommonDetailTitleWithBg) as CommonDetailTitleWithBg;
        title.setFontSize(24);
        title.setTitle(Lang.get('hero_limit_detail_talent_title'));
        var node = new cc.Node();
        var widget = node.addComponent(cc.Widget);
        var titleSize = cc.size(402, 34);
        var widgetSize = cc.size(402, 34 + 10);
        widget.node.setContentSize(widgetSize);
        title.node.setPosition(201, titleSize.height / 2 + 10);
        widget.node.addChild(title.node);
        return widget;
    }
    _isActiveWithRank(rank) {
        var limitDataType = HeroDataHelper.getLimitDataType(this._heroUnitData);
        var needLimitLevel = HeroDataHelper.getNeedLimitLevelWithRank(rank, limitDataType);
        if (needLimitLevel == null) {
            return [
                false,
                needLimitLevel
            ];
        }
        var lv;
        if (limitDataType == HeroConst.HERO_LIMIT_TYPE_RED) {
            lv = this._heroUnitData.getLimit_level();
        } else {
            lv = this._heroUnitData.getLimit_rtg();
        }
        if (lv >= needLimitLevel) {
            return [
                true,
                needLimitLevel
            ];
        } else {
            return [
                false,
                needLimitLevel
            ];
        }
    }
    _createDes(rank, limitLevel, limitRedLevel) {
        var node = new cc.Node();
        var widget = node.addComponent(cc.Widget);
        var isActive = true;
        var limitDataType = HeroDataHelper.getLimitDataType(this._heroUnitData);
        var needLimitLevel = HeroDataHelper.getNeedLimitLevelWithRank(rank, limitDataType);
        var isTop = limitDataType == 0 && limitLevel == 3 || limitRedLevel == 4;
        if (isTop) {
            [isActive, needLimitLevel] = this._isActiveWithRank(rank);
        }
        var color = Colors.colorToHexStr(Colors.BRIGHT_BG_TWO);
        var baseId = this._heroUnitData.getBase_id();
        var config = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel, limitRedLevel);
        if (config == null) {
            return null;
        }
        var name = '[' + (config.talent_name + (rank + '] '));
        var des = config.talent_description;
        var breakDes = '';
        if (!isActive && needLimitLevel && isTop) {
            breakDes = Lang.get('hero_limit_txt_break_des', { limit: needLimitLevel });
        }
        var isFeature = config.talent_target == 0;
        var content = '';
        if (isFeature) {
            content = Lang.get('hero_limit_talent_des_2', {
                urlIcon: Path.getTextSignet('txt_tianfu_texing'),
                name: name,
                des: des,
                breakDes: breakDes,
                color1: color,
                color2: Colors.colorToHexStr(Colors.SYSTEM_TARGET_RED)
            });
        } else {
            content = Lang.get('hero_limit_talent_des_1', {
                name: name,
                des: des,
                breakDes: breakDes,
                color1: color,
                color2: Colors.colorToHexStr(Colors.SYSTEM_TARGET_RED)
            });
        }
        let label = RichTextExtend.createWithContent(content);
        label.node.setAnchorPoint(new cc.Vec2(0, 1));
        //label.node.ignoreContentAdaptWithSize(false);
        // label.node.setContentSize(cc.size(360, 0));
        label.maxWidth = 360;
        //label.formatText();
        var height = label.node.getContentSize().height;
        label.node.setPosition(new cc.Vec2(24, height + 25));
        widget.node.addChild(label.node);
        var size = cc.size(402, height + 25);
        widget.node.setContentSize(size);
        return widget;
    }
    _createBg(): cc.Node {
        var node = cc.instantiate(this._treasureTrainLimitBg) as cc.Node;
        return node;
    }
    _setBgSize(node: cc.Node, size) {

        var bg = node.getChildByName('Image_1');
        bg.setContentSize(size);
    }
}