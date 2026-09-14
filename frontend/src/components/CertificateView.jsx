import React from 'react';
import CertificateModal from './CertificateModal';

export default function CertificateView({ certificate, onClose }) {
  return <CertificateModal certificate={certificate} onClose={onClose} />;
}
