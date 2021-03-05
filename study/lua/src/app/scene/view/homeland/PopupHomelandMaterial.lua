
-- Author: hedili
-- Date:2018-08-02 14:04:39
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupHomelandMaterial = class("PopupHomelandMaterial", PopupBase)
local PopupHomelandMaterialCell = import(".PopupHomelandMaterialCell")
local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")

function PopupHomelandMaterial:ctor()

	--csb bind var name
	self._listRank = nil  --ListView
	self._panelBase = nil  --Panel
	self._rankBase = nil  --CommonNormalSmallPop
	self._titleBG = nil  --ImageView

	local resource = {
		file = Path.getCSB("PopupHomelandMaterial", "homeland"),

	}
	PopupHomelandMaterial.super.ctor(self, resource)
end

-- Describle：
function PopupHomelandMaterial:onCreate()
	self._rankBase:setTitle(Lang.get("homeland_tree_preview"))
	self._rankBase:addCloseEventListener(handler(self, self.onBtnCancel))

	
	self._dataList = HomelandHelp.getTreePreviewList()

	self._listRank:removeAllChildren()
	for i, value in ipairs(self._dataList) do

		local itemLine = PopupHomelandMaterialCell.new(value) 
		self._listRank:pushBackCustomItem(itemLine)
		

	end

end

-- Describle：
function PopupHomelandMaterial:onEnter()


end

-- Describle：
function PopupHomelandMaterial:onExit()

end


function PopupHomelandMaterial:onBtnCancel()
	self:close()
end


return PopupHomelandMaterial