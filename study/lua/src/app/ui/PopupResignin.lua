--弹出界面
local PopupBase = require("app.ui.PopupBase")
local PopupResignin = class("PopupResignin", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst	 = require("app.const.DataConst")

function PopupResignin:ctor( title, callback)
	self._title = title or Lang.get("lang_activity_dinner_resignin_title") 
	self._callback = callback
	self._listViewDrop  = nil
	self._btnOk = nil -- 
     self._commonResourceInfo = nil
	--
	local resource = {
		file = Path.getCSB("PopupResignin", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			}
		}
	}
	PopupResignin.super.ctor(self, resource, true)
end

--
function PopupResignin:onCreate()
	self._commonNodeBk:setTitle(self._title)
	self._btnOk:setString(Lang.get("lang_activity_dinner_resignin"))
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
   
	self._listViewDrop:setContentSize(cc.size(98,98))

    --价格
    self._commonResourceInfo:showResName(false)
end

function PopupResignin:setBtnEnable(enable)
	self._btnOk:setEnabled(enable)
end

function PopupResignin:setBtnText(text)
	self._btnOk:setString(text)
end

function PopupResignin:setGold(gold)
	 self._commonResourceInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,gold)
end


function PopupResignin:_createCellEx(award)
	local widget = ccui.Widget:create()

    local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
	uiNode:unInitUI()
	uiNode:initUI( award.type, award.value, award.size)
	uiNode:setTouchEnabled(false)
   
    --local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconNameNode", "common"))
	--uiNode:updateUI(award.type, award.value, award.size)
	--uiNode:setTouchEnabled(true)

	local panelSize =uiNode:getPanelSize()

	widget:setContentSize(panelSize)

	uiNode:setPosition(panelSize.width*0.5, panelSize.height*0.5)
	widget:addChild(uiNode)

	return widget
end



--创建左对齐物品列表
function PopupResignin:_updateAwards(awards)
	self._listViewDrop:removeAllChildren()
    for i = 1, #awards do
        local award = awards[i]
		local widget = self:_createCellEx(award)
		self._listViewDrop:pushBackCustomItem(widget)
    end

	--
	if #awards > 4 then
		self._listViewDrop:setTouchEnabled(true)
		self._listViewDrop:setContentSize(cc.size(480,200))
		self._listViewDrop:doLayout()
	else
		self._listViewDrop:adaptWithContainerSize()
		self._listViewDrop:setTouchEnabled(false)
	end
	
end


function PopupResignin:_onItemSelected(item, index)
	
end

function PopupResignin:_onItemTouch(index, t)

end


function PopupResignin:updateUI(awards)
	if checktable(awards) == false then
		return
	end
	dump(awards)
	self._awardList = awards
	self:_updateAwards(awards)
end

function PopupResignin:_onInit()
end


function PopupResignin:onEnter()
    
end

function PopupResignin:onExit()
    
end

function PopupResignin:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback()
	end
	if not isBreak then
		self:close()
	end
end

function PopupResignin:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

return PopupResignin