
local InstrumentTransformNode = class("InstrumentTransformNode")

function InstrumentTransformNode:ctor(target, type, callback)
	self._target = target
	self._type = type
	self._callback = callback

	self:_initData()
	self:_initView()
end

function InstrumentTransformNode:_initData()
	self._itemId = 0
	self._limitLevel = 0
	self._itemCount = 0
	self._lock = false
end

function InstrumentTransformNode:_initView()
	self._fileNodeItem = ccui.Helper:seekNodeByName(self._target, "FileNodeItem")
	cc.bind(self._fileNodeItem, "CommonInstrumentAvatar")
	self._fileNodeItem:setTouchEnabled(true)
	self._fileNodeItem:setCallBack(handler(self, self._onClickItem))

	self._textTip = ccui.Helper:seekNodeByName(self._target, "TextTip")
	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onButtonAddClicked))
	self._imageNum = ccui.Helper:seekNodeByName(self._target, "ImageNum")
	self._textNum = ccui.Helper:seekNodeByName(self._target, "TextNum")

	self._textTip:setString(Lang.get("transform_choose_tip"..self._type,{name = Lang.get("transform_tab_icon_3")}))
end

function InstrumentTransformNode:_resetView()
	self._fileNodeItem:setOpacity(255)
	self._fileNodeItem:setVisible(false)
	self._textTip:setVisible(false)
	self._buttonAdd:setVisible(false)
	self._imageNum:setVisible(false)
end

function InstrumentTransformNode:updateUI()
	self:_resetView()
	if self._lock then
		return
	end

	if self._itemId > 0 then
		self._fileNodeItem:updateUI(self._itemId, self._limitLevel)
		self._fileNodeItem:setVisible(true)
	else
		self._buttonAdd:setVisible(true)
		self._textTip:setVisible(true)
	end
	if self._itemCount > 1 then
		self._textNum:setString(Lang.get("transform_choose_count", {name = Lang.get("transform_tab_icon_3"),count = self._itemCount}))
		self._imageNum:setVisible(true)
	end
end

function InstrumentTransformNode:setLock(lock)
	self._lock = lock
end

function InstrumentTransformNode:setItemId(itemId, limitLevel)
	self._itemId = itemId
	self._limitLevel = limitLevel
end

function InstrumentTransformNode:getItemId()
	return self._itemId
end

function InstrumentTransformNode:setItemCount(count)
	self._itemCount = count
end

function InstrumentTransformNode:getItemCount()
	return self._itemCount
end

function InstrumentTransformNode:_onButtonAddClicked()
	if self._callback then
		self._callback()
	end
end

function InstrumentTransformNode:_onClickItem()
	if self._callback then
		self._callback()
	end
end

function InstrumentTransformNode:setEnabled(enable)
	self._fileNodeItem:setTouchEnabled(enable)
	self._buttonAdd:setEnabled(enable)
end

function InstrumentTransformNode:getItemNode()
	return self._fileNodeItem
end

return InstrumentTransformNode