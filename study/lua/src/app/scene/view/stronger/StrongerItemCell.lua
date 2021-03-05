
-- Author: hedili
-- Date:2018-01-09 16:11:05
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local StrongerItemCell = class("StrongerItemCell", ListViewCellBase)

local IMAGE_STATE = {
	[1] = { min = 0, max = 40, path = Path.getText("txt_zhuangtai01")},
	[2] = { min = 40, max = 60, path = Path.getText("txt_zhuangtai02")},
	[3] = { min = 60, max = 80, path =Path.getText("txt_zhuangtai03")},
	[4] = { min = 80, max = 100, path =Path.getText("txt_zhuangtai04")},
	[5] = { min = 100, max = 1000, path =Path.getText("txt_zhuangtai05")}
}
function StrongerItemCell:ctor()

	--csb bind var name
	self._commonButton = nil  --CommonButtonSwitchLevel1
	self._imageReceive = nil  --ImageView
	self._loadingBarProgress = nil  --LoadingBar
	self._textItemName = nil  --Text
	self._textProgress = nil  --Text

	local resource = {
		file = Path.getCSB("StrongerItemCell", "stronger"),
	}
	StrongerItemCell.super.ctor(self, resource)
end

function StrongerItemCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._commonButton:setString(Lang.get("lang_stronger_btn_go"))
	self._commonButton:switchToNormal()
	self._commonButton:addClickEventListenerEx(handler(self,self._onCommonButton))
end

function StrongerItemCell:updateUI( index, data, tabIndex)
	-- body
	self._itemData = data

	self:getSubNodeByName("Node_progress"):setVisible(false)
	self:getSubNodeByName("Node_opening"):setVisible(false)
	if tabIndex == 1 then
		self:updateTab1()
	else 
		self:updateTab2()
	end
end

function StrongerItemCell:updateTab1( ... )
	-- body
	self:getSubNodeByName("Node_progress"):setVisible(true)
	self:updateCommonImage()
	self._textItemName:setString(self._itemData.funcData.name)
	self._imageReceive:setVisible(false)
	self._commonButton:setVisible(true)
	self._loadingBarProgress:setPercent(self._itemData.percent)
	self._textProgress:setString(self._itemData.percent.."%")

	local function mathCurrStateImg( percent )
		-- body
		for i, value in ipairs(IMAGE_STATE) do
			if percent >= value.min and percent < value.max then
				return value.path
			end
		end
	end

	self:updateImageView("Image_sign", {texture = mathCurrStateImg(self._itemData.percent) })
end

function StrongerItemCell:updateTab2( ... )
	-- body
	logWarn("StrongerItemCell:updateTab2")
	self:getSubNodeByName("Node_opening"):setVisible(true)
	self:updateCommonImage()
	self._textItemName:setString(self._itemData.funcData.name)
	self._textOpenDesc:setString(self._itemData.funcData.description)
	self._imageOpen:setVisible(false)
	self._textOpenLevel:setVisible(false)
	
	local isOpen = self._itemData.isOpen

	if isOpen == false then
		self._textOpenLevel:setVisible(true)
		self._textOpenLevel:setString(self._itemData.limitDes)
	else
		self._imageOpen:setVisible(true)
	end

end

function StrongerItemCell:updateCommonImage( )
	-- body
	self:updateImageView("Image_icon", {texture =Path.getCommonIcon("main",self._itemData.funcData.icon) })
end

-- Describle：
function StrongerItemCell:_onCommonButton()

	local cfgData = self._itemData.cfgData

	if cfgData.function_jump > 0 then
		dump(cfgData.function_jump)
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		WayFuncDataHelper.gotoModuleByFuncId(cfgData.function_jump)
	end
		
	
end


function StrongerItemCell:_updateBtnState(itemData)

	self._imageReceive:setVisible(false)
	self._commonButton:setEnabled(false)

end

return StrongerItemCell