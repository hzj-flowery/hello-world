
--跳转界面函数
--根据function_level  的id 做函数映射
--代码结构上看起来比较清晰，不用一堆if else
local FunctionConst = require("app.const.FunctionConst")
local WayFuncConvert = {}
local ShopConst = require("app.const.ShopConst")
function WayFuncConvert.getReturnFunc(funcId)
	
	local funcName = FunctionConst.getFuncName(funcId)
    local retFunc =  WayFuncConvert["_"..funcName]
    if retFunc ~=nil and type(retFunc) == "function" then
        return retFunc
    end
    return nil
end

--[[
function WayFuncConvert._FUNC_ADVENTURE()
	return WayFuncConvert._FUNC_NEW_STAGE()
end
]]
function WayFuncConvert._FUNC_MINE_CRAFT()
	local returnFunc = function(...)
		G_SceneManager:showScene("mineCraft")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_OFFICIAL()
	local returnFunc = function(...)
		local PopupOfficialRankUp = require("app.scene.view.official.PopupOfficialRankUp").new()
		PopupOfficialRankUp:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_SYSTEM_SET()
	local returnFunc = function(...)
		local PopupPlayerDetail = require("app.scene.view.playerDetail.PopupPlayerDetail").new()
		PopupPlayerDetail:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_CONVERT()
	local returnFunc = function(...)
		G_SceneManager:showScene("transform")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_MAIN_STRONGER( ... )
	local returnFunc = function(...)
		G_SceneManager:showScene("stronger")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_BECOME_STRONGER()
	local returnFunc = function(...)
		G_SceneManager:showScene("stronger")
	end
	return returnFunc
end


function WayFuncConvert._FUNC_MAIL()
	local returnFunc = function(...)
		local PopupMailReward = require("app.scene.view.mail.PopupMailReward").new()
		PopupMailReward:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_MAIL_RED(...)
	return WayFuncConvert._FUNC_MAIL(...)
end


function WayFuncConvert._FUNC_RECHARGE()
	local returnFunc = function(...)
        --TODO 最好在底层G_SceneManager支持
        G_SceneManager:showDialog("app.scene.view.vip.VipView", nil, nil, 1)
		--
		--[[
		local sceneName = G_SceneManager:getRunningSceneName()
        if sceneName == "vip" then
			local scene = G_SceneManager:getRunningScene()
			if scene:getSceneView().switch2Recharge then scene:getSceneView():switch2Recharge() end
		else
			G_SceneManager:showScene("vip")
		end
]]
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECHARGE2()
	return WayFuncConvert._FUNC_JADE2()
end

function WayFuncConvert._FUNC_JADE2()
	local returnFunc = function(...)
		G_SceneManager:showDialog("app.scene.view.vip.VipView", nil, nil, 1)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECYCLE()
	local returnFunc = function(...)
		G_SceneManager:showScene("recovery")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_MORE()
	local returnFunc = function(...)
		local sceneName = G_SceneManager:getRunningSceneName()
		if sceneName == "main" then
			local MainMenuLayer = G_SceneManager:getRunningScene():getSubNodeByName("MainMenuLayer")
			if MainMenuLayer then --点击更多按钮
				MainMenuLayer:onMoreBtn()
			end
		end
	end
	return returnFunc
end
function WayFuncConvert._FUNC_ADVENTURE()
	local returnFunc = function(...)
		G_SceneManager:showScene("challenge")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_TEAM()
	local returnFunc = function(...)
		G_SceneManager:showScene("team")
	end
	return returnFunc
end

--福利跳转
function WayFuncConvert._FUNC_WELFARE()
	local returnFunc = function(actId)
		G_SceneManager:showScene("activity",actId)
	end
	return returnFunc

	--[[
	G_SignalManager:dispatch(SignalConst.EVENT_ROLLNOTICE_RECEIVE,{
	  msg = "恭喜#name#在酒馆中抽中#hero#！",
 	  noticeType = 2,
  	  param = "727514|1|0,张角|2|5"
	})
	]]

end

function WayFuncConvert._FUNC_HAND_BOOK()
	local returnFunc = function(...)
		G_SceneManager:showScene("handbook",nil)
		--local PopupHandBook = require("app.ui.PopupHandBook").new()
    	--PopupHandBook:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_VIP_GIFT()
	local returnFunc = function(...)
		--G_SceneManager:showDialog("app.scene.view.vip.VipView",nil,nil,2)


		local PopupVipGiftPkg = require("app.scene.view.vip.PopupVipGiftPkg").new()
    	PopupVipGiftPkg:openWithAction()
	end
	return returnFunc
end



function WayFuncConvert._FUNC_AWAKE_BAG()
	local returnFunc = function()
		local PackageHelper = require("app.scene.view.package.PackageHelper")
		local index = PackageHelper.getPackageAwarkTabIndx()
		G_SceneManager:showScene("package", index)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ITEM_BAG()
	local returnFunc = function(...)
		G_SceneManager:showScene("package")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ITEM_BAG2()
    local returnFunc = function(...)
        G_SceneManager:showScene("package")
    end
    return returnFunc
end

function WayFuncConvert._FUNC_DAILY_MISSION()
	local returnFunc = function(...)
		G_SceneManager:showScene("achievement")
		--G_SceneManager:showDialog("app.scene.view.mission.PopupDailyMission")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ACHIEVEMENT()
	local returnFunc = function(...)
		G_SceneManager:showScene("achievement",2)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_EQUIP_LIST()
	local returnFunc = function(...)
		G_SceneManager:showScene("equipment")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_TREASURE_LIST()
	local returnFunc = function(...)
		G_SceneManager:showScene("treasure")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_INSTRUMENT_LIST()
	local returnFunc = function(...)
		G_SceneManager:showScene("instrument")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_HERO_LIST()
	local returnFunc = function(...)
		G_SceneManager:showScene("hero")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_TEAM_SLOT1(pos)
	pos = pos or 1
	local returnFunc = function(...)
		logWarn(" _FUNC_TEAM_SLOT1 G_SceneManager:showScene(team) ")
		G_SceneManager:showScene("team",pos)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_TEAM_SLOT2()
	return WayFuncConvert._FUNC_TEAM_SLOT1(2)
end
function WayFuncConvert._FUNC_TEAM_SLOT3()
	return WayFuncConvert._FUNC_TEAM_SLOT1(3)
