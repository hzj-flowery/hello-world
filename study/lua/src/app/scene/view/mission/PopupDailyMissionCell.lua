
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupDailyMissionCell = class("PopupDailyMissionCell", ListViewCellBase)

local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")



function PopupDailyMissionCell:ctor()
	self._target = nil
	self._buttonOK = nil   -- ok按钮

	self._resourceNode = nil
	self._fileNode1 = nil  --Icon Array, 一行5个icon
	self._fileNode2 = nil
	local resource = {
		file = Path.getCSB("PopupDailyMissionCell", "mission"),
	}
	PopupDailyMissionCell.super.ctor(self, resource)
	self._iconList = {}
end

function PopupDailyMissionCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._fileNode1:setVisible(false)
	self._fileNode2:setVisible(false)

	local fileNodeBtn1 = self._fileNode1:getSubNodeByName("FileNode_btn")
	cc.bind(fileNodeBtn1, "CommonButtonMediumNormal")
	fileNodeBtn1:addClickEventListenerEx(handler(self,self._onButtonClick))

	local fileNodeBtn2 = self._fileNode2:getSubNodeByName("FileNode_btn")
	cc.bind(fileNodeBtn2, "CommonButtonMediumNormal")
	fileNodeBtn2:addClickEventListenerEx(handler(self,self._onButtonClick))
end

--
function PopupDailyMissionCell:updateUI(index, missionList )
	self._fileNode1:setVisible(false)
	self._fileNode2:setVisible(false)
	for i, value in ipairs(missionList) do
		self:_updateMissionNode(i, value)
	end
	self._missionList = missionList

end


function PopupDailyMissionCell:_updateMissionNode(index, missionInfo)


	local missionNode = self["_fileNode"..index]
	if missionNode == nil then
		return
	end

	missionNode:setVisible(true)

	--[[
	local fileNodeIcon = missionNode:getSubNodeByName("FileNode_Icon")
	if fileNodeIcon then
		cc.bind(fileNodeIcon, "CommonIconTemplate")
		fileNodeIcon:unInitUI()
		if missionInfo.reward_type > 0 then
			fileNodeIcon:initUI(missionInfo.reward_type,missionInfo.reward_value, missionInfo.reward_size)
		end
	end
	]]
	local iconPath = Path.getCommonIcon("main",missionInfo.icon)
	dump(iconPath)
	missionNode:updateImageView("Image_icon", { texture = iconPath })
	missionNode:updateLabel("Text_Name", {text = missionInfo.name })

	local progressStr =  missionInfo.value.."/"..missionInfo.require_value
	local progressColor = Colors.BRIGHT_BG_RED
	if missionInfo.value >= missionInfo.require_value then
		progressColor = Colors.BRIGHT_BG_GREEN
	end
	missionNode:updateLabel("Text_Process", {text = progressStr, color = progressColor})
	missionNode:updateLabel("Text_activity_text", {text = "+"..missionInfo.reward_active})

	local fileNodeBtn = missionNode:getSubNodeByName("FileNode_btn")
	--是否已领取
	if missionInfo.getAward == true then
		missionNode:getSubNodeByName("Image_mission_finish"):setVisible(true)
		fileNodeBtn:setVisible(false)
	else
		if fileNodeBtn then
			cc.bind(fileNodeBtn, "CommonButtonMediumNormal")
			fileNodeBtn:addClickEventListenerEx(handler(self,self._onButtonClick))
		end
		if missionInfo.value >= missionInfo.require_value then
			fileNodeBtn:setString(Lang.get("common_btn_get_award"))
			fileNodeBtn:setButtonTag(index)
			fileNodeBtn:showRedPoint(true)
		else
			fileNodeBtn:setString(Lang.get("common_btn_go_to"))
			fileNodeBtn:setButtonTag(index)
			fileNodeBtn:showRedPoint(false)
		end
		fileNodeBtn:setVisible(true)
		missionNode:getSubNodeByName("Image_mission_finish"):setVisible(false)

	end

end


function PopupDailyMissionCell:_onButtonClick(sender)
	local index = sender:getTag()

	local missionInfo = self._missionList[index]

	if missionInfo.getAward == false then
		if missionInfo.value >= missionInfo.require_value then

			self:dispatchCustomCallback(missionInfo.id)
		else
			if missionInfo.function_id > 0 then
				if missionInfo.function_id == FunctionConst.FUNC_DINNER then

				end
				local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
				WayFuncDataHelper.gotoModuleByFuncId(missionInfo.function_id, "mission")

			end
		end
	end

end


return PopupDailyMissionCell
