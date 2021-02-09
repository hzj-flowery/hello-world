--tshirt活动

local PopupBase = require("app.ui.PopupBase")
local PopupTShirtView = class("PopupTShirtView", PopupBase)
local PopupTShirtDetail = require ("app.scene.view.tshirt.PopupTShirtDetail")
local InputUtils = require("app.utils.InputUtils")

local PLACEHOLDER_COLOR = cc.c3b(0x8a, 0x9e, 0xd5)
local FONT_COLOR = cc.c3b(0x59, 0x6f, 0xbd)

local SIZE_INFO = {
    [1] = "160 (S)",
    [2] = "165 (M)",
    [3] = "170 (L)",
    [4] = "175 (XL)",
    [5] = "180 (XXL)",
    [6] = "185 (XXXL)",
}

function PopupTShirtView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_TSHIRT_GET_INFO, onMsgCallBack)
	G_UserData:getTShirt():c2sGetUserTShirtInfo()
	return msgReg
end

function PopupTShirtView:ctor()
	local resource = {
		file = Path.getCSB("PopupTShirtView", "tshirt"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onButtonClose"}}
			},
			_buttonLook = {
				events = {{event = "touch", method = "_onButtonLook"}}
            },
            _buttonGet = {
				events = {{event = "touch", method = "_onButtonGet"}}
            },
            _buttonRegister = {
				events = {{event = "touch", method = "_onButtonRegister"}}
            },
            _buttonSize = {
				events = {{event = "touch", method = "_onButtonSize"}}
            },
		}
	}
	PopupTShirtView.super.ctor(self, resource, false)
end

function PopupTShirtView:onCreate()
    self:_initData()
    self:_initView()
end

function PopupTShirtView:_initData()
    self._pageIndex = 1
    self._showSizePanel = false --是否显示尺寸表
    self._selectIndex = 1
end

function PopupTShirtView:_initView()
    local paramName = {
        bgPanel = self._panelName,
        fontSize = 20,
        placeholderFontColor = PLACEHOLDER_COLOR,
        fontColor = FONT_COLOR,
        placeholder = Lang.get("tshirt_input_name_desc"),
        maxLength = 18,
    }
    self._editBoxName = InputUtils.createInputView(paramName)
	
    local paramPhone = {
        bgPanel = self._panelPhone,
        fontSize = 20,
        placeholderFontColor = PLACEHOLDER_COLOR,
        fontColor = FONT_COLOR,
        placeholder = Lang.get("tshirt_input_phone_desc"),
        maxLength = 11,
    }
    self._editBoxPhone = InputUtils.createInputView(paramPhone)

    local paramAddress = {
        bgPanel = self._panelAddress,
        fontSize = 20,
        placeholderFontColor = PLACEHOLDER_COLOR,
        fontColor = FONT_COLOR,
        placeholder = Lang.get("tshirt_input_address_desc"),
        maxLength = 100,
    }
    self._editBoxAddress = InputUtils.createInputView(paramAddress)

    self._imageSize:addTouchEventListener(handler(self, self._onTouchSizePanel))
end

function PopupTShirtView:onEnter()
    self._signalCommitSuccess = G_SignalManager:add(SignalConst.EVENT_TSHIRT_COMMIT_SUCCESS, handler(self, self._onEventCommitSuccess))
    self._signalRestNumChange = G_SignalManager:add(SignalConst.EVENT_TSHIRT_REST_NUM_CHANGE, handler(self, self._onEventRestNumChange))

	self:_updatePage()
end

function PopupTShirtView:onExit()
	self._signalCommitSuccess:remove()
    self._signalCommitSuccess = nil
    self._signalRestNumChange:remove()
    self._signalRestNumChange = nil
end

function PopupTShirtView:_updatePage()
    if self._pageIndex == 1 then
        self._node1:setVisible(true)
        self._node2:setVisible(false)
        self:_updateInfo1()
    elseif self._pageIndex == 2 then
        self._node1:setVisible(false)
        self._node2:setVisible(true)
        self:_updateInfo2()
    end
end

function PopupTShirtView:_updateInfo1()
    if G_UserData:getTShirt():isRegistered() then
        self._textBtnGet:setString(Lang.get("tshirt_btn_check_info"))
        self._buttonGet:setEnabled(true)
    elseif G_UserData:getTShirt():isEmpty() then
        self._textBtnGet:setString(Lang.get("tshirt_btn_empty"))
        self._buttonGet:setEnabled(true)
    else
        self._textBtnGet:setString(Lang.get("tshirt_btn_get"))
        self._buttonGet:setEnabled(true)
    end
    self:_updateRestCount()
end

function PopupTShirtView:_updateRestCount()
    local count = G_UserData:getTShirt():getRestNum()
    self._textCount:setString(count)
end

