-- Author: conley
-- Date:2018-11-23 17:08:13
-- Rebuilt By Panhoa

local ViewBase = require("app.ui.ViewBase")
local HistoryHeroView = class("HistoryHeroView", ViewBase)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
local HistoryHeroConst = require("app.const.HistoryHeroConst")
local TeamConst = require("app.const.TeamConst")
local CSHelper = require("yoka.utils.CSHelper")
local HistoryHeroDetaillLayer = require("app.scene.view.historyhero.HistoryHeroDetaillLayer")
local HistoryHeroPosItemCell = require("app.scene.view.historyhero.HistoryHeroPosItemCell")
local HistoryHeroAvatarItemCell = require("app.scene.view.historyhero.HistoryHeroAvatarItemCell")
local HistoryHeroBookView = require("app.scene.view.historyhero.HistoryHeroBookView")


function HistoryHeroView:ctor(baseId)
	self:_initMemberVar(baseId)
	local resource = {
		file = Path.getCSB("HistoryHeroView", "historyhero"),
		size = G_ResolutionManager:getDesignSize(),
        binding = {
		}
	}
	HistoryHeroView.super.ctor(self, resource)
end

function HistoryHeroView:_initMemberVar(baseId)
	self._imageBack			= nil
	self._topbarBase		= nil
	self._nodeBookView		= nil	-- 图窗
	self._nodeTrainRight 	= nil	-- 强化

	self._listItemSource	= nil	-- 名将展示
	self._starView			= nil
	self._squadPanel		= nil
	self._isHideBook		= true	-- 隐藏左侧
	self._isHideDetail		= true	-- 隐藏右侧

	self._baseId			= baseId
	self._heroList			= {}	-- 名将列表
	self._historyFormation  = {}	-- 上阵阵容
	self._curGalleryIndex   = 1		-- 当前展示avatr
	self._squadIndex		= 1		-- 当前选择的上阵坑位
	self._slotList			= {}	-- 解锁
	self._lastTotalPower 	= 0 --记录总战力
	self._diffPower 		= 0 --战力差值
end

function HistoryHeroView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_HISTORY_HERO)

	self:_initMainIcon()
	self:_initBaseView()
	self:_initStarListView()
	self:_initSquadView()
	G_UserData:getHistoryHero():getSystemIds()
end

function HistoryHeroView:onEnter()
	self._starFormationUpdate  = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, handler(self, self._onStarFormationUpdate)) -- 名将阵容变化
	-- self._starEquip = G_SignalManager:add(SignalConst.EVENT_HISTORY_HERO_EQUIP_SUCCESS, handler(self, self._onStarEquip))	   		 -- 武将上下阵

	self._heroList = G_UserData:getHistoryHero():getHeroList()
	self._historyFormation = G_UserData:getHistoryHero():getHistoryHeroIds()

	self:_updateStarListView()
	self:_updateStrengthView()
end

function HistoryHeroView:onExit()
	if self._starFormationUpdate then
		self._starFormationUpdate:remove()
		self._starFormationUpdate = nil
	end

	if self._baseId ~= nil then
		self._baseId = nil
	end
	G_UserData:getHistoryHero():setDetailTabType(1)
end

function HistoryHeroView:_initMainIcon()
	-- for index = 1, 2 do
	-- 	self["_funcIcon"..index]:updateUI(HistoryHeroConst.TYPE_MAINICON[index])
	-- 	self["_funcIcon"..index]:addClickEventListenerEx(handler(self, self._onButtonClick))
	-- end
end

-- @Role	Click StrengthButton
function HistoryHeroView:_onButtonClick(sender)
	local funcId =  sender:getTag()
	if funcId > 0 then
		 local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	    WayFuncDataHelper.gotoModuleByFuncId(funcId)
	end
end

-- @Role 	Jump To StrengthView
function HistoryHeroView:_updateStrengthView()
	if self._baseId ~= nil then
		self:_detailShowHideAnimation()
	end
end

---------------------------------------------------------------
-- @Role 	BookView Animation 
function HistoryHeroView:_bookSHowHideAnimation()
	local position = self._isHideBook and cc.p(0, 0) or cc.p(G_ResolutionManager:getDesignSize()[1] * (-1.5), 0)
	local moveAction = cc.MoveTo:create(0.3, position)
	local callAction = cc.CallFunc:create(function()
		self._isHideBook = (not self._isHideBook)
	end)
	local action = cc.Sequence:create(cc.DelayTime:create(0.05), moveAction, callAction)
	self._nodeBookView:runAction(action)
end

