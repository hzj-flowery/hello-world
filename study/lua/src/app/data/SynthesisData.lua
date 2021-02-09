--
-- Author: hyl
-- Date: 2019-06-21 15:33:03
-- 合成数据

local BaseData = require("app.data.BaseData")
local SynthesisData = class("SynthesisData", BaseData)
local UserDataHelper = require("app.utils.UserDataHelper")
local SynthesisConfig = require("app.config.synthesis")
local SynthesisDataHelper = require("app.utils.data.SynthesisDataHelper")

local schema = {}
schema["awards"] = {"table", 0} --当前选中的宝物Id
SynthesisData.schema = schema

function SynthesisData:ctor(properties)
	SynthesisData.super.ctor(self, properties)

	self._recvSynthesisResult = G_NetworkManager:add(MessageIDConst.ID_S2C_Synthesis, handler(self, self._s2cRecvSynthesisResult))
end

function SynthesisData:clear()
	self._recvSynthesisResult:remove()
	self._recvSynthesisResult = nil
end

function SynthesisData:reset()
	
end

function SynthesisData:_isConfigSynthesisOpen(configData)
	local gameUserLevel = G_UserData:getBase():getLevel()
	local treeLevel = G_UserData:getHomeland():getMainTreeLevel()
	if gameUserLevel>=configData.level
		and (configData.condition_type==0 or configData.condition_type==3 and treeLevel>=configData.condition_value) then
		return true
	end
	return false
end

function SynthesisData:getSynthesisConfigData ()
	local data = {}  -- 以合成type为key，value为每一种合成配置的id的数组

	local configLength = SynthesisConfig.length()
	for index = 1, configLength do 
		local configData = SynthesisConfig.get(index)
		if SynthesisData:_isConfigSynthesisOpen(configData) then
			local type = configData.type
			data[type] = data[type] or {}
			table.insert( data[type], index )
		end
	end

	return data
end

function SynthesisData:getDataTypes (data)
	if data == nil then return {} end

	local types = {}

	for type, v in pairs(data) do 
		table.insert( types, type )
	end

	-- 按开启等级排序
	local sortFunc = function (a, b) 
		local a_id = data[a][1]
		local b_id = data[b][1]
		local a_config = SynthesisConfig.get(a_id)
		local b_config = SynthesisConfig.get(b_id)

		return a_config.level < b_config.level
	end

	table.sort( types, sortFunc )

	dump(types)

	return types
end

function SynthesisData:checkCanSynthesis()
	local configData = self:getSynthesisConfigData()
		
	if #configData == 0 then
		return false
	end

	local canSynthesis = false

	for type, v in pairs(configData) do
		for index, id in pairs(configData[type]) do
			canSynthesis = self:checkMaterailEnoughById(id)
			if canSynthesis == true then 
				return canSynthesis 
			end
		end
	end

	return canSynthesis
end

function SynthesisData:checkMaterailEnoughByType (configData, type)
	if configData[type] == nil or 
		#configData[type] == 0 then
		return false
	end

	local isMaterialEnough = true

	for index, id in pairs(configData[type]) do
		local id = configData[type][index]
		isMaterialEnough = self:checkMaterailEnoughById(id)
		if isMaterialEnough == true then break end
	end

	return isMaterialEnough
end

function SynthesisData:checkMaterailEnoughById(id)
	local configInfo = SynthesisConfig.get(id)

	-- 置换（type==2）不需要显示红点
	if configInfo == nil or configInfo.type == 2 then
		return false
	end

	local num = SynthesisDataHelper.getSynthesisMaterilNum(configInfo)
	
	local isMaterialEnough = true

	local ownCostNum = UserDataHelper.getNumByTypeAndValue(configInfo.cost_type, configInfo.cost_value)

	for index = 1, num do
		local type = configInfo["material_type_"..index]
		local value = configInfo["material_value_"..index]
		local size = configInfo["material_size_"..index]
		local ownNum = UserDataHelper.getNumByTypeAndValue(type, value)

		if ownNum < size or ownCostNum < configInfo.cost_size then
			isMaterialEnough = false
			break
		end
	end

	return isMaterialEnough
end

---------------------------------------------------------------------------------------------

function SynthesisData:c2sGetSynthesisResult(synthesis_id)
	--print("synthesis_id "..synthesis_id)
	G_NetworkManager:send(MessageIDConst.ID_C2S_Synthesis, {
			id = synthesis_id
    })
end

function SynthesisData:_s2cRecvSynthesisResult (id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
    
  	G_SignalManager:dispatch(SignalConst.EVENT_SYNTHESIS_RESULT, awards)
end

return SynthesisData

