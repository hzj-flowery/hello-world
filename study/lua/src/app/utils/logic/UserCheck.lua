--逻辑检查函数列表
--用户数据逻辑检查

local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local FunctionConst = require("app.const.FunctionConst")
local UserCheck = {}


--升级检查并添加升级弹窗
function UserCheck.isLevelUp(callback)

	local isLevelUp = G_UserData:getBase():isLevelUp()
	-- 清除升级标记
	G_UserData:getBase():clearLevelUpFlag()

    --升了几级
    local levelRange = G_UserData:getBase():getLevel() - G_UserData:getBase():getOldPlayerLevel()

	if isLevelUp then
		-- 创建一个弹窗，然后监听其返回事件
        local popupLevelUpLayer = require("app.ui.PopupPlayerLevelUp").new(callback)
        popupLevelUpLayer:defaultUI()
        popupLevelUpLayer:open()

	else
		-- 没有升级则直接调用回调
		if callback then
			callback(false)
		end
	end
	return isLevelUp,levelRange
end



--检查是否等级满足
function UserCheck.enoughLevel(currLv)
    if currLv <= G_UserData:getBase():getLevel() then
        return true
    end
    return false
end

-- 开服的时间是否满足
function UserCheck.enoughOpenDay(openDay, resetTime)
    local nowDay = G_UserData:getBase():getOpenServerDayNum(resetTime)
    if openDay <= nowDay then
        return true
    end
    return false
end


--检查是否满足上次登记
function UserCheck.enoughLastLevel(funcLevel)
    local lastLevel = G_UserData:getBase():getOldPlayerLevel()
    if funcLevel <= lastLevel then
        return true
    end
    return false
end


--vip是否满足
function UserCheck.enoughVip(vip)
    if vip <= G_UserData:getVip():getLevel() then
        return true
    end

    local function popFunc()
        local function callBackOk()
            local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)
        end
        local PopupAlert = require("app.ui.PopupAlert").new(
            Lang.get("common_vip_not_enough_title"),
            Lang.get("common_vip_not_enough"),callBackOk)
        PopupAlert:setOKBtn(Lang.get("common_goto_recharge"))
        PopupAlert:openWithAction()
    end


    return false,popFunc
end

--检查是否银币满足
function UserCheck.enoughMoney(needMoney,popupDlg)
    if needMoney <= G_UserData:getBase():getResValue(DataConst.RES_GOLD) then
        return true
    end
    local function popFunc()
         G_Prompt:showTip("银币不足")
    end

    return false,popFunc
end


--检查是否银币满足
function UserCheck.enoughSoul(needSoul,popupDlg)
    if needSoul <= G_UserData:getBase():getResValue(DataConst.RES_SOUL) then
        --tip
        return true
    end
    local function popFunc()
        G_Prompt:showTip("将魂不足")
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_SOUL)
	    PopupItemGuider:openWithAction()
    end

    return false,popFunc
end


--仙玉
function UserCheck.enoughJade(needValue,popupDlg)
    if needValue <= G_UserData:getBase():getResValue(DataConst.RES_JADE) then
        --tip
        return true
    end
    local function popFunc()

        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_JADE)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--威望
function UserCheck.enoughManna(needValue, popupDlg)
    if needValue <= G_UserData:getBase():getResValue(DataConst.RES_MANNA) then
        --tip
        return true
    end
    local function popFunc()

        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_MANNA)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end


--宝物之魂
function UserCheck.enoughBaowuzhihun(needValue, popupDlg)
    if needValue <= G_UserData:getBase():getResValue(DataConst.RES_BAOWUZHIHUN) then
        --tip
        return true
    end
    local function popFunc()

        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_BAOWUZHIHUN)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--装备精华
function UserCheck.enoughEquipStone(needValue, popupDlg)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_EQUIP_STONE)
    if needValue <= currNum then
        --tip
        return true
    end
    local function popFunc()
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_ITEM,DataConst.ITEM_EQUIP_STONE)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--功勋
function UserCheck.enoughHoner(needValue, popupDlg)
    if needValue <= G_UserData:getBase():getResValue(DataConst.RES_HONOR) then
        --tip
        return true
    end
    local function popFunc()

        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_HONOR)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--军团贡献
function UserCheck.enoughGongXian(needValue, popupDlg)
    if needValue <= G_UserData:getBase():getResValue(DataConst.RES_GONGXIAN) then
        --tip
        return true
    end
    local function popFunc()

        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_GONGXIAN)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--支持券
