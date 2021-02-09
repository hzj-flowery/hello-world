-- @Author panhoa
-- @Date 9.18.2018
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupHeroView = class("PopupHeroView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonHeroIcon = require("app.scene.view.seasonCompetitive.SeasonHeroIcon")
local SeasonPet2Icon = require("app.scene.view.seasonCompetitive.SeasonPet2Icon")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")

function PopupHeroView:ctor(bBanPick, tabIndex, selectTabCallback, touchCallback)
	self._imageCentent	   = nil
	self._panelContent	   = nil
	self._textGoldenCountDesc = nil
	self._textGoldenHeroCount = nil
	self._textRedCountDesc = nil
	self._textRedHeroCount = nil
	self._listView  	   = nil
	self._scrollView       = nil
	self._nodeTabRoot 	   = nil
	self._isInBanView	   = bBanPick  --ban选界面
	self._selectTabIndex   = tabIndex  --Cur's tab
	self._curTouchIndex	   = 1

	self._selectTabCallback = selectTabCallback
	self._touchCallback		= touchCallback
	self._curOwnLockData    = {}	-- 我方武将信息
	self._heroListInfo      = {}
	self._redHeroListInfo   = {}	-- 红将
	self._goldenHeroListInfo = {} 	-- 金将
	self._transformHeroInfo = {}    -- 变身卡武将
	self._isEnoughSquadRedHeros = false
	self._isEnoughSquadGoldenHeros = false
	self._isEnoughSquadTransHero = false
	self._canShowGoldenHero = false

    local resource = {
		file = Path.getCSB("PopupHeroView", "seasonCompetitive"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onCloseView"}}
			},
			_btnForbit = {
				events = {{event = "touch", method = "_onBanPick"}}
			},
		}
    }
    self:setName("PopupHeroView")
	PopupHeroView.super.ctor(self, resource, false, true)
end

function PopupHeroView:onCreate()
	self:_initBanPickView()
	self:_initHeroListData()
	self:_initListView(self._listView)
	self:_onInitTab()

	local size = G_ResolutionManager:getDesignCCSize()
	self._panelTouch:setContentSize(size)
end

function PopupHeroView:onEnter()
	self._signalFightsBanCheck 	= G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_HEROS_BAN, handler(self, self._onEventFightsBanCheck))		-- 搬选武将
	self:_updateListView(self._selectTabIndex)
end

function PopupHeroView:onExit()
	self._signalFightsBanCheck:remove()
	self._signalFightsBanCheck = nil
end

function PopupHeroView:_onCloseView()
	if self._isInBanView then
		return
	end
	if self._closeCallBack then
		self._closeCallBack()
	end
	self:close()
end

function PopupHeroView:_onBanPick()
	local banData = {}
	local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
	for index = 1, maxBanHeroNum do
		if self._banHeroData[index] then
			table.insert(banData, self._banHeroData[index].heroId)
		end
    end
    
    local pets = {}
    table.insert(pets, self._banPetId)
	G_UserData:getSeasonSport():c2sFightsBan(banData, pets)
	if self._closeCallBack then
		self._closeCallBack()
	end
	self:close()
end

-- @Role 	搬选武将返回消息
function PopupHeroView:_onEventFightsBanCheck(id, message)
	if message == nil then return end
	if self._isInBanView then
		if self._closeCallBack then
			self._closeCallBack()
		end
		self:close()
	end
end

-- @Role 	关闭窗口回调
function PopupHeroView:setCloseCallBack(closeCallback)
	self._closeCallBack = closeCallback
end

-- @Role 	同步搬选武将
function PopupHeroView:setSyncBanHeroData(banHeroData)
	self._banHeroData = banHeroData
end

-- @Role 	同步搬选神兽
function PopupHeroView:setSyncBanPetData(banPetId)
	self._banPetId = banPetId or 0
end

-- @Role 	禁用武将是否达到最大
function PopupHeroView:_checkForbitBtn()
	local recordCount = 0
	local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
	for key, value in pairs(self._banHeroData) do
		if value ~= nil and value.heroId > 0 then
			recordCount = (recordCount + 1)
		end
	end
	return maxBanHeroNum == recordCount and self._banPetId > 0
end

