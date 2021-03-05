-- TypeConvertHelper

--[[
    类型转换器
    目的是为了根据策划的配置表
    转换通用的所有type，value 类型的数据字段映射至实际显示需要的字段
    主要用于Icon类型的转化
]]
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = {}

local typeManage = require("app.config.type_manage")

TypeConvertHelper.TYPE_POWER = -1 -- 战力
TypeConvertHelper.TYPE_MINE_POWER = -2 -- 矿战兵力
TypeConvertHelper.TYPE_HERO = 1 -- 武将
TypeConvertHelper.TYPE_EQUIPMENT = 2 -- 装备
TypeConvertHelper.TYPE_TREASURE = 3 -- 宝物
TypeConvertHelper.TYPE_INSTRUMENT = 4 -- 神兵
TypeConvertHelper.TYPE_RESOURCE = 5 -- 资源
TypeConvertHelper.TYPE_ITEM = 6 -- 道具
TypeConvertHelper.TYPE_FRAGMENT = 7 -- 碎片
TypeConvertHelper.TYPE_GEMSTONE = 8 -- 宝石道具 用于觉醒
TypeConvertHelper.TYPE_AVATAR = 9 -- 变身卡
TypeConvertHelper.TYPE_PET = 10 -- 神兽
TypeConvertHelper.TYPE_SILKBAG = 11 -- 锦囊
TypeConvertHelper.TYPE_HORSE = 12 -- 战马
TypeConvertHelper.TYPE_HISTORY_HERO = 13 -- 历代名将
TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON = 14 -- 历代名将武器
TypeConvertHelper.TYPE_HORSE_EQUIP = 15 -- 战马装备
TypeConvertHelper.TYPE_JADE_STONE = 16 -- 玉石
TypeConvertHelper.TYPE_HEAD_FRAME = 17 -- 头像框
TypeConvertHelper.TYPE_TITLE = 18 -- 称号
TypeConvertHelper.TYPE_FLAG = 19 -- 军团旗帜
TypeConvertHelper.TYPE_TACTICS = 25 -- 战法

--控件类名映射, 方便动态创建icon使用
TypeConvertHelper.CLASS_NAME = {}
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_HERO] = "CommonHeroIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_EQUIPMENT] = "CommonEquipIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_TREASURE] = "CommonTreasureIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_INSTRUMENT] = "CommonInstrumentIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_RESOURCE] = "CommonResourceIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_ITEM] = "CommonItemIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_FRAGMENT] = "CommonFragmentIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_GEMSTONE] = "CommonGemstoneIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_AVATAR] = "CommonAvatarIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_PET] = "CommonPetIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_SILKBAG] = "CommonSilkbagIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_HORSE] = "CommonHorseIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_HISTORY_HERO] = "CommonHistoryHeroIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON] = "CommonHistoryWeaponIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_HORSE_EQUIP] = "CommonHorseEquipIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_JADE_STONE] = "CommonJadeIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_HEAD_FRAME] = "CommonHeadFrame"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_TITLE] = "CommonTitle"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_FLAG] = "CommonFlagIcon"
TypeConvertHelper.CLASS_NAME[TypeConvertHelper.TYPE_TACTICS] = "CommonTacticsIcon"

function TypeConvertHelper.getTypeClass(type)
    local className = TypeConvertHelper.CLASS_NAME[type]

    -- assert(className,"Icon class can't finded : "..tostring(type) )

    -- assert(cc.isRegister(className), "Icon class is not register : "..className)

    return className
end

