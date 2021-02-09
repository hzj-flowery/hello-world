--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法位解锁提示弹窗
local PopupBase = require("app.ui.PopupBase")
local PopupTacticsPositionUnlockInfo = class("PopupTacticsPositionUnlockInfo", PopupBase)
local Path = require("app.utils.Path")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")

function PopupTacticsPositionUnlockInfo:ctor(info, callbackOK, isClickOtherClose, isNotCreateShade)
    self._info = info
	self._callbackOK = callbackOK

	local resource = {
		file = Path.getCSB("PopupTacticsPositionUnlockInfo", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onButtonOK"}}
			},
		}
	}
	PopupTacticsPositionUnlockInfo.super.ctor(self, resource,isClickOtherClose,isNotCreateShade)
end

--
function PopupTacticsPositionUnlockInfo:onCreate()
	-- title
	self._popBG:setTitle(Lang.get("tactics_unlock_position_popup_title"))
	self._popBG:addCloseEventListener(handler(self,self.onButtonClose))

	self._btnOk:addClickEventListenerExDelay(handler(self,self.onButtonOK), 100)

	self._btnOk:setString(Lang.get("common_btn_sure"))

    self:_initDesc()
end

function PopupTacticsPositionUnlockInfo:onButtonClose()
    self:close()
end

function PopupTacticsPositionUnlockInfo:onButtonOK()
	if self._callbackOK then
		self._callbackOK()
	end

	self:close()
end

function PopupTacticsPositionUnlockInfo:_initDesc()
    local slot = self._info.slot
    local isOpen,_,funcLevelInfo = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_TACTICS_POS"..slot])
    local level = funcLevelInfo.level

    self._txt2:setString(Lang.get("tactics_unlock_pos_popup_content1", {level=level}))

    local needColor, needNum = require("app.utils.data.TacticsDataHelper").getTacticsPosUnlockParam(slot)

    local colorTip = Lang.get("lang_sellfragmentselect_quality_" .. needColor)
    local color = Colors.COLOR_QUALITY[needColor]
    local colorStr =  Colors.toHexStr(color)
    local outlineColor = Colors.COLOR_QUALITY_OUTLINE[needColor]
    local outlineColorStr =  Colors.toHexStr(outlineColor)
    local outlineSize = 0
    if needColor==7 then
        outlineSize = 2
    end

    local content = Lang.get("tactics_unlock_pos_popup_content2",
        {num=needNum, colorTip=colorTip, colorStr=colorStr, outlineColorStr=outlineColorStr, outlineSize=outlineSize})
    
    local richText = ccui.RichText:create()
    richText:setRichTextWithJson(content)
    
	local size = self._panelContent:getContentSize()
	local sizeTemp = cc.size(size.width,0)

	richText:setAnchorPoint(cc.p(0, 0.5))
	-- richText:setVerticalSpace(10)
	richText:setContentSize(sizeTemp)
	richText:ignoreContentAdaptWithSize(false)
    self._txt3:getParent():addChild(richText)
    self._txt3:setVisible(false)
    local pos = cc.p(self._txt3:getPosition())
    richText:setPosition(pos)
    richText:formatText()
end

return PopupTacticsPositionUnlockInfo
