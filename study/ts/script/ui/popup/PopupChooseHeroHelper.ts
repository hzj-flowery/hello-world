import { G_UserData, G_ConfigLoader } from "../../init";
import { assert, unpack } from "../../utils/GlobleFunc";
import { HeroDataHelper } from "../../utils/data/HeroDataHelper";
import { Lang } from "../../lang/Lang";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Path } from "../../utils/Path";

var BTN_DES = {
    1: 'hero_replace_btn_battle',
    2: 'hero_replace_btn_replace',
    3: 'hero_replace_btn_battle',
    4: 'hero_replace_btn_replace',
    5: 'lang_territory_choose',
    6: 'guild_help_btn_help',
    7: 'lang_territory_choose',
    8: 'lang_territory_choose',
    9: 'lang_territory_choose',
    10: 'lang_territory_choose'
};
export default class PopupChooseHeroHelper {
    public static FROM_TYPE1 = 1 //从“加号”点进来
    public static FROM_TYPE2 = 2 //从“更换”点进来
    public static FROM_TYPE3 = 3 //从“援军+”点进来
    public static FROM_TYPE4 = 4 //从“援军Icon”点进来
    public static FROM_TYPE5 = 5 //从驻地“加号”点进来
    public static FROM_TYPE6 = 6 //从“请求增援”点进来
    public static FROM_TYPE7 = 7 //从“武将重生”点进来
    public static FROM_TYPE8 = 8 //从“武将置换”点进来
    public static FROM_TYPE9 = 9 //从晋将养成“加号”点进来
    public static FROM_TYPE10 = 10 //从驻地一键巡逻“加号”点进来

