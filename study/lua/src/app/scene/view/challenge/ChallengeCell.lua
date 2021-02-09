local ListViewCellBase = require("app.ui.ListViewCellBase")
local ChallengeCell = class("ChallengeCell", ListViewCellBase)
local RedPointHelper = require("app.data.RedPointHelper")
local Path = require("app.utils.Path")
local FunctionConst	= require("app.const.FunctionConst")

-- 用function_id
function ChallengeCell:ctor(functionId, functionInfo)
    self._functionId = functionId
    self._functionInfo = functionInfo
    dump(self._functionInfo)
    self._open = false          --是否开放

    --ui
    self._imageChallenge = nil      --底图
    self._imageName = nil           --名字
    self._textDesc = nil            --小描述
    self._imageCover = nil          --黑色遮罩
    self._textTip = nil             --等级提示
    self._imageRedPoint = nil       --红点
    
	local resource = {
		file = Path.getCSB("ChallengeCell", "challenge"),
		binding = {
            _imageChallenge = {
				events = {{event = "touch", method = "_onChallengeClick"}}
			},
		}
	}
    self:setName("ChallengeCell_"..self._functionId)
	ChallengeCell.super.ctor(self, resource)
end

function ChallengeCell:onCreate()
    local size = self._panelBase:getContentSize()
    self:setContentSize(size)
    self._panelBase:setSwallowTouches(false)
    self._imageChallenge:setSwallowTouches(false)

    local ChallengeRes = require("app.scene.view.challenge.ChallengeRes")
    local res = ChallengeRes[self._functionId]
    assert(res, "no function id, "..self._functionId)
    local icon = Path.getChallengeIcon(res.icon)
    local iconMask = Path.getChallengeIcon(res.iconMask)
    local imgName = Path.getChallengeText(res.imgName)
    self._imageChallenge:loadTexture(icon)
    self._textDesc:setString(res.text)
    self._textDesc:setColor(res.textColor)
    self._imageName:ignoreContentAdaptWithSize(true)
    self._imageName:loadTexture(imgName)
    if G_UserData:getBase():getLevel() < self._functionInfo.level then
        self._imageCover:setVisible(true)
        self._open = false
        self._imageCover:loadTexture(iconMask)
        self._textTip:setString(Lang.get("challenge_open", {count = self._functionInfo.level}))
    else 
        self._imageCover:setVisible(false)
        self._open = true
    end
    self:refreshRedPoint()
end

function ChallengeCell:_onChallengeClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        self:goToScene()
	end
end

function ChallengeCell:goToScene()
    if not self._open then
        G_Prompt:showTip(self._functionInfo.comment)
    else
        if self._functionId == FunctionConst.FUNC_PVE_TOWER then 
            G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK, 
                FunctionConst.FUNC_PVE_TOWER,{attackOnce = true}
            )
            G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK, 
                FunctionConst.FUNC_PVE_TOWER,{fullCount = true}
            )
        end
        local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
        WayFuncDataHelper.gotoModuleByFuncId(self._functionId)
    end
end

function ChallengeCell:showRedPoint(value)
    if value == nil then
        value = false
    end
    self._imageRedPoint:setVisible(value)
end


function ChallengeCell:refreshRedPoint()
    local redPoint = RedPointHelper.isModuleReach( self._functionId )
    self:showRedPoint(redPoint)
end


return ChallengeCell