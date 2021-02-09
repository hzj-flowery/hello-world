--邮件奖励单元

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupMailRewardCell = class("PopupMailRewardCell", ListViewCellBase)
local MailHelper = require("app.scene.view.mail.MailHelper")
local CSHelper = require("yoka.utils.CSHelper")
local UIHelper = require("yoka.utils.UIHelper")

local NORMAL_IMGS = {
	  --背景,邮件未开Icon,邮件已打开Icon
	bg = "bth_mail01_nml",unOpenIcon = "img_mail01_nml",openIcon = "img_mail01_down"
}

local SELECT_IMGS = {
	bg = "bth_mail01_down",unOpenIcon = "img_mail01_nml",openIcon = "img_mail01_down"
}

local COLOR = {
	select = cc.c3b(0x9f, 0x4a, 0x0c),
	normal = cc.c3b(0x56, 0x68, 0x9c)
}

local LABEL_IMGS = {
[3] = "img_iconsign_juntuan",
[2] = "img_iconsign_tonggao",
}

local ICONBG = {
	select = "img_mailbg01",
	normal = "img_mailbg02"
}

function PopupMailRewardCell:ctor()
	self._target = nil
	self._resourceNode = nil  --资源节点
	self._imageIcon = nil --邮箱Icon
	self._textTitle     = nil  --邮件名称
	self._textRewardHint  = nil  --奖励提示
	self._imageLabelType = nil
	self._textSendTime = nil --日期
	local resource = {
		file = Path.getCSB("PopupMailRewardCell", "mail"),
		binding = {
			_resourceNode = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
			},
		},
	}
	PopupMailRewardCell.super.ctor(self, resource)
end

function PopupMailRewardCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height + self._resourceNode:getPositionY())

	self._imageIcon:ignoreContentAdaptWithSize(true)
	self._resourceNode:setSwallowTouches(false)

	self._imageBg:ignoreContentAdaptWithSize(true)
end

function PopupMailRewardCell:updateUI(mailInfo,index,selectIndex)
	 if mailInfo == nil then
	 	assert(false, "PopupMailRewardCell:updateUI mailInfo can not be nil ")
	 end
	 self._mailInfo = mailInfo
	 self._index = index
	 self._isSelect = index == selectIndex
	 local imgs =  self._isSelect and SELECT_IMGS or NORMAL_IMGS
	 MailHelper.updateRewardCell(mailInfo, self._textTitle)

	local hasReward = mailInfo.awards and 1 <= #mailInfo.awards 
	local isShowRewardHint = hasReward and (not mailInfo.isRead)

	self._textRewardHint:setVisible(isShowRewardHint)
	self._imageIcon:loadTexture(Path.getMail( mailInfo.isRead and imgs.openIcon or imgs.unOpenIcon))
	self._imageIconBg:loadTexture(Path.getMailIconBg(self._isSelect and ICONBG.select or ICONBG.normal))
	self._imageBg:loadTexture(Path.getMail(imgs.bg))
	self._textTitle:setColor(self._isSelect and COLOR.select  or COLOR.normal)
	self._textRewardHint:setColor(self._isSelect and Colors.BRIGHT_BG_GREEN  or Colors.BRIGHT_BG_GREEN)
	self._textSendTime:setString(MailHelper.getSendTimeShortString(mailInfo.time))


	if LABEL_IMGS[mailInfo.template.label_type] then
		self._imageLabelType:setVisible(true)
		self._imageLabelType:loadTexture(Path.getTextSignet(
			LABEL_IMGS[mailInfo.template.label_type]
		))
	else
		self._imageLabelType:setVisible(false)
	end
	
end

function PopupMailRewardCell:setSelected(isSelect)
	self:updateUI(self._mailInfo, self._index,isSelect and self._index or -1)
end

function PopupMailRewardCell:_onTouchCallBack(sender,state)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		self:_onItemClick(self)
	end
end

function PopupMailRewardCell:_onItemClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn("PopupMailRewardCell:_onIconClicked  "..curSelectedPos)
	self:dispatchCustomCallback(self)
end


return PopupMailRewardCell
