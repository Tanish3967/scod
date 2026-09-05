export type SignerLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja';

export interface LocalizationStrings {
  guidedSigning: string;
  nextField: string;
  fieldRequired: string;
  finishSigning: string;
  signerAiSummary: string;
  signatureRequired: string;
  adoptAndSign: string;
  drawSignature: string;
  typeSignature: string;
  uploadSignature: string;
  legalConsentNotice: string;
  agreeAndContinue: string;
  certificateOfCompletion: string;
  auditTrailVerified: string;
}

export const SIGNER_LOCALIZATION: Record<SignerLanguage, LocalizationStrings> = {
  en: {
    guidedSigning: 'Guided Signing Session',
    nextField: 'Next Required Field',
    fieldRequired: 'Field Required to Complete',
    finishSigning: 'Finish Signing',
    signerAiSummary: 'Signer AI Plain-English Summary',
    signatureRequired: 'Click to Sign Here',
    adoptAndSign: 'Adopt & Apply Signature',
    drawSignature: 'Draw Canvas',
    typeSignature: 'Calligraphic Type',
    uploadSignature: 'Upload Image',
    legalConsentNotice: 'By signing, you agree that this electronic signature is legally binding under the ESIGN Act and eIDAS Regulation.',
    agreeAndContinue: 'I Agree & Continue',
    certificateOfCompletion: 'Certificate of Completion',
    auditTrailVerified: 'Cryptographic SHA-256 Audit Trail Verified'
  },
  es: {
    guidedSigning: 'Sesión de Firma Guiada',
    nextField: 'Siguiente Campo Requerido',
    fieldRequired: 'Campo Obligatorio',
    finishSigning: 'Finalizar Firma',
    signerAiSummary: 'Resumen en Lenguaje Sencillo (IA)',
    signatureRequired: 'Haga clic para firmar aquí',
    adoptAndSign: 'Adoptar y Aplicar Firma',
    drawSignature: 'Dibujar Firma',
    typeSignature: 'Escribir Tipografía',
    uploadSignature: 'Subir Imagen',
    legalConsentNotice: 'Al firmar, acepta que esta firma electrónica es legalmente vinculante conforme a la ley ESIGN y el reglamento eIDAS.',
    agreeAndContinue: 'Acepto y Continuar',
    certificateOfCompletion: 'Certificado de Finalización',
    auditTrailVerified: 'Pista de Auditoría Criptográfica SHA-256 Verificada'
  },
  fr: {
    guidedSigning: 'Session de Signature Guidée',
    nextField: 'Champ Suivant Obligatoire',
    fieldRequired: 'Champ Requis',
    finishSigning: 'Terminer la Signature',
    signerAiSummary: 'Résumé IA en Français Clair',
    signatureRequired: 'Cliquez pour Signer Ici',
    adoptAndSign: 'Adopter et Appliquer la Signature',
    drawSignature: 'Dessiner',
    typeSignature: 'Écrire (Calligraphie)',
    uploadSignature: 'Télécharger une Image',
    legalConsentNotice: 'En signant, vous acceptez que cette signature électronique ait force obligatoire selon le règlement eIDAS.',
    agreeAndContinue: 'J’accepte et Continuer',
    certificateOfCompletion: 'Certificat d’Achèvement',
    auditTrailVerified: 'Piste d’Audit Cryptographique SHA-256 Vérifiée'
  },
  de: {
    guidedSigning: 'Geführte Signatursitzung',
    nextField: 'Nächstes Pflichtfeld',
    fieldRequired: 'Erforderliches Feld',
    finishSigning: 'Signatur Abschließen',
    signerAiSummary: 'KI-Zusammenfassung in Klartext',
    signatureRequired: 'Hier Unterschreiben',
    adoptAndSign: 'Unterschrift Übernehmen',
    drawSignature: 'Zeichnen',
    typeSignature: 'Tippen (Schriftarten)',
    uploadSignature: 'Bild Hochladen',
    legalConsentNotice: 'Mit Ihrer Unterschrift erkennen Sie die Rechtsgültigkeit dieser elektronischen Signatur gemäß eIDAS an.',
    agreeAndContinue: 'Zustimmen & Weiter',
    certificateOfCompletion: 'Abschlusszertifikat',
    auditTrailVerified: 'Kryptografischer SHA-256 Prüfpfad Verifiziert'
  },
  ja: {
    guidedSigning: 'ガイド付き署名セッション',
    nextField: '次の必須項目へ',
    fieldRequired: '必須項目です',
    finishSigning: '署名を完了する',
    signerAiSummary: 'AIによる要約・解説',
    signatureRequired: 'ここをクリックして署名',
    adoptAndSign: '署名を適用する',
    drawSignature: '手書き入力',
    typeSignature: 'フォント入力',
    uploadSignature: '画像をアップロード',
    legalConsentNotice: '署名することにより、電子署名法および国際規制に基づく法的拘束力に同意したことになります。',
    agreeAndContinue: '同意して続行',
    certificateOfCompletion: '完了証明書',
    auditTrailVerified: 'SHA-256 暗号監査証跡 検証済み'
  }
};
