/**
 * SEPA XML Generator für Lastschrift-Mandate
 * Format: pain.008.001.02 (SEPA Direct Debit Initiation)
 */

export interface SepaPayment {
  mandateId: string;
  mandateDateOfSignature: string;
  amount: number;
  debtorName: string;
  debtorIban: string;
  debtorBic?: string;
  purpose: string;
  endToEndId: string;
}

export interface SepaConfig {
  creditorName: string;
  creditorIban: string;
  creditorBic: string;
  creditorId: string;
  requestedCollectionDate: string;
  sequenceType?: "FRST" | "RCUR" | "FNAL" | "OOFF";
  localInstrumentCode?: "CORE" | "COR1" | "B2B";
}

/**
 * Generate SEPA PAIN.008.001.02 XML for direct debit collection
 */
export function generateSepaXML(
  payments: SepaPayment[],
  config: SepaConfig
): string {
  const now = new Date().toISOString();
  const messageId = `MSG-${Date.now()}`;
  const sequenceType = config.sequenceType ?? "RCUR";
  const localInstrument = config.localInstrumentCode ?? "CORE";

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const xml = `\u003c?xml version="1.0" encoding="UTF-8"?\u003e
\u003cDocument xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\u003e
  \u003cCstmrDrctDbtInitn\u003e
    \u003cGrpHdr\u003e
      \u003cMsgId\u003e${escapeXml(messageId)}\u003c/MsgId\u003e
      \u003cCreDtTm\u003e${now}\u003c/CreDtTm\u003e
      \u003cNbOfTxs\u003e${payments.length}\u003c/NbOfTxs\u003e
      \u003cCtrlSum\u003e${formatAmount(totalAmount)}\u003c/CtrlSum\u003e
      \u003cInitgPty\u003e
        \u003cNm\u003e${escapeXml(config.creditorName)}\u003c/Nm\u003e
      \u003c/InitgPty\u003e
    \u003c/GrpHdr\u003e
    \u003cPmtInf\u003e
      \u003cPmtInfId\u003e${escapeXml(`PMT-${Date.now()}`)}\u003c/PmtInfId\u003e
      \u003cPmtMtd\u003eDD\u003c/PmtMtd\u003e
      \u003cBtchBookg\u003etrue\u003c/BtchBookg\u003e
      \u003cNbOfTxs\u003e${payments.length}\u003c/NbOfTxs\u003e
      \u003cCtrlSum\u003e${formatAmount(totalAmount)}\u003c/CtrlSum\u003e
      \u003cPmtTpInf\u003e
        \u003cSvcLvl\u003e
          \u003cCd\u003eSEPA\u003c/Cd\u003e
        \u003c/SvcLvl\u003e
        \u003cLclInstrm\u003e
          \u003cCd\u003e${localInstrument}\u003c/Cd\u003e
        \u003c/LclInstrm\u003e
        \u003cSeqTp\u003e${sequenceType}\u003c/SeqTp\u003e
      \u003c/PmtTpInf\u003e
      \u003cReqdColltnDt\u003e${config.requestedCollectionDate}\u003c/ReqdColltnDt\u003e
      \u003cCdtr\u003e
        \u003cNm\u003e${escapeXml(config.creditorName)}\u003c/Nm\u003e
      \u003c/Cdtr\u003e
      \u003cCdtrAcct\u003e
        \u003cId\u003e
          \u003cIBAN\u003e${formatIban(config.creditorIban)}\u003c/IBAN\u003e
        \u003c/Id\u003e
      \u003c/CdtrAcct\u003e
      \u003cCdtrAgt\u003e
        \u003cFinInstnId\u003e
          \u003cBIC\u003e${config.creditorBic}\u003c/BIC\u003e
        \u003c/FinInstnId\u003e
      \u003c/CdtrAgt\u003e
      \u003cChrgBr\u003eSLEV\u003c/ChrgBr\u003e
${payments.map((p) => generateTransactionXml(p, config)).join("\n")}
    \u003c/PmtInf\u003e
  \u003c/CstmrDrctDbtInitn\u003e
\u003c/Document\u003e`;

  return xml;
}

