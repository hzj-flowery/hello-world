--
-- Author: Liangxu
-- Date: 2017-04-24 15:03:43
-- 装备大师帮助类
local EquipMasterHelper = {}
local MasterConst = require("app.const.MasterConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local curMasterType = 0

function EquipMasterHelper.getMasterTabNameList()
	local result = {}

	table.insert(result, Lang.get("equipment_master_tab_title_"..MasterConst.MASTER_TYPE_1))
	table.insert(result, Lang.get("equipment_master_tab_title_"..MasterConst.MASTER_TYPE_2))
	table.insert(result, Lang.get("equipment_master_tab_title_"..MasterConst.MASTER_TYPE_3))
	table.insert(result, Lang.get("equipment_master_tab_title_"..MasterConst.MASTER_TYPE_4))

	return result
end

function EquipMasterHelper.getCurMasterInfo(pos, curMasterType)
	if curMasterType == MasterConst.MASTER_TYPE_1 or curMasterType == MasterConst.MASTER_TYPE_2 then
		return EquipMasterHelper._getEquipMasterInfo(pos, curMasterType)
	elseif curMasterType == MasterConst.MASTER_TYPE_3 or curMasterType == MasterConst.MASTER_TYPE_4 then
		return EquipMasterHelper._getTreasureMasterInfo(pos, curMasterType)
	end
end

function EquipMasterHelper._getEquipMasterInfo(pos, curMasterType)
	local result = {}
	result.type = TypeConvertHelper.TYPE_EQUIPMENT
	result.info = {}
	local equipInfo = G_UserData:getBattleResource():getEquipInfoWithPos(pos)
	for i = 1, 4 do
		local info = {}
		local equipId = equipInfo[i]
		if equipId then
			local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
			local equipBaseId = equipData:getBase_id()
			local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId)
			
			local curLevel = 0
			if curMasterType == MasterConst.MASTER_TYPE_1 then
				curLevel = equipData:getLevel()
			elseif curMasterType == MasterConst.MASTER_TYPE_2 then
				curLevel = equipData:getR_level()
			end

			
			info.equipId = equipId
			info.equipParam = equipParam
			info.curLevel = curLevel
		end
		result.info[i] = info
	end

	local masterInfo = {}
	if curMasterType == MasterConst.MASTER_TYPE_1 then
		masterInfo = UserDataHelper.getMasterEquipStrengthenInfo(pos)
	elseif curMasterType == MasterConst.MASTER_TYPE_2 then
		masterInfo = UserDataHelper.getMasterEquipRefineInfo(pos)
	end

	result.masterInfo = masterInfo
	
	return result
end

function EquipMasterHelper._getTreasureMasterInfo(pos, curMasterType)
	local result = {}
	result.type = TypeConvertHelper.TYPE_TREASURE
	result.info = {}
	local treasureInfo = G_UserData:getBattleResource():getTreasureInfoWithPos(pos)
	for i = 1, 2 do
		local info = {}
		local treasureId = treasureInfo[i]
		if treasureId then
			local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
			local treasureBaseId = treasureData:getBase_id()
			local treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId)
			
			local curLevel = 0
			if curMasterType == MasterConst.MASTER_TYPE_3 then
				curLevel = treasureData:getLevel()
			elseif curMasterType == MasterConst.MASTER_TYPE_4 then
				curLevel = treasureData:getRefine_level()
			end

			info.equipId = treasureId
			info.equipParam = treasureParam
			info.curLevel = curLevel
		end
		result.info[i] = info
	end

	local masterInfo = 0
	if curMasterType == MasterConst.MASTER_TYPE_3 then
		masterInfo = UserDataHelper.getMasterTreasureUpgradeInfo(pos)
	elseif curMasterType == MasterConst.MASTER_TYPE_4 then
		masterInfo = UserDataHelper.getMasterTreasureRefineInfo(pos)
	end

	result.masterInfo = masterInfo
	
	return result
end

function EquipMasterHelper.isOpen(funcId)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOpen, des = LogicCheckHelper.funcIsOpened(funcId)
	if not isOpen then
		G_Prompt:showTip(des)
		return false
	end
	return true
end

function EquipMasterHelper.isFull(pos)
	local isFullEquip = G_UserData:getBattleResource():isFullEquip(pos)
	local isFullTreasure = G_UserData:getBattleResource():isFullTreasure(pos)
	if isFullEquip or isFullTreasure then
		return true
	else
		if not isFullEquip then
			G_Prompt:showTip(Lang.get("master_equip_not_full_tip"))
			return false
		end
		if not isFullTreasure then
			G_Prompt:showTip(Lang.get("master_treasure_not_full_tip"))
			return false
		end
	end
end

return EquipMasterHelper