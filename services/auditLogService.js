import * as AuditLogModel from '../models/auditLogModel.js'

export const logAction = async ({
    actorId,
    action,
    entityType,
    entityId,
    metadata,
}) => {
    try {
        await AuditLogModel.createAuditLog({
            actorId,
            action,
            entityType,
            entityId,
            metadata,
        })
    } catch (err) {
        console.error('Audit log failed:', err.message)
    }
}