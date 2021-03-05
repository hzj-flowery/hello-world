-- @Author panhoa
-- @Date 4.3.2020

local ViewBase = require("app.ui.ViewBase")
local BoutView = class("BoutView", ViewBase)
local BoutHelper = require("app.scene.view.bout.BoutHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")


function BoutView:waitEnterMsg(callBack)
    -- body
    G_UserData:getBout():c2sGetBoutInfo()
    return G_SignalManager:add(SignalConst.EVENT_BOUT_ENTRY, function(id, message)
        callBack()
    end)
end

function BoutView:ctor( ... )
    -- body
    self._topbarBase    = nil
    self._consumeNode   = nil
    self._lastTotalPower= 0
    self._diffPower 	= 0 
    self._selectedBout  = {}
    
    local resource = {
        file = Path.getCSB("BoutView", "bout"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {}
    }
    self:setName("BoutView")
    BoutView.super.ctor(self, resource)
end

function BoutView:onCreate( ... )
    self._selectedBout.pos = 1
    self._selectedBout.id = G_UserData:getBout():getCurBoutId()
    
    -- body
    self:_initCommonView()
    self:_initBoutPoints()
    self:_initModuleView()
    self:_updateBoutTitle()
    self:_updateCurBoutId(true)
    self:_recordTotalPower()
end

function BoutView:onEnter( ... )
    -- body
    self._signalUnlockBout = G_SignalManager:add(SignalConst.EVENT_BOUT_UNLOCKSUCCESS, handler(self, self._onUnlockSuccess))--解锁成功
    self._signalGetRechargeNotice = G_SignalManager:add(SignalConst.EVENT_RECHARGE_NOTICE, handler(self, self._onEventGetRechargeNotice))
end

function BoutView:onExit( ... )
    -- body
    self._signalUnlockBout:remove()
    self._signalUnlockBout = nil
    self._signalGetRechargeNotice:remove()
    self._signalGetRechargeNotice = nil
end

function BoutView:_updateBoutTitle( ... )
    -- body
    local curBoutId = G_UserData:getBout():getCurBoutId()
    local boutNameImg = self._imageBg:getChildByName("BoutName")
    if boutNameImg == nil then
        local UIHelper  = require("yoka.utils.UIHelper")
        boutNameImg = UIHelper.createImage({texture = Path.getBoutPath("txt_bout_0"..curBoutId)})
        boutNameImg:setPosition(252, 402)
        boutNameImg:setName("BoutName")
        boutNameImg:ignoreContentAdaptWithSize(true)
        self._imageBg:addChild(boutNameImg)
    end
    boutNameImg:loadTexture(Path.getBoutPath("txt_bout_0"..curBoutId))
end

--@Role     Init CommonControll's View
function BoutView:_initCommonView( ... )
    -- body
    self._topbarBase:setImageTitle("txt_sys_com_zhenfa")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_SEASONSPORT)
    self._topbarBase:updateHelpUI(FunctionConst.FUNC_BOUT)
    self._topbarBase:setCallBackOnBack(function( ... ) 
        G_SceneManager:popScene()
    end)
end

--@Role     Init Bout
function BoutView:_initBoutPoints( ... )
    -- body
    self._pointNodes = {}
    self._pointBottomNodes = {}
    local curPoints = G_UserData:getBout():getCurBoutPoints()
    local BoutConst = require("app.const.BoutConst")
    for index, value in ipairs(curPoints) do
        local pointNode = self._imageBg:getChildByName(BoutConst.BOUT_POINT_NAMEKEY..value.point)
        if pointNode == nil then
            local boutBottom = BoutHelper.createBottom(self._imageBg,value.point)
            pointNode = BoutHelper.createBoutPoint(self._imageBg, value.point, handler(self, self._selectedPoint))
            local isEnable = rawequal(value.point_type, 2) and true 
                                                            or G_UserData:getBout():checkUnlocked(value.id, value.point)
            local pos = string.split(value.position, "|")
            pointNode:getChildByName("pointName"):setString(value.point_name)
            BoutHelper.checkTexture(pointNode, isEnable)
            pointNode:setPosition(cc.p(pos[1], pos[2]+23))
            boutBottom:setPosition(cc.p(pos[1], pos[2]))

            local opCity = G_UserData:getBout():checkUnlocked(value.id, value.point) and 80 or 255
            boutBottom:setOpacity(opCity)
            self._pointBottomNodes[value.point] = boutBottom
        end
        self._pointNodes[value.point] = pointNode
    end
