export enum PROOF_DOMAIN {
    DEPOSIT = 1
}

export enum NoteType {
    Fungible = 0
}

export type DepositProofParam = {
    note: Note,
    signedMessage: string,
    address: string,
}


export type BaseProofResult = {
    proof: {
        proof: string,
        verifyInputs: string[]
    },
};


export type DepositProofResult = BaseProofResult & {
    noteFooter: string,
};

export type CreateNoteParam = {
    rho: bigint,
    amount: bigint,
    asset: string,
}

export type Note = CreateNoteParam & {
    note: bigint,
}

export type NoteWithFooter = Note & { footer: bigint }


export class DarkpoolProofError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'DarkpoolProofError'
        Object.setPrototypeOf(this, DarkpoolProofError.prototype)
    }
}

