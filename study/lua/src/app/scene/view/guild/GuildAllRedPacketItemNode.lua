local ViewBase = require("app.ui.ViewBase")
local GuildAllRedPacketItemNode = class("GuildAllRedPacketItemNode", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local GuildConst = require("app.const.GuildConst")

GuildAllRedPacketItemNode.RATE_IMGS = {[6] = "img_liubei01", [3] = "img_sanbei01", [2] = "img_shuangbei01"}

function GuildAllRedPacketItemNode:ctor()
    self._textRedPacketName = nil
    self._imageRate = nil
    self._goldNum = nil
    self._userName = nil
    self._imageState = nil
    self._textSee = nil
    self._textState = nil
    self._callback = nil
    local resource = {
        file = Path.getCSB("GuildAllRedPacketItemNode", "guild"),
        binding = {
            _resourceNode = {
                events = {{event = "touch", method = "_onButton"}}
            }
        }
    }
    GuildAllRedPacketItemNode.super.ctor(self, resource)
end

function GuildAllRedPacketItemNode:onCreate()
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)

    self._resourceNode:setSwallowTouches(false)
end

function GuildAllRedPacketItemNode:update(data)
    local config = data:getConfig()
    local money = data:getTotal_money() * data:getMultiple()
    local state = data:getRed_bag_state()
    local multiple = data:getMultiple()

    self._textRedPacketName:setString(config.name)
    if multiple > 1 then
        self._imageRate:setVisible(true)
        self._imageRate:loadTexture(Path.getGuildRes(GuildAllRedPacketItemNode.RATE_IMGS[multiple]))
    else
        self._imageRate:setVisible(false)
    end

    self._goldNum:setString(tostring(money))
    self._userName:setString(data:getUser_name())

    if state == GuildConst.GUILD_RED_PACKET_NO_SEND then
        local bgRes = config.show == 1 and "img_lit_hongbao_01" or "img_lit_hongbao_01_2"
        self._resourceNode:setBackGroundImage(Path.getGuildRes(bgRes))
        self._imageState:setVisible(true)
        self._imageState:loadTexture(Path.getGuildRes("img_lit_hongbao_01c"))
        self._textState:setVisible(true)
        self._textState:setString(Lang.get("guild_red_packet_btn_not_send"))
        self._textSee:setVisible(false)
    elseif state == GuildConst.GUILD_RED_PACKET_NO_RECEIVE then
        local bgRes = config.show == 1 and "img_lit_hongbao_01" or "img_lit_hongbao_01b_2"
        self._resourceNode:setBackGroundImage(Path.getGuildRes(bgRes))
        self._imageState:setVisible(config.show == 1)
        local stateRes = "img_lit_hongbao_01b"
        self._imageState:loadTexture(Path.getGuildRes(stateRes))
        self._textState:setVisible(true)
        self._textState:setString(Lang.get("guild_red_packet_btn_open"))
        self._textSee:setVisible(false)
    else
        local bgRes = config.show == 1 and "img_lit_hongbao_02" or "img_lit_hongbao_02_2"
        -- "img_auction_red_envelopes00"
        self._resourceNode:setBackGroundImage(Path.getGuildRes(bgRes))
        self._imageState:setVisible(false)
        self._textState:setVisible(false)
        self._textSee:setVisible(true)
    end
    local outline = 1
    self._textSee:enableOutline(Colors.BUTTON_TWO_NOTE_OUTLINE, outline)
    local color = config.show == 1 and Colors.DARK_BG_ONE or Colors.CLASS_WHITE
    self._userName:setColor(color)
    self._goldNum:setColor(color)
    local pos = config.show == 1 and cc.p(84.00, 16.40) or cc.p(84.00, 25.40)
    self._userName:setPosition(pos)
    local pos = config.show == 1 and cc.p(83.38, 104.20) or cc.p(83.38, 126.20)
    self._textSee:setPosition(pos)
end

function GuildAllRedPacketItemNode:_onButton(sender)
    local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
    local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
    if offsetX < 20 and offsetY < 20 then
        if self._callback then
            self._callback(self)
        end
    end
end

function GuildAllRedPacketItemNode:setCallBack(callback)
    self._callback = callback
end

return GuildAllRedPacketItemNode