end
function WayFuncConvert._FUNC_TEAM_SLOT4()
	return WayFuncConvert._FUNC_TEAM_SLOT1(4)
end
function WayFuncConvert._FUNC_TEAM_SLOT5()
	return WayFuncConvert._FUNC_TEAM_SLOT1(5)
end
function WayFuncConvert._FUNC_TEAM_SLOT6()
	return WayFuncConvert._FUNC_TEAM_SLOT1(6)
end

function WayFuncConvert._FUNC_NEW_STAGE()
	local ChapterConst	= require("app.const.ChapterConst")
	local returnFunc = function(...)
		G_SceneManager:showScene("chapter")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ELITE_CHAPTER()
	local ChapterConst	= require("app.const.ChapterConst")
	local returnFunc = function( ... )
		G_SceneManager:showScene("chapter", ChapterConst.CHAPTER_TYPE_ELITE)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_FAMOUS_CHAPTER()
	local ChapterConst	= require("app.const.ChapterConst")
	local returnFunc = function( ... )
		G_SceneManager:showScene("chapter", ChapterConst.CHAPTER_TYPE_FAMOUS)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_FIGHT_SCENE()
	return WayFuncConvert._FUNC_NEW_STAGE()
end

function WayFuncConvert._FUNC_DAILY_STAGE()
	local returnFunc = function( ... )
		G_SceneManager:showScene("dailyChallenge")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_DRAW_HERO()
	local returnFunc = function(...)
		G_SceneManager:showScene("drawCard")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_SHOP_SCENE()
	local returnFunc = function(...)
		logWarn("WayFuncConvert._FUNC_SHOP_SCENE")
		G_SceneManager:showScene("shop")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_EQUIP_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("shop", ShopConst.EQUIP_SHOP)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_SHOP( ... )
	-- body

	G_SceneManager:showScene("shop", ShopConst.PET_SHOP)


	return returnFunc
end

function WayFuncConvert._FUNC_INSTRUMENT_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("shop", ShopConst.TREASURE_SHOP)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_HORSE_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("shop", ShopConst.HORSE_SHOP)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_SIEGE_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("shop", ShopConst.INSTRUMENT_SHOP)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_HERO_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("shop", ShopConst.HERO_SHOP)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_GUILD_SHOP()
	local returnFunc = function(...)
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild == false then
			G_Prompt:showTip(Lang.get("lang_guild_shop_no_open"))
		else
			G_SceneManager:showScene("shop", ShopConst.GUILD_SHOP)
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ARENA_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("shop", ShopConst.ARENA_SHOP)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_AWAKE_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("shop", ShopConst.AWAKE_SHOP)
	end
	return returnFunc
end




function WayFuncConvert._FUNC_AUCTION()
	local returnFunc = function()
		G_SceneManager:showScene("auction")
	end
	return returnFunc
end
function WayFuncConvert._FUNC_ARENA()
	local returnFunc = function(...)
		G_SceneManager:showScene("arena")
	end
	return returnFunc
end

--装备强化界面
function WayFuncConvert._FUNC_EQUIP_TRAIN_TYPE1()
	local returnFunc = function(...)
		local firstEquipId = G_UserData:getBattleResource():getFirstEquipId()
		if not firstEquipId then
			 G_Prompt:showTip(Lang.get("equipment_strengthen_fetch_equip_hint"))
		else
			local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
			if EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false then
				return
			end
			G_SceneManager:showScene("equipTrain",firstEquipId)
		end

	end
	return returnFunc
end

--游历游历
function WayFuncConvert._FUNC_TRAVEL()
	local returnFunc = function(...)
		G_SceneManager:showScene("exploreMain")
	end
	return returnFunc
end

--游历10次
function WayFuncConvert._FUNC_EXPLORE_ROLL_TEN()
	return WayFuncConvert._FUNC_TRAVEL()
end

--围剿叛军
function WayFuncConvert._FUNC_PVE_SIEGE()
	local returnFunc = function(...)
		G_SceneManager:showScene("siege")
	end
	return returnFunc
end

--过关斩将
function WayFuncConvert._FUNC_PVE_TOWER()
	local returnFunc = function(...)
		G_SceneManager:showScene("tower")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_FIRST_RECHARGE()
	local returnFunc = function(...)
		local PopupFirstPayView = require("app.scene.view.firstpay.PopupFirstPayView")
		local popup = PopupFirstPayView.new()
		popup:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_WEEK_ACTIVITY()
	local returnFunc = function(...)
		local PopupDay7Activity = require("app.scene.view.day7activity.PopupDay7Activity")
		local popup = PopupDay7Activity.new()
		popup:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ARMY_GROUP()
	local returnFunc = function(...)
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			G_SceneManager:showScene("guild")
		else
			G_SceneManager:showDialog("app.scene.view.guild.PopupGuildListView")
		end

	end
	return returnFunc
end
function WayFuncConvert._FUNC_ACTIVITY()
	local returnFunc = function(...)

		local CustomActivityView = require("app.scene.view.customactivity.CustomActivityView")
		local popup = CustomActivityView.new()
		popup:openWithAction()

--[[
		local PopupGuildSprintRank = require("app.scene.view.activityguildsprint.PopupGuildSprintRank")
		local popup = PopupGuildSprintRank.new()
		popup:openWithAction()
]]
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PVE_TERRITORY()
	local returnFunc = function(...)
		G_SceneManager:showScene("territory")
	end
	return returnFunc
end

--跳转到第一章节第一个关
function WayFuncConvert._FUNC_TUTORIAL_JUMP_PVE()


	local returnFunc = function(...)
		G_SceneManager:popToRootAndReplaceScene("stage",1)
	end
	return returnFunc
end


function WayFuncConvert._FUNC_TUTORIAL_JUMP_MAIN()

	local returnFunc = function(...)
		logWarn("FUNC_TUTORIAL_JUMP_MAIN")
		local scene, view = G_SceneManager:createScene("main")
		G_SceneManager:popToRootScene()
		G_SceneManager:replaceScene(scene)
	end
	return returnFunc
end

--跳转到第2章节第一个关
function WayFuncConvert._FUNC_TUTORIAL_JUMP_PVE2()

	local returnFunc = function(...)
		G_SceneManager:popToRootAndReplaceScene("stage")
	end
	return returnFunc
end

