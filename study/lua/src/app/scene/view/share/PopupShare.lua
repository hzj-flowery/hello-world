
-- Author: hedili
-- Date:2018-04-25 16:51:38
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupShare = class("PopupShare", PopupBase)
local NativeConst = require("app.const.NativeConst")
local WebHelper = require("app.utils.WebHelper")
local SHARE_IMG_NAME = "week_share.jpg"

local BACKGROUND_IMAGE ={
	[1] = "img_bg_share_caocao",
	[2] = "img_bg_share_diaochan",
	[3] = "img_bg_share_guanyu",
	[4] = "img_bg_share_baiyi",
	[5] = "img_bg_share_daxiaoqiao",
	[6] = "img_bg_share_maitian",
	[7] = "img_bg_share_qingmingjie",
	[8] = "img_bg_share_qixi",
	[9] = "img_bg_share_xiahoudun",
}

function PopupShare:ctor()

	--csb bind var name
	self._btnClose = nil  --Button
	self._btnWeiBo = nil  --Button
	self._btnWeiXin = nil  --Button
	self._imageBk = nil  --ImageView
	self._myLevel = nil  --Text
	self._myName = nil  --Text
	self._myPower = nil  --CommonHeroPower
	self._serverName = nil  --Text
	self._shareData = nil
	local resource = {
		file = Path.getCSB("PopupShare", "share"),
		binding = {
			_btnClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
			_btnWeChatTimeLine = {
				events = {{event = "touch", method = "_onBtnWeChatTimeLine"}}
			},
			_btnWeChatSession = {
				events = {{event = "touch", method = "_onBtnWeChatSession"}}
			},
			_btnQQSession = {
				events = {{event = "touch", method = "_onBtnQQSession"}}
			},
			_btnQZone = {
				events = {{event = "touch", method = "_onBtnQZone"}}
			},
		},
	}
	PopupShare.super.ctor(self, resource,true)
end

