'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, User, Clock, Trash2, RotateCw } from '@/components/Icons';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';
import SoftButton from '@/components/SoftButton';
import { fetchAdminFeedbacks, deleteAdminFeedback } from '@/lib/api';
import { Feedback } from '@/lib/types';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const loadFeedbacks = async () => {
    setLoading(true);
    const data = await fetchAdminFeedbacks();
    setFeedbacks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!confirm('Hapus saran/feedback ini dari database?')) return;

    setDeletingId(id);
    const res = await deleteAdminFeedback(id);
    setDeletingId(null);

    if (res.success) {
      setFeedbacks((prev) => prev.filter((f) => String(f.id) !== String(id)));
    } else {
      alert(res.error || 'Gagal menghapus feedback.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-gray-900">Daftar Feedback Masyarakat</h1>
            <p className="text-xs text-gray-500">
              Kumpulan aspirasi, kritik, dan saran yang dikirimkan warga via formulir feedback publik.
            </p>
          </div>

          <SoftButton
            variant="default"
            size="sm"
            onClick={loadFeedbacks}
            icon={<RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Segarkan Data
          </SoftButton>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl soft-card bg-gray-200/60 animate-pulse" />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <SoftCard className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-700 text-base">Belum Ada Feedback Masuk</h3>
            <p className="text-xs text-gray-500 max-w-sm">
              Saran atau masukan yang dikirimkan oleh pengunjung melalui halaman &quot;Feedback&quot; akan otomatis muncul di sini.
            </p>
          </SoftCard>
        ) : (
          <div className="flex flex-col gap-4">
            {feedbacks.map((f) => (
              <SoftCard key={f.id} className="p-6 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-900 text-base">{f.name}</span>
                      {f.email ? (
                        <a
                          href={`mailto:${f.email}`}
                          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-blue-500" />
                          {f.email}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Email tidak dicantumkan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(f.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => handleDelete(f.id)}
                      disabled={deletingId === f.id}
                      className="p-2 rounded-xl soft-button text-red-500 hover:bg-red-50 disabled:opacity-50"
                      title="Hapus Feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed font-medium pt-1 whitespace-pre-wrap">
                  &ldquo;{f.message}&rdquo;
                </p>
              </SoftCard>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
