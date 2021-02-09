local PopupMineWorldNode = class("DrawCardCell")

function PopupMineWorldNode:ctor(target, districtData)
	self._target = target

    self._districtData = districtData

    self._imageMine = nil
    self._imageGuildBG = nil 
    self._textGuild = nil 
    self._imageFight = nil 
    self._imageClose = nil 
    self._imageNodeName = nil 
    self._panelTouch = nil

	self:_init()
end

function PopupMineWorldNode:_init()
    self._imageMine = ccui.Helper:seekNodeByName(self._target, "ImageMine")
    self._imageMine:addClickEventListenerEx(handler(self, self._onPanelClick))
    self._imageMine:setTouchEnabled(false)
    self._imageGuildBG = ccui.Helper:seekNodeByName(self._target, "ImageGuildBG") 
    self._imageGuildBG:setVisible(false)
    self._textGuild = ccui.Helper:seekNodeByName(self._target, "TextGuild") 
    self._imageFight = ccui.Helper:seekNodeByName(self._target, "ImageFight") 
    self._imageFight:setVisible(false)
    self._imageClose = ccui.Helper:seekNodeByName(self._target, "ImageClose") 
    self._imageClose:setVisible(false)
    self._imageNodeName = ccui.Helper:seekNodeByName(self._target, "ImageNodeName") 
    self._imageNodeName:setTouchEnabled(false)
    self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
    self._panelTouch:setTouchEnabled(false)
    self:_refreshData()
end

function PopupMineWorldNode:_refreshData()
    local config = self._districtData:getConfigData()

    self._imageNodeName:ignoreContentAdaptWithSize(true)
    local districtImg = Path.getMineNodeTxt(config.district_name_txt)
    self._imageNodeName:loadTextureNormal(districtImg)

    self._imageMine:ignoreContentAdaptWithSize(true)
    local iconImg = Path.getMineImage(config.district_icon)
    self._imageMine:loadTextureNormal(iconImg) 

    if self._districtData:isSeniorDistrict() then 
        if not self._districtData:isOpen() then
            self._imageClose:setVisible(true)
        elseif self._districtData:getGuildId() == 0 then 
            self._imageFight:setVisible(true)
        else 
            self._imageGuildBG:setVisible(true)
            self._textGuild:setString(self._districtData:getGuildName())
        end
    end
end

function PopupMineWorldNode:getId()
    return self._districtData:getId()
end

function PopupMineWorldNode:getPosition()
    return self._target:getPosition()
end

--传入是否全部显示或者选地区
function PopupMineWorldNode:setBright(isChooseBorn)
    self._imageMine:setTouchEnabled(false)
    if isChooseBorn then 
        self._imageMine:setBright(true)  
        self._imageNodeName:setBright(true)  
    else
        if not self._districtData:isDistrictCanReborn()  then
            self._imageMine:setBright(false)  
            self._imageNodeName:setBright(false)  
        else
            self._imageMine:setTouchEnabled(true)
        end
    end
end

function PopupMineWorldNode:_onPanelClick()
    -- print("1112233 change born", self._districtData:getId())
    local bornId = G_UserData:getMineCraftData():getBornDistrictId()
    if bornId == self._districtData:getId() then 
        G_Prompt:showTip(Lang.get("mine_already_born"))
        return 
    end
    G_UserData:getMineCraftData():c2sChangeMineGuildBorn(self._districtData:getId())
end


return PopupMineWorldNode