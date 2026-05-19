const SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export default function OwnerAvatar({ url, login, size = "md" }) {
  if (!url) return null;

  return (
    <img
      src={url}
      alt={login ? `${login} on GitHub` : "Repository owner"}
      className={`${SIZES[size] ?? SIZES.md} shrink-0 rounded-full border-2 border-white bg-slate-100 object-cover shadow-sm ring-1 ring-slate-200/80`}
    />
  );
}