function UserCheck.enoughSupportTicket(needValue, popupDlg)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_SUPPORT_TICKET)
    if needValue <= currNum then
        return true
    end
    local function popFunc()
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_ITEM,DataConst.ITEM_SUPPORT_TICKET)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--马哨
function UserCheck.enoughHorseWhistle(needValue, popupDlg)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_WHISTLE)
    if needValue <= currNum then
        return true
    end
    local function popFunc()
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
        PopupItemGuider:updateUI(TypeConvertHelper.TYPE_ITEM,DataConst.ITEM_HORSE_WHISTLE)
        PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--马哨碎片
function UserCheck.enoughHorseWhistleFragment(needValue, popupDlg)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_WHISTLE_FRAGMENT)
    if needValue <= currNum then
        return true
    end
    local function popFunc()
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
        PopupItemGuider:updateUI(TypeConvertHelper.TYPE_ITEM,DataConst.ITEM_HORSE_WHISTLE_FRAGMENT)
        PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--黄金钥匙
function UserCheck.enoughGoldKey(needValue, popupDlg)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_KEY)
    if needValue <= currNum then
        return true
    end
    local function popFunc()
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
        PopupItemGuider:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_KEY)
        PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--黄金宝箱
function UserCheck.enoughGoldBox(needValue, popupDlg)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_BOX)
    if needValue <= currNum then
        return true
    end
    local function popFunc()
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
        PopupItemGuider:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_BOX)
        PopupItemGuider:openWithAction()
    end
    return false,popFunc
end

--检查是否元宝满足
function UserCheck.enoughCash(needCash,popupDlg)
    if needCash <= G_UserData:getBase():getResValue(DataConst.RES_DIAMOND) then
        return true
    end
    local function popFunc()
        --[[local function callBackOk()
            local PopupCurrencyExchangeView = require("app.scene.view.vip.PopupCurrencyExchangeView").new()
            PopupCurrencyExchangeView:openWithAction()
        end
        local PopupAlert = require("app.ui.PopupAlert").new(Lang.get("common_diamond_title"),Lang.get("common_diamond_not_enough"),callBackOk)
        PopupAlert:setOKBtn(Lang.get("common_vip_func_btn2"))
        PopupAlert:openWithAction()]]
        local PopupCurrencyExchangeView = require("app.scene.view.vip.PopupCurrencyExchangeView").new()
        PopupCurrencyExchangeView:openWithAction()
    end
    if popupDlg == true then
        popFunc()
    end
    return false,popFunc
end

--检查是否玉璧满足
function UserCheck.enoughJade2(needCash,popupDlg)
    if needCash <= G_UserData:getBase():getResValue(DataConst.RES_JADE2) then
        return true
    end
    local function popFunc()
        local function callBackOk()
            local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2)
        end
        local PopupAlert = require("app.ui.PopupAlert").new(Lang.get("common_jade2_title"),Lang.get("common_jade2_not_enough"),callBackOk)
        PopupAlert:setOKBtn(Lang.get("common_vip_func_btn2"))
        PopupAlert:openWithAction()
    end
    if popupDlg == true then
        popFunc()
    end
    return false,popFunc
end


--是否有足够的招募令
function UserCheck.enoughRecruitToken(needToken)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_TOKEN)

    if needToken <= currNum then
        return true
    end
    local function popFunc()
        G_Prompt:showTip(Lang.get("recruit_choose_no_token"))

    end
    return false,popFunc
end

--是否有足够的玄天八卦
function UserCheck.enoughAvatarActivityToken(needToken)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_AVATAR_ACTIVITY_TOKEN)

    if needToken <= currNum then
        return true
    end
    local function popFunc()
        G_Prompt:showTip(Lang.get("customactivity_avatar_token_not_enough"))
    end
    return false,popFunc
end

function UserCheck.getNormalFailDialog(type, value)
    local function popFunc()
		local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		PopupItemGuider:updateUI(type,value)
		PopupItemGuider:openWithAction()
    end
    return popFunc
end

--检查体力是否满足
function UserCheck.enoughVit(needVit)
    if needVit <= G_UserData:getBase():getResValue(DataConst.RES_VIT) then
        return true
    end
    local function popFunc()
        local itemValue = DataConst.RES_VIT
        local LogicCheckHelper = require("app.utils.LogicCheckHelper")
        local success,popDialog = LogicCheckHelper.resCheck(itemValue,-1,true)
        if not popDialog then
            G_Prompt:showTip(Lang.get("common_not_develop"))
        end
        return
    end
    return false, popFunc
