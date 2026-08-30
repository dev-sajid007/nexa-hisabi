import * as React from "react";

type Toast = { id: number; msg: string; type?: "success" | "error" | "info" };
const Ctx = React.createContext<{ toast: (msg: string, type?: Toast["type"]) => void } | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const toast = React.useCallback((msg: string, type: Toast["type"] = "info") => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white animate-in slide-in-from-bottom-2 ${
            t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-red-600" : "bg-gray-800"
          }`}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast outside provider");
  return ctx;
}