--跳转到第3章节第一个关
function WayFuncConvert._FUNC_TUTORIAL_JUMP_PVE3()
	local returnFunc = function(...)
		G_SceneManager:popToRootAndReplaceScene("stage")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_TUTORIAL_TEAM_VIEW_SOLT1()

	local returnFunc = function(...)
		logWarn("FUNC_TUTORIAL_TEAM_VIEW_SOLT1")
		G_SceneManager:popToRootAndReplaceScene("team",1)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_INDULGE()
	local returnFunc = function(...)
		--[[
		local UIPopupHelper = require("app.utils.UIPopupHelper")
		local TimeConst = require("app.const.TimeConst")
		if  G_UserData:getBase():getOnlineTime() >= TimeConst.INDULGE_TIME_01 then
			local isInStage2 = G_UserData:getBase():getOnlineTime() >= TimeConst.INDULGE_TIME_02
			local hintStr =  Lang.get(isInStage2 and "publish_require_indulge_hint02" or "publish_require_indulge_hint01")
			UIPopupHelper.popupNoticeDialog(hintStr)
		end
		]]
	end
	return returnFunc
end

function WayFuncConvert._FUNC_QUESTION()
	local returnFunc = function(queUnitData)
		--[[
		local LoginNotice = require("app.scene.view.login.LoginNotice")
		local popup = LoginNotice.new(queUnitData:getUrl(),Lang.get("questionnaire_title"))
		popup:openWithAction()
		]]
		local UIPopupHelper = require("app.utils.UIPopupHelper")
		UIPopupHelper.popupQuestionDialog(function()
			G_NativeAgent:openURL(queUnitData:getUrl())
			G_UserData:getQuestionnaire():c2sQuestionnaire(queUnitData:getId())
		end)


	end
	return returnFunc
end

function WayFuncConvert._FUNC_RANK()
	local returnFunc = function(selectIndex)
		G_SceneManager:showScene("complexrank",selectIndex)
	end

	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE1()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_1)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE2()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_2)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE3()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_3)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE4()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_4)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE5()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_5)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE6()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_6)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE7()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_7)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE8()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_8)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE9()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_9)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE10()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_10)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE11()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_11)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE12()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_12)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE13()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_13)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RECOVERY_TYPE14()
	local returnFunc = function()
		local RecoveryConst = require("app.const.RecoveryConst")
		G_SceneManager:showScene("recovery", RecoveryConst.RECOVERY_TYPE_14)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_DINNER()

	local ActivityConst = require("app.const.ActivityConst")
	local returnFunc = function(params)
		if type(params) == "string" and params == "mission" then
			local currDinnerUnitData = G_UserData:getActivityDinner():getCurrDinnerUnitData()
			if currDinnerUnitData == nil then
				G_Prompt:showTip(Lang.get("lang_daily_mission_dinner_no_open"))
				return nil
			end
		end
		G_SceneManager:showScene("activity",ActivityConst.ACT_ID_DINNER )
	end
	return returnFunc
end



function WayFuncConvert._FUNC_MONEY_TREE()
	local ActivityConst = require("app.const.ActivityConst")
	local currScene = G_SceneManager:getRunningScene()
	--如果已经在聚宝盆界面了，则不用再做跳转
	if currScene:getName() == "activity" then
		local sceneView = currScene:getSceneView()
		if sceneView.getActivityId and sceneView:getActivityId() == ActivityConst.ACT_ID_MONEY_TREE then
			return
		end
		sceneView:showMoneyTreeTab()
		return
	end
	local returnFunc = function()
		G_SceneManager:showScene("activity",ActivityConst.ACT_ID_MONEY_TREE )
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ACTIVITY_RESOURCE_BACK()
	local ActivityConst = require("app.const.ActivityConst")
	local returnFunc = function()
		G_SceneManager:showScene("activity",ActivityConst.ACT_ID_RESROUCE_BACK )
	end
	return returnFunc
end

function WayFuncConvert._FUNC_DAILY_SIGN()
	local ActivityConst = require("app.const.ActivityConst")
	local returnFunc = function()
		G_SceneManager:showScene("activity",ActivityConst.ACT_ID_SIGNIN )
	end
	return returnFunc
end


function WayFuncConvert._FUNC_TUTORIAL_JUMP_ARENA_AWARD()
	local ShopConst = require("app.const.ShopConst")
	local returnFunc = function()
		G_SceneManager:showScene("shop",ShopConst.ARENA_SHOP, ShopConst.ARENA_SHOP_SUB_AWARD )
	end
	return returnFunc
end



function WayFuncConvert._FUNC_WORLD_BOSS()

	local returnFunc = function()
		G_SceneManager:showScene("worldBoss")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_CHAT()
	local returnFunc = function(channel,chatPlayerData)
		local ChatConst = require("app.const.ChatConst")
		local chatMainView  = G_SceneManager:getRunningScene():getPopupByName("ChatMainView")
		if chatMainView then
			chatMainView:retain()
			chatMainView:removeFromParent()
			dump(chatPlayerData)
			chatMainView:refreshUI(channel,chatPlayerData)
			chatMainView:open()
			chatMainView:release()
		else
			local ChatMainView = require("app.scene.view.chat.ChatMainView")
			local popupChatMainView = ChatMainView.new(channel,
				chatPlayerData)
			popupChatMainView:open()
			popupChatMainView:setName("ChatMainView")
		end
	end
	return returnFunc
end

--领地援助
function WayFuncConvert._FUNC_RIOT_HELP()

	local returnFunc = function()
		-- G_SceneManager:showScene("territory")
		G_SceneManager:showDialog("app.scene.view.territory.PopupTerritoryRiotHelp")
	end
	return returnFunc
end
--巡逻奖励
function WayFuncConvert._FUNC_PATROL_AWARDS()

	local returnFunc = function()
		G_SceneManager:showScene("territory")
	end
	return returnFunc
end
--暴动奖励
function WayFuncConvert._FUNC_RIOT_AWARDS()

	local returnFunc = function()
		G_SceneManager:showScene("territory", true)
	end
	return returnFunc
end
--暴动发生
function WayFuncConvert._FUNC_RIOT_HAPPEN()

	local returnFunc = function()
		G_SceneManager:showScene("territory", true)

	end
	return returnFunc
end

--每周礼包
function WayFuncConvert._FUNC_WEEKLY_GIFTPKG()
	local ActivityConst = require("app.const.ActivityConst")
	local returnFunc = function()
		G_SceneManager:showScene("activity",ActivityConst.ACT_ID_WEEKLY_GIFT_PKG )
	end
	return returnFunc
