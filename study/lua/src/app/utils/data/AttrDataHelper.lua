-- 
-- Author: Liangxu
-- Date: 2017-12-26 15:55:15
-- 属性数据帮助类
local AttrDataHelper = {}
local TextHelper = require("app.utils.TextHelper")
local AttributeConst = require("app.const.AttributeConst")

function AttrDataHelper.formatAttr(info, attrType, attrValue)
	assert(type(info) == "table", "AttrDataHelper.appendAttr info have to be table")
	if attrType > 0 then
		if info[attrType] == nil then
			info[attrType] = 0
		end
		info[attrType] = info[attrType] + attrValue
	end
end


function AttrDataHelper.fromatAttrEx(info, attrType, attrValue)
	assert(type(info) == "table", "AttrDataHelper.appendAttr info have to be table")
	if attrType > 0 then
		if info[attrType] == nil then
			info[attrType] = 0
		end
		info[attrType] = attrValue
	end
end


function AttrDataHelper.replaceAttr(tarAttr, srcAttr)
	for type, value in pairs(srcAttr) do
		AttrDataHelper.fromatAttrEx(tarAttr, type, value)
	end
end

function AttrDataHelper.appendAttr(tarAttr, srcAttr)
	for type, value in pairs(srcAttr) do
		AttrDataHelper.formatAttr(tarAttr, type, value)
	end
end

function AttrDataHelper.createRecordUnitData(id, attr)
	return {id = id, attr = attr}
end

function AttrDataHelper.getPromptContent(attrId, value)
	local absValue = math.abs(value)
	local attrName, attrValue = TextHelper.getAttrBasicText(attrId, absValue)
	local color = value >= 0 and Colors.colorToNumber(Colors.getColor(2)) or Colors.colorToNumber(Colors.getColor(6))
	local outlineColor = value >= 0 and Colors.colorToNumber(Colors.getColorOutline(2)) or Colors.colorToNumber(Colors.getColorOutline(6))
	attrValue = value >= 0 and " + "..attrValue or " - "..attrValue
	local content = Lang.get("summary_attr_change", {attr = attrName..attrValue, color = color, outlineColor = outlineColor})
	return content
end

function AttrDataHelper.getBoutContentActive(attrId, value)
	local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
	--local color = value >= 0 and Colors.colorToNumber(Colors.getColor(2)) or Colors.colorToNumber(Colors.getColor(6))
	attrValue ="+"..attrValue
	local content = Lang.get("bout_attr_active", {attr = attrName..attrValue})
	return content
end

function AttrDataHelper.getPowerFormula(attrInfo)
	local map = {}
	local AttrCfg = require("app.config.attribute")
	local length = AttrCfg.length()
	for i = 1, length do
		local info = AttrCfg.indexOf(i)
		local enName = info.en_name
		local upperEnName = string.upper(enName)
		local key = "#" .. upperEnName .."#"
		local value = attrInfo[info.id] or 0

		if info.type == 2 then --是千分比数字
			value = value / 1000
		end
		map[key] = value
	end

	local formula = require("app.config.formula").get(3).formula
	for k, v in pairs(map) do
		formula = string.gsub(formula, k, v)
	end

	return formula
end

function AttrDataHelper.calPower(formula)
	local func = loadstring("return "..formula)
	local power = func()

	return math.floor(power)
end

function AttrDataHelper.getPower(attrInfo)
	local formula = AttrDataHelper.getPowerFormula(attrInfo)
	local power = AttrDataHelper.calPower(formula)
	return power
end

--处理防御属性和加成
function AttrDataHelper.processDefAndAddition(attr)
	AttrDataHelper.processDef(attr)
	AttrDataHelper.processAddition(attr)
	AttrDataHelper.processSpecial(attr) --先计算加成，再处理特殊属性
end

function AttrDataHelper.processDef(attr)
	for k, v in pairs(attr) do --防御值特殊处理
		local defList = AttributeConst.DEF_MAPPING[k]
		if defList then
			local defValue = attr[k]
			for i, defId in ipairs(defList) do
				if attr[defId] == nil then
					attr[defId] = 0
				end
				attr[defId] = attr[defId] + defValue
			end
		end
	end
end

function AttrDataHelper.processAddition(attr)
	for k, v in pairs(attr) do
		local attrPerId = AttributeConst.MAPPING[k] --属性加成Id
		if attrPerId then
			local attrPerValue = attr[attrPerId]
			if attrPerValue then
				attr[k] = math.floor(attr[k] * (1 + attrPerValue / 1000))
			end
		end
	end
end

function AttrDataHelper.processSpecial(attr)
	local tempAttr = clone(attr)
	for k, v in pairs(tempAttr) do
		local attrId = AttributeConst.SPECIAL_MAPPING[k]
		if attrId then
			if attr[attrId] == nil then
				attr[attrId] = 0
			end
			attr[attrId] = attr[attrId] + v
		end
	end
end

function AttrDataHelper.isSpecialAttrId(attrId)
	for k, v in pairs(AttributeConst.SPECIAL_MAPPING) do
		if k == attrId then
			return true
		end
	end
	return false
end

return AttrDataHelper