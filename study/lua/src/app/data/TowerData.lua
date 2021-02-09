local BaseData = require("app.data.BaseData")
local EquipStage = require("app.config.equip_stage")
local TowerData = class("TowerData", BaseData)

local schema = {}
schema["now_layer"] = {"number", 0}
schema["now_star"]  = {"number", 0}
schema["max_layer"] = {"number", 0}
schema["max_star"]  = {"number", 0}
schema["layers"] 	= {"table", {}}
schema["surprises"] = {"table", {}}
schema["showStarEft"] = {"boolean", false}
schema["spuer_cnt"] = {"number", 0} 
schema["superStages"] = {"table", {}}
schema["showRewardSuperStageId"] = {"number", 0} 
schema["superStageSelectStageId"] = {"number", nil} 

TowerData.schema = schema

function TowerData:ctor(properties)
    TowerData.super.ctor(self, properties)
    self._listenerTowerData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetTower, handler(self, self._recvTowerData))
	self._listenerGetBox = G_NetworkManager:add(MessageIDConst.ID_S2C_GetTowerBox, handler(self, self._recvGetBox))
	self._listenerSurprise = G_NetworkManager:add(MessageIDConst.ID_S2C_ExecuteSurprise, handler(self, self._recvSurprise))
	self._listenerSweep = G_NetworkManager:add(MessageIDConst.ID_S2C_FastExecuteTower, handler(self, self._recvSweep))
	self._listenerExecute = G_NetworkManager:add(MessageIDConst.ID_S2C_ExecuteTower, handler(self, self._recvBattle))
	self._signalRecvRecoverInfo = G_SignalManager:add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(self, self._eventRecvRecoverInfo))
	self._s2cExecuteTowerSuperStageListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ExecuteTowerSuperStage, handler(self, self._s2cExecuteTowerSuperStage))

	self:_createSuperStageData()
end

function TowerData:clear()
	self._listenerTowerData:remove()
	self._listenerTowerData = nil
	self._listenerGetBox:remove()
	self._listenerGetBox = nil
	self._listenerSurprise:remove()
	self._listenerSurprise = nil
	self._listenerSweep:remove()
	self._listenerSweep = nil
	self._listenerExecute:remove()
	self._listenerExecute = nil
	self._signalRecvRecoverInfo:remove()
	self._signalRecvRecoverInfo = nil
	self._s2cExecuteTowerSuperStageListener:remove()
	self._s2cExecuteTowerSuperStageListener = nil
end

function TowerData:isNeedReset()
	return self:getNow_star() > 0
end

function TowerData:reset()
end

function TowerData:_recvTowerData(id, message)
	if message.ret ~= 1 then
		return
	end

	
	self:refreshData(message.tower)
	self:_refreshSuperStageData(message)
	self:resetTime()


	G_SignalManager:dispatch(SignalConst.EVENT_TOWER_GET_INFO)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_PVE_TOWER)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_TOWER_SUPER)
end

function TowerData:_eventRecvRecoverInfo(event)
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	if FunctionCheck.funcIsOpened(FunctionConst.FUNC_PVE_TOWER) then
		if  self:hasCountFull() then
			G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_PVE_TOWER)
		end
	end
end

function TowerData:getLayerByIndex(layerId)
	local layerList = self:getLayers()
	return layerList[layerId]
end

function TowerData:getSurpriseById(id)
	local surprises = self:getSurprises()
	for _, v in pairs(surprises) do
		if v:getSurprise_id() == id then
			return v
		end
	end
	return nil
end

function TowerData:refreshData(data)
	self:resetTime()

	self:setNow_layer(data.now_layer)
	self:setNow_star(data.now_star)
	self:setMax_layer(data.max_layer)
	self:setMax_star(data.max_star)
	if rawget(data, "layers") then
		local towerLayers = {}
		for i = 1, #data.layers do 
			local layer = require("app.data.TowerBaseData").new(data.layers[i])
			towerLayers[layer:getId()] = layer
		end
		self:setLayers(towerLayers)
	end	
	if rawget(data, "surprise") then
		local surprises = {}
		for i = 1, #data.surprise do 
			local surprise = require("app.data.TowerSurpriseData").new(data.surprise[i])
			table.insert(surprises, surprise)
		end
		self:setSurprises(surprises)
	end