end

--检查兵粮
function UserCheck.enoughArmyFood(needFood)
    if needFood <= G_UserData:getBase():getResValue(DataConst.RES_ARMY_FOOD) then
        return true
    end
    local function popFunc()
        local itemValue = DataConst.RES_ARMY_FOOD
        local LogicCheckHelper = require("app.utils.LogicCheckHelper")
        local success,popDialog = LogicCheckHelper.resCheck(itemValue,-1,true)
        if not popDialog then
            G_Prompt:showTip(Lang.get("common_not_develop"))
        end
        return
    end
    return false, popFunc
end

--检查令牌
function UserCheck.enoughArmyToken(needCount)
    if needCount <= G_UserData:getBase():getResValue(DataConst.RES_MINE_TOKEN) then
        return true
    end
    local function popFunc()
        local itemValue = DataConst.RES_MINE_TOKEN
        local LogicCheckHelper = require("app.utils.LogicCheckHelper")
        local success,popDialog = LogicCheckHelper.resCheck(itemValue,-1,true)
        if not popDialog then
            G_Prompt:showTip(Lang.get("common_not_develop"))
        end
        return
    end
    return false, popFunc
end

--检查南蛮令牌
function UserCheck.enoughSiegeToken(needCount)
    if needCount <= G_UserData:getBase():getResValue(DataConst.RES_TOKEN) then
        return true
    end
    local function popFunc()
        local itemValue = DataConst.RES_TOKEN
        local LogicCheckHelper = require("app.utils.LogicCheckHelper")
        local success,popDialog = LogicCheckHelper.resCheck(itemValue,-1,true)
        if not popDialog then
            G_Prompt:showTip(Lang.get("common_not_develop"))
        end
        return
    end
    return false, popFunc
end

--检查精力是否满足
function UserCheck.enoughSpirit(needSprite)
    if needSprite <= G_UserData:getBase():getResValue(DataConst.RES_SPIRIT) then
        return true
    end
    local function popFunc()
        local itemValue = DataConst.RES_SPIRIT
        local LogicCheckHelper = require("app.utils.LogicCheckHelper")
        local success,popDialog = LogicCheckHelper.resCheck(itemValue,-1,true)
        if not popDialog then
            G_Prompt:showTip(Lang.get("common_not_develop"))
        end
        return
    end
    return false, popFunc
end

--检查爬塔次数是否满足
function UserCheck.enoughTowerCount(needCount)
    if needCount <= G_UserData:getBase():getResValue(DataConst.RES_TOWER_COUNT) then
        return true
    end
    local function popFunc()
        G_Prompt:showTip(Lang.get("challenge_tower_no_count"))
    end
    return false, popFunc
end

--检查竞猜币是否满足
function UserCheck.enoughResGuess(needCount)
    if needCount <= G_UserData:getBase():getResValue(DataConst.RES_GUESS) then
        return true
    end
    return false
end

--检查时间是否过期
function UserCheck.timeExpire(checkTime)

end


--根据资源类型，资源数量，判定背包是否已满
function UserCheck.isPackageFull(type, value, size)
    if type == TypeConvertHelper.TYPE_ITEM then

    end
end



--根据等级判断武将包裹是否满了，并返回剩余容量
function UserCheck.isHeroFull()
    local DataConst = require("app.const.DataConst")
    local Role = require("app.config.role")
    local data = Role.get( G_UserData:getBase():getLevel() )
    if not data then
        return true, 0
    end

    local vipExtraNum = 0

    --根据VIP等级增加相应容量
    --local vipData = G_UserData:getVip():getVipFunctionDataByType(DataConst.VIP_FUNC_TYPE_HERO_BAG)
    --dump(vipData)


    local maxNum = data.hero_limit + vipExtraNum

    local ownNum = G_UserData:getHero():getHeroTotalCount()

    local isFull = ownNum >= maxNum

    local function fullPopup()
        local function onBtnOk()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE1)
        end
        local function onBtnCancel()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HERO_LIST)
        end
        local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(nil,Lang.get("common_pack_full_desc1"),onBtnOk)
        PopupSystemAlert:setCheckBoxVisible(false)
        PopupSystemAlert:showGoButton(Lang.get("common_pack_full_hero_btn1"))
        --PopupSystemAlert:setBtnCancel(Lang.get("common_pack_full_hero_btn2"))
        PopupSystemAlert:openWithAction()
    end

    return  isFull, (isFull and 0 or maxNum-ownNum),fullPopup
