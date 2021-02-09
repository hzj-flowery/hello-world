local ViewBase = require("app.ui.ViewBase")
local SiegeNode = class("SiegeNode", ViewBase)
local RebelBase = require("app.config.rebel_base")
local Color = require("app.utils.Color")

function SiegeNode:ctor(uid, id)
    -- self._siegeData = simpleSiege.data
    self._siegeUid = uid
    self._siegeId = id
	self._siegeData = RebelBase.get(id)
	assert(self._siegeData ~= nil, "can not find siege enmey id = "..id)
    -- self._siegeInfo = G_UserData:getSiegeData():getSiegeEnemyData(siegeUid, siegeId)    --重新查询，因为数据结构可能出现删除，避免错误
    self._isKilled = false

    self._nodeAvatar = nil      --avatar
    self._nodeDiscover = nil    --发现者
    self._stageName = nil       --名字
    self._btnBox = nil          --宝箱按钮
    self._imageKill = nil       --击杀标志
    self._nodeInfo = nil        --信息节点
    self._imageHpBg = nil       --血条
    self._hpBar = nil           --血条百分比
    self._imageShared = nil
    local resource = {
		file = Path.getCSB("SiegeNode", "siege"),
        binding = {
            -- _btnBox = {
			-- 	events = {{event = "touch", method = "_onBoxClick"}}
			-- },
        }
	}
	SiegeNode.super.ctor(self, resource)
end

function SiegeNode:onCreate()
    local boxParams =
    {
        picNormal = Path.getCommonIcon("common", "img_mapbox_guan"),
        picEmpty = Path.getCommonIcon("common", "img_mapbox_kong"),
        effect = "effect_boxjump",
    }
    self._btnBox:setParams(boxParams)
    self._btnBox:addClickEventListenerEx(handler(self, self._onBoxClick))
    self:_refreshStage()
    self._nodeAvatar:setTouchEnabled(true)
    self._nodeAvatar:setScale(0.8)
	self._nodeAvatar:turnBack()
end

function SiegeNode:_refreshStage()
    self._siegeInfo = G_UserData:getSiegeData():getSiegeEnemyData(self._siegeUid, self._siegeId)  --重新查询，因为数据结构可能出现删除，避免错误
    if not self._siegeInfo or self._siegeInfo:isNotExist() then
        self._isKilled = true
    else
        self._nodeAvatar:setBubbleVisible(false)
        self._nodeAvatar:updateUI(self._siegeData.res)
        self._nodeAvatar:setCallBack(handler(self, self._onAvatarClick))
        --
        self._stageName:setString(self._siegeData.name)
        self._stageName:setColor(Color.getColor(self._siegeData.color))
        self._stageName:enableOutline(Color.getColorOutline(self._siegeData.color), 2)

        local officerLevel = self._siegeInfo:getOfficer_level()
        local disCoverName = self._siegeInfo:getUser_name()
        local fontBaseColor = Color.getOfficialColor(officerLevel)
        local outLineColor = Color.getOfficialColorOutline(officerLevel)
        local discoverLabel = ccui.RichText:createWithContent(Lang.get("siege_discover", {name = disCoverName, fontColor = Color.colorToNumber(fontBaseColor), outColor = Color.colorToNumber(outLineColor)}))
        discoverLabel:setAnchorPoint(cc.p(0.5, 0.5))
        self._nodeDiscover:removeAllChildren()
        self._nodeDiscover:addChild(discoverLabel)

        local height = self._nodeAvatar:getHeight()*0.8
        self._nodeInfo:setPositionY(height)

        if self._siegeInfo:getKiller_id() ~= 0 then
            self._isKilled = true
        else
            self._isKilled = false
        end
        self:refreshBoxState()

        self._imageShared:setVisible( self._siegeInfo:isPublic() )
    end
    self._imageKill:setVisible(self._isKilled)
    if self._isKilled then
        self._imageShared:setVisible( false )
    end

    self:refreshHpBar()
end

function SiegeNode:refreshHpBar()
    self._imageHpBg:setVisible(not self._isKilled)
    if self._isKilled then
        return
    end
    local nowHp = self._siegeInfo:getHp_now()
    local maxHp = self._siegeInfo:getHp_max()
    local hpPercent = math.ceil(nowHp/maxHp*100)
    self._hpBar:setPercent(hpPercent)
end

function SiegeNode:refreshBoxState()
    if not self._isKilled then
        self._btnBox:setVisible(false)
        return
    end
    self._btnBox:setVisible(true)
    if self._siegeInfo:isBoxEmpty() then
        self._btnBox:setState("empty")
    else
        self._btnBox:playBoxJump()
    end
end

function SiegeNode:refreshSiege()
    self:_refreshStage()
end

function SiegeNode:_onAvatarClick()
    if not self._isKilled then
        local popupSiegeChallenge = require("app.scene.view.siege.PopupSiegeChallenge").new(self._siegeData, self._siegeUid, self._siegeId)
        popupSiegeChallenge:open()
    end
end

function SiegeNode:_onBoxClick()
    if not self._siegeInfo:isBoxEmpty() then
        G_UserData:getSiegeData():c2sRebArmyKillReward(self._siegeUid, self._siegeId)
    else
        G_Prompt:showTip(Lang.get("siege_already_get_box"))
    end
end

return SiegeNode