-- @Role 	强化/觉醒/详情
function HistoryHeroView:_detailShowHideAnimation()
	local function updateFade(rootNode, bFadeIn)
		local callAction = cc.CallFunc:create(function()end)
		local action = bFadeIn and cc.FadeIn:create(0.2) or cc.FadeOut:create(0.2)
		local runningAction = cc.Sequence:create(cc.DelayTime:create(0.05), action, callAction)
		rootNode:setOpacity(bFadeIn and 0 or 255)
		rootNode:runAction(runningAction)
	end

	local position = self._isHideDetail and cc.p(self._trainRightPositionX - HistoryHeroConst.EQUIPVIEW_OFFSETWIDTH, 0) or cc.p(self._trainRightPositionX, 0)
	local moveAction = cc.MoveTo:create(0.3, position)
	local callAction = cc.CallFunc:create(function()
		updateFade(self._panelTop, not self._isHideDetail)
		updateFade(self._panelCenter, not self._isHideDetail)
		updateFade(self._panelPick, not self._isHideDetail)
		self._panelCenter:setVisible(not self._isHideDetail)
		self._squadPanel:setVisible(not self._isHideDetail)
		self._isHideDetail = (not self._isHideDetail)
	end)
	local action = self._isHideDetail and cc.Sequence:create(cc.DelayTime:create(0.05), callAction, moveAction)
									  or cc.Sequence:create(cc.DelayTime:create(0.05), moveAction, callAction)
	self:_backgroundAnimation()
	self._nodeTrainRight:runAction(action)

	self["_historyDetailView"]:switchHistoryMainView(not self._isHideDetail)
	self["_historyDetailView"]:updateLanternName(not self._isHideDetail)

	-- 强化跳转
	if self._baseId ~= nil then
		local idx = G_UserData:getHistoryHero():getHisoricalHeroKeyById(self._baseId)
		if idx > 0 then
			self["_historyDetailView"]:strengthAvatarIdx(idx)
		end
	end
end

-- @Role 	BackGround Animation
function HistoryHeroView:_backgroundAnimation()
	local position = self._isHideDetail and cc.p(self._imageBackX - 130, self._imageBack:getPositionY()) 
										or cc.p(self._imageBackX, self._imageBack:getPositionY())
	local moveAction = cc.MoveTo:create(0.3, position)
	local callAction = cc.CallFunc:create(function()
	end)
	local action = cc.Sequence:create(cc.DelayTime:create(0.05), moveAction, callAction)
	self._imageBack:runAction(action)
end

---------------------------------------------------------------
-- @Role 	
function HistoryHeroView:_initBaseView()
	self._topbarBase:setImageTitle("txt_sys_com_wangzhezhizhan")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.FUNC_HISTORY_HERO)
	self._topbarBase:hideBG()

	self["_bookView"] = HistoryHeroBookView.new()
	self._nodeBookView:removeAllChildren()
	self._nodeBookView:addChild(self["_bookView"])
	self._nodeBookView:setPositionX(G_ResolutionManager:getDesignSize()[1] * (-1.5))

	--背景用effect代替 可以节约一张图
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local effect = EffectGfxNode.new("effect_lidaimingjiangui_beijingtihuan")
	self._nodeEffect:addChild(effect)
	effect:play()
	
	-- self["_historyDetailView"] = HistoryHeroDetaillLayer.new()
	-- self._nodeTrainRight:removeAllChildren()
	-- self._nodeTrainRight:addChild(self["_historyDetailView"])
	-- self._imageBackX = self._imageBack:getPositionX()
	-- self._trainRightPositionX = self._nodeTrainRight:getPositionX()
	-- self["_historyDetailView"]:switchHistoryMainView(true)
	-- self["_historyDetailView"]:showHideCallBack(handler(self, self._detailShowHideAnimation))
end

-- @Role 	Squad Avatar
function HistoryHeroView:_initStarListView()
	cc.bind(self._listItemSource,"CommonGalleryView")
	self._listItemSource:setTemplate(HistoryHeroAvatarItemCell)
	self._listItemSource:setCallback(handler(self, self._onStarUpdate), handler(self, self._onStarSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onStarTouch))
	self._listItemSource:setCurgalleryCallback(handler(self, self._onChangeItemGallery))
end

