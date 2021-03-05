import { G_UserData, Colors } from "../../../init";
import CommonUI from "../../../ui/component/CommonUI";
import { Path } from "../../../utils/Path";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Lang } from "../../../lang/Lang";
import UIConst from "../../../const/UIConst";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { PetDataHelper } from "../../../utils/data/PetDataHelper";
import { insertto } from "../../../utils/GlobleFunc";

export default class TeamViewHelper{
    public static getFirstEquipIdWithPos(pos) {
        var equipInfo = G_UserData.getBattleResource().getEquipInfoWithPos(pos);
        for (var k in equipInfo) {
            var id = equipInfo[k];
            return id;
        }
        return null;
    };
    public static createLine(width, posX?) {
        var width = width || 480;
        var posX = posX || 0;
        var node = new cc.Node();
        var image = node.addComponent(cc.Sprite);
        node.addComponent(CommonUI).loadTexture(Path.getUICommon('img_com_line01_board'));
        // node.setScale9Enabled(true);
        // node.setCapInsets(cc.rect(10, 10, 1, 1));
        node.setContentSize(540, 5);
        node.setAnchorPoint(new cc.Vec2(0, 0));
        node.setPosition(new cc.Vec2(posX, 0));
        node.setContentSize(cc.size(width, 25));
        return node;
    };
    public static playSkewFloatEffect(img:cc.Node) {
        if (!img) {
            return;
        }
        img.stopAllActions();
        if (img.getActionByTag(789)) {
            return;
        }
        var action1 = cc.moveBy(0.75, new cc.Vec2(10, -10));
        var action2 = cc.moveBy(0.75, new cc.Vec2(-10, 10));
        var seq = cc.sequence(action1, action2);
        var rep = cc.repeatForever(seq);
        rep.setTag(789);
        img.runAction(rep);
    };
    public static playSkewFloatSwitchEffect(img:cc.Node, res1, res2) {
        if (!img) {
            return;
        }
        img.stopAllActions();
        if (img.getActionByTag(678)) {
            return;
        }
        var action1 = cc.moveBy(0.75, new cc.Vec2(10, -10));
        var action2 = cc.moveBy(0.75, new cc.Vec2(-10, 10));
        var fun = function(res) {
            img.addComponent(CommonUI).loadTexture(res);
        };
        var seq = cc.sequence(cc.callFunc(function () {
            fun(res1);
        }), action1, action2, cc.callFunc(function () {
            fun(res2);
        }), action1, action2);
        var rep = cc.repeatForever(seq);
        rep.setTag(678);
        img.runAction(rep);
    };
    public static getHeroIconData() {
        var result = [];
        var heroIds = G_UserData.getTeam().getHeroIds();
        for (var i=0;i<heroIds.length;i++) {
            var heroId = heroIds[i];
            var baseId = 0;
            var limitLevel = 0;
            var limitRedLevel = 0;
            if (heroId > 0) {
                var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData);
                baseId = heroBaseId;
                limitLevel = avatarLimitLevel || unitData.getLimit_level();
                limitRedLevel = arLimitLevel || unitData.getLimit_rtg();
            }
            var funcId = FunctionConst['FUNC_TEAM_SLOT' + (i+1)];
            var info = {
                type: TypeConvertHelper.TYPE_HERO,
                value: baseId,
                funcId:funcId,
                id: heroId,
                limitLevel: limitLevel,
                limitRedLevel: limitRedLevel
            };
            result.push(info);
        }
        return result;
    };
    public static getPetIconData() {
        var result = [];
        var isShow = FunctionCheck.funcIsShow(FunctionConst.FUNC_PET_HOME);
        if (!isShow) {
            return result;
        }
        var baseId = 0;
        var petId = G_UserData.getBase().getOn_team_pet_id();
        if (petId > 0) {
            var unitData = G_UserData.getPet().getUnitDataWithId(petId);
            baseId = unitData.getBase_id();
        }
        var info = {
            type: TypeConvertHelper.TYPE_PET,
            value: baseId,
            funcId: FunctionConst.FUNC_PET_HOME,
            id: petId
        };
        result.push(info);
        return result;
    };
    public static getHeroAndPetIconData():Array<any> {
        var result = [];
        var heroIconData = TeamViewHelper.getHeroIconData();
        var petIconData = TeamViewHelper.getPetIconData();
        result = insertto(result, heroIconData, 0);
        result = insertto(result, petIconData, 0);
        return result;
    };
    public static getHeroAndPetShowData():Array<any> {
        var heroIds = G_UserData.getTeam().getHeroIdsInBattle();
        var petIds = G_UserData.getTeam().getPetIdsInBattle();
        var result = [];
        for (var i in heroIds) {
            var heroId = heroIds[i];
            var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var [heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel] = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData);
            var baseId = heroBaseId;
            var limitLevel = avatarLimitLevel || unitData.getLimit_level();
            var limitRedLevel = arLimitLevel || unitData.getLimit_rtg();
            var info = {
                type: TypeConvertHelper.TYPE_HERO,
                value: baseId,
                id: heroId,
                isEquipAvatar: isEquipAvatar,
                limitLevel: limitLevel,
                limitRedLevel: limitRedLevel
            };
            result.push(info);
        }
        var petId = petIds[1];
        if (petId) {
            let unitData1 = G_UserData.getPet().getUnitDataWithId(petId);
            baseId = unitData1.getBase_id();
            var info1 = {
                type: TypeConvertHelper.TYPE_PET,
                value: baseId,
                id: petId
            };
            result.push(info1);
        }
        return result;
    };
    //获取竖直页面的index通过水平页面索引
    /**
     * 
     * @param pageIndex 页面index
     */
    public static getIconPosWithPageIndex(pageIndex:number):number {
        var showDatas = TeamViewHelper.getHeroAndPetShowData();
        var showData = showDatas[pageIndex];
        if (showData) {
            var iconDatas = TeamViewHelper.getHeroAndPetIconData();
            for (var i in iconDatas) {
                var data = iconDatas[i];
                if (showData.type == data.type && showData.id == data.id) {
                    return parseInt(i);
                }
            }
        }
        return 0;
    };
    //获取水平页面index通过竖直页面索引
    /**
     * 
     * @param iconPos 页面index
     */
    public static getPageIndexWithIconPos(iconPos:number):number {
        var iconDatas = TeamViewHelper.getHeroAndPetIconData();
        var iconData = iconDatas[iconPos];
        if (iconData) {
            var showDatas = TeamViewHelper.getHeroAndPetShowData();
            for (var i in showDatas) {
                var data = showDatas[i];
                if (iconData.type == data.type && iconData.id == data.id) {
                    return parseInt(i);
                }
            }
        }
        return 0;
    };
    public static makeLevelDiffData(summary:Array<any>, unitData, lastLevel, targetNode, finishCallback) {
        function makeShowDataTable(unitData) {
            var showData:any = {};
            showData.langStr = 'summary_hero_level_add';
            if (unitData.getType() == TypeConvertHelper.TYPE_PET) {
                showData.langStr = 'summary_pet_level_add';
            }
            showData.nowLevel = unitData.getLevel();
            showData.targetNode = targetNode;
            showData.lastLevel = lastLevel;
            showData.finishCallback = finishCallback;
            return showData;
        }
        var showData = makeShowDataTable(unitData);
        if (showData.nowLevel > showData.lastLevel) {
            var content1 = Lang.get(showData.langStr, { level: showData.nowLevel - showData.lastLevel });
            var param1 = {
                content: content1,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                dstPosition: showData.targetNode,
                finishCallback: showData.finishCallback
            };
            summary.push(param1);
        }
    };
    public static makeBreakDiffData(summary:any, unitData, lastRank, finishCallback) {
        var makeShowDataTable = function (unitData) {
            var showData:any = {};
            showData.rankMax = 0;
            showData.currRank = 0;
            showData.baseId = unitData.getBase_id();
            showData.langStr = '';
            showData.lastRank = lastRank;
            showData.finishCallback = finishCallback;
            if (unitData.getType() == TypeConvertHelper.TYPE_HERO) {
                showData.rankMax = HeroDataHelper.getHeroBreakMaxLevel(unitData);
                showData.currRank = unitData.getRank_lv();
                showData.langStr = 'summary_hero_can_break';
                showData.langStr2 = 'summary_hero_break_add';
            } else {
                showData.rankMax = PetDataHelper.getPetBreakMaxLevel(unitData);
                showData.currRank = unitData.getStar();
                showData.langStr = 'summary_pet_can_break';
                showData.langStr2 = 'summary_pet_break_add';
            }
            return showData;
        }
        var showData = makeShowDataTable(unitData);
        if (showData.currRank < showData.rankMax) {
            var unitParam = TypeConvertHelper.convert(unitData.getType(), showData.baseId);
            var content2 = Lang.get(showData.langStr, {
                name: unitParam.name,
                color: Colors.colorToNumber(unitParam.icon_color),
                outlineColor: Colors.colorToNumber(unitParam.icon_color_outline),
                value: showData.rankMax
            });
            var param2 = {
                content: content2,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
            };
            summary.push(param2);
        }
        if (showData.currRank > showData.lastRank) {
            var content = Lang.get(showData.langStr2, { level: showData.currRank - showData.lastRank });
            var param = {
                content: content,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                finishCallback: showData.finishCallback
            };
            summary.push(param);
        }
    };
    public static makeAwakeDiffData(summary, unitData, lastAwake) {
        var nowAwake = unitData.getAwaken_level();
        if (nowAwake > lastAwake) {
            var content = Lang.get('summary_hero_awake_add', { level: nowAwake - lastAwake });
            var param = {
                content: content,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM }
            };
            summary.push(param);
        }
    };
    public static makeLimitDiffData(summary, unitData, lastLimit, lastRedLimit, finishCallback?) {
        var nowLimit = unitData.getLimit_level();
        var nowRedLimit = unitData.getLimit_rtg();
        var offset = 0;
        if (nowLimit > lastLimit) {
            offset = offset + nowLimit - lastLimit;
        }
        if (nowRedLimit > lastRedLimit) {
            offset = offset + nowRedLimit - lastRedLimit;
        }
        if (offset > 0) {
            var content = Lang.get('summary_hero_limit_add', { level: offset });
            var param = {
                content: content,
                startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
                finishCallback: finishCallback
            };
            summary.push(param);
        }
    };
}