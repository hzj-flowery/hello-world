local CommonMasterInfoNode = class("CommonMasterInfoNode")
local TextHelper = require("app.utils.TextHelper")

local EXPORTED_METHODS = {
    "updateUI",
    "getContentSize",
}

--根据内容行数对应的控件高度
local LINE2HEIGHT = {
	[1] = 66,
	[2] = 100,
}
--行数对应的Y坐标
local LINE2POSY = {
	[1] = 85,
	[2] = 55,
	[3] = 25,
}

function CommonMasterInfoNode:ctor()
	self._target = nil
end

function CommonMasterInfoNode:_init()
	self._panelBg = ccui.Helper:seekNodeByName(self._target, "PanelBg")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	for i = 1, 4 do
		self["_fileNodeAttr"..i] = ccui.Helper:seekNodeByName(self._target, "FileNodeAttr"..i)
		cc.bind(self["_fileNodeAttr"..i], "CommonDesValue")
		self["_fileNodeAttr"..i]:setFontSize(20)
		self["_fileNodeAttr"..i]:setDesColor(Colors.BRIGHT_BG_GREEN)
		self["_fileNodeAttr"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
	end
end

function CommonMasterInfoNode:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonMasterInfoNode:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonMasterInfoNode:updateUI(title, attrInfo)
	self._textName:setString(title)
	local desInfo = TextHelper.getAttrInfoBySort(attrInfo)
	for i = 1, 4 do
		local info = desInfo[i]
		if info then
			local name, value = TextHelper.getAttrBasicText(info.id, info.value)
			name = TextHelper.expandTextByLen(name, 4)
			self["_fileNodeAttr"..i]:updateUI(name, "+"..value)
			self["_fileNodeAttr"..i]:setVisible(true)
		else
			self["_fileNodeAttr"..i]:setVisible(false)
		end
	end

	local lineNum = math.ceil(#desInfo / 2)
	self:_formatLayout(lineNum)

	return lineNum --返回行数，用于排版
end

--动态排版
function CommonMasterInfoNode:_formatLayout(lineNum)
	local size = self._panelBg:getContentSize()
	local height = size.height
	if lineNum then
		height = LINE2HEIGHT[lineNum] or height
		local NamePosY = LINE2POSY[3-lineNum]
		if NamePosY then
			self._textName:setPositionY(NamePosY)
		end
		local count = lineNum * 2
		for i = 1, count do
			local lineIndex = math.ceil(i/2) --第几行
			local temp = 3-lineNum
			local attrPosY = LINE2POSY[lineIndex+temp]
			self["_fileNodeAttr"..i]:setPositionY(attrPosY)
		end
	end
	self._panelBg:setContentSize(cc.size(size.width, height))
end

function CommonMasterInfoNode:getContentSize()
	local size = self._panelBg:getContentSize()
	return size
end

return CommonMasterInfoNode