--[[
    转换通用类型
    通用类型是指协商过的一组资源类型数据
    根据type, value
    返回整合的数据
]]
function TypeConvertHelper.convert(type, value, size, rank, limitLevel, limitRedLevel)
    -- 类型转换
    local params = {
        type = type,
        value = value,
        size = size,
        rank = rank,
        limitLevel = limitLevel,
        limitRedLevel = limitRedLevel
    }
    --战力状况比较特殊，直接处理返回
    if type == TypeConvertHelper.TYPE_POWER then
        return TypeConvertHelper._conver_TYPE_POWER(params)
    elseif type == TypeConvertHelper.TYPE_MINE_POWER then
        return TypeConvertHelper._conver_TYPE_MINE_POWER(params)
    end
    -- 单个类型的
    if params.type then
        local _param = TypeConvertHelper.convertByParam(params)
        -- assert(table.nums(_param) > 0, "Invalid param with (type: "..tostring(params.type)..", value: "..tostring(params.value)..", size: "..tostring(params.size)..")")
        return _param
    end
    return {}
end

function TypeConvertHelper.convertByParam(param)
    local item = typeManage.get(param.type)
    assert(item, "Could not find the item with type: " .. tostring(param.type))
    local itemConfig = item.table -- 配置表的名称
    local config = require("app.config." .. itemConfig)
    local itemId = param.value
    local rank = param.rank or 0
    local info = nil
    info = config.get(itemId)

    assert(info, "Could not find the " .. itemConfig .. " config with id: " .. tostring(itemId) .. "  rank=" .. rank)

    local _temp = TypeConvertHelper._buildConvertData(param, info)
    -- 可以通过cfg来访问数据表中的数据
    _temp.cfg = info
    -- 更新自定义数据
    for k, v in pairs(param) do
        _temp[k] = v
    end

    return _temp
end

function TypeConvertHelper._buildConvertData(params, configInfo)
    for key, value in pairs(TypeConvertHelper) do
        if type(value) == "number" and value == params.type then
            local retfunc = TypeConvertHelper["_convert_" .. key]
            if type(retfunc) == "function" then
                return retfunc(params, configInfo)
            end
        end
    end
    return {}
end

