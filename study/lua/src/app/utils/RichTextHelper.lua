local UTF8 = require("app.utils.UTF8")
local UIHelper = require("yoka.utils.UIHelper")
local ChatConst = require("app.const.ChatConst")
local RollNoticeConst = require("app.const.RollNoticeConst")
local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
local HonorTitleConst = require("app.const.HonorTitleConst")

local RichTextHelper = {}

RichTextHelper.IMG_SIZE = 38

function RichTextHelper.parse2SubTitle(strInput)
	local subtitle = {}
	-- 查找其中的表情
	local emotions = {}
	local start, stop

	repeat
		if start then
			local emotionId = tonumber(string.sub(strInput, start + 1, stop - 1))
			-- 先检查是否是合格的emotion
			if emotionId and emotionId > 0 and emotionId <= ChatConst.MAX_FACE_NUM then
				emotions[#emotions + 1] = {start = start, ["end"] = stop}
			end
		end
        start, stop = string.find(strInput, "#%d+#", stop and stop + 1)
		logWarn(tostring(start) .. "................." .. tostring(stop))
	until not start

	-- 切割字符串，划分表情和文字
	if #emotions > 0 then
		start = 1
		repeat
			if not emotions[1] then
				if start < string.len(strInput) then
					subtitle[#subtitle + 1] = {type = "msg", content = string.sub(strInput, start)}
				end
				start = nil
			elseif emotions[1].start > start then
				subtitle[#subtitle + 1] = {type = "msg", content = string.sub(strInput, start, emotions[1].start - 1)}
				start = emotions[1].start
			else
				subtitle[#subtitle + 1] = {type = "image", content = string.sub(strInput, emotions[1].start, emotions[1]["end"])}
				start = emotions[1]["end"] + 1
				table.remove(emotions, 1)
			end
		until not start
	else
		subtitle[#subtitle + 1] = {type = "msg", content = strInput}
	end
	return subtitle
end

function RichTextHelper.parse2SubTitleExtend(strInput, ignoreImg, msgType)
	-- #110#恭喜#name#从#0xffffff黄金宝箱中#获得#equipment#！

	local subtitle = {}
	-- 查找其中的表情
	local emotions = {}
	local start, stop
	--logWarn("--------------------------------------")
	repeat
		if start then
			--logWarn("--->>"..string.sub(strInput, start+1, stop-1))
			local msgStr = string.sub(strInput, start, stop)
			local str = string.sub(strInput, start + 1, stop - 1)
			local st, ed = string.find(str, "0x[%x][%x][%x][%x][%x][%x]")
			local emotionId = tonumber(str)
			if st and msgType == ChatConst.MSG_TYPE_EVENT then --带颜色文本
				local colorStr = string.sub(str, st, ed)
				emotions[#emotions + 1] = {
					start = start,
					["end"] = stop,
					type = "msg",
					content = string.sub(str, ed + 1),
					color = tonumber(colorStr)
				}
			elseif emotionId and ignoreImg ~= true then --图片类型
				emotions[#emotions + 1] = {start = start, ["end"] = stop, type = "image", content = msgStr}
			else --替换文本类型
				emotions[#emotions + 1] = {start = start, ["end"] = stop, type = "replace", content = str}
			end
		end
		start, stop = string.find(strInput, "#[^#]+#", stop and stop + 1)
	until not start

	if #emotions > 0 then
		start = 1
		repeat
			if not emotions[1] then
				if start < string.len(strInput) then
					subtitle[#subtitle + 1] = {type = "msg", content = string.sub(strInput, start)}
				end
				start = nil
			elseif emotions[1].start > start then
				subtitle[#subtitle + 1] = {type = "msg", content = string.sub(strInput, start, emotions[1].start - 1)}
				start = emotions[1].start
			else
				subtitle[#subtitle + 1] = {type = emotions[1].type, content = emotions[1].content, color = emotions[1].color}
				start = emotions[1]["end"] + 1
				table.remove(emotions, 1)
			end
		until not start
	else
		subtitle[#subtitle + 1] = {type = "msg", content = strInput}
	end

	--logWarn("--------------------------------------")
	return subtitle
end

function RichTextHelper.getNoticeType(id)
    if type(id) ~= "number" then
        return 0
    end
    local PaoMaDeng = require("app.config.paomadeng")
    local cfg = PaoMaDeng.get(id)
    if cfg then
        return cfg.type
    else
        return 0
    end
end

function RichTextHelper.fillSubTitleUseReplaceTextColor(subtitles, nameColorData, noticeId, splitTitle)
	if not nameColorData then
		return subtitles
    end
    
    local noticeType = RichTextHelper.getNoticeType(noticeId)
	splitTitle = splitTitle or {type = "msg", content = "、"}
	local count = 1
	local newSubtitles = {}
	for k, v in ipairs(subtitles) do
		if v.type == "replace" then
			local nameColorList = nameColorData[count]
            if nameColorList then            
				for k, nameColor in ipairs(nameColorList) do
                    if k ~= 1 then
                        if noticeType == 1 then -- 1. 多服务器多玩家
                            if tonumber(k) % 2 == 1 and tonumber(k) ~= #nameColorList  then
                                table.insert(newSubtitles, splitTitle)
                            end
                        else
                            --这里插入一条标题
                            table.insert(newSubtitles, splitTitle)
                        end
                    end
					local title = {}
					if type(nameColor[2]) == "string" and nameColor[2] == "title" then
						title = {type = "image_title", content = nameColor[1]}
					else
						title = {type = "msg", content = nameColor[1], color = nameColor[2], outlineColor = nameColor[3]}

						if title.color and title.color.b == Colors.NUMBER_QUALITY[7].b and 
						   title.color.g == Colors.NUMBER_QUALITY[7].g and 
						   title.color.r == Colors.NUMBER_QUALITY[7].r then
							title.outlineColor = Colors.NUMBER_QUALITY_OUTLINE[7]
							title.outlineSize = 1
							title.content = " "..title.content.." "
						end
					end

					table.insert(newSubtitles, title)
				end
			else
				local title = {type = "msg", content = ""}
				table.insert(newSubtitles, title)
			end
			count = count + 1
		else
			table.insert(newSubtitles, v)
		end
	end
	return newSubtitles
end

function RichTextHelper.fillSubTitleUseColor(subtitles, nameColorData)
	if not nameColorData then
		return subtitles
	end
	local count = 1
	local newSubtitles = {}
	for k, v in ipairs(subtitles) do
		if v.type == "replace" then
			local title = {
				type = "msg",
				content = nameColorData[1] or v.content,
				color = nameColorData[2],
				outlineColor = nameColorData[3]
			}
			table.insert(newSubtitles, title)
		else
			table.insert(newSubtitles, v)
		end
	end
	return newSubtitles
end

function RichTextHelper.getSubTitles(strInput, maxLength)
	local subtitleArr = RichTextHelper.parse2SubTitle(strInput)
	local newSubtitleArr = {}
	local isCut = false
	local currLength = 0
	for i = 1, #subtitleArr do
		local subtitle = subtitleArr[i]
		if subtitle.type == "image" then
			--图片算3个文字
			currLength = currLength + 3
		elseif subtitle.type == "msg" then
			currLength = currLength + string.utf8len(subtitle.content)
		end
		if currLength <= maxLength then
			table.insert(newSubtitleArr, subtitle)
		else
			if subtitle.type == "image" then
			elseif subtitle.type == "msg" then
				local cutLength = math.abs(maxLength - currLength)
				local utfLength = string.utf8len(subtitle.content)
				if cutLength < utfLength then
					subtitle.content = UTF8.utf8sub(subtitle.content, 1, utfLength - cutLength)
					table.insert(newSubtitleArr, subtitle)
				end
			end
			isCut = true
			break
		end
	end
	return newSubtitleArr, isCut
end

function RichTextHelper.getSubText(strInput, maxLength)
	local subtitleArr = RichTextHelper.getSubTitles(strInput, maxLength)
	local newStr = ""
	for i = 1, #subtitleArr do
		local subtitle = subtitleArr[i]
		if subtitle.type == "image" then
			newStr = newStr .. subtitle.content
		elseif subtitle.type == "msg" then
			newStr = newStr .. subtitle.content
		end
	end
	logWarn(newStr)
	return newStr
end

function RichTextHelper.convertSubTitleToRichMsgArr(fontParam, subtitle, configParam)
	local textColor = fontParam.textColor
	local fontSize = fontParam.fontSize
	local outlineColor = fontParam.outlineColor
	local outlineSize = fontParam.outlineSize or (outlineColor and 2 or nil)

	local richTextSubtitle = {}
	for i = 1, #subtitle do
		local newSubtitle = {}
		if subtitle[i].type == "image" then
			-- emotion
			local faceId = string.sub(subtitle[i].content, 2, string.len(subtitle[i].content) - 1)
			newSubtitle.type = "image"
			newSubtitle.filePath = Path.getChatFaceMiniRes(tonumber(faceId))
			newSubtitle.color = 0xffffff
			newSubtitle.opacity = 255
			if configParam and configParam.faceWidth and configParam.faceHeight then
				newSubtitle.width = configParam.faceWidth
				newSubtitle.height = configParam.faceHeight
			else
				newSubtitle.width = 32
				newSubtitle.height = 32
			end

			richTextSubtitle[#richTextSubtitle + 1] = newSubtitle
		elseif subtitle[i].type == "msg" or subtitle[i].type == "replace" then
			newSubtitle.type = "text"
			newSubtitle.msg = subtitle[i].content -- GlobalFunc.filterText(subtitle[i].content)

			newSubtitle.color = subtitle[i].color or textColor
			newSubtitle.opacity = 255
			newSubtitle.outlineColor = subtitle[i].outlineColor
			newSubtitle.outlineSize = subtitle[i].outlineColor and 2 or nil
			newSubtitle.fontSize = fontSize

			if not newSubtitle.outlineColor then
				newSubtitle.outlineColor = outlineColor
				newSubtitle.outlineSize = outlineSize
			end

			richTextSubtitle[#richTextSubtitle + 1] = newSubtitle
		elseif subtitle[i].type == "image_title" then
			newSubtitle.type = "image"
			newSubtitle.filePath = Path.getImgTitle(subtitle[i].content)
			local size = PopupHonorTitleHelper.getTitleSizeByImageId(subtitle[i].content)
			local scale = HonorTitleConst.TITLE_CONFIG["ChatMiniMsgItemCell"][2]
			newSubtitle.width = size.width * scale
			newSubtitle.height = size.height * scale
			newSubtitle.opacity = 255
			richTextSubtitle[#richTextSubtitle + 1] = newSubtitle
		end
	end
	return richTextSubtitle
end

--===
---将玩家输入文本转换为富文本格式
-- obj.strInput
-- obj.textColor
-- obj.fontSize
-- obj.outlineColor
-- obj.outlineSize
function RichTextHelper.parse2RichMsgArr(obj, configParam)
	local strInput = obj.strInput
	local textColor = obj.textColor
	local fontSize = obj.fontSize
	local outlineColor = obj.outlineColor
    local outlineSize = obj.outlineSize
    local type = obj.msgType 

	local subtitle = RichTextHelper.parse2SubTitleExtend(strInput,nil,type)
	local richTextSubtitle = RichTextHelper.convertSubTitleToRichMsgArr(obj, subtitle, configParam)
	return richTextSubtitle
end

function RichTextHelper.parse2MiniRichMsgArr(obj, maxLength)
	maxLength = maxLength or 9
	local subTitleArr, isCut = RichTextHelper.getSubTitles(obj.strInput, maxLength)
	if isCut then
		subTitleArr[#subTitleArr + 1] = {type = "msg", content = "..."}
	end

	local richTextSubtitle = RichTextHelper.convertSubTitleToRichMsgArr(obj, subTitleArr)
	return richTextSubtitle
end

function RichTextHelper.convertServerNoticePairs(noticePairs, convertFunc)
	local function convertServerData(noticePairs)
		local list = {}
		for i, value in ipairs(noticePairs) do
			local data = {}
			data.key = value.key
			data.value = value.value
			data.key_type = value.key_type
			data.key_value = value.key_value
			if convertFunc then
				data = convertFunc(data)
			end
			table.insert(list, data)
		end
		return list
	end
	return convertServerData(noticePairs)
end

--返回富文本
function RichTextHelper.convertRichTextByNoticePairs(
	contentText,
	noticePairs,
	fontSize,
	defalutColor,
	outlineColor,
	outlineSize)
	local TextHelper = require("app.utils.TextHelper")
	local textTable = TextHelper.parseNoticePairs(contentText, noticePairs)
	fontSize = fontSize or 22
	defalutColor = defalutColor or Colors.DARK_BG_ONE

	local richContents = {}
	for i, value in ipairs(textTable) do
		local tempColor = defalutColor
		if value.color ~= nil then
			tempColor = value.color
		end
		local tempColorOutline = nil
		if value.outlineColor then
			tempColorOutline = value.outlineColor
		end
		local content = {
			type = "text",
			msg = value.content,
			color = tempColor,
			outlineColor = tempColorOutline,
			outlineSize = 2,
			fontSize = fontSize,
			opacity = 255
		}
		if outlineColor then
			content.outlineColor = outlineColor
		end
		if outlineSize then
			content.outlineSize = outlineSize
		end
		table.insert(richContents, content)
	end
	return richContents
end

function RichTextHelper.getRichMsgListForHashText(text, highlightColor, defalutColor, defaultFontSize)
	--local RichTextHelper = require("app.utils.RichTextHelper")
	local subTitles = RichTextHelper.parse2SubTitleExtend(text, true)
	subTitles = RichTextHelper.fillSubTitleUseColor(subTitles, {nil, highlightColor, nil})
	local richElementList =
		RichTextHelper.convertSubTitleToRichMsgArr(
		{
			textColor = defalutColor,
			fontSize = defaultFontSize
			--跑马灯的默认字体大小
		},
		subTitles
	)
	return richElementList
end

return RichTextHelper
