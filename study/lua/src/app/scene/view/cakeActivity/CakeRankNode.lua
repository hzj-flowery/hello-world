--
-- Author: Liangxu
-- Date: 2019-4-30
-- 蛋糕活动排行榜

local CakeRankNode = class("CakeRankNode")
local CakeGuildIcon = require("app.scene.view.cakeActivity.CakeGuildIcon")
local CakePlayerIcon = require("app.scene.view.cakeActivity.CakePlayerIcon")
local CakeActivityConst = require("app.const.CakeActivityConst")
local CakeRankGuildCell = require("app.scene.view.cakeActivity.CakeRankGuildCell")
local CakeRankPlayerCell = require("app.scene.view.cakeActivity.CakeRankPlayerCell")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")

function CakeRankNode:ctor(target)
	self._target = target
	self._selectTabIndex = CakeActivityConst.RANK_TYPE_1

	self._showArrowPanel = false --默认关闭
	self._guildRankTop = {} --前3名
	self._guildRankList = {} --3名之后
	self._userRankTop = {} --前3名
	self._userRankList = {} --3名之后

	self:_initUI()
	self:_switchTab()
	self:_updateInfoPanel()
end

function CakeRankNode:_initUI()
	self._imageTabGuild = ccui.Helper:seekNodeByName(self._target, "ImageTabGuild")
	self._imageTabUser = ccui.Helper:seekNodeByName(self._target, "ImageTabUser")
	self._textGuild = ccui.Helper:seekNodeByName(self._target, "TextGuild")
	self._textUser = ccui.Helper:seekNodeByName(self._target, "TextUser")
	self._buttonGuild = ccui.Helper:seekNodeByName(self._target, "ButtonGuild")
	self._buttonGuild:addClickEventListenerEx(handler(self, self._onClickTabGuild))
	self._buttonUser = ccui.Helper:seekNodeByName(self._target, "ButtonUser")
	self._buttonUser:addClickEventListenerEx(handler(self, self._onClickTabUser))

	self._nodeGuild = ccui.Helper:seekNodeByName(self._target, "NodeGuild")
	self._nodePlayer = ccui.Helper:seekNodeByName(self._target, "NodePlayer")
	self._nodeGuildIcon = ccui.Helper:seekNodeByName(self._target, "NodeGuildIcon")
	self._nodePlayerIcon = ccui.Helper:seekNodeByName(self._target, "NodePlayerIcon")
	for i = 1, 3 do
		local nodeGuildIcon = ccui.Helper:seekNodeByName(self._target, "NodeGuildIcon"..i)
		self["_guildIcon"..i] = CakeGuildIcon.new(nodeGuildIcon, i)
		local nodePlayerIcon = ccui.Helper:seekNodeByName(self._target, "NodePlayerIcon"..i)
		self["_playerIcon"..i] = CakePlayerIcon.new(nodePlayerIcon, i) 
	end
	self._textGuildEmpty = ccui.Helper:seekNodeByName(self._target, "TextGuildEmpty")
	self._textPlayerEmpty = ccui.Helper:seekNodeByName(self._target, "TextPlayerEmpty")
	self._imageBgGuild = ccui.Helper:seekNodeByName(self._target, "ImageBgGuild")
	self._imageBgPlayer = ccui.Helper:seekNodeByName(self._target, "ImageBgPlayer")

	self._listViewGuild = ccui.Helper:seekNodeByName(self._target, "ListViewGuild")
	cc.bind(self._listViewGuild, "ScrollView")
	self._listViewGuild:setTemplate(CakeRankGuildCell)
	self._listViewGuild:setCallback(handler(self, self._onItemUpdate1), handler(self, self._onItemSelected1))
	self._listViewGuild:setCustomCallback(handler(self, self._onItemTouch1))
	self._imageGuildTip = ccui.Helper:seekNodeByName(self._target, "ImageGuildTip")
	self._textGuildRank = ccui.Helper:seekNodeByName(self._target, "TextGuildRank")
	self._textGuildScore = ccui.Helper:seekNodeByName(self._target, "TextGuildScore")
	-- self._imageGuildArrow = ccui.Helper:seekNodeByName(self._target, "ImageGuildArrow")
	-- self._imageGuildArrow:ignoreContentAdaptWithSize(true)

	self._listViewPlayer = ccui.Helper:seekNodeByName(self._target, "ListViewPlayer")
	cc.bind(self._listViewPlayer, "ScrollView")
	self._listViewPlayer:setTemplate(CakeRankPlayerCell)
	self._listViewPlayer:setCallback(handler(self, self._onItemUpdate2), handler(self, self._onItemSelected2))
	self._listViewPlayer:setCustomCallback(handler(self, self._onItemTouch2))
	self._textMyRank = ccui.Helper:seekNodeByName(self._target, "TextMyRank")
	self._textMyScore = ccui.Helper:seekNodeByName(self._target, "TextMyScore")
	-- self._imageMyArrow = ccui.Helper:seekNodeByName(self._target, "ImageMyArrow")
	-- self._imageMyArrow:ignoreContentAdaptWithSize(true)

	self._buttonArrow = ccui.Helper:seekNodeByName(self._target, "ButtonArrow")
	self._buttonArrow:addClickEventListenerEx(handler(self, self._onClickArrow))
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")

	self._textLevelTitle = ccui.Helper:seekNodeByName(self._target, "TextLevelTitle")
	local name = CakeActivityDataHelper.getFoodName()
	self._textLevelTitle:setString(Lang.get("cake_activity_rank_level_title", {name = name}))

	self:updateStage()
