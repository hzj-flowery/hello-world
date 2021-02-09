-- 锦囊详情弹框
-- Author: Liangxu
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupSilkbagDetailEx = class("PopupSilkbagDetailEx", PopupBase)
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local SilkbagDetailExCell = require("app.scene.view.silkbag.SilkbagDetailExCell")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local SilkbagConst = require("app.const.SilkbagConst")

local Color2Res = {
	[4] = "img_bg_silkbag_01",
	[5] = "img_bg_silkbag_02",
	[6] = "img_bg_silkbag_03",
	[7] = "img_bg_silkbag_04",
}

function PopupSilkbagDetailEx:ctor(type, value)
	self._type = type
	self._value = value
	self._panelRoot = nil

	local resource = {
		file = Path.getCSB("PopupSilkbagDetailEx", "silkbag"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onButtonWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onButtonClose"}}
			},
		}
	}
	PopupSilkbagDetailEx.super.ctor(self, resource)
end

function PopupSilkbagDetailEx:onCreate()
	self._silkId = 0
	self._heroBaseIds = {}

	self._fileNodeSilkbag:setVisible(true)
	self._scrollPage:setVisible(false)
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._fileNodeTitle:setTitle(Lang.get("silkbag_suit_hero_title"))

	self._listView:setTemplate(SilkbagDetailExCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
	self:_initDesc()
end

function PopupSilkbagDetailEx:onEnter()
	if G_ConfigManager:isDalanVersion() then
		self._nodeEmpty:getSubNodeByName("ImageWaterFlow"):setVisible(false)
	end
	self:_updateUI(self._value)
end

function PopupSilkbagDetailEx:onExit()
	if self._callBack then
		self._callBack()
	end
end

function PopupSilkbagDetailEx:setCloseCallBack(callback)
	self._callBack = callback
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_OPENSILKDETAIL)
end


function PopupSilkbagDetailEx:_updateDesc(strDesc)
	self._textDesTrue:setString(strDesc)
	
	local labelSize = self._textDesTrue:getContentSize()
	self._textDescSc:setInnerContainerSize(labelSize)
	local orgHeight = self._textDescSc:getContentSize().height
	local height = math.max(orgHeight, labelSize.height)
	if math.abs(labelSize.width-self._textDes:getContentSize().width)>10 then 	-- 不满1行，位置调整
		local x = (self._textDes:getContentSize().width-labelSize.width)*0.5
		self._textDesTrue:setPosition(cc.p(x, height))
	else
		self._textDesTrue:setPosition(cc.p(0, height))
	end
	local enable = labelSize.height>orgHeight
	self._textDescSc:setTouchEnabled(enable)
	self._textDescSc:setSwallowTouches(enable)
end

function PopupSilkbagDetailEx:_initDesc()
	local size = self._textDes:getContentSize()
	local sc = ccui.ScrollView:create()
	sc:setBounceEnabled(true)
	sc:setDirection(ccui.ScrollViewDir.vertical)
	sc:setTouchEnabled(true)
	sc:setSwallowTouches(true)
	sc:setScrollBarEnabled(false)
	sc:setContentSize(size)

	local label = cc.Label:createWithTTF("", Path.getCommonFont(), self._textDes:getFontSize())
	label:setColor(self._textDes:getColor())
	label:setMaxLineWidth(size.width)
	-- label:setAnchorPoint(self._textDes:getAnchorPoint())
	label:setAnchorPoint(cc.p(0, 1))
	self._textDesTrue = label

	self._textDes:getParent():addChild(sc)
	sc:setAnchorPoint(self._textDes:getAnchorPoint())
	sc:setPosition(cc.p(self._textDes:getPosition()))
	self._textDes:setVisible(false)
	sc:addChild(label)
	self._textDescSc = sc
end

function PopupSilkbagDetailEx:_updateUI(baseId)
	self._value = baseId
	local silkbagBaseId = self._value
	self._silkId = SilkbagDataHelper.getSilkbagConfig(silkbagBaseId).mapping

	local info = SilkbagDataHelper.getSilkbagConfig(silkbagBaseId)
	local strPower = "+"..info.fake
	local colorBgRes = Color2Res[info.color]

	self._textPower:setString(strPower)
	if colorBgRes then
		self._imageColorBg:loadTexture(Path.getBackground(colorBgRes, ".png"))	
	end
	self._fileNodeSilkbag:updateUI(silkbagBaseId)
	-- self._textDes:setString(info.description)
	self:_updateDesc(info.description)

	self:_updateListView(silkbagBaseId)