--返回道具类型
function TypeConvertHelper._convert_TYPE_ITEM(params, info)
    logDebug("_convert_TYPE_ITEM")
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("item", info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/img_iconbg_bg0" .. info.color)
    retTemp.res_mini = Path.getCommonIcon("itemmini", info.res_id)
    retTemp.name = info.name
    retTemp.description = info.description
    retTemp.color = info.color
    return retTemp
end

--返回英雄类型
function TypeConvertHelper._convert_TYPE_HERO(params, info)
    logDebug("_convert_TYPE_HERO")

    local color2ImageRes = {
        [1] = "img_heroclass_green",
        [2] = "img_heroclass_green",
        [3] = "img_heroclass_blue",
        [4] = "img_heroclass_purple",
        [5] = "img_heroclass_orange",
        [6] = "img_heroclass_red",
        [7] = "img_heroclass_gold"
    }

    local country2ImageRes = {
        [1] = "img_com_camp04",
        [2] = "img_com_camp01",
        [3] = "img_com_camp03",
        [4] = "img_com_camp02"
    }

    local countryFlagImageRes = {
        [1] = "bg_nation_01",
        [2] = "bg_nation_02",
        [3] = "bg_nation_03",
        [4] = "bg_nation_04"
    }

    local resId = info.res_id
    local heroColor = info.color
    if params.limitLevel then
        if params.limitLevel==3  then
            resId = info.limit_res_id   --界限突破后的形象
            heroColor = 6               --如果是橙色武将，且界限突破后，变红色
        end
    end
    if params.limitRedLevel then
        if params.limitRedLevel==4 then
            resId = info.limit_red_res_id
            heroColor = 7
        end
    end

    local heroRes = require("app.config.hero_res").get(resId)
    assert(heroRes, "Could not find the hero res info with id: " .. tostring(resId))

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.official_name = "" -- 默认为空
    retTemp.isSelf = false
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("hero", heroRes.icon)
    retTemp.bustIcon = Path.getHeroBustIcon(heroRes.icon)
	retTemp.bodyIcon = Path.getHeroBodyIcon(heroRes.icon)
    retTemp.res_mini = Path.getCommonIcon("heromini", resId)
    retTemp.isGold = false
    
    if info.type == 1 then --主角
        local officialInfo, officialLevel = G_UserData:getBase():getOfficialInfo()
        if officialLevel > 0 then
            retTemp.name = G_UserData:getBase():getName()
            retTemp.official_name = officialInfo.name
        else
            retTemp.name = G_UserData:getBase():getName()
        end

        retTemp.isSelf = true
        -- retTemp.color = Colors.getOfficialColor(officialLevel)
        retTemp.icon_color = Colors.getOfficialColor(officialLevel)
        retTemp.icon_color_outline = Colors.getOfficialColorOutline(officialLevel)
        retTemp.icon_color_outline_show = Colors.isOfficialColorOutlineShow(officialLevel)
        retTemp.main_icon = Path.getPlayerIcon(heroRes.icon)
    else
        retTemp.name = info.name

        retTemp.icon_color = Colors.getColor(heroColor)
        retTemp.icon_color_outline = Colors.getColorOutline(heroColor)
        retTemp.icon_color_outline_show = Colors.isColorOutlineShow(heroColor)
        retTemp.main_icon = Path.getCommonIcon("avatar", heroRes.icon)
        if info.color == 7 then -- 金将
            retTemp.isGold = true
        end
    end

    local rankLevel = params.rank or 0
    if rankLevel and rankLevel > 0 then
        if info.color == 7 and info.type ~= 1 then -- 金将
            retTemp.name = retTemp.name .. " " .. Lang.get("goldenhero_train_text") .. rankLevel
        else
            retTemp.name = retTemp.name .. "+" .. rankLevel
        end
    end
    
    retTemp.color = heroColor
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. heroColor)
    retTemp.bustIconBg = Path.getHeroBustIconBg("img_drawing_frame_0" .. heroColor)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. heroColor)
    retTemp.res_cfg = heroRes
    retTemp.hero_type = info.type
    retTemp.country = info.country

    retTemp.color_text = Path.getTextHero(color2ImageRes[heroColor])
    retTemp.description = info.description

    if country2ImageRes[info.country] == nil then
        retTemp.country_text = nil
    else
        retTemp.country_text = Path.getTextSignet(country2ImageRes[info.country])
    end
    if countryFlagImageRes[info.country] == nil then
        retTemp.country_flag_img = nil
    else
        retTemp.country_flag_img = Path.getBackground(countryFlagImageRes[info.country])
    end
    retTemp.fragment_id = info.fragment_id
    return retTemp
end

--返回神兽类型
function TypeConvertHelper._convert_TYPE_PET(params, info)
    logDebug("_convert_TYPE_PET")

    local retTemp = {}
    retTemp.item_type = params.type

    local heroRes = require("app.config.hero_res").get(info.res_id)
    assert(heroRes, "Could not find the hero res info with id: " .. tostring(info.res_id))

    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("hero", heroRes.icon)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.name = info.name
    retTemp.description = info.description
    retTemp.main_icon = Path.getCommonIcon("avatar", heroRes.icon)
    retTemp.res_cfg = heroRes

    return retTemp
end