end

--每日礼包
function WayFuncConvert._FUNC_LUXURY_GIFTPKG()
	local ActivityConst = require("app.const.ActivityConst")
	local returnFunc = function()
		G_SceneManager:showScene("activity",ActivityConst.ACT_ID_LUXURY_GIFT_PKG )
	end
	return returnFunc
end

--好友
function WayFuncConvert._FUNC_FRIEND()

	local returnFunc = function()
		G_SceneManager:showScene("friend")
	end
	return returnFunc
end

--合成
function WayFuncConvert._FUNC_SYNTHESIS()

	local returnFunc = function()
		G_SceneManager:showScene("synthesis")
	end
	return returnFunc
end

--老玩家回归
function WayFuncConvert._FUNC_RETURN()

	local returnFunc = function()
		if G_UserData:getReturnData():isActivityEnd() then
			G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
			return
		end
		G_SceneManager:showScene("return")
	end
	return returnFunc
end

--阵容推荐
function WayFuncConvert._FUNC_TEAM_SUGGEST()

	local returnFunc = function()
		G_SceneManager:showScene("teamSuggest")
	end
	return returnFunc
end


--军团捐献
function WayFuncConvert._FUNC_GUILD_CONTRIBUTION()
	local GuildConst = require("app.const.GuildConst")
	local returnFunc = function()
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			local GuildConst = require("app.const.GuildConst")
			local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
			if not LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_CONTRIBUTION_ID) then
				return
			end

			local sceneName = G_SceneManager:getRunningSceneName()
			if sceneName ~= "guild" then
				G_SceneManager:showScene("guild",GuildConst.CITY_CONTRIBUTION_ID)----军团贡献建筑ID
			else
				local view = G_SceneManager:getRunningScene():getSceneView()
				view:openBuild(GuildConst.CITY_CONTRIBUTION_ID)--军团贡献建筑ID
			end
		else
			G_SceneManager:showDialog("app.scene.view.guild.PopupGuildListView")
		end
	end
	return returnFunc
end

--军团战
function WayFuncConvert._FUNC_GUILD_FIGHT()
	local returnFunc = function()
	end
	return returnFunc
end

--军团副本
function WayFuncConvert._FUNC_GUILD_DUNGEON()
	local GuildConst = require("app.const.GuildConst")
	local returnFunc = function()
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			local GuildConst = require("app.const.GuildConst")
			local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
			if not LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_DUNGEON_ID) then--军团副本ID
				return
			end

			local sceneName = G_SceneManager:getRunningSceneName()
			if sceneName ~= "guild" then
				G_SceneManager:showScene("guild",GuildConst.CITY_DUNGEON_ID)
			else
				local view = G_SceneManager:getRunningScene():getSceneView()
				view:openBuild(GuildConst.CITY_DUNGEON_ID)
			end
		else
			G_SceneManager:showDialog("app.scene.view.guild.PopupGuildListView")
		end
	end
	return returnFunc
end

--军团求援
function WayFuncConvert._FUNC_GUILD_HELP()
	local returnFunc = function()
		logWarn(" ----------------------xxx  ")
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then

			local GuildConst = require("app.const.GuildConst")
			local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
			if not LogicCheckHelper.checkGuildModuleIsOpen(GuildConst.CITY_HELP_ID) then
				return
			end

			G_SceneManager:showScene("guildHelp")
		else
			G_SceneManager:showDialog("app.scene.view.guild.PopupGuildListView")
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_CROSS_WORLD_BOSS()
	local returnFunc = function(fromLayer)
		local availabelTime = G_UserData:getCrossWorldBoss():getShow_time()
		local endTime = G_UserData:getCrossWorldBoss():getEnd_time()
		local currTime = G_ServerTime:getTime()

		local userId = G_UserData:getBase():getId()
		local data = G_StorageManager:load("crossbossdata"..userId) or {}
		local currTime = G_ServerTime:getTime()
		local currDay = os.date("%d", currTime)

		local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")
		if data.day == currDay or (fromLayer == "DailyActivityHint" and CrossWorldBossHelper.checkIsTodayOver()) then
			G_SceneManager:replaceCurrentScene("crossworldboss")
		else
			local bossId = G_UserData:getCrossWorldBoss():getBoss_id()
			if bossId == nil or bossId == 0 then
				G_SceneManager:replaceCurrentScene("crossworldboss")
				return
			end

			local PopupCrossWorldBossSign = require("app.scene.view.crossworldboss.PopupCrossWorldBossSign").new()
			PopupCrossWorldBossSign:open()
		end
	end
	return returnFunc
end

--跨服矿战
function WayFuncConvert._FUNC_CROSS_MINE_CRAFT()
	local returnFunc = function()
		G_SceneManager:showScene("crossminecraft")
	end
	return returnFunc
end


--节日狂欢 活动
function WayFuncConvert._FUNC_CARNIVAL_ACTIVITY()
	local returnFunc = function(...)
		local PopupCarnivalActivity = require("app.scene.view.carnivalActivity.PopupCarnivalActivity")
		local popup = PopupCarnivalActivity.new()
		popup:openWithAction()
	end
	return returnFunc
end
-- 军团答题
function WayFuncConvert._FUNC_GUILD_ANSWER()
	local returnFunc = function(...)
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			-- G_SceneManager:showDialog("app.scene.view.guildAnswer.PopupGuildAnswer")
			G_SceneManager:showScene("guildAnswer")
		else
			G_Prompt:showTip(Lang.get("lang_guild_answer_no_guild"))
		end
		-- local PopupGuildAnswer = require("app.scene.view.guildAnswer.PopupGuildAnswer")
		-- local popup = PopupGuildAnswer.new()
		-- popup:openWithAction()
	end
	return returnFunc
end

-- 全服答题
function WayFuncConvert._FUNC_GUILD_SERVER_ANSWER()
	local returnFunc = function(...)
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			G_SceneManager:showScene("guildServerAnswer")
		else
			G_Prompt:showTip(Lang.get("lang_guild_answer_no_guild"))
		end
	end
	return returnFunc
end

--水晶商店
function WayFuncConvert._FUNC_CRYSTAL_SHOP()
	local returnFunc = function()
		G_SceneManager:showScene("crystalShop")
	end
	return returnFunc
end

