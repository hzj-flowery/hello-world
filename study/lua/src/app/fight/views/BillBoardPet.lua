local BillBoardPet = class("BillBoardPet", function()
	return cc.Node:create()
end)

local UIHelper  = require("yoka.utils.UIHelper")

BillBoardPet.POS_STAR = {
    [1] = {cc.p(0, 0)},
    [2] = {cc.p(-10, 0), cc.p(10, 0)},
    [3] = {cc.p(-20, 0), cc.p(0, 0), cc.p(20, 0)},
    [4] = {cc.p(-30, 0), cc.p(-10, 0), cc.p(10, 0), cc.p(30, 0)},
    [5] = {cc.p(-40, 0), cc.p(-20, 0), cc.p(0, 0), cc.p(20, 0), cc.p(40, 0)},
}

function BillBoardPet:ctor(name, quality, star)
    self:setCascadeOpacityEnabled(true)
    self:setCascadeColorEnabled(true)
    
    self._labelName = cc.Label:createWithTTF(name, Path.getCommonFont(), 22)
    self:addChild(self._labelName)
    if star == 0 then 
        self._labelName:setPosition(cc.p(0, 0))
    else
        self._labelName:setPosition(cc.p(0, 22))
    end
    self._labelName:setColor(Colors.getColor(quality))
    self._labelName:enableOutline(Colors.getColorOutline(quality), 2) 

    self._starNode = cc.Node:create()
    self._starNode:setPosition(cc.p(0, 0))
    self:addChild(self._starNode)

    self:_createStar(star)

    self:setVisible(false)
end

function BillBoardPet:_createStar(star)
    if star == 0 then   --没有星数
        return
    end
    local pos = BillBoardPet.POS_STAR[star]
    for i = 1, star do 
        local picStar = display.newSprite(Path.getCommonImage("icon_com_star"))
        self._starNode:addChild(picStar)
        picStar:setPosition(pos[i])
    end
end

return BillBoardPet
