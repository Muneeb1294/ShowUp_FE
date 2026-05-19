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
      className={`${SIZES[size] ?? SIZES.md} shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover`}
    />
  );
}