end

function BoutView:_updateNameColor(data, node, isSelect)
    -- body
    local isLocked = G_UserData:getBout():checkUnlocked(data.id, data.pos)
    if not isLocked then
        BoutHelper.checkNameColor(node:getChildByName("pointName"), 3)
    else
        local colorIdx = isSelect and 2 or 1 
        BoutHelper.checkNameColor(node:getChildByName("pointName"), colorIdx)
    end
end

function BoutView:_updateSelected(isAuto)
    -- body
    if isAuto then
        local isRed, unlockIdx = false, self._selectedBout.pos
        for index = 1, #self._pointNodes do
            if G_UserData:getBout():checkUnlocked(self._selectedBout.id, index) then
                unlockIdx = self._selectedBout.pos == unlockIdx and index or unlockIdx
                if self._pointNodes[index]:getChildByName("RedPoint"):isVisible() then
                    self._selectedBout.pos = index
                    isRed = true
                    break
                end
            end
        end
        self._selectedBout.pos = isRed and self._selectedBout.pos or unlockIdx
    end

    for key, value in pairs(self._pointNodes) do
        local isSelect = rawequal(self._selectedBout.pos, value:getTag())
        value:getChildByName("selected"):setVisible(isSelect)
        self:_updateNameColor({id = self._selectedBout.id, pos = value:getTag()}, value, isSelect)
    end
    self:_updateConsumeView()
end

function BoutView:_selectedPoint(sender)
    -- body
    self._consumeNode:setVisible(true)
    self._selectedBout.pos = sender:getTag()
    self:_updateSelected()
end

function BoutView:_closeMask( ... )
    -- body
    if self._selectedBout.pos <= 0 or not self._pointNodes[self._selectedBout.pos] then
        return
    end
    self._consumeNode:setVisible(false)
    self._pointNodes[self._selectedBout.pos]:getChildByName("selected"):setVisible(false)
    
    local colorIdx = G_UserData:getBout():checkUnlocked(self._selectedBout.id, self._selectedBout.pos) and 1 or 3
    BoutHelper.checkNameColor(self._pointNodes[self._selectedBout.pos]:getChildByName("pointName"), colorIdx)
end

function BoutView:_initModuleView( ... )
    -- body
    self._imageBg:addClickEventListenerEx(function( ... )
        -- body
        self:_closeMask()
    end)

    self:_initAddonBtn()
    self:_initConsumeView()
end

function BoutView:_initConsumeView( ... )
    -- body
    self._boutConsumeModule = require("app.scene.view.bout.BoutConsumeModule").new()
    self._consumeNode:addChild(self._boutConsumeModule)
end

function BoutView:_initAddonBtn( ... )
    -- body
    local btnAddOn = BoutHelper.createAddOn(function( ... )
        local boutList = G_UserData:getBout():getBoutList() or {}
        if boutList[1] and table.nums(boutList[1]) > 0 then
            self:_closeMask()
            G_SceneManager:showDialog("app.scene.view.bout.PopupAttrOverView")
        else
            G_Prompt:showTip(Lang.get("bout_not_lessone"))
        end
    end)
    self._imageBg:addChild(btnAddOn)
end

function BoutView:_updateConsumeView( ... )
    -- body
    self._boutConsumeModule:updateUI(self._selectedBout.id, self._selectedBout.pos)
end

function BoutView:_updateCurBoutId(isAuto, needOpen)
    -- body
    local curBoutId = G_UserData:getBout():getCurBoutId()
    if self._selectedBout.id == curBoutId then
        if needOpen then
            local curBoutList = G_UserData:getBout():getBoutList()
            local boutInfo = G_UserData:getBout():getBoutInfo()
            local max = table.maxn(boutInfo)
            if max == curBoutId and rawequal(table.nums(curBoutList[curBoutId]), table.nums(boutInfo[curBoutId])) then
                BoutHelper.playRevertoSpecialEffect(self, self._pointNodes, function( ... )
                    -- body
                    self:_updateSelected(isAuto)
                    self:_updateRedPoint()
                end)
            else
                self:_updateSelected(isAuto)
                self:_updateRedPoint()
            end
        else
            self:_updateSelected(isAuto)
            self:_updateRedPoint()
        end
        return
    end
    
    BoutHelper.playRevertoSpecialEffect(self, self._pointNodes, function( ... )
        -- body
        self._selectedBout.pos = 1
        self._selectedBout.id = curBoutId
        self:_updateSelected()
        self:_updateBoutPos()
        self:_updateBoutTitle()
        self:_updatePointNodes(true)
    end)
