export const strToInt = (str: string) : number => {
    const res = parseInt(str)
    if(`${res}` !== str) return undefined
    return res 
}

export const roundToNDecPlaces = (x: number, n: number) =>
    Math.round(x*Math.pow(10,n))/Math.pow(10,n)