end

function TowerData:_createSuperStageData()
	local EquipEssenceStage = require("app.config.equip_essence_stage")
  	local stageList = {}
    local stageCount = EquipEssenceStage.length()
    for i = 1, stageCount do
        local config = EquipEssenceStage.indexOf(i)
		self:_createSuperStageUnitData(stageList,config.id,false)
    end
	self:setSuperStages(stageList) 
end

--爬塔精英副本数据刷新
function TowerData:_refreshSuperStageData(message)
	self:setSpuer_cnt(message.spuer_cnt)
	local superSatgeUnitList = self:getSuperStages()
	local superSatgePassedIds = rawget(message,"tower_super_stage") or {}
	for k,v in ipairs(superSatgePassedIds) do
		if v ~= 0 then
			self:_createSuperStageUnitData(superSatgeUnitList,v,true)
		end
	end
end

function TowerData:_createSuperStageUnitData(list,stageId,pass)
	local stageUnitData = require("app.data.TowerSuperStageUnitData").new()
	stageUnitData:updateData({id = stageId,pass = pass})
	list[stageId] = stageUnitData
	return stageUnitData
end


function TowerData:isSuperStageOpen(stageId)
	local stageUnit = self:getSuperStageUnitData(stageId)
    if stageUnit:isPass() then
        return true
   end
   local config = stageUnit:getConfig()
   local nowLayer = self:getNow_layer()
  -- local layer = self:getLayerByIndex(config.need_equip_stage)

   if config.need_equip_stage ~= 0 then
   	  	local star = self:getHistoryStarByLayer(config.need_equip_stage)
		if star <= 0 then
			return false
		end
   end

 
   local needStageUnit = self:getSuperStageUnitData(config.need_id)
   if not needStageUnit then
   		return true
   end
   return needStageUnit:isPass()
end

function TowerData:_getSuperStageNextStageId(stageId)
	local EquipEssenceStage = require("app.config.equip_essence_stage")
	for i = 1,EquipEssenceStage.length(),1 do
		local config = EquipEssenceStage.indexOf(i)
		if config.need_equip_stage == stageId then
			return config.id
		end
	end
	return nil
end

function TowerData:getSuperStageUnitData(stageId)
	local superSatgeUnitList = self:getSuperStages()
	return superSatgeUnitList[stageId]
end 



function TowerData:receiveBox(layerId)
	local layerData = self:getLayerByIndex(layerId)
	if layerData then
		layerData:setReceive_box(true)
	end
end

--打开box
function TowerData:openBox(layerId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTowerBox, {layer = layerId})
end

--接受box
function TowerData:_recvGetBox(id, message)
    if message.ret ~= 1 then
        return
    end
    self:receiveBox(message.layer)
	local rewards = {}
    if rawget(message, "box_reward") then
        for i, v in pairs(message.box_reward) do
            local item = 
            {
                type = v.type,
                value = v.value,
                size = v.size,
            }
            table.insert(rewards, item)
        end
    end
	G_SignalManager:dispatch(SignalConst.EVENT_TOWER_GET_BOX, rewards)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_PVE_TOWER)
end

--打爬塔奇遇
function TowerData:executeSurprise(surpriseId)
   --判断是否过期
    if self:isExpired() == true then
        self:c2sGetTower()
        return
    end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ExecuteSurprise, { surprise_id = surpriseId })
end

--接受打爬塔奇遇
function TowerData:_recvSurprise(id, message)
    if message.ret ~= 1 then
        return
    end
    if rawget(message, "tower") then
        self:refreshData(message.tower)
    end
	G_SignalManager:dispatch(SignalConst.EVENT_TOWER_EXECUTE_SURPRISE, message)
end

--发送扫荡
function TowerData:sendSweep()
	G_NetworkManager:send(MessageIDConst.ID_C2S_FastExecuteTower, {}) 
end

