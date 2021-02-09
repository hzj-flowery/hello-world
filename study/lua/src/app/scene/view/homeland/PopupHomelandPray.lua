
local PopupBase = require("app.ui.PopupBase")
local PopupHomelandPray = class("PopupHomelandPray", PopupBase)
local HomelandPraySignNode = require("app.scene.view.homeland.HomelandPraySignNode")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local AudioConst = require("app.const.AudioConst")

local LOW_ZORDER = 1 --福签低层级
local MIDDLE_ZORDER = 10 --中层及，黑底用
local HIGH_ZORDER = 100 --福签高层级

function PopupHomelandPray:ctor()
	local resource = {
		file = Path.getCSB("PopupHomelandPray", "homeland"),
		binding = {
            _imageBg = {
				events = {{event = "touch", method = "_onClickImageBg"}}
			},
			_panelSign = {
				events = {{event = "touch", method = "_onClickPanelSign"}}
			},
		},
	}

	PopupHomelandPray.super.ctor(self, resource, nil, true)
end

function PopupHomelandPray:onCreate()
    self._nodeSignPos = {} --记录signNode的初始位置
    for i = 1, 5 do
        local pos = cc.p(self["_node"..i]:getPosition())
        self._nodeSignPos[i] = pos
        self["_node"..i]:setLocalZOrder(LOW_ZORDER)
    end
    self._canClickPanelSign = false
    self._selectPos = 0
    local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()
    local info = HomelandHelp.getTreeInfoConfig(mainTreeLevel)
    self._resType = info.prayer_cost_type
    self._resValue = info.prayer_cost_value
    self._resSize = info.prayer_cost_size
    self._panelSign:setVisible(false)
    self._panelSign:setLocalZOrder(MIDDLE_ZORDER)
end

function PopupHomelandPray:onEnter()
    self._signalBlessSuccess = G_SignalManager:add(SignalConst.EVENT_HOME_TREE_BLESS_SUCCESS, handler(self,self._onEventBlessSuccess))
    self:_updataSigns()
    self:_updateTips()
    self:_playEnterEffect()
end

function PopupHomelandPray:onExit()
	self._signalBlessSuccess:remove()
	self._signalBlessSuccess = nil
end

function PopupHomelandPray:_updataSigns()
    local buffDatas = G_UserData:getHomeland():getBuffDatasToday()
    for i = 1, 5 do
        self["_sign"..i] = HomelandPraySignNode.new(i, handler(self, self._onClickSign))
        self["_node"..i]:addChild(self["_sign"..i])
        self["_node"..i]:setScale(0.8)
        local data = buffDatas[i]
        self["_sign"..i]:updateUI(data)
    end
end

function PopupHomelandPray:_updateTips()
    self._nodeResource:updateUI(self._resType, self._resValue, self._resSize)
    self._nodeResource:setTextColorToGAndBTypeColor()
    self._nodeCount:removeAllChildren()
    local count = G_UserData:getHomeland():getPrayRestCount()
    local formatStr = Lang.get("homeland_pray_count_des", {count = count})
	local params = {defaultColor = cc.c3b(0xff, 0xb8, 0x0c), defaultSize = 20}
    local richText = ccui.RichText:createRichTextByFormatString(formatStr, params)
    richText:setAnchorPoint(cc.p(0.5, 1))
    self._nodeCount:addChild(richText)
end

function PopupHomelandPray:_onClose()
    self:close()
end

function PopupHomelandPray:_onClickSign(pos)
    if G_UserData:getHomeland():getPrayRestCount() <= 0 then
        G_Prompt:showTip(Lang.get("homeland_pray_count_empty_tip"))
        return
    end
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOk = LogicCheckHelper.enoughMoney(self._resSize)
    if not isOk then
        G_Prompt:showTip(Lang.get("common_money_not_enough"))
        return
    end
    G_UserData:getHomeland():c2sHomeTreeBless(pos)
    self["_sign"..pos]:setClickEnable(false)
end

function PopupHomelandPray:_onEventBlessSuccess(eventName, buffId, pos)

    self:_playDrawEffect(buffId, pos)
    self:_updateTips()
end

function PopupHomelandPray:_playDrawEffect(buffId, pos)
    self._panelSign:setVisible(true)
    self._canClickPanelSign = false
    self["_node"..pos]:setLocalZOrder(HIGH_ZORDER)
    local spawn = cc.Spawn:create(cc.MoveTo:create(0.4, cc.p(0, 0)), cc.ScaleTo:create(0.4, 1.0))
    local seq = cc.Sequence:create(spawn,
                                    cc.CallFunc:create(function()
                                        local data = G_UserData:getHomeland():getBuffDataWithId(buffId)
                                        self["_sign"..pos]:updateUI(data)
                                        self["_sign"..pos]:playDrawEffect()
                                        self._canClickPanelSign = true
                                        self["_sign"..pos]:setClickEnable(true)
                                    end))
    self["_node"..pos]:runAction(seq)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_JIEQIAN)
    self._selectPos = pos
end

function PopupHomelandPray:_onClickImageBg()
    self:close()
end

function PopupHomelandPray:_onClickPanelSign()
    if self._canClickPanelSign then
        self._panelSign:setVisible(false)
        local pos = self._selectPos
        self["_node"..pos]:setPosition(self._nodeSignPos[pos])
        self["_node"..pos]:setLocalZOrder(LOW_ZORDER)
        self["_node"..pos]:setScale(0.8)
        self["_sign"..pos]:stopDrawEffect()
    end
end

function PopupHomelandPray:_playEnterEffect()
    for i = 1, 5 do
        self["_sign"..i]:playEnterEffect()
    end
end

return PopupHomelandPray