--阵营竞技
function WayFuncConvert._FUNC_CAMP_RACE()
	local returnFunc = function()
		local isReplaced = require("app.scene.view.campRace.CampRaceHelper").isReplacedBySingleRace()
		if isReplaced then
			G_Prompt:showTip(Lang.get("camp_race_look_single_race_tip"))
		else
			G_SceneManager:showScene("campRace")
		end
	end
	return returnFunc
end

--阵营竞技新人王
function WayFuncConvert._FUNC_CAMP_RACE_CHAMPION()
	local returnFunc = function()
		G_SceneManager:showScene("campRace")
	end
	return returnFunc
end

--防沉迷
function WayFuncConvert._FUNC_AVOID_GAME()
	local returnFunc = function()
		G_RealNameService:openRealNameDlg()
	end
	return returnFunc
end


--水晶商店页签
function WayFuncConvert._FUNC_CRYSTAL_SHOP_TAB_RECHARGE()
	local returnFunc = function()
		G_SceneManager:showScene("crystalShop", 3)
	end
	return returnFunc
end

--组队
function WayFuncConvert._FUNC_GROUPS()
	local returnFunc = function()
		G_SceneManager:showScene("groups", FunctionConst.FUNC_MAUSOLEUM)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_CRYSTAL_SHOP_TAB_ACTIVE()
	local returnFunc = function()
		G_SceneManager:showScene("crystalShop", 1)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_CRYSTAL_SHOP_TAB_CAHRGE()
	local returnFunc = function()
		G_SceneManager:showScene("crystalShop", 2)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_LIST( ... )
	-- body
	local returnFunc = function()
		G_SceneManager:showScene("pet")
	end
	return returnFunc
end


function WayFuncConvert._FUNC_PET_HOME( ... )
	-- body
	local returnFunc = function ()
		G_SceneManager:showScene("petMain")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_TRAIN_TYPE2( ... )
	-- body
	local returnFunc = function ()
		G_SceneManager:showScene("pet")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_TRAIN_TYPE3( ... )
	-- body
	local returnFunc = function ()
		G_SceneManager:showScene("pet")
	end
	return returnFunc
end


function WayFuncConvert._FUNC_PET_HELP( ... )
	-- body
	local returnFunc = function ()
		local PetConst = require("app.const.PetConst")
		local popupDlg = require("app.scene.view.petMain.PopupPetAttrAdd").new(PetConst.PET_DLG_HELP_ADD)
		popupDlg:openWithAction()
		--G_SceneManager:showDialog("app.scene.view.petMain.PopupPetAttrAdd",PetConst.PET_DLG_HELP_ADD)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_HAND_BOOK_ADD( ... )
	-- body
	local returnFunc = function ()
		local PetConst = require("app.const.PetConst")

		local popupDlg = require("app.scene.view.petMain.PopupPetAttrAdd").new(PetConst.PET_DLG_MAP_ADD)
		popupDlg:openWithAction()
		--G_SceneManager:showDialog("app.scene.view.petMain.PopupPetAttrAdd",PetConst.PET_DLG_MAP_ADD)
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_HAND_BOOK( ... )
	-- body
	local returnFunc = function ()
		G_SceneManager:showScene("petHandBook")
	end
	return returnFunc
end


function WayFuncConvert._FUNC_PET_TEAM_SLOT( ... )
	-- body
	local petTeamId = G_UserData:getBase():getOn_team_pet_id()


	return WayFuncConvert._FUNC_TEAM_SLOT1(7)

end

function WayFuncConvert._FUNC_PET_HELP_SLOT1(pos)
	pos = pos or 1
	local petList = G_UserData:getTeam():getPetIdsInHelpWithZero()
	local petId = petList[pos]
	dump(petId)
	if petId and petId > 0 then
		local returnFunc = function(...)
			local PetConst = require("app.const.PetConst")
			logWarn(" _FUNC_TEAM_SLOT  G_SceneManager:showScene(team) pos : "..pos)
			G_SceneManager:showScene("petDetail",petId,PetConst.PET_RANGE_TYPE_3)
		end
		return returnFunc
	else
		local function changePetCallBack(petId, param, petData)
			G_UserData:getPet():c2sPetOnTeam(petId,2, pos-1)
		end
		
		local returnFunc = function ()
			local PopupChoosePet = require("app.ui.PopupChoosePet")
			local PopupChoosePetHelper = require("app.ui.PopupChoosePetHelper")

			local isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE3, {petId})
			if isEmpty then
				G_Prompt:showTip(Lang.get("pet_popup_list_empty_tip"..PopupChoosePetHelper.FROM_TYPE3))
			else
				local PopupChoosePet = PopupChoosePet.new()
				PopupChoosePet:setTitle(Lang.get("pet_help_replace_title"))
				PopupChoosePet:updateUI(PopupChoosePetHelper.FROM_TYPE3, changePetCallBack, petId)
				PopupChoosePet:openWithAction()
			end

		end
		return returnFunc
	end
end

function WayFuncConvert._FUNC_PET_HELP_SLOT2()
	return WayFuncConvert._FUNC_PET_HELP_SLOT1(2)
end
function WayFuncConvert._FUNC_PET_HELP_SLOT3()
	return WayFuncConvert._FUNC_PET_HELP_SLOT1(3)
end
function WayFuncConvert._FUNC_PET_HELP_SLOT4()
	return WayFuncConvert._FUNC_PET_HELP_SLOT1(4)
end
function WayFuncConvert._FUNC_PET_HELP_SLOT5()
	return WayFuncConvert._FUNC_PET_HELP_SLOT1(5)
end
function WayFuncConvert._FUNC_PET_HELP_SLOT6()
	return WayFuncConvert._FUNC_PET_HELP_SLOT1(6)
end

function WayFuncConvert._FUNC_PET_HELP_SLOT7()
	return WayFuncConvert._FUNC_PET_HELP_SLOT1(7)
end

function WayFuncConvert._FUNC_RECHARGE_REBATE()
	local returnFunc = function(...)
		local PopupRechargeRebate = require("app.ui.PopupRechargeRebate").new()
		PopupRechargeRebate:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_SILKBAG()
	local returnFunc = function ()
		G_SceneManager:showScene("silkbag")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_AVATAR_MORE_BTN()
	local returnFunc = function ()
		G_SceneManager:showScene("avatar")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_AVATAR_ACTIVITY()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getAvatarActivity()
		if actUnitData and G_UserData:getCustomActivity():isAvatarActivityVisible() then
			local CustomActivityView = require("app.scene.view.customactivity.CustomActivityView")
			local popup = CustomActivityView.new(actUnitData:getAct_id())
			popup:openWithAction()
		else
			G_Prompt:showTip(Lang.get("customactivity_avatar_act_not_open"))
		end
	end
	return returnFunc

