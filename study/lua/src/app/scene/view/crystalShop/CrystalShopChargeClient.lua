
-- Author: nieming
-- Date:2018-02-06 21:08:32
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CrystalShopChargeClient = class("CrystalShopChargeClient", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")

CrystalShopChargeClient.BoxImageConfig = {
	{"baoxiangtong_guan","baoxiangtong_kai","baoxiangtong_kong"},
	{"baoxiangyin_guan","baoxiangyin_kai","baoxiangyin_kong"},
	{"baoxiang_jubaopeng_guan","baoxiang_jubaopeng_kai","baoxiang_jubaopeng_kong"},
	{"baoxiangjin_guan","baoxiangjin_kai","baoxiangjin_kong"},
}

function CrystalShopChargeClient:ctor(pageIndex)

	--csb bind var name

	self._listView = nil  --ScrollView
	self._pageIndex = pageIndex

	local resource = {
		file = Path.getCSB("CrystalShopChargeClient", "crystalShop"),
		binding = {

		},
	}
	CrystalShopChargeClient.super.ctor(self, resource)
end

-- Describle：
function CrystalShopChargeClient:onCreate()
	self:_initListView()
	if self._pageIndex == 1 then
		self._page1:setVisible(true)
		self._page2:setVisible(false)
		self._textDesc:setString(Lang.get("lang_crystal_shop_lable_desc1"))
		-- self._commonTitle:setTitle(Lang.get("lang_crystal_shop_title"))
	elseif self._pageIndex == 2 then
		self._page1:setVisible(false)
		self._page2:setVisible(true)
		self._textDesc:setString(Lang.get("lang_crystal_shop_lable_desc2"))
		G_EffectGfxMgr:createPlayMovingGfx( self._effectNode, "moving_shuijingshangdian", nil, nil, false )
		-- self._commonTitle:setTitle(Lang.get("lang_crystal_shop_title"))
	end
end

-- Describle：
function CrystalShopChargeClient:onEnter()

end

-- Describle：
function CrystalShopChargeClient:onExit()

end

function CrystalShopChargeClient:_refreshList()
	self._listView:resize(#self._showData)
end

function CrystalShopChargeClient:_initListView()
	-- body
	local CrystalChargeCell = require("app.scene.view.crystalShop.CrystalChargeCell")
	self._listView:setTemplate(CrystalChargeCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

end

-- Describle：
function CrystalShopChargeClient:_onListViewItemUpdate(item, index)
	local data = self._showData[index + 1]
	item:updateUI(data)
end

-- Describle：
function CrystalShopChargeClient:_onListViewItemSelected(item, index)

end

-- Describle：
function CrystalShopChargeClient:_onListViewItemTouch(index, params)
	local data = self._showData[index + 1]
	if data then
		if data:canGet(data:getPage()) then
			G_UserData:getCrystalShop():c2sGetShopCrystalAward(data:getId())
		else
			local funcId = data:getIs_function()
			if funcId == 0 then
				funcId = FunctionConst.FUNC_RECHARGE
			end
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
			WayFuncDataHelper.gotoModuleByFuncId(funcId )
		end
	end
end

function CrystalShopChargeClient:refreshClient()

	self._showData = G_UserData:getCrystalShop():getShowDatas(self._pageIndex)

	self:_refreshList()

end


return CrystalShopChargeClient
