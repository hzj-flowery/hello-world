local CommonMainMenu = class("CommonMainMenu")
local UIHelper = require("yoka.utils.UIHelper")

local EXPORTED_METHODS = {
    "addClickEventListenerEx",
    "setString",
    "showRedPoint",
    "setEnabled",
    "setButtonTag",
    "setWidth",
    "getButton",
    "updateUI",
    "flipButton",
    "setIconAndString",
    "loadCustomIcon",
    "openCountDown",
    "stopCountDown",
    "addCustomLabel",
    "removeCustomLabel",
    "moveLetterToRight",
    "playBtnMoving",
    "stopBtnMoving",
    "playFuncGfx",
    "stopFuncGfx",
    "addCountText",
    "setCountTextVisible",
    "getFuncId",
    "setTouchEnabled",
    "showImageTip",
    "showRunningImage",
    "showFinishedImage",
    "showInTeamImage",
    "isRegisterClickListener",
    "setGlobalZOrder"
}

function CommonMainMenu:ctor()
    self._target = nil
    self._button = nil
    self._desc = nil
    self._redPoint = nil
    self._isRegisterListener = false
end

function CommonMainMenu:_init()
    self._imgBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
    self._button = ccui.Helper:seekNodeByName(self._target, "Button")
    self._nodeEffectA = ccui.Helper:seekNodeByName(self._target, "Node_a")
    self._nodeEffectB = ccui.Helper:seekNodeByName(self._target, "Node_b")
    self._desc = ccui.Helper:seekNodeByName(self._target, "Text")
    self._redPoint = ccui.Helper:seekNodeByName(self._target, "RedPoint")
    self._textImage = ccui.Helper:seekNodeByName(self._target, "TextImage")
    self._textImage:setVisible(false)
    self._runningImage = ccui.Helper:seekNodeByName(self._target, "Image_Running")
    self._finishedImage = ccui.Helper:seekNodeByName(self._target, "Image_Finished")
    self:setEnabled(true)
end

function CommonMainMenu:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonMainMenu:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonMainMenu:showRunningImage(isShow)
    self._runningImage:setVisible(isShow)
    self._runningImage:loadTexture(Path.getTextMain("txt_main_ing"))
end

function CommonMainMenu:showFinishedImage(isShow)
    self._runningImage:setVisible(isShow)
    self._runningImage:loadTexture(Path.getTextMain("txt_main_end"))
end

function CommonMainMenu:showInTeamImage(isShow)
    self._runningImage:setVisible(isShow)
    self._runningImage:loadTexture(Path.getTextMain("txt_main_team"))
end

function CommonMainMenu:playBtnMoving()
    local funcInfo = require("app.config.function_level").get(self._funcId)
    assert(funcInfo, "Invalid function_level can not find funcId " .. self._funcId)
    if funcInfo.effect_s ~= "" then
        self._button:stopAllActions()
        self._button:setPosition(cc.p(0, 0))
        self._button:setScale(1)
        self:stopBtnMoving()
        self._buttonMoving = G_EffectGfxMgr:applySingleGfx(self._button, funcInfo.effect_s)
    end
end

function CommonMainMenu:stopBtnMoving()
    if self._buttonMoving then
        self._buttonMoving:stop()
        self._buttonMoving = nil
    end
end

function CommonMainMenu:getFuncId(...)
    -- body
    return self._funcId
end
--
function CommonMainMenu:updateUI(functionId, customIcon, customIconTxt)
    local funcInfo = require("app.config.function_level").get(functionId)
    assert(funcInfo, "Invalid function_level can not find funcId " .. functionId)
    self._desc:setString(funcInfo.name)
    local iconPath
    if not customIcon then
        iconPath = Path.getCommonIcon("main", funcInfo.icon)
    else
        iconPath = customIcon
    end
    -- assert(functionId ~= FunctionConst.FUNC_GUILD_SERVER_ANSWER, "sxxpppp " .. functionId .. " " .. iconPath)

    self._iconPath = iconPath
    self._button:loadTextureNormal(iconPath)
    self._button:ignoreContentAdaptWithSize(true)
    --按钮名称，引导用处
    self._button:setName("commonMain" .. functionId)
    self._button:setTag(functionId)

    local iconTextPath
    if customIconTxt then
        iconTextPath = Path.getTextMain(customIconTxt)
    elseif funcInfo.icon_txt and funcInfo.icon_txt ~= "" then
        iconTextPath = Path.getTextMain(funcInfo.icon_txt)
    end
    if iconTextPath then
        self._textImage:loadTexture(iconTextPath)
        self._textImage:ignoreContentAdaptWithSize(true)
        self._textImage:setVisible(true)
        self._desc:setVisible(false)
    else
        self._textImage:setVisible(false)
        self._desc:setVisible(true)
    end

    self._funcId = functionId
    self._redPoint:setVisible(false)

    self:playFuncGfx()
