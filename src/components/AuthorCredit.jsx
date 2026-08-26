export default function AuthorCredit() {
  return (
    <div className="fixed bottom-3 right-3 z-[70] rounded-xl border border-slate-700/70 bg-slate-900/85 px-3 py-2 text-[11px] text-slate-300 shadow-lg backdrop-blur-md">
      <p className="leading-none">Author: Macro Zhao</p>
      <a
        href="mailto:macro.ztb@gmail.com"
        className="mt-1 inline-block leading-none text-violet-300 hover:text-violet-200"
      >
        macro.ztb@gmail.com
      </a>
    </div>
  );
}