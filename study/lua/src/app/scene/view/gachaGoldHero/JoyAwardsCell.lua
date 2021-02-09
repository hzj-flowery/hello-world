-- @Author panhoa
-- @Date 6.24.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local JoyAwardsCell = class("JoyAwardsCell", ListViewCellBase)
local GachaGoldenHeroHelper = import(".GachaGoldenHeroHelper")


function JoyAwardsCell:ctor()

    local resource = {
        file = Path.getCSB("JoyAwardsCell", "gachaGoldHero"),
    }
    JoyAwardsCell.super.ctor(self, resource)
end

function JoyAwardsCell:onCreate()
    self._size = self._resource:getContentSize()
    self:setContentSize(self._size)
end

function JoyAwardsCell:updateUI(data)
    for i=1,7 do
        self["_item" ..i]:setVisible(false)
    end

    local function createItem(index, itemData)
        local got = itemData.cfg.drop_id < itemData.dropId
        local bCurDrop = itemData.cfg.drop_id == itemData.dropId

        if G_ServerTime:getLeftSeconds(G_UserData:getGachaGoldenHero():getEnd_time()) <= 0 then
            got, bCurDrop = true, false
        end
        self["_item" ..index]:setVisible(true)
        self["_imageNormal" ..index]:setVisible(not bCurDrop)
        self["_imageSelected" ..index]:setVisible(bCurDrop)

        self["_commonIcon" ..index]:unInitUI()
        self["_commonIcon" ..index]:initUI(itemData.cfg.type, itemData.cfg.value, 1)
        self["_commonIcon" ..index]:setTouchEnabled(true)
        self["_commonIcon" ..index]:removeLightEffect()

        local params = self["_commonIcon" ..index]:getItemParams()
        self["_textIconName" ..index]:setString(GachaGoldenHeroHelper.getFormatServerName(params.name, 4, true) .." x" ..itemData.cfg.size)
        self["_textIconName" ..index]:setColor(params.icon_color)
        if itemData.cfg and itemData.cfg.type == 1 then                 -- 1. 金将写死
            self["_textIconName" ..index]:enableOutline(params.icon_color_outline, 2)
        elseif itemData.cfg.type == 6 and itemData.cfg.value == 157 then-- 2. 金色锦囊写死
            self["_textIconName" ..index]:enableOutline(params.icon_color_outline, 2)
        end

        self["_textGroup" ..index]:setString(Lang.get("gacha_goldenjoy_itemgroup", {num = itemData.cfg.group}))
        self["_textOpenTime" ..index]:setString(itemData.cfg.time ..":00")
        self["_textOpenTime" ..index]:setColor(bCurDrop and cc.c3b(0xff, 0xff, 0xff) or cc.c3b(0x71, 0x43, 0x06))

        self["_imageOpened" ..index]:setVisible(got)
        self["_imageGot" ..index]:setVisible(got)

        if bCurDrop then
            self["_nodeEffect" ..index]:removeAllChildren(true)
            G_EffectGfxMgr:createPlayGfx(self["_nodeEffect" ..index], "effect_rili_guang", nil, true)
        end
    end

    for i,v in ipairs(data) do
        createItem(i, v)
    end
end



return JoyAwardsCell