    public static _beReplacedPos: boolean = false;
    private static _getHeroDataYoKeDesc(heroData, fromType) {
        var beReplacedId = null;
        if (PopupChooseHeroHelper._beReplacedPos) {
            var heroId = null;
            if (fromType == PopupChooseHeroHelper.FROM_TYPE2) {
                heroId = G_UserData.getTeam().getHeroIdWithPos(PopupChooseHeroHelper._beReplacedPos);
            } else if (fromType == PopupChooseHeroHelper.FROM_TYPE4) {
                heroId = G_UserData.getTeam().getHeroIdInReinforcementsWithPos(PopupChooseHeroHelper._beReplacedPos);
            }
            //assert((heroId, cc.js.formatStr('PopupChooseHeroHelper._getHeroDataYoKeDesc, fromType is wrong = %d', fromType));
            var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
            beReplacedId = unitData.getBase_id();
        }
        var des = '';
        var yokeCount = 0;
        if (fromType == PopupChooseHeroHelper.FROM_TYPE3 || fromType == PopupChooseHeroHelper.FROM_TYPE4) {
            yokeCount = HeroDataHelper.getWillActivateYokeCount(heroData.getBase_id(), beReplacedId, true)[0];
        } else {
            yokeCount = HeroDataHelper.getWillActivateYokeCount(heroData.getBase_id(), beReplacedId)[0];
        }
        if (yokeCount > 0) {
            des = des + (Lang.get('hero_replace_yoke_des', { count: yokeCount }) + '\n');
        }
        if (fromType != PopupChooseHeroHelper.FROM_TYPE3 && fromType != PopupChooseHeroHelper.FROM_TYPE4) {
            if (heroData.isActiveJoint(beReplacedId)) {
                var heroConfig = heroData.getConfig();
                var name = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(heroConfig.skill_3_partner).name;
                des = des + Lang.get('hero_replace_joint_des', { name: name });
            }
        }
        return des;
    };
    public static addHeroDataDesc(heroData, fromType, index) {
        if (heroData == null) {
            return null;
        }
        var cellData: any = {};
        for (const key in heroData) {
            cellData[key] = heroData[key];
        }
        if (fromType == PopupChooseHeroHelper.FROM_TYPE5) {
            var heroConfig = heroData.getConfig();
            var fragNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, heroConfig.fragment_id);
            cellData.richTextDesc = [Lang.get('lang_territory_choose_hero_fragment', { num: fragNum })];
        }
        else if (fromType == PopupChooseHeroHelper.FROM_TYPE7 || fromType == PopupChooseHeroHelper.FROM_TYPE8) {
            var [awakeStar, awakeLevel] = UserDataHelper.convertAwakeLevel(heroData.getAwaken_level())
            cellData.richTextDesc = [
                Lang.get("reborn_hero_list_rich_text1", { level: heroData.getLevel() }),
                Lang.get("reborn_hero_list_rich_text2", { awakeStar: awakeStar, awakeLevel: awakeLevel }),
            ]
        }
        else if (fromType == PopupChooseHeroHelper.FROM_TYPE6) {
            var heroConfig = heroData.getConfig()
            var fragNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, heroConfig.fragment_id)
            cellData.richTextDesc = [Lang.get("lang_territory_choose_hero_fragment", { num: fragNum })]
            cellData.textDesc = ""//不显示
        }

        else {
            cellData.textDesc = PopupChooseHeroHelper._getHeroDataYoKeDesc(heroData, fromType);
        }
        cellData = PopupChooseHeroHelper._PROC_BTN_DESC(cellData, fromType, index);
        return cellData;
    };
    private static _PROC_BTN_DESC(cellData, fromType, index) {
        cellData.btnIsHightLight = false;
        cellData.btnShowRP = false;
        if (fromType != PopupChooseHeroHelper.FROM_TYPE5) {
            cellData.btnDesc = Lang.get(BTN_DES[fromType]);
            if (fromType == PopupChooseHeroHelper.FROM_TYPE4 && index == 0) {
                cellData.btnDesc = Lang.get('hero_replace_btn_down');
                cellData.btnIsHightLight = true;
            }
            cellData.btnEnable = true;
        }
        if (fromType == PopupChooseHeroHelper.FROM_TYPE5) {
            var inPartolHeros = G_UserData.getTerritory().getHeroIds();
            var heroId = cellData.getBase_id();
            var inPartol = inPartolHeros[heroId] || false;
            cellData.btnDesc = Lang.get(BTN_DES[fromType]);
            cellData.btnEnable = !inPartol;
            if (G_UserData.getTeam().isInBattleWithBaseId(heroId)) {
                cellData.topImagePath = Path.getTextSignet('img_iconsign_shangzhen');
            }
            if (cellData.btnEnable == false) {
                cellData.topImagePath = Path.getTextSign('img_iconsign_patrol');
            }
        } else if (fromType == PopupChooseHeroHelper.FROM_TYPE6) {
            var heroId = cellData.getBase_id();
            cellData.topImagePath = UserDataHelper.getHeroTopImage(heroId)[0];
        }
        if (fromType == PopupChooseHeroHelper.FROM_TYPE2) {
            if (HeroDataHelper.isReachCheckBetterColorHeroRP(cellData) && PopupChooseHeroHelper._beReplacedPos) {
                var heroIdq = G_UserData.getTeam().getHeroIdWithPos(PopupChooseHeroHelper._beReplacedPos);
                var unitData = G_UserData.getHero().getUnitDataWithId(heroIdq);
                var reach = cellData.getConfig().color > unitData.getConfig().color;
                cellData.btnShowRP = reach;
            }
        }
        return cellData;
    };
    private static _FROM_TYPE1(param) {
        PopupChooseHeroHelper._beReplacedPos = null;
        var heroData = G_UserData.getHero().getReplaceDataBySort();
        return heroData;
    };
    private static _FROM_TYPE2(param) {
        PopupChooseHeroHelper._beReplacedPos = unpack(param)[0];
        var heroId = G_UserData.getTeam().getHeroIdWithPos(PopupChooseHeroHelper._beReplacedPos);
        var unitHeroData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroBaseId = unitHeroData.getBase_id();
        var heroData = G_UserData.getHero().getReplaceDataBySort(heroBaseId);
        return heroData;
    };
    private static _FROM_TYPE3(param) {
        PopupChooseHeroHelper._beReplacedPos = null;
        var heroData = G_UserData.getHero().getReplaceReinforcementsDataBySort();
        return heroData;
    };
    private static _FROM_TYPE4(param) {
        PopupChooseHeroHelper._beReplacedPos = unpack(param)[0];
        var heroId = G_UserData.getTeam().getHeroIdInReinforcementsWithPos(PopupChooseHeroHelper._beReplacedPos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var beReplacedId = heroUnitData.getBase_id();
        var heroData = G_UserData.getHero().getReplaceReinforcementsDataBySort(heroId, beReplacedId);
        return heroData;
    };
    private static _FROM_TYPE5(param) {
        PopupChooseHeroHelper._beReplacedPos = null;
        var heroData = G_UserData.getTerritory().getAllHeros();
        return heroData;
    };
    private static _FROM_TYPE10(param) {
        PopupChooseHeroHelper._beReplacedPos = null;
        var heroData = G_UserData.getTerritory().getAllHerosByOneKey();
        return heroData;
    };
    private static _FROM_TYPE6(param) {
        PopupChooseHeroHelper._beReplacedPos = null;
        var filterIds = UserDataHelper.getGuildRequestedFilterIds();
        var heroData = UserDataHelper.getGuildRequestHelpHeroList(filterIds);
        return heroData;
    };
    private static _FROM_TYPE7(param) {
        PopupChooseHeroHelper._beReplacedPos = null;
        var heroData = G_UserData.getHero().getRebornList();
        return heroData;
    };
    private static _FROM_TYPE8(param) {
        var [filterIds, tempData] = unpack(param);
        var heroData = HeroDataHelper.getHeroTransformTarList(filterIds, tempData);
        return heroData;
    };
    // private static _FROM_TYPE9(param) {
    //     PopupChooseHeroHelper._beReplacedPos = null;
    //     var [filterIds, tempData] = unpack(param);
    //     var heroData = HeroJinTrainDataHelper.getJinTrainMaterialList(filterIds, tempData);
    //     return heroData;
    // };
    public static checkIsEmpty(fromType, param?) {
        var func = PopupChooseHeroHelper['_FROM_TYPE' + fromType];
        if (func && typeof (func) == 'function') {
            var herosData = func(param);
            return herosData.length == 0;
        }
        return true;
    };
}