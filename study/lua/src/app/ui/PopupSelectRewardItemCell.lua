--选择奖励界面， 选择奖励物品单元
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSelectRewardItemCell = class("PopupSelectRewardItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local Path = require("app.utils.Path")

function PopupSelectRewardItemCell:ctor(index,callBack)
	self._checkBox  = nil
	self._iconTemplate = nil
	self._imageTop = nil
	--
	local resource = {
		file = Path.getCSB("PopupSelectRewardItemCell", "common"),
	}
	PopupSelectRewardItemCell.super.ctor(self, resource, true)

	self._callBack = callBack
	self._index = index
end


--
function PopupSelectRewardItemCell:onCreate()
	-- button
	local contentSize = self._iconBg:getContentSize()
	self:setContentSize(contentSize)
	self:setCheck(false)
	self._imageTop:setVisible(false)
	self._checkBox:addEventListener(handler(self,self._onCheckClick))
end

function PopupSelectRewardItemCell:_onCheckClick()
	if self._callBack and type(self._callBack) == "function" then
		self._callBack(self._index, self._target)
	end
end

function PopupSelectRewardItemCell:setCheck(bool)
	bool = bool or false
	self._checkBox:setSelected(bool)
end


function PopupSelectRewardItemCell:showCheck(show)
    if show == nil then
		show = true
	end
	self._checkBox:setVisible(show)
end


function PopupSelectRewardItemCell:setCallBack()
	
end

function PopupSelectRewardItemCell:updateUI(type,value,size)
	self._iconTemplate:unInitUI()
	self._iconTemplate:initUI(type,value,size)
	self._imageTop:setVisible(false)

	local itemParam = self._iconTemplate:getItemParams()
	self._itemName:setString(itemParam.name)
	self._itemName:setColor(itemParam.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._itemName, itemParam)
	
	self._iconTemplate:setTouchEnabled(true)

	if type == TypeConvertHelper.TYPE_HERO then
		self:_showHeroTopImage(value)
	end
	if  type == TypeConvertHelper.TYPE_FRAGMENT then
		if itemParam.cfg.comp_type == 1 then -- 武将合成类型
			self:_showHeroTopImage(itemParam.cfg.comp_value)
		end
	end
	--self._iconTemplate:showName(true)
end

function PopupSelectRewardItemCell:_showHeroTopImage(heroId)
	local res = UserDataHelper.getHeroTopImage(heroId)
	if res then
		self._imageTop:loadTexture(res)
		self._imageTop:setVisible(true)
		return true
	end
	return false
end


function PopupSelectRewardItemCell:onEnter()
    
end

function PopupSelectRewardItemCell:onExit()
    
end

return PopupSelectRewardItemCell