"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HITLManager = void 0;
// Human-in-the-Loop Manager
const uuid_1 = require("uuid");
const types_1 = require("./types");
class HITLManager {
    config;
    pendingRequests = new Map();
    notificationCallback;
    constructor(config = {}) {
        this.config = types_1.ApprovalConfigSchema.parse(config);
    }
    // Set callback for notifications (Telegram, Slack, etc.)
    setNotificationCallback(callback) {
        this.notificationCallback = callback;
    }
    async requestApproval(action, context) {
        // Check if auto-approve
        if (action.risk === 'low' && this.config.autoApproveLowRisk) {
            return this.autoApprove(action, context);
        }
        if (action.risk === 'medium' && this.config.autoApproveMediumRisk) {
            return this.autoApprove(action, context);
        }
        if (action.risk === 'high' && !this.config.requireApprovalHighRisk) {
            return this.autoApprove(action, context);
        }
        // Create approval request
        const request = {
            id: (0, uuid_1.v4)(),
            agentId: 'unknown', // Would be set by orchestrator
            action,
            rationale: this.generateRationale(action, context),
            context,
            status: 'pending',
            requestedAt: new Date(),
        };
        // Store pending request
        this.pendingRequests.set(request.id, request);
        // Notify human
        if (this.notificationCallback) {
            await this.notificationCallback(request);
        }
        // TODO: Set up timeout to auto-reject
        return request;
    }
    async getApprovalStatus(requestId) {
        return this.pendingRequests.get(requestId) || null;
    }
    async approve(requestId, response) {
        const request = this.pendingRequests.get(requestId);
        if (!request) {
            throw new Error(`Approval request ${requestId} not found`);
        }
        request.status = 'approved';
        request.respondedAt = new Date();
        request.response = response || 'Approved';
        request.respondedBy = 'human';
        this.pendingRequests.set(requestId, request);
    }
    async reject(requestId, reason) {
        const request = this.pendingRequests.get(requestId);
        if (!request) {
            throw new Error(`Approval request ${requestId} not found`);
        }
        request.status = 'rejected';
        request.respondedAt = new Date();
        request.response = reason;
        request.respondedBy = 'human';
        this.pendingRequests.set(requestId, request);
    }
    async autoApprove(action, context) {
        const request = {
            id: (0, uuid_1.v4)(),
            agentId: 'system',
            action,
            rationale: this.generateRationale(action, context),
            context,
            status: 'approved',
            requestedAt: new Date(),
            respondedAt: new Date(),
            response: 'Auto-approved (low risk)',
            respondedBy: 'system',
        };
        return request;
    }
    generateRationale(action, context) {
        return `Agent wants to execute ${action.type} action. ${context ? `Context: ${JSON.stringify(context)}` : ''}`;
    }
}
exports.HITLManager = HITLManager;
//# sourceMappingURL=manager.js.map