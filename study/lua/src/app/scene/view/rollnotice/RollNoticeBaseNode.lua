
local RollNoticeHelper = require("app.scene.view.rollnotice.RollNoticeHelper")

local RollNoticeBaseNode = class("RollNoticeBaseNode", function ()
	return display.newNode()
end)

function RollNoticeBaseNode:ctor(rollMsg)
	self._rollMsg = rollMsg
	self:setCascadeOpacityEnabled(true)
	-- 富文本
    local richTxt = RollNoticeHelper.makeRichMsgFromServerRollMsg(rollMsg)
	local richText = ccui.RichText:createWithContent(richTxt)
	richText:setCascadeOpacityEnabled(true)
	richText:formatText()
	local richTextSize = richText:getVirtualRendererSize()
	self:addChild(richText)
	self:setContentSize(richTextSize)
	richText:setPosition(richTextSize.width * 0.5,richTextSize.height * 0.5)
end

function RollNoticeBaseNode:run(containSize)
	local conSize = self:getContentSize()
	local y = containSize.height * 0.5
	local targetPos = cc.p(0-conSize.width/2-50,y)
	local fromPos = cc.p(containSize.width + conSize.width/2 + 50,y)
	self:setAnchorPoint(cc.p(0.5,0.5))
	self:setPosition(fromPos.x, fromPos.y)
	local duration = math.abs(targetPos.x - fromPos.x)/640*4
	local moveAction = cc.MoveTo:create(duration,targetPos)

	self:setVisible(false)
	self:runAction(cc.Sequence:create(
		-- 随机延迟
		cc.Show:create(),
		moveAction,
		cc.CallFunc:create(function(node)
			print("remove from root_node -------------------------------------")
			G_SignalManager:dispatch(SignalConst.EVENT_SUBTITLES_RUN_END,self._rollMsg,node)
		end),
		cc.RemoveSelf:create()
	))
end

return RollNoticeBaseNode