-- @Role	禁用按钮状态
function PopupHeroView:_updateForbitEffect()
	local bEnable = self:_checkForbitBtn()
	self._btnForbit:setEnabled(bEnable)

	if bEnable then
		self._nodeForbitEffect:setVisible(true)
		self._nodeForbitEffect:removeAllChildren()
		G_EffectGfxMgr:createPlayGfx(self._nodeForbitEffect, "effect_anniufaguang_big2")
	else
		self._nodeForbitEffect:setVisible(false)
	end
end

----------------------------------------------------------
-- 初始化基础数据
function PopupHeroView:_initBanPickView()
	self._btnForbit:setVisible(self._isInBanView)
	self._btnForbit:setString(Lang.get("season_banpick_forbit"))
	self._textBanPickDesc:setVisible(self._isInBanView)
	self._textRedCountDesc:setVisible(not self._isInBanView)
	self._textGoldenCountDesc:setVisible(not self._isInBanView)
	
	-- Adaptto scrollview
	if self._isInBanView then
		local listViewHeight = SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN - SeasonSportConst.SEASON_POPHEROVIEW_LISTVIEW_OFF
		self._listView:setPositionY(listViewHeight)
		self._panelContent:setPositionY(SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN)
		self._imageCentent:setContentSize(cc.size(self._imageCentent:getContentSize().width, 
													SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN))
		self._panelContent:setContentSize(cc.size(self._panelContent:getContentSize().width, 
													SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN))
		self._listView:setContentSize(cc.size(self._listView:getContentSize().width, listViewHeight))
	end	
end

function PopupHeroView:_initHeroListData()
	self._imageCentent:setSwallowTouches(false)
	self._transformHeroInfo = G_UserData:getSeasonSport():getTransformCardHeros()
	self._heroListInfo = G_UserData:getSeasonSport():getHeroListInfo()
	self._redHeroListInfo = G_UserData:getSeasonSport():getRedHeroListInfo()
	self._goldenHeroListInfo = G_UserData:getSeasonSport():getGoldenHeroListInfo()
	self._petListData = G_UserData:getSeasonSport():getPetListInfo()
	
	self._canShowGoldenHero = #self._goldenHeroListInfo>0

	self:_initRedHeroDesc()
	self:_initGoldenHeroDesc()
end

function PopupHeroView:_initGoldenHeroDesc()
	if not self._canShowGoldenHero then
		self._textGoldenCountDesc:setVisible(false)
		self._textGoldenHeroCount:setVisible(false)
		return
	end
	self._textGoldenHeroCount:setVisible(not self._isInBanView)
	self._textGoldenHeroCount:removeAllChildren()
	local richText = ccui.RichText:createRichTextByFormatString(
				Lang.get("season_squadredhero_count", {num1 = 0, num2 = 1}),
				{defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 20, other ={
					[1] = {fontSize = 20}
				}})
	richText:setPositionX(0)
	richText:setPositionY(6)
	self._textGoldenHeroCount:addChild(richText)
end

function PopupHeroView:_initRedHeroDesc()
	self._textRedHeroCount:setVisible(not self._isInBanView)
	self._textRedHeroCount:removeAllChildren()
	local richText = ccui.RichText:createRichTextByFormatString(
				Lang.get("season_squadredhero_count", {num1 = 0, num2 = 2}),
				{defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 20, other ={
					[1] = {fontSize = 20}
				}})
	richText:setPositionX(0)
	richText:setPositionY(6)
	self._textRedHeroCount:addChild(richText)
end

function PopupHeroView:_initListView(listView)
    local scrollViewParam = {}
    scrollViewParam.template = SeasonHeroIcon
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onItemTouch)
	self._scrollView = TabScrollView.new(listView, scrollViewParam, 1)
end

function PopupHeroView:_updateTemplate()
    -- body
    if self._isInBanView and self._selectTabIndex == 5 then
        self._scrollView:updateTemplate(SeasonPet2Icon)
    else
        self._scrollView:updateTemplate(SeasonHeroIcon)
    end
end

-- @Role TabSelect
function PopupHeroView:_onInitTab()
	local param = {}
	if self._isInBanView then
		param = {
			callback = handler(self, self._onTabSelect),
			isVertical = 2,
			textList = { Lang.get("handbook_country_tab1"),
			Lang.get("handbook_country_tab2"),
			Lang.get("handbook_country_tab3"),
            Lang.get("handbook_country_tab4"),
            Lang.get("season_pet_tab5"),}
		}
	else
		param = {
			callback = handler(self, self._onTabSelect),
			isVertical = 2,
			textList = { Lang.get("handbook_country_tab1"),
			Lang.get("handbook_country_tab2"),
			Lang.get("handbook_country_tab3"),
			Lang.get("handbook_country_tab4"),
			Lang.get("season_country_tab5")}
		}
	end
	self._nodeTabRoot:recreateTabs(param)
	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
