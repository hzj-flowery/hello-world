local ViewBase = require("app.ui.ViewBase")
local VipCommonInfo = class("VipCommonInfo", ViewBase)

local PackageItemCell = require("app.scene.view.package.PackageItemCell")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
VipCommonInfo.TAB_ITEM  	= 1-- 道具
VipCommonInfo.TAB_HEROFRAG  = 2-- 英雄碎片
VipCommonInfo.TAB_EQUIPFRAG  = 3-- 装备碎片
VipCommonInfo.TAB_OTHER  = 4-- 其他

function VipCommonInfo:ctor()
    --
	self._nodeTabRoot = nil --nodeTab根节点
	--左边控件
	self._listViewTab1 = nil
	--右边控件
	self._iconRight =nil
	self._textRightName =nil
	self._textRightNumDesc =nil
	self._textRightNum =nil
	self._btnRight1 =nil
	self._btnRight2 =nil
	self._textRightItemDesc =nil

	--数据
	self._itemList = {}
	

	self._selectItemPos = 1 --选中物品index
	self._selectTabIndex = VipCommonInfo.TAB_ITEM  --选中标签页

    local resource = {
        file = Path.getCSB("VipCommonInfo", "package"),
        size = {1136, 640},
        binding = {
			--_btnRight1 = {
			--	events = {{event = "touch", method = "_onButtonRight1"}}
			--},
		}
    }
    VipCommonInfo.super.ctor(self, resource)
end

function VipCommonInfo:onCreate()


end


function VipCommonInfo:isRootScene()
	return true
end

--
function VipCommonInfo:onEnter()
	self._useItemMsg 	= G_NetworkManager:add(MessageIDConst.ID_S2C_UseItem, handler(self, self._onUseItem))


end

function VipCommonInfo:onExit()
	self._merageItemMsg:remove()

end



return VipCommonInfo
