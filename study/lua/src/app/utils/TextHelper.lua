
-- TextHelper

--[[
	文本辅助类
    主要提供一系列将字符串或者数字转换成相应格式的工具类
]]

local TextHelper = {}

--根据服务器下发的keyValue格式，生成文本描述内容
function TextHelper.convertKeyValuePairs(sourceText, kvPairs)
     if not sourceText or type(kvPairs) ~= "table" then
        return ""
    end

    local tempText = sourceText
    local key = nil
    local value = nil
    for i=1, #kvPairs do
        tempText, key, value = TextHelper.convertKeyValuePair( tempText, kvPairs[i] )
    end
    --将多余配置参数清掉，因为有时候服务器下发的数据，比配置表里的参数要少
    local resultText = string.gsub(tempText, "#%w+#", "") 

    return resultText
end


function TextHelper.convertKeyValuePair( sourceText, kvPair )
    if not sourceText or type(kvPair) ~= "table" then
        return ""
    end

    if not rawget(kvPair, "key") or not rawget(kvPair,"value") then
        return ""
    end
    local value = kvPair.value 
    value = string.gsub(value,"%%","%%%%")
    local tempText = string.gsub(sourceText, "#" .. kvPair.key .. "#", value)

    return tempText, kvPair.key, kvPair.value
end

--转换基于knight_info表中的job字段所表示的中文文本job 读取字knight_info中的job
function TextHelper.getHeroJobText(job)
	--1-主角 2-防御型 3-攻击型 4-辅助型

	local key
	if job == 1 then
		key = "common_knight_job_master"
	elseif job == 2 then
		key = "common_knight_job_def"
	elseif job == 3 then
		key = "common_knight_job_atk"
	elseif job == 4 then
		key = "common_knight_job_sup"
	end

	assert(key, "Invalid knight job: "..tostring(job))

	return Lang.get(key)
end

--[[
	将一个字符串按照单个字符转换成字符数组（table）
	str 所需的字符串
    返回的字符数组
]]
function TextHelper.getStringTable(str)

	assert(type(str) == "string", "Invalid str: "..tostring(str))

    local list = {}
    local len = string.len(str)
    local i = 1
    while i <= len do
        local c = string.byte(str, i)
        local shift = 1
        if c > 0 and c <= 127 then
            shift = 1
        elseif (c >= 192 and c <= 223) then
            shift = 2
        elseif (c >= 224 and c <= 239) then
            shift = 3
        elseif (c >= 240 and c <= 247) then
            shift = 4
        end
        local char = string.sub(str, i, i + shift - 1)
        i = i + shift
        table.insert(list, char)
    end
    return list
end

--[[
	将数量换算成中文文本
	规则是小于100万的显示数字全部，否则就按照xx万的方式显示
	amount 需要转换的数量
    return 返回转换后的数量文本
]]

function TextHelper.getAmountText(amount)

	assert(type(amount) == "number", "Invalid amount: "..tostring(amount))

    if amount >= 1000000 then
    	return Lang.get(
			"lang_common_format_amount_unit_wan", -- xx万文本
			{amount = math.floor(amount / 10000)}
		)
    else
    	return tostring(amount)
    end

end

--[[
    将数量换算成中文文本
    规则是小于1万的显示数字全部，否则就按照xx万的方式显示
    amount 需要转换的数量
    返回转换后的数量文本
]]
function TextHelper.getAmountText1(amount,text)

    assert(type(amount) == "number", "Invalid amount: "..tostring(amount))

    if amount >= 10000 then
        return Lang.get(
            text or "lang_common_format_amount_unit_wan", -- xx万文本
            {amount = math.floor(amount / 10000)}
        )
    else
        return tostring(amount)
    end

end

--[[
    将数量换算成中文文本
    规则是小于10万的显示数字全部，否则就按照xx万的方式显示
    amount 需要转换的数量
    return 返回转换后的数量文本
]]