end

function PopupSilkbagDetailEx:_updateListView(silkbagBaseId)
	local heroBaseIds, suitType = G_UserData:getSilkbag():getHeroIdsWithSilkbagId(silkbagBaseId)
	if suitType == SilkbagConst.SUIT_TYPE_NONE then
		self._nodeEmpty:setVisible(false)
		self._nodeList:setVisible(true)
		self._heroBaseIds = self:_filterHeroIds(heroBaseIds)
		self._listView:clearAll()
	    self._listView:resize(#self._heroBaseIds)
	else
		self._nodeEmpty:setVisible(true)
		self._nodeList:setVisible(false)
		if suitType == SilkbagConst.SUIT_TYPE_ALL then
			self._textEmptyTip:setString(Lang.get("silkbag_suit_tip_all"))
		elseif suitType == SilkbagConst.SUIT_TYPE_MALE then
			self._textEmptyTip:setString(Lang.get("silkbag_suit_tip_male"))
		elseif suitType == SilkbagConst.SUIT_TYPE_FEMALE then
			self._textEmptyTip:setString(Lang.get("silkbag_suit_tip_female"))
		end
	end
end

function PopupSilkbagDetailEx:_filterHeroIds(heroBaseIds)
	local isLeaderExist = false
	local temp = {}
	local result = {}

	local function sortFunc(a, b)
		if a.type ~= b.type then
			return a.type < b.type
		elseif a.color ~= b.color then
			return a.color > b.color
		else
			return a.id < b.id
		end
	end

	local gender = G_UserData:getBase():isMale() and 1 or 2
	for i, heroBaseId in ipairs(heroBaseIds) do
		local info = HeroDataHelper.getHeroConfig(heroBaseId)
		if info.type == 1 then --主角
			if info.gender == gender and not isLeaderExist then
				table.insert(temp, info)
				isLeaderExist = true
			end
		else
			table.insert(temp, info)
		end
	end

	table.sort(temp, sortFunc)
	for i, data in ipairs(temp) do
		table.insert(result, data.id)
	end

	return result
end

function PopupSilkbagDetailEx:_onItemUpdate(item, index)
	local index = index + 1
	local heroBaseId = self._heroBaseIds[index]
	if heroBaseId then
		item:update(self._silkId, heroBaseId)
	end
end

function PopupSilkbagDetailEx:_onItemSelected(item, index)
	
end

function PopupSilkbagDetailEx:_onItemTouch(index, t)
    
end

function PopupSilkbagDetailEx:_onButtonWayGetClicked()
	local popup = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	popup:updateUI(TypeConvertHelper.TYPE_SILKBAG, self._value)
	popup:openWithAction()
end

function PopupSilkbagDetailEx:_onButtonClose()
	self:close()
end

function PopupSilkbagDetailEx:setPageData(dataList, params)
	self._dataList = dataList
	self._scrollPage:setCallBack(handler(self, self._updateItemAvatar))
	self._scrollPage:setVisible(true)
	self._fileNodeSilkbag:setVisible(false)
	local selectPos = 0
	for i, data in ipairs(self._dataList) do
		if  data.cfg.id == self._value then
			selectPos = i
		end
	end
	self._scrollPage:setUserData(dataList, selectPos)
end

function PopupSilkbagDetailEx:_updateItemAvatar(sender, widget, index, selectPos)
	local data = self._dataList[index]
	if data == nil then
		return
	end
	local baseId = data.cfg.id

	local count = widget:getChildrenCount()
	if count == 0 then
		local CSHelper = require("yoka.utils.CSHelper")
		local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonSilkbagAvatar", "common"))
		avatar:updateUI(baseId)
		avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2))
		widget:addChild(avatar)
	end

	if selectPos == index then
		self:_updateUI(baseId)
	end

end

-- @Role 	如果在无差别竞技中调用需要特殊处理
function PopupSilkbagDetailEx:updateInSeasonSilkView()
	self._btnWayGet:setVisible(false)
	self._panelRoot:setScale(0.9)
end

return PopupSilkbagDetailEx