interface SharedKey{
    id: number;
    uuid: string;
    nfc_reader: NFCReader;
    pair_key: PairKey;
    valid_to: Date;
}