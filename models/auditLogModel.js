import pool from '../db/index.js'

export const createAuditLog = async ({
    actorId,
    action,
    entityType,
    entityId = null,
    metadata = {},
}) => {
    return pool.query(
        `INSERT INTO audit_logs
        (
            actor_id,
            action,
            entity_type,
            entity_id,
            metadata
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
            actorId,
            action,
            entityType,
            entityId,
            JSON.stringify(metadata),
        ]
    )
}