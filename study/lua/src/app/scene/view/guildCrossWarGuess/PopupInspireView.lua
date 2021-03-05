-- @Author  panhoa
-- @Date  8.15.2019
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupInspireView = class("PopupInspireView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local InspireCell = import(".InspireCell")
local UIHelper = require("yoka.utils.UIHelper")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


function PopupInspireView:waitEnterMsg(callBack, closeCallback)
	local function onMsgCallBack(id, message)
		self._inspireData = rawget(message, "insps") or {}
		callBack()
    end
    
    self._inspireData 	= {}
    self._closeCallback = closeCallback
	G_UserData:getGuildCrossWar():c2sBrawlPsnlInspInfo()
	local signal = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsPsnlInspInfo, onMsgCallBack)
	return signal
end

function PopupInspireView:ctor()
    self._scrollView    = nil
    self._rankView      = nil
    self._selfData      = {}

	local resource = {
		file = Path.getCSB("PopupInspireView", "guildCrossWarGuess"),
	}
	PopupInspireView.super.ctor(self, resource, false, false)
end

function PopupInspireView:onCreate()
	self._commonBk:setTitle(Lang.get("guild_cross_war_inspire"))
	self._commonBk:addCloseEventListener(handler(self, self._onBtnClose))
    self:_initScrollView()
    self:_registerEvent()
end

function PopupInspireView:onEnter()
    self._msgBrawlPsnlInsp = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsPsnlInsp, handler(self, self._s2cBrawlPsnlInsp))  -- 个人鼓舞

    self:_updateSelfData()
    self:_updateScrollView(true)
end

function PopupInspireView:onExit()
    self._msgBrawlPsnlInsp:remove()
    self._msgBrawlPsnlInsp = nil
end

function PopupInspireView:_onBtnClose()
    if self._closeCallback then
        self._closeCallback()
    end
    self:close()
end

function PopupInspireView:_updateSelfData( ... )
    local selfUid = G_UserData:getBase():getId()
    for i, v in ipairs(self._inspireData) do
        if rawequal(selfUid, v.uid) then
            self._selfData = v
            break
        end
    end
end