end

function CommonMainMenu:stopFuncGfx(...)
    -- body
    self._nodeEffectA:removeAllChildren()
    self._nodeEffectB:removeAllChildren()
    if self._bHideBtnImage then
        self._button:setOpacity(255)
        self._button:loadTextureNormal(self._iconPath)
    end
end
--根据funcId 播放特效
function CommonMainMenu:playFuncGfx(info, bHideBtnImage)
    local funcInfo = info or require("app.config.function_level").get(self._funcId)
    assert(funcInfo, "Invalid function_level can not find funcId " .. self._funcId)

    local function procNodeOffset(funcInfo)
        if funcInfo.xy_1 ~= "" then
            local vector = string.split(funcInfo.xy_1, "|")
            if #vector == 2 then
                local pos = cc.p(tonumber(vector[1]), tonumber(vector[2]))
                self._nodeEffectA:setPosition(pos)
            end
        end
        if funcInfo.xy_2 ~= "" then
            local vector = string.split(funcInfo.xy_2, "|")
            if #vector == 2 then
                local pos = cc.p(tonumber(vector[1]), tonumber(vector[2]))
                self._nodeEffectB:setPosition(pos)
            end
        end
    end

    if funcInfo.effect_a ~= "" then
        self._nodeEffectA:removeAllChildren()
        G_EffectGfxMgr:createPlayGfx(self._nodeEffectA, funcInfo.effect_a)
    end

    if funcInfo.effect_b ~= "" then
        self._nodeEffectB:removeAllChildren()
        G_EffectGfxMgr:createPlayGfx(self._nodeEffectB, funcInfo.effect_b)
    end

    if bHideBtnImage then
        self._bHideBtnImage = true
        -- local iconPath = Path.getCommonIcon("main", "btn_main_enter8_lidaiguanjun")
        -- self._button:loadTextureNormal(iconPath)
        self._button:setOpacity(0)
    end

    procNodeOffset(funcInfo)
end

function CommonMainMenu:setIconAndString(icon, string)
    self._desc:setString(string)
    local iconPath = Path.getCommonIcon("main", icon)
    self._button:loadTextureNormal(iconPath)
    self._button:ignoreContentAdaptWithSize(true)
    self._redPoint:setVisible(false)
end
-- 替换自定义图标
function CommonMainMenu:loadCustomIcon(iconPath)
    self._button:loadTextureNormal(iconPath)
    self._button:ignoreContentAdaptWithSize(true)
end

--
function CommonMainMenu:addClickEventListenerEx(callback)
    if not self._isRegisterListener then
        self._button:addClickEventListenerEx(callback, true, nil, 0)
    end
end

--
function CommonMainMenu:setString(s)
    self._desc:setString(s)
end
--
function CommonMainMenu:showRedPoint(v)
    if v then
        self:showImageTip(false, "")
    end
    self._redPoint:setVisible(v)
end

function CommonMainMenu:showImageTip(show, texture)
    if self._redPoint:isVisible() then
        show = false
    end
    if show then
        local imgTip = self._target:getChildByName("image_tip")
        if not imgTip then
            local UIHelper = require("yoka.utils.UIHelper")
            imgTip = UIHelper.createImage({texture = texture})
            imgTip:setName("image_tip")
            self._target:addChild(imgTip)
            imgTip:setPosition(30, 30)
        end
        imgTip:setVisible(true)
    else
        local imgTip = self._target:getChildByName("image_tip")
        if imgTip then
            imgTip:setVisible(false)
        end
    end
end

--
function CommonMainMenu:setEnabled(e)
    self._button:setEnabled(e)
    self._desc:setColor(e and Colors.COLOR_POPUP_SPECIAL_NOTE or Colors.COLOR_BUTTON_LITTLE_GRAY)
    self._desc:enableOutline(e and Colors.COLOR_SCENE_OUTLINE or Colors.COLOR_BUTTON_LITTLE_GRAY_OUTLINE, 2)
end

function CommonMainMenu:setWidth(width)
    local height = self._button:getContentSize().height
    self._button:setContentSize(width, height)
end

function CommonMainMenu:setButtonTag(tag)
    self._button:setTag(tag)
end

function CommonMainMenu:getButton()
    return self._button
end

function CommonMainMenu:flipButton(needFlip)
    needFlip = needFlip or false
    local scaleX = math.abs(self._button:getScaleX())
    if needFlip then
        self._button:setScaleX(-scaleX)
    else
        self._button:setScaleX(scaleX)
    end
end