end


--根据等级判断装备包裹是否满了，并返回剩余容量
function UserCheck.isEquipmentFull()

    local DataConst = require("app.const.DataConst")
    local Role = require("app.config.role")
    local data = Role.get( G_UserData:getBase():getLevel() )
    if not data then
        return true, 0
    end


    local vipExtraNum = 0

    --根据VIP等级增加相应容量
    --local vipData = G_UserData:getVip():getVipFunctionDataByType(DataConst.VIP_FUNC_TYPE_EQUIP_BAG)
    --dump(vipData)


    local maxNum = data.equipment_limit

    --当前装备数量
    local ownNum = G_UserData:getEquipment():getEquipTotalCount()

    local isFull = ownNum >= maxNum

    local function fullPopup()
        local function onBtnOk()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE3)
        end
        local function onBtnCancel()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_LIST)
        end
        local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(nil,Lang.get("common_pack_full_desc2"),onBtnOk,onBtnCancel)
        PopupSystemAlert:setCheckBoxVisible(false)
        PopupSystemAlert:setBtnOk(Lang.get("common_pack_full_equip_btn1"))
        PopupSystemAlert:setBtnCancel(Lang.get("common_pack_full_equip_btn2"))
        PopupSystemAlert:openWithAction()
    end

    return  isFull, (isFull and 0 or maxNum-ownNum),fullPopup

end

--根据等级判断宝物包裹是否满了，并返回剩余容量
function UserCheck.isTreasureFull()

    local DataConst = require("app.const.DataConst")
    local Role = require("app.config.role")
    local data = Role.get( G_UserData:getBase():getLevel() )
    if not data then
        return true, 0
    end

    local vipExtraNum = 0

    --根据VIP等级增加相应容量
    --local vipData = G_UserData:getVip():getVipFunctionDataByType(DataConst.VIP_FUNC_TYPE_TREASURE_BAG)
    --dump(vipData)

    local maxNum = data.treasure_limit

    --当前宝物数量
    local ownNum = G_UserData:getTreasure():getTreasureTotalCount()

    local isFull = ownNum >= maxNum
    local function fullPopup()
        local function onBtnOk()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_TREASURE_LIST)
        end
        local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(nil,Lang.get("common_pack_full_desc3"),onBtnOk)
        PopupSystemAlert:setCheckBoxVisible(false)
        PopupSystemAlert:showGoButton(Lang.get("common_pack_full_treasure_btn1"))
        PopupSystemAlert:openWithAction()
    end

    return  isFull, (isFull and 0 or maxNum-ownNum),fullPopup
end

--根据等级判断神兵上限
function UserCheck.isInstrumentFull()

    local DataConst = require("app.const.DataConst")
    local Role = require("app.config.role")
    local data = Role.get( G_UserData:getBase():getLevel() )
    if not data then
        return true, 0
    end

    local maxNum = data.instrument_limit

    --当前神兵数量
    local ownNum = G_UserData:getInstrument():getInstrumentTotalCount()

    local isFull = ownNum >= maxNum
    local function fullPopup()
        local function onBtnOk()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE7)
        end
        local function onBtnCancel()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_INSTRUMENT_LIST)
        end

        local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(nil,Lang.get("common_pack_full_desc4"),onBtnOk,onBtnCancel)
        PopupSystemAlert:setCheckBoxVisible(false)

        PopupSystemAlert:setBtnOk(Lang.get("common_pack_full_instrument_btn1"))
        PopupSystemAlert:setBtnCancel(Lang.get("common_pack_full_instrument_btn2"))

        PopupSystemAlert:openWithAction()
    end

    return  isFull, (isFull and 0 or maxNum-ownNum),fullPopup
end

--根据等级判断战马包裹是否满了，并返回剩余容量
function UserCheck.isHorseFull()
    local DataConst = require("app.const.DataConst")
    local Role = require("app.config.role")
    local data = Role.get( G_UserData:getBase():getLevel() )
    if not data then
        return true, 0
    end

    local vipExtraNum = 0

    --根据VIP等级增加相应容量
    --local vipData = G_UserData:getVip():getVipFunctionDataByType(DataConst.VIP_FUNC_TYPE_HERO_BAG)
    --dump(vipData)


    local maxNum = data.horse_limit + vipExtraNum

    local ownNum = G_UserData:getHorse():getHorseTotalCount()

    local isFull = ownNum >= maxNum

    local function fullPopup()
        local function onBtnOk()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE11)
        end
        local function onBtnCancel()
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_LIST)
        end
        local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(nil,Lang.get("common_pack_full_desc5"),onBtnOk)
        PopupSystemAlert:setCheckBoxVisible(false)
        PopupSystemAlert:showGoButton(Lang.get("common_pack_full_horse_btn1"))
        PopupSystemAlert:openWithAction()
    end

    return  isFull, (isFull and 0 or maxNum-ownNum),fullPopup