end

-- @Role    TabSelect
function PopupHeroView:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
    
    self:_updateTemplate()

	if self._selectTabCallback then
		self._selectTabCallback(index)
	end
	self:_updateListView(index)
end

function PopupHeroView:_updateListView(index)
	if self._isInBanView then
		self:_updateForbitEffect()
	end

	if self._heroListInfo == nil or self._transformHeroInfo == nil then
		return
	end
	
    local maxCount = 0
    if self._isInBanView then
        maxCount = self._selectTabIndex == 5 and table.nums(self._petListData) 
                                                    or table.nums(self._heroListInfo[self._selectTabIndex])
    else
        maxCount = self._selectTabIndex == 5 and table.nums(self._transformHeroInfo) 
                                                    or table.nums(self._heroListInfo[self._selectTabIndex])
    end
	self._isEnoughSquadRedHeros = self:_isEnoughRedHeros()
	self._isEnoughSquadGoldenHeros = self:isEnoughGoldenHeroes()
	self._isExistSquadTransHero = self:_isExistTransformHeros()
	local lineCount = math.ceil(maxCount/6)
	self._scrollView:updateListView(self._selectTabIndex, lineCount)
end

-- @Role    UpdateInfo
function PopupHeroView:_onCellUpdate(cell, cellIndex)
    local cellData = {}
    if self._heroListInfo == nil or self._transformHeroInfo == nil then
        return
    end
    if self._isInBanView and self._petListData == nil then
        return
    end
    
    local curData = {}
    if self._isInBanView then
        curData = self._selectTabIndex == 5 and self._petListData 
                                                    or self._heroListInfo[self._selectTabIndex]
    else
        curData = self._selectTabIndex == 5 and self._transformHeroInfo 
                                                    or self._heroListInfo[self._selectTabIndex]
    end

	if not curData or table.nums(curData) <= 0 then return end
    if self._isInBanView then
		for index = (cellIndex * 6) + 1, (cellIndex * 6) + 6 do
			local itemData = curData[index]
            if itemData and itemData.cfg ~= nil then
                local data = itemData.cfg
                if self._selectTabIndex == 5 then
                    data.isSelected = index == self._curTouchIndex or false
                    data.isShowTop = false

                    data.isBaned = rawequal(self._banPetId, data.id)
                    data.isMask = rawequal(self._banPetId, data.id)
                    data.isInBanView = self._isInBanView
                    table.insert(cellData, data)
                else
                    data.isSelected = index == self._curTouchIndex or false
                    data.isShowTop = false
                    data.isBaned = self:_isExistBanedHero(data.id)
                    data.isMask = self:_isExistBanedHero(data.id)
                    data.isInBanView = self._isInBanView
                    table.insert(cellData, data)
                end
			end
		end
	else
		for index = (cellIndex * 6) + 1, (cellIndex * 6) + 6 do
			local itemData = curData[index]
			if itemData and itemData.cfg ~= nil then
				local data = itemData.cfg
				data.isBaned = self:_isBanedHero(data.id)
				data.isInBanView = self._isInBanView
				data.isSelected = index == self._curTouchIndex or false
				if self._isEnoughSquadRedHeros and self:_isRedHero(data.id) then
					data.isMask = true
					data.isShowTop = self:_isMaskInOwnHeros(data.id)
				elseif self._isEnoughSquadGoldenHeros and self:_isGoldenHero(data.id) then
					data.isMask = true
					data.isShowTop = self:_isMaskInOwnHeros(data.id)
				elseif self._selectTabIndex == 5 then
					if self._isExistSquadTransHero > 0 then
						local heroId = SeasonSportHelper.getTransformCardsHeroId(data.id)
						data.isMask = true
						data.isShowTop = self._isExistSquadTransHero == heroId or false
					else
						local heroId = SeasonSportHelper.getTransformCardsHeroId(data.id)
						data.isMask = self:_isMaskInOwnHeros(heroId)
						data.isShowTop = false
					end

					-- 橙升红变身卡同时禁用
					if self:_isBanedHero(SeasonSportHelper.getTransformCardsHeroId(data.id)) then
						data.isMask = true
                        data.isBaned = true
                    end
                    -- 上阵红将已满，红将变身卡压暗
                    local heroId = SeasonSportHelper.getTransformCardsHeroId(data.id)
                    if self._isEnoughSquadRedHeros and self:_isRedHero(heroId) then
                        data.isMask = true
                        data.isShowTop = false
                    end
				else
					data.isMask = self:_isMaskInOwnHeros(data.id)
					data.isShowTop = self:_isMaskInOwnHeros(data.id)
				end
				table.insert(cellData, data)
			end
		end
    end
	cell:updateUI(self._selectTabIndex, cellData)
