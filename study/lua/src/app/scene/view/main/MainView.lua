local ViewBase = require("app.ui.ViewBase")
local MainView = class("MainView", ViewBase)

local FunctionLevel = require("app.config.function_level")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AudioConst = require("app.const.AudioConst")
local MainUIHelper = require("app.scene.view.main.MainUIHelper")

MainView.DELAY_MUSIC_TIME = 2 -- 音乐延迟时间

function MainView:ctor()
	self._playerName = nil -- 玩家名称
	self._playerLevel = nil
	self._playerVip = nil
	self._imageVit = nil
	self._btnChallenge = nil --挑战按钮
    self._nodeMenu = nil

	self._isNewMusic = false -- 是否播放新音乐

	local resource = {
		file = Path.getCSB("MainView", "main"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_imageVit = {
				events = {{event = "touch", method = "_onBtnVit"}}
			}
		}
	}
	self:setName("MainView")
	MainView.super.ctor(self, resource)
end

function MainView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	if self._topBarList then
		self._topBarList:updateUI(TopBarStyleConst.STYLE_MAIN, false)
	end
	local UIActionHelper = require("app.utils.UIActionHelper")
	UIActionHelper.playBlinkEffect(self._imageVit)

	-- G_GameAgent:getRealNameState()
	-- local isAvoid = G_ConfigManager:isAvoidHooked()
end

function MainView:onEnter()
	G_GameAgent:checkReturnEvent()
	
	if not G_GameAgent:isRealName() then
		G_GameAgent:getRealNameState(
			function()
				G_UserData:getBase():checkRealName()
			end
		)
	end

	local TopBarStyleConst = require("app.const.TopBarStyleConst")
    if self._topBarList then
        local FunctionCheck = require("app.utils.logic.FunctionCheck")
        local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_JADE2)
        local topbarConst = isOpen and TopBarStyleConst.STYLE_MAIN2 or TopBarStyleConst.STYLE_MAIN
		self._topBarList:updateUI(topbarConst, false)
	end
    G_AudioManager:openMainMusic(true)

	local mainLayer = self._nodeMenu:getChildByName("MainMenuLayer")
	if mainLayer == nil then
		local mainLayer = require("app.scene.view.main.MainMenuLayer").new()
		mainLayer:setName("MainMenuLayer")
		self._nodeMenu:addChild(mainLayer)
	end

	if mainLayer and mainLayer.updateAll then
	--	mainLayer:updateAll()
	end

	local mainAvatorsNode = self:getEffectLayer(ViewBase.Z_ORDER_GRD_BACK + 1):getChildByName("MainAvatorsNode")
	if mainAvatorsNode == nil then
		local mainAvatorsNode = require("app.scene.view.main.MainAvatorsNode").new()
		mainAvatorsNode:setName("MainAvatorsNode")
		self:getEffectLayer(ViewBase.Z_ORDER_GRD_BACK + 1):addChild(mainAvatorsNode)
	end

	self._signalActDinnerResignin =
		G_SignalManager:add(SignalConst.EVENT_ACT_DINNER_RESIGNIN, handler(self, self._onSignalActDinnerResignin))
	self:_refreshResignVit()

	local currSceneId = MainUIHelper.getCurrShowSceneId()
	if self._currSceneId ~= currSceneId then
		self._currSceneId = currSceneId
		logWarn("MainView change sceneid " .. tostring(currSceneId))
		self:updateSceneId(currSceneId)
	end

	--抛出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)

	-- local function testacc(event, x, y, z, timestamp)
	--     print("1112233 acc", event, x, y, z, timestamp)
	-- end
	-- self:addAccelerationEvent

	-- -- 创建一个重力加速计事件监听器
	-- local layer = cc.Layer:create()
	-- self:addChild(layer)
	-- layer:setAccelerometerEnabled(true)
	-- local function testacc(event, x, y, z, timestamp)
	--     print("1112233 acc", event, x, y, z, timestamp)
	-- end
	-- local listerner  = cc.EventListenerAcceleration:create(testacc)
	-- -- 获取事件派发器然后设置触摸绑定到精灵，优先级为默认的0
	-- layer:getEventDispatcher():addEventListenerWithSceneGraphPriority(listerner, self)
end

function MainView:onExit()
	self._signalActDinnerResignin:remove()
    self._signalActDinnerResignin = nil
end

-- -- 切换背景音乐
-- function MainView:_changeMusic()
-- 	self._isNewMusic = not self._isNewMusic
-- 	local musicId = self._isNewMusic and AudioConst.MUSIC_BGM_NEW_CITY or AudioConst.MUSIC_CITY
-- 	G_AudioManager:playMusicWithId(musicId)
-- end

function MainView:_onSignalActDinnerResignin(eventName, miss)
	self:_refreshResignVit(miss)
end

function MainView:_refreshResignVit(miss)
	local missDinner = miss or G_UserData:getActivityDinner():hasMissEatDinner()
	self._imageVit:setVisible(missDinner)
end

--
function MainView:isRootScene()
	return true
end

function MainView:_onBtnVit()
	local UIPopupHelper = require("app.utils.UIPopupHelper")
	UIPopupHelper.popupResigninUI()
end

return MainView
