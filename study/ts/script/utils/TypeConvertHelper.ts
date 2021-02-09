import { TextHelper } from './TextHelper';
import { G_ConfigLoader, Colors, G_UserData } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { Path } from './Path';
import { Lang } from '../lang/Lang';
import { InstrumentDataHelper } from './data/InstrumentDataHelper';
export namespace TypeConvertHelper {
    export let TYPE_POWER = -1;
    export let TYPE_MINE_POWER = -2;
    export let TYPE_HERO = 1;
    export let TYPE_EQUIPMENT = 2;
    export let TYPE_TREASURE = 3;
    export let TYPE_INSTRUMENT = 4;
    export let TYPE_RESOURCE = 5;
    export let TYPE_ITEM = 6;
    export let TYPE_FRAGMENT = 7;
    export let TYPE_GEMSTONE = 8;
    export let TYPE_AVATAR = 9;
    export let TYPE_PET = 10;
    export let TYPE_SILKBAG = 11;
    export let TYPE_HORSE = 12;
    export let TYPE_HISTORY_HERO = 13;
    export let TYPE_HISTORY_HERO_WEAPON = 14;
    export let TYPE_HORSE_EQUIP = 15;
    export let TYPE_JADE_STONE = 16;
    export let TYPE_HEAD_FRAME = 17;
    export let TYPE_TITLE = 18;
    export let TYPE_FLAG = 19;// -- 军团旗帜
    export let TYPE_TACTICS = 25; // -- 战法
    export let CLASS_NAME = {}
    CLASS_NAME[TYPE_HERO] = 'CommonHeroIcon';
    CLASS_NAME[TYPE_EQUIPMENT] = 'CommonEquipIcon';
    CLASS_NAME[TYPE_TREASURE] = 'CommonTreasureIcon';
    CLASS_NAME[TYPE_INSTRUMENT] = 'CommonInstrumentIcon';
    CLASS_NAME[TYPE_RESOURCE] = 'CommonResourceIcon';
    CLASS_NAME[TYPE_ITEM] = 'CommonItemIcon';
    CLASS_NAME[TYPE_FRAGMENT] = 'CommonFragmentIcon';
    CLASS_NAME[TYPE_GEMSTONE] = 'CommonGemstoneIcon';
    CLASS_NAME[TYPE_AVATAR] = 'CommonAvatarIcon';
    CLASS_NAME[TYPE_PET] = 'CommonPetIcon';
    CLASS_NAME[TYPE_SILKBAG] = 'CommonSilkbagIcon';
    CLASS_NAME[TYPE_HORSE] = 'CommonHorseIcon';
    CLASS_NAME[TYPE_HISTORY_HERO] = 'CommonHistoryHeroIcon';
    CLASS_NAME[TYPE_HISTORY_HERO_WEAPON] = 'CommonHistoryWeaponIcon';
    CLASS_NAME[TYPE_HORSE_EQUIP] = 'CommonHorseEquipIcon';
    CLASS_NAME[TYPE_JADE_STONE] = 'CommonJadeIcon';
    CLASS_NAME[TYPE_HEAD_FRAME] = 'CommonHeadFrame';
    CLASS_NAME[TYPE_TITLE] = 'CommonTitle';
    CLASS_NAME[TypeConvertHelper.TYPE_FLAG] = "CommonFlagIcon"
    CLASS_NAME[TypeConvertHelper.TYPE_TACTICS] = "CommonTacticsIcon"

    export let getTypeClass = function (type) {
        var className = CLASS_NAME[type];
        return className;
    };
    export let convert = function (type, value, size?, rank?, limitLevel?, limitRedLevel?) {
        var params = {
            type: type,
            value: value,
            size: size,
            rank: rank,
            limitLevel: limitLevel,
            limitRedLevel: limitRedLevel
        };
        if (type == TypeConvertHelper.TYPE_POWER) {
            return TypeConvertHelper._conver_TYPE_POWER(params);
        } else if (type == TypeConvertHelper.TYPE_MINE_POWER) {
            return TypeConvertHelper._conver_TYPE_MINE_POWER(params);
        }
        if (params.type) {
            var _param = TypeConvertHelper.convertByParam(params);
            return _param;
        }
        return {};
    };