end

function CakeRankNode:_onClickTabGuild()
	if self._selectTabIndex == CakeActivityConst.RANK_TYPE_1 then
		return
	end
	self._selectTabIndex = CakeActivityConst.RANK_TYPE_1
	self:_switchTab()
end

function CakeRankNode:_onClickTabUser()
	if self._selectTabIndex == CakeActivityConst.RANK_TYPE_2 then
		return
	end
	self._selectTabIndex = CakeActivityConst.RANK_TYPE_2
	self:_switchTab()
end

function CakeRankNode:updateStage()
	local actStage = CakeActivityDataHelper.getActStage()
	if actStage == CakeActivityConst.ACT_STAGE_1 or actStage == CakeActivityConst.ACT_STAGE_2 then
		self._textGuild:setString(Lang.get("cake_activity_rank_tab_title_1"))
		self._textUser:setString(Lang.get("cake_activity_rank_tab_title_2"))
		self._imageGuildTip:setVisible(true)
	else
		self._textGuild:setString(Lang.get("cake_activity_rank_tab_title_3"))
		self._textUser:setString(Lang.get("cake_activity_rank_tab_title_4"))
		self._imageGuildTip:setVisible(false)
	end
end

function CakeRankNode:_switchTab()
	self._imageTabGuild:setVisible(self._selectTabIndex == CakeActivityConst.RANK_TYPE_1)
	self._imageTabUser:setVisible(self._selectTabIndex == CakeActivityConst.RANK_TYPE_2)
	self._nodeGuild:setVisible(self._selectTabIndex == CakeActivityConst.RANK_TYPE_1)
	self._nodePlayer:setVisible(self._selectTabIndex == CakeActivityConst.RANK_TYPE_2)
	if self._selectTabIndex == CakeActivityConst.RANK_TYPE_1 then
		self._textGuild:setColor(cc.c3b(0xc8, 0x5e, 0x09))
		self._textUser:setColor(cc.c3b(0xed, 0x99, 0x5b))
	else
		self._textGuild:setColor(cc.c3b(0xed, 0x99, 0x5b))
		self._textUser:setColor(cc.c3b(0xc8, 0x5e, 0x09))
	end
	self:updateRank()
end

function CakeRankNode:_onClickArrow()
	self._showArrowPanel = not self._showArrowPanel
	self:_updateInfoPanel()
end

function CakeRankNode:_updateInfoPanel()
	if self._showArrowPanel then
		self._imageArrow:loadTexture(Path.getTextAnniversaryImg("txt_anniversary01"))
	else
		self._imageArrow:loadTexture(Path.getTextAnniversaryImg("txt_anniversary02"))
	end
	self._imageBgGuild:setVisible(self._showArrowPanel)
	self._imageBgPlayer:setVisible(self._showArrowPanel)
