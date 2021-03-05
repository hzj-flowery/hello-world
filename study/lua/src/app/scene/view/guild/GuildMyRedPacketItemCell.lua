
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildMyRedPacketItemCell = class("GuildMyRedPacketItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =  require("app.const.DataConst")
local GuildConst =  require("app.const.GuildConst")

function GuildMyRedPacketItemCell:ctor()
    self._textRedPacketName = nil
    self._resInfo = nil
	local resource = {
		file = Path.getCSB("GuildMyRedPacketItemCell", "guild"),
		binding = {
			_imageRedPacket = {
				events = {{event = "touch", method = "_onButton"}}
			},
		}
	}
	GuildMyRedPacketItemCell.super.ctor(self, resource)
end

function GuildMyRedPacketItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

    self._imageRedPacket:setSwallowTouches(false)
end

function GuildMyRedPacketItemCell:update(data)
    local config = data:getConfig()
    local money = data:getTotal_money() *  data:getMultiple()
    local state = data:getRed_bag_state()

    self._textRedPacketName:setString(config.name)
   
    self._resInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,money)
    self._resInfo:setTextColor(Colors.BRIGHT_BG_TWO)
    self._resInfo:showResName(false)

    if state == GuildConst.GUILD_RED_PACKET_NO_SEND then
       -- self._imageBg:loadTexture(Path.getCommonImage("img_com_board04b"))
        self:updateImageView("_imageBg", { visible = true, texture = Path.getCommonImage("img_com_board04b") })
        self._textStageName:setString(Lang.get("guild_red_packet_btn_send"))
       -- self._textStageName:setTextColor(Colors.OBVIOUS_YELLOW)
        self._imageRedPacket:loadTexture(Path.getGuildRes("img_lit_hongbao_03"))
    elseif state == GuildConst.GUILD_RED_PACKET_NO_RECEIVE then
       -- self._imageBg:loadTexture(Path.getCommonImage("img_com_board04"))
        self:updateImageView("_imageBg", { visible = true, texture = Path.getCommonImage("img_com_board04") })
        self._textStageName:setString(Lang.get("guild_red_packet_btn_open"))
       -- self._textStageName:setTextColor(Colors.BUTTON_WHITE)
        local bgRes=config.show==1 and "img_lit_hongbao_03" or "img_lit_hongbao_03_2"
        self._imageRedPacket:loadTexture(Path.getGuildRes(bgRes))
    else
        --self._imageBg:loadTexture(Path.getCommonImage("img_com_board04"))
        self:updateImageView("_imageBg", { visible = true, texture = Path.getCommonImage("img_com_board04") })
        self._textStageName:setString(Lang.get("guild_red_packet_btn_see"))
       -- self._textStageName:setTextColor(Colors.BUTTON_WHITE)
        local bgRes=config.show==1 and "img_lit_hongbao_03" or "img_lit_hongbao_04_2"
        self._imageRedPacket:loadTexture(Path.getGuildRes(bgRes))
    end
    local color = config.show == 1 and Colors.OBVIOUS_YELLOW or Colors.CLASS_WHITE
    self._textStageName:setColor(color)
   -- self._resourceNode:setContentSize(cc.size(294,108))
end

function GuildMyRedPacketItemCell:_onButton(sender)
    local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback()
	end
end

return GuildMyRedPacketItemCell