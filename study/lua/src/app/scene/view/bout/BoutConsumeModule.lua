-- @Author panhoa
-- @Date 4.10.2020

local ViewBase = require("app.ui.ViewBase")
local BoutConsumeModule = class("BoutConsumeModule", ViewBase)
local CSHelper = require("yoka.utils.CSHelper")
local BoutConst = require("app.const.BoutConst")
local Color = require("app.utils.Color")
local BoutHelper = require("app.scene.view.bout.BoutHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")


function BoutConsumeModule:ctor()
    -- body
    self._commonBtn     = nil
    self._curBoutPoint  = {}

    local resource = {
		file = Path.getCSB("BoutConsumeModule", "bout"),
	}
	BoutConsumeModule.super.ctor(self, resource)
end

-- @Role
function BoutConsumeModule:onCreate()
    self._commonBtn:setString(Lang.get("bout_consumehero_active"))
    self._commonBtn:addClickEventListenerEx(handler(self, self._unLockBoutPoint))
end

-- @Role
function BoutConsumeModule:onEnter()
end

-- @Role
function BoutConsumeModule:onExit()
end

--@Role     Unlock BoutP
function BoutConsumeModule:_unLockBoutPoint( ... )
    -- body
    local data = G_UserData:getBout():getBoutInfo()[self._curBoutPoint.id][self._curBoutPoint.pos]
    if not BoutHelper.isEnoughJade2(data.cost_yubi) then
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2)
        return
    end

    if BoutHelper.isSpecialBoutPoint(self._curBoutPoint.id, self._curBoutPoint.pos) then
        if not BoutHelper.isCanUnlockSBoutPoint(self._curBoutPoint.pos) then
            return
        end
    end

    local canUnlock, materialsIds = BoutHelper.isEnoughConsume(self._curBoutPoint)
    if not canUnlock then
        return
    end

    G_UserData:getBout():c2sUnlockBout(self._curBoutPoint.id, self._curBoutPoint.pos, materialsIds)
end

function BoutConsumeModule:_updateAttrAdded(id, pos, isChangePos, offsetY)
    -- body
    offsetY = offsetY or 0
    local countIndx = 0
    local topPosY = isChangePos and 60 or 165
    local size = self._content:getContentSize()
    local attrs = BoutHelper.getAttrbute(id, pos)
    for k,v in pairs(attrs) do
        local widget = ccui.RichText:createWithContent(AttrDataHelper.getBoutContentActive(k, v))
        widget:setAnchorPoint(cc.p(0.5,0.5))
        widget:setPosition(cc.p(size.width/2, topPosY + offsetY + countIndx*25))
        self._content:addChild(widget)
    end
end

function BoutConsumeModule:_createConsumeJade(jade2Num)
    -- body
    local DataConst = require("app.const.DataConst")
    local yubiTypeRes = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, 1)
    if yubiTypeRes.res_mini then
        local size = self._content:getContentSize()
        local panel = ccui.Layout:create()
        panel:setContentSize(size.width, 60)
        local UIHelper = require("yoka.utils.UIHelper")
        local jadeImg = UIHelper.createImage({texture = yubiTypeRes.res_mini})
        jadeImg:setAnchorPoint(cc.p(0,0.5))

        local color = BoutHelper.isEnoughJade2(jade2Num) and Colors.SYSTEM_TARGET or Colors.RED
        local labelName = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
        labelName:setString(Lang.get("bout_consumejade2_actived", {value=jade2Num}))
        labelName:setColor(color)
        labelName:setAnchorPoint(cc.p(0,0.5))
        
        local posX = (labelName:getPositionX() + labelName:getContentSize().width)
        jadeImg:setPositionX(posX)

        panel:setAnchorPoint(cc.p(0.5, 0.5))
        panel:setPosition(cc.p(size.width/2+50, 110))
        panel:addChild(jadeImg)
        panel:addChild(labelName)
        self._content:addChild(panel)
    end
end

