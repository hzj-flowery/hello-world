local ViewBase = require("app.ui.ViewBase")
local MineNode = class("MineNode", ViewBase)

local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

function MineNode:ctor(mineData)
    self._mineData = mineData
    self._configData = mineData:getConfigData()
    
	local resource = {
		file = Path.getCSB("MineNode", "mineCraft"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	MineNode.super.ctor(self, resource)
end

function MineNode:onCreate()
    self._selfArrow:setVisible(false)
    local picPath = Path.getMineImage(self._configData.pit_icon_png)
    self._imageMine:ignoreContentAdaptWithSize(true)
    self._imageMine:loadTextureNormal(picPath)

    local picName = Path.getMineNodeTxt(self._configData.pit_name_txt)
    self._imageNodeName:ignoreContentAdaptWithSize(true)
    self._imageNodeName:loadTextureNormal(picName)
    local height = self._imageMine:getContentSize().height
    self._imageNodeName:setPositionY(-height/2 + 5)

    self._nodeCountInfo:setPositionY(-height/2 + 18)

    self:setPosition(cc.p(self._configData.x, self._configData.y))

    self._panelTouch:setSwallowTouches(false)

    self._imageDouble:setVisible(false)

    self._schedulePeaceHandler = SchedulerHelper.newSchedule(handler(self, self._updatePeaceTimer), 1)
end

function MineNode:onExit()
    if self._schedulePeaceHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._schedulePeaceHandler)
        self._schedulePeaceHandler = nil
    end
end

function MineNode:refreshData(data)
    self._mineData = data
end

function MineNode:updateUI()
    if self._mineData:getUserCnt() == 0 or self._configData.pit_type == MineCraftHelper.TYPE_MAIN_CITY then 
        self._nodeCountInfo:setVisible(false)
    else
        self._nodeCountInfo:setVisible(true)
        local outputConfig, baseOutput = self._mineData:getMineStateConfig()
        local stateIcon = Path.getMineImage(outputConfig.icon)
        self._imageSelfState:loadTexture(stateIcon)
        self._textSelfCount:setString(self._mineData:getUserCnt())
        local color = MineCraftHelper.getStateColor(outputConfig.state)
        self._textSelfCount:setColor(color)
    end

    -- if self._mineData:getId() == G_UserData:getMineCraftData():getSelfMineId() then
    --     self._selfArrow:setVisible(true) 
    -- else 
    --     self._selfArrow:setVisible(false)
    -- end
    self._selfArrow:setVisible(false)

    self:_refreshGuildFlag()

    if self._mineData:getMultiple() > 1 then 
        local doubleId = self._mineData:getMultiple()
        local pic = Path.getMineDoubleImg(doubleId-1)
        self._imageDouble:setVisible(true)
        self._imageDouble:loadTexture(pic)
        local picPath = Path.getMineImage(self._configData.rich_pit_icon_png)
        self._imageMine:loadTextureNormal(picPath)
    else 
        self._imageDouble:setVisible(false)
        local picPath = Path.getMineImage(self._configData.pit_icon_png)
        self._imageMine:loadTextureNormal(picPath)
    end

    --和平矿
    self:_updatePeaceNode()
end

function MineNode:_refreshGuildFlag()
    local guildId = self._mineData:getGuildId()
    if guildId ~= 0 then 
        self._nodeFlag:setVisible(true)
        local guildName = self._mineData:getGuildName()
        local guildIcon = self._mineData:getGuildIcon()
        self._nodeFlag:updateUI(guildIcon, guildName)
    else 
        self._nodeFlag:setVisible(false)
    end
end

function MineNode:_openMineDetail()
    local GrainCarDataHelper = require("app.scene.view.grainCar.GrainCarDataHelper")
    if GrainCarDataHelper.haveCarInMineId(self._mineData:getId()) then
        G_SceneManager:showDialog("app.scene.view.grainCar.PopupGrainCar", nil, self._mineData:getId(), self._mineData)
    else
        G_SceneManager:showDialog("app.scene.view.mineCraft.PopupMine", nil, self._mineData:getId(), self._mineData)
    end
end

function MineNode:_onPanelClick(sender)
    local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        self:_openMineDetail()
	end
end

function MineNode:doDoubleAnim()
    self._imageDouble:setScale(0.1)
    local action = cc.ScaleTo:create(0.2, 1, 1)
    self._imageDouble:runAction(action)
end

function MineNode:_updatePeaceNode()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local isPeace = self._mineData:isPeace() 
    self._peaceNode:setVisible(isPeace)
    self._peaceEffect:removeAllChildren()
    if isPeace then
        local effect = EffectGfxNode.new("effect_kuangzhan_hepingz")
        effect:play()
        self._peaceEffect:addChild(effect)
    end
    
    self._peaceStatus = isPeace
end

function MineNode:_updatePeaceTimer()
    local isPeace = self._mineData:isPeace()
    if isPeace ~= self._peaceStatus then
        self:_updatePeaceNode()
    end
end

return MineNode