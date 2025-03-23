interface NFCReader {
    id: number;
    uuid: string;
    user_name: string;
    pass: string;
    transactions: any[]; //De momento
    cards: Card[] | undefined | null;
    shared_key: SharedKey | null | undefined;
}