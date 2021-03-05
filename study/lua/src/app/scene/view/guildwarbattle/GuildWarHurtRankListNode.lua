
local ViewBase = require("app.ui.ViewBase")
local GuildWarHurtRankListNode = class("GuildWarHurtRankListNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarConst = require("app.const.GuildWarConst")

GuildWarHurtRankListNode.SHOW_RANK_NUM = 3

function GuildWarHurtRankListNode:ctor(cityId)
	self._cityId = cityId
    self._myGuildRankNode = nil--我的排名
    self._myGuildRankItem = nil
    self._listData = {}
	self._crystalConfig = nil

	local resource = {
		file = Path.getCSB("GuildWarHurtRankListNode", "guildwarbattle"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	GuildWarHurtRankListNode.super.ctor(self, resource)
end

function GuildWarHurtRankListNode:onCreate()
	self:_refreshData()
    local GuildWarHurtRankNode = require("app.scene.view.guildwarbattle.GuildWarHurtRankNode")
	self._listItemSource:setTemplate(GuildWarHurtRankNode)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

    self._myGuildRankItem = GuildWarHurtRankNode.new()
    self._myGuildRankNode:addChild(self._myGuildRankItem)

	
end

function GuildWarHurtRankListNode:onEnter()
    self._signalGuildWarBattleInfoSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(self, self._onEventGuildWarBattleInfoSyn))
	self._signalGuildWarBattleInfoGet = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(self, self._onEventGuildWarBattleInfoGet))
	self._signalGuildWarRankChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_RANK_CHANGE, handler(self, self._onEventGuildWarBattleRankChange))

    self:_updateView()
end

function GuildWarHurtRankListNode:onExit()
	self._signalGuildWarBattleInfoSyn:remove()
	self._signalGuildWarBattleInfoSyn = nil

	self._signalGuildWarBattleInfoGet:remove()
	self._signalGuildWarBattleInfoGet = nil

	self._signalGuildWarRankChange:remove()
    self._signalGuildWarRankChange = nil

end

function GuildWarHurtRankListNode:_onEventGuildWarBattleInfoSyn(event)
end

function GuildWarHurtRankListNode:_onEventGuildWarBattleRankChange(event)
     self:_updateList()
end



function GuildWarHurtRankListNode:_onEventGuildWarBattleInfoGet(event,cityId)
	self._cityId = cityId
	self:_refreshData()

	self:_updateView()
end

function GuildWarHurtRankListNode:_updateList()
  
	self._listData = GuildWarDataHelper.getGuildWarHurtRankList()

	
	self._listItemSource:clearAll()
	self._listItemSource:resize(math.min(#self._listData,GuildWarHurtRankListNode.SHOW_RANK_NUM))
end

function GuildWarHurtRankListNode:_onItemUpdate(item, index)
	if self._listData[index + 1] then
		item:updateUI(self._listData[index + 1],index + 1,self._crystalConfig.build_hp, false)
	end
end

function GuildWarHurtRankListNode:_onItemSelected(item, index)
end

function GuildWarHurtRankListNode:_onItemTouch(index)
end

function GuildWarHurtRankListNode:_refreshData()
	local pointId  = GuildWarDataHelper.getPointIdByCityIdPointType(self._cityId, GuildWarConst.POINT_TYPE_CRYSTAL)
	self._crystalConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._cityId,pointId)
end

function GuildWarHurtRankListNode:_refreshMyGuildRank()
    local rankData = GuildWarDataHelper.getMyGuildWarRankData(self._listData)
	if not rankData then
		self._myGuildRankItem:setVisible(false)
		return 
	end
	self._myGuildRankItem:setVisible(true)
    self._myGuildRankItem:updateUI(rankData,1,self._crystalConfig.build_hp)
end


function GuildWarHurtRankListNode:_updateView()
	self:_updateList()
    self:_refreshMyGuildRank()
end



return GuildWarHurtRankListNode 