end

function BoutView:_updatePointNodes(isReset)
    -- body
    for k, value in pairs(self._pointNodes) do
        if BoutHelper.isSpecialBoutPoint(self._selectedBout.id, value:getTag()) then
            BoutHelper.checkTexture(value, true)
        else
            local isEnable = isReset and true or G_UserData:getBout():checkUnlocked(self._selectedBout.id, value:getTag())
            BoutHelper.checkTexture(value, isEnable)
        end
    end
end

function BoutView:_updateBoutPos( ... )
    -- body
    local max = #self._pointBottomNodes
    for i=1, max do
        local info = BoutHelper.getBoutInfoItem(self._selectedBout.id, i)
        local pos = string.split(info.position, "|")
        self._pointNodes[i]:getChildByName("pointName"):setTag(1)
        self._pointNodes[i]:getChildByName("pointName"):setString(info.point_name)
        self._pointNodes[i]:setPosition(cc.p(pos[1], pos[2]+23))
        self._pointBottomNodes[i]:setPosition(cc.p(pos[1], pos[2]))
        self._pointBottomNodes[i]:setOpacity(80)
        self._pointNodes[i]:getChildByName("pointName"):removeAllChildren()
        BoutHelper.checkRedPoint(self._pointNodes[i]:getChildByName("RedPoint"), i)
    end
end

function BoutView:_updateUnlockedOp( ... )
    -- body
    if not self._pointBottomNodes[self._selectedBout.pos] then
        return
    end
    self._pointBottomNodes[self._selectedBout.pos]:setOpacity(255)
    self._pointNodes[self._selectedBout.pos]:getChildByName("RedPoint"):setVisible(false)
end

function BoutView:_updateRedPoint( ... )
    -- body
    local max = #self._pointBottomNodes
    for i=1, max do
        BoutHelper.checkRedPoint(self._pointNodes[i]:getChildByName("RedPoint"), i)
    end
end

function BoutView:_recordTotalPower()
	local totalPower = G_UserData:getBase():getPower()
	self._diffPower = totalPower - self._lastTotalPower
	self._lastTotalPower = totalPower
end

function BoutView:_playPowerPromt()
    local CSHelper = require("yoka.utils.CSHelper")
	local totalPower = G_UserData:getBase():getPower()
	local node = CSHelper.loadResourceNode(Path.getCSB("CommonPowerPrompt", "common"))
	node:updateUI(totalPower, totalPower - self._lastTotalPower)
	node:play(0, 0)
end

--@Role     Unlock BoutP Success
function BoutView:_onUnlockSuccess(id, message)
    -- body
    BoutHelper.playActiveSummary(self._selectedBout.id, self._selectedBout.pos)
    local UIConst = require("app.const.UIConst")
	self:_playPowerPromt()
    self:_recordTotalPower()

    if not BoutHelper.isSpecialBoutPoint(self._selectedBout.id, self._selectedBout.pos) then
        BoutHelper.playEffectMusic(self._selectedBout.id, self._selectedBout.pos)
    end

    local function eventFunc(event)
        if event == "finish" then
            if BoutHelper.isSpecialBoutPoint(self._selectedBout.id, self._selectedBout.pos) then
                BoutHelper.playEffectMusic(self._selectedBout.id, self._selectedBout.pos)
            end
            self:_updateUnlockedOp()
            self:_updateCurBoutId(false, true)
            self:_updatePointNodes()
        end
    end
    local pos = self._selectedBout.pos == 7 and cc.p(48, 47) or cc.p(40, 47)
    BoutHelper.createEffect(self._pointNodes[self._selectedBout.pos]:getChildByName("EffectActive"), 2, eventFunc, true, pos)
end

function BoutView:_onEventGetRechargeNotice(id, message)
    self:_updateConsumeView()
end



return BoutView