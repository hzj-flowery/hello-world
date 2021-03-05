-- @Author panhoa
-- @Date 8.15.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SupportItem = class("SupportItem", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


function SupportItem:ctor()
    self._isSupported = false
    self._guildId = 0

    local resource = {
        file = Path.getCSB("SupportItem", "guildCrossWarGuess"),
    }
    SupportItem.super.ctor(self, resource)
end

-- @Role
function SupportItem:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

-- @Role    UpdateUI
function SupportItem:updateUI(data, isSupported, supportId)
    if not data then return end
    local _, bJonin = GuildCrossWarHelper.isGuildCrossWarEntry()
    self._isSupported = isSupported --or not bInTime
    if not self._isSupported then
        self._isSupported = bJonin
    end

    self["_imgConsume"]:setVisible(not self._isSupported)
    self["_commonSupport"]:setEnabled(not self._isSupported)
    self["_commonSupport"]:setString(Lang.get("guild_cross_war_supportother"))
    self["_commonSupport"]:setVisible(data.guild_id ~= supportId)
    self["_imageSupported"]:setVisible(data.guild_id == supportId)

    self["_commonFlag"]:updateUI(data.guild_icon, data.guild_name)
    
    self["_txtPower"]:setString(TextHelper.getAmountText(data.power))
    self["_txtSupport"]:setString(data.sp_num)

    local spNums = (GuildCrossWarHelper.getSupportCfg(data.sp_num) - 100)
    spNums = spNums < 0 and 0 or spNums
    self["_txtSupportSoilder"]:setString(Lang.get("guild_cross_war_soildertop") ..spNums)

    self["_txtGuildLeader"]:setString(data.leader)
    self["_txtGuildLeader"]:setColor(Colors.getOfficialColor(data.leader_offical_level))
    self["_txtGuildLeader"]:enableOutline(Colors.getOfficialColorOutline(data.leader_offical_level))

    local pointCfg = GuildCrossWarHelper.getWarCfg(data.kp_id)
    if pointCfg then
        self["_txtPoint"]:setString(pointCfg.point_name)
    end

    self:_registerEvent(data.guild_id)
end

function SupportItem:_popupAlert(guildId)
    local function callBackOK( ... )
        G_UserData:getGuildCrossWar():c2sBrawlGuildsGuildInsp(guildId)
    end

    local popup = require("app.ui.PopupAlert").new(Lang.get("guild_cross_war_support2"), 
                                                   Lang.get("guild_cross_war_support_alert"), callBackOK, nil, nil)
	popup:openWithAction()
end

function SupportItem:_registerEvent(guildId)
    self["_commonSupport"]:addClickEventListenerEx(function(sender)
        local bAct, bInpireEnd, bAlert = GuildCrossWarHelper.isInspireTime()
        if bAct then
            if not bInpireEnd then
                G_Prompt:showTip(Lang.get("guild_cross_war_no_support"))
                return
            else
                if bAlert then
                    G_Prompt:showTip(Lang.get("guild_cross_war_no_support"))
                    return
                end
            end
        else
            G_Prompt:showTip(Lang.get("guild_cross_war_no_support"))
            return
        end
        

        if self._isSupported then
            return
        end
        if state == ccui.TouchEventType.ended or not state then
            local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
            local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
            if moveOffsetX < 20 and moveOffsetY < 20 then
                self:_popupAlert(guildId)
            end
        end
    end)
end



return SupportItem