function CommonMainMenu:removeCustomLabel()
    if self._customLabel then
        self._customLabelBg:removeSelf()
        self._customLabelBg = nil
        self._customLabel:removeSelf()
        self._customLabel = nil
    end
end

function CommonMainMenu:addCustomLabel(str, fontSize, pos, color, outlineColor, outlineSize)
    self:removeCustomLabel()
    self._customLabelBg = self:_createLabelBgImageHelp(pos)
    if str == nil or string.len( str ) == 0 then
        self._customLabelBg:setVisible(false)
    end
    self._customLabel = self:_createLabelHelp(str, fontSize, pos, color, outlineColor, outlineSize)
    self._target:addChild(self._customLabelBg)
    self._target:addChild(self._customLabel)
end

function CommonMainMenu:_createLabelBgImageHelp(pos)
    return UIHelper.createImage(
        {
            texture = Path.getUICommon("img_com_icon_txtbg01"),
            position = pos
        }
    )
end

function CommonMainMenu:_createLabelHelp(str, fontSize, pos, color, outlineColor, outlineSize)
    return UIHelper.createLabel(
        {
            text = str,
            fontSize = fontSize,
            color = color,
            outlineColor = outlineColor,
            outlineSize = outlineSize,
            position = pos
        }
    )
end

--开启倒计时 使用action 实现定时器
function CommonMainMenu:openCountDown(endTime, endCallback, isShowDay)
    local currTime = G_ServerTime:getTime()
    if currTime >= endTime then
        if endCallback then
            endCallback(self)
        end
        return
    end

    self:stopCountDown()
    self._countDownEndTime = endTime
    local strInitTime = G_ServerTime:getLeftSecondsString(self._countDownEndTime, "00:00:00")
    if isShowDay then --要显示天数
        strInitTime = G_ServerTime:getLeftDHMSFormatEx(self._countDownEndTime)
    end
    local pos = cc.p(0, -30-14)
    self._leftTimeLabelBg = self:_createLabelBgImageHelp(pos)
    self._leftTimeLabel =
        self:_createLabelHelp(
        strInitTime,
        16,
        pos,
        cc.c3b(0, 0xff, 0),
        cc.c3b(0,0,0),
        1
    )
    self._target:addChild(self._leftTimeLabelBg)
    self._target:addChild(self._leftTimeLabel)

    local delay = cc.DelayTime:create(0.5)
    local sequence =
        cc.Sequence:create(
        delay,
        cc.CallFunc:create(
            function()
                if not self._leftTimeLabel then
                    return
                end
                local currTime = G_ServerTime:getTime()
                if currTime <= self._countDownEndTime then
                    local strTime = G_ServerTime:getLeftSecondsString(self._countDownEndTime, "00:00:00")
                    if isShowDay then --要显示天数
                        strTime = G_ServerTime:getLeftDHMSFormatEx(self._countDownEndTime)
                    end
                    self._leftTimeLabel:setString(strTime)
                else
                    self:stopCountDown()
                    if endCallback then
                        endCallback(self)
                    end
                end
            end
        )
    )

    local action = cc.RepeatForever:create(sequence)
    self._leftTimeLabel:runAction(action)
end

function CommonMainMenu:stopCountDown()
    if self._leftTimeLabel then
        self._leftTimeLabelBg:removeSelf()
        self._leftTimeLabelBg = nil
        self._leftTimeLabel:removeSelf()
        self._leftTimeLabel = nil
    end
end

function CommonMainMenu:moveLetterToRight()
    self._textImage:setPositionY(-22)
    self._redPoint:setPosition(30, 25)
    self._imgBg:setVisible(true)
end

function CommonMainMenu:addCountText(count)
    if not count then
        return
    end
    if not self._countText then
        local bgImage = UIHelper.createImage({texture = Path.getCommonImage("img_redpoint02")})
        self._target:addChild(bgImage)
        local posx, posy = self._redPoint:getPosition()
        bgImage:setPosition(cc.p(posx, posy))
        local size = bgImage:getContentSize()
        self._countTextBg = bgImage
        self._countText = self:_createLabelHelp(count, 20, cc.p(size.width / 2, size.height / 2), Colors.DARK_BG_ONE)
        bgImage:addChild(self._countText)
    else
        self._countText:setString(count)
    end
end

function CommonMainMenu:setCountTextVisible(trueOrFalse)
    if self._countTextBg then
        self._countTextBg:setVisible(trueOrFalse)
    end
end

function CommonMainMenu:setGlobalZOrder(order)
    self._button:setGlobalZOrder(order)
    self._redPoint:setGlobalZOrder(order)
    self._textImage:setGlobalZOrder(order)
    self._runningImage:setGlobalZOrder(order)
end

return CommonMainMenu
