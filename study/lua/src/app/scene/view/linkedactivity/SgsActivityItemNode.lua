
-- Author: �û�����
-- Date:2018-11-05 14:39:21
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SgsActivityItemNode = class("SgsActivityItemNode", ListViewCellBase)


function SgsActivityItemNode:ctor()

	--csb bind var name
	self._imageItem = nil  --ImageView
	self._imageProgress = nil  --ImageView
	self._imageSend = nil  --ImageView
	self._richNode = nil  --SingleNode
	self._textItemName = nil  --Text
	self._textItemNum = nil  --Text
	self._textTaskDes = nil  --Text
	self._imageProgressBg = nil

	local resource = {
		file = Path.getCSB("SgsActivityItemNode", "linkedactivity"),

	}
	SgsActivityItemNode.super.ctor(self, resource)
end

-- Describle：
function SgsActivityItemNode:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

-- Describle：
function SgsActivityItemNode:onEnter()

end

-- Describle：
function SgsActivityItemNode:onExit()

end

function SgsActivityItemNode:updateUI(config)
	local data = G_UserData:getLinkageActivity():getCombineTaskUnitData(config.id)
	local progress = data and data:getParam1() or 0
	local isSend =  data and data:getStatus() == 1 or false
	local isComplete = progress >= config.value

	self._textItemName:setString(config.reward_name)
	self._textItemNum:setString( tostring(config.reward_num) )
	self._textTaskDes:setString( Lang.getTxt(config.mission_description ,{
			num = config.value
		}
	) )

	self._imageItem:loadTexture( Path.getLinkageActivity(config.reward_icon))
	
	local percent = progress/config.value
	if percent > 1 then
		percent = 1
	end
	self._imageProgress:setScaleX(percent)

	self._imageSend:setVisible(isSend )
	self._imageProgress:setVisible(not isSend )
	self._richNode:setVisible(not isSend )
	self._imageProgressBg:setVisible(not isSend )
	

	self:_createProgressRichText(
		Lang.get("linkedactivity_task_progress",{
			progress = progress,
			progressColor = Colors.colorToNumber( isComplete and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO),
			max = config.value,
			maxColor =  Colors.colorToNumber(Colors.BRIGHT_BG_TWO), 
		})
	)
	
end

function SgsActivityItemNode:_createProgressRichText(richText)
	self._richNode:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richText)
    widget:setAnchorPoint(cc.p(0.5,0.5))
    self._richNode:addChild(widget)
end


return SgsActivityItemNode