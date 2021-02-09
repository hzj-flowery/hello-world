--世界boss
local ViewBase = require("app.ui.ViewBase")
local WorldBossRankNode = class("WorldBossRankNode", ViewBase)
local WorldBossConst = require("app.const.WorldBossConst")
local TextHelper = require("app.utils.TextHelper")
local WorldBossRankCell = import(".WorldBossRankCell")
local TabScrollView = require("app.utils.TabScrollView")
function WorldBossRankNode:ctor()

    self._rankView = {}
    self._dataList = {}
    self._imageNoTimes = nil
    self._listViewTab1 = nil
    self._listViewTab2 = nil
    self._tabIndex = nil

    local resource = {
        file = Path.getCSB("WorldBossRankNode", "worldBoss"),
        binding = {

		}
    }
    WorldBossRankNode.super.ctor(self, resource)
    self:setName("WorldBossRankNode")
end


function WorldBossRankNode:onCreate()
    local tabParams ={
        callback = handler(self, self._onTabSelect),
        isVertical = 2,
        offset = 1,
		textList = { Lang.get("worldboss_guild_rank_tab"),  Lang.get("worldboss_user_rank_tab") }
    }

    local scrollViewParam = {
		template = WorldBossRankCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView,scrollViewParam)


    self._nodeTabRoot:recreateTabs(tabParams)
    self._imageNoTimes:setVisible(false)
    self:getSubNodeByName("Image_guild_rank_bg"):setVisible(false)
    self:getSubNodeByName("Image_personal_rank_bg"):setVisible(false)
    self:getSubNodeByName("Image_no_guild"):setVisible(false)

    self._nodeTabRoot:setTabIndex(1)
end