    export let convertByParam = function (param) {
        var typeManage = G_ConfigLoader.getConfig(ConfigNameConst.TYPE_MANAGE);
        var item = typeManage.get(param.type);
        if (!item) {
            console.error('Could not find the item with type: ' + param.type);
            return;
        }
        var itemConfig = item.table;
        var config = G_ConfigLoader.getConfig(itemConfig);
        var itemId = param.value;
        var rank = param.rank || 0;
        var info = null;
        info = config.get(itemId);
        if (!info) {
            cc.error('Could not find the ' + (itemConfig + (' config with id: ' + (itemId + ('  rank=' + rank)))));
            return;
        }
        var _temp = _buildConvertData(param, info);
        _temp.cfg = info;
        for (var k in param) {
            var v = param[k];
            _temp[k] = v;
        }
        return _temp;
    };
    export let _buildConvertData = function (params, configInfo) {
        for (var key in TypeConvertHelper) {
            var value = TypeConvertHelper[key];
            if (typeof (value) == 'number' && value == params.type) {
                var retfunc = TypeConvertHelper['_convert_' + key];
                if (typeof (retfunc) == 'function') {
                    return retfunc(params, configInfo);
                }
            }
        }
        return {};
    };
    export let _convert_TYPE_ITEM = function (params, info) {
        // console.log('_convert_TYPE_ITEM');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('item', info.res_id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/img_iconbg_bg0' + info.color);
        retTemp.res_mini = Path.getCommonIcon('itemmini', info.res_id);
        retTemp.name = info.name;
        retTemp.description = info.description;
        retTemp.color = info.color;
        return retTemp;
    };
    export let _convert_TYPE_HERO = function (params, info) {
        // console.log('_convert_TYPE_HERO');
        var color2ImageRes = {
            1: 'img_heroclass_green',
            2: 'img_heroclass_green',
            3: 'img_heroclass_blue',
            4: 'img_heroclass_purple',
            5: 'img_heroclass_orange',
            6: 'img_heroclass_red',
            7: 'img_heroclass_gold'
        };
        var country2ImageRes = {
            1: 'img_com_camp04',
            2: 'img_com_camp01',
            3: 'img_com_camp03',
            4: 'img_com_camp02'
        };
        var countryFlagImageRes = {
            1: 'bg_nation_01',
            2: 'bg_nation_02',
            3: 'bg_nation_03',
            4: 'bg_nation_04'
        };
        var resId = info.res_id;
        var heroColor = info.color;
        if (params.limitLevel) {
            if (params.limitLevel == 3) {
                resId = info.limit_res_id;
                heroColor = 6;
            }
        }
        if (params.limitRedLevel) {
            if (params.limitRedLevel == 4) {
                resId = info.limit_red_res_id;
                heroColor = 7;
            }
        }
        var heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(resId);
        console.assert(heroRes, 'Could not find the hero res info with id: ' + (resId));
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.official_name = '';
        retTemp.isSelf = false;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('hero', heroRes.icon);
        retTemp.bustIcon = Path.getHeroBustIcon(heroRes.icon);
        retTemp.bodyIcon = Path.getHeroBodyIcon(heroRes.icon)
        retTemp.res_mini = Path.getCommonIcon('heromini', resId);
        retTemp.isGold = false;
        if (info.type == 1) {
            var ret: any[] = G_UserData.getBase().getOfficialInfo();
            var officialInfo = ret[0];
            var officialLevel = ret[1];
            if (officialLevel > 0) {
                retTemp.name = G_UserData.getBase().getName();
                retTemp.official_name = officialInfo.name;
            } else {
                retTemp.name = G_UserData.getBase().getName();
            }
            retTemp.isSelf = true;
            retTemp.icon_color = Colors.getOfficialColor(officialLevel);
            retTemp.icon_color_outline = Colors.getOfficialColorOutline(officialLevel);
            retTemp.icon_color_outline_show = Colors.isOfficialColorOutlineShow(officialLevel);
            retTemp.main_icon = Path.getPlayerIcon(heroRes.icon);
        } else {
            retTemp.name = info.name;
            retTemp.icon_color = Colors.getColor(heroColor);
            retTemp.icon_color_outline = Colors.getColorOutline(heroColor);
            retTemp.icon_color_outline_show = Colors.isColorOutlineShow(heroColor);
            retTemp.main_icon = Path.getCommonIcon('avatar', heroRes.icon);
            if (info.color == 7) {
                retTemp.isGold = true;
            }
        }
        var rankLevel = params.rank || 0;
        if (rankLevel && rankLevel > 0) {
            if (info.color == 7 && info.type != 1) {
                retTemp.name = retTemp.name + (' ' + (Lang.get('goldenhero_train_text') + rankLevel));
            } else {
                retTemp.name = retTemp.name + ('+' + rankLevel);
            }
        }
        retTemp.color = heroColor;
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + heroColor);
        retTemp.bustIconBg = Path.getHeroBustIconBg('img_drawing_frame_0' + heroColor);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + heroColor);
        retTemp.res_cfg = heroRes;
        retTemp.hero_type = info.type;
        retTemp.country = info.country;
        retTemp.color_text = Path.getTextHero(color2ImageRes[heroColor]);
        retTemp.description = info.description;
        if (country2ImageRes[info.country] == null) {
            retTemp.country_text = null;
        } else {
            retTemp.country_text = Path.getTextSignet(country2ImageRes[info.country]);
        }
        if (countryFlagImageRes[info.country] == null) {
            retTemp.country_flag_img = null;
        } else {
            retTemp.country_flag_img = Path.getBackground(countryFlagImageRes[info.country]);
        }
        retTemp.fragment_id = info.fragment_id;
        return retTemp;
    };
    export let _convert_TYPE_PET = function (params, info) {
        // console.log('_convert_TYPE_PET');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        var heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(info.res_id);
        console.assert(heroRes, 'Could not find the hero res info with id: ' + (info.res_id));
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('hero', heroRes.icon);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.name = info.name;
        retTemp.description = info.description;
        retTemp.main_icon = Path.getCommonIcon('avatar', heroRes.icon);
        retTemp.res_cfg = heroRes;
        return retTemp;
    };
    export let _convert_TYPE_EQUIPMENT = function (params, info) {
        //     console.log('_convert_TYPE_EQUIPMENT');
        var color2ImageRes = {
            1: 'img_quipmentclass_white',
            2: 'img_quipmentclass_green',
            3: 'img_quipmentclass_blue',
            4: 'img_quipmentclass_purple',
            5: 'img_quipmentclass_orange',
            6: 'img_quipmentclass_red',
            7: 'img_quipmentclass_golden'
        };
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('equip', info.res_id);
        retTemp.icon_big = Path.getCommonIcon('equipbig', info.res_id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.name = info.name;
        retTemp.potential = info.potential;
        retTemp.color_text = Path.getTextEquipment(color2ImageRes[info.color]);
        retTemp.fragment_id = info.fragment_id;
        return retTemp;
    };
    export let _convert_TYPE_TREASURE = function (params, info) {
        // console.log('_convert_TYPE_TREASURE');
        var color2ImageRes = {
            1: 'img_quipmentclass_white',
            2: 'img_quipmentclass_green',
            3: 'img_quipmentclass_blue',
            4: 'img_quipmentclass_purple',
            5: 'img_quipmentclass_orange',
            6: 'img_quipmentclass_red',
            7: 'img_quipmentclass_red'
        };
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('treasure', info.res_id);
        retTemp.icon_big = Path.getCommonIcon('treasurebig', info.res_id);
        retTemp.res_mini = Path.getCommonIcon('treasuremini', info.res_id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.name = info.name;
        retTemp.potential = info.potential;
        retTemp.color_text = Path.getTextEquipment(color2ImageRes[info.color]);
        retTemp.fragment_id = info.fragment;
        return retTemp;
    };

    export let _convert_TYPE_INSTRUMENT = function (params, info) {
        //console.log('_convert_TYPE_INSTRUMENT');
        var instrumentColor = info.color;
        var bigRes = info.res;
        var res = info.res;
        var miniRes = info.res;
        if (params.limitLevel && params.limitLevel > 0) {
            var templateId = info.instrument_rank_1;
            var configInfo = InstrumentDataHelper.getInstrumentRankConfig(templateId, params.limitLevel);
            instrumentColor = configInfo.cost_size;
            if (instrumentColor == 6) {
                bigRes = info.instrument_rank_icon;
                res = info.instrument_rank_icon;
            } else if (instrumentColor == 7) {
                bigRes = info.instrument_rank_icon_2;
                res = info.instrument_rank_icon_2;
            }
        }
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('instrument', res);
        retTemp.icon_big = Path.getCommonIcon('instrumentbig', bigRes);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + instrumentColor);
        retTemp.icon_bg2 = Path.getUICommonFrame('img_frame_shenbing_0' + instrumentColor);
        retTemp.res_mini = Path.getCommonIcon('instrumentmini', info.id);
        retTemp.color = instrumentColor;
        retTemp.icon_color = Colors.getColor(instrumentColor);
        retTemp.icon_color_outline = Colors.getColorOutline(instrumentColor);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(instrumentColor);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + instrumentColor);
        retTemp.name = info.name;
        retTemp.instrument_description = info.instrument_description;
        retTemp.description = info.description;
        retTemp.hero = info.hero;
        retTemp.unlock = info.unlock;
        retTemp.fragment_id = info.fragment_id;
        retTemp.isGold = info.color == 7;
        return retTemp;
    };
    export let _convert_TYPE_GEMSTONE = function (params, info) {
        console.log('_convert_TYPE_GEMSTONE');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('gemstone', info.res_id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.icon_bg2 = Path.getUICommonFrame('img_frame_gemstone_0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.name = info.name;
        retTemp.description = info.description;
        retTemp.fragment_id = info.fragment_id;
        return retTemp;
    };
    export let _convert_TYPE_AVATAR = function (params, info) {
        //console.log('_convert_TYPE_AVATAR');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('avatar', info.icon);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.name = info.name;
        retTemp.list_name = info.list_name;
        retTemp.description = info.description;
        return retTemp;
    };
    export let _convert_TYPE_SILKBAG = function (params, info) {
        // console.log('_convert_TYPE_SILKBAG');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('silkbag', info.icon);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.icon_mid_bg = Path.getUICommonFrame('img_frame_0' + (info.color + 'b'));
        retTemp.icon_mid_bg2 = Path.getUICommonFrame('img_silkbag0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.name = info.name;
        retTemp.profile = info.profile;
        retTemp.description = info.description;
        retTemp.isGold = info.color == 7;
        return retTemp;
    };
    export let _convert_TYPE_HORSE = function (params, info) {
        // console.log('_convert_TYPE_HORSE');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('horse', info.res_id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.name = info.name;
        retTemp.description = info.description;
        return retTemp;
    };
    export let _convert_TYPE_HISTORY_HERO = function (params, info) {
        console.log('_convert_TYPE_HISTORY_HERO');
        var heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(info.res_id);
        console.assert(heroRes, 'Could not find the hero res info with id: ' + (info.res_id));
        var color2ImageRes = {
            1: 'img_quipmentclass_white',
            2: 'img_quipmentclass_green',
            3: 'img_quipmentclass_blue',
            4: 'img_quipmentclass_purple',
            5: 'img_quipmentclass_orange',
            6: 'img_quipmentclass_red'
        };
        var retTemp: any = {};
        var heroColor = info.color;
        retTemp.color = heroColor;
        retTemp.hero_type = info.type;
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('historicalhero', info.id);
        retTemp.icon_round = Path.getCommonIcon('historicalhero', info.id + '_2');
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + heroColor);
        retTemp.icon_bg_round = Path.getHistoryHeroImg('img_historical_hero_fram0' + heroColor);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + heroColor);
        retTemp.icon_equip_frame_round = Path.getHistoryHeroImg('img_historical_hero_frame_equip0' + heroColor);
        retTemp.icon_equip_frame = Path.getHistoryHeroImg('img_historical_hero_equip_fram0' + heroColor);
        retTemp.icon_equip = Path.getHistoryHeroImg('img_historical_hero_frame_equip_icon0' + heroColor);
        retTemp.color_text = Path.getTextHero(color2ImageRes[heroColor]);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.name = info.name;
        retTemp.description = info.description;
        retTemp.main_icon = Path.getCommonIcon('avatar', heroRes.icon);
        retTemp.res_cfg = heroRes;
        return retTemp;
    };
    export let _convert_TYPE_HISTORY_HERO_WEAPON = function (params, info) {
        console.log('_convert_TYPE_HISTORY_HERO_WEAPON');
        var color2ImageRes = {
            1: 'img_quipmentclass_white',
            2: 'img_quipmentclass_green',
            3: 'img_quipmentclass_blue',
            4: 'img_quipmentclass_purple',
            5: 'img_quipmentclass_orange',
            6: 'img_quipmentclass_red'
        };
        var retTemp: any = {};
        var heroColor = info.color;
        retTemp.color = heroColor;
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getHistoryHeroWeaponImg(info.id);
        retTemp.icon_big = Path.getHistoryHeroWeaponBigImg(info.id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + heroColor);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + heroColor);
        retTemp.color_text = Path.getTextHero(color2ImageRes[heroColor]);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.name = info.name;
        return retTemp;
    };
    export let _convert_TYPE_HORSE_EQUIP = function (params, info) {
        // console.log('_convert_TYPE_HORSE_EQUIP');
        var color2ImageRes = {
            1: 'img_quipmentclass_white',
            2: 'img_quipmentclass_green',
            3: 'img_quipmentclass_blue',
            4: 'img_quipmentclass_purple',
            5: 'img_quipmentclass_orange',
            6: 'img_quipmentclass_red',
            7: 'img_quipmentclass_golden'
        };
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('horseequip', info.res_id);
        retTemp.icon_big = Path.getCommonIcon('horseequipbig', info.res_id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.name = info.name;
        retTemp.color_text = Path.getTextEquipment(color2ImageRes[info.color]);
        retTemp.fragment_id = info.fragment_id;
        retTemp.effect_1 = Lang.get('horse_equip_effect_' + info.attribute_type_1);
        retTemp.effect_2 = info.attribute_value_1;
        return retTemp;
    };
    export let _conver_TYPE_POWER = function (params) {
        // console.log('_conver_TYPE_POWER');
        var retTemp: any = {};
        retTemp.res_mini = Path.getUICommon('img_zhanli_01');
        if (params.size) {
            retTemp.size_text = TextHelper.getAmountText(params.size);
            retTemp.size = params.size;
        }
        return retTemp;
    };
    export let _conver_TYPE_MINE_POWER = function (params) {
        var retTemp: any = {};
        retTemp.res_mini = Path.getCommonIcon('resourcemini', 'bingli');
        params.size = G_UserData.getMineCraftData().getMyArmyValue();
        if (params.size) {
            retTemp.size_text = TextHelper.getAmountText(params.size);
            retTemp.size = params.size;
        }
        return retTemp;
    };
    export let _convert_TYPE_RESOURCE = function (params, info) {
        // console.log('_convert_TYPE_RESOURCE');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('resource', info.res_id);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.res_mini = Path.getCommonIcon('resourcemini', info.res_id);
        retTemp.color = info.color
        if (params.size) {
            retTemp.size_text = TextHelper.getAmountText(params.size);
            retTemp.size = params.size;
        }
        retTemp.name = info.name;
        return retTemp;
    };
    export let _convert_TYPE_FRAGMENT = function (params, info) {
        //console.log('_convert_TYPE_FRAGMENT');
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        if (info.comp_type == 1) {
            var hero = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(info.comp_value);
            console.assert(hero, 'Could not find the hero info with id : ' + (info.comp_value));
            var heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(hero.res_id);
            console.assert(heroRes, 'Could not find the hero res info with id : ' + (hero.res_id));
            retTemp.icon = Path.getCommonIcon('hero', heroRes.icon);
        } else if (info.comp_type == 2) {
            var equipmentRes = G_ConfigLoader.getConfig(ConfigNameConst.EQUIPMENT).get(info.comp_value);
            console.assert(equipmentRes, 'Could not find the equipment res info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('equip', equipmentRes.res_id);
        } else if (info.comp_type == 3) {
            var treasureRes = G_ConfigLoader.getConfig(ConfigNameConst.TREASURE).get(info.comp_value);
            console.assert(treasureRes, 'Could not find the treasure res info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('treasure', treasureRes.res_id);
        } else if (info.comp_type == 4) {
            var instrumentRes = G_ConfigLoader.getConfig(ConfigNameConst.INSTRUMENT).get(info.comp_value);
            console.assert(instrumentRes, 'Could not find the instrument res info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('instrument', instrumentRes.res);
        } else if (info.comp_type == 6) {
            var itemRes = G_ConfigLoader.getConfig(ConfigNameConst.ITEM).get(info.comp_value);
            console.assert(itemRes, 'Could not find the item res info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('item', itemRes.res_id);
        } else if (info.comp_type == 8) {
            var gemstoneRes = G_ConfigLoader.getConfig(ConfigNameConst.GEMSTONE).get(info.comp_value);
            console.assert(gemstoneRes, 'Could not find the gemstone res info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('gemstone', gemstoneRes.res_id);
        } else if (info.comp_type == 10) {
            var petCfg = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(info.comp_value);
            console.assert(petCfg, 'Could not find the petCfg info with id : ' + (info.comp_value));
            var heroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(petCfg.res_id);
            console.assert(heroRes, 'Could not find the hero res info with id : ' + (petCfg.res_id));
            retTemp.icon = Path.getCommonIcon('hero', heroRes.icon);
        } else if (info.comp_type == 12) {
            var horseCfg = G_ConfigLoader.getConfig(ConfigNameConst.HORSE).get(info.comp_value);
            console.assert(horseCfg, 'Could not find the horseCfg info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('horse', horseCfg.res_id);
        } else if (info.comp_type == 13) {
            var historicalHeroCfg = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO).get(info.comp_value);
            console.assert(historicalHeroCfg, 'Could not find the historical_hero info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('historicalhero', historicalHeroCfg.id);
        } else if (info.comp_type == 14) {
            var historicalWeaponCfg = G_ConfigLoader.getConfig(ConfigNameConst.HISTORICAL_HERO_EQUIPMENT).get(info.comp_value);
            console.assert(historicalWeaponCfg, 'Could not find the historical_hero_equipment info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('historicalweapon', historicalWeaponCfg.res_id);
        } else if (info.comp_type == 15) {
            var equipmentRes = G_ConfigLoader.getConfig(ConfigNameConst.HORSE_EQUIPMENT).get(info.comp_value);
            console.assert(equipmentRes, 'Could not find the horse_equipment res info with id : ' + (info.comp_value));
            retTemp.icon = Path.getCommonIcon('horseequip', equipmentRes.res_id);
        }
        retTemp.name = info.name;
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.item_level_bg = Path.getUICommon('frame/icon_frame_bg0' + info.color);
        retTemp.fragment_id = info.id;
        retTemp.description = info.description;
        return retTemp;
    };
    export let _convert_TYPE_JADE_STONE = function (params, info) {
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('jade', info.icon);
        retTemp.icon_bg = Path.getUICommonFrame('img_frame_0' + info.color);
        retTemp.icon_big = Path.getCommonIcon('jadebig', info.icon);
        retTemp.color = info.color;
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color);
        retTemp.name = info.name;
        retTemp.description = info.description;
        retTemp.potential = info.color;
        return retTemp;
    };
    export let _convert_TYPE_HEAD_FRAME = function (params, info) {
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        retTemp.frame = Path.getFrameIcon(info.resource);
        retTemp.color = info.color
        retTemp.icon_color = Colors.getColor(info.color);
        retTemp.icon_color_outline = Colors.getColorOutline(info.color);
        retTemp.name = info.name;
        retTemp.limit_level = info.limit_level;
        retTemp.day = info.day;
        retTemp.resource = info.resource;
        retTemp.time_type = info.time_type;
        retTemp.des = info.des;
        retTemp.moving = info.moving;
        return retTemp;
    };
    export let _convert_TYPE_TITLE = function (params, info) {
        var retTemp: any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = getTypeClass(params.type);
        var color = parseFloat(info.colour);
        retTemp.icon_color = Colors.getColor(color);
        retTemp.icon_color_outline = Colors.getColorOutline(color);
        retTemp.name = info.name;
        retTemp.day = info.day;
        retTemp.time_type = info.time_type;
        retTemp.des = info.des;
        retTemp.moving = info.moving;
        return retTemp;
    };
    export let _convert_TYPE_FLAG = function (params, info) {
        var retTemp:any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = TypeConvertHelper.getTypeClass(params.type);
        retTemp.icon = Path.getGuildRes(info.origin_res);
        var color = parseInt(info.color);
        retTemp.icon_color = Colors.getColor(color);
        retTemp.icon_color_outline = Colors.getColorOutline(color);
        retTemp.name = info.name;
        retTemp.view_time = info.view_time;
        retTemp.time_value = info.time_value;
        retTemp.description = info.description;
        retTemp.square_res = info.square_res;
        retTemp.long_res = info.long_res;
        return retTemp;
    };
    export let _convert_TYPE_TACTICS = function (params, info) {
        var retTemp:any = {};
        retTemp.item_type = params.type;
        retTemp.item_control = TypeConvertHelper.getTypeClass(params.type);
        retTemp.icon = Path.getCommonIcon('tactics', info.icon);
        retTemp.icon_bg = Path.getUICommonFrame('img_tactis_kuang0' + (info.color - 4 + 'b'));
        var color = parseInt(info.color);
        retTemp.icon_color = Colors.getColor(color);
        retTemp.icon_color_outline = Colors.getColorOutline(color);
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(color);
        retTemp.name = info.name;
        retTemp.description = info.description;
        return retTemp;
    }

};
