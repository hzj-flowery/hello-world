-- @Author panhoa
-- @Date 7.31.2018
-- @Role PopupReward

local PopupBase = require("app.ui.PopupBase")
local PopupReward = class("PopupReward", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupReward:ctor(title, isClickOtherClose, isNotCreateShade)
	self._title = title or Lang.get("common_btn_help")
	self._listViewDrop  = nil
	--
	local resource = {
		file = Path.getCSB("PopupReward", "common"),
	}
	self:setName("PopupReward")
	PopupReward.super.ctor(self, resource, isClickOtherClose, isNotCreateShade)
end

-- @Role onCreate
function PopupReward:onCreate()
	self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._listViewDrop:setContentSize(cc.size(100,200))
end

-- @Param margin
-- @Role Set between each item 
function PopupReward:setItemsMargin(margin)
	self._listViewDrop:setItemsMargin(margin)
end

-- @Pram text
-- @Role 
function PopupReward:setDetailText(text)
	self._textDetail:setString(text)
	self._textDetail:setVisible(true)
end

-- @Role Create items
function PopupReward:_createCellEx(award)
	local widget = ccui.Widget:create()

    local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconNameNode", "common"))
	uiNode:updateUI(award.type, award.value, award.size)
	uiNode:showItemBg(true)
	uiNode:setTouchEnabled(true)

	local panelSize = uiNode:getPanelSize()

	widget:setContentSize(panelSize)
	widget:addChild(uiNode)
	return widget
end

-- @Pram awards
-- @Role create items
function PopupReward:_updateAwards(awards)
	self._listViewDrop:removeAllChildren()
    for i = 1, #awards do
        local award = awards[i]
		local widget = self:_createCellEx(award)
		self._listViewDrop:pushBackCustomItem(widget)
    end

	if #awards > 4 then
		self._listViewDrop:setTouchEnabled(true)
		self._listViewDrop:setContentSize(cc.size(480,190))
		self._listViewDrop:doLayout()
	else
		self._listViewDrop:adaptWithContainerSize()
		self._listViewDrop:setTouchEnabled(false)
	end
end

function PopupReward:onBtnCancel()
	self:close()
end

-- @Param item
-- @Param index
-- @Role select item
function PopupReward:_onItemSelected(item, index)
end

-- @Param index
-- @Param t
-- @Role touch item
function PopupReward:_onItemTouch(index, t)
end

-- @Param awards
-- @Role update
function PopupReward:updateUI(awards)
	if checktable(awards) == false then
		return
	end
	self._awardList = awards
	self:_updateAwards(awards)
end

-- @Role
function PopupReward:onEnter()
end

-- @Role
function PopupReward:onExit()
end

-- @Role Finish
function PopupReward:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

return PopupReward