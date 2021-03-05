--
-- Author: Liangxu
-- Date: 2017-07-19 17:30:52
-- 
local CircleScroll = require("app.ui.CircleScroll")
local EquipTrainScroll = class("EquipTrainScroll", CircleScroll)
local CSHelper  = require("yoka.utils.CSHelper")

function EquipTrainScroll:ctor(size, angles, startIndex, parentView, equipPos)
	EquipTrainScroll.super.ctor(self, size, angles, startIndex)
	-- self:setNodeEventEnabled(true)

	self._startIndex = startIndex
	self._parentView = parentView
	self._equipList = {}
	
	local equipIds = G_UserData:getBattleResource():getEquipInfoWithPos(equipPos)
	for i = 1, 4 do
		local equipId = equipIds[i]
		if equipId then
			local equip = CSHelper.loadResourceNode(Path.getCSB("CommonEquipAvatar", "common"))
			local data = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
			local baseId = data:getBase_id()
			equip:updateUI(baseId)
			equip:showShadow(false)
			equip:setEquipId(equipId)
			equip:setCallBack(handler(self, self._onClickEquip))
			self:addNode(equip, i)
			self._equipList[i] = equip
		end
	end
end

function EquipTrainScroll:_onClickEquip()
	
end

function EquipTrainScroll:onMoveStop(event)
	if event == "back" then
		local list = self:getOrderList()
        for i = 1, #list do
            local equip = list[i]
            if(equip.EndAngle == 270)then
                if self._parentView then
                	G_UserData:getEquipment():setCurEquipId(equip:getEquipId())
                	self._parentView:updateInfo()
                end
                break
            end
        end 
	end
end

return EquipTrainScroll