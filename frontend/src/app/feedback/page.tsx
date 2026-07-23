'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, User, Mail, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SoftCard from '@/components/SoftCard';
import SoftInput from '@/components/SoftInput';
import SoftButton from '@/components/SoftButton';
import { sendFeedback } from '@/lib/api';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMsg('Semua kolom (Nama, Email, dan Isi Feedback) wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await sendFeedback(name, email, message);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setErrorMsg(res.message || 'Gagal mengirim feedback. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 w-full py-12 flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full soft-card-sm text-xs font-bold text-blue-600">
            <MessageSquare className="w-4 h-4" />
            Layanan Feedback Masyarakat
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Kirim Saran & Feedback Anda
          </h1>
          <p className="text-sm text-gray-600 font-medium max-w-lg">
            Sampaikan masukan, apresiasi, atau usulan pengembangan portal UMKM Korowelang Kulon secara langsung kepada pengelola desa.
          </p>
        </div>

        {/* Form Card */}
        <SoftCard className="p-8">
          {submitted ? (
            <div className="py-8 flex flex-col items-center text-center gap-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center soft-card-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-800">Feedback Berhasil Terkirim!</h3>
              <p className="text-sm text-gray-600 max-w-md">
                Terima kasih atas partisipasi dan saran yang Anda berikan. Masukan Anda sangat berharga bagi kemajuan UMKM Desa Korowelang Kulon.
              </p>
              <SoftButton variant="primary" className="mt-2" onClick={() => setSubmitted(false)}>
                Kirim Feedback Lainnya
              </SoftButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SoftInput
                  label="Nama Lengkap"
                  placeholder="Masukkan nama Anda..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  required
                />
                <SoftInput
                  label="Alamat Email"
                  type="email"
                  placeholder="contoh@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wide uppercase text-gray-500 ml-1">
                  Isi Feedback / Pesan
                </label>
                <div className="relative">
                  <textarea
                    rows={5}
                    className="soft-input w-full p-4 text-sm text-gray-800 rounded-2xl transition-all duration-200 placeholder-gray-400"
                    placeholder="Tuliskan masukan atau saran Anda di sini..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
              </div>

              <SoftButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={loading}
                icon={<Send className="w-5 h-5" />}
              >
                {loading ? 'Mengirim...' : 'Kirim Feedback Sekarang'}
              </SoftButton>

            </form>
          )}
        </SoftCard>

      </main>

      <Footer />
    </div>
  );
}
