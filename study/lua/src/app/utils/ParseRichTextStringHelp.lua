-- 主要解决一些 策划量表配置富文本的需求
--
--[[
思想: 主要是 简化配置 及以后的颜色替换方便

解析 匹配格式 格式 [$c1_普通文本$]  $resmini_(资源id)$
str 解析文本
params 参数
defaultColor  文本默认颜色
defaultSize  文本默认字体大小
other -- {}  单独配置每一个选项 $c1_普通文本$ 的参数
	c类型 文本
 	fontSize 字体大小  color 文本颜色  outlineColor描边颜色
 其他类型根据需求完善
params 参数示例
{defaultColor = Colors.BRIGHT_BG_ONE, defaultSize = 22, other = {
	{fontSize = 22, color = Colors.BRIGHT_BG_ONE, outlineColor = Colors.BRIGHT_BG_ONE, outlineSize = 2},
	{fontSize = 22, color = Colors.BRIGHT_BG_ONE, outlineColor = Colors.BRIGHT_BG_ONE, outlineSize = 2},
	--资源图片类型
	{filePath = "xxxxx", width=20, height = 20, color = Colors.BRIGHT_BG_ONE, opacity = 1},
}}

]]
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ParseRichTextStringHelp = {}


ParseRichTextStringHelp._DEFAULT_COLOR = Colors.BRIGHT_BG_ONE
ParseRichTextStringHelp._DEFAULT_FONTSIZE = 20
--其他配置(自定义添加一些配置属性 )
ParseRichTextStringHelp._CONFIG = {
	--c 开头 表示颜色
	["c0"] = {}, --未知颜色 由代码传入 如果代码没传入 则采用默认颜色
	["c1"] = {color = Colors.COLOR_QUALITY[1]}, --英雄品质色 -白
	["c2"] = {color = Colors.COLOR_QUALITY[2]}, -- 绿色
	["c3"] = {color = Colors.COLOR_QUALITY[3]}, -- 蓝色
	["c4"] = {color = Colors.COLOR_QUALITY[4]}, -- 紫色
	["c5"] = {color = Colors.COLOR_QUALITY[5]}, -- 橙色
	["c6"] = {color = Colors.COLOR_QUALITY[6]}, --品质色 -红

	["c7"] = {color = Colors.COLOR_QUALITY[1],  outlineColor = Colors.COLOR_QUALITY_OUTLINE[1]}, --英雄品质色 -白
	["c8"] = {color = Colors.COLOR_QUALITY[2],  outlineColor = Colors.COLOR_QUALITY_OUTLINE[2]}, -- 绿色
	["c9"] = {color = Colors.COLOR_QUALITY[3],  outlineColor = Colors.COLOR_QUALITY_OUTLINE[3]}, -- 蓝色
	["c10"] = {color = Colors.COLOR_QUALITY[4], outlineColor = Colors.COLOR_QUALITY_OUTLINE[4]}, -- 紫色
	["c11"] = {color = Colors.COLOR_QUALITY[5], outlineColor = Colors.COLOR_QUALITY_OUTLINE[5]}, -- 橙色
	["c12"] = {color = Colors.COLOR_QUALITY[6], outlineColor = Colors.COLOR_QUALITY_OUTLINE[6]}, --品质色 -红

	-- 其他功能待需求完善
	["c101"] = {color = Colors.BRIGHT_BG_ONE},  --A类：亮底字色
	["c102"] = {color = Colors.BRIGHT_BG_TWO},  --A类：亮底字色
	["c103"] = {color = Colors.BRIGHT_BG_GREEN},  --A类：亮底字色
	["c104"] = {color = Colors.BRIGHT_BG_RED},  --A类：亮底字色

	["c105"] = {color = Colors.DARK_BG_ONE}, ----D类：暗底字色
	["c106"] = {color = Colors.DARK_BG_TWO},  --D类：暗底字色
	["c107"] = {color = Colors.DARK_BG_GREEN},  --D类：暗底字色
	["c108"] = {color = Colors.DARK_BG_RED},  --D类：暗底字色
	["c109"] = {color = Colors.DARK_BG_THREE},  --D类：暗底字色

	["c110"] = {color = Colors.OBVIOUS_GREEN},  --E类：暗底字色
	["c111"] = {color = Colors.OBVIOUS_YELLOW},  --E类：暗底字色
	
    ["c120"] = {color = Colors.SYSTEM_TARGET_RED},  --F类：红色
    
    ["c121"] = {color = Colors.CLASS_WHITE},  --D类：白色
    ["c122"] = {color = Colors.GOLDENHERO_ACTIVITY_END_NORMAL},  --D类：白色

	
	-- 单独添加描边
	["c151"] = {outlineColor = Colors.DARK_BG_OUTLINE},  --d类：描边色

	-- 其他颜色标记
	["c201"] = {color = Colors.SELL_TIPS_COLOR_NORMAL},  --出售提示颜色
    ["c202"] = {color = Colors.SELL_TIPS_COLOR_HIGHLIGHT},  --出售提示高亮颜色
    
    -- 战报解析添加
    ["c901"] = {color = Colors.ReportParseColor[1]},        -- 默认文本凸显颜色
    ["c902"] = {color = Colors.ReportParseColor[2]},        -- 掉血，怒气减少颜色
    ["c903"] = {color = Colors.ReportParseColor[3]},        -- 加血，怒气增加颜色
    ["c904"] = {color = Colors.ReportParseColor[4]},        -- buff颜色
	-- 资源类小图标
	["resmini"] = {}, --资源类小图标___同默认字体一样的宽度 如果有新的大小需求 添加一个新的 resmini1 类型之类的

}

