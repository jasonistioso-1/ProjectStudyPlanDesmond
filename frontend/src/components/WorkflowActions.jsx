import React, { useState } from 'react';
import { ShieldCheck, UserCheck, FileSignature, CheckCircle2, Award } from 'lucide-react';
import { recommendPlan, agreePlan, approvePlan, saveStudyPlan } from '../services/api';

export default function WorkflowActions({
  student,
  currentPlan,
  planUnits,
  onUpdatePlanStatus,
  onOpenCertificate,
  onSavePlan
}) {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureText, setSignatureText] = useState('');
  const [loading, setLoading] = useState(false);

  const status = currentPlan ? currentPlan.status : 'draft';

  const handleRecommend = async () => {
    if (!student || !currentPlan) return;
    try {
      setLoading(true);
      await saveStudyPlan({
        student_id: student.student_id,
        title: currentPlan.title || 'Standard Study Plan',
        status: 'recommended',
        units: planUnits,
        created_by: 'Academic Chair'
      });
      await recommendPlan(currentPlan.plan_id, 'Academic Chair');
      onUpdatePlanStatus('recommended');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAgree = async () => {
    if (!currentPlan || !signatureText) return;
    try {
      setLoading(true);
      await agreePlan(currentPlan.plan_id, signatureText);
      onUpdatePlanStatus('agreed');
      setShowSignatureModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalApprove = async () => {
    if (!currentPlan) return;
    try {
      setLoading(true);
      const res = await approvePlan(currentPlan.plan_id);
      onUpdatePlanStatus('approved');
      if (res.certificate) {
        onOpenCertificate(res.certificate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs font-sans max-w-[1440px] mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            Governance Action Controls
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Stage sequence: Draft → Recommend (Chair) → Agree (Student) → Approve & Certificate (Chair)
          </p>
        </div>

        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
          Current State: {status.toUpperCase()}
        </span>
      </div>

      {/* Contextual Action Flow Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <button
          onClick={onSavePlan}
          disabled={loading}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg shadow-2xs transition-colors"
        >
          Save Plan Draft
        </button>

        <div className="flex items-center gap-3">
          {(status === 'draft' || status === 'recommended') && (
            <button
              onClick={handleRecommend}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <UserCheck className="w-4 h-4" /> Recommend Plan for Student Review
            </button>
          )}

          {status === 'recommended' && (
            <button
              onClick={() => setShowSignatureModal(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <FileSignature className="w-4 h-4" /> Review & Sign Digital Agreement
            </button>
          )}

          {status === 'agreed' && (
            <button
              onClick={handleFinalApprove}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Final Approve & Issue Certificate
            </button>
          )}

          {status === 'approved' && (
            <button
              onClick={() => handleFinalApprove()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <Award className="w-4 h-4" /> View Certificate of Entitlement
            </button>
          )}
        </div>
      </div>

      {/* Digital Signature Confirmation Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-emerald-600" /> Digital Student Agreement Sign-off
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 font-normal">
              I, <strong>{student?.first_name} {student?.last_name}</strong> (Student ID #{student?.student_number}), confirm that I have reviewed the proposed unit sequence and credit load limits.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Type Full Legal Name as Digital Signature:
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder={`${student?.first_name} ${student?.last_name}`}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-semibold"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleStudentAgree}
                disabled={!signatureText}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
              >
                Confirm & Sign Agreement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