--返回装备类型
function TypeConvertHelper._convert_TYPE_EQUIPMENT(params, info)
    logDebug("_convert_TYPE_EQUIPMENT")
    local color2ImageRes = {
        [1] = "img_quipmentclass_white",
        [2] = "img_quipmentclass_green",
        [3] = "img_quipmentclass_blue",
        [4] = "img_quipmentclass_purple",
        [5] = "img_quipmentclass_orange",
        [6] = "img_quipmentclass_red",
        [7] = "img_quipmentclass_golden"
    }

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("equip", info.res_id)
    retTemp.icon_big = Path.getCommonIcon("equipbig", info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.name = info.name
    retTemp.potential = info.potential
    retTemp.color_text = Path.getTextEquipment(color2ImageRes[info.color])
    retTemp.fragment_id = info.fragment_id
    return retTemp
end

--返回宝物类型
function TypeConvertHelper._convert_TYPE_TREASURE(params, info)
    logDebug("_convert_TYPE_TREASURE")
    local color2ImageRes = {
        [1] = "img_quipmentclass_white",
        [2] = "img_quipmentclass_green",
        [3] = "img_quipmentclass_blue",
        [4] = "img_quipmentclass_purple",
        [5] = "img_quipmentclass_orange",
        [6] = "img_quipmentclass_red",
        [7] = "img_quipmentclass_red"
    }

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("treasure", info.res_id)
    retTemp.icon_big = Path.getCommonIcon("treasurebig", info.res_id)
    retTemp.res_mini = Path.getCommonIcon("treasuremini", info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.name = info.name
    retTemp.potential = info.potential
    retTemp.color_text = Path.getTextEquipment(color2ImageRes[info.color])
    retTemp.fragment_id = info.fragment

    return retTemp
end

--返回神兵类型
function TypeConvertHelper._convert_TYPE_INSTRUMENT(params, info)
    logDebug("_convert_TYPE_INSTRUMENT")

    local instrumentColor = info.color
    local bigRes = info.res
    local res = info.res
    local miniRes = info.res
    if params.limitLevel and params.limitLevel > 0 then
        local templateId = info.instrument_rank_1
        local configInfo =
            require("app.utils.data.InstrumentDataHelper").getInstrumentRankConfig(templateId, params.limitLevel)
        instrumentColor = configInfo.cost_size
        if instrumentColor == 6 then
            bigRes = info.instrument_rank_icon
            res = info.instrument_rank_icon
        elseif instrumentColor == 7 then
            bigRes = info.instrument_rank_icon_2
            res = info.instrument_rank_icon_2
        end
    end

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("instrument", res)
    retTemp.icon_big = Path.getCommonIcon("instrumentbig", bigRes)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. instrumentColor)
    retTemp.icon_bg2 = Path.getUICommonFrame("img_frame_shenbing_0" .. instrumentColor)
    retTemp.res_mini = Path.getCommonIcon("instrumentmini", info.id)
    retTemp.color = instrumentColor
    retTemp.icon_color = Colors.getColor(instrumentColor)
    retTemp.icon_color_outline = Colors.getColorOutline(instrumentColor)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(instrumentColor)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. instrumentColor)
    retTemp.name = info.name
    retTemp.instrument_description = info.instrument_description
    retTemp.description = info.description
    retTemp.hero = info.hero
    retTemp.unlock = info.unlock
    retTemp.fragment_id = info.fragment_id
    retTemp.isGold = info.color == 7
    return retTemp
end

