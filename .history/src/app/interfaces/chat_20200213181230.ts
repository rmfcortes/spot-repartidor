export interface UnreadMsg {
    idPedido: string;
    cantidad: number;
    nombreCliente: string;
}

export interface Mensaje {
    isMe: boolean;
    createdAt: number;
    msg: string;
}
