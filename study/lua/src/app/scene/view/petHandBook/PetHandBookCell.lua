--
-- Author: hedili
-- Date: 2017-02-28 15:09:42
-- 神兽图鉴
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetHandBookCell = class("PetHandBookCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local PetConst = require("app.const.PetConst")
local CSHelper = require("yoka.utils.CSHelper")
local PetAvatarNode = import(".PetAvatarNode")

function PetHandBookCell:ctor()

	local resource = {
		file = Path.getCSB("PetHandBookCell", "pet"),
	}
	PetHandBookCell.super.ctor(self, resource)
end

function PetHandBookCell:onCreate()

	local size =  self._resourceNode:getContentSize()
	self:setContentSize(size)
	self._commonBtn:setString(Lang.get("avatar_btn_active"))
	self._commonBtn:addClickEventListenerEx(handler(self,self.onButtonClick))
end

function PetHandBookCell:onButtonClick( sender )
	-- body
	--神兽激活逻辑
	G_UserData:getPet():c2sActivePetPhoto(self:getPetMapId())
end

function PetHandBookCell:onEnter()
	
end

function PetHandBookCell:onExit()
	
end


function PetHandBookCell:getPetMapId()
	-- body
	return self._cellValue.id
end


function PetHandBookCell:_updatePetAvatar( ... )
	local petIdList = self:_getPetList()
	local rootNode  = self:_getRootNode(petIdList)
	local function updateAvatarState( node, petBaseId )
		-- body
		if node then
			local avatar = node:getChildByName("Node_avatar"):getChildByName("avatar")
			local petName = node:getChildByName("Pet_VName")
			petName:setVisible(true)
			if avatar then
				if G_UserData:getPet():isPetHave(petBaseId) then
					avatar:highLightNode()
				else
					avatar:darkNode()
				end
			end
		end
	end
	for i, value in ipairs(petIdList) do
		local node = rootNode:getSubNodeByName("Node_pet"..i)
		updateAvatarState(node,value)
	end
end

function PetHandBookCell:_getPetList( ... )
	-- body
	local petIdList = {}
	for i = 1 , 3 do
		local petId = self._cellValue["pet"..i]
		if petId > 0 then
			table.insert(petIdList, petId)
		end
	end
	return petIdList
end

function PetHandBookCell:_getRootNode(petIdList)
	-- body
	local rootNode = self:getSubNodeByName("Node_pet_three")
	if #petIdList == 3 then
		rootNode = self:getSubNodeByName("Node_pet_three")
		self._resourceNode:setContentSize(cc.size(459,550))
	end

	if #petIdList == 2 then
		rootNode = self:getSubNodeByName("Node_pet_two")
		self._resourceNode:setContentSize(cc.size(404,550))
	end

	if #petIdList == 1 then
		rootNode = self:getSubNodeByName("Node_pet_one")
		self._resourceNode:setContentSize(cc.size(404,550))
	end
	rootNode:setVisible(true)
	return rootNode
end
function PetHandBookCell:updateUI( petMapData )
	-- body
	self._cellValue = petMapData
	local petIdList = self:_getPetList()
	local rootNode  = self:_getRootNode(petIdList)


	self._commonBtn:setVisible(true)

	for i, value in ipairs(petIdList) do
		local node = rootNode:getSubNodeByName("Node_pet"..i)
		local nodeAvatar = node:getChildByName("Node_avatar")
		local petName = node:getChildByName("Pet_VName")
		nodeAvatar:removeAllChildren()
		local avatar = PetAvatarNode.new()
		if petName and cc.isRegister("CommonPetVName") then
			cc.bind(petName, "CommonPetVName")
			petName:updateUI(value)
		end
		if G_UserData:getPet():isPetMapShow(self._cellValue.id) == false then
			logDebug("PetHandBookCell:updateUI doNoShow")
			avatar:doNoShow()
			petName:setVisible(false)
		else
			avatar:updateUI(value,"_small")

			avatar:setCallBack(handler(self,self.onIconCallBack))
			petName:setVisible(true)
		end
		avatar:setName("avatar")
		avatar:setUserData(value)
		nodeAvatar:addChild(avatar)
	end

	self:_updateAttr()
	self:procPetMapState()
end

function PetHandBookCell:onIconCallBack(value)
	local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET,value)

	local itemCfg = itemParams.cfg
	local PopupPetDetail = require("app.scene.view.petDetail.PopupPetDetail").new(TypeConvertHelper.TYPE_PET ,itemCfg.id, true)
	PopupPetDetail:openWithAction()

	local petList = G_UserData:getHandBook():getPetList()

	PopupPetDetail:setPageData(petList)