end

function WayFuncConvert._FUNC_AVATAR_ACTIVITY_SHOP()
	local returnFunc = function(...)
		G_SceneManager:showScene("avatarShop")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_EQUIP_ACTIVITY()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getEquipActivity()
		if actUnitData and G_UserData:getCustomActivity():isEquipActivityVisible() then
			local CustomActivityView = require("app.scene.view.customactivity.CustomActivityView")
			local popup = CustomActivityView.new(actUnitData:getAct_id())
			popup:openWithAction()
		else
			G_Prompt:showTip(Lang.get("customactivity_equip_act_not_open"))
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_EQUIP_ACTIVITY_SHOP()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getEquipActivity()
		if actUnitData and G_UserData:getCustomActivity():isEquipActivityVisible() then
			G_SceneManager:showScene("equipActiveShop")
		else
			G_Prompt:showTip(Lang.get("customactivity_equip_act_not_open"))
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_ACTIVITY()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getPetActivity()
		if actUnitData and G_UserData:getCustomActivity():isPetActivityVisible() then
			local CustomActivityView = require("app.scene.view.customactivity.CustomActivityView")
			local popup = CustomActivityView.new(actUnitData:getAct_id())
			popup:openWithAction()
		else
			G_Prompt:showTip(Lang.get("customactivity_pet_act_not_open"))
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_PET_ACTIVITY_SHOP()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getPetActivity()
		if actUnitData and G_UserData:getCustomActivity():isPetActivityVisible() then
			G_SceneManager:showScene("petActiveShop")
		else
			G_Prompt:showTip(Lang.get("customactivity_pet_act_not_open"))
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RED_PET_SHOP()
	local returnFunc = function(...)
		if G_UserData:getRedPetData():isActivityOpen() then
			G_SceneManager:showScene("redPetShop")
		else
			G_Prompt:showTip(Lang.get("customactivity_pet_act_not_open"))
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_HORSE_CONQUER_ACTIVITY()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getHorseConquerActivity()
		if actUnitData and G_UserData:getCustomActivity():isHorseConquerActivityVisible() then
			local CustomActivityView = require("app.scene.view.customactivity.CustomActivityView")
			local popup = CustomActivityView.new(actUnitData:getAct_id())
			popup:openWithAction()
		else
			G_Prompt:showTip(Lang.get("customactivity_horse_conquer_act_not_open"))
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_HORSE_CONQUER_ACTIVITY_SHOP()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getHorseConquerActivity()
		if actUnitData and G_UserData:getCustomActivity():isHorseConquerActivityVisible() then
			G_SceneManager:showScene("horseConquerActiveShop")
		else
			G_Prompt:showTip(Lang.get("customactivity_horse_conquer_act_not_open"))
		end
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RUNNING_MAN( ... )
	-- body
	logWarn("WayFuncConvert._FUNC_RUNNING_MAN")
	local  returnFunc = function ( ... )
		-- body
		G_SceneManager:showScene("runningMan")
	end
	return returnFunc
end

--分享跳转
function WayFuncConvert._FUNC_SHARE_GO( ... )
	-- body
	local  returnFunc = function ( ... )
		local PopupShare = require("app.scene.view.share.PopupShare")
		local popup = PopupShare.new()
		popup:open()
		popup:setPosition(G_ResolutionManager:getDesignCCPoint())
	end
	return returnFunc
end

function WayFuncConvert._FUNC_RUNNING_BET( ... )
	-- body
	logWarn("WayFuncConvert.FUNC_RUNNING_BET")
	local  returnFunc = function ( ... )
		local PopupRunningMan = require("app.scene.view.runningMan.PopupRunningMan")
		local popup = PopupRunningMan.new()
		popup:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_ENEMY_REVENGE_LOG( ... )
	-- body
	local  returnFunc = function ( ... )
		local FriendConst = require("app.const.FriendConst")
		G_SceneManager:showScene("friend", FriendConst.ENEMY_LIST, true)
	end
	return returnFunc
end


function WayFuncConvert._FUNC_HOMELAND( ... )
	-- body
	logWarn("WayFuncConvert._FUNC_HOMELAND")
	local  returnFunc = function ( ... )
		-- body
		G_SceneManager:showScene("homeland")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_COUNTRY_BOSS()
	local  returnFunc = function ( ... )
		local isInGuild = G_UserData:getGuild():isInGuild()
		if not isInGuild then
			G_Prompt:showTip(Lang.get("country_boss_no_guild_tip"))
			return
		end
		local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
		CountryBossHelper.enterCountryBossView()
	end
	return returnFunc
end
--手杀联动(三国杀)
function WayFuncConvert._FUNC_LINKAGE_ACTIVITY()
	local returnFunc = function()
		--local PopupLinkageActivity = require("app.ui.PopupLinkageActivity").new()
		--PopupLinkageActivity:open()

		local PopupSgsActivity = require("app.scene.view.linkedactivity.PopupSgsActivity").new()
		PopupSgsActivity:open()

	end
	return returnFunc
end

--手杀联动(三国杀online)
function WayFuncConvert._FUNC_LINKAGE_ACTIVITY2()
	local returnFunc = function()
		local PopupLinkageActivity = require("app.ui.PopupLinkageActivity").new()
		PopupLinkageActivity:open()
	end
	return returnFunc
end


function WayFuncConvert._FUNC_GUILD_WAR()
	local returnFunc = function()
		G_SceneManager:showScene("guildwar" )
	end
	return returnFunc
end


function WayFuncConvert._FUNC_CHAPTER_BOSS()
	local returnFunc = function()
		local chapterData = G_UserData:getChapter()
		local bossChapters = chapterData:getBossChapters()
		if #bossChapters ~= 0 then
			local popupBossCome = require("app.scene.view.chapter.PopupBossCome").new(bossChapters)
			popupBossCome:open()
		end

	end
	return returnFunc
end

function WayFuncConvert._FUNC_HORSE()
	local returnFunc = function()
		G_SceneManager:showScene("horse")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_HORSE_RACE()
	local returnFunc = function()
		G_SceneManager:showScene("horseRace")
	end
	return returnFunc	
end


