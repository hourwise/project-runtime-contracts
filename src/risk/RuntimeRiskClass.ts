import { z } from "zod";

/**
 * Shared risk classes for operations, capabilities, and runtime declarations.
 *
 * A risk class is a portable declaration for consumers to interpret. It does
 * not perform approval, enforcement, or policy evaluation.
 */
export enum RuntimeRiskClass {
  ReadOnly = "READ_ONLY",
  InternalWrite = "INTERNAL_WRITE",
  ExternalSend = "EXTERNAL_SEND",
  Delete = "DELETE",
  Payment = "PAYMENT",
  Deployment = "DEPLOYMENT",
  PermissionChange = "PERMISSION_CHANGE",
  CredentialAccess = "CREDENTIAL_ACCESS",
  NetworkEgress = "NETWORK_EGRESS",
  SkillInstall = "SKILL_INSTALL",
  ModelProviderChange = "MODEL_PROVIDER_CHANGE",
  Unknown = "UNKNOWN",
}

/** Zod schema for serialized runtime risk-class values. */
export const RuntimeRiskClassSchema = z.enum([
  RuntimeRiskClass.ReadOnly,
  RuntimeRiskClass.InternalWrite,
  RuntimeRiskClass.ExternalSend,
  RuntimeRiskClass.Delete,
  RuntimeRiskClass.Payment,
  RuntimeRiskClass.Deployment,
  RuntimeRiskClass.PermissionChange,
  RuntimeRiskClass.CredentialAccess,
  RuntimeRiskClass.NetworkEgress,
  RuntimeRiskClass.SkillInstall,
  RuntimeRiskClass.ModelProviderChange,
  RuntimeRiskClass.Unknown,
]);

