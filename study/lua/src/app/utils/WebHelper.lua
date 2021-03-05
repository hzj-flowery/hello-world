local WebHelper = {}

function WebHelper.loadImage(url, fullFileName, callback)
    local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    xhr.fullFileName = fullFileName
    xhr:open("GET", url)

    local function onReadyStateChanged()
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            print(" ---> img net load get statusText : " , xhr.response )
            local fileData = xhr.response
            local fullFileName = xhr.fullFileName
        	local file = io.open(fullFileName,"wb")
	        file:write(fileData)
        	file:close()
        	if callback then
                callback(fullFileName)
            end
        else
            print(" --- > error xhr.readyState is:", xhr.readyState, "xhr.status is: ",xhr.status)
        end
        xhr:unregisterScriptHandler()
    end

    xhr:registerScriptHandler(onReadyStateChanged)
    xhr:send()
end

return WebHelper