-- Describle：
function PopupShare:onCreate()
	self._imageMa:ignoreContentAdaptWithSize(true)
	local imageId = math.random(1,#BACKGROUND_IMAGE)
	local imagePath = Path.getShareImage(BACKGROUND_IMAGE[imageId])
	self:updateImageView("_imageBk", imagePath)

	local isDalan = G_ConfigManager:isDalanVersion()
	self._imageLogo:setVisible(not isDalan) --不是大蓝，显示logo

	if G_ConfigManager:getChannel() == "" then
		self._isShowMa = false --是否显示二维码
	else
		self._isShowMa = true
	end
end


function PopupShare:open()
	G_TopLevelNode:addToShareLevel(self)
end



function PopupShare:onEnter()
	self._signalShareResultNotice = G_SignalManager:add(SignalConst.EVENT_SHARE_RESULT_NOTICE, handler(self,self._onEventShareResultNotice))
	self:_initPlayerInfo()
	self:_initShareCode()
end

function PopupShare:onExit()
	self._signalShareResultNotice:remove()
	self._signalShareResultNotice =nil
end

function PopupShare:_onBtnClose()
	-- body
	self:close()

	 --G_SignalManager:dispatch(SignalConst.EVENT_SHARE_RESULT_NOTICE,NativeConst.STATUS_SUCCESS)
	 
end

function PopupShare:_onBtnWeChatTimeLine()
	local shareData =   {scene = NativeConst.SHARE_TYPE_WECHAT_TIMELINE}
	self:_share(shareData)
end

function PopupShare:_onBtnWeChatSession()
	local shareData =  {scene = NativeConst.SHARE_TYPE_WECHAT_SESSION}
	self:_share(shareData)
end

function PopupShare:_onBtnQQSession()
	local shareData = {scene = NativeConst.SHARE_TYPE_QQ_SESSION}
	self:_share(shareData)
end


function PopupShare:_onBtnQZone()
	
	local shareData =   {scene = NativeConst.SHARE_TYPE_QZONE}
	self:_share(shareData)
end

function PopupShare:_share(shareData)

	--NativeConst.SHARE_TYPE_WECHAT_SESSION		= 1	--分享至微信好友
	--NativeConst.SHARE_TYPE_WECHAT_TIMELINE		= 2	--分享至微信朋友圈
	--NativeConst.SHARE_TYPE_WECHAT_FAVORITE		= 3	--分享至微信收藏
	--NativeConst.SHARE_TYPE_QQ_SESSION			= 4	--分享至QQ好友
	--NativeConst.SHARE_TYPE_QZONE				= 5	--分享至QQ空间
	--分享文本至微信朋友圈
	--G_GameAgent:shareText("yoka", NativeConst.SHARE_TYPE_WECHAT_TIMELINE, "测试文本测试文本测试文本测试文本")
	-- 分享web至微信朋友圈
	--G_GameAgent:shareWeb("yoka", NativeConst.SHARE_TYPE_WECHAT_TIMELINE, "http://mjz.sanguosha.com", "标题", "web说明字段测试")
	-- 分享图片至微信朋友圈
	--local FileUtils = cc.FileUtils:getInstance()
	--G_GameAgent:shareImage("yoka", NativeConst.SHARE_TYPE_WECHAT_TIMELINE, FileUtils:getWritablePath()..SHARE_IMG_NAME)

	self._shareData  = shareData
	self:_takePhoto()
end

function PopupShare:_doShare()
	if not self._shareData then
		return 
	end

	logWarn(string.format("PopupShare share scene %d",self._shareData.scene))

	local FileUtils = cc.FileUtils:getInstance()
	G_GameAgent:shareImage("yoka", self._shareData.scene, FileUtils:getWritablePath()..SHARE_IMG_NAME)
	self._shareData = nil
end


--初始化玩家信息
function PopupShare:_initPlayerInfo( ... )
	self._myName:setString(G_UserData:getBase():getName())
	self._myLevel:setString(tostring(G_UserData:getBase():getLevel()))
	self._myPower:updateUI(G_UserData:getBase():getPower())
	self._myPower:hideImage()

	local serverName =  G_UserData:getBase():getServer_name()
	self._serverName:setString(serverName)
end

--分享成功回调
function PopupShare:_onEventShareResultNotice( event,ret)
	-- body
	logWarn("PopupShare _onEventShareResultNotice "..tostring(ret))

	if ret == NativeConst.STATUS_SUCCESS then
        --G_Prompt:showTip(Lang.get("common_share_success"))
		G_UserData:getDailyMission():c2sGameShare()

		--自动关闭
		local action1 = cc.DelayTime:create(1)
		local callFunc = cc.CallFunc:create(function() 
			self:close()
		end)
		local action = cc.Sequence:create(action1,callFunc )
		self:runAction(action)

	elseif ret == NativeConst.STATUS_CANCEL then
		self:_showButtons(true)
	else
		self:_showButtons(true)
	end


end

function PopupShare:_afterCaptured( success, fileName )
	if success then
		logWarn("PopupShare capture successs ")
		self:_doShare()
	else

		self:_showButtons(true)

		logWarn("PopupShare capture fail ")
		G_Prompt:showTip("capture fail")	
	end
end

function PopupShare:_takePhoto(  )
	logWarn("PopupShare takePhoto ")
	-- body
	self:_showButtons(false)

	local FileUtils = cc.FileUtils:getInstance()
	logWarn(FileUtils:getWritablePath())
	cc.utils:captureScreen(handler(self,self._afterCaptured),FileUtils:getWritablePath()..SHARE_IMG_NAME)
	--[[
	local starNode = self
	local fileName = FileUtils:getWritablePath().."/"..SHARE_IMG_NAME
	local image = cc.utils:captureNode(starNode,1)
	local success = image:saveToFile(fileName)
	self:_afterCaptured(success,fileName)
	]]
end


function PopupShare:_showButtons(visible)
	local node = self:getSubNodeByName("Node_share_btn")
	node:setVisible(visible)
	self._imageMa:setVisible(not visible and self._isShowMa)
end

function PopupShare:_initShareCode()
	if not self._isShowMa then
		return
	end

	local nameImage = self:_getCodeResName()
	if nameImage == nil then
		return
	end
	
	local url = "https://mjzipa.sanguosha.com/images/"..nameImage..".png"
	local fullFileName = cc.FileUtils:getInstance():getWritablePath().."userdata/"..nameImage..".png"
	local file, err = io.open(fullFileName)
	if file then
		self._imageMa:loadTexture(fullFileName)
	else
		WebHelper.loadImage(url, fullFileName, function(fileName)
			self._imageMa:loadTexture(fileName)
		end)
	end
end

function PopupShare:_getCodeResName()
	local function findQRCode(channelName, packageName)
		local Config = require("app.config.share_code")
		local len = Config.length()
		for i = 1, len do
			local info = Config.indexOf(i)
			if info.channel == channelName and info.package == packageName then
				return info.QR_code
			end
		end
		return nil
	end

	local channelName = G_ConfigManager:getChannel()
	local packageName = G_NativeAgent:getAppPackage()
	
	local result = findQRCode(channelName, packageName)
	if result == nil then --如果没找到对应的包名，就找默认的
		result = findQRCode(channelName, "default")
	end
	 
	return result
end

return PopupShare