end

--检查背包是否已满
--itemType：对应TypeConverter.TYPE_KNIGHT. TYPE_EQUIPMENT TYPE_TREASURE...
--itemValue: 仅当_type==TYPE_ITEM 时，需要传入itemValue，用来检查礼包使用后是否会造成背包溢出
function UserCheck.isPackFull(itemType, itemValue)

    if type(itemType) ~= "number" then
        assert(type(itemType) == "number","传入类型不对")
        return true, 0
    end

    local isFull, leftCapacity , popupDlg = false, 9999 , nil
    local needPopWindow = true --背包不足的时候，是否自动弹窗引导


    if itemType == TypeConvertHelper.TYPE_HERO or              --武将
        itemType == TypeConvertHelper.TYPE_EQUIPMENT or        --装备
        itemType == TypeConvertHelper.TYPE_TREASURE or          --宝物
        itemType == TypeConvertHelper.TYPE_INSTRUMENT or        --神兵
        itemType == TypeConvertHelper.TYPE_HORSE then      --战马 
        isFull, leftCapacity, popupDlg = UserCheck.getLeftPackCapacity(itemType)
    elseif itemType == TypeConvertHelper.TYPE_ITEM then          --道具，针对礼包类型的
        --暂时不支持同时使用多个
        if type(itemValue) ~= "number" then
            assert(type(itemValue) == "number","传入value值不对")
            return true, 0
        end
        isFull, leftCapacity = UserCheck.checkBeforeUseItem(itemValue)
        dump(leftCapacity)
        if isFull then
            return true, 0
        end
    else
        --其他类型无上限
    end

    if isFull and needPopWindow then
        --弹出对话框
        if popupDlg then
            popupDlg()
        end
        --G_Prompt:showTip("包裹已满，请清理")
    end

    return isFull, leftCapacity

end


--使用道具之前判断某个包裹是否满了
function UserCheck.checkBeforeUseItem(itemId)
    if not itemId or type(itemId) ~= "number" then
        return false, 0
    end

    local ItemInfo = require("app.config.item")
    local item = ItemInfo.get(itemId)
    --礼包类item_type = 1
    if not item then -- or item.spill == "" then
        return false, 0
    end

    if item.item_type == 1 then --礼包类型
        local isFull, leftCapacity = UserCheck.checkPackFullByDropId(item.item_value)
        return isFull, leftCapacity
    elseif item.item_type == 2 then --box宝箱
        local isFull, leftCapacity = UserCheck.checkPackFullByBoxId(item.item_value,itemId)
        return isFull, leftCapacity
    end

    return false, 9999
end

--box宝箱
function UserCheck.checkPackFullByBoxId(boxId,itemId)
    if not boxId or type(boxId) ~= "number" then
        return false,0
    end

    local UIPopupHelper = require("app.utils.UIPopupHelper")

    local itemList = UIPopupHelper.getBoxItemList(boxId, itemId)

    local leftCapacity = 9999
    for k,v in pairs(itemList) do
        for j, itemData in pairs(v) do
            local isFull,tempLeft = UserCheck.isPackFull(itemData.type, itemData.value)
            if isFull then
                return true,0
            end
            leftCapacity = math.min(tempLeft,leftCapacity)
        end
    end
    dump(leftCapacity)
    return false,leftCapacity
end


--根据掉落ID判断是否会造成某个背包溢出
function UserCheck.checkPackFullByDropId(dropId)
    if not dropId or type(dropId) ~= "number" then
        return false,0
    end

    dump(dropId)


    local DropInfo = require("app.config.drop")
    local drop = DropInfo.get(dropId)
    if not drop then
        return false,0
    end


    --将掉落库里的所有道具读出来,不管是全掉落还是N选1
    local index = 1
    local typeKey = string.format("type_%d",index)

    local typeList = {}
    while DropInfo.hasKey(typeKey) do
        --不再判断item类型
        if drop[typeKey] > 0 and drop[typeKey] ~= TypeConvertHelper.TYPE_ITEM then
            table.insert(typeList,drop[typeKey])
        end

        index = index + 1
        typeKey = string.format("type_%d",index)
    end

    --dump(typeList)
    local leftCapacity = 9999

    for k,v in ipairs(typeList) do
        local isFull,tempLeft = UserCheck.isPackFull(v)
        if isFull then
            return true,0
        end
        leftCapacity = math.min(tempLeft,leftCapacity)
    end
    dump(leftCapacity)
    return false,leftCapacity

