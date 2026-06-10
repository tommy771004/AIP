import React, { useEffect, useState } from 'react';

interface OpsNote {
  id: string;
  text: string;
  createdAt: string;
  pinned: boolean;
}

const STORAGE_KEY = 'aerosafe-ops-notes';

const NOTE_TINTS = ['bg-[#fff9d9]', 'bg-[#ffe9ef]', 'bg-[#e3f4ff]', 'bg-[#e9fbe9]', 'bg-[#f3e9ff]'];

function loadNotes(): OpsNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function OpsNotebook() {
  const [notes, setNotes] = useState<OpsNote[]>(loadNotes);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // localStorage 滿/被停用時略過，記事僅留在記憶體
    }
  }, [notes]);

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    setNotes((current) => [
      { id: crypto.randomUUID(), text, createdAt: new Date().toISOString(), pinned: false },
      ...current,
    ]);
    setDraft('');
  }

  function togglePin(id: string) {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)));
  }

  function removeNote(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  const sorted = [...notes].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
    return right.createdAt.localeCompare(left.createdAt);
  });

  return (
    <div id="ops-notebook-view" className="grid-paper w-full rounded-2xl border-2 border-[#d4e6f4] p-6 shadow-[0_6px_24px_rgba(160,196,255,0.18)] md:p-10">
      <header className="mb-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-secondary">Operations Notebook</div>
        <h1 className="mt-1 text-3xl font-black text-on-surface md:text-4xl">值班作業簿</h1>
        <p className="mt-2 text-sm font-medium text-slate-400">
          記事保存在這台裝置的瀏覽器（localStorage），不會上傳。
        </p>
      </header>

      {/* 新增記事 */}
      <div className="mb-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) addNote();
          }}
          rows={2}
          placeholder="記下值班備註、交接事項…（Ctrl+Enter 送出）"
          className="flex-1 resize-none rounded-xl border-2 border-[#c9e4f6] bg-white/90 px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors placeholder:text-slate-300 focus:border-secondary"
        />
        <button
          onClick={addNote}
          disabled={!draft.trim()}
          className="shrink-0 self-end rounded-xl bg-secondary px-6 py-3 text-sm font-black text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40 sm:self-stretch"
        >
          貼上便籤
        </button>
      </div>

      {/* 便利貼牆 */}
      {sorted.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border-2 border-dashed border-[#c9e4f6] bg-white/50 text-sm font-bold text-slate-300">
          還沒有便籤——寫下第一筆值班記事吧
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((note, index) => (
            <article
              key={note.id}
              className={`sticky-note relative rounded-sm p-5 pt-7 ${NOTE_TINTS[index % NOTE_TINTS.length]} ${
                index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-[0.5deg]'
              }`}
            >
              <p className="whitespace-pre-wrap break-words text-[15px] font-bold leading-relaxed text-[#4a4e69]">
                {note.text}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <time className="font-mono text-[11px] text-[#4a4e69]/50">
                  {new Date(note.createdAt).toLocaleString()}
                </time>
                <div className="flex gap-1">
                  <button
                    onClick={() => togglePin(note.id)}
                    title={note.pinned ? '取消釘選' : '釘選'}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      note.pinned ? 'bg-amber-300 text-white' : 'text-[#4a4e69]/40 hover:bg-white/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">push_pin</span>
                  </button>
                  <button
                    onClick={() => removeNote(note.id)}
                    title="刪除"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#4a4e69]/40 transition-colors hover:bg-white/70 hover:text-red-400"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
