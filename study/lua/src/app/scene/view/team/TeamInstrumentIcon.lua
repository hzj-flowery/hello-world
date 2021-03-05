--
-- Author: Liangxu
-- Date: 2017-02-20 17:47:24
--
local TeamInstrumentIcon = class("TeamInstrumentIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local InstrumentConst = require("app.const.InstrumentConst")

function TeamInstrumentIcon:ctor(target)
	self._target = target
	self._isOpen = false --是否开启
	self._pos = nil
	self._treasureId = nil
	self._totalList = nil
	self._noWearList = nil

	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._imageLock = ccui.Helper:seekNodeByName(self._target, "ImageLock")
	self._textTip = ccui.Helper:seekNodeByName(self._target, "TextTip")
	self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
	self._fileNodeName = ccui.Helper:seekNodeByName(self._target, "FileNodeName")
	cc.bind(self._fileNodeName, "CommonInstrumentName")
	self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
	cc.bind(self._fileNodeCommon, "CommonInstrumentIcon")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
    self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
    self:_initUnlock()
end

function TeamInstrumentIcon:_initUI()
	self._imageLock:setVisible(false)
    self._textTip:setVisible(false)
    self._spriteAdd:setVisible(false)
	self._fileNodeCommon:setVisible(false)
	self._fileNodeName:setVisible(false)
	self._imageRedPoint:setVisible(false)
	self._imageArrow:setVisible(false)
end

function TeamInstrumentIcon:_initUnlock( ... )
    -- body
    local isOpen, __, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT)
    if not isOpen then
        self._textTip:setPosition(cc.p(36, 42))
        self._textTip:setVisible(true)
        self._textTip:setFontSize(14)
		self._textTip:setString(Lang.get("instrument_txt_open", {level = info.level}))
	end 
end

function TeamInstrumentIcon:updateIcon(pos, heroBaseId)
	self:_initUI()
	local isOpen, des, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INSTRUMENT)
	self._isOpen = isOpen
    if not isOpen then
        
		self._imageLock:setVisible(true)
        self._textTip:setVisible(true)
        self._textTip:setPosition(cc.p(36, 42))
        self._textTip:setFontSize(14)
		self._textTip:setString(Lang.get("instrument_txt_open", {level = info.level}))
		return
	end 

	self._pos = pos
	self._heroBaseId = heroBaseId
	self._instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, 1)
	if self._instrumentId then
		local data = G_UserData:getInstrument():getInstrumentDataWithId(self._instrumentId)
		local baseId = data:getBase_id()
		local limitLevel = data:getLimit_level()
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel)
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(baseId, nil, limitLevel)
		-- self._fileNodeCommon:loadColorBg(param.icon_bg2)
		self._fileNodeCommon:setRlevel(data:getLevel())
		self._fileNodeName:setVisible(true)
		self._fileNodeName:setName(baseId, nil, limitLevel)
		self._fileNodeCommon:hideBg()
	else
		self._totalList, self._noWearList = G_UserData:getInstrument():getReplaceInstrumentListWithSlot(self._pos, self._heroBaseId)
		if #self._noWearList > 0 then
            self._spriteAdd:setVisible(true)
            self._textTip:setPosition(cc.p(36, -9))
            self._textTip:setVisible(true)
            self._textTip:setFontSize(18)
			self._textTip:setString(Lang.get("instrument_add_tip"))
			local UIActionHelper = require("app.utils.UIActionHelper")
			UIActionHelper.playBlinkEffect(self._spriteAdd)
		end
	end
end

function TeamInstrumentIcon:_onPanelTouch()
	if not self._isOpen then
		return
	end
	
	if self._instrumentId then
		G_SceneManager:showScene("instrumentDetail", self._instrumentId, InstrumentConst.INSTRUMENT_RANGE_TYPE_2)
	else
		if #self._noWearList == 0 then
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
			local configInfo = require("app.config.hero").get(self._heroBaseId)
			assert(configInfo, string.format("hero config can not find id = %d", self._heroBaseId))
			local instrumentId = configInfo.instrument_id
			if instrumentId > 0 then
				PopupItemGuider:updateUI(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId)
		    	PopupItemGuider:openWithAction()
			end
		else
			local PopupChooseInstrumentHelper = require("app.ui.PopupChooseInstrumentHelper")
			local popup = require("app.ui.PopupChooseInstrument").new()
			local callBack = handler(self, self._onChooseInstrument)
			popup:setTitle(Lang.get("instrument_wear_title"))
			popup:updateUI(PopupChooseInstrumentHelper.FROM_TYPE1, callBack, self._totalList)
			popup:openWithAction()
		end
	end
end

function TeamInstrumentIcon:_onChooseInstrument(instrumentId)
	G_UserData:getInstrument():c2sAddFightInstrument(self._pos, instrumentId)
end

function TeamInstrumentIcon:showRedPoint(visible)
	self._imageRedPoint:setVisible(visible)
end

function TeamInstrumentIcon:showUpArrow(visible)
	local UIActionHelper = require("app.utils.UIActionHelper")
	self._imageArrow:setVisible(visible)
	if visible then
		UIActionHelper.playFloatEffect(self._imageArrow)
	end
end

function TeamInstrumentIcon:onlyShow(data)
	self:_initUI()
	self._panelTouch:setEnabled(false)
	if data then
		local baseId = data:getBase_id()
		local limitLevel = data:getLimit_level()
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel)
		self._fileNodeCommon:setVisible(true)
		self._fileNodeCommon:updateUI(baseId, nil, limitLevel)
		-- self._fileNodeCommon:loadColorBg(param.icon_bg2)
		self._fileNodeCommon:setRlevel(data:getLevel())
		self._fileNodeName:setVisible(true)
		self._fileNodeCommon:hideBg()
		self._fileNodeName:setName(baseId, nil, limitLevel)
	end
end

function TeamInstrumentIcon:setVisible(visible)
	self._target:setVisible(visible)
end

function TeamInstrumentIcon:showTextBg(bShow)
	self._fileNodeName:showTextBg(bShow)
	self._fileNodeName:setFontSize(18)
end

function TeamInstrumentIcon:showUnlockView(isVisible)
    -- body
    self._imageLock:setVisible(not isVisible)
    self._spriteAdd:setVisible(not isVisible)
    self._fileNodeCommon:setVisible(not isVisible)
    self._imageRedPoint:setVisible(not isVisible)
    self._fileNodeName:setVisible(not isVisible)
    self._imageArrow:setVisible(not isVisible)
end

return TeamInstrumentIcon