--
-- Author: JerryHe
-- Date: 2019-01-28
--
local TeamHorseEquipIcon = class("TeamHorseEquipIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local HorseConst = require("app.const.HorseConst")

local SKETCH_RES = {
	[1] = "img_horse07",
	[2] = "img_horse08",
	[3] = "img_horse09",
}

function TeamHorseEquipIcon:ctor(target,horseId,equipPos)
    self._target = target
    self._horseId = horseId         --战马id
    self._equipPos = equipPos       --战马装备孔位
	self._totalList = {} --总的更换列表
	self._noWearList = {} --未穿戴的更换列表

    self._equipName = ccui.Helper:seekNodeByName(self._target,"TextName")
	self._imageSketch = ccui.Helper:seekNodeByName(self._target, "ImageSketch")
	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonHorseEquipIcon")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function TeamHorseEquipIcon:_initUI()
	self._imageSketch:setVisible(false)
	self._spriteAdd:setVisible(false)
	self._fileNodeCommon:setVisible(false)
	self._imageRedPoint:setVisible(false)
    self._imageArrow:setVisible(false)
    
    self._equipName:setVisible(false)
end

function TeamHorseEquipIcon:updateIcon()
    self._horseEquipInfo = G_UserData:getHorseEquipment():getEquipedEquipinfoWithHorseIdAndSlot(self._horseId,self._equipPos)
	
	self:_initUI()

	if self._horseEquipInfo then
		local equipBaseId = self._horseEquipInfo:getBase_id()
		
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(equipBaseId)

        self._equipName:setVisible(true)
        self._equipName:setString(self._horseEquipInfo.name)
	else
		self._imageSketch:loadTexture(Path.getHorseImg(SKETCH_RES[self._equipPos]))
		self._imageSketch:setVisible(true)
        self._totalList,self._noWearList = G_UserData:getHorseEquipment():getReplaceEquipmentListWithSlot(self._equipPos)

		if #self._noWearList > 0 then
			self._spriteAdd:setVisible(true)
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._spriteAdd)
		end
    end
    
    self:_showRedPoint()
end

function TeamHorseEquipIcon:_onPanelTouch()
	if self._horseEquipInfo then
        -- G_SceneManager:showScene("horseEquipDetail", self._horseEquipInfo, HorseConst.HORSE_EQUIP_RANGE_TYPE_2)
        local function callback(backType)
            if backType then
                if backType == "change" then
                    local scene = G_SceneManager:getTopScene()
                    local view = scene:getSceneView()
                    local viewName = view:getName()
                    logWarn("点击更好马具了,viewName = "..tostring(viewName))
                    if viewName == "HorseDetailView" or viewName == "HorseTrainView"  then
                        view:popupHorseEquipReplace(self._equipPos)
                    end
                elseif backType == "put_off" then
                    G_UserData:getHorseEquipment():c2sEquipWarHorseEquipment(self._horseId,self._equipPos,0)
                end
            end
        end

        local popupHorseEquipInfo = require("app.ui.PopupHorseEquipInfo").new(callback)
        popupHorseEquipInfo:updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP,self._horseEquipInfo:getBase_id())
        popupHorseEquipInfo:openWithAction()
	else
        if #self._noWearList == 0 then
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
		    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, DataConst["SHORTCUT_HORSE_EQUIP_ID_"..self._equipPos])          --todo Jerry 这里需要设置类型是战马装备，但是现在配表中，缺少15类型的获取方式
		    PopupItemGuider:openWithAction()
		else
			local PopupChooseHorseEquipHelper = require("app.ui.PopupChooseHorseEquipHelper")
			local popup = require("app.ui.PopupChooseHorseEquip").new()
			local callBack = handler(self, self._onChooseEquip)
			popup:setTitle(Lang.get("horse_equip_wear_title"))                
			popup:updateUI(PopupChooseHorseEquipHelper.FROM_TYPE1, callBack, self._totalList, nil, self._noWearList, self._equipPos)
            popup:openWithAction()
		end
    end
end

function TeamHorseEquipIcon:_onChooseEquip(equipInfo)
    logWarn("点击了装备，id="..equipInfo:getId())
    dump(self._horseEquipInfo)
	G_UserData:getHorseEquipment():c2sEquipWarHorseEquipment(self._horseId,self._equipPos,equipInfo:getId())
end

function TeamHorseEquipIcon:_showRedPoint()
    if not self._fileNodeCommon:isVisible() then
        -- 当前孔位上，没有装备，查看是否有当前类型的装备，如果有，显示红点
        local hasFree = G_UserData:getHorseEquipment():isHaveFreeHorseEquip(self._equipPos)
        self._imageRedPoint:setVisible(hasFree)
    else
        -- 当前孔位上，有装备，查看是否有更好的装备，如果有，显示红点
        local hasBetter = G_UserData:getHorseEquipment():isHaveBetterHorseEquip(self._horseEquipInfo:getBase_id())
        self._imageRedPoint:setVisible(hasBetter)
    end
end

function TeamHorseEquipIcon:showUpArrow(visible)
	local UIActionHelper = require("app.utils.UIActionHelper")
	self._imageArrow:setVisible(visible)
	if visible then
		UIActionHelper.playFloatEffect(self._imageArrow)
	end
end

--只显示
-- function TeamHorseEquipIcon:onlyShow(slot, data)
-- 	self:_initUI()
-- 	self._panelTouch:setEnabled(false)
-- 	if data then
-- 		local baseId = data:getBase_id()
-- 		self._fileNodeCommon:setVisible(true)
-- 		self._fileNodeCommon:updateUI(baseId)
-- 		-- self._fileNodeCommon:setLevel(data:getLevel())
-- 		-- self._fileNodeCommon:setRlevel(data:getR_level())
-- 		self._fileNodeName:setVisible(true)
-- 		self._fileNodeName:setName(baseId)
-- 	else
-- 		self._imageSketch:loadTexture(Path.getUICommonFrame(SKETCH_RES[slot]))
-- 		self._imageSketch:setVisible(true)
-- 	end
-- end

-- function TeamHorseEquipIcon:showEffect()
-- 	self:_clearEffect()
-- 	self._fileNodeCommon:showIconEffect()
-- end

-- function TeamHorseEquipIcon:_clearEffect()
-- 	self._fileNodeCommon:removeLightEffect()
-- end

return TeamHorseEquipIcon