end


--根据领奖是否会造成某个背包溢出
function UserCheck.checkPackFullByAwards(awards)
    if not awards or type(awards) ~= "table" then
        return false
    end

    local typeList = {}
    for i=1, #awards do
        --这里不检查礼包类道具，礼包类道具在使用打开的时候回检测
        if rawget(awards[i], "type") and
            awards[i].type ~= TypeConvertHelper.TYPE_ITEM  then
            table.insert(typeList,awards[i].type)
        end
    end
    --dump(typeList)
    for k,v in ipairs(typeList) do
        local isFull = UserCheck.isPackFull(v)
        if isFull then
            return true
        end
    end
    return false
end


--检查背包剩余容量
--itemType：对应TypeConvertHelper.TYPE_HERO TYPE_EQUIPMENT TYPE_TREASURE...
function UserCheck.getLeftPackCapacity(itemType)

    assert(type(itemType) == "number","UserCheck.getLeftPackCapacity itemType error")
    local isFull, leftCapacity,popupDlg = false, 0,nil


    if itemType == TypeConvertHelper.TYPE_HERO then              --武将
        isFull, leftCapacity,popupDlg = UserCheck.isHeroFull()
    elseif itemType == TypeConvertHelper.TYPE_EQUIPMENT then       --装备
        isFull, leftCapacity,popupDlg = UserCheck.isEquipmentFull()
    elseif itemType == TypeConvertHelper.TYPE_TREASURE then        --宝物
        isFull, leftCapacity,popupDlg = UserCheck.isTreasureFull()
    elseif itemType == TypeConvertHelper.TYPE_INSTRUMENT then        --神兵
        isFull, leftCapacity,popupDlg = UserCheck.isInstrumentFull()
    elseif itemType == TypeConvertHelper.TYPE_HORSE then
        isFull, leftCapacity,popupDlg = UserCheck.isHorseFull()
    else
        --其他类型无上限 --暂定9999
        leftCapacity = 9999
    end

    return isFull,leftCapacity,popupDlg
end

--检查官衔是否能升级
function UserCheck.checkOfficialLevelUp()

    local officialInfo = G_UserData:getBase():getOfficialInfo()

    local function checkBattleInfo()
        local power = G_UserData:getBase():getPower()
        if power >= officialInfo.combat_demand then
            return true
        end
        local function prompt()
             G_Prompt:showTip("战力不足")
        end

        return false, prompt
    end
    if officialInfo then
        local prompt = nil
        if officialInfo.type_1 <= 0 and officialInfo.type_2 <= 0 then--最高级
            return false
        end

        local checkReturn = true
        --检查战力
        checkReturn, prompt = checkBattleInfo()

        if checkReturn == false then
            return false, prompt
        end
        --检查资源1
        if officialInfo.type_1 > 0 then
            checkReturn = UserCheck.enoughValue(officialInfo.type_1,officialInfo.value_1,officialInfo.size_1)

            if checkReturn == false then

                local function prompt()
                    local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
                    PopupItemGuider:updateUI(officialInfo.type_1,officialInfo.value_1)
                    PopupItemGuider:openWithAction()
                end
                return false,prompt
            end
        end
        --检查资源2
        if officialInfo.type_2 > 0 then
            checkReturn = UserCheck.enoughValue(officialInfo.type_2,officialInfo.value_2,officialInfo.size_2)
            if checkReturn == false then
                local function prompt()
                    local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
                    PopupItemGuider:updateUI(officialInfo.type_2,officialInfo.value_2)
                    PopupItemGuider:openWithAction()
                end
                return false,prompt
            end
        end
        return checkReturn
    end
    return false
end

function UserCheck.commonEnoughResValue(checkSize, resId)
    if checkSize <= G_UserData:getBase():getResValue(resId) then
        return true
    end
    local function popFunc()
        local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_RESOURCE,resId)
	    PopupItemGuider:openWithAction()
    end
    return false,popFunc
