local PopupBase = require("app.ui.PopupBase")
local PopupFlipCard=class("PopupFlipCard",PopupBase)

local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local DEALY_AUTO_CLOSE = 2

function PopupFlipCard:ctor(closeCallFunc)
	--
	self._filpCard1 = nil
	self._filpCard2 = nil
	self._filpCard3 = nil
	self._panelRewardDesc = nil

	self._closeCallFunc = closeCallFunc
	self._textDesc = nil 
	self._itemName = nil
	self._itemNum = nil
	self._cardsList = {}
	self._nodeContinue = nil
	self._nodeCardDesc = nil --文本描述节点
	self._awardList = nil
	local resource = {
		file = Path.getCSB("PopupFlipCard", "common"),
		binding = {
		
		}
	}
	PopupFlipCard.super.ctor(self, resource, false)
end


function PopupFlipCard:onCreate( ... )
	self._cardsList = {}
	for i =1, 3 do 
		local card = self["_filpCard"..i]
		if card then
			card:setCallBack(handler(self,self._onCardClickFunc),handler(self,self._onCardFlipFinish))
			card:setCardId(i)
			table.insert(self._cardsList, card)
		end

	end


	local richText = ccui.RichText:create()
	richText:setRichTextWithJson(Lang.get("card_flip_desc_1"))
	self._nodeCardDesc:addChild(richText)

	--self._richTextDesc:setPosition(320,276)

end

function PopupFlipCard:updateUI(awardList)
	self._awardList = awardList
	self:_doStartAnis()
end


function PopupFlipCard:_doStartAnis()
	local card = nil
	for i=1, #self._cardsList do
		card = self._cardsList[i]
		card:setScale(0)
		local action = cc.ScaleTo:create(0.3,1)
		local ease = cc.EaseBackOut:create(action)
		local seq = cc.Sequence:create(cc.DelayTime:create(0.1*(i-1)),cc.CallFunc:create(function(node)
			node:setVisible(true)
		end),ease)
		card:runAction(seq)
	end
end

function PopupFlipCard:_onCardFlipFinish(id,isFliped,card)

	local scheduler = require("cocos.framework.scheduler")


	if(isFliped == true and id == self._awardIndexId)then
		self:_showOthers(id)
		local params = card:getItemParams()
		local awardName = ""
		if(params ~= nil)then
			awardName = params.cfg.name.."x"..tostring(params.size)
		end
		local qualityColor = params.icon_color
		local outlineColor = params.icon_color_outline
		
		self._nodeCardDesc:removeAllChildren()

		local richText = ccui.RichText:create()
		richText:setRichTextWithJson(Lang.get("card_flip_desc_1"))
		self._nodeCardDesc:addChild(richText)
	
		richText:setRichTextWithJson(Lang.get("card_flip_desc_2",{
			name = awardName,
			color = Colors.colorToNumber(qualityColor),
			outlineColor = Colors.colorToNumber(outlineColor),
			}))
		

		local delay = cc.DelayTime:create(DEALY_AUTO_CLOSE)
		local sequence = cc.Sequence:create(delay, cc.CallFunc:create(function()
			if self._closeCallFunc and type(self._closeCallFunc) == "function" then
				self._closeCallFunc()
			end
			self:close()
		end))

		self:runAction(sequence)


	end
end

function PopupFlipCard:_onCardClickFunc(card,isFliped)
	-- body
	if(card ~= nil and self._awardList~=nil and #self._awardList>0)then
		self._awardIndexId = card:getCardId()
		card:updateUI(self._awardList[1])
	end

	if(isFliped==true)then
		self:_setEnabledCardTouch(false)
	end

	for i=1,#self._cardsList do
		card=self._cardsList[i]
		card:breathGlow(false)
	end
end

function PopupFlipCard:_setEnabledCardTouch(bool)
	local card=nil
	for i=1,#self._cardsList do
		card=self._cardsList[i]
		card:setCardFlipEnabled(bool)
	end
end



--其他的卡牌也打开
function PopupFlipCard:_showOthers(except_id)
	local card = nil
	local otherStart = 2
	for i=1,#self._cardsList do
		card = self._cardsList[i]
		card:setCardFlipEnabled(false)
		local id = card:getCardId()
		if(id ~= except_id)then
			card:doFlip(true)
			if(otherStart <= #self._awardList)then
				card:updateUI(self._awardList[otherStart])
			end
			otherStart = otherStart+1
		end
	end
end

function PopupFlipCard:onEnter( )

end

function PopupFlipCard:onExit( )
	self._onCloseFunc=nil
end

return PopupFlipCard