--
function ParseRichTextStringHelp._createTextData(str, color, fontSize, outlineColor, outlineSize)
	local single = {}
	single.type = "text"
	single.msg = str
	single.color = color
	single.fontSize = fontSize
	single.outlineColor = outlineColor
	single.outlineSize = outlineSize
	return single
end

function ParseRichTextStringHelp._createImage(filePath, width, height, color, opacity)
	if filePath then
		local single = {}
		single.type = "image"
		single.filePath = filePath
		single.width = width
		single.height = height
		single.color = color
		single.opacity = opacity
		return single
	end
end

--颜色
function ParseRichTextStringHelp._parseColor(key, msg, otherConfig, defaultColor , defaultSize)
	local configColor = ParseRichTextStringHelp._CONFIG[key]
	assert(configColor ~= nil, "can not find ParseRichTextStringHelp._CONFIG key = "..(key or nil))
	local color = otherConfig.color or (configColor.color or defaultColor)
	local fontSize = otherConfig.fontSize or (configColor.fontSize or defaultSize)
	local outlineColor = configColor.outlineColor or otherConfig.outlineColor
	local outlineSize = configColor.outlineSize or (otherConfig.outlineSize or 2)
	return ParseRichTextStringHelp._createTextData(msg, color, fontSize, outlineColor, outlineSize)
end


--资源类小图标
function ParseRichTextStringHelp._parseResmini(key, value, otherConfig, defaultSize)
	local configResmini = ParseRichTextStringHelp._CONFIG[key]
	assert(configResmini ~= nil, "can not find ParseRichTextStringHelp._CONFIG key = "..(key or nil))
	value = tonumber(value)
	local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, value)
	assert(itemParams ~= nil, string.format("can not find vaule = %s", value))
	local filePath = otherConfig.filePath or (configResmini.filePath or itemParams.res_mini)
	local width = otherConfig.width or configResmini.width or defaultSize
	local height = otherConfig.height or configResmini.height or defaultSize
	local color = otherConfig.color or configResmini.color
	local opacity = otherConfig.opacity or configResmini.opacity
	return ParseRichTextStringHelp._createImage(filePath, width, height, color, opacity)
end




function ParseRichTextStringHelp.parse(formatStr, params)
	if not params then
		params = {}
	end
	local defaultColor = params.defaultColor or Colors.BRIGHT_BG_ONE
	local defaultSize = params.defaultSize or 20
	local richTextConfigs = {}

	local index = string.find(formatStr, ".-%$([%l%u]-)(%d-)_(.-)%$.-")
	if index then
		--满足匹配
		local curMatchIndex = 1
		-- 例如：(前面的文本)$c1_普通文本$  匹配的结果是  normalText = 前面的文本 key = c  keyID = 1 value = 普通文本
		--
		string.gsub(formatStr, "(.-)%$([%l%u]-)(%d-)_(.-)%$", function(normalText, key, keyID, value)
			if normalText and normalText ~= "" then
				local single = ParseRichTextStringHelp._createTextData(normalText, defaultColor, defaultSize, nil)
				table.insert(richTextConfigs, single)
			end

			if key and keyID then
				local otherConfig = {}
				if params.other and params.other[curMatchIndex] then
					otherConfig = params.other[curMatchIndex]
				end
				local single
				if key == "c" and value and value ~="" then
					single = ParseRichTextStringHelp._parseColor(key..keyID, value, otherConfig, defaultColor, defaultSize)
				elseif key == "resmini" then
					single = ParseRichTextStringHelp._parseResmini(key..keyID, value, otherConfig, defaultSize)
				end
				if single then
					table.insert(richTextConfigs, single)
				end
			end
			curMatchIndex = curMatchIndex + 1
		end)
		--匹配 最后一段匹配文本
		string.gsub(formatStr, ".*%$[%l%u]-%d-_.-%$(.-)$", function(normalText)
			if normalText and normalText ~= "" then
				local single = ParseRichTextStringHelp._createTextData(normalText, defaultColor, defaultSize)
				table.insert(richTextConfigs, single)
			end
		end)
	else
		--不满足匹配
		local single = ParseRichTextStringHelp._createTextData(formatStr, defaultColor, defaultSize)
		table.insert(richTextConfigs, single)
	end
	-- dump(richTextConfigs, 10)
	return richTextConfigs
end


--[[
function ParseRichTextStringHelp.unitTest()
	-- return "我的$c5_测试文本1$天下好好$c3_测试文本2$我$555rrrr$"
	return "我的$c5_测试文本1$天下好好$c3_测试文本2$我$555$", {defaultColor = cc.c3b(0xff, 0x00, 0x00), defaultSize = 30, other = {
		{fontSize = 40,  outlineColor = cc.c4b(0x00, 0x00, 0x00, 0xff), outlineSize = 2},
		{fontSize = 20, color = cc.c3b(0xff, 0xff, 0x00), outlineColor = cc.c4b(0x00, 0x00, 0x00, 0xff)},
	}}
end
]]



return ParseRichTextStringHelp