function generateTransactionXml(
  payment: SepaPayment,
  config: SepaConfig
): string {
  return `      \u003cDrctDbtTxInf\u003e
        \u003cPmtId\u003e
          \u003cEndToEndId\u003e${escapeXml(payment.endToEndId)}\u003c/EndToEndId\u003e
        \u003c/PmtId\u003e
        \u003cInstdAmt Ccy="EUR"\u003e${formatAmount(payment.amount)}\u003c/InstdAmt\u003e
        \u003cDrctDbtTx\u003e
          \u003cMndtRltdInf\u003e
            \u003cMndtId\u003e${escapeXml(payment.mandateId)}\u003c/MndtId\u003e
            \u003cDtOfSgntr\u003e${payment.mandateDateOfSignature}\u003c/DtOfSgntr\u003e
          \u003c/MndtRltdInf\u003e
          \u003cCdtrSchmeId\u003e
            \u003cId\u003e
              \u003cPrvtId\u003e
                \u003cOthr\u003e
                  \u003cId\u003e${config.creditorId}\u003c/Id\u003e
                \u003c/Othr\u003e
              \u003c/PrvtId\u003e
            \u003c/Id\u003e
          \u003c/CdtrSchmeId\u003e
        \u003c/DrctDbtTx\u003e
        \u003cDbtrAgt\u003e
          \u003cFinInstnId\u003e
            ${payment.debtorBic ? `\u003cBIC\u003e${payment.debtorBic}\u003c/BIC\u003e` : "\u003cOthr\u003e\u003cId\u003eNOTPROVIDED\u003c/Id\u003e\u003c/Othr\u003e"}
          \u003c/FinInstnId\u003e
        \u003c/DbtrAgt\u003e
        \u003cDbtr\u003e
          \u003cNm\u003e${escapeXml(payment.debtorName)}\u003c/Nm\u003e
        \u003c/Dbtr\u003e
        \u003cDbtrAcct\u003e
          \u003cId\u003e
            \u003cIBAN\u003e${formatIban(payment.debtorIban)}\u003c/IBAN\u003e
          \u003c/Id\u003e
        \u003c/DbtrAcct\u003e
        \u003cRmtInf\u003e
          \u003cUstrd\u003e${escapeXml(payment.purpose)}\u003c/Ustrd\u003e
        \u003c/RmtInf\u003e
      \u003c/DrctDbtTxInf\u003e`;
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

function formatIban(iban: string): string {
  // Remove spaces and convert to uppercase
  return iban.replace(/\s/g, "").toUpperCase();
}

function escapeXml(text: string): string {
  return text
    .replace(/\u0026/g, "\u0026amp;")
    .replace(/\u003c/g, "\u0026lt;")
    .replace(/\u003e/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;")
    .replace(/'/g, "\u0026apos;");
}

/**
 * Validate SEPA mandate reference
 * Must be unique and max 35 characters
 */
export function validateMandateId(mandateId: string): boolean {
  return mandateId.length > 0 && mandateId.length <= 35;
}

/**
 * Validate IBAN format (basic check)
 */
export function validateIban(iban: string): boolean {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(clean)) {
    return false;
  }
  // Could add IBAN check digit validation here
  return true;
}

/**
 * Generate unique mandate reference
 */
export function generateMandateId(
  clubPrefix: string,
  memberId: string,
  date: Date = new Date()
): string {
  const timestamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const mandateId = `${clubPrefix}-${memberId}-${timestamp}`;
  // Ensure max 35 chars
  return mandateId.slice(0, 35);
}

/**
 * Generate end-to-end ID for transaction
 */
export function generateEndToEndId(
  clubPrefix: string,
  memberId: string,
  date: Date = new Date()
): string {
  const timestamp = date.toISOString().slice(0, 19).replace(/[-T:]/g, "");
  const id = `${clubPrefix}-${memberId}-${timestamp}`;
  return id.slice(0, 35);
}
