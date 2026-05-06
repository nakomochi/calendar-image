<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { style } from '$lib/stores';
  import { EVENT_FIELD_LABELS } from '$lib/types';
  import type { EventDisplayConfig, RowItem } from '$lib/types';

  interface Props {
    store: Writable<EventDisplayConfig>;
    defaultConfig: EventDisplayConfig;
    title?: string;
    // Timetable courses are never all-day, so the all-day UI is suppressed there.
    allowAllDay?: boolean;
  }

  let { store, defaultConfig, title = '予定の表示', allowAllDay = true }: Props = $props();

  // row = -1 represents the hidden pool
  type Loc = { row: number; idx: number };

  let dragFrom = $state<Loc | null>(null);
  let dragOver = $state<{ row: number; idx: number | null } | null>(null);
  let editing = $state<Loc | null>(null);
  let inputEl = $state<HTMLInputElement | null>(null);
  let expandedRow = $state<number | null>(null);

  $effect(() => {
    if (editing && inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  });

  function onDragStart(e: DragEvent, loc: Loc) {
    dragFrom = loc;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    }
  }

  function onDragEnd() {
    dragFrom = null;
    dragOver = null;
  }

  function onDragOverItem(e: DragEvent, row: number, idx: number) {
    if (!dragFrom) return;
    e.preventDefault();
    if (dragOver?.row === row && dragOver.idx === idx) return;
    dragOver = { row, idx };
  }

  function onDragOverZone(e: DragEvent, row: number) {
    if (!dragFrom) return;
    e.preventDefault();
    if (dragOver?.row === row && dragOver.idx === null) return;
    dragOver = { row, idx: null };
  }

  function onDropItem(e: DragEvent, toRow: number, toIdx: number) {
    e.preventDefault();
    move(toRow, toIdx);
  }

  function onDropZone(e: DragEvent, toRow: number) {
    e.preventDefault();
    move(toRow, -1);
  }

  function move(toRow: number, toIdx: number) {
    const from = dragFrom;
    onDragEnd();
    if (!from) return;
    if (from.row === toRow && (toIdx === from.idx || toIdx === from.idx + 1)) return;

    store.update((cfg) => {
      const next = structuredClone(cfg);

      let item: RowItem;
      if (from.row === -1) {
        const field = next.hidden[from.idx];
        next.hidden.splice(from.idx, 1);
        item = { type: 'field', field };
      } else {
        item = next.rows[from.row].items[from.idx];
        next.rows[from.row].items.splice(from.idx, 1);
      }

      let insertIdx = toIdx;
      if (from.row === toRow && toIdx !== -1 && from.idx < toIdx) insertIdx -= 1;

      if (toRow === -1) {
        // Hidden pool only accepts fields; text chips are dropped (deleted)
        if (item.type === 'field') {
          if (insertIdx < 0 || insertIdx > next.hidden.length) next.hidden.push(item.field);
          else next.hidden.splice(insertIdx, 0, item.field);
        }
      } else {
        const target = next.rows[toRow].items;
        if (insertIdx < 0 || insertIdx > target.length) target.push(item);
        else target.splice(insertIdx, 0, item);
      }

      return next;
    });
  }

  function addRow() {
    store.update((cfg) => {
      const next = structuredClone(cfg);
      next.rows.push({ items: [] });
      return next;
    });
  }

  function removeRow(idx: number) {
    store.update((cfg) => {
      const next = structuredClone(cfg);
      const removed = next.rows.splice(idx, 1)[0];
      if (removed) {
        for (const item of removed.items) {
          if (item.type === 'field') next.hidden.push(item.field);
        }
      }
      return next;
    });
    if (expandedRow === idx) expandedRow = null;
    else if (expandedRow !== null && expandedRow > idx) expandedRow -= 1;
  }

  function addText(rowIdx: number) {
    store.update((cfg) => {
      const next = structuredClone(cfg);
      next.rows[rowIdx].items.push({ type: 'text', text: ' ' });
      return next;
    });
    const newIdx = $store.rows[rowIdx].items.length - 1;
    editing = { row: rowIdx, idx: newIdx };
  }

  function updateText(rowIdx: number, itemIdx: number, value: string) {
    store.update((cfg) => {
      const next = structuredClone(cfg);
      const item = next.rows[rowIdx].items[itemIdx];
      if (item?.type === 'text') item.text = value;
      return next;
    });
  }

  function deleteText(rowIdx: number, itemIdx: number) {
    store.update((cfg) => {
      const next = structuredClone(cfg);
      next.rows[rowIdx].items.splice(itemIdx, 1);
      return next;
    });
    if (editing?.row === rowIdx && editing.idx === itemIdx) editing = null;
  }

  function toggleRowSettings(rowIdx: number) {
    expandedRow = expandedRow === rowIdx ? null : rowIdx;
  }

  function setRowFontSize(rowIdx: number, value: number | null) {
    store.update((cfg) => {
      const next = structuredClone(cfg);
      if (value === null) delete next.rows[rowIdx].fontSize;
      else next.rows[rowIdx].fontSize = value;
      return next;
    });
  }

  function setRowBold(rowIdx: number, value: boolean | null) {
    store.update((cfg) => {
      const next = structuredClone(cfg);
      if (value === null) delete next.rows[rowIdx].bold;
      else next.rows[rowIdx].bold = value;
      return next;
    });
  }

  function resetToDefault() {
    store.set(structuredClone(defaultConfig));
    expandedRow = null;
  }

  function isFromMe(row: number, idx: number): boolean {
    return !!dragFrom && dragFrom.row === row && dragFrom.idx === idx;
  }

  function displayText(text: string): string {
    return text === '' ? '空' : text;
  }
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">{title}</h3>

  {#if allowAllDay}
    <label class="flex items-center justify-between text-xs">
      <span>終日の扱い</span>
      <select class="select select-bordered select-xs" bind:value={$store.allDayMode}>
        <option value="label">「終日」と表示</option>
        <option value="omit">時間欄を省略</option>
      </select>
    </label>
  {/if}

  <div class="text-[10px] text-gray-500 leading-snug">
    青チップ＝項目／白チップ＝任意のテキスト。ドラッグで並び替え。「行N」をクリックでサイズ・太字を設定。
  </div>

  {#each $store.rows as row, rowIdx}
    <div class="space-y-1">
      <div
        class="border rounded p-1 flex flex-wrap items-center gap-1 min-h-[34px]"
        class:border-primary={dragOver?.row === rowIdx && dragOver?.idx === null}
        ondragover={(e) => onDragOverZone(e, rowIdx)}
        ondrop={(e) => onDropZone(e, rowIdx)}
        role="list"
      >
        <button
          class="text-[10px] text-gray-500 hover:text-primary px-1 shrink-0 cursor-pointer"
          class:text-primary={expandedRow === rowIdx}
          class:font-bold={expandedRow === rowIdx}
          onclick={() => toggleRowSettings(rowIdx)}
          title="行設定"
        >行{rowIdx + 1}{expandedRow === rowIdx ? ' ▼' : ' ▸'}</button>
        {#each row.items as item, idx}
          {#if item.type === 'field'}
            <span
              class="badge badge-sm badge-primary cursor-grab select-none"
              class:opacity-30={isFromMe(rowIdx, idx)}
              class:outline={dragOver?.row === rowIdx && dragOver?.idx === idx}
              draggable="true"
              ondragstart={(e) => onDragStart(e, { row: rowIdx, idx })}
              ondragend={onDragEnd}
              ondragover={(e) => onDragOverItem(e, rowIdx, idx)}
              ondrop={(e) => onDropItem(e, rowIdx, idx)}
              role="listitem"
            >
              {EVENT_FIELD_LABELS[item.field]}
            </span>
          {:else if editing?.row === rowIdx && editing?.idx === idx}
            <input
              bind:this={inputEl}
              class="input input-bordered input-xs w-20 px-1"
              value={item.text}
              oninput={(e) => updateText(rowIdx, idx, (e.target as HTMLInputElement).value)}
              onblur={() => (editing = null)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') (e.currentTarget as HTMLInputElement).blur();
              }}
            />
          {:else}
            <span
              class="badge badge-sm badge-outline cursor-grab select-none flex items-center gap-1 whitespace-pre"
              class:opacity-30={isFromMe(rowIdx, idx)}
              class:border-primary={dragOver?.row === rowIdx && dragOver?.idx === idx}
              draggable="true"
              ondragstart={(e) => onDragStart(e, { row: rowIdx, idx })}
              ondragend={onDragEnd}
              ondragover={(e) => onDragOverItem(e, rowIdx, idx)}
              ondrop={(e) => onDropItem(e, rowIdx, idx)}
              role="listitem"
            >
              <button class="cursor-text" onclick={() => (editing = { row: rowIdx, idx })}>{displayText(item.text)}</button>
              <button
                class="text-gray-400 hover:text-error leading-none"
                onclick={(e) => {
                  e.stopPropagation();
                  deleteText(rowIdx, idx);
                }}
                aria-label="削除"
              >×</button>
            </span>
          {/if}
        {/each}
        <span class="flex-1"></span>
        <button class="btn btn-ghost btn-xs px-1" onclick={() => addText(rowIdx)} title="テキストを追加">+T</button>
        <button class="btn btn-ghost btn-xs px-1 text-gray-400" onclick={() => removeRow(rowIdx)} title="行を削除（項目は非表示へ）" aria-label="行を削除">✕</button>
      </div>

      {#if expandedRow === rowIdx}
        <div class="border rounded bg-base-100 p-2 ml-3 space-y-1.5">
          <label class="flex items-center justify-between text-xs gap-2">
            <span class="shrink-0">文字サイズ</span>
            <div class="flex items-center gap-1">
              <input
                type="number"
                class="input input-bordered input-xs w-16"
                min="6"
                max="48"
                placeholder={String($style.eventFontSize)}
                value={row.fontSize ?? ''}
                oninput={(e) => {
                  const v = (e.target as HTMLInputElement).value;
                  setRowFontSize(rowIdx, v === '' ? null : Number(v));
                }}
              />
              {#if row.fontSize !== undefined}
                <button class="btn btn-ghost btn-xs px-1" onclick={() => setRowFontSize(rowIdx, null)} title="既定に戻す">↺</button>
              {/if}
            </div>
          </label>
          <label class="flex items-center justify-between text-xs gap-2">
            <span class="shrink-0">太字</span>
            <div class="flex items-center gap-1">
              <select
                class="select select-bordered select-xs"
                value={row.bold === undefined ? 'auto' : row.bold ? 'on' : 'off'}
                onchange={(e) => {
                  const v = (e.target as HTMLSelectElement).value;
                  setRowBold(rowIdx, v === 'auto' ? null : v === 'on');
                }}
              >
                <option value="auto">自動（タイトル行のみ）</option>
                <option value="on">太字</option>
                <option value="off">標準</option>
              </select>
            </div>
          </label>
        </div>
      {/if}
    </div>
  {/each}

  <div class="flex gap-1">
    <button class="btn btn-ghost btn-xs flex-1" onclick={addRow}>+ 行を追加</button>
    <button class="btn btn-ghost btn-xs" onclick={resetToDefault} title="初期設定に戻す">リセット</button>
  </div>

  <div
    class="border-2 border-dashed rounded p-1 flex flex-wrap items-center gap-1 min-h-[32px]"
    class:border-primary={dragOver?.row === -1 && dragOver?.idx === null}
    ondragover={(e) => onDragOverZone(e, -1)}
    ondrop={(e) => onDropZone(e, -1)}
    role="list"
  >
    <span class="text-[10px] text-gray-400 px-1">非表示</span>
    {#each $store.hidden as field, idx}
      {#if allowAllDay || field !== 'allDayLabel'}
        <span
          class="badge badge-sm badge-ghost cursor-grab select-none"
          class:opacity-30={isFromMe(-1, idx)}
          draggable="true"
          ondragstart={(e) => onDragStart(e, { row: -1, idx })}
          ondragend={onDragEnd}
          ondragover={(e) => onDragOverItem(e, -1, idx)}
          ondrop={(e) => onDropItem(e, -1, idx)}
          role="listitem"
        >
          {EVENT_FIELD_LABELS[field]}
        </span>
      {/if}
    {/each}
  </div>
</div>
