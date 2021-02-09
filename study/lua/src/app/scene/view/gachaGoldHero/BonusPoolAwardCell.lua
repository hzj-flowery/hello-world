-- @Author panhoa
-- @Date 5.7.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local BonusPoolAwardCell = class("BonusPoolAwardCell", ListViewCellBase)
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")


function BonusPoolAwardCell:ctor()
    self._resource = nil
    self._imageBack= nil

    local resource = {
        file = Path.getCSB("BonusPoolAwardCell", "gachaGoldHero"),
    }
    BonusPoolAwardCell.super.ctor(self, resource)
end

function BonusPoolAwardCell:onCreate()
    self._size = self._resource:getContentSize()
    self:setContentSize(self._size)
    self._resource:setVisible(false)
end

function BonusPoolAwardCell:updateUI(cellData)
    for index = 1, 2 do
        self["_fileNode" ..index]:setVisible(false)
    end

    if not cellData or table.nums(cellData) <= 0 then
        return
    end

    self._resource:setVisible(true)
    local function updateItem(index, data)
        self["_fileNode" ..index]:setVisible(true)
        self["_fileNode" ..index]:setServerName(data.svr_name)
        self["_fileNode" ..index]:setUserName(data.user_name, data.officer_level)
        if data.user_id == G_UserData:getBase():getId() then
            self["_fileNode" ..index]:setUserNameColor(Colors.getATypeGreen())
            self["_fileNode" ..index]:setServerNameColor(Colors.getATypeGreen())
        end
    end

    for itemIndex, itemData in ipairs(cellData) do
       updateItem(itemIndex, itemData) 
    end
end



return BonusPoolAwardCell