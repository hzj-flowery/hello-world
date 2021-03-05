
-- Author: hedili
-- Date:2018-05-02 15:59:38
-- Describle：好友 主子树升级情况信息

local PopupHomelandUp = require("app.scene.view.homeland.PopupHomelandUp")
local PopupHomelandFriendUp = class("PopupHomelandFriendUp", PopupHomelandUp)
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
local HomelandConst = require("app.const.HomelandConst")

function PopupHomelandFriendUp:ctor(upType, treeData)


	self._attrNode1 = nil  --SingleNode
	self._attrNode2 = nil  --SingleNode
	self._attrNode3 = nil  --SingleNode
	self._btnUp = nil  --CommonButtonHighLight
	self._commonHelp = nil  --CommonHelp
	self._commonNodeBk = nil  --CommonNormalSmallPop
	self._conditionTitle = nil  --ImageView
	self._imageArrow = nil  --ImageView
	self._resItem1 = nil  --CommonResourceInfo
	self._resItem2 = nil  --CommonResourceInfo
	self._resItem3 = nil  --CommonResourceInfo
	self._textAddPlayerJoint = nil  --Text
	self._textNodeRes = nil  --SingleNode
	self._imageRankMax = nil  --Text


	PopupHomelandFriendUp.super.ctor(self, upType, treeData)
end


function PopupHomelandFriendUp:onInitCsb(resource)
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupHomelandFriendUp", "homeland"),
		binding = {

		},
	}
   if resource then
        CSHelper.createResourceNode(self, resource)
    end
end


-- Describle：
function PopupHomelandFriendUp:onCreate()
	self._commonNodeBk:setTitle(Lang.get("homeland_popup_title"))
	--self._btnUp:setString(Lang.get("common_btn_name_confirm"))
	
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))


	self:_createDlgCell()
end


function PopupHomelandFriendUp:_updateUI( ... )
	-- body
	if self._upType ==  HomelandConst.DLG_MAIN_TREE then
		self:updateMainTree()
	end
	if self._upType == HomelandConst.DLG_SUB_TREE then
		self:updateSubTree()
	end
end

-- Describle：
function PopupHomelandFriendUp:onEnter()
	self:_updateUI()
end

function PopupHomelandFriendUp:_updateMainCostInfo( mainData1 )

end

function PopupHomelandFriendUp:_updateSubCostInfo( subData1)

end

-- Describle：
function PopupHomelandFriendUp:onExit()

end


function PopupHomelandFriendUp:_getMainCfg( ... )
	-- body
	dump( self._treeData )
	local mainData1, mainData2 = HomelandHelp.getMainTreeCfg(self._treeData)
	return mainData1, mainData2
end

function PopupHomelandFriendUp:_getSubCfg( ... )
	-- body
	dump( self._treeData )
	local subData1, subData2 = HomelandHelp.getSubTreeCfg(self._treeData)
	return subData1, subData2
end


function PopupHomelandFriendUp:updateMainTree( ... )

	local mainData1, mainData2 = self:_getMainCfg()
	--max

	if mainData2 == nil then
		self._levelUpCell1:setVisible(false)
		self._levelUpCell2:setVisible(false)
		self._levelUpCell3:setVisible(true)
		self._levelUpCell3:updateUI(mainData1, true)
		self._attrNode3:setPositionY(218)

		self._imageArrow:setVisible(false)
		self._imageRankMax:setVisible(true)
		self._imageRankMax:loadTexture(Path.getTextHomeland("txt_homeland_05"))
		return
	end

	--two
	if mainData1 and mainData2 then
		self._levelUpCell1:setVisible(true)
		self._levelUpCell2:setVisible(true)
		self._levelUpCell3:setVisible(false)
	
		self._levelUpCell1:updateUI(mainData1, true)
		self._levelUpCell2:updateUI(mainData2, false)

		self._imageArrow:setVisible(true)
		self._imageRankMax:setVisible(false)
	end

end


function PopupHomelandFriendUp:updateSubTree( ... )
	
	--max
	local subData1, subData2 = self:_getSubCfg()
	
	if subData2 == nil then
		self._levelUpCell1:setVisible(false)
		self._levelUpCell2:setVisible(false)
		self._levelUpCell3:setVisible(true)
		self._attrNode3:setPositionY(285)
		self._levelUpCell3:updateUI(subData1, true)
		self._imageArrow:setVisible(false)
		self._imageRankMax:setVisible(true)
		self._imageRankMax:loadTexture(Path.getTextHomeland("txt_homeland_06"))
		return
	end

	--two
	if subData1 and subData2 then
		self._levelUpCell1:setVisible(true)
		self._levelUpCell2:setVisible(true)
		self._levelUpCell3:setVisible(false)
		self._levelUpCell1:updateUI(subData1, true)
		self._levelUpCell2:updateUI(subData2, false)
		self._imageArrow:setVisible(true)
		self._imageRankMax:setVisible(false)
	end
end

return PopupHomelandFriendUp