end

function CakeRankNode:updateRank()
	if self._selectTabIndex == CakeActivityConst.RANK_TYPE_1 then
		self:updateGuildRank()
	elseif self._selectTabIndex == CakeActivityConst.RANK_TYPE_2 then
		self:updatePlayerRank()
		self:updateMyScore()
	end
end

function CakeRankNode:updateGuildRank()
	local rankData = G_UserData:getCakeActivity():getSelfGuildRank()
	if rankData then
		self._textGuildRank:setString(rankData:getRank())
		self._textGuildScore:setString(rankData:getCake_level())
		-- self._imageGuildArrow:loadTexture(Path.getUICommon(rankData:getChangeResName()))
		-- self._imageGuildArrow:setVisible(true)
	else
		self._textGuildRank:setString(Lang.get("cake_activity_no_rank"))
		self._textGuildScore:setString(Lang.get("cake_activity_no_level"))
		-- self._imageGuildArrow:setVisible(false)
	end

	self._guildRankTop = {}
	self._guildRankList = {}
	local listDatas = G_UserData:getCakeActivity():getGuildRankList()
	if #listDatas == 0 then
		self._nodeGuildIcon:setVisible(false)
		self._textGuildEmpty:setVisible(true)
	else
		self._nodeGuildIcon:setVisible(true)
		self._textGuildEmpty:setVisible(false)
	end
	
	for i = 1, 3 do
		self._guildRankTop[i] = listDatas[i]
	end
	for i = 4, #listDatas do
		table.insert(self._guildRankList, listDatas[i])
	end

	for i = 1, 3 do
		local data = self._guildRankTop[i]
		self["_guildIcon"..i]:updateUI(data)
	end
	self._listViewGuild:clearAll()
	self._listViewGuild:resize(#self._guildRankList)
end

function CakeRankNode:updatePlayerRank()
	local rankData = G_UserData:getCakeActivity():getSelfUserRank()
	if rankData then
		self._textMyRank:setString(rankData:getRank())
		-- self._imageMyArrow:loadTexture(Path.getUICommon(rankData:getChangeResName()))
		-- self._imageMyArrow:setVisible(true)
	else
		self._textMyRank:setString(Lang.get("cake_activity_no_rank"))
		-- self._imageMyArrow:setVisible(false)
	end

	self._userRankTop = {}
	self._userRankList = {}
	local listDatas = G_UserData:getCakeActivity():getUserRankList()
	if #listDatas == 0 then
		self._nodePlayerIcon:setVisible(false)
		self._textPlayerEmpty:setVisible(true)
	else
		self._nodePlayerIcon:setVisible(true)
		self._textPlayerEmpty:setVisible(false)
	end
	
	for i = 1, 3 do
		self._userRankTop[i] = listDatas[i]
	end
	for i = 4, #listDatas do
		table.insert(self._userRankList, listDatas[i])
	end

	for i = 1, 3 do
		local data = self._userRankTop[i]
		self["_playerIcon"..i]:updateUI(data)
	end
	self._listViewPlayer:clearAll()
	self._listViewPlayer:resize(#self._userRankList)
end

function CakeRankNode:updateMyScore()
	local point = G_UserData:getCakeActivity():getSelfPoint()
	self._textMyScore:setString(point)
end

function CakeRankNode:_onItemUpdate1(item, index)
    local index = index + 1
    local data = self._guildRankList[index]
    if data then
    	item:update(data)
    end
end

function CakeRankNode:_onItemSelected1(item, index)
	
end

function CakeRankNode:_onItemTouch1(index, t)

end

function CakeRankNode:_onItemUpdate2(item, index)
    local index = index + 1
    local data = self._userRankList[index]
    if data then
    	item:update(data)
    end
end

function CakeRankNode:_onItemSelected2(item, index)
	
end

function CakeRankNode:_onItemTouch2(index, t)

end

return CakeRankNode