function BoutConsumeModule:_updateJade2Show(jade2Num, id, pos)
    -- body
    if jade2Num <= 0 then
        return true
    end
    
    if BoutHelper.isSpecialBoutPoint(id, pos) then
        if self:_isUnlocked(id, pos) then
            return true
        else
            local curList = G_UserData:getBout():getBoutList()[id] or {}
            local infoList = G_UserData:getBout():getBoutInfo()[id]

            if rawequal(table.nums(infoList) - 1, table.nums(curList)) then
                -- 可激活
                self:_updateAttrAdded(id, pos, true, 55)
                self:_createConsumeJade(jade2Num)
                self._commonBtn:setVisible(true)
                return false
            else
                -- 优先
                self:_updateAttrAdded(id, pos, true)
                local labelName = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
                labelName:setString(Lang.get("bout_unlock_normalfirst2"))
                labelName:setColor(Colors.RED)
                --labelName:enableOutline(Color.NUMBER_WHITE_OUTLINE, 2)
                labelName:setAnchorPoint(cc.p(0,0.5))
                labelName:setPosition(cc.p(20, 20))
                self._content:addChild(labelName)
                self._commonBtn:setVisible(false)
                return false
            end
        end
    end
end

function BoutConsumeModule:_isUnlocked(id, pos)
    -- body
    local isLock = G_UserData:getBout():checkUnlocked(id, pos)
    if not isLock then
        self._commonBtn:setString(Lang.get("bout_consumehero_actived"))
        self._commonBtn:setVisible(false)
        return true
    else
        self._commonBtn:setString(Lang.get("bout_consumehero_active"))
        self._commonBtn:setEnabled(true)
    end
    return false
end

function BoutConsumeModule:_isOfficialEnough(id, pos)
    -- body
    local isEnoughOff, needLevel = BoutHelper.checkOfficerLevel({id = id, pos = pos})
    self._commonBtn:setVisible(isEnoughOff)
    self._panelOffcial:setVisible(not isEnoughOff)
    if not isEnoughOff then
        local info,__ = G_UserData:getBase():getOfficialInfo(needLevel)
        self._officialImg:loadTexture(Path.getTextHero(info.picture))
        self._officialImg:ignoreContentAdaptWithSize(true)
        local targetPosX = (self._officialImg:getPositionX() + self._officialImg:getContentSize().width)
		self._needOfficial2:setPositionX(targetPosX)
        return false
    end
    return true
end

function BoutConsumeModule:updateUI(id, pos)
    -- body
    self._content:removeAllChildren()
    self._curBoutPoint.id = id
    self._curBoutPoint.pos = pos
    if not self:_isOfficialEnough(id, pos) then
        self._content:setSwallowTouches(false)
        self:_updateAttrAdded(id, pos, true)
        return
    end

    local consumeItems, jade2Num = BoutHelper.getConsumeItems(id, pos)
    local max = #consumeItems
    if rawequal(max, 0) then
        self._content:setSwallowTouches(false)
        self._commonBtn:setEnabled(true)
    end
    if not self:_updateJade2Show(jade2Num, id, pos) then
        self._content:setSwallowTouches(false)
        return
    end
    if self:_isUnlocked(id, pos) then
        self._content:setSwallowTouches(false)
        self._commonBtn:setString(Lang.get("bout_consumehero_actived"))
        self._commonBtn:setVisible(true)
        self._commonBtn:setEnabled(false)
        self:_updateAttrAdded(id, pos, true, 20)
        return
    end

    local canEnable = true
    for index = 1, max do
        local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonHeroIcon", "common"))
        uiNode:updateHeroIcon(consumeItems[index].value)
        uiNode:setTouchEnabled(true)
        uiNode:setScale(0.8)
        uiNode:setPosition(BoutConst.CONSUME_HERO_POS[max][index])
        
        local labelName = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
        local count = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, consumeItems[index].value)
        local bEnough = count >= consumeItems[index].size
        local color = bEnough and Colors.TacticsActiveColor or Colors.RED
        labelName:setString(Lang.get("common_list_count", {count1=count, count2=consumeItems[index].size}))
        labelName:setColor(color)
        labelName:enableOutline(Color.NUMBER_WHITE_OUTLINE, 2)
        labelName:setPosition(cc.p(0, -30))
        uiNode:addChild(labelName)
        uiNode:setHeroIconMask(not bEnough)
        self._content:addChild(uiNode)

        if canEnable and not bEnough then
            canEnable = false
        end
    end
    if max > 0 then
        self._commonBtn:setEnabled(canEnable)
    end

    self._content:setSwallowTouches(true)
    self:_updateAttrAdded(id, pos)
end


return BoutConsumeModule