end
function UserCheck._getResourceFailDlg(checkType,checkValue, checkSize)
    local failed, popFunc = nil
    if checkValue == DataConst.RES_GOLD then
        failed, popFunc = UserCheck.enoughMoney(checkSize)
    elseif checkValue == DataConst.RES_DIAMOND then
        failed, popFunc =  UserCheck.enoughCash(checkSize)
    elseif checkValue == DataConst.RES_VIT then
        failed, popFunc =  UserCheck.enoughVit(checkSize)
    elseif checkValue == DataConst.RES_SPIRIT then
        failed, popFunc =  UserCheck.enoughSpirit(checkSize)
    elseif checkValue == DataConst.RES_TOKEN then
        failed, popFunc =  UserCheck.enoughSiegeToken(checkSize)
    elseif checkValue == DataConst.RES_TOWER_COUNT then
        failed, popFunc = UserCheck.enoughTowerCount(checkSize)
    elseif checkValue == DataConst.RES_ARMY_FOOD then
        failed, popFunc = UserCheck.enoughArmyFood(checkSize)
    elseif checkValue == DataConst.RES_MINE_TOKEN then
        failed, popFunc = UserCheck.enoughArmyToken(checkSize)
    elseif checkValue == DataConst.RES_JADE2 then
        failed, popFunc = UserCheck.enoughJade2(checkSize)
    else
        failed, popFunc =  UserCheck.commonEnoughResValue(checkSize,checkValue)
    end

    return failed, popFunc
end

function UserCheck.enoughValue(checkType, checkValue, checkSize, popupDlg)
    if popupDlg == nil then
        popupDlg = true
    end

    if checkType == nil or checkType == 0 then
        return true
    end
    if checkValue  == 0 then
        return true
    end
    --dump(checkType)
    --dump(checkValue)
    local DataConst = require("app.const.DataConst")
    --if checkType ~= TypeConvertHelper.TYPE_RESOURCE then
     --   assert(false, "UserCheck.enoughValue checkType ~= TypeConvertHelper.TYPE_RESOURCE")
     --   return false
    --end

    local currNum = UserDataHelper.getNumByTypeAndValue(checkType, checkValue)
    if currNum >= checkSize then
        return true
    end


    local failed, popFunc = nil

    if checkType == TypeConvertHelper.TYPE_RESOURCE then
        failed, popFunc = UserCheck._getResourceFailDlg(checkType, checkValue, checkSize)
    end

    --检查刷新令
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_REFRESH_TOKEN then
      --  UserCheck.enoughMoney(checkSize)
    end

    --招募令
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_RECRUIT_TOKEN then
        failed, popFunc = UserCheck.enoughRecruitToken(checkSize, popupDlg)
    end
    
    --神兽精华
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_PET_JINGHUA then
        popFunc = UserCheck.getNormalFailDialog(TypeConvertHelper.TYPE_ITEM, checkValue)
    end

    --圣灵之息
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_RED_PET_JINGHUA then
        popFunc = UserCheck.getNormalFailDialog(TypeConvertHelper.TYPE_ITEM, checkValue)
    end

    --装备精华
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_EQUIP_STONE then
        failed, popFunc = UserCheck.enoughEquipStone(checkSize, popupDlg)
    end

	--玄天八卦
	if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_AVATAR_ACTIVITY_TOKEN then
		failed, popFunc = UserCheck.enoughAvatarActivityToken(checkSize, popupDlg)
	end

	if checkType == TypeConvertHelper.TYPE_ITEM and (checkValue == DataConst.ITEM_AVATAR_ACTIVITY_ITEM1  or checkValue == DataConst.ITEM_AVATAR_ACTIVITY_ITEM2)then
		popFunc = UserCheck.getNormalFailDialog(TypeConvertHelper.TYPE_ITEM, checkValue)
    end
    
    --支持券
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_SUPPORT_TICKET then
        failed, popFunc = UserCheck.enoughSupportTicket(checkSize, popupDlg)
    end

    --马哨
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_HORSE_WHISTLE then
        failed, popFunc = UserCheck.enoughHorseWhistle(checkSize, popupDlg)
    end

    --马哨碎片
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_HORSE_WHISTLE_FRAGMENT then
        failed, popFunc = UserCheck.enoughHorseWhistleFragment(checkSize, popupDlg)
    end

    --黄金钥匙
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_GOLD_KEY then
        failed, popFunc = UserCheck.enoughGoldKey(checkSize, popupDlg)
    end

    --黄金宝箱
    if checkType == TypeConvertHelper.TYPE_ITEM and checkValue == DataConst.ITEM_GOLD_BOX then
        failed, popFunc = UserCheck.enoughGoldBox(checkSize, popupDlg)
    end

    if popupDlg and popFunc then
        popFunc()
    end

    return false