-- @Role 	Squad Icon
function HistoryHeroView:_initSquadView()
	self._showSquadNums = HistoryHeroDataHelper.getHistoryHeroPosShowNum()
	if self._showSquadNums <= 0 then return end

	local slotList, unlockCount = HistoryHeroDataHelper.getHistoricalHeroSlotList()
	self._slotList = slotList
	self._showSquadNums = math.min(unlockCount + 1, HistoryHeroDataHelper.MAX_SLOT_COUNT)
	local intervalGap = ((self._squadPanel:getContentSize().width 
											- HistoryHeroConst.SQUADITEM_WIDTH * self._showSquadNums) / 2)
											+ HistoryHeroConst.SQUADITEM_WIDTH

	local squadWidth, squadHeight = self._squadPanel:getContentSize().width, self._squadPanel:getContentSize().height					
	if self._showSquadNums % 2 == 1 then
		--奇数个
		local posList = {
			cc.p(squadWidth * 0.5 - intervalGap, squadHeight * 0.5 - 20),
			cc.p(squadWidth * 0.5, squadHeight * 0.5),
			cc.p(squadWidth * 0.5 + intervalGap, squadHeight * 0.5 - 20),
		}
		for index = 1, self._showSquadNums do
			self["squadView"..index] = HistoryHeroPosItemCell.new(index, handler(self, self._onClickSquad))
			self["squadView"..index]:setVisible(true)
			self["squadView"..index]:setPosition(posList[index])
			self["squadView"..index]:updateSelectedVisible(slotList[index].isOpen)
			self["squadView"..index]:updateUnlockLevel(slotList[index]["info"].level)
			self._squadPanel:addChild(self["squadView"..index])
		end
	else
		--偶数个
		local posList = {
			cc.p(squadWidth * 0.5 - intervalGap * 1.7, squadHeight * 0.5 - 20),
			cc.p(squadWidth * 0.5 - intervalGap * 0.6, squadHeight * 0.5),
			cc.p(squadWidth * 0.5 + intervalGap * 0.6, squadHeight * 0.5),
			cc.p(squadWidth * 0.5 + intervalGap * 1.7, squadHeight * 0.5 - 20),
		}
		for index = 1, self._showSquadNums do
			self["squadView"..index] = HistoryHeroPosItemCell.new(index, handler(self, self._onClickSquad))
			self["squadView"..index]:setVisible(true)
			self["squadView"..index]:setPosition(posList[index])
			self["squadView"..index]:updateSelectedVisible(slotList[index].isOpen)
			self["squadView"..index]:updateUnlockLevel(slotList[index]["info"].level)
			self._squadPanel:addChild(self["squadView"..index])
		end
	end
	
	self["squadView1"]:updateSelectedVisible(true)
end

-- @Role 	当前选择的坑位
function HistoryHeroView:_onClickSquad(data)
	if self._heroList == nil or next(self._heroList) == nil then
		G_Prompt:showTip(Lang.get("historyhero_hero_nil"))
		return
	end

	if self._heroList[1] and self._heroList[1]:getId() == 0 then
		G_Prompt:showTip(Lang.get("historyhero_hero_nil"))
		return
	end 

	if rawget(data, "heroId") ~= nil then
		-- 500 * data.index + (data.index - 1)*200
		self._listItemSource:setLocation(self._listItemSource:getItemPosition(data.index), 350)
	end

	for index = 1, self._showSquadNums do
		self["squadView"..index]:updateSelectedVisible(index == data.index)
	end
	self._squadIndex = data.index

	-- Show-Dialog
	-- local function okCallback(id)
	-- 	G_UserData:getHistoryHero():c2sStarEquip(id, self._squadIndex - 1)
	-- end

	-- if data.state == TeamConst.STATE_LOCK then
	-- 	-- TODO::未解锁
	-- else
	-- 	if type(data.heroId) == "number" and data.heroId == 0 then
	-- 		local PopupChooseHistoricalItemView = require("app.scene.view.historyhero.PopupChooseHistoricalItemView").new(
	-- 														HistoryHeroConst.TAB_TYPE_HERO, nil, okCallback)
	-- 		PopupChooseHistoricalItemView:open()
	-- 	end
	-- end
end

function HistoryHeroView:_onClickReplace(data)
	if self._heroList == nil or next(self._heroList) == nil then
		G_Prompt:showTip(Lang.get("historyhero_hero_nil"))
		return
	end

	if self._heroList[data.index] and self._heroList[data.index]:getId() == 0 then
		G_Prompt:showTip(Lang.get("historyhero_hero_nil"))
		return
	end 
	self._squadIndex = data.index

	-- Show-Dialog
	local function okCallback(id)
		G_UserData:getHistoryHero():c2sStarEquip(id, self._squadIndex - 1)
	end

	if data.state == TeamConst.STATE_LOCK then
		-- TODO::未解锁
	else
		if type(data.heroId) == "number"  then
			local curHistoryHeroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(self._historyFormation[data.index])
			local PopupChooseHistoricalItemView = require("app.scene.view.historyhero.PopupChooseHistoricalItemView").new(
															HistoryHeroConst.TAB_TYPE_HERO, curHistoryHeroData, okCallback)
			PopupChooseHistoricalItemView:open()
		end
	end