function TextHelper.getAmountText2(amount,unitType)

    assert(type(amount) == "number", "Invalid amount: "..tostring(amount))
    local template = "lang_common_format_amount_unit_wan"
    if  unitType and unitType == 1 then
        template = "lang_common_format_amount_unit_w"
    end
    if amount >= 100000 then
        return Lang.get(
            template, -- xx万文本
            {amount = math.floor(amount / 10000)}
        )
    else
        return tostring(amount)
    end

end

--[[
    将数量换算成中文文本
    规则是小于100万的显示数字全部，否则就按照xx万的方式显示
    amount 需要转换的数量
    返回转换后的数量文本
]]

function TextHelper.getAmountText3(amount,unitType)

    assert(type(amount) == "number", "Invalid amount: "..tostring(amount))
    local template = "lang_common_format_amount_unit_wan"
    if  unitType and unitType == 1 then
        template = "lang_common_format_amount_unit_w"
    end
    if amount >= 1000000 then
        return Lang.get(
            template, -- xx万文本
            {amount = math.floor(amount / 10000)}
        )
    else
        return tostring(amount)
    end

end

--[[
将数量换算成中文文本
规则是:单位用亿，不足1亿的用小数表示，比如0.9亿
amount 需要转换的数量
返回转换后的数量文本
]]

function TextHelper.getAmountText4(amount)
	assert(type(amount) == "number", "Invalid amount: "..tostring(amount))
	local amount = amount / 100000000
	if amount >= 1 then
		amount = math.floor(amount)
	else
		amount = string.format("%.1f", amount)
	end
	return Lang.get("lang_common_format_amount_unit_yi", {amount = amount})
end

--[[
    将属性数据装换为中文文本，格式：属性名称+属性数值，中间用split隔开
    info 需要转换的属性表
    return 返回转换后的文本
]]
function TextHelper.getAttrText(info, split)
    split = split or "、"
    local desInfo = TextHelper.getAttrInfoBySort(info)

    local des = ""
    for i, v in ipairs(desInfo) do
        local name, value = TextHelper.getAttrBasicText(v.id, v.value)
        des = des..name.."+"..value
        if i ~= #desInfo then
            des = des..split
        end
    end

    return des
end

function TextHelper.getAttrInfoBySort(info)
    local desInfo = {}
    for k, value in pairs(info) do
        table.insert(desInfo, {id = k, value = value})
    end
    local function sortFun(a, b) --排序
        local infoA = require("app.config.attribute").get(a.id)
        local infoB = require("app.config.attribute").get(b.id)
        assert(infoA and infoB, string.format("attribute config can not find Aid = %d, Bid = %d", a.id, b.id))
        local orderA = infoA.order
        local orderB = infoB.order
        return orderA < orderB
    end
    table.sort(desInfo, sortFun)

    return desInfo
end

--将属性Id和属性值转换为：名字和数值
function TextHelper.getAttrBasicPlusText(id, value)
    local name,value = TextHelper.getAttrBasicText(id,value)
    return name, value
end

--将属性Id和属性值转换为：名字和数值
function TextHelper.getAttrBasicText(id, value)
    local attrConfig = require("app.config.attribute").get(id)
    assert(attrConfig, "attribute can not find id = "..id)

    local name = attrConfig.cn_name
    local type = attrConfig.type
    if type == 2 then
        value = (value / 10).."%"
    end
    if type == 3 then
        value = "+"..(value / 10).."%"
    end

    return name, value
end

--
function TextHelper.isNameLegal(txt, min, max)
    local minCount = min or 0
    local maxCount = max or 10000
    local tipWord
    txt = string.trim(txt)

    local BlackList = require("app.utils.BlackList")

    if txt == "" then
        tipWord = Lang.get("txt_check_error_empty")
    elseif string.utf8len(txt) < minCount then
        tipWord = Lang.get("txt_check_error_too_short", {count = minCount})
    elseif string.utf8len(txt) > maxCount then
        tipWord = Lang.get("txt_check_error_too_long", {count = maxCount})
    elseif TextHelper.checkHasSpecial(txt) then
        tipWord = Lang.get("txt_check_error_symbol_word")
    elseif BlackList.isMatchText(txt) then
        tipWord = Lang.get("txt_check_error_black_word")
    end

    if tipWord then
        G_Prompt:showTip(tipWord)
        return false
    else
        return true
    end