end

--处理神兽图鉴状态
-- 1可激活，0未激活，2已激活, -1敬请期待
function PetHandBookCell:procPetMapState( ... )
	-- body
	local state = G_UserData:getPet():getPetMapState(self:getPetMapId())
	local petIdList = self:_getPetList()
	local rootNode  = self:_getRootNode(petIdList)

	local function procNoShowState( state )
		-- body
		if state ~= -1 then
			return
		end
		self._petCellName:setString(" ")
		self._imageZheZhao:setVisible(true)
		self._commonBtn:setVisible(false)
		self._textNoShow:setVisible(true)
		for i=1, 5 do
			self["_nodeAttr"..i]:setVisible(false)
		end

		for i, value in ipairs(petIdList) do
			local node = rootNode:getSubNodeByName("Node_pet"..i)
			local avatar = node:getChildByName("Node_avatar"):getChildByName("avatar")
			local petName = node:getChildByName("Pet_VName")
			avatar:doNoShow()
			petName:setVisible(false)
		end
	end
	procNoShowState(state)
	--已经激活
	local function procActivedState( state )
		-- body
		if state ~= 2 then
			return
		end
		self._imageZheZhao:setVisible(false)
		self._commonBtn:setVisible(false)
		self._imageActive:setVisible(true)
		local attrList = self:getAttrList()
		for i, value in ipairs(attrList) do
			self["_nodeAttr"..i]:setNameColor(Colors.BRIGHT_BG_GREEN)
			self["_nodeAttr"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
		end
		self:_updatePetAvatar()
	end

	procActivedState(state)
	--未激活
	local function procNoActiveState( state )
		-- body
		if state ~= 0 then
			return
		end
		self._imageZheZhao:setVisible(true)
		self._commonBtn:setVisible(false)
		self._imageActive:setVisible(false)
		local attrList = self:getAttrList()
		for i, value in ipairs(attrList) do
			self["_nodeAttr"..i]:setNameColor(Colors.BRIGHT_BG_TWO)
			self["_nodeAttr"..i]:setValueColor(Colors.BRIGHT_BG_TWO)
		end
		self:_updatePetAvatar()
	end
	procNoActiveState(state)
	--可激活
	local function procCanActiveState( state )
		-- body
		if state ~= 1 then
			return
		end
		self._imageZheZhao:setVisible(false)
		self._commonBtn:setVisible(true)
		--self._commonBtn:showRedPoint(true)
		self._imageActive:setVisible(false)
		local attrList = self:getAttrList()
		for i, value in ipairs(attrList) do
			self["_nodeAttr"..i]:setNameColor(Colors.BRIGHT_BG_TWO)
			self["_nodeAttr"..i]:setValueColor(Colors.BRIGHT_BG_TWO)
		end

		self:_updatePetAvatar()
	end
	procCanActiveState(state)
end


function PetHandBookCell:getAttrList( ... )
	-- body
	local attrList = {}
	for i=1, 5 do
		local attrType = self._cellValue["attribute_type_"..i]
		if attrType > 0 then
			local attrValue =  self._cellValue["attribute_value_"..i]
			table.insert(attrList, {attrType = attrType, attrValue = attrValue})
		end
	end

	return attrList
end
function PetHandBookCell:_updateAttr( ... )
	-- body
	self._petCellName:setString(self._cellValue.name)
	local attrList = self:getAttrList()
	for i=1, 5 do
		self["_nodeAttr"..i]:setVisible(false)
	end

	for i, value in ipairs(attrList) do
		local attrType = value.attrType
		local attrValue = value.attrValue
		self["_nodeAttr"..i]:setVisible(true)
		self["_nodeAttr"..i]:updateValue(attrType,attrValue)		
	end

end

return PetHandBookCell