end

-- @Role
function HistoryHeroView:_onStarUpdate(item, itemIndex)
	if self._historyFormation== nil or table.nums(self._historyFormation) <= 0 then
		return
	end

	local curIndex = (itemIndex + 1)
	if self._historyFormation[curIndex] == nil then
		return
	end

	local data = {
		cfg = self._historyFormation[curIndex] > 0 and G_UserData:getHistoryHero():getHisoricalHeroValueById(self._historyFormation[curIndex]) or nil,
		index = curIndex,
		isLock = HistoryHeroDataHelper.getHistoryHeroStateWithPos(curIndex) == TeamConst.STATE_LOCK,
		unlockLevel = self._slotList[self._showSquadNums]["info"].level,
		isGallery = (self._curGalleryIndex == curIndex),
	}
	item:updateUI(data)
end

-- @Role
function HistoryHeroView:_onStarSelected(item, itemIndex)
end

-- @Role 	阵容变化
function HistoryHeroView:_onStarFormationUpdate(id, message)
	if message == nil or rawget(message, "id") == nil then
		for index = 1, self._showSquadNums do
			self["squadView"..index]:updateUI(index)
		end
		return
	end

	for index = 1, self._showSquadNums do
		self["squadView"..index]:updateUI(index)
	end

	for k,v in pairs(message.id) do
		local item = self._listItemSource:getItemByTag(k - 1)
		if item ~= nil then
			local data = {
				cfg = G_UserData:getHistoryHero():getHisoricalHeroValueById(v),
				index = k,
				isLock = HistoryHeroDataHelper.getHistoryHeroStateWithPos(k) == TeamConst.STATE_LOCK,
				unlockLevel = self._slotList[self._showSquadNums]["info"].level,
				isGallery = (self._curGalleryIndex == k),
			}
			item:updateUI(data)
		end
	end

	self._historyFormation = G_UserData:getHistoryHero():getHistoryHeroIds()

	--总战力
	local totalPower = G_UserData:getBase():getPower()
	local node = CSHelper.loadResourceNode(Path.getCSB("CommonPowerPrompt", "common"))
	node:updateUI(totalPower, totalPower - self._lastTotalPower)
	node:play(0, 0)
end


--@Role 	Touch Avatar

function HistoryHeroView:_onStarTouch(index, data)
	self:_recordTotalPower()
	if data == nil then
		return
	end

	if rawget(data, "isReplace") == true then
		--替换
		self:_onClickReplace(data)
		return
	end
	if rawget(data, "id") == nil then
		self:_onClickSquad(data)
		return
	end
	self._baseId = data.id
	-- self:_detailShowHideAnimation()
end

--Role
function HistoryHeroView:_onChangeItemGallery(slot)	
	if slot == nil or self._curGalleryIndex == slot then
		return
	end
	self._curGalleryIndex = slot

	-- Show Name While Turning
	for index = 1, table.nums(self._heroList) do
		local tag = (index - 1)
		local item = self._listItemSource:getItemByTag(tag)
		if item ~= nil then
			item:updateNameVisible(index == slot)
		end
	end

	-- Show SelectedSlot While Truning
	local item = self._listItemSource:getItemByTag(slot - 1)
	if item ~= nil then
		local cellData = item:getCurCellData()
		if cellData ~= nil and next(cellData) ~= nil then
			local bSquad, index = G_UserData:getHistoryHero():isStarEquiped(cellData.id)
			if bSquad then
				for i = 1, self._showSquadNums do
					self["squadView"..i]:updateSelectedVisible(i == index)
				end
				-- self._squadIndex = index
			else
				-- local nilSlot = (G_UserData:getHistoryHero():getSquadStarsNums() + 1)
				for i = 1, self._showSquadNums do
					self["squadView"..i]:updateSelectedVisible(i == slot)
				end
				-- self._squadIndex = nilSlot
			end
		end
	end
end

-- @Role 	Update
function HistoryHeroView:_updateStarListView()
	self._historyFormation = G_UserData:getHistoryHero():getHistoryHeroIds()
	self._listItemSource:clearAll()
	self._listItemSource:resize(self._showSquadNums)
end

------------------------------------------------------------------
--记录总战力
function HistoryHeroView:_recordTotalPower()
	local totalPower = G_UserData:getBase():getPower()
	self._diffPower = totalPower - self._lastTotalPower
	self._lastTotalPower = totalPower
end

return HistoryHeroView