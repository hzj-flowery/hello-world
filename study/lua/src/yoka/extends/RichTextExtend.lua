
--[====================[

    针对 ccui.RichText 的扩展

    主要提供解析定制富文本格式的方法用于方便创建富文本

]====================]

local ccui = ccui
local RichText = ccui.RichText

local RichElementText = ccui.RichElementText
local RichElementImage = ccui.RichElementImage
local RichElementCustomNode = ccui.RichElementCustomNode

-- 十进制的颜色数值转换成c3b

local toColor3B = function(num)

    if not num then return cc.c3b(0, 0, 0) end

    local hex = 16

    -- 默认元数据是十进制，转换成hex指定的进制
    local function _hexConvert(raw, bit)
        return math.floor(raw / math.pow(hex, bit-1)) % hex
    end

    return cc.c3b(
        _hexConvert(num, 6) * hex + _hexConvert(num, 5),
        _hexConvert(num, 4) * hex + _hexConvert(num, 3),
        _hexConvert(num, 2) * hex + _hexConvert(num, 1)
    )

end

-- 十进制的颜色数值转换成c4b

local toColor4B = function(num)

    local color = toColor3B(num)

    return cc.c4b(color.r, color.g, color.b, 255)

end

-- 颜色值转换成十进制数

local colorToNumber = function(color)

    if type(color) == "table" then
        local num = 0
        if color.r then
            num = num + color.r * 65536
        end
        if color.g then
            num = num + color.g * 256
        end
        if color.b then
            num = num + color.b
        end

        return num
    else
        return checknumber(color)
    end
end

--[====================[

	创建一个基于json配置的富文本
	json配置包含了创建富文本每一个文本所需的参数

	@jsonContent json配置

	json格式参考

	jsonContent = [{"type":"text", "msg":"随便#name#", "color":16777215, "opacity":"255"}]

    @return 返回创建好的富文本对象

]====================]

function RichText:createWithContent(jsonContent)

    local richText = ccui.RichText:create()

    if richText then
    	richText:setRichTextWithJson(jsonContent)
    end

    return richText
end

--[====================[

	设置富文本的内容，根据指定的json配置

	@jsonContent json配置

]====================]

function RichText:setRichTextWithJson(jsonContent)

	local content = json.decode(jsonContent)
    assert(content, "Invalid json string: "..tostring(content).." with name: "..tostring(jsonContent))

    self:setRichText(content)
end

--创建richtext通过格式化文本
--[[
解析 匹配格式 格式 $c1_普通文本$
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
}}

]]
function RichText:createRichTextByFormatString(formatStr, params)
	local ParseRichTextStringHelp = require("app.utils.ParseRichTextStringHelp")
	local contents = ParseRichTextStringHelp.parse(formatStr, params)
	local richText = ccui.RichText:create()
	if richText then
		richText:setRichText(contents)
	end
	return richText
end


function RichText:createRichTextByFormatString2(formatStr, defaultColor, defaultSize)
	return self:createRichTextByFormatString(formatStr, {defaultColor = defaultColor, defaultSize = defaultSize})
end




--[====================[

    设置富文本的内容

    @content 包含具体richelement参数信息的table，可以是一个数组，也可以是单个

]====================]

function RichText:setRichText(content)

    if not content or type(content) ~= "table" then return end

    if #content > 0 then

        for i=1, #content do

            local _content = content[i]
            assert(_content.type, "The richtext type could not be nil !")

            local richElement = nil
            if _content.type == "text" then
                local flags = 0
                if _content.underline then
                    flags = flags+4
                end
                if _content.outlineColor then
                    richElement = RichElementText:create(
                        i,
                        toColor3B(colorToNumber(_content.color)),
                        _content.opacity or 255,
                        _content.msg,
                        _content.fontName or Path.getCommonFont(),
                        _content.fontSize or 26,
                        32+flags,--flags
                        "",--url
                        toColor3B(colorToNumber(_content.outlineColor)),
                        _content.outlineSize
                    )
                else
                    richElement = RichElementText:create(
                        i,
                        toColor3B(colorToNumber(_content.color)),
                        _content.opacity or 255,
                        _content.msg,
                        _content.fontName or Path.getCommonFont(),
                        _content.fontSize or 26,
                        flags
                    )
                end
            elseif _content.type == "image" then
                richElement = RichElementImage:create(
                    i,
                    toColor3B(colorToNumber(_content.color)),
                    _content.opacity or 255,
                    _content.filePath
                )
                if _content.width and _content.height then
                    richElement:setWidth(_content.width)
                    richElement:setHeight(_content.height)
                end
            elseif _content.type == "custom" then
                richElement = RichElementCustomNode:create(
                    i,
                    toColor3B(colorToNumber(_content.color)),
                    _content.opacity,
                    _content.customNode
                )
            else
                assert(false, "Unknown richtext type: "..tostring(_content.type))
            end

            if richElement then
                self:pushBackElement(richElement)
            end
        end

    elseif content.type then

        local richElement = nil
        if content.type == "text" then
            local flags = 0
            if _content.underline then
                flags = flags+4
            end
            if content.outlineColor then
                richElement = RichElementText:create(
                    i,
                    toColor3B(colorToNumber(content.color)),
                    content.opacity,
                    content.msg,
                    content.fontName or Path.getCommonFont(),
                    content.fontSize or 26,
                    32+flags,--flags
                    "",--url
                    toColor3B(content.outlineColor),
                    content.outlineSize
                )
            else
                richElement = RichElementText:create(
                    i,
                    toColor3B(colorToNumber(content.color)),
                    content.opacity,
                    content.msg,
                    content.fontName or Path.getCommonFont(),
                    content.fontSize or 26,
                    flags
                )
            end
        elseif content.type == "image" then
            richElement = RichElementImage:create(
                i,
                toColor3B(tonumber(content.color)),
                content.opacity,
                content.filePath
            )
            if _content.width and _content.height then
                richElement:setWidth(_content.width)
                richElement:setHeight(_content.height)
            end
        elseif content.type == "custom" then
            richElement = RichElementCustomNode:create(
                i,
                toColor3B(tonumber(content.color)),
                content.opacity,
                content.customNode
            )
        else
            assert(false, "Unknown richtext type: "..tostring(content.type))
        end

        if richElement then
            self:pushBackElement(richElement)
        end

    else
        assert(false, "The richtext type could not be nil !")
    end
end
