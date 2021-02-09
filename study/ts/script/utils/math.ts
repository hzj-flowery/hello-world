export const mathRandom = (minNum: number, maxNum?: number) => {
    if (maxNum) {
        return (Math.random() * (maxNum - minNum + 1) + minNum);
    } else {
        return (Math.random() * minNum + 1);
    }
} 