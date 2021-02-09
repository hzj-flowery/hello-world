
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupItemGuiderCell = class("PopupItemGuiderCell", ListViewCellBase)

local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")

function PopupItemGuiderCell:ctor()
	self._buttonOK 			= nil     --ok按钮
	self._imageIcon 		= nil 	  --icon 图片
	self._starNode 			= nil     --星级
	self._textTitleName 	= nil     --名称
	self._textDesc			= nil	  --描述信息
	self._textNum			= nil	  --关卡次数
	self._nodeNoOpen		= nil	  --未开启
	self._panelCon			= nil 	  --根节点
	self._panelTouch		= nil     --触摸面板
	local resource = {
		file = Path.getCSB("PopupItemGuiderCell", "common"),
	}
	PopupItemGuiderCell.super.ctor(self, resource)
end

function PopupItemGuiderCell:onCreate()

	local size = self._panelCon:getContentSize()
	self:setContentSize(size.width, size.height)


	--cc.bind(self._buttonOK, "CommonButtonSmallNormal")

	self._buttonOK:addClickEventListenerEx(handler(self,self._onGoHandler))
	
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:setTouchEnabled(true)
	self._panelTouch:addTouchEventListener(handler(self,self._onGoHandler))

end


--跳转函数
function PopupItemGuiderCell:_gotoFunc( cellValue )
	-- body
	WayFuncDataHelper.gotoModule(cellValue)
end
--
function PopupItemGuiderCell:updateUI(index,cellValue)
	--self._iconTemplate:unInitUI()
	--self._iconTemplate:setIcon(itemData.icon)
	local cfgData = cellValue.cfg
	self._cellValue = cellValue

	if cfgData == nil then
		return
	end
	
	self._textTitleName:setString(cfgData.name)
	self._textDesc:setString(cfgData.directions)
	self._imageIcon:loadTexture(Path.getCommonIcon("main",cfgData.icon))
	self._imageIcon:ignoreContentAdaptWithSize(true)

	self._cfgData = cfgData
	
	--主线显示方式
	local function getStroyName(stageId)
		local StoryStage = require("app.config.story_stage")
		local stroyData = StoryStage.get(stageId)
		if stroyData then
			return stroyData.name
		end
		return ""
	end

	self._textNum:setVisible(false)
	self._starNode:setVisible(false)
	self._buttonOK:setVisible(true)
	self._nodeNoOpen:setVisible(false)
	if cfgData.type == 1 then
		local stroyName = getStroyName(cfgData.value)
		local isOpen = G_UserData:getStage():isStageOpen(cfgData.value)

		local isSuperSweepOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SUPER_SWEEP)

		if isOpen == true then
			local stroyCount, maxCount = G_UserData:getStage():getStageCount(cfgData.value)
			local leftCount = maxCount - stroyCount
			local starCount = G_UserData:getStage():getStarById(cfgData.value)
			local textNumX = self._textTitleName:getPositionX() + self._textTitleName:getContentSize().width + 5
			self._textNum:setPositionX(textNumX)
			self._textNum:setString("("..leftCount.."/"..maxCount..")")
			self._textNum:setVisible(true)
	
			self._starNode:setCount(starCount,3)
			self._starNode:setVisible(true)
						
			self._nodeNoOpen:setVisible(false)

			if isSuperSweepOpen and starCount == 3 then
				self._buttonOK:setString(Lang.get("common_btn_sweep_to"))
			else
				self._buttonOK:setString(Lang.get("common_btn_go_to"))
			end
		else
			self._nodeNoOpen:setVisible(true)
			self._buttonOK:setVisible(false)
		end
	
		local dirName = Lang.getTxt(cfgData.directions, {name = stroyName})
		self._textDesc:setString(dirName)
	else
		self._buttonOK:setString(Lang.get("common_btn_go_to"))
	end
	--self._iconTemplate:initUI(itemData.itemType, itemData.itemValue)
end

function PopupItemGuiderCell:_onButtonClick(sender)
	logWarn("PopupItemGuiderCell:_onButtonClick")
	local curSelectedPos = sender:getTag()
	dump(curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end

function PopupItemGuiderCell:_onGoHandler( sender,state )
	-- body
	 logWarn("^^^^^^^^^^^^^^^"..tostring(state))
	if(state == ccui.TouchEventType.began)then
		return true
	elseif(state == ccui.TouchEventType.ended)then

		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local isTouchEnabled = self._panelTouch:isTouchEnabled()
		if(moveOffsetX <= 20 and moveOffsetY <= 20) and isTouchEnabled == true then
			if self._cellValue ~= nil then
				--self:_gotoFunc(self._cellValue)
				self:dispatchCustomCallback(sender:getTag(), self._cellValue)
			end
		end
		
	elseif(state == ccui.TouchEventType.canceled)then

	end
end

return PopupItemGuiderCell