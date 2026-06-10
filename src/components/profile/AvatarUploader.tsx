import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AvatarUploaderProps {
  name: string;
  currentAvatar?: string;
  onChange: (file: File, previewUrl: string) => void;
}

export default function AvatarUploader({
  name,
  currentAvatar,
  onChange,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>(currentAvatar);

  useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione uma imagem válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem precisa ter no máximo 5 MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file, url);
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-4 text-sm font-semibold text-zinc-900">Foto de perfil</div>

      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-black/5">
          {preview ? (
            <img
              src={preview}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-500">
              {initials || "U"}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handlePick}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            <Camera size={16} />
            Trocar foto
          </button>

          <p className="max-w-xs text-sm text-zinc-500">
            PNG, JPG ou WEBP. Tamanho máximo: 5 MB.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}