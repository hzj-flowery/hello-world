--跨服军团boss
local ViewBase = require("app.ui.ViewBase")
local CrossWorldBossRankNode = class("CrossWorldBossRankNode", ViewBase)
local CrossWorldBossConst = require("app.const.CrossWorldBossConst")
local TextHelper = require("app.utils.TextHelper")
local CrossWorldBossRankCell = import(".CrossWorldBossRankCell")
local TabScrollView = require("app.utils.TabScrollView")
function CrossWorldBossRankNode:ctor()
    self._dataList = {}
    self._imageNoTimes = nil
    self._listViewTab1 = nil
    self._listViewTab2 = nil
    self._tabIndex = 1

    local resource = {
        file = Path.getCSB("CrossWorldBossRankNode", "crossworldboss"),
        binding = {
            _tab1 = {
				events = {{event = "touch", method = "_onClickMidTab1Icon"}}
			},
			_tab2 = {
				events = {{event = "touch", method = "_onClickMidTab2Icon"}}
			},
			_btnArrow = {
                events = {{event = "touch", method = "_onButtonArrow"}}
            },
		}
    }
    CrossWorldBossRankNode.super.ctor(self, resource)
    self:setName("CrossWorldBossRankNode")
end


function CrossWorldBossRankNode:onCreate()
    local scrollViewParam = {
		template = CrossWorldBossRankCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView,scrollViewParam)


    self._imageNoTimes:setVisible(false)
    self:getSubNodeByName("_panelGuildRank"):setVisible(false)
    self:getSubNodeByName("_panelPersonalRank"):setVisible(false)
    self:getSubNodeByName("_panelNoGuild"):setVisible(false)

    self:_initPosition()
end

function CrossWorldBossRankNode:_initItemTabName()

end

function CrossWorldBossRankNode:_onClickMidTab1Icon()
	if self._tabIndex == 1 then
		return
	end
	self._tabIndex = 1
	self:_switchTab()
	self:_updateListView(self._tabIndex)
end

function CrossWorldBossRankNode:_onClickMidTab2Icon()
	if self._tabIndex == 2 then
		return
	end
	self._tabIndex = 2
	self:_switchTab()
	self:_updateListView(self._tabIndex)
end

function CrossWorldBossRankNode:_switchTab()
	self._tabIcon1:setVisible(self._tabIndex == 1)
	self._tabIcon2:setVisible(self._tabIndex == 2)
	if self._tabIndex == 1 then
		self._name1:setColor(cc.c3b(0xc7, 0x5d, 0x09))
		--self._name1:enableOutline(cc.c3b(0xff, 0xcf, 0x77), 2) 
		self._name2:setColor(cc.c3b(0xe5, 0x89, 0x46))
		--self._name2:enableOutline(cc.c3b(0x9c, 0x32, 0x11), 2) 
	else
		self._name1:setColor(cc.c3b(0xe5, 0x89, 0x46))
		--self._name1:enableOutline(cc.c3b(0x9c, 0x32, 0x11), 2) 
		self._name2:setColor(cc.c3b(0xc7, 0x5d, 0x09))
		--self._name2:enableOutline(cc.c3b(0xff, 0xcf, 0x77), 2) 
	end
end

function CrossWorldBossRankNode:_initPosition( ... )
    self._oriPosition = cc.p(self._nodeContent:getPosition())
    local oriSize = self._panelBase:getContentSize() 
    self._newTargetPos = cc.p(self._oriPosition.x - oriSize.width, self._oriPosition.y)
end


