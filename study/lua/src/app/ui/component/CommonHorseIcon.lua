--
-- Author: Liangxu
-- Date: 2018-8-27
-- 
local CommonIconBase = import(".CommonIconBase")
local CommonHorseIcon = class("CommonHorseIcon",CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local HorseConst = require("app.const.HorseConst")

local EXPORTED_METHODS = {
    "setEquipBriefVisible",
    "updateEquipBriefBg",
    "updateEquipBriefIcon",
}


function CommonHorseIcon:ctor()
	CommonHorseIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_HORSE
	self._effect1 = nil
	self._effect2 = nil
end

function CommonHorseIcon:_init()
    CommonHorseIcon.super._init(self)
    self:setTouchEnabled(false)
end

function CommonHorseIcon:bind(target)
	CommonHorseIcon.super.bind(self, target)
    cc.setmethods(target, self, EXPORTED_METHODS)

    self:_initEquipBrief(target)
end

function CommonHorseIcon:unbind(target)
	CommonHorseIcon.super.unbind(self, target)
	
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHorseIcon:updateUI(value, size)
    local itemParams = CommonHorseIcon.super.updateUI(self, value, size)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end
	self:showIconEffect()
	return itemParams
end

function CommonHorseIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				--打开战马二级详情
				local popup = require("app.scene.view.horseDetail.PopupHorseDetail").new(
					TypeConvertHelper.TYPE_HORSE, self._itemParams.cfg.id)
				popup:openWithAction()
			end
		end
	end
end

function CommonHorseIcon:removeLightEffect()
    if self._effect1 then
		self._effect1:runAction(cc.RemoveSelf:create())
		self._effect1 = nil
	end
	if self._effect2 then
		self._effect2:runAction(cc.RemoveSelf:create())
		self._effect2 = nil
	end
end

function CommonHorseIcon:showIconEffect(scale)
	self:removeLightEffect()
	if self._itemParams == nil then
		return
	end

	local baseId = self._itemParams.cfg.id
	local effects = HorseDataHelper.getEffectWithBaseId(baseId)
	if effects == nil then
		return
	end

	if self._nodeEffectUp == nil then
		self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
	end
	if self._nodeEffectDown == nil then
		self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
	end

	if #effects == 1 then
		local effectName = effects[1]
		self._effect1 = EffectGfxNode.new(effectName)
		self._nodeEffectUp:addChild(self._effect1)
        self._effect1:play()
	end

	if #effects == 2 then
		local effectName1 = effects[1]
		self._effect1 = EffectGfxNode.new(effectName1)
		self._nodeEffectDown:addChild(self._effect1)
		self._effect1:play()
    	local effectName2 = effects[2]
		self._effect2 = EffectGfxNode.new(effectName2)
		self._nodeEffectUp:addChild(self._effect2)
		self._effect2:play()
	end
end

function CommonHorseIcon:_initEquipBrief(target)
    self._imgBriefList = {}
    self._imgEquipBrief = ccui.Helper:seekNodeByName(target, "ImageEquipBrief")
    for i = 1, HorseConst.HORSE_EQUIP_TYPE_NUM do
        local imgBrief = ccui.Helper:seekNodeByName(target, "imgBrief_"..i)
        table.insert(self._imgBriefList,imgBrief)
    end
end

-- 设置装备简介icon是否显示
function CommonHorseIcon:setEquipBriefVisible(visible)
    self._imgEquipBrief:setVisible(visible)
end

-- 更新装备简介icon底图，根据战马类别，分为蓝，紫，橙
function CommonHorseIcon:updateEquipBriefBg(horseLevel)
    local texture = nil
    if horseLevel >= 5 then        --橙色和红色，目前都显示橙色
        texture = Path.getHorseImg("img_horse03")
    elseif horseLevel == 4 then
        texture = Path.getHorseImg("img_horse02")
    elseif horseLevel == 3 then
        texture = Path.getHorseImg("img_horse01")
    end

    self._imgEquipBrief:loadTexture(texture)
end

-- 更新装备简介icon图，根据装备类别，分为紫，橙，红
function CommonHorseIcon:updateEquipBriefIcon(stateList)
    for i, level in ipairs(stateList) do
        if level == 0 then
            self._imgBriefList[i]:setVisible(false)
        else
            self._imgBriefList[i]:setVisible(true)
            local texture = Path.getHorseImg("img_horse0"..level)
            self._imgBriefList[i]:loadTexture(texture)
        end
    end
end

return CommonHorseIcon