import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, Image, Video, FileText, X } from "lucide-react";
import { api } from "../api/client";
import toast from "react-hot-toast";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ACCEPT_IMAGES = "image/*";
const ACCEPT_VIDEOS = "video/*";
const ACCEPT_DOCS = ".pdf,.doc,.docx,.txt";

interface Message {
  id: string;
  text: string;
  role: "user" | "support";
  created_at: string;
  attachments?: { name: string; url?: string }[];
}

export default function Support() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => f.size <= MAX_FILE_SIZE);
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
    e.target.value = "";
    setFileMenuOpen(false);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && files.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text || " ");
      if (ticketId) formData.append("ticket_id", ticketId);
      files.forEach((f) => formData.append("files", f));

      const { data } = await api.post("/support/message", formData, {
        headers: { "Content-Type": undefined } as Record<string, unknown>,
        transformRequest: [
          (d, h) => {
            if (d instanceof FormData) delete (h as Record<string, unknown>)["Content-Type"];
            return d;
          },
        ],
      });

      setMessages((prev) => [
        ...prev,
        {
          id: data.id || String(Date.now()),
          text: text || "(вложение)",
          role: "user",
          created_at: new Date().toISOString(),
          attachments: data.attachments || files.map((f) => ({ name: f.name })),
        },
      ]);
      setInput("");
      setFiles([]);
      if (!ticketId && data.ticket_id) setTicketId(data.ticket_id);

      // Эмуляция ответа поддержки (в реальности — WebSocket или polling)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `support-${Date.now()}`,
            text: "Спасибо за обращение. Ваше сообщение получено. Ожидайте ответа в течение 24 часов.",
            role: "support",
            created_at: new Date().toISOString(),
          },
        ]);
      }, 1000);
    } catch {
      toast.error("Ошибка отправки. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Поддержка</h1>
      <p className="text-vg-muted mb-8">Чат с поддержкой. Вы можете прикладывать изображения, видео и документы.</p>

      <div className="flex-1 rounded-xl border border-white/10 bg-vg-surface/30 flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-vg-muted">
              <p>Напишите ваше обращение — мы ответим в течение 24 часов.</p>
              <p className="text-sm mt-2">Поддерживаются изображения, видео и документы (до {MAX_FILES} файлов, макс. 25 МБ)</p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-vg-accent/20 border border-vg-accent/40"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.attachments.map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs text-vg-muted"
                      >
                        <FileText size={12} />
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-vg-muted mt-2">
                  {m.role === "support" ? "Поддержка" : "Вы"} · {new Date(m.created_at).toLocaleString("ru")}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm"
                >
                  {f.type.startsWith("image/") ? (
                    <Image size={16} className="text-vg-accent" />
                  ) : f.type.startsWith("video/") ? (
                    <Video size={16} className="text-vg-accent" />
                  ) : (
                    <FileText size={16} className="text-vg-accent" />
                  )}
                  <span className="truncate max-w-[120px]">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-red-400 hover:text-red-300"
                    aria-label="Удалить"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setFileMenuOpen(!fileMenuOpen)}
                className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-vg-muted"
                aria-label="Прикрепить файл"
              >
                <Paperclip size={20} />
              </button>
              {fileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setFileMenuOpen(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 z-20 flex flex-col gap-1 rounded-lg border border-white/10 bg-vg-surface p-2 shadow-xl">
                    <label className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 cursor-pointer text-sm">
                      <Image size={18} />
                      Изображения
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept={ACCEPT_IMAGES}
                        multiple
                        onChange={handleFileAdd}
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 cursor-pointer text-sm">
                      <Video size={18} />
                      Видео
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept={ACCEPT_VIDEOS}
                        multiple
                        onChange={handleFileAdd}
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 cursor-pointer text-sm">
                      <FileText size={18} />
                      Документы
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPT_DOCS}
                        multiple
                        onChange={handleFileAdd}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
            <input
              type="text"
              placeholder="Введите сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="flex-1 px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || (!input.trim() && files.length === 0)}
              className="p-3 rounded-lg bg-vg-accent text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Отправить"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
