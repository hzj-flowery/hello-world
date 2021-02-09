-- 组队队员节点
-- Author: Liangxu
-- Date: 2018-11-10
--
local GroupHeroNode = class("GroupHeroNode")
local PopupUserBaseInfo = import(".PopupUserBaseInfo")

function GroupHeroNode:ctor(target, onAddCallback, onOutCallback)
	self._target = target
	self._onAddCallback = onAddCallback
	self._onOutCallback = onOutCallback

	self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
	self._buttonAdd:addClickEventListenerEx(handler(self, self._onClickAdd))
	self._nodeHeroAvatar = ccui.Helper:seekNodeByName(self._target, "NodeHeroAvatar")
	cc.bind(self._nodeHeroAvatar, "CommonHeroAvatar")
	self._nodeHeroAvatar:setCallBack(handler(self,self._onClickHero))
	self._textGuildName = ccui.Helper:seekNodeByName(self._target, "TextGuildName")
	self._textPlayerName = ccui.Helper:seekNodeByName(self._target, "TextPlayerName")
	self._imageLeaderFlag = ccui.Helper:seekNodeByName(self._target, "ImageLeaderFlag")
	self._buttonOut = ccui.Helper:seekNodeByName(self._target, "ButtonOut")
	cc.bind(self._buttonOut, "GroupsButton3")
	self._buttonOut:setString(Lang.get("groups_btn_kick_out"))
	self._buttonOut:addClickEventListenerEx(handler(self, self._onClickOut))
	self._imagePower = ccui.Helper:seekNodeByName(self._target, "ImagePower")
	self._nodePower = ccui.Helper:seekNodeByName(self._target, "NodePower")
	cc.bind(self._nodePower, "CommonHeroPower")

	local panel = ccui.Helper:seekNodeByName(self._target, "Panel")
	self._target:setContentSize(panel:getContentSize())
end

function GroupHeroNode:_initUI()
	self._buttonAdd:setVisible(false)
	self._nodeHeroAvatar:setVisible(false)
	self._textGuildName:setVisible(false)
	self._textPlayerName:setVisible(false)
	self._imageLeaderFlag:setVisible(false)
	self._buttonOut:setVisible(false)
	self._imagePower:setVisible(false)
end

function GroupHeroNode:updataUI(userData)
	self._userData = userData

	self:_initUI()
	if userData then
		self._nodeHeroAvatar:setVisible(true)
		self._textGuildName:setVisible(true)
		self._textPlayerName:setVisible(true)
		self._imagePower:setVisible(true)

		local isSelfLeader = G_UserData:getGroups():isSelfLeader()
		if isSelfLeader and not userData:isSelf() then
			self._buttonOut:setVisible(true)
		end

		self._nodeHeroAvatar:updateUI(userData:getCovertId(), nil, nil, userData:getLimitLevel())
		self._nodeHeroAvatar:setTouchEnabled(true)
		self._imageLeaderFlag:setVisible(userData:isLeader())
		local guildName = userData:getGuild_name()
		if guildName == "" then
			guildName = Lang.get("groups_hero_no_guild")
		end
		self._textGuildName:setString(guildName)
		self._textPlayerName:setString(userData:getName())
		self._textPlayerName:setColor(Colors.getOfficialColor(userData:getOffice_level()))
		self._textPlayerName:enableOutline(Colors.getOfficialColorOutline(userData:getOffice_level()), 2)
		self._nodePower:updateUI(userData:getPower())
		self._nodeHeroAvatar:showTitle(userData:getTitle(),self.__cname)  -- 显示称号
	else
		self._buttonAdd:setVisible(true)
	end
end

function GroupHeroNode:_onClickAdd()
	if self._onAddCallback then
		self._onAddCallback()
	end
end

function GroupHeroNode:_onClickOut()
	if self._onOutCallback then
		self._onOutCallback(self._userData)
	end
end

function GroupHeroNode:_onClickHero()
	if self._userData:isSelf() then --自己不显示菜单
		return
	end

	local popup = PopupUserBaseInfo.new()
	popup:setName("PopupUserBaseInfo")
	popup:updateUI(self._userData)
	popup:openWithAction()
end

function GroupHeroNode:isEmpty()
	if self._userData then
		return false
	else
		return true
	end
end

function GroupHeroNode:getHeroAvatar()
	return self._nodeHeroAvatar
end

return GroupHeroNode