--返回觉醒道具类型
function TypeConvertHelper._convert_TYPE_GEMSTONE(params, info)
    logDebug("_convert_TYPE_GEMSTONE")

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("gemstone", info.res_id)
    --retTemp.icon_big = Path.getCommonIcon("gemstonebig", info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.icon_bg2 = Path.getUICommonFrame("img_frame_gemstone_0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.name = info.name
    retTemp.description = info.description
    retTemp.fragment_id = info.fragment_id

    return retTemp
end

--返回变身卡类型
function TypeConvertHelper._convert_TYPE_AVATAR(params, info)
    logDebug("_convert_TYPE_AVATAR")

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("avatar", info.icon)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.name = info.name
    retTemp.list_name = info.list_name
    retTemp.description = info.description

    return retTemp
end

--返回锦囊类型
function TypeConvertHelper._convert_TYPE_SILKBAG(params, info)
    logDebug("_convert_TYPE_SILKBAG")

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("silkbag", info.icon)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.icon_mid_bg = Path.getUICommonFrame("img_frame_0" .. info.color .. "b")
    retTemp.icon_mid_bg2 = Path.getUICommonFrame("img_silkbag0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.name = info.name
    retTemp.profile = info.profile
    retTemp.description = info.description
    retTemp.isGold = info.color == 7

    return retTemp
end

--返回战马类型
function TypeConvertHelper._convert_TYPE_HORSE(params, info)
    logDebug("_convert_TYPE_HORSE")

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("horse", info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.name = info.name
    retTemp.description = info.description

    return retTemp
end

--返回历代名将类型
function TypeConvertHelper._convert_TYPE_HISTORY_HERO(params, info)
    logDebug("_convert_TYPE_HISTORY_HERO")
    local heroRes = require("app.config.hero_res").get(info.res_id)
    assert(heroRes, "Could not find the hero res info with id: " .. tostring(info.res_id))

    local color2ImageRes = {
        [1] = "img_quipmentclass_white",
        [2] = "img_quipmentclass_green",
        [3] = "img_quipmentclass_blue",
        [4] = "img_quipmentclass_purple",
        [5] = "img_quipmentclass_orange",
        [6] = "img_quipmentclass_red"
    }

    local retTemp = {}
    local heroColor = info.color
    retTemp.color = heroColor
    retTemp.hero_type = info.type
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("historicalhero", info.id)
    retTemp.icon_round = Path.getCommonIcon("historicalhero", info.id.."_2")
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. heroColor)
    retTemp.icon_bg_round = Path.getHistoryHeroImg("img_historical_hero_fram0" .. heroColor)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. heroColor)
    retTemp.icon_equip_frame_round = Path.getHistoryHeroImg("img_historical_hero_frame_equip0" .. heroColor)
    retTemp.icon_equip_frame = Path.getHistoryHeroImg("img_historical_hero_equip_fram0" .. heroColor)
    retTemp.icon_equip = Path.getHistoryHeroImg("img_historical_hero_frame_equip_icon0" .. heroColor)
    retTemp.color_text = Path.getTextHero(color2ImageRes[heroColor])
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.name = info.name
    retTemp.description = info.description
    retTemp.main_icon = Path.getCommonIcon("avatar", heroRes.icon)
    retTemp.res_cfg = heroRes

    return retTemp
end

--返回历代名将武器类型
function TypeConvertHelper._convert_TYPE_HISTORY_HERO_WEAPON(params, info)
    logDebug("_convert_TYPE_HISTORY_HERO_WEAPON")
    --local heroRes = require("app.config.historical_hero_equipment").get(info.res_id)
    --assert(heroRes, "Could not find the hero res info with id: "..tostring(info.res_id))

    local color2ImageRes = {
        [1] = "img_quipmentclass_white",
        [2] = "img_quipmentclass_green",
        [3] = "img_quipmentclass_blue",
        [4] = "img_quipmentclass_purple",
        [5] = "img_quipmentclass_orange",
        [6] = "img_quipmentclass_red"
    }

    local retTemp = {}
    local heroColor = info.color
    retTemp.color = heroColor
    --retTemp.hero_type = info.type
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getHistoryHeroWeaponImg(info.id)
    retTemp.icon_big = Path.getHistoryHeroWeaponBigImg(info.id)
    --info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. heroColor)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. heroColor)
    retTemp.color_text = Path.getTextHero(color2ImageRes[heroColor])
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.name = info.name
    --retTemp.description = info.description
    --retTemp.main_icon = Path.getCommonIcon("avatar", heroRes.icon)
    --retTemp.res_cfg = heroRes

    return retTemp
end