function PopupTShirtView:_updateInfo2()
    if G_UserData:getTShirt():isRegistered() then --如果已登记
        local tShirtInfo = G_UserData:getTShirt():getTShirtInfo()
        self._textSize:setString(tShirtInfo:getCloth_size())
        self._textSize:setColor(FONT_COLOR)
        self._editBoxName:setText(tShirtInfo:getReal_name())
        self._editBoxPhone:setText(tShirtInfo:getTel())
        self._editBoxAddress:setText(tShirtInfo:getAddress())
        self._buttonRegister:setString(Lang.get("tshirt_btn_register_done"))
        self._buttonRegister:setEnabled(false)
        self._buttonSize:setEnabled(false)
        self._editBoxName:setEnabled(false)
        self._editBoxPhone:setEnabled(false)
        self._editBoxAddress:setEnabled(false)
    else
        self._textSize:setString(Lang.get("tshirt_choose_size_desc"))
        self._textSize:setColor(PLACEHOLDER_COLOR)
        self._buttonRegister:setString(Lang.get("tshirt_btn_register"))
        self._buttonRegister:setEnabled(true)
        self._buttonSize:setEnabled(true)
        self._editBoxName:setEnabled(true)
        self._editBoxPhone:setEnabled(true)
        self._editBoxAddress:setEnabled(true)
    end
    self:_updateSizePanel()
end

function PopupTShirtView:_onButtonClose()
    self:close()
end

function PopupTShirtView:_onButtonLook()
    local popup = PopupTShirtDetail.new()
    popup:openWithAction()
end

function PopupTShirtView:_onButtonGet()
    self._pageIndex = 2
    self:_updatePage()
end

function PopupTShirtView:_onButtonRegister()
    local isOk = self:_checkRegister()
    if isOk then
        local popup = require("app.ui.PopupAlert").new(nil, Lang.get("tshirt_commit_tip"), handler(self, self._doRegister))
        popup:openWithAction()
    end
end

function PopupTShirtView:_doRegister()
    local tShirtInfo = {
        real_name = self._editBoxName:getText(),
        tel = self._editBoxPhone:getText(),
        address = self._editBoxAddress:getText(),
        cloth_size = self._textSize:getString(),
    }
    G_UserData:getTShirt():c2sTShirtInfoCommit(tShirtInfo)
end

function PopupTShirtView:_onButtonSize()
    self._showSizePanel = not self._showSizePanel
    self:_updateSizePanel()
end

function PopupTShirtView:_updateSizePanel()
    self._imageSize:setVisible(self._showSizePanel)
    local rotation = self._showSizePanel and 180 or 0
    self._imageArrow:setRotation(rotation)
end

function PopupTShirtView:_onTouchSizePanel(sender, state)
    if state == ccui.TouchEventType.began then
        local pos = sender:getTouchBeganPosition()
        local index = self:_checkSelectIndex(pos)
        self:_updateSelect(index)
    elseif state == ccui.TouchEventType.moved then
        local pos = sender:getTouchMovePosition()
        local index = self:_checkSelectIndex(pos)
        self:_updateSelect(index)
    elseif state == ccui.TouchEventType.ended then
		local pos = sender:getTouchEndPosition()
        local index = self:_checkSelectIndex(pos)
        self:_updateSelect(index)
        self:_updateSizeInfo()
    elseif state == ccui.TouchEventType.canceled then
        self:_updateSizeInfo()
	end
end

function PopupTShirtView:_checkSelectIndex(pos)
    local location = self._imageSize:convertToNodeSpace(pos)
    for index = 1, 6 do
        local rect = cc.rect(0, 191-(31*index), 575, 31)
		if cc.rectContainsPoint(rect, location) then
			return index
		end
    end
    return nil
end

function PopupTShirtView:_updateSelect(index)
    if index then
        self._selectIndex = index
        local posY = 175-((index-1)*31)
        self._imageSelect:setPosition(cc.p(287, posY))
    end
end

function PopupTShirtView:_updateSizeInfo()
    local strSize = SIZE_INFO[self._selectIndex]
    if strSize then
        self._textSize:setString(strSize)
        self._textSize:setColor(FONT_COLOR)
    end
end

function PopupTShirtView:_checkRegister()
    local strSize = self._textSize:getString()
    local haveSize = false
    for index, value in ipairs(SIZE_INFO) do
        if value == strSize then
            haveSize = true
            break
        end
    end
    if haveSize == false then
        G_Prompt:showTip(Lang.get("tshirt_input_empty_1"))
        return false
    end

    local strName = self._editBoxName:getText()
    if not strName or strName == "" then
        G_Prompt:showTip(Lang.get("tshirt_input_empty_2"))
        return false
    end

    local strPhone = self._editBoxPhone:getText()
    if not strPhone or strPhone == "" then
        G_Prompt:showTip(Lang.get("tshirt_input_empty_3"))
        return false
    end

    local strAddress = self._editBoxAddress:getText()
    if not strAddress or strAddress == "" then
        G_Prompt:showTip(Lang.get("tshirt_input_empty_4"))
        return false
    end

    return true
end

function PopupTShirtView:_onEventCommitSuccess(eventName)
    self:_updateInfo2()
    G_Prompt:showTip(Lang.get("tshirt_commit_success"))
end

function PopupTShirtView:_onEventRestNumChange(eventName)
    self._updateInfo1()
end

return PopupTShirtView