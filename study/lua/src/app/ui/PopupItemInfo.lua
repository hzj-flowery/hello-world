--弹出界面
--物品信息弹框
--点击物品时，弹出
local PopupBase = require("app.ui.PopupBase")
local PopupItemInfo = class("PopupItemInfo", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local ICON_NORMAL_X = 78.21 -- 正常位置
local ICON_TITLE_X = 55 -- 称号位置

local DESC_NORMAL_X = 143
local DESC_TITLE_X = 163

function PopupItemInfo:ctor(title, callback)
	--
	self._title = title or Lang.get("common_title_item_info")
	self._callback = callback
	self._itemId = nil
	self._useNum = 1
	--control init
	self._btnOk = nil --
	self._itemName = nil -- 物品名称
	self._itemDesc = nil -- 物品描述
	self._itemIcon = nil -- CommonItemIcon
	self._itemOwnerDesc = nil --拥有物品
	self._itemOwnerCount = nil --数量
	--
	local resource = {
		file = Path.getCSB("PopupItemInfo", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			}
		}
	}
	PopupItemInfo.super.ctor(self, resource, true)
end

--
function PopupItemInfo:onCreate()
	-- button
	self._btnOk:setString(Lang.get("common_btn_sure"))

	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:hideCloseBtn()
end

function PopupItemInfo:updateUI(itemType, itemId)
	assert(itemId, "PopupItemInfo's itemId can't be empty!!!")
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(itemType, itemId)
	self._itemIcon:setTouchEnabled(false)
	self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	--dump(itemParams)
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)
	
	if itemParams.cfg.color == 7 then    -- 金色物品加描边
		self._itemName:enableOutline(itemParams.icon_color_outline, 2)
	end
    
	if itemType == TypeConvertHelper.TYPE_TITLE then
		self._itemIcon:setImageTemplateVisible(false)
		self._itemIcon:setPositionX(ICON_TITLE_X)
		self._itemName:setPositionX(DESC_TITLE_X)
		self._scrollView:setPositionX(DESC_TITLE_X)
		self._itemOwnerDesc:setVisible(false)
		self._itemOwnerCount:setVisible(false)
	elseif itemType == TypeConvertHelper.TYPE_FLAG then
		self._itemIcon:setImageTemplateVisible(false)
	else
		self._itemIcon:setImageTemplateVisible(true)
		self._itemIcon:setPositionX(ICON_NORMAL_X)
		self._itemName:setPositionX(DESC_NORMAL_X)
		self._scrollView:setPositionX(DESC_NORMAL_X)
		self._itemOwnerDesc:setVisible(true)
		self._itemOwnerCount:setVisible(true)
	end
	self._itemDesc:setString(itemParams.cfg.description)
	local desRender = self._itemDesc:getVirtualRenderer()
	desRender:setWidth(272)
	local scrollViewSize = self._scrollView:getContentSize()
	local desSize = desRender:getContentSize()
	if desSize.height < scrollViewSize.height then
		desSize.height = scrollViewSize.height
		self._scrollView:setTouchEnabled(false)
	else
		self._scrollView:setTouchEnabled(true)
	end
	self._itemDesc:setContentSize(desSize)
	self._scrollView:getInnerContainer():setContentSize(desSize)
	self._scrollView:jumpToTop()

	self._itemId = itemId

	local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemType, itemId)
	self:setOwnerCount(itemOwnerNum)
end

function PopupItemInfo:setOwnerCount(count)
	self._itemOwnerCount:setString("" .. count)
end

function PopupItemInfo:_onInit()
end

function PopupItemInfo:onEnter()
end

function PopupItemInfo:onExit()
end

--
function PopupItemInfo:onBtnOk()
	local isBreak = nil
	if self._callback then
		isBreak = self._callback(self._itemId)
	end
	if not isBreak then
		self:close()
	end
end

function PopupItemInfo:onBtnCancel()
	self:close()
end

-- 特例 处理神秘奖励
function PopupItemInfo:setSecretUI()
	self._itemIcon:loadIcon(Path.getActivityRes("secretIcon"))
	self._itemOwnerDesc:setVisible(false)
	self._itemOwnerCount:setVisible(false)
	self._itemName:setString(Lang.get("lang_activity_beta_appointment_secret"))
	self._itemDesc:setString(Lang.get("lang_activity_beta_appointment_secret_info"))
end

return PopupItemInfo