end

function PopupHeroView:_onCellSelected(cell, index)
end

-- @Role 	Item Touch
function PopupHeroView:_onItemTouch(index, itemPos)
    if self._touchCallback then
		self._touchCallback(self._selectTabIndex, itemPos)
    end
	
	self:_updateListView(self._selectTabIndex)
	if not self._isInBanView then
		if self._closeCallBack then
			self._closeCallBack()
		end
		self:close()
	end
end

-- @Role 
function PopupHeroView:setCurOwnHeroData(data)
    self._curOwnLockData = data
	self:_updateListView(self._selectTabIndex)
end

-- @Role    judge from other/own lock'data check Mask
function PopupHeroView:_isMaskInOwnHeros(baseId)
    local otherSideHeros = G_UserData:getSeasonSport():getOther_SquadInfo()
	if otherSideHeros and table.nums(otherSideHeros) > 0 then
		for key, value in pairs(otherSideHeros) do
			if value > 0 and baseId == value then
				return true
			end
		end
	end

	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if self._curOwnLockData[index] then
			local heroId = self._curOwnLockData[index].heroId
			if self._selectTabIndex == 5 then
				if heroId > 0 and SeasonSportHelper.isHero(heroId) == false then
					return true
				end
			else
				if baseId == heroId then
					return true
				end
			end
		end
	end
	return false
end

function PopupHeroView:isEnoughGoldenHeroes()
	local ownSide = G_UserData:getSeasonSport():getOwn_SquadInfo()
    if not ownSide or table.nums(ownSide) <= 0 then
        return false
    end
	
	local goldenCount = 0
	-- lock data search
    for key, value in pairs(ownSide) do
		for index = 1, #self._goldenHeroListInfo do
			for indexj = 1, #self._goldenHeroListInfo[index] do
				if self._goldenHeroListInfo[index][indexj] and value == self._goldenHeroListInfo[index][indexj].cfg.id then
					if self._goldenHeroListInfo[index][indexj].cfg.color == SeasonSportConst.HERO_SCOP_GOLDENLIMIT then
						goldenCount = goldenCount + 1
						break
					end
				end
			end
        end
	end
	
	-- unlock data search
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if self._curOwnLockData[index] then 
			local curOwnHeroId = tonumber(self._curOwnLockData[index].heroId)
			if  curOwnHeroId > 0 and self._curOwnLockData[index].isLock == false then
				for index = 1, #self._goldenHeroListInfo do
					for indexj = 1, #self._goldenHeroListInfo[index] do
						local goldenHeroId = tonumber(self._goldenHeroListInfo[index][indexj].cfg.id)
						local color = tonumber(self._goldenHeroListInfo[index][indexj].cfg.color)
						if curOwnHeroId == goldenHeroId and color == SeasonSportConst.HERO_SCOP_GOLDENLIMIT then
							goldenCount = goldenCount + 1
							break
						end
					end
				end
			end
		end
	end
	
	local maxLimit = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_MAXLIMIT_GOLDENHERO).content)
	if self._canShowGoldenHero then
		self._textGoldenHeroCount:removeAllChildren()
		local richText = ccui.RichText:createRichTextByFormatString(
					Lang.get("season_squadredhero_count", {num1 = goldenCount, num2 = maxLimit}),
					{defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 20, other ={
						[1] = {fontSize = 20}
					}})
		richText:setPositionX(0)
		richText:setPositionY(6)
		self._textGoldenHeroCount:addChild(richText)
	end
    if maxLimit <= goldenCount then
        return true
    end
    return false  
end

