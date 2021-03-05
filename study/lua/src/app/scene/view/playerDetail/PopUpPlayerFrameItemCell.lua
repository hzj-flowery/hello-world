
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopUpPlayerFrameItemCell = class("PopUpPlayerFrameItemCell", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local PopUpPlayerFrameHelper = require("app.scene.view.playerDetail.PopUpPlayerFrameHelper")
local UIHelper  = require("yoka.utils.UIHelper")

function PopUpPlayerFrameItemCell:ctor()
    local resource = nil
    self._callBack = nil


    local resource = {
        file = Path.getCSB("PopUpPlayerFrameItemCell", "playerDetail"),
        binding = {
   
        }
    }
	PopUpPlayerFrameItemCell.super.ctor(self, resource)
end

function PopUpPlayerFrameItemCell:onCreate()
	self:setContentSize(410, 130)
    self._itemSpacing = 22
end


function PopUpPlayerFrameItemCell:updateUI(frameItemData)
    self._frameItemData = frameItemData

    for index=1,3 do
        local heroNode = self["_heroNode"..index]
        --local frameNode = self["_frameNode"..index]
        if index <= #self._frameItemData then
            heroNode:setVisible(true)
            --heroNode:setVisible(true)

            heroNode:updateIcon(G_UserData:getBase():getPlayerShowInfo(), nil ,frameItemData[index]:getId())
            --local scale = heroNode:getScale()
            --heroNode:updateHeadFrame(frameItemData[index])
           
            if G_UserData:getHeadFrame():isFrameHasRedPoint(frameItemData[index]:getId()) then
                heroNode:setRedPointVisible(true)
            else
                heroNode:setRedPointVisible(false)
            end

            if not frameItemData[index]:isHave() then
                heroNode:setLocked(true)
                heroNode:setHeroIconMask(true)
            else
                heroNode:setLocked(false)
                heroNode:setHeroIconMask(false)
            end

            heroNode:setTag(frameItemData[index]:getId())

            if frameItemData[index]:getId() == PopUpPlayerFrameHelper.getCurrentTouchIndex()  then 
                -- heroNode:setSelected(true)
                self["_select"..index]:setVisible(true)
                heroNode:setRedPointVisible(false)
                G_UserData:getHeadFrame():deleteRedPointBy(frameItemData[index]:getId())
            else
                -- heroNode:setSelected(false)
                self["_select"..index]:setVisible(false)
            end
            
            heroNode:setCallBack(handler(self,self._onTouchCallBack))
        else
            heroNode:setVisible(false)
            --heroNode:setVisible(false)
        end
    end
end

function PopUpPlayerFrameItemCell:_onTouchCallBack( sender,param )
    PopUpPlayerFrameHelper.setCurrentTouchIndex(tonumber(sender:getTag()))

    if self._callBack then 
        self._callBack(tonumber(sender:getTag()))
    end
end

function PopUpPlayerFrameItemCell:setItemTouchCallBack( callback )
    if callback then 
        self._callBack = callback
    end
end

return PopUpPlayerFrameItemCell