function WayFuncConvert._FUNC_MAUSOLEUM()
	local returnFunc = function ()
		-- body
		G_SceneManager:showScene("qinTomb")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_HORSE_JUDGE()
	local returnFunc = function()
		G_SceneManager:showScene("horseJudge")
	end
	return returnFunc
end

-- 无差别竞技
function WayFuncConvert._FUNC_SEASONSOPRT( ... )
	-- body
	local returnFunc = function ( ... )
		-- body
		G_SceneManager:showScene("seasonSport")
	end
	return returnFunc
end

-- 金将招募
function WayFuncConvert._FUNC_GACHA_GOLDENHERO( ... )
	-- body
	local returnFunc = function ( ... )
		-- body
		G_SceneManager:showScene("gachaGoldenHeroChooseZhenyin")
	end
	return returnFunc
end

-- 红神兽
function WayFuncConvert._FUNC_RED_PET( ... )
	-- body
	local returnFunc = function ( ... )
		-- body
		G_SceneManager:showScene("redPet")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_SUPER_VIP( ... )
	-- body
	local returnFunc = function ( ... )
		-- body
		G_SceneManager:showDialog("app.scene.view.svip.PopupSvipContact")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_SUPER_VIP_2( ... )
	-- body
	local returnFunc = function ( ... )
		-- body
		G_SceneManager:showDialog("app.scene.view.svip.PopupSvipContact2")
	end
	return returnFunc
end

function WayFuncConvert._FUNC_OPPO_FORUM( ... )
    local returnFunc = function ( ... )
        if G_NativeAgent:hasForum() then 
            G_NativeAgent:openForum()
        end
    end
    return returnFunc
end

function WayFuncConvert._FUNC_HORSE_JUDGE_ACTIVITY()
	local returnFunc = function(...)
		local actUnitData = G_UserData:getCustomActivity():getHorseJudgeActivity()
		if actUnitData and G_UserData:getCustomActivity():isHorseJudgeActivityVisible() then
			local CustomActivityView = require("app.scene.view.customactivity.CustomActivityView")
			local popup = CustomActivityView.new(actUnitData:getAct_id())
			popup:openWithAction()
		else
			G_Prompt:showTip(Lang.get("customactivity_horse_judge_act_not_open"))
		end
	end
	return returnFunc
end


function WayFuncConvert._FUNC_RICH_MAN_INFO_COLLECT( ... )
	-- body
	local returnFunc = function ( ... )
		-- body
		G_SceneManager:showDialog("app.scene.view.svip.PopupSvipInfoRegiste")
	end
	return returnFunc
end


--历代名将
function WayFuncConvert._FUNC_HISTORY_HERO()
	local returnFunc = function(pos)
		G_SceneManager:showScene("historyheroTrain", pos)
	end
	return returnFunc
end

--历代名将列表
function WayFuncConvert._FUNC_HISTORY_HERO_LIST()
	local returnFunc = function(...)
		G_SceneManager:showScene("historyherolist")
	end
	return returnFunc
end

--历代名将武器列表
function WayFuncConvert._FUNC_HISTORY_WEAPON_LIST()
	local returnFunc = function(...)
		G_SceneManager:showScene("historyherolist")
	end
	return returnFunc
end

--武器碎片列表
function WayFuncConvert._FUNC_HISTORY_WEAPONPIECE_LIST()
	local returnFunc = function(...)
		--弹出获取途径
		local HistoryHeroConst = require("app.const.HistoryHeroConst")
		local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
		local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(HistoryHeroConst.DEFAULT_HISTORY_HERO_ID, 1)
		local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		PopupItemGuider:updateUI(heroStepInfo.type_1, heroStepInfo.value_1)
		PopupItemGuider:openWithAction()
	end
	return returnFunc
end

--历代名将上阵
function WayFuncConvert._FUNC_HISTORY_FORMATION()
	local returnFunc = function(...)
		G_SceneManager:showScene("historyhero")
	end
	return returnFunc
end

--跨服个人竞技
function WayFuncConvert._FUNC_SINGLE_RACE()
	local returnFunc = function(...)
		G_SceneManager:showScene("singleRace")
	end
	return returnFunc
end

--跨服个人竞技冠军
function WayFuncConvert._FUNC_SINGLE_RACE_CHAMPION()
	local returnFunc = function(...)
		G_SceneManager:showScene("singleRace")
	end
	return returnFunc
end

--真武战神
function WayFuncConvert._FUNC_UNIVERSE_RACE()
	local returnFunc = function(...)
		G_SceneManager:showScene("universeRace")
	end
	return returnFunc
end

--真武战神冠军
function WayFuncConvert._FUNC_UNIVERSE_RACE_CHAMPION()
	local returnFunc = function(...)
		G_SceneManager:showScene("universeRace")
	end
	return returnFunc
end

--真武战神商店
function WayFuncConvert._FUNC_UNIVERSE_RACE_SHOP(tabIndex)
	local returnFunc = function(...)
		G_SceneManager:showScene("universeRaceShop", tabIndex)
	end
	return returnFunc
end

--跨服军团战
function WayFuncConvert._FUNC_GUILD_CROSS_WAR( ... )
	-- body
	local returnFunc = function(...)
		G_SceneManager:showScene("guildCrossWar")
	end
	return returnFunc
end

-- 玉魂
function WayFuncConvert._FUNC_EQUIP_TRAIN_TYPE3( ... )
	-- body
	local returnFunc = function(...)
		local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) then
			return
		end
		-- local sceneName = G_SceneManager:getRunningSceneName()
		-- -- logWarn("WayFuncConvert._FUNC_EQUIP_TRAIN_TYPE3 "..scenename)
		-- if sceneName~="package" then
		local PackageHelper = require("app.scene.view.package.PackageHelper")
		local PackageViewConst = require("app.const.PackageViewConst")
		local tabIndex = PackageHelper.getPackTabIndex(PackageViewConst.TAB_JADESTONE) or 1
		G_SceneManager:showScene("package",tabIndex)  -- 跳到
		-- else
		-- 	G_Prompt:showTip("")
		-- end
	end
	return returnFunc
end

-- 军团演武列表
function WayFuncConvert._FUNC_TRAIN_MEMBER_LIST( ... )
	local returnFunc = function ( ... )
		-- body
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild then
			local PopupGuildHall = require("app.scene.view.guild.PopupGuildHall").new()
			PopupGuildHall:openWithAction()
			PopupGuildHall:onTabSelect(2)
		else
			G_SceneManager:showDialog("app.scene.view.guild.PopupGuildListView")
		end
	end
	return returnFunc