--接收扫荡
function TowerData:_recvSweep(id, message)
    if message.ret ~= 1 then
        return
    end
    if rawget(message, "tower") then
        self:refreshData(message.tower)
    end

	local results = {}
    if rawget(message, "award") then
        for _, v in pairs(message.award) do
			local result = {}
			result.rewards = {}
            if rawget(v, "total_award") then
				result.from = "tower"
                for _, vv in pairs(v.total_award) do
                    local reward = {
                        type = vv.type,
                        value = vv.value,
                        size = vv.size,
                    }
                    table.insert(result.rewards, reward)
                end
            end

			if rawget(v, "add_award") then
				result.addRewards = {}
				for _, vv in pairs(v.add_award) do
					local reward = 
					{
						type = vv.award.type,
						value = vv.award.value,
						size = vv.award.size,
					}
					reward.index = vv.index
					table.insert(result.addRewards, reward)
				end
			end
			table.insert(results, result)

			if rawget(v, "box_award") then
				local boxResult = {}
                boxResult.from = "box"
				boxResult.rewards = {}
                for _, vv in pairs(v.box_award) do
                    local reward = {
                        type = vv.type,
                        value = vv.value,
                        size = vv.size,
                    }
                    table.insert(boxResult.rewards, reward)
                end
				table.insert(results, boxResult)
            end
        end
    end
	G_SignalManager:dispatch(SignalConst.EVENT_TOWER_SWEEP, results)
	
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_PVE_TOWER)

end

function TowerData:c2sGetTower()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTower,{})
end

--爬塔战斗
function TowerData:c2sExecuteTower(layerId, difficulty)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ExecuteTower, 
    {
        layer = layerId,
        star = difficulty,
    })	
end

function TowerData:pullData()
	 self:c2sGetTower()
end

--接收爬塔记录
function TowerData:_recvBattle(id, message)
	if message.ret ~= 1 then
		return
	end
	local nowLayer = self:getNow_layer()
	G_SignalManager:dispatch(SignalConst.EVENT_TOWER_EXECUTE, message)
    if rawget(message, "tower") then
        self:refreshData(message.tower)
    end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_PVE_TOWER)
	
	-- if  not message.battle_report.is_win then
	-- 	G_UserData:getRedPoint():clearRedPointShowFlag(	FunctionConst.FUNC_PVE_TOWER,{fullCount = true})
	-- end
end

--获得某层历史最高
function TowerData:getHistoryStarByLayer(layerId)
	local data = self:getLayerByIndex(layerId)
	if data then
		return data:getStar()
	end	
	return 0
end

function TowerData:hasRedPoint()
	local red1 = self:hasAttackOnceRedPoint()
	local red2 = self:hasBoxReward()
	local red3 = self:hasCountFullRedPoint()
	logWarn(tostring(red1).." xxx  "..tostring(red2).." "..tostring(red3))
	return red1 or red2  or red3
end

function TowerData:hasAttackOnceRedPoint()
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_PVE_TOWER,{attackOnce = true}
    )
	if showed then
		return false
	end
	return self:getNow_layer() <= 0
end

function TowerData:hasCountFullRedPoint()
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_PVE_TOWER,{fullCount = true}
    )
	if showed then
		return false
	end

	return self:hasCountFull()
end

--精英挑战红点（有攻击次数）
function TowerData:hasSuperStageChallengeCountRedPoint()
	return self:getSuperChallengeCount()  > 0
end

function TowerData:hasCountFull()
	local DataConst = require("app.const.DataConst")
	local userBaseData = G_UserData:getBase()
	local towerCount =  userBaseData:getResValue(DataConst.RES_TOWER_COUNT)
	local recoverUnit = G_RecoverMgr:getRecoverUnit(3) 
    local maxCount = recoverUnit:getMaxLimit()
	return towerCount >= maxCount
end

function TowerData:hasBoxReward()

	local nowLayer = self:getNow_layer()
    if nowLayer == 0 then
		return false
	end
	local nowLayerConfig = EquipStage.get(nowLayer)
	assert(nowLayerConfig, "equip_stage not find config by id "..tostring(nowLayer))
	local layerData = G_UserData:getTowerData():getLayerByIndex(nowLayer)
	return nowLayerConfig.box_id ~= 0 and layerData:getNow_star() > 0 and not layerData:isReceive_box()
