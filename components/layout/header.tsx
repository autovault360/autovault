interface HeaderProps {
  title: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase leading-[1.1]">
        {title}
      </h1>
      {description && (
        <p className="text-[13px] leading-relaxed text-zinc-400 max-w-2xl mx-auto font-normal">
          {description}
        </p>
      )}
      <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
    </div>
  );
}
