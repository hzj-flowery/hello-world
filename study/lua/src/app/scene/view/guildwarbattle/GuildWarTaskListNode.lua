
local ViewBase = require("app.ui.ViewBase")
local GuildWarTaskListNode = class("GuildWarTaskListNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local GuildWarConst = require("app.const.GuildWarConst")


GuildWarTaskListNode.SHOW_RANK_NUM = 3

function GuildWarTaskListNode:ctor(cityId)
    self._cityId = cityId

    self._taskNodeParent = nil
    self._guildWarTaskNode = nil
    self._listView = nil
    self._listData = {}
	self._crystalConfig = nil
    self._buildList = nil
    self._isClose = false
	local resource = {
		file = Path.getCSB("GuildWarTaskListNode", "guildwarbattle"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            _imageArrow = {
				events = {{event = "touch", method = "_onButtonArrow"}}
			},

		}
	}
	GuildWarTaskListNode.super.ctor(self, resource)
end

function GuildWarTaskListNode:onCreate()

    local GuildWarHurtRankNode = require("app.scene.view.guildwarbattle.GuildWarHurtRankNode")
	self._listItemSource:setTemplate(GuildWarHurtRankNode)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

    local GuildWarTaskNode = require("app.scene.view.guildwarbattle.GuildWarTaskNode")
    local node = GuildWarTaskNode.new()
    self._guildWarTaskNode = node
    self._taskNodeParent:addChild(node)

    self:_refreshData()

end

function GuildWarTaskListNode:onEnter()
    self._signalGuildWarBattleInfoSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_SYN, handler(self, self._onEventGuildWarBattleInfoSyn))
	self._signalGuildWarBattleInfoGet = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BATTLE_INFO_GET, handler(self, self._onEventGuildWarBattleInfoGet))
    self._signalGuildWarCampReverse = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_CAMP_REVERSE, handler(self, self._onEventGuildWarCampReverse ))
    self._signalGuildWarRankChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_RANK_CHANGE, handler(self, self._onEventGuildWarBattleRankChange))
    self._signalGuildWarBuildingChange = G_SignalManager:add(SignalConst.EVENT_GUILD_WAR_BUILDING_CHANGE, handler(self, self._onEventGuildWarBattleBuildingChange))

    self:_refreshView()
end

function GuildWarTaskListNode:onExit()
    self._signalGuildWarBattleInfoSyn:remove()
	self._signalGuildWarBattleInfoSyn = nil

	self._signalGuildWarBattleInfoGet:remove()
	self._signalGuildWarBattleInfoGet = nil

    self._signalGuildWarCampReverse:remove()
    self._signalGuildWarCampReverse = nil

    self._signalGuildWarRankChange:remove()
    self._signalGuildWarRankChange = nil

    self._signalGuildWarBuildingChange:remove()
    self._signalGuildWarBuildingChange = nil
end

function GuildWarTaskListNode:_onEventGuildWarBattleInfoSyn(event)
    
end

function GuildWarTaskListNode:_onEventGuildWarBattleInfoGet(event,cityId)
    self._cityId = cityId
    self:_refreshData()
	self:_refreshView()
end

function GuildWarTaskListNode:_onEventGuildWarCampReverse(event)
	self:_refreshTaskNodeList()
end

function GuildWarTaskListNode:_onEventGuildWarBattleRankChange(event)
     self:_updateList()
end

function GuildWarTaskListNode:_onEventGuildWarBattleBuildingChange(event)
    self:_refreshTaskNodeList()
end



function GuildWarTaskListNode:_refreshData()
    local pointId  = GuildWarDataHelper.getPointIdByCityIdPointType(self._cityId, GuildWarConst.POINT_TYPE_CRYSTAL)
	self._crystalConfig = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(self._cityId,pointId)
    self._buildList = GuildWarDataHelper.getGuildWarBuildingList(self._cityId)
end


function GuildWarTaskListNode:_refreshTaskNodeList()
    --local targetDataList = GuildWarDataHelper.getGuildWarTargetList(self._cityId,self._buildList)
    --local firstTarget = targetDataList[1]
    --local pointType = firstTarget.point_type

    local pointType = GuildWarConst.POINT_TYPE_CRYSTAL 


    local isDefender = GuildWarDataHelper.selfIsDefender(self._cityId)
    local taskData = nil 
    if isDefender then
        taskData = {des = Lang.get("guildwar_point_task_des_list2")[pointType] }
    else
        taskData = {des = Lang.get("guildwar_point_task_des_list")[pointType] }
    end
    self._guildWarTaskNode:updateUI(taskData)

end

function GuildWarTaskListNode:_refreshView()
    self:_refreshTaskNodeList()
    self:_updateList()
end

function GuildWarTaskListNode:_updateList()
	self._listData = GuildWarDataHelper.getGuildWarHurtRankList()
	self._listItemSource:clearAll()
	self._listItemSource:resize(math.min(#self._listData,GuildWarTaskListNode.SHOW_RANK_NUM))
	local size = #self._listData
     --列表框显示逻辑
    if size == 0 then
        self._imageTaskBg:setVisible(false)
        return
    elseif size == 1 then
        self._listItemSource:setContentSize(cc.size(234,37))
        self._listItemSource:setTouchEnabled(false)
    elseif size == 2 then
        self._listItemSource:setContentSize(cc.size(234,74))
        self._listItemSource:setTouchEnabled(false)
    elseif size == 3 then
        self._listItemSource:setContentSize(cc.size(234,111))
        self._listItemSource:setTouchEnabled(false)
    end
    self._imageTaskBg:setVisible(true)
end

function GuildWarTaskListNode:_onItemUpdate(item, index)
	if self._listData[index + 1] then
		item:updateUI(self._listData[index + 1],index + 1,self._crystalConfig.build_hp, true)
	end
end

function GuildWarTaskListNode:_onItemSelected(item, index)
end

function GuildWarTaskListNode:_onItemTouch(index)
end


function GuildWarTaskListNode:_onButtonArrow(sender)
    local isClose = not self._isClose
    self:_setWindowState(isClose)
end

function GuildWarTaskListNode:_setWindowState(isClose)
    self._isClose = isClose
    local posX = self._imageArrow:getPositionX()
    self._imageArrow:setPositionX(self._isClose and 100 or 276)
    self._imageArrow:setScale( self._isClose and -1 or 1)
    self._imageTaskBg:setVisible(not self._isClose)
    
end


return GuildWarTaskListNode 