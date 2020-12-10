local clazz = class('clazz')

function clazz:ctor()
    self.a= 1;
end

function clazz:foo()
    print('foo')
    local main = require('main')
end

return clazz