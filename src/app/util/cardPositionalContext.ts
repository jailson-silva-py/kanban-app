
type UniqueValue = {
    
    isFirst:false,
    isLast:false,
    isUnique:true,
    nextCardId:undefined,
    prevCardId:undefined,
    gapPosition:number,

}

type FirstValue = {
    
    isFirst:true,
    isLast:false,
    isUnique:false,
    nextCardId:string,
    prevCardId:undefined,
    gapPosition:number,

}

type LastValue = {
    
    isFirst:false,
    isLast:true,
    isUnique:false,
    nextCardId:undefined,
    prevCardId:string,
    gapPosition:number,

}

type MiddleValue = {
    isFirst: false;
    isLast: false;
    isUnique: false;
    nextCardId: string;
    prevCardId: string;
    gapPosition: number;
};

type ResultPositionCardObj = FirstValue | UniqueValue | LastValue | MiddleValue
/**
 * Analisa a coluna alvo e determina o contexto posicional de um card 
 * com base nos seus vizinhos imediatos (anterior e posterior).
 * 
 * @param newCardIdsTarget - Lista com os IDs de todos os cards da coluna alvo.
 * @param targetIndex - O índice onde o card alvo está ou irá se posicionar.
 * @returns O objeto contendo as flags de estado (primeiro, último, único) e o espaçamento padrão.
 */
export const calculateCardPositionContext = (newCardIdsTarget: string[] | undefined, targetIndex: number):ResultPositionCardObj  => {

    const prevCardId = newCardIdsTarget?.[targetIndex - 1];
    const nextCardId = newCardIdsTarget?.[targetIndex + 1];

    if (!prevCardId && !nextCardId) {
        return { gapPosition: 100, isFirst: false, isLast: false, isUnique: true, prevCardId: undefined, nextCardId: undefined } as UniqueValue;
    }
    
    if (!prevCardId && nextCardId) {
        return { gapPosition: 100, isFirst: true, isLast: false, isUnique: false, prevCardId: undefined, nextCardId } as FirstValue;
    }
    
    if (prevCardId && !nextCardId) {
        return { gapPosition: 100, isFirst: false, isLast: true, isUnique: false, prevCardId, nextCardId: undefined } as LastValue;
    }

    return { gapPosition: 100, isFirst: false, isLast: false, isUnique: false, prevCardId, nextCardId } as MiddleValue;
    
}
