--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- 物品icon
local UIHelper  = require("yoka.utils.UIHelper")

local CommonIconBase = import(".CommonIconBase")

local CommonFragmentIcon = class("CommonFragmentIcon",CommonIconBase)

local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")



local EXPORTED_METHODS = {
	"setTopImage",
	"showTopImage",
	"showFragment", --showFragment(bool)
}

function CommonFragmentIcon:ctor()
	CommonFragmentIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_FRAGMENT
end

function CommonFragmentIcon:_init()
	CommonFragmentIcon.super._init(self)
	self._imageItemTop = ccui.Helper:seekNodeByName(self._target, "ImageTop")
	logWarn("^^%%%%&**(*******")
	dump(self._imageItemTop)
	logWarn("^^%%%%&**(*******")
	self:showTopImage(false)
	--self:setTouchEnabled(false)
end

function CommonFragmentIcon:bind(target)
	CommonFragmentIcon.super.bind(self, target)

	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonFragmentIcon:unbind(target)
	CommonFragmentIcon.super.unbind(self, target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

--根据传入参数，创建并，更新UI
function CommonFragmentIcon:updateUI( value, size, rank)
    local itemParams = CommonFragmentIcon.super.updateUI(self, value, size, rank)

	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end

	self:showFragment(true)
end

function CommonFragmentIcon:showFragment(needShow)
	if needShow == nil then
		needShow = false
	end

	local FRAGMENT_ICON_PATH = Path.getTextSignet("img_com_debris01")

	if self._imageIconfragment == nil then
		local params = {
			name = "_imageIconfragment",
			texture = FRAGMENT_ICON_PATH,
			adaptWithSize = true,
		}
		ComponentIconHelper._setPostion(params,"leftBottom")

		local uiWidget = UIHelper.createImage(params)

		uiWidget:setPosition(uiWidget:getPositionX() - 5, uiWidget:getPositionY() - 5)

		self:appendUI(uiWidget)
		self._imageIconfragment = uiWidget
	end
	self._imageIconfragment:setVisible(needShow)
end


--构建顶部图片，左上角
function CommonFragmentIcon:setTopImage(imgPath)

	if imgPath == nil or imgPath == "" then
		assert("image path must not be empty~~")
		return
	end


	if self._imageItemTop == nil then
		local params = {
			name = "_imageItemTop",
			texture = imgPath,
		}
		ComponentIconHelper._setPostion(params,"leftTop2")
		
		local uiWidget = UIHelper.createImage(params)
		uiWidget:setScale(0.75)
		
		self:appendUI(uiWidget)
		self._imageItemTop = uiWidget
	end

	self._imageItemTop:loadTexture(imgPath)

end

function CommonFragmentIcon:showTopImage(show)
	if show == nil then
		show = false
	end
	if self._imageItemTop then
		self._imageItemTop:setVisible(show)
	end
end

function CommonFragmentIcon:_onShowPopupDetail( ... )
	-- body
	local conf =  self._itemParams.cfg
	if conf.comp_type == 1 then
		local PopupHeroDetail = require("app.scene.view.heroDetail.PopupHeroDetail").new(TypeConvertHelper.TYPE_HERO ,conf.comp_value)
		PopupHeroDetail:openWithAction()
	elseif conf.comp_type == 2 then
		local PopupEquipDetail = require("app.scene.view.equipmentDetail.PopupEquipDetail").new(TypeConvertHelper.TYPE_EQUIPMENT ,conf.comp_value)
		PopupEquipDetail:openWithAction()
	elseif conf.comp_type == 3 then
		local PopupTreasureDetail = require("app.scene.view.treasureDetail.PopupTreasureDetail").new(
			TypeConvertHelper.TYPE_FRAGMENT,conf.id)
		PopupTreasureDetail:openWithAction()
	elseif conf.comp_type == 4 then
		local PopupInstrumentDetail = require("app.scene.view.instrumentDetail.PopupInstrumentDetail").new(
			TypeConvertHelper.TYPE_FRAGMENT,conf.id)
		PopupInstrumentDetail:openWithAction()
	elseif conf.comp_type == 8 then
		local popupPropInfo = require("app.ui.PopupPropInfo").new(conf.id, true)
		popupPropInfo:openWithAction()
	elseif conf.comp_type == 10 then
		local PopupPetDetail = require("app.scene.view.petDetail.PopupPetDetail").new(TypeConvertHelper.TYPE_PET ,conf.comp_value)
		PopupPetDetail:openWithAction()
	elseif conf.comp_type == 12 then
		local popup = require("app.scene.view.horseDetail.PopupHorseDetail").new(TypeConvertHelper.TYPE_HORSE ,conf.comp_value)
		popup:openWithAction()
	elseif conf.comp_type == 13 then -- 历代名将
		local isHave = G_UserData:getHistoryHero():isHaveHero(conf.comp_value)
		local config = require("app.utils.data.HistoryHeroDataHelper").getHistoryHeroInfo(conf.comp_value)
		local list = {}
		table.insert(list, {cfg = config, isHave = isHave})
		local PopupHistoryHeroDetail = require("app.scene.view.historyhero.PopupHistoryHeroDetail").new(
			TypeConvertHelper.TYPE_HISTORY_HERO, nil, list, false, 1, conf.comp_value)
		PopupHistoryHeroDetail:openWithAction()
	elseif conf.comp_type == 14 then -- 名将兵器
		local PopupHisHeroWeaponDetail = require("app.scene.view.historyhero.PopupHistoryHeroWeaponDetail").new(conf.comp_value)
		PopupHisHeroWeaponDetail:openWithAction()
    elseif conf.comp_type == 15 then
        -- 战马装备碎片
        logWarn("战马装备碎片icon被点击了")
        dump(conf)
        dump(self._itemParams)
        logWarn("conf.comp_value = "..tostring(conf.comp_value))
        local PopupEquipDetail = require("app.scene.view.horseEquipDetail.PopupHorseEquipDetail").new(TypeConvertHelper.TYPE_HORSE_EQUIP ,conf.comp_value)
		PopupEquipDetail:openWithAction()
	end
end

function CommonFragmentIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else				
				self:_onShowPopupDetail()
			end
		end
	end
end

return CommonFragmentIcon
