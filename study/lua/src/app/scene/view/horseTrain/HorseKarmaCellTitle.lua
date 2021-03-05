--
-- Author: JerryHe
-- Date: 2019-01-29
-- 战马图鉴Cell中的标头
local HorseKarmaCellTitle = class("HorseKarmaCellTitle")

local COLOR_ATTR = {
    cc.c3b(182,101,17),cc.c3b(47,159,7)
}

local POS_ATTR = {
    cc.p(54,219),cc.p(170,219),cc.p(54,198),cc.p(170,198)
}

local MAX_ATTR_NUM = 4

function HorseKarmaCellTitle:ctor(target, callback)
	self._target = target
	self._callback = callback

	self._textDes = nil
    self._buttonActive = nil
    
    self._attrLabelList = {}

	self:_init()
end

function HorseKarmaCellTitle:_init()
	-- self._textDes = ccui.Helper:seekNodeByName(self._target, "TextDes")
	self._buttonActive = ccui.Helper:seekNodeByName(self._target, "ButtonActive")
	cc.bind(self._buttonActive, "CommonButtonLevel2Highlight")
	self._buttonActive:setString(Lang.get("hero_karma_btn_active"))
	self._buttonActive:addClickEventListenerEx(handler(self, self._onClickButton))
    self._imageActivated = ccui.Helper:seekNodeByName(self._target, "ImageActivated")

    for i = 1, MAX_ATTR_NUM do
        local labelAttr = ccui.Helper:seekNodeByName(self._target, "TextAttr_"..i)
        -- labelAttr:setPosition(POS_ATTR[i])
        table.insert(self._attrLabelList,labelAttr)
        labelAttr:setVisible(false)
    end
end

function HorseKarmaCellTitle:setDes(desInfo, isActivated, isCanActivate, attrId)
    -- self._textDes:setString(des)

	if isActivated then
		self._imageActivated:setVisible(true)
		self._buttonActive:setVisible(false)
	else
		self._imageActivated:setVisible(false)
		self._buttonActive:setVisible(true)
		self._buttonActive:setEnabled(isCanActivate)
    end
    
    self:_setAttrColor(isActivated)
    self:_setAttrDesc(desInfo)
end

function HorseKarmaCellTitle:_setAttrColor(isActivated)
    local color = COLOR_ATTR[1]          --非激活状态
    if isActivated then
        color = COLOR_ATTR[2]            --已激活状态
    end
    for i, labelAttr in ipairs(self._attrLabelList) do
        labelAttr:setColor(color)
    end
end

function HorseKarmaCellTitle:_setAttrDesc(desInfo)
    for i, labelAttr in ipairs(self._attrLabelList) do
        labelAttr:setVisible(false)
        if desInfo[i] then
            labelAttr:setVisible(true)
            labelAttr:setString(desInfo[i])
        end
    end
end

function HorseKarmaCellTitle:_onClickButton()
	if self._callback then
		self._callback()
	end
end

return HorseKarmaCellTitle