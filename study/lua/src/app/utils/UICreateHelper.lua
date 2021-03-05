local UICreateHelper = {}

function UICreateHelper.showRedPoint(node,show,posPercent)
    if show then
        local redImg = node:getChildByName("redPoint")
        if not redImg then
            local UIHelper  = require("yoka.utils.UIHelper")
            redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint") })
            redImg:setName("redPoint")
            node:addChild(redImg)
            if posPercent then
                 UIHelper.setPosByPercent(redImg, posPercent)
            end
           
        end
        redImg:setVisible(true)
    else
        local redImg = node:getChildByName("redPoint")
        if redImg then
            redImg:setVisible(false)
        end
    end
   
end


function UICreateHelper.createItem()

end

return UICreateHelper