import type { MediaType } from "../../movies/types/movie.type";

type UserMediaPanelProps = {
  id: number;
  mediaType: MediaType;
  rating: number | null;
  note: string;
  onChangeRating: (rating: number | null) => void;
  onChangeNote: (note: string) => void;
  onClear: () => void;
};

const ratingValues = Array.from({ length: 10 }, (_, index) => index + 1);

export const UserMediaPanel = ({
  rating,
  note,
  onChangeRating,
  onChangeNote,
  onClear,
}: UserMediaPanelProps) => {
  const hasUserData = rating !== null || note.trim().length > 0;

  return (
    <div>
      <div className="mb-5">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          My Tracker
        </p>

        <h2 className="text-2xl font-bold">Личная оценка и заметка.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Здесь можно поставить оценку и оставить заметку.
        </p>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-200">Моя оценка</p>

        <div className="flex flex-wrap gap-2">
            {ratingValues.map((value) => {
                const isActive = rating === value

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onChangeRating(isActive ? null : value)}
                        className={["h-10 w-10 rounded-full text-sm font-bold transition", isActive 
                            ? "bg-cyan-400 text-slate-950"
                            : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        ].join(" ")}
                    >
                        {value}
                    </button>
                )
            })}
        </div>

        {rating !== null ? (
            <p className="mt-3 text-sm text-cyan-300">Ваша оценка: {rating}/10</p>
        ) : (
            <p className="mt-3 text-sm text-slate-500">Оценка пока не поставлена.</p>
        )}
      </div>

      <div className="mt-6">
        <label htmlFor="user-note" className="mb-3 block text-sm font-semibold text-slate-200">
        Моя заметка
        </label>
        <textarea
            id="user-note"
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            placeholder="Например: посмотреть с друзьями, пересмотреть финал..."
            rows={5}
            className="w-full resize-none rounded-3xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
        />
      </div>

      {hasUserData ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={onClear}
                className="rounded-full border border-red-400/30 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/10"
            >
                Очистить оценку и заметку
            </button>

            <p className="text-sm text-slate-500">
                Сохраняется автоматически.
            </p>
        </div>
      ) : null}
    </div>
  );
};