-- @Role     Judge enough 2 RedHeros
function PopupHeroView:_isEnoughRedHeros()
	local ownSide = G_UserData:getSeasonSport():getOwn_SquadInfo()
    if not ownSide or table.nums(ownSide) <= 0 then
        return false
    end

    local redCount = 0
	-- lock data search
    for key, value in pairs(ownSide) do
		for index = 1, #self._redHeroListInfo do
			for indexj = 1, #self._redHeroListInfo[index] do
				if self._redHeroListInfo[index][indexj] and value == self._redHeroListInfo[index][indexj].cfg.id then
					if self._redHeroListInfo[index][indexj].cfg.color == SeasonSportConst.HERO_SCOP_REDIMIT then
						redCount = redCount + 1
						break
					end
				end
			end
        end
    end
    
    -- unlock data search
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if self._curOwnLockData[index] then 
            local curOwnHeroId = tonumber(self._curOwnLockData[index].heroId)
            if self._curOwnLockData[index].state == 1 then
                curOwnHeroId = SeasonSportHelper.getTransformCardsHeroId(curOwnHeroId)
            end
            
			if curOwnHeroId > 0 and self._curOwnLockData[index].isLock == false then
				for index = 1, #self._redHeroListInfo do
					for indexj = 1, #self._redHeroListInfo[index] do
						local redHeroId = tonumber(self._redHeroListInfo[index][indexj].cfg.id)
						local color = tonumber(self._redHeroListInfo[index][indexj].cfg.color)
						if curOwnHeroId == redHeroId and color == SeasonSportConst.HERO_SCOP_REDIMIT then
							redCount = redCount + 1
							break
						end
					end
				end
			end
		end
	end
	
	local maxLimit = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_MAXLIMIT_REDHERO).content)
	self._textRedHeroCount:removeAllChildren()
	local richText = ccui.RichText:createRichTextByFormatString(
				Lang.get("season_squadredhero_count", {num1 = redCount, num2 = maxLimit}),
				{defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 20, other ={
					[1] = {fontSize = 20}
				}})
	richText:setPositionX(0)
	richText:setPositionY(6)
	self._textRedHeroCount:addChild(richText)
    if maxLimit <= redCount then
        return true
    end
    return false    
end

-- @Role    judge from other/own lock'data check Mask
function PopupHeroView:_isExistTransformHeros()
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if self._curOwnLockData[index] then
			local heroId = self._curOwnLockData[index].heroId
			if heroId > 0 and self._selectTabIndex == 5 then
				if SeasonSportHelper.isHero(heroId) == false then
					heroId = SeasonSportHelper.getTransformCardsHeroId(heroId)
					return heroId
				end
			end
		end
	end
	return 0
end

-- @Role 	搬选界面中是否搬选了武将
function PopupHeroView:_isExistBanedHero(heroId)
	local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
	for index = 1, maxBanHeroNum do
		if self._banHeroData[index] and self._banHeroData[index].heroId == heroId then
			return true
		end
	end
	return false
end

--  @Role 	是否选择界面中存在搬选武将
function PopupHeroView:_isBanedHero(heroId)
	local banedData = G_UserData:getSeasonSport():getBanHeros()
	if banedData == nil or table.nums(banedData) <= 0 then
		return false
	end

	for index = 1, table.nums(banedData) do
		if banedData[index] and banedData[index] == heroId then
			return true
		end
	end
	return false
end

-- @Role    是否选择界面中存在搬选武将
function PopupHeroView:_isBanedPets(petId)
    -- body
    local banedData = G_UserData:getSeasonSport():getBanPets()
    if banedData == nil or table.nums(banedData) <= 0 then
		return false
    end
    for index = 1, table.nums(banedData) do
		if banedData[index] and banedData[index] == petId then
			return true
		end
	end
	return false
end

-- @Role 	是否红将(不包含橙升红)
function PopupHeroView:_isRedHero(heroId)
	for index = 1, #self._redHeroListInfo do
		for indexj = 1, #self._redHeroListInfo[index] do
			if self._redHeroListInfo[index][indexj] and heroId == self._redHeroListInfo[index][indexj].cfg.id then
				if self._redHeroListInfo[index][indexj].cfg.color == SeasonSportConst.HERO_SCOP_REDIMIT then
					return true
				end
			end
		end
	end
	return false
end
-- @Role 	是否金将(不包含红升金)
function PopupHeroView:_isGoldenHero(heroId)
	for k,v in pairs(self._goldenHeroListInfo) do
		for ii,vv in ipairs(v) do
			if vv.cfg.id==heroId and vv.cfg.color==SeasonSportConst.HERO_SCOP_GOLDENLIMIT then
				return true
			end
		end
	end
	return false
end


return PopupHeroView