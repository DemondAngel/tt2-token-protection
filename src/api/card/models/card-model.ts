interface Card {
    id: number;
    uuid: string;
    transactions: any [] | undefined | null;
    nfc_reader: NFCReader| undefined | null;
}