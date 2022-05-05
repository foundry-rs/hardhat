export declare interface AnvilOptions {
    url: string;
    accountKeysPath?: string;
    accounts?: object[];
    allowUnlimitedContractSize?: boolean;
    blockTime?: number;
    debug?: boolean;
    launch?: boolean;
    defaultBalanceEther?: number;
    fork?: string | object;
    forkBlockNumber?: string | number;
    gasLimit?: number;
    gasPrice?: string | number;
    hdPath?: string;
    mnemonic?: string;
    path?: string;
    hostname?: string;
    locked?: boolean;
    logger?: {
        log(msg: string): void;
    };
    networkId?: number;
    port?: number;
    seed?: any;
    time?: any;
    totalAccounts?: number;
    unlockedAccounts?: string[];
    verbose?: boolean;
    vmErrorsOnRPCResponse?: boolean;
    ws?: boolean;
}
export declare class AnvilService {
    static error?: Error;
    static optionValidator: any;
    static getDefaultOptions(): AnvilOptions;
    static create(options: any): Promise<AnvilService>;
    private readonly _server;
    private readonly _options;
    private constructor();
    private _validateAndTransformOptions;
    stopServer(): void;
    private _snakeCase;
}
//# sourceMappingURL=anvil-service.d.ts.map