function CrossWorldBossRankNode:_updateListView(tabIndex)
	tabIndex = tabIndex or 1
	self._dataList[CrossWorldBossConst.TAB_INDEX_GUILD] = G_UserData:getCrossWorldBoss():getGuild_rank()
    self._dataList[CrossWorldBossConst.TAB_INDEX_PERSONAL] = G_UserData:getCrossWorldBoss():getUser_rank()    
    self:_updateMyData(self._tabIndex)

    if self._dataList[tabIndex] then
        self._tabListView:updateListView(tabIndex, #self._dataList[tabIndex], nil, true)
    end
end

function CrossWorldBossRankNode:_onButtonArrow(sender)
    if sender then
        self._isAutoArrow = (not self._isAutoArrow)
    end

    local bVisible = (not self._panelBase:isVisible())
    self._imageArrow:setFlippedX(not bVisible)    
    if bVisible then
        self._panelBase:setVisible(true)
        self._nodeContent:runAction(cc.Sequence:create(
            cc.CallFunc:create(function() end),
            cc.MoveBy:create(0.2, cc.pSub(self._oriPosition, self._newTargetPos))
        ))
    else
        self._nodeContent:runAction(cc.Sequence:create(
            cc.MoveBy:create(0.2, cc.pSub(self._newTargetPos, self._oriPosition)),
            cc.CallFunc:create(function() self._panelBase:setVisible(false) end)
        ))
    end
end


function CrossWorldBossRankNode:_updateMyData(tabIndex)
    local list = self._dataList[tabIndex]

    self:getSubNodeByName("_panelGuildRank"):setVisible(false)
    self:getSubNodeByName("_panelPersonalRank"):setVisible(false)
    self:getSubNodeByName("_panelNoGuild"):setVisible(false)

    self._imageNoTimes:setVisible(false)
    if tabIndex == CrossWorldBossConst.TAB_INDEX_GUILD then
       -- self:getSubNodeByName("Image_title_bg1"):setVisible(true)
        local isInGuild = G_UserData:getGuild():isInGuild()
        if isInGuild then
            local guildRank = G_UserData:getCrossWorldBoss():getSelf_guild_rank()
            local guildPoint = G_UserData:getCrossWorldBoss():getGuild_point()    
            self:getSubNodeByName("_panelGuildRank"):setVisible(true)
            --self._textGuildRank:setString(guildRank)
    
            if guildPoint > 0 then
                self._textGuildScore:setString(TextHelper.getAmountText(guildPoint))
                --self._textGuildScore:setColor(Colors.BRIGHT_BG_ONE)
            else
                self._textGuildScore:setString(Lang.get("worldboss_no"))
                --self._textGuildScore:setColor(Colors.BRIGHT_BG_ONE)
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
            self:getSubNodeByName("_panelNoGuild"):setVisible(true)
        end

        if not list or #list == 0 then
            self._imageNoTimes:setVisible(true)
            self._imageNoTimes:setTipsString(Lang.get("worldboss_no_guild_rank"))
        end

    end

    if tabIndex == CrossWorldBossConst.TAB_INDEX_PERSONAL then
         local userRank = G_UserData:getCrossWorldBoss():getSelf_user_rank()
         local userPoint = G_UserData:getCrossWorldBoss():getUser_point()
         --self:getSubNodeByName("Image_title_bg2"):setVisible(true)
         self:getSubNodeByName("_panelPersonalRank"):setVisible(true)

         if userPoint > 0 then
            self._textSelfScore:setString(TextHelper.getAmountText(userPoint))
            --self._textSelfScore:setColor(Colors.BRIGHT_BG_ONE)
         else
            self._textSelfScore:setString(Lang.get("worldboss_no"))
            --self._textSelfScore:setColor(Colors.BRIGHT_BG_ONE)
         end
         if userRank > 0 then
            self._textSelfRank:setString(userRank)
            self._self_rank_bk:setVisible(true)
            self._textSelfRank:setVisible(true)

            if userRank <= 3 then
                self._textSelfRank:setVisible(false)
                self._self_rank_bk:loadTexture(Path.getArenaUI("img_qizhi0"..userRank))
            else
                self._textSelfRank:setVisible(true)
                self._self_rank_bk:loadTexture(Path.getArenaUI("img_qizhi04"))
            end
            -- self._textSelfRank:setColor(Colors.BRIGHT_BG_ONE)

            self._self_rank_bk:setContentSize(cc.size(30,40))
         else
            self._textSelfRank:setString(Lang.get("worldboss_no"))
            self._self_rank_bk:setVisible(false)
            self._textSelfRank:setVisible(false)
            -- self._textSelfRank:setColor(Colors.BRIGHT_BG_ONE)
         end

         
        if not list or #list == 0 then
            self._imageNoTimes:setVisible(true)
            self._imageNoTimes:setTipsString(Lang.get("worldboss_no_personal_rank"))
        end
    end
end


function CrossWorldBossRankNode:_onItemTouch(index, id)
	--dump(id)
	--G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {id = reportId})
end



function CrossWorldBossRankNode:_onItemUpdate(item, index)
    local dataList = self._dataList[self._tabIndex]
	if dataList and #dataList > 0 then
        local data = dataList[ index + 1 ]
		if data ~= nil then
			item:updateUI(index, data,self._tabIndex)
		end
	end
end

function CrossWorldBossRankNode:_onItemSelected(item, index)

end

function CrossWorldBossRankNode:onEnter()
    self._signalUpdateRankInfo = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_UPDATE_RANK, handler(self, self.updateUI))

    logWarn("CrossWorldBossRankNode:onEnter")
    if self._tabIndex == nil then
        self:_updateListView(1)
    else
        self:_updateListView(self._tabIndex)
    end
   
end

function CrossWorldBossRankNode:onExit()
    self._signalUpdateRankInfo:remove()
    self._signalUpdateRankInfo = nil
end

function CrossWorldBossRankNode:updateUI()
    self:_updateListView(self._tabIndex)
end

return CrossWorldBossRankNode
