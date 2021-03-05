export var handler = (function (caller, handler: Function, ...args: any[]) {
    if(args != null&&args.length>0)
    {
        return handler.bind(caller, args);
    }
    else
    {
        return handler.bind(caller);
    }
})

export function StringUcfirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ArraySort(array:any[], sortFunc: (a, b) => boolean) {
    array && array.sort((a, b) => {
        return sortFunc(a, b) ? -1: 1;
    })
}