end

--红包雨
function WayFuncConvert._FUNC_RED_PACKET_RAIN()
	local returnFunc = function(...)
		local RedPacketRainConst = require("app.const.RedPacketRainConst")
		local openTime = G_UserData:getRedPacketRain():getActOpenTime()
		local endTime = G_UserData:getRedPacketRain():getActEndTime()
		local curTime = G_ServerTime:getTime()
		if curTime >= openTime and curTime < endTime then
			-- if G_UserData:getRedPacketRain():isPlayed() then
			-- 	G_Prompt:showTip(Lang.get("red_packet_rain_act_played_tip"))
			-- else
			G_SceneManager:showScene("redPacketRain")
			-- end
		else
			local hour, min = G_ServerTime:getCurrentHHMMSS(openTime)
			G_Prompt:showTip(Lang.get("red_packet_rain_act_start_tip", {hour = hour, min = min}))
		end
	end
	return returnFunc
end

--蛋糕活动
function WayFuncConvert._FUNC_CAKE_ACTIVITY()
	local returnFunc = function(...)
		local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
		local curTime = G_ServerTime:getTime()
		local startTime = CakeActivityDataHelper.getAllServerStageStartTime()
		if curTime >= startTime-2 and curTime <= startTime then --防止临界时间点进去出现bug，做个2秒钟的保护
			return
		end
		G_SceneManager:showScene("cakeActivity")
	end
	return returnFunc
end

--蛋糕商店
function WayFuncConvert._FUNC_CAKE_ACTIVITY_SHOP()
	local returnFunc = function(...)
		local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CAKE_ACTIVITY_SHOP) then
			return
		end
		local CakeActivityConst = require("app.const.CakeActivityConst")
		local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
		local actStage = CakeActivityDataHelper.getActStage()
		if actStage == CakeActivityConst.ACT_STAGE_0 then
			G_Prompt:showTip(Lang.get("cake_activity_act_end_tip"))
		else
			G_SceneManager:showScene("cakeActivityShop")
		end
	end
	return returnFunc
end

--暗度陈仓
function WayFuncConvert._FUNC_GRAIN_CAR()
	local returnFunc = function(...)
		local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_GRAIN_CAR) then
			return
		end
		local signal = nil
		local sceneName = G_SceneManager:getRunningSceneName()
		if sceneName ~= "mineCraft" then
			local function onMsgCallBack()
				G_SceneManager:showScene("mineCraft", nil, true) -- 打开粮车捐献对话框
				signal:remove()
                signal = nil
			end
			G_UserData:getGrainCar():c2sGetGrainCarInfo()
			signal = G_SignalManager:add(SignalConst.EVENT_GRAIN_CAR_GET_INFO, onMsgCallBack)
		else
			G_SceneManager:showDialog("app.scene.view.grainCar.PopupGrainCarDonate")
		end
	end
	return returnFunc
end

--一元拍卖
function WayFuncConvert._FUNC_TEN_JADE_AUCTION()
	local returnFunc = function(...)
		local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
		if not LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TEN_JADE_AUCTION) then
			return
		end
		G_SceneManager:showScene("tenJadeAuction")
	end
	return returnFunc
end

--回归服-回归确认
function WayFuncConvert._FUNC_RETURN_CONFIRM()
	local returnFunc = function(...)
		local UIPopupHelper = require("app.utils.UIPopupHelper")
		UIPopupHelper.popupReturnConfirm()
	end
	return returnFunc
end

--回归服-返利
function WayFuncConvert._FUNC_RETURN_AWARD()
	local returnFunc = function(...)
		local popup = require("app.scene.view.returnServer.PopupReturnAward").new()
		popup:openWithAction()
	end
	return returnFunc
end

function WayFuncConvert._FUNC_TACTICS()
	local returnFunc = function()
		G_SceneManager:showScene("tactics")
	end
	return returnFunc
end

--阵法
function WayFuncConvert._FUNC_BOUT()
	local returnFunc = function()
		G_SceneManager:showScene("bout")
	end
	return returnFunc
end

--晋将招募
function WayFuncConvert._FUNC_GACHA_JIN( ... )
	-- body
	local returnFunc = function ( ... )
		-- body
		G_SceneManager:showScene("gachaJin")
	end
	return returnFunc
end

--福利-等级礼包
function WayFuncConvert._FUNC_WELFARE_LEVELGIFT( ... )
    -- body
    local ActivityConst = require("app.const.ActivityConst")
	local returnFunc = function ( ... )
        -- body
        G_UserData:getActivityLevelGiftPkg():setIsCurLoginEntry(true)
        G_SceneManager:showScene("activity",ActivityConst.ACT_ID_LEVEL_GIFT_PKG)
	end
	return returnFunc
end

-- 玩法-敦煌迷窟
function WayFuncConvert._FUNC_MAZE( ... )
	local returnFunc = function ( ... )
        G_SceneManager:showScene("mazeMain")
	end
	return returnFunc
end

--背包合并
function WayFuncConvert._FUNC_ICON_MERGE()
    local returnFunc = function(...)
		local sceneName = G_SceneManager:getRunningSceneName()
		if sceneName == "main" then
			local MainMenuLayer = G_SceneManager:getRunningScene():getSubNodeByName("MainMenuLayer")
			if MainMenuLayer then
				MainMenuLayer:onBagMergeBtn()
			end
		end
	end
	return returnFunc
end

--T恤活动
function WayFuncConvert:_FUNC_TSHIRT()
	local returnFunc = function()
		G_SceneManager:showDialog("app.scene.view.tshirt.PopupTShirtView")
	end
	return returnFunc
end

--金色变身卡
function WayFuncConvert._FUNC_GACHA_GOLDEN_AVATAR()

	local returnFunc = function()
		if G_UserData:getGachaGoldenAvatar():canShow() then
			G_SceneManager:showScene("gachaGoldenAvatar")
		else
			G_Prompt:showTip(Lang.get("customactivity_avatar_act_not_open"))
		end
	end
	return returnFunc
end

--限时累充
function WayFuncConvert._FUNC_SEVEN_DAY_RECHARGE()
	local returnFunc = function(...)
		local popup = require("app.scene.view.day7Recharge.PopupDay7Recharge").new()
		popup:openWithAction()
	end
	return returnFunc
end

return WayFuncConvert
