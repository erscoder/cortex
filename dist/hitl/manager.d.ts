import { HumanInTheLoop, ApprovalRequest, ApprovalConfig } from './types';
export declare class HITLManager implements HumanInTheLoop {
    private config;
    private pendingRequests;
    private notificationCallback?;
    constructor(config?: Partial<ApprovalConfig>);
    setNotificationCallback(callback: (request: ApprovalRequest) => Promise<void>): void;
    requestApproval(action: {
        type: string;
        payload: unknown;
        risk: 'low' | 'medium' | 'high';
    }, context?: Record<string, unknown>): Promise<ApprovalRequest>;
    getApprovalStatus(requestId: string): Promise<ApprovalRequest | null>;
    approve(requestId: string, response?: string): Promise<void>;
    reject(requestId: string, reason: string): Promise<void>;
    private autoApprove;
    private generateRationale;
}
//# sourceMappingURL=manager.d.ts.map