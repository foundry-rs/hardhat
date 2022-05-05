"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnvilServer = void 0;
const child_process_1 = require("child_process");
const debug_1 = __importDefault(require("debug"));
const log = (0, debug_1.default)("hardhat:plugin:anvil-service::spawn");
class AnvilServer {
    constructor(options, anvil) {
        this._options = options;
        this._anvil = anvil;
    }
    static launch(options) {
        var _a;
        log("Launching anvil");
        let anvil;
        if (options.launch) {
            const anvilPath = (_a = options.path) !== null && _a !== void 0 ? _a : "anvil";
            // TODO transform options to args
            anvil = (0, child_process_1.spawn)(anvilPath);
            anvil.stdout.on("data", (data) => {
                console.log(`${data}`);
            });
            anvil.stderr.on("data", (data) => {
                console.error(`${data}`);
            });
            anvil.on("close", (code) => {
                log(`anvil child process exited with code ${code}`);
            });
            process.on('exit', function () {
                anvil.kill();
            });
        }
        return new AnvilServer(options, anvil);
    }
    kill() {
        var _a;
        (_a = this._anvil) === null || _a === void 0 ? void 0 : _a.kill();
    }
}
exports.AnvilServer = AnvilServer;
//# sourceMappingURL=anvil-server.js.map