end



function UserCheck.vipFuncIsOpened(funcType, callback)
	if not funcType then
		if callback then
			callback()
		end
		return true, ""
	end

	local vipData = G_UserData:getVip():getVipFunctionDataByType(funcType)
	local errMsg = vipData and vipData.hint1 or "VIP等级不足"

	if not vipData then
		return false, errMsg
	end

	if callback then
		callback()
	end

	return true, errMsg
end


function UserCheck._getVipFuncDlg(funcType, vipLevel)


end


--调用此方法检查是否可以引导玩家提升VIP等级来获取更多的次数。
--funcType 功能ID
--return 是否购买次数用完
function UserCheck.vipTimesOutCheck(funcType,times,shopTip,notShowVipDialog)
	assert(funcType, "invalide funcType " .. tostring(funcType))
    local UIPopupHelper = require("app.utils.UIPopupHelper")
	local usedTimes = times
    local vipCfg = G_UserData:getVip():getVipFunctionDataByType(funcType,nil)
	local tips = shopTip


	local currentValue, maxValue = G_UserData:getVip():getVipTimesByFuncId(funcType)
	if currentValue == usedTimes then --使用已达最大次数
		if currentValue < maxValue then --可以通过提升VIP等级来增加次数
            if notShowVipDialog then
                G_Prompt:showTip(vipCfg.hint3)
            else
                UIPopupHelper.popupResetTimesNoEnough(funcType)
            end

		else --当前已达最大次数
			G_Prompt:showTip(tips or vipCfg.hint3)
		end
	end

	return currentValue == usedTimes
end

--@return 是否有足够资源，异常回调
function UserCheck.resCheck(resValue,checkSize,popupDlg)
    local currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, resValue)
    if checkSize >= 0 and currNum >= checkSize then--检查值小于0不用检查
        return true,nil
    end
    popupDlg = popupDlg == nil and  true or popupDlg
	local UserDataHelper = require("app.utils.UserDataHelper")
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local DataConst = require("app.const.DataConst")
    local UIPopupHelper	 = require("app.utils.UIPopupHelper")
	local itemType =  TypeConvertHelper.TYPE_ITEM
	local itemValue = DataConst.getItemIdByResId(resValue)--取出资源对应的道具类型




    local popFunc = nil
	if itemType and itemValue then
		local maxValue = UserDataHelper.getResItemMaxUseNum(itemValue)
		if maxValue == 0 then
			popFunc =  function()
               UIPopupHelper.popupItemBuyAndUse(itemType,itemValue)
            end
        elseif maxValue == -1 then--不能使用
            popFunc = function()
                UIPopupHelper.popupItemBuyAndUse(itemType,itemValue)
            end
        else
            popFunc = function()
                UIPopupHelper.popupItemBuyAndUse(itemType,itemValue)
            end
		end
    else
        popFunc = function()
            UIPopupHelper.popupShopBuyRes(TypeConvertHelper.TYPE_RESOURCE,resValue)
        end
	end
    if popupDlg and popFunc then
        popFunc()
    end
	return false,popFunc
end


-- --ocal size = UserDataHelper.getNumByTypeAndValue(type,value)
--判断资源 达到自动回复上限
function UserCheck.isResReachTimeLimit(resValue)
	local size = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE,resValue)
	local maxValue = G_RecoverMgr:getRecoverLimitByResId(resValue)
	if size and maxValue and size >= maxValue then
		return true
	end
	return false
end

--判断资源 达到自动回复上限
function UserCheck.isResReachMaxLimit(resValue)
	local size = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE,resValue)
	local recoverConfig = require("app.config.recover")
	local config = recoverConfig.get(resValue)
	if config then
		local maxValue = config.max_limit
		if size and maxValue and size >= maxValue then
			return true
		end
	end
	return false
end


function UserCheck.enoughValueList(resValueList,popupDlg)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local canBuy = true
	for k,v in ipairs(resValueList) do
		canBuy =  LogicCheckHelper.enoughValue(v.type,v.value,v.size,popupDlg)
        if not canBuy then
            break
        end
	end
	return canBuy
end

return UserCheck