--返回装备类型
function TypeConvertHelper._convert_TYPE_HORSE_EQUIP(params, info)
    logDebug("_convert_TYPE_HORSE_EQUIP")
    local color2ImageRes = {
        [1] = "img_quipmentclass_white",
        [2] = "img_quipmentclass_green",
        [3] = "img_quipmentclass_blue",
        [4] = "img_quipmentclass_purple",
        [5] = "img_quipmentclass_orange",
        [6] = "img_quipmentclass_red",
        [7] = "img_quipmentclass_golden"
    }

    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("horseequip", info.res_id)
    retTemp.icon_big = Path.getCommonIcon("horseequipbig", info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.name = info.name
    retTemp.color_text = Path.getTextEquipment(color2ImageRes[info.color])
    retTemp.fragment_id = info.fragment_id
    retTemp.effect_1 = Lang.get("horse_equip_effect_" .. info.attribute_type_1)
    retTemp.effect_2 = info.attribute_value_1

    return retTemp
end

--返回道具类型
function TypeConvertHelper._conver_TYPE_POWER(params)
    logDebug("_conver_TYPE_POWER")
    local retTemp = {}
    -- retTemp.res_mini = Path.getCommonIcon("resourcemini","zhanli")
    retTemp.res_mini = Path.getUICommon("img_zhanli_01")
    --将数字转换
    if params.size then
        retTemp.size_text = TextHelper.getAmountText(params.size)
        retTemp.size = params.size
    end

    return retTemp
end

--返回兵力
function TypeConvertHelper._conver_TYPE_MINE_POWER(params)
    local retTemp = {}
    retTemp.res_mini = Path.getCommonIcon("resourcemini", "bingli")
    --将数字转换
    params.size = G_UserData:getMineCraftData():getMyArmyValue()
    if params.size then
        retTemp.size_text = TextHelper.getAmountText(params.size)
        retTemp.size = params.size
    end

    return retTemp
end

--返回资源类型
function TypeConvertHelper._convert_TYPE_RESOURCE(params, info)
    logDebug("_convert_TYPE_RESOURCE")
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("resource", info.res_id)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)
    retTemp.res_mini = Path.getCommonIcon("resourcemini", info.res_id)
    retTemp.color = info.color
    --将数字转换
    if params.size then
        retTemp.size_text = TextHelper.getAmountText(params.size)
        retTemp.size = params.size
    end

    retTemp.name = info.name

    return retTemp
end

