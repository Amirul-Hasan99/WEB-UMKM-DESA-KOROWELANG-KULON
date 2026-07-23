'use client';

import React, { useState } from 'react';
import { MessageSquare, Mail, User, Clock, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import SoftCard from '@/components/SoftCard';

interface FeedbackItem {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 1,
      name: "Ahmad Wijaya",
      email: "ahmad.w@gmail.com",
      message: "Bandeng presto khas Korowelang rasanya juara sekali! Sambalnya pas dan durinya benar-benar lunak.",
      createdAt: "2024-06-10T10:00:00.000Z"
    },
    {
      id: 2,
      name: "Dini Lestari",
      email: "dini.l@yahoo.com",
      message: "Website portal ini sangat membantu saya mencari batik tulis asli Korowelang Kulon langsung dari pengrajinnya.",
      createdAt: "2024-06-12T14:30:00.000Z"
    }
  ]);

  const handleDelete = (id: number) => {
    if (confirm('Hapus saran/feedback ini?')) {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] p-4 md:p-8 flex flex-col md:flex-row gap-6 w-full">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-gray-900">Daftar Feedback Masyarakat</h1>
          <p className="text-xs text-gray-500">Kumpulan aspirasi, saran, dan umpan balik yang dikirimkan warga.</p>
        </div>

        {feedbacks.length === 0 ? (
          <SoftCard className="p-12 text-center text-gray-500 text-sm">
            Belum ada feedback yang diterima dari masyarakat.
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
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-blue-500" />
                        {f.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(f.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => handleDelete(f.id)} className="p-2 rounded-xl soft-button text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed font-medium pt-1">
                  "{f.message}"
                </p>
              </SoftCard>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