function WorldBossRankNode:_onTabSelect(index, sender)
	if self._tabIndex == index then
		return
	end

	for i,view in pairs(self._rankView) do
		view:setVisible(false)
	end

	self._tabIndex = index
    self:_updateListView(self._tabIndex)
    --tab切换
    local tabIndex = self._tabIndex
    self._tabListView:updateListView(tabIndex,#self._dataList[tabIndex])
end


function WorldBossRankNode:_updateListView(tabIndex)
	tabIndex = tabIndex or 1
	self._dataList[WorldBossConst.TAB_INDEX_GUILD] = G_UserData:getWorldBoss():getGuild_rank()
    self._dataList[WorldBossConst.TAB_INDEX_PERSONAL] = G_UserData:getWorldBoss():getUser_rank()    
    self:_updateMyData(self._tabIndex)
end


function WorldBossRankNode:_updateMyData(tabIndex)
    local list = self._dataList[tabIndex]
    self:getSubNodeByName("Image_guild_rank_bg"):setVisible(false)
    self:getSubNodeByName("Image_personal_rank_bg"):setVisible(false)
    self:getSubNodeByName("Image_no_guild"):setVisible(false)

    self._imageNoTimes:setVisible(false)
    if tabIndex == WorldBossConst.TAB_INDEX_GUILD then
       -- self:getSubNodeByName("Image_title_bg1"):setVisible(true)
        local isInGuild = G_UserData:getGuild():isInGuild()
        if isInGuild then
            local guildRank = G_UserData:getWorldBoss():getSelf_guild_rank()
            local guildPoint = G_UserData:getWorldBoss():getGuild_point()    
            self:getSubNodeByName("Image_guild_rank_bg"):setVisible(true)
            --self._textGuildRank:setString(guildRank)
    
            if guildPoint > 0 then
                self._textGuildScore:setString(guildPoint)
                self._textGuildScore:setColor(Colors.BRIGHT_BG_ONE)
            else
                self._textGuildScore:setString(Lang.get("worldboss_no"))
                self._textGuildScore:setColor(Colors.BRIGHT_BG_ONE)
            end

            self._textGuildRank:setVisible(false)

            if guildRank > 0 then
                --self._textGuildRank:setString(guildRank)
                -- self._textGuildRank:setColor(Colors.BRIGHT_BG_ONE)

                self._guild_rank_bk:setVisible(true)
        
                if guildRank <= 3 then
                    self._guild_rank_bk:loadTexture(Path.getArenaUI("img_qizhi0"..guildRank))
                else
                    self._guild_rank_bk:loadTexture(Path.getArenaUI("img_qizhi04"))

                    self._textGuildRank:setVisible(true)
                    self._textGuildRank:setString(guildRank)
                end

                self._guild_rank_bk:setContentSize(cc.size(30,40))
            else
                --self._textGuildRank:setString(Lang.get("worldboss_no"))
                -- self._textGuildRank:setColor(Colors.BRIGHT_BG_ONE)

                self._guild_rank_bk:setVisible(false)
                --self._textGuildRank:setVisible(false)
            end
        else
            self:getSubNodeByName("Image_no_guild"):setVisible(true)
        end

        if #list == 0 then
            self._imageNoTimes:setVisible(true)
            self._imageNoTimes:setTipsString(Lang.get("worldboss_no_guild_rank"))
        end

    end

    if tabIndex == WorldBossConst.TAB_INDEX_PERSONAL then
         local userRank = G_UserData:getWorldBoss():getSelf_user_rank()
         local userPoint = G_UserData:getWorldBoss():getUser_point()
         --self:getSubNodeByName("Image_title_bg2"):setVisible(true)
         self:getSubNodeByName("Image_personal_rank_bg"):setVisible(true)

         if userPoint > 0 then
            self._textSelfScore:setString(userPoint)
            self._textSelfScore:setColor(Colors.BRIGHT_BG_ONE)
         else
            self._textSelfScore:setString(Lang.get("worldboss_no"))
            self._textSelfScore:setColor(Colors.BRIGHT_BG_ONE)
         end
         if userRank > 0 then
            self._textSelfRank:setString(userRank)
            self._self_rank_bk:setVisible(false)
            self._textSelfRank:setVisible(true)
            -- self._textSelfRank:setColor(Colors.BRIGHT_BG_ONE)
         else
            self._textSelfRank:setString(Lang.get("worldboss_no"))
            self._self_rank_bk:setVisible(false)
            self._textSelfRank:setVisible(false)
            -- self._textSelfRank:setColor(Colors.BRIGHT_BG_ONE)
         end

         
        if #list == 0 then
            self._imageNoTimes:setVisible(true)
            self._imageNoTimes:setTipsString(Lang.get("worldboss_no_personal_rank"))
        end
    end
end

function WorldBossRankNode:getRankView(index)
	local rankView = self._rankView[index]
	if rankView == nil then
		rankView = self["_listViewTab"..index]
		rankView:setTemplate(WorldBossRankCell)
		rankView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		rankView:setCustomCallback(handler(self, self._onItemTouch))
		self._rankView[index] = rankView
	end
	return rankView
end


function WorldBossRankNode:_onItemTouch(index, id)
	--dump(id)
	--G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {id = reportId})
end



function WorldBossRankNode:_onItemUpdate(item, index)
    local dataList = self._dataList[self._tabIndex]
	if #dataList > 0 then
        local data = dataList[ index + 1 ]
		if data ~= nil then
			item:updateUI(index, data,self._tabIndex)
		end
	end
end

function WorldBossRankNode:_onItemSelected(item, index)

end

function WorldBossRankNode:onEnter()
    logWarn("WorldBossRankNode:onEnter")
    if self._tabIndex == nil then
        self._nodeTabRoot:setTabIndex(1)
    else
        self:_updateListView(self._tabIndex)
    end
   
end

function WorldBossRankNode:onExit()
	
end

function WorldBossRankNode:updateUI()
    self:_updateListView(self._tabIndex)

    --仅仅刷新数据
    local tabIndex = self._tabIndex
    self._tabListView:updateListViewEx(tabIndex,#self._dataList[tabIndex])
end

return WorldBossRankNode