end

function TowerData:getNextLayer()
	local nowLayer = self:getNow_layer()
	local nextLayer = 0
    if nowLayer == 0 then
       nextLayer = EquipStage.indexOf(1).id
    else
		local nowLayerConfig = EquipStage.get(nowLayer)
		if nowLayerConfig.box_id ~= 0 and not G_UserData:getTowerData():getLayerByIndex(nowLayer):isReceive_box() then  
			nextLayer = nowLayer
		else
			nextLayer = EquipStage.get(nowLayer).next_id
			if nextLayer == 0 then nextLayer = nowLayer end
		end
	end
	return nextLayer
end

--爬塔扫荡红点
function TowerData:hasTowerSweepRedPoint()
	local nowLayer = self:getNow_layer()
	local nextLayer = self:getNextLayer()
	if nextLayer == nowLayer then
		return false
	end
    local layerData = G_UserData:getTowerData():getLayerByIndex(nextLayer)
    if layerData and layerData:getStar() >= 3 then
		return true
    end
	return false
end


--sweepType 1 正常 2 扫荡
function TowerData:c2sExecuteTowerSuperStage(stageId,sweepType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ExecuteTowerSuperStage,{stage_id = stageId,type = sweepType})
end


function TowerData:_s2cExecuteTowerSuperStage(id, message)
    if message.ret ~= 1 then
        return
    end

	if rawget(message,"spuer_cnt") then
		self:setSpuer_cnt(message.spuer_cnt)
	end
	-- local stageId = rawget(message,"stage_id") 
	-- local stageUnitData = self:getSuperStageUnitData(stageId)
	-- if rawget(message,"battle_report") and message.battle_report.is_win then
	-- 	self:_createSuperStageUnitData(self:getSuperStages(),stageId,true)
	-- 	if  not stageUnitData:isPass() then
	-- 		self:setShowRewardSuperStageId(stageUnitData:getId())
	-- 		local nextStageId = self:_getSuperStageNextStageId(stageUnitData:getId())
	-- 		if nextStageId then
	-- 			self:setSuperStageSelectStageId(nextStageId)
	-- 		end
	-- 	end
	-- end

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_TOWER_SUPER)
	-- G_SignalManager:dispatch(SignalConst.EVENT_TOWER_EXECUTE_SUPER,message,stageUnitData)
	G_SignalManager:dispatch(SignalConst.EVENT_TOWER_EXECUTE_SUPER,message)
end

function TowerData:processStageUnitData(stageId, isWin)
	local stageUnitData = self:getSuperStageUnitData(stageId)
	if isWin then
		self:_createSuperStageUnitData(self:getSuperStages(),stageId,true)
		if  not stageUnitData:isPass() then
			self:setShowRewardSuperStageId(stageUnitData:getId())
			local nextStageId = self:_getSuperStageNextStageId(stageUnitData:getId())
			if nextStageId then
				self:setSuperStageSelectStageId(nextStageId)
			end
		end
	end
	return stageUnitData
end


function TowerData:getSuperStageList()
	local superSatgeUnitList = self:getSuperStages()
	local stageList = {}
	local unOpenCount = 0
	for k,v in pairs(superSatgeUnitList) do
		table.insert( stageList, v)
	end
	local sortfunction = function (obj1,obj2)
		return obj1:getId() < obj2:getId()
	end
	table.sort(stageList, sortfunction )
	local newStageList = {}
	for k,v in pairs(stageList) do
		if not G_UserData:getTowerData():isSuperStageOpen(v:getId())  then
			unOpenCount = unOpenCount + 1
		end
		if unOpenCount > 3 then
			break
		end
		table.insert( newStageList, v)
	end
	return newStageList
end

function TowerData:getSuperChallengeCount()
	local UserDataHelper = require("app.utils.UserDataHelper")
	local ParameterIDConst = require("app.const.ParameterIDConst")
	local count = G_UserData:getTowerData():getSpuer_cnt()
	local totalCount = UserDataHelper.getParameter(ParameterIDConst.TOWER_SUPER_CHALLENGE_MAX_TIME)
	return totalCount-count
end


return TowerData

