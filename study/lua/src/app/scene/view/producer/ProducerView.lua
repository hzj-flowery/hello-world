
-- Author: nieming
-- Date:2018-02-09 14:00:35
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local ProducerView = class("ProducerView", ViewBase)
local UIHelper = require("yoka.utils.UIHelper")
local UTF8 = require("app.utils.UTF8")
local LINE_MAX_NAME_NUM = 4  --一行最多4个名字
local LINE_MAX_WIDTH = 300
local NAME_GAP = 110
local LINE_GAP = 30--每个大标题空格
local TITLE_NAME_GAP = 10--标题很名字之间间距
function ProducerView:ctor()
	--csb bind var name
	self._btnBack = nil  --CommonButtonBack
	self._nameListView = nil  --ScrollView
	self._nameParent = nil  --SingleNode

	local resource = {
		file = Path.getCSB("ProducerView", "producer"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnBack = {
				events = {{event = "touch", method = "_onBtnBack"}}
			},
		},
	}
	ProducerView.super.ctor(self, resource)
end

-- Describle：
function ProducerView:onCreate()
	self:_createView()
	self:_playerAction()
end


function ProducerView:_playerAction()

	self._nameParent:setPosition(cc.p(0,-300))
	local moveTo = cc.MoveTo:create(5, cc.p(0,0))
	local callFunc = cc.CallFunc:create(function()
		self._nameListView:scrollToBottom(10,false)
	end)
	local seqAction = cc.Sequence:create(moveTo, callFunc)
	self._nameParent:runAction(seqAction)
end
--
function ProducerView:_createView()
	--转换文本
	local function convertText(text)
		if not text then
			return
		end
		if UTF8.utf8len(text) == 2 then
			--对齐 特殊处理
			local name = text
			local name1 = UTF8.utf8sub(name, 1, 1) or ""
			local name2 = UTF8.utf8sub(name, 2, 2) or ""
			local newText = string.format("%s   %s", name1, name2)
			return newText
		end
		return text
	end
	-- 获取位置数组
	local function getPositionXArr(len, isFirstLine)
		if not isFirstLine then
			--不是首行  全部左对齐
			len = LINE_MAX_NAME_NUM
		end
		local startPos  = (LINE_MAX_WIDTH - (len - 1) * NAME_GAP)/2
		local arr = {}
		for i = 1, len do
			arr[i] = startPos + (i - 1) * NAME_GAP
		end
		return arr
	end

	--- 拼接数据
	local datas = {}
	local ResearchStaffConfig = require("app.config.research_staff")
	local indexs = ResearchStaffConfig.index()
	table.insert(datas, {type = "empty", content = LINE_GAP})
	for k, v in ipairs(indexs) do
		local config = ResearchStaffConfig.indexOf(v)
		table.insert(datas, {type = "title", content = convertText(config.title)})

		local nameArr = string.split(config.name, "|")
		local count = math.ceil(#nameArr/LINE_MAX_NAME_NUM)
		for i = 0, count - 1 do
			local startIndex = i * LINE_MAX_NAME_NUM + 1
			local isFirstLine = i == 0
			if isFirstLine then
				table.insert(datas, {type = "empty", content = TITLE_NAME_GAP})
			end
			table.insert(datas, {type = "name", content = {
				convertText(nameArr[startIndex]),
				convertText(nameArr[startIndex + 1]),
				convertText(nameArr[startIndex + 2]),
				convertText(nameArr[startIndex + 3])
			}, isFirstLine = isFirstLine})
		end
		table.insert(datas, {type = "empty", content = LINE_GAP})
	end

	--- 根据数据拼接界面
	local parent = cc.Node:create()
	local curHeight = 0
	for k, v in ipairs(datas) do
		if v.type == "title" then
			local text = UIHelper.createLabel({fontName = Path.getFontW8(), text = v.content,
											fontSize = 26, color = cc.c3b(0xfa, 0xfa, 0xf3),
										outlineColor = cc.c3b(0x37, 0x16, 0x00), outlineSize = 2})
			text:setAnchorPoint(cc.p(0.5, 1))
			text:setPosition(cc.p(LINE_MAX_WIDTH/2, curHeight))
			parent:addChild(text)
			curHeight = curHeight - text:getContentSize().height
		elseif v.type == "name" then
			local nameArrLen = #v.content
			local posxArr = getPositionXArr(nameArrLen, v.isFirstLine)
			local textHeight = 0
			for i, j in ipairs(v.content) do
				local text = UIHelper.createLabel({ text = j, fontSize = 24, color = cc.c3b(0xff, 0xb6, 0x28),
											outlineColor = cc.c3b(0x37, 0x16, 0x00), outlineSize = 2})
				text:setAnchorPoint(cc.p(0.5, 1))
				text:setPosition(cc.p(posxArr[i], curHeight))
				parent:addChild(text)
				if textHeight == 0 then
					textHeight = text:getContentSize().height
				end
			end
			curHeight = curHeight - textHeight
		elseif v.type == "empty" then
			curHeight = curHeight - v.content
		end
	end
	self._height = curHeight * -1
	self._contentParent = parent
	local scrollSize = self._nameListView:getContentSize()
	local scrollWidth = scrollSize.width
	local scrollHeight = scrollSize.height
	parent:setPosition(cc.p((scrollWidth - LINE_MAX_WIDTH)/2, self._height))
	self._nameListView:setInnerContainerSize(cc.size(scrollWidth, self._height))
	self._nameListView:addChild(parent)
end

-- Describle：
function ProducerView:onEnter()
end

-- Describle：
function ProducerView:onExit()

end
-- Describle：
function ProducerView:_onBtnBack()
	-- body
	G_SceneManager:popScene()
end


return ProducerView
