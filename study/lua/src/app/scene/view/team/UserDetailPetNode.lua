--
-- Author: Liangxu
-- Date: 2018-2-13 17:59:46
-- 查看阵容神兽模块

local ViewBase = require("app.ui.ViewBase")
local UserDetailPetNode = class("UserDetailPetNode", ViewBase)
local UserDetailPetSingle = require("app.scene.view.team.UserDetailPetSingle")

function UserDetailPetNode:ctor(parentView)
	self._parentView = parentView
	
	local resource = {
		file = Path.getCSB("UserDetailPetNode", "common"),
		binding = {
			
		},
	}

	UserDetailPetNode.super.ctor(self, resource)
end

function UserDetailPetNode:onCreate()
	self:_initData()
	self:_initView()
end

function UserDetailPetNode:_initData()
	self._detailData = nil
end

function UserDetailPetNode:_initView()
	
end

function UserDetailPetNode:onEnter()

end

function UserDetailPetNode:onExit()
	
end

function UserDetailPetNode:updateInfo(detailData)
	self._detailData = detailData
	self:_updateData()
	self:_updateView()
end

function UserDetailPetNode:_updateData()
	
end

function UserDetailPetNode:_updateView()
	local tbPos = {
		[1] = {cc.p(482, 199)},
		[2] = {cc.p(315, 199), cc.p(658, 199)},
		[3] = {cc.p(230, 199), cc.p(482, 199), cc.p(733, 199)},
		[4] = {cc.p(337, 316), cc.p(635, 316), cc.p(336, 91), cc.p(635, 91)},
		[5] = {cc.p(267, 316), cc.p(486, 316), cc.p(705, 316), cc.p(376, 91), cc.p(595, 91)},
		[6] = {cc.p(267, 316), cc.p(486, 316), cc.p(705, 316), cc.p(267, 91), cc.p(486, 91), cc.p(705, 91)},
		[7] = {cc.p(267, 316), cc.p(486, 316), cc.p(705, 316), cc.p(189, 91), cc.p(391, 91), cc.p(594, 91), cc.p(797, 91)},
	}
	local tbScale = {
		[1] = 0.6,
		[2] = 0.5,
		[3] = 0.5,
		[4] = 0.4,
		[5] = 0.4,
		[6] = 0.4,
		[7] = 0.4,
	}

	self._nodePetBg:removeAllChildren()

	local petIds = self._detailData:getProtectPetIds()
	local len = #petIds
	for i, petId in ipairs(petIds) do
		local unitData = self._detailData:getPetUnitDataWithId(petId)
		local node = UserDetailPetSingle.new(unitData)
		node:setAvatarScale(tbScale[len])
		node:setPosition(tbPos[len][i])
		self._nodePetBg:addChild(node)
	end
end

return UserDetailPetNode