--返回碎片类型
function TypeConvertHelper._convert_TYPE_FRAGMENT(params, info)
    logDebug("_convert_TYPE_FRAGMENT")
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    --武将碎片
    if info.comp_type == 1 then
        --装备碎片
        local hero = require("app.config.hero").get(info.comp_value)
        assert(hero, "Could not find the hero info with id : " .. tostring(info.comp_value))
        local heroRes = require("app.config.hero_res").get(hero.res_id)
        assert(heroRes, "Could not find the hero res info with id : " .. tostring(hero.res_id))

        retTemp.icon = Path.getCommonIcon("hero", heroRes.icon)
    elseif info.comp_type == 2 then
        --宝物碎片
        local equipmentRes = require("app.config.equipment").get(info.comp_value)
        assert(equipmentRes, "Could not find the equipment res info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("equip", equipmentRes.res_id)
    elseif info.comp_type == 3 then
        --神兵碎片
        local treasureRes = require("app.config.treasure").get(info.comp_value)
        assert(treasureRes, "Could not find the treasure res info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("treasure", treasureRes.res_id)
    elseif info.comp_type == 4 then
        --宝石碎片
        local instrumentRes = require("app.config.instrument").get(info.comp_value)
        assert(instrumentRes, "Could not find the instrument res info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("instrument", instrumentRes.res)
    elseif info.comp_type == 6 then
        --道具碎片
        local itemRes = require("app.config.item").get(info.comp_value)
        assert(itemRes, "Could not find the item res info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("item", itemRes.res_id)
    elseif info.comp_type == 8 then
        local gemstoneRes = require("app.config.gemstone").get(info.comp_value)
        assert(gemstoneRes, "Could not find the gemstone res info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("gemstone", gemstoneRes.res_id)
    elseif info.comp_type == 10 then
        local petCfg = require("app.config.pet").get(info.comp_value)
        assert(petCfg, "Could not find the petCfg info with id : " .. tostring(info.comp_value))
        local heroRes = require("app.config.hero_res").get(petCfg.res_id)
        assert(heroRes, "Could not find the hero res info with id : " .. tostring(petCfg.res_id))
        retTemp.icon = Path.getCommonIcon("hero", heroRes.icon)
    elseif info.comp_type == 12 then
        --名将碎片
        local horseCfg = require("app.config.horse").get(info.comp_value)
        assert(horseCfg, "Could not find the horseCfg info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("horse", horseCfg.res_id)
    elseif info.comp_type == 13 then
        --武器碎片
        local historicalHeroCfg = require("app.config.historical_hero").get(info.comp_value)
        assert(historicalHeroCfg, "Could not find the historical_hero info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("historicalhero", historicalHeroCfg.id)
    elseif info.comp_type == 14 then
        local historicalWeaponCfg = require("app.config.historical_hero_equipment").get(info.comp_value)
        assert(
            historicalWeaponCfg,
            "Could not find the historical_hero_equipment info with id : " .. tostring(info.comp_value)
        )
        retTemp.icon = Path.getCommonIcon("historicalweapon", historicalWeaponCfg.res_id)
    elseif info.comp_type == 15 then
        -- 战马装备碎片
        local equipmentRes = require("app.config.horse_equipment").get(info.comp_value)
        assert(equipmentRes, "Could not find the horse_equipment res info with id : " .. tostring(info.comp_value))
        retTemp.icon = Path.getCommonIcon("horseequip", equipmentRes.res_id)
    end

    retTemp.name = info.name

    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.item_level_bg = Path.getUICommon("frame/icon_frame_bg0" .. info.color)

    retTemp.fragment_id = info.id
    retTemp.description = info.description

    return retTemp
end

--返回玉石类型
function TypeConvertHelper._convert_TYPE_JADE_STONE(params, info)
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getCommonIcon("jade", info.icon)
    retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    retTemp.icon_big = Path.getCommonIcon("jadebig", info.icon)
    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(info.color)
    retTemp.name = info.name
    retTemp.description = info.description
    retTemp.potential = info.color

    return retTemp
end

--返回头像框类型
function TypeConvertHelper._convert_TYPE_HEAD_FRAME(params, info)
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.frame = Path.getFrameIcon(info.resource)

    retTemp.color = info.color
    retTemp.icon_color = Colors.getColor(info.color)
    retTemp.icon_color_outline = Colors.getColorOutline(info.color)
    retTemp.name = info.name
    retTemp.limit_level = info.limit_level
    retTemp.day = info.day
    retTemp.resource = info.resource
    retTemp.time_type = info.time_type
    retTemp.des = info.des
    retTemp.moving = info.moving
    return retTemp
end

--返回头像框类型
function TypeConvertHelper._convert_TYPE_TITLE(params, info)
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)

    local color = tonumber(info.colour)
    retTemp.icon_color = Colors.getColor(color)
    retTemp.icon_color_outline = Colors.getColorOutline(color)
    retTemp.name = info.name
    retTemp.day = info.day
    retTemp.time_type = info.time_type
    retTemp.des = info.des
    retTemp.moving = info.moving
    return retTemp
end

--返回军团旗帜类型
function TypeConvertHelper._convert_TYPE_FLAG(params, info)
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)
    retTemp.icon = Path.getGuildRes(info.origin_res)
    --retTemp.icon_bg = Path.getUICommonFrame("img_frame_0" .. info.color)
    local color = tonumber(info.color)
    retTemp.icon_color = Colors.getColor(color)
    retTemp.icon_color_outline = Colors.getColorOutline(color)
    retTemp.name = info.name
    retTemp.view_time = info.view_time
    retTemp.time_value = info.time_value
    retTemp.description = info.description

    retTemp.square_res = info.square_res
    retTemp.long_res = info.long_res

    return retTemp
end

--返回战法类型
function TypeConvertHelper._convert_TYPE_TACTICS(params, info)
    local retTemp = {}
    retTemp.item_type = params.type
    retTemp.item_control = TypeConvertHelper.getTypeClass(params.type)

    retTemp.icon = Path.getCommonIcon("tactics", info.icon)
    retTemp.icon_bg = Path.getUICommonFrame("img_tactis_kuang0" .. (info.color-4) .. "b")
    local color = tonumber(info.color)
    retTemp.icon_color = Colors.getColor(color)
    retTemp.icon_color_outline = Colors.getColorOutline(color)
    retTemp.icon_color_outline_show = Colors.isColorOutlineShow(color)
    retTemp.name = info.name
    retTemp.description = info.description

    return retTemp
end

return TypeConvertHelper