end

--判断字符串里是否有特殊字符
function TextHelper.checkHasSpecial(txt)
    local illegalNameRune = {}
    illegalNameRune[1] = 0x00  --\0
    illegalNameRune[2] = 0x09  --\t
    illegalNameRune[3] = 0x5f  --_
    illegalNameRune[4] = 0x20  --space
    illegalNameRune[5] = 0x22  --"
    illegalNameRune[6] = 0x60  --`
    illegalNameRune[7] = 0x1a  --ctrl+z
    illegalNameRune[8] = 0x0a  --\n
    illegalNameRune[9] = 0x0d  --\r
    illegalNameRune[10] = 0x27  --'
    illegalNameRune[11] = 0x25 --%
    illegalNameRune[12] = 0x5c --\\(反斜扛)
    illegalNameRune[13] = 0x2c --,
    illegalNameRune[14] = 0x7c --|

    local len = string.len(txt)
    for i = 1, len do
        local ascciValue = string.byte(txt, i)
        for j = 1, #illegalNameRune do
            if illegalNameRune[j] == ascciValue then
                return true
            end
        end

        if (ascciValue >= 0x1d000 and ascciValue <= 0x1f77f) or ---再过滤表情
            (ascciValue >= 0x2100 and ascciValue <= 0x26ff) then
        return true
        end
    end

    --特殊过滤添加中文空格字符
    local findValue = string.find(txt, "　")
    return findValue ~= nil
end

--[[
    message NoticePair {
	required string key = 1;//key
	required string value = 2;//value
	optional uint32 key_type = 3;//key的颜色类型 1:官衔
	optional uint32 key_value = 4;//key的颜色值
}
]]
function TextHelper.getNoticePairColor( key, noticePairs )
    -- body
    local value = TextHelper.getNoticePairValue(key,noticePairs)
    if value == nil then
        return nil
    end

    local retTable = {}
    retTable.value = value.value
    retTable.key = value.key

    local keyType = rawget(value, "key_type") or 0
    local keyValue = rawget(value, "key_value") or 0
    if keyType > 0 or keyValue > 0 then
        retTable.keyValue = keyValue
        retTable.keyType = keyType
        retTable.color,retTable.outlineColor =  Colors.getColorsByServerColorData(keyType,keyValue)
        return retTable
    end
    return retTable
end

function TextHelper.getNoticePairValue( key, noticePairs )
    for i, value in ipairs(noticePairs) do
        if value.key == key then
            return value
        end
    end
    return nil
end

function TextHelper.parseNoticePairs(contentText, noticePairs)
    --noticePairs 是服务器数据结构

	local content = contentText -- 配置文件 config
	local contents = {}

	local lastIndex = 0

	-- 分析文本
	while true do
		local headIndex = string.find(content, "#", lastIndex+1)
		local tailIndex

		if headIndex then
			tailIndex = string.find(content, "#", headIndex+1)
		else
			contents[#contents+1] = {content = string.sub(content, lastIndex+1), isKeyWord = false}
			break
		end

		if headIndex > lastIndex+1 then
			contents[#contents+1] = {content = string.sub(content, lastIndex+1, headIndex-1), isKeyWord = false}
		end

		if headIndex and tailIndex then
			if tailIndex > headIndex+1 then
                local key = string.sub(content, headIndex+1, tailIndex-1)
                local tempTable = TextHelper.getNoticePairColor(key, noticePairs)
                if tempTable then
                    contents[#contents+1] = {content = tempTable.value, isKeyWord = true, color = tempTable.color, outlineColor = tempTable.outlineColor}
                end
			end
			lastIndex = tailIndex
		else
			if headIndex+1 < string.len(dialogueContent) then
				contents[#contents+1] = {content = string.sub(content, headIndex+1), isKeyWord = false}
			end
			break
		end
	end
    return contents
end

function TextHelper.parseConfigText(text)
	local content = text
	local contents = {}

	local lastIndex = 0

	-- 分析文本
	while true do

		local headIndex = string.find(content, "#", lastIndex+1)
		local tailIndex

		if headIndex then
			tailIndex = string.find(content, "#", headIndex+1)
		else
			contents[#contents+1] = {content = string.sub(content, lastIndex+1), isKeyWord = false}
			break
		end

		if headIndex > lastIndex+1 then
			contents[#contents+1] = {content = string.sub(content, lastIndex+1, headIndex-1), isKeyWord = false}
		end

		if headIndex and tailIndex then
			if tailIndex > headIndex+1 then
				contents[#contents+1] = {content = string.sub(content, headIndex+1, tailIndex-1), isKeyWord = true}
			end
			lastIndex = tailIndex
		else
			if headIndex+1 < string.len(dialogueContent) then
				contents[#contents+1] = {content = string.sub(content, headIndex+1), isKeyWord = false}
			end
			break
		end
	end
    return contents
end

--将字符串拓展到len个字符的长度，中间用空格补足
--如果已经是len个字符，就不做处理
function TextHelper.expandTextByLen(txt, len)
	
    local UTF8 = require("app.utils.UTF8")
    local tempLen = UTF8.utf8len(txt)
    if tempLen >= len then
        return txt
    end

    local result = ""
    local dis = len - tempLen
    if tempLen == 2 then --2个字
        local w1 = UTF8.utf8sub(txt, 1, 1)
        local w2 = UTF8.utf8sub(txt, 2, 2)
        local fillTxt = ""
        for i = 1, dis do
            fillTxt = fillTxt.."　"
        end
        result = string.format("%s"..fillTxt.."%s", w1, w2)
    elseif tempLen == 3 then --3个字
        local w1 = UTF8.utf8sub(txt, 1, 1)
        local w2 = UTF8.utf8sub(txt, 2, 2)
        local w3 = UTF8.utf8sub(txt, 3, 3)
        result = string.format("%s %s  %s", w1, w2, w3)
    end

    return result
end


function TextHelper.splitStringToNumberArr(txt)
    local numStrArr = string.split(txt,"|")
    local numArr = {}
    for k,v in ipairs(numStrArr) do
        local number = tonumber(v)
        assert(number,"can't convert to number array:"..tostring(txt))
        table.insert(numArr,number)
    end
    return numArr
end

function TextHelper.stringStartsWith(str,pattern)
	local s, e = string.find(str,pattern)
	return s ~= nil and s == 1
end

function TextHelper.stringGetSuffixIndex(str,pattern)
	local indexStr = string.gsub(str,pattern,"")
	return tonumber(indexStr)
end

--裁剪字符
function TextHelper.cutText(text, len)
	local UTF8 = require("app.utils.UTF8")
	len = len or 8 --默认截取8个字符
	local textlen = UTF8.utf8len(text)
	local str = UTF8.utf8sub(text, 1, len)
	if textlen > len then
		str = str..".."
	end
	return str
end

--@Param1       文本
--@Param2       要求n字节对齐
--@Param3       扩展到几字节对齐
function TextHelper.byteAlignment(txt, len, extendLen)
    -- body
    local UTF8 = require("app.utils.UTF8")
    local tempLen = UTF8.utf8len(txt)
    if tempLen ~= len then
        return txt
    end
    if (extendLen - len)%(len - 1) ~= 0 then    --中间对齐一致
        return txt
    end

    local result = ""
    local internerNum = (extendLen - len )/(len - 1)
    local internerSpace = ""
    for i=1, internerNum do
        internerSpace = internerSpace.." "
    end

    for i=1, len - 1 do
        local w = UTF8.utf8sub(txt, i, i)
        result = string.format("%s%s%s", result, w, internerSpace)
    end

    local w = UTF8.utf8sub(txt, len, len)
    result = string.format("%s%s", result, w)
    return result
end

return TextHelper