function PopupInspireView:_s2cBrawlPsnlInsp(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    local inspType = rawget(message, "insp_type")
    if inspType == nil then
        return
    end    

    local selfUid = G_UserData:getBase():getId()
    for i, v in ipairs(self._inspireData) do
        if rawequal(selfUid, v.uid) then
            if inspType == 1 then 
                v.def_insp_level = (v.def_insp_level + 1)
            else 
                v.atk_insp_level =(v.atk_insp_level + 1)
            end
            self._selfData = v
            break
        end
    end

    self:_playSingleEffect(inspType, message.insp_level)
end

function PopupInspireView:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = InspireCell
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._rankView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function PopupInspireView:_updateScrollView(isCreate)
	if not self._inspireData or table.nums(self._inspireData) <= 0 then
		return
    end
    
    if isCreate then
        table.sort(self._inspireData, function(data1, data2)
            if (data1.atk_insp_level + data1.def_insp_level) < (data2.atk_insp_level + data2.def_insp_level) then
                return data1
            end
        end)
    end

    local selfUid = G_UserData:getBase():getId()
    for i, v in ipairs(self._inspireData) do
        if rawequal(selfUid, v.uid) then
            table.remove(self._inspireData, i)
            table.insert(self._inspireData, 1, v)
            break
        end
    end
    self:_updateUI()
	self._rankView:updateListView(1, math.ceil(table.nums(self._inspireData)/10))
end

function PopupInspireView:_onCellUpdate(cell, cellIndex)
	if not self._inspireData then
		return
	end

    local firstIdx = (cellIndex * 10 + 1)
    local lastIdx = (cellIndex * 10 + 10)
    local cellData = {}

    for i = firstIdx, lastIdx do
        if self._inspireData[i] then
            table.insert(cellData, self._inspireData[i])
        end
    end

    cell:updateUI(cellData)
end

function PopupInspireView:_onCellSelected(cell, index)
end

function PopupInspireView:_onCellTouch(index, data)
	if data == nil then return end
end

function PopupInspireView:_updateUI( ... )
    self:_updateBtn()
    self:_updateLvel()
    self:_updateCurDesc()
    self:_updateConsume()
end

function PopupInspireView:_updateLvel()
    self._nodeInspireAtk:removeAllChildren()
    local richText = ccui.RichText:createRichTextByFormatString(
        Lang.get("guild_cross_war_inspireatk", {num = self._selfData.atk_insp_level},
        {defaultColor = Colors.CLASS_WHITE, defaultSize = 20}))
        
    richText:setAnchorPoint(cc.p(0.5, 0.5))
    self._nodeInspireAtk:addChild(richText)


    self._nodeInspireDef:removeAllChildren()
    local richText = ccui.RichText:createRichTextByFormatString(
        Lang.get("guild_cross_war_inspiredef", {num = self._selfData.def_insp_level},
        {defaultColor = Colors.CLASS_WHITE, defaultSize = 20}))
        
    richText:setAnchorPoint(cc.p(0.5, 0.5))
    self._nodeInspireDef:addChild(richText)
end

function PopupInspireView:_updateCurDesc( ... )
    self._txtNextAtk:setVisible(self._selfData.atk_insp_level < 3)
    self._txtNextDef:setVisible(self._selfData.def_insp_level < 3)
    
    if self._selfData.atk_insp_level == 0 then
        self._txtCurAtk:setString(Lang.get("guild_cross_war_inspiredesc"))
    else
        self._txtCurAtk:setString(Lang.get("guild_cross_war_inspireatkdesc1") ..self._selfData.atk_insp_level)
    end
   
    if self._selfData.def_insp_level == 0 then
        self._txtCurDef:setString(Lang.get("guild_cross_war_inspiredesc"))
    else
        self._txtCurDef:setString(Lang.get("guild_cross_war_inspiredefdesc1") ..self._selfData.def_insp_level)
    end

    self._txtNextAtk:setString(Lang.get("guild_cross_war_inspireatkdesc2") ..(self._selfData.atk_insp_level + 1))
    self._txtNextDef:setString(Lang.get("guild_cross_war_inspiredefdesc2") ..(self._selfData.def_insp_level + 1))
end

function PopupInspireView:_updateConsume( ... )
    self._imgAtkConsume:setVisible(self._selfData.atk_insp_level < 3)
    self._txtAtkConsume:setVisible(self._selfData.atk_insp_level < 3)
    self._txtAtkEnough:setVisible(self._selfData.atk_insp_level >= 3)

    self._imgDefConsume:setVisible(self._selfData.def_insp_level < 3)
    self._txtDefConsume:setVisible(self._selfData.def_insp_level < 3)
    self._txtDefEnough:setVisible(self._selfData.def_insp_level >= 3)
end

function PopupInspireView:_updateBtn( ... )
    -- body
    self._btnInspire1:setEnabled(self._selfData.atk_insp_level < 3)
    self._btnInspire2:setEnabled(self._selfData.def_insp_level < 3)
end

function PopupInspireView:_popupAlert(type)
    local function callBackOK( ... )
        if type == 1 then
            G_UserData:getGuildCrossWar():c2sBrawlPsnlInsp(0)
        else
            G_UserData:getGuildCrossWar():c2sBrawlPsnlInsp(1)
        end
    end

    local popup = require("app.ui.PopupAlert").new(Lang.get("guild_cross_war_inspire"), 
                                                   Lang.get("guild_cross_war_inspire_alert"), callBackOK, nil, nil)
	popup:openWithAction()
end

function PopupInspireView:_registerEvent( ... )
    -- body
    self._btnInspire1:setLocalZOrder(10000)
    self._btnInspire2:setLocalZOrder(10000)
    self._btnInspire1:addClickEventListenerEx(function( ... )
        local bToday, bInpireEnd, bAlert = GuildCrossWarHelper.isInspireTime()
        if bToday then
            if not bInpireEnd then
                G_Prompt:showTip(Lang.get("guild_cross_war_no_inspire"))
                return
            else
                if bAlert then
                    G_Prompt:showTip(Lang.get("guild_cross_war_no_inspire"))
                    return
                end
            end
        else
            G_Prompt:showTip(Lang.get("guild_cross_war_no_inspire"))
            return
        end
        
        if self._selfData.atk_insp_level >= 3 then
            return
        end

        self._scrollView:jumpToTop()
        self:_popupAlert(1)
    end)

    self._btnInspire2:addClickEventListenerEx(function( ... )
        local bToday, bInpireEnd, bAlert = GuildCrossWarHelper.isInspireTime()
        if bToday then
            if not bInpireEnd then
                G_Prompt:showTip(Lang.get("guild_cross_war_no_inspire"))
                return
            else
                if bAlert then
                    G_Prompt:showTip(Lang.get("guild_cross_war_no_inspire"))
                    return
                end
            end
        else
            G_Prompt:showTip(Lang.get("guild_cross_war_no_inspire"))
            return
        end
        if self._selfData.def_insp_level >= 3 then
            return
        end
        self._scrollView:jumpToTop()
        self:_popupAlert(2)
    end)
end

function PopupInspireView:_playSingleEffect(type, level)
    level = level or 1
	local particleNames = {
		[1] = "tujiegreen",
		[2] = "tujieblue",
		[3] = "tujiepurple",
    }
    
	local particleName = particleNames[level]
	local emitter = cc.ParticleSystemQuad:create("particle/"..particleName..".plist")
	emitter:resetSystem()

    type = (type + 1)
    local startPos = UIHelper.convertSpaceFromNodeToNode(self["_btnInspire"..type], self)
    startPos.x = (startPos.x + 50)
    startPos.y = (startPos.y + 50)
    emitter:setPosition(startPos)
    emitter:setAnchorPoint(cc.p(0.5, 0.5))
    self:addChild(emitter)

    
    self["_nodeEffect"]:removeAllChildren()
	local endPos = UIHelper.convertSpaceFromNodeToNode(self["_nodeEffect"], self)
	local pointPos1 = cc.p(startPos.x, startPos.y + 100)
	local pointPos2 = cc.p((startPos.x + endPos.x) / 2, startPos.y + 50)
	local bezier = {
		pointPos1,
		pointPos2,
		endPos
	}
	local action1 = cc.BezierTo:create(1.0, bezier)
	local action2 = cc.EaseSineIn:create(action1)
	emitter:runAction(
		cc.Sequence:create(
			action2,
			cc.CallFunc:create(function()
                self:_playFinishEffect(endPos)
            end),
			cc.RemoveSelf:create()
		)
	)
end

function PopupInspireView:_playFinishEffect(position)
	local function effectFunction(effect)
		if effect == "effect_equipjinglian" then
			local subEffect = EffectGfxNode.new("effect_equipjinglian")
			subEffect:play()
			return subEffect
		end

		return cc.Node:create()
	end

	local function eventFunction(event)
        if event == "finish" then
            self:_updateUI()
            self:_updateScrollView()
		end
	end

    local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_equipjinglian", effectFunction, eventFunction, true)
    effect:setScale(0.5)
    effect:setPosition(cc.p(position.x + 72, position.y + 10))
end



return PopupInspireView