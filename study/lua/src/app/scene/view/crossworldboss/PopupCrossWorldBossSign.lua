--
-- Author: hyl
-- Date: 2019-10-11 14:20:20
-- 跨服军团boss

local PopupBase = require("app.ui.PopupBase")
local PopupCrossWorldBossSign = class("PopupCrossWorldBossSign", PopupBase)

local UserDataHelper = require("app.utils.UserDataHelper")
local AudioConst = require("app.const.AudioConst")

local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")

local scheduler = require("cocos.framework.scheduler")

local CrossWorldBossHelper = import(".CrossWorldBossHelper")
local CrossWorldBossConst = require("app.const.CrossWorldBossConst")


function PopupCrossWorldBossSign:ctor(type, index)
    self._playerAvatars = {}

	local resource = {
		file = Path.getCSB("PopupCrossWorldBossSign", "crossworldboss"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_goBtn = {
				events = {{event = "touch", method = "_onBtnGo"}}
			},
		}
    }

	PopupCrossWorldBossSign.super.ctor(self, resource, false, false)
end

function PopupCrossWorldBossSign:onCreate()
	-- self:_showProgressEffect()
	-- self:_playFire()
	-- self:_initPreAwardPanel()
	self._labelCountdown:setVisible(false)

	self._btnClose:addClickEventListenerEx(handler(self, self._closeCallback))

	self._imgHelpBtn:addClickEventListenerEx(handler(self, self._onHelpBtn))
end

function PopupCrossWorldBossSign:_startRefreshHandler()
	self:_endRefreshHandler()

	local isAvailabel = G_UserData:getCrossWorldBoss():isActivityAvailable()
	if isAvailabel == true then
		self._labelCountdown:setVisible(false)
		self:_playBtnEffect()
        return true
    end

	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return 
    end
	
	self._labelCountdown:setVisible(true)
    self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick), 1)
end

function PopupCrossWorldBossSign:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function PopupCrossWorldBossSign:_playBtnEffect(  )
	self._btnEffectNode:removeAllChildren()
	self._btnEffectNode:setScale(1.2)
	G_EffectGfxMgr:createPlayGfx(self._btnEffectNode, "effect_youxiangtishi_b")
end

function PopupCrossWorldBossSign:_onRefreshTick()
	local isAvailabel, availableTime = G_UserData:getCrossWorldBoss():isActivityAvailable()
	local message = G_ServerTime:getLeftSecondsString(availableTime or 0)

	if isAvailabel == true then
		self._labelCountdown:setVisible(false)
		self:_endRefreshHandler()
		--G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
		self:_playBtnEffect()
		return
	end

	self._labelCountdown:setString(message)
end

function PopupCrossWorldBossSign:_onHelpBtn(  )
    local UIPopupHelper = require("app.utils.UIPopupHelper")
	UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_CROSS_WORLD_BOSS)
end

function PopupCrossWorldBossSign:_playFire()
	self._nodeFire:removeAllChildren()
	local effectName = "effect_tujietiaozi_2"
	
	local effect = EffectGfxNode.new(effectName)
	self._nodeFire:addChild(effect)
	effect:play()
end

function PopupCrossWorldBossSign:_initPreAwardPanel(  )
    local rewards = CrossWorldBossHelper.getPreviewRewards()
    self._commonListViewItem:updateUI(rewards)
    self._commonListViewItem:setMaxItemSize(5)
    self._commonListViewItem:setListViewSize(410,100)
    self._commonListViewItem:setItemsMargin(2)
end

function PopupCrossWorldBossSign:_showProgressEffect(  )
	-- local stencil = cc.Node:create()
	-- local image = display.newSprite((Path.getGuide(tostring("mask"))))
	-- image:setContentSize(cc.size(1136, 600))
	-- stencil:addChild(image)

	-- local clippingNode = cc.ClippingNode:create()
	-- clippingNode:setStencil(stencil)  

	-- local contentSize = G_ResolutionManager:getDesignCCSize()
	-- local effectNode = cc.Node:create()
	
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar2", "common"))

	local bossHeroId = CrossWorldBossHelper.getBossHeroId()
	
	if bossHeroId then
		avatar:updateUI(bossHeroId)
		avatar:setAvatarScale(0.6)
		avatar:setPosition(cc.p(0, -281))
		--effectNode:addChild(avatar)
	end
	
	
	-- clippingNode:setInverted(false)
	-- clippingNode:setAlphaThreshold(0.5)
	-- clippingNode:setName("clippingNode")
	-- clippingNode:addChild(effectNode)

	self._avatarNode:addChild(avatar)

	local x, y = self._imgBg:getPosition()

	if bossHeroId == 450 then
		self._avatarNode:setPosition(cc.p(x + 10, y + 40))
	else
		self._avatarNode:setPosition(cc.p(x + 10, y + 20))
	end
end

function PopupCrossWorldBossSign:onEnter()
	self._signalEnterBossInfo = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, handler(self, self._onEventGetInfo))

	--local isAvailabel = G_UserData:getCrossWorldBoss():isActivityAvailable()
	--if isAvailabel then
		--G_UserData:getCrossWorldBoss():c2sEnterCrossWorldBoss()
	--end

	self._avatarNameImg:setVisible(false)
	self._desImg:setVisible(false)

	local bossConfigInfo = CrossWorldBossHelper.getBossInfo()

	if bossConfigInfo then
		local bossConfigId = bossConfigInfo.id
		self._avatarNameImg:setVisible(true)
		self._avatarNameImg:loadTexture(Path.getGoldHeroTxt(CrossWorldBossConst.DRAW_HERO_MINGZI[bossConfigId]))
		self._desImg:setVisible(true)
		self._desImg:loadTexture(Path.getGoldHeroTxt(CrossWorldBossConst.DRAW_HERO_DESC[bossConfigId]))
	end

	self:_showProgressEffect()
	self:_playFire()
	self:_initPreAwardPanel()
	self:_initCampPanel()
	self:_startRefreshHandler()

	self:_onRefreshTick()
end

function PopupCrossWorldBossSign:onExit()
	scheduler.performWithDelayGlobal(function()
		sp.SpineCache:getInstance():removeUnusedSpines()
		--cc.SpriteFrameCache:getInstance():removeUnusedSpriteFrames()
		cc.Director:getInstance():getTextureCache():removeUnusedTextures()
		collectgarbage("collect")
	end, 0.5)

	self:_endRefreshHandler()

	self._signalEnterBossInfo:remove()
    self._signalEnterBossInfo = nil
end

function PopupCrossWorldBossSign:_initCampPanel(  )
    local selfCamp = G_UserData:getCrossWorldBoss():getSelf_camp()

	if selfCamp and selfCamp ~= 0 then
        self._nextTips:setVisible(false)
        self._campInfo:setVisible(true)

        local myCampIconPath = CrossWorldBossHelper.getCampIconPathById(selfCamp)
        self._imageMy:loadTexture(myCampIconPath)

        local bossId = G_UserData:getCrossWorldBoss():getBoss_id()
		local bossInfo = CrossWorldBossHelper.getBossConfigInfo(bossId)
		
		if bossInfo then
			local pozhaoCamp = CrossWorldBossHelper.getPozhaoCampByBossId(bossInfo.id)
			local pozhaoCampIconPath = CrossWorldBossHelper.getCampIconPathById(pozhaoCamp)
			self._imagePoZhao:loadTexture(pozhaoCampIconPath)
		end
    else
        self._nextTips:setVisible(true)
        self._campInfo:setVisible(false)
    end
end

function PopupCrossWorldBossSign:_onEventGetInfo(  )
	-- self:_showProgressEffect()
	-- self:_playFire()
	-- self:_initPreAwardPanel()
	-- self:_initCampPanel()
	-- self:_startRefreshHandler()
end

function PopupCrossWorldBossSign:_closeCallback(  )
	self:close()
end

function PopupCrossWorldBossSign:_onBtnGo(  )
	local isOpen = G_UserData:getCrossWorldBoss():isActivityAvailable()
	if isOpen == false then
		G_Prompt:showTip(Lang.get("country_boss_open_tip"))
		return
	end

	self:close()
    G_SceneManager:replaceCurrentScene("crossworldboss")
end

return PopupCrossWorldBossSign