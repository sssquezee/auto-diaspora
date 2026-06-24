"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const MAX_FILES = 15;
const MAX_SIZE_MB = 10;

type Labels = {
  existingHeading: string;
  newHeading: string;
  dropzoneText: string;
  hintText: string;
  addMore: string;
  removeAria: string;
  undoRemove: string;
  tooLarge: string;
  notImage: string;
};

export type ExistingPhoto = {
  id: string;
  url: string;
};

/** A single position in the final photo order. Existing photos are kept by
 *  id; new uploads are referenced by a temporary key the parent maps to the
 *  uploaded Storage path. */
export type OrderItem =
  | { kind: "existing"; id: string }
  | { kind: "new"; fileKey: string };

export type EditorChange = {
  /** Full unified order, top-to-bottom = position 0..n. First = primary. */
  order: OrderItem[];
  /** New files to upload, keyed so the parent can substitute paths into order. */
  newFiles: { fileKey: string; file: File }[];
  /** Existing photo ids the user marked for deletion. */
  removedIds: string[];
};

type Item =
  | { key: string; kind: "existing"; id: string; url: string }
  | { key: string; kind: "new"; file: File; url: string };

type Props = {
  /** Photos already attached to the listing (sorted by position). */
  existing: ExistingPhoto[];
  /** Fires whenever the order / additions / removals change. */
  onChange: (change: EditorChange) => void;
  labels: Labels;
};

/** One draggable thumbnail. Drag to reorder — mouse, touch (press-and-hold)
 *  and keyboard (focus + space + arrows). */
function SortablePhoto({
  id,
  url,
  isFirst,
  isNew,
  onRemove,
  removeAria,
}: {
  id: string;
  url: string;
  isFirst: boolean;
  isNew: boolean;
  onRemove: () => void;
  removeAria: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-[4/3] bg-bg-subtle border border-line-strong overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={onRemove}
        aria-label={removeAria}
        className="absolute top-1 right-1 w-6 h-6 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white grid place-items-center cursor-pointer transition-colors"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {/* drag grip cue (visual only) */}
      <span
        aria-hidden
        className="absolute top-1 left-1 w-5 h-5 bg-white/85 border border-ink/60 grid place-items-center text-ink"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </span>
      {isFirst && (
        <span className="absolute bottom-1 left-1 bg-accent text-white text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-[0.06em]">
          1
        </span>
      )}
      {isNew && (
        <span className="absolute bottom-1 right-1 bg-ink text-white text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-[0.06em]">
          NEW
        </span>
      )}
    </div>
  );
}

export function PhotosEditor({ existing, onChange, labels }: Props) {
  const [items, setItems] = useState<Item[]>(() =>
    existing.map((p) => ({
      key: `e-${p.id}`,
      kind: "existing" as const,
      id: p.id,
      url: p.url,
    }))
  );
  const [removed, setRemoved] = useState<ExistingPhoto[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  const fileKeyCounter = useRef(0);
  // Track object URLs we created so we can revoke them on unmount.
  const createdUrls = useRef<Set<string>>(new Set());
  useEffect(
    () => () => {
      createdUrls.current.forEach((u) => URL.revokeObjectURL(u));
    },
    []
  );

  // Report the current state up to the parent on every change.
  useEffect(() => {
    const order: OrderItem[] = items.map((it) =>
      it.kind === "existing"
        ? { kind: "existing", id: it.id }
        : { kind: "new", fileKey: it.key }
    );
    const newFiles = items
      .filter((it): it is Extract<Item, { kind: "new" }> => it.kind === "new")
      .map((it) => ({ fileKey: it.key, file: it.file }));
    const removedIds = removed.map((p) => p.id);
    onChange({ order, newFiles, removedIds });
  }, [items, removed, onChange]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldI = prev.findIndex((x) => x.key === active.id);
      const newI = prev.findIndex((x) => x.key === over.id);
      if (oldI === -1 || newI === -1) return prev;
      return arrayMove(prev, oldI, newI);
    });
  };

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (added.length === 0) return;

    const rejects: string[] = [];
    const accepted: File[] = [];
    for (const f of added) {
      if (!f.type.startsWith("image/")) {
        rejects.push(labels.notImage);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        rejects.push(labels.tooLarge);
        continue;
      }
      accepted.push(f);
    }
    setWarning(rejects[0] ?? null);

    const slotsLeft = Math.max(0, MAX_FILES - items.length);
    const toAdd: Item[] = accepted.slice(0, slotsLeft).map((file) => {
      const url = URL.createObjectURL(file);
      createdUrls.current.add(url);
      return { key: `n-${fileKeyCounter.current++}`, kind: "new", file, url };
    });
    setItems((prev) => [...prev, ...toAdd]);
  };

  const removeItem = (key: string) => {
    const it = items.find((x) => x.key === key);
    if (!it) return;
    if (it.kind === "new") {
      URL.revokeObjectURL(it.url);
      createdUrls.current.delete(it.url);
    } else {
      setRemoved((r) =>
        r.some((p) => p.id === it.id) ? r : [...r, { id: it.id, url: it.url }]
      );
    }
    setItems((prev) => prev.filter((x) => x.key !== key));
  };

  const undoRemove = (id: string) => {
    const p = removed.find((x) => x.id === id);
    if (!p) return;
    setRemoved((r) => r.filter((x) => x.id !== id));
    setItems((prev) => [
      ...prev,
      { key: `e-${p.id}`, kind: "existing", id: p.id, url: p.url },
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Unified, draggable photo grid */}
      {items.length > 0 ? (
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted mb-2">
            {labels.existingHeading}
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.key)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {items.map((it, i) => (
                  <SortablePhoto
                    key={it.key}
                    id={it.key}
                    url={it.url}
                    isFirst={i === 0}
                    isNew={it.kind === "new"}
                    onRemove={() => removeItem(it.key)}
                    removeAria={labels.removeAria}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <label className="block border-[2px] border-dashed border-line-strong bg-bg-subtle hover:border-accent hover:bg-accent-soft transition-colors cursor-pointer text-center px-6 py-10">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdd}
            className="hidden"
          />
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-3 text-ink-muted"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="0" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <p className="font-sans font-semibold text-[13px] text-ink mb-1">
            {labels.dropzoneText}
          </p>
          <p className="font-mono text-[11px] text-ink-faded">{labels.hintText}</p>
        </label>
      )}

      {/* Photos marked for deletion — faded, with undo */}
      {removed.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {removed.map((p) => (
            <div
              key={p.id}
              className="relative aspect-[4/3] bg-bg-subtle border border-line-strong overflow-hidden opacity-30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div aria-hidden className="absolute inset-0 grid place-items-center">
                <span className="bg-[#cf222e] text-white font-mono font-bold text-[10px] uppercase tracking-[0.12em] px-2 py-0.5">
                  ✕
                </span>
              </div>
              <button
                type="button"
                onClick={() => undoRemove(p.id)}
                aria-label={labels.undoRemove}
                className="absolute top-1 right-1 w-6 h-6 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white grid place-items-center cursor-pointer transition-colors"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <polyline points="3 3 3 8 8 8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add more */}
      {items.length > 0 && items.length < MAX_FILES && (
        <label className="inline-block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdd}
            className="hidden"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:text-accent underline decoration-accent decoration-2 underline-offset-[3px]">
            + {labels.addMore} ({items.length}/{MAX_FILES})
          </span>
        </label>
      )}

      {warning && <p className="font-mono text-[11px] text-[#cf222e]">{warning}</p>}
    </div>
  );
}
