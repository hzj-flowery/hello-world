
-- Author: nieming
-- Date:2017-12-23 19:00:25
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local PopupNextFunctionPopInfoNode = class("PopupNextFunctionPopInfoNode", ViewBase)


function PopupNextFunctionPopInfoNode:ctor(data)

	--csb bind var name
	self._imageFunction = nil  --ImageView
	self._label1 = nil  --Text
	self._label2 = nil  --Text
	self._name = nil
	self._data = data
	local resource = {
		file = Path.getCSB("PopupNextFunctionPopInfoNode", "common"),

	}
	PopupNextFunctionPopInfoNode.super.ctor(self, resource)
end

-- Describle：
function PopupNextFunctionPopInfoNode:onCreate()
	if not self._data then
		return
	end
	self._imageFunction:ignoreContentAdaptWithSize(true)
	self._imageFunction:loadTexture(Path.getCommonIcon("main",self._data.icon))

	self._name:setString(self._data.name)
	local strArr = string.split(self._data.text, "|")
	local string1 = strArr[1]
	if string1 then
		self._label1:setVisible(true)
		self._label1:setString(string1)
	else
		self._label1:setVisible(false)
	end
	local string2 = strArr[2]
	if string2 then
		self._label2:setVisible(true)
		self._label2:setString(string2)
	else
		self._label2:setVisible(false)
	end
end

-- Describle：
function PopupNextFunctionPopInfoNode:onEnter()

end

-- Describle：
function PopupNextFunctionPopInfoNode:onExit()

end

return PopupNextFunctionPopInfoNode
