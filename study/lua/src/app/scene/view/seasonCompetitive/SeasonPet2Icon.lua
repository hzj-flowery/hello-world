-- @Author panhoa
-- @Date 3.13.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonPet2Icon = class("SeasonPet2Icon", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function SeasonPet2Icon:ctor()
    local resource = {
        file = Path.getCSB("SeasonPet2Icon", "seasonCompetitive"),
    }
    SeasonPet2Icon.super.ctor(self, resource)
end

function SeasonPet2Icon:onCreate()
    self:setContentSize(self._resource:getContentSize())
    for index = 1, 6 do
        self["_item"..index]:setVisible(false)
    end
end

-- @Role    Touch Icon 
function SeasonPet2Icon:_onPanelTouch(sender, state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            local baseId = sender:getTag()
            self:dispatchCustomCallback(baseId)
		end
	end
end

-- @Role Update Info
function SeasonPet2Icon:updateUI(tabIndex, cellData)
    for index = 1, 6 do
        self["_item"..index]:setVisible(false)
        self["_imageSelected"..index]:setVisible(false)
    end

    -- update item
    local function updateItem(index, data)
        self["_item"..index]:setVisible(true)
        self["_fileNode"..index]:setVisible(true)
        self["_fileNode"..index]:unInitUI()
       
        self["_fileNode"..index]:initUI(TypeConvertHelper.TYPE_PET, data.id)
        self["_fileNode"..index]:removeLightEffect()
        self["_fileNode"..index]:setTouchEnabled(false)
        self["_fileNode"..index]:setIconMask(data.isMask)
        self["_imageTop"..index]:setVisible(false)
        self["_imageBan"..index]:setVisible(data.isMask)
        self["_nodeStar"..index]:setCount(G_UserData:getSeasonSport():getSeasonPetsStar())
        
        local petParam = self["_fileNode"..index]:getItemParams()
        self["_textName"..index]:setString(petParam.name)
        self["_textName"..index]:setColor(petParam.icon_color)

        self["_panelTouch"..index]:setTag(data.id)
        self["_panelTouch"..index]:setEnabled(true)
        self["_panelTouch"..index]:setSwallowTouches(false)
        self["_panelTouch"..index]:setTouchEnabled(true)
        self["_panelTouch"..index]:addClickEventListenerEx(handler(self, self._onPanelTouch))
    end

    for itemIndex, itemData in ipairs(cellData) do
        updateItem(itemIndex, itemData) 
     end
end


return SeasonPet2Icon