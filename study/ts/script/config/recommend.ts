export namespace recommend {
    let funcs = [
        function (level: number): number {
            return 0;
        },
        function (level: number): number {
            return level*1;
        },
        function (level: number): number {
            return (level+5)/10;
        },
        function (level: number): number {
            return level-50;
        },
        function (level: number): number {
            return level*2;
        },
        function (level: number): number {
            return level/4;
        },
        function (level: number): number {
            return level/2;
        },
        function (level: number): number {
            return level*120/1000;
        },
        function (level: number): number {
            return level/2;
        }
    ]

    export function getFuncs(id: number) {
        return funcs[id];
    }
}