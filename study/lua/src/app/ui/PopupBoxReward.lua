--弹出界面
--通用奖励领取弹出框
--用于宝箱奖励
local PopupBase = require("app.ui.PopupBase")
local PopupBoxReward = class("PopupBoxReward", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupBoxReward:ctor( title, callback,isClickOtherClose, isNotCreateShade)
	self._title = title or Lang.get("common_btn_help")
	self._callback = callback
	self._listViewDrop  = nil
	self._btnOk = nil --
	--
	local resource = {
		file = Path.getCSB("PopupBoxReward", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			}
		}
	}
	self:setName("PopupBoxReward")
	PopupBoxReward.super.ctor(self, resource, isClickOtherClose, isNotCreateShade)
end

--
function PopupBoxReward:onCreate()
	self._commonNodeBk:setTitle(self._title)
	self._btnOk:setString(Lang.get("common_btn_sure"))
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))

	self._listViewDrop:setContentSize(cc.size(100,200))
end

function PopupBoxReward:setBtnEnable(enable)
	self._btnOk:setEnabled(enable)
end

function PopupBoxReward:setBtnText(text)
	self._btnOk:setString(text)
end

function PopupBoxReward:setItemsMargin(margin)
	self._listViewDrop:setItemsMargin(margin)
end
--满足策划的淫荡五角星需求
function PopupBoxReward:setChapterDesc(num)

	 local paramList = {
		[1] = {
			type = "label",
			text = Lang.get("get_star_box_detail3", {count = num}),
			fontSize = 22,
			color = Colors.BRIGHT_BG_TWO,
			anchorPoint = cc.p(0, 0.5),
		},

		[2] = {
			type = "image",
			texture = Path.getUICommon("img_lit_stars02"),
			name = "biantaiStar"
		},
		[3] = {
			type = "label",
			text = Lang.get("get_star_box_detail4"),
			fontSize = 22,
			color = Colors.BRIGHT_BG_TWO,
		},
	}
	local node = UIHelper.createRichItems(paramList,true)

	local biantaiStar = node:getChildByName("biantaiStar")
	biantaiStar:setPositionY(biantaiStar:getPositionY() - 5)
	self._textDetail:setVisible(false)
	self._nodeChapter:removeAllChildren()
	self._nodeChapter:addChild(node)
	self._nodeChapter:setVisible(true)
end
function PopupBoxReward:setDetailText(text)
	self._nodeChapter:setVisible(false)
	self._textDetail:setString(text)
	self._textDetail:setVisible(true)
end


function PopupBoxReward:setDetailRichText(text)
	self._textDetail:setString(text)
	self._textDetail:setVisible(true)
end

function PopupBoxReward:_createCellEx(award)
	local widget = ccui.Widget:create()

    local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconNameNode", "common"))
	uiNode:updateUI(award.type, award.value, award.size)
	uiNode:showItemBg(true)
	uiNode:setTouchEnabled(true)

	local panelSize = uiNode:getPanelSize()

	widget:setContentSize(panelSize)

	--uiNode:setPosition(panelSize.width*0.5, panelSize.height*0.5)
	widget:addChild(uiNode)

	return widget
end



--创建左对齐物品列表
function PopupBoxReward:_updateAwards(awards)
	self._listViewDrop:removeAllChildren()
    for i = 1, #awards do
        local award = awards[i]
		local widget = self:_createCellEx(award)
		self._listViewDrop:pushBackCustomItem(widget)
    end

	--
	if #awards > 4 then
		self._listViewDrop:setTouchEnabled(true)
		self._listViewDrop:setContentSize(cc.size(480,190))
		self._listViewDrop:doLayout()
	else
		self._listViewDrop:adaptWithContainerSize()
		self._listViewDrop:setTouchEnabled(false)
	end

end


function PopupBoxReward:_onItemSelected(item, index)

end

function PopupBoxReward:_onItemTouch(index, t)

end


function PopupBoxReward:updateUI(awards)
	if checktable(awards) == false then
		return
	end
	self._awardList = awards
	self:_updateAwards(awards)
end

function PopupBoxReward:_onInit()
end


function PopupBoxReward:onEnter()

end

function PopupBoxReward:onExit()

end

function PopupBoxReward:onShowFinish()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PopupBoxReward:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback()
	end
	if not isBreak then
		self:close()
	end
end

function PopupBoxReward:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

function PopupBoxReward:setItemsMargin(margin)
	self._listViewDrop:setItemsMargin(margin)
end


function PopupBoxReward:addRichTextDetail(richTextNode)
	if not richTextNode then
		return
	end
	richTextNode:setAnchorPoint(cc.p(0.5, 0.5))
	self._richTextNode:addChild(richTextNode)
end

function PopupBoxReward:setDetailTextString(text)
	self._textDetail:setString(text)
end

function PopupBoxReward:setDetailTextVisible(isVisible)
	self._textDetail:setVisible(isVisible)
end

function PopupBoxReward:setDetailTextToBottom()
	self._textDetail:setPositionY(-98)
end

return PopupBoxReward
