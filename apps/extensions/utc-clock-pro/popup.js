let showBadgeSeconds = true;
let use24HourFormat = true;
let panelState = { mode: null, targetTz: null };
let panelPreviewInterval = null;

function getTimeFormatOptions() {
  return {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24HourFormat,
  };
}

const DATE_FORMAT_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

function formatTime(date, timezone) {
  return formatTimeInTimezone(date, timezone, getTimeFormatOptions());
}

function formatDate(date, timezone) {
  return formatDateInTimezone(date, timezone, DATE_FORMAT_OPTIONS);
}

function updateClockDisplay(clockContainer, timezone, now = new Date()) {
  const clockElement = clockContainer.querySelector('.clock');
  const dateElement = clockContainer.querySelector('.date');
  const tzChip = clockContainer.querySelector('.tz-chip');

  clockElement.textContent = formatTime(now, timezone);
  dateElement.textContent = formatDate(now, timezone);

  if (tzChip) {
    tzChip.textContent = getTimezoneShortName(timezone, now);
  }
}

function updateAllClocks() {
  const now = new Date();
  document.querySelectorAll('.clock-container').forEach((clockContainer) => {
    updateClockDisplay(clockContainer, clockContainer.dataset.timezone, now);
  });
}

function flashControlsHint() {
  document.querySelectorAll('.clock-container').forEach((clockContainer) => {
    clockContainer.classList.add('show-controls-hint');
  });

  setTimeout(() => {
    document.querySelectorAll('.clock-container').forEach((clockContainer) => {
      clockContainer.classList.remove('show-controls-hint');
    });
  }, 700);
}

function updatePanelPreview(timezone) {
  const now = new Date();
  const timeEl = document.getElementById('panel-preview-time');
  const chipEl = document.getElementById('panel-preview-chip');
  const metaEl = document.getElementById('panel-preview-meta');

  if (!timeEl || !chipEl || !metaEl) {
    return;
  }

  timeEl.textContent = formatTime(now, timezone);
  chipEl.textContent = getTimezoneShortName(timezone, now);
  metaEl.textContent = getTimezoneDisplayName(timezone, now);
}

function startPanelPreviewTimer() {
  stopPanelPreviewTimer();
  panelPreviewInterval = setInterval(() => {
    const select = document.getElementById('timezone-picker');
    if (select && select.value) {
      updatePanelPreview(select.value);
    }
  }, 1000);
}

function stopPanelPreviewTimer() {
  if (panelPreviewInterval) {
    clearInterval(panelPreviewInterval);
    panelPreviewInterval = null;
  }
}

function updateAddButtonState(clocks) {
  const addBtn = document.getElementById('add-clock-btn');
  if (!addBtn) {
    return;
  }

  const hasAvailable = timezones.some((tz) => !clocks.includes(tz.value));
  addBtn.disabled = !hasAvailable || panelState.mode !== null;
  addBtn.title = hasAvailable ? 'Add another timezone' : 'All timezones are already added';
}

function openTimezonePanel(mode, { clocks, targetTz = null }) {
  const panel = document.getElementById('timezone-panel');
  const addBtn = document.getElementById('add-clock-btn');
  const title = document.getElementById('panel-title');
  const okBtn = document.getElementById('panel-ok-btn');
  const select = document.getElementById('timezone-picker');
  const error = document.getElementById('panel-error');

  if (!panel || !select) {
    return;
  }

  panelState = { mode, targetTz };

  document.querySelectorAll('.clock-container.is-editing').forEach((clockContainer) => {
    clockContainer.classList.remove('is-editing');
  });

  if (mode === 'edit' && targetTz) {
    document.querySelector(`.clock-container[data-timezone="${targetTz}"]`)?.classList.add('is-editing');
  }

  title.textContent = mode === 'add' ? 'Add clock' : 'Edit timezone';
  okBtn.textContent = mode === 'add' ? 'Add' : 'Save';

  const blocked = mode === 'add' ? clocks : clocks.filter((tz) => tz !== targetTz);
  const defaultTz = mode === 'edit'
    ? targetTz
    : timezones.find((tz) => !clocks.includes(tz.value))?.value;

  select.innerHTML = buildTimezoneSelectHtml(defaultTz, new Date(), blocked);

  if (!select.options.length) {
    return;
  }

  error.hidden = true;
  updatePanelPreview(select.value);

  panel.classList.remove('hidden');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-open');
  addBtn.hidden = true;
  select.focus();
  startPanelPreviewTimer();
  updateAddButtonState(clocks);
  syncPopupHeight();
}

function closeTimezonePanel() {
  const panel = document.getElementById('timezone-panel');
  const addBtn = document.getElementById('add-clock-btn');

  if (panel) {
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
  }

  document.body.classList.remove('panel-open');

  if (addBtn) {
    addBtn.hidden = false;
  }

  document.querySelectorAll('.clock-container.is-editing').forEach((clockContainer) => {
    clockContainer.classList.remove('is-editing');
  });

  panelState = { mode: null, targetTz: null };
  stopPanelPreviewTimer();

  getAppState(({ clocks }) => {
    updateAddButtonState(clocks);
    syncPopupHeight();
  });
}

function showPanelError(message) {
  const error = document.getElementById('panel-error');
  if (error) {
    error.textContent = message;
    error.hidden = false;
  }
}

function confirmTimezonePanel() {
  const select = document.getElementById('timezone-picker');
  if (!select || !panelState.mode) {
    return;
  }

  const selectedTz = select.value;

  getAppState(({ clocks }) => {
    if (panelState.mode === 'add') {
      if (clocks.includes(selectedTz)) {
        showPanelError('This clock is already visible.');
        return;
      }

      const newClocks = [...clocks, selectedTz];
      saveAppState({ clocks: newClocks }, () => {
        closeTimezonePanel();
        renderClocks(newClocks);
        updateAllClocks();
        updateAddButtonState(newClocks);
      });
      return;
    }

    if (panelState.mode === 'edit') {
      const currentTz = panelState.targetTz;
      if (selectedTz === currentTz) {
        closeTimezonePanel();
        return;
      }

      if (clocks.includes(selectedTz)) {
        showPanelError('This clock is already visible.');
        return;
      }

      const idx = clocks.indexOf(currentTz);
      if (idx === -1) {
        closeTimezonePanel();
        return;
      }

      const newClocks = clocks.slice();
      newClocks[idx] = selectedTz;
      saveAppState({ clocks: newClocks }, () => {
        closeTimezonePanel();
        renderClocks(newClocks);
        updateAllClocks();
      });
    }
  });
}

function moveClockInArray(clocks, fromIdx, toIdx) {
  const nextClocks = clocks.slice();
  const [item] = nextClocks.splice(fromIdx, 1);
  nextClocks.splice(toIdx, 0, item);
  return nextClocks;
}

const DRAG_HANDLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16" aria-hidden="true"><circle cx="3" cy="3" r="1.4"/><circle cx="9" cy="3" r="1.4"/><circle cx="3" cy="8" r="1.4"/><circle cx="9" cy="8" r="1.4"/><circle cx="3" cy="13" r="1.4"/><circle cx="9" cy="13" r="1.4"/></svg>`;

function syncPopupHeight() {
  document.documentElement.style.height = 'auto';
  document.body.style.height = 'auto';
}

function renderClocks(clocks) {
  const container = document.getElementById('clocks-container');
  container.innerHTML = '';
  container.classList.toggle('single-clock', clocks.length <= 1);

  clocks.forEach((tz, idx) => {
    const clockDiv = document.createElement('div');
    clockDiv.className = 'clock-container';
    clockDiv.dataset.timezone = tz;

    const dragHandleHtml = clocks.length > 1
      ? `<button type="button" class="drag-handle" title="Drag to reorder. First clock shows on toolbar." aria-label="Drag to reorder">
        ${DRAG_HANDLE_SVG}
      </button>`
      : '';

    const iconLabelHtml = idx === 0
      ? '<span class="icon-clock-label">Icon clock</span>'
      : '';

    clockDiv.innerHTML = `
      ${dragHandleHtml}
      <div class="clock-header">
        <div class="clock-controls">
          <button type="button" class="edit-btn" title="Edit timezone" aria-label="Edit timezone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M14.5 5.5L3 17 3 21 7 21 18.5 9.5zM21.2 2.8c-1.1-1.1-2.9-1.1-4 0L16 4l4 4 1.2-1.2C22.3 5.7 22.3 3.9 21.2 2.8z"></path></svg>
          </button>
          <button type="button" class="delete-btn" title="Delete clock" aria-label="Delete clock"${idx === 0 ? ' disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"></path>
            </svg>
          </button>
        </div>
        ${iconLabelHtml}
      </div>
      <div class="time-utc-wrapper">
        <div class="clock"></div>
        <span class="tz-chip">${getTimezoneShortName(tz)}</span>
      </div>
      <div class="date"></div>
    `;
    container.appendChild(clockDiv);
  });

  setupDragAndDrop(container);
  syncPopupHeight();
}

function setupDragAndDrop(container) {
  if (container.classList.contains('single-clock')) {
    return;
  }

  let draggedContainer = null;
  let draggedTz = null;

  function clearDragState() {
    container.querySelectorAll('.clock-container').forEach((clockContainer) => {
      clockContainer.classList.remove('is-dragging', 'drag-over');
    });
    draggedContainer = null;
    draggedTz = null;
  }

  function getClockContainerFromPoint(x, y) {
    if (draggedContainer) {
      draggedContainer.style.pointerEvents = 'none';
    }

    const element = document.elementFromPoint(x, y);

    if (draggedContainer) {
      draggedContainer.style.pointerEvents = '';
    }

    return element ? element.closest('.clock-container') : null;
  }

  function finishDrag(clientX, clientY) {
    const targetContainer = getClockContainerFromPoint(clientX, clientY);

    if (targetContainer && draggedTz && targetContainer.dataset.timezone !== draggedTz) {
      const targetTz = targetContainer.dataset.timezone;
      getAppState(({ clocks }) => {
        const fromIdx = clocks.indexOf(draggedTz);
        const toIdx = clocks.indexOf(targetTz);
        if (fromIdx === -1 || toIdx === -1) {
          clearDragState();
          return;
        }

        const newClocks = moveClockInArray(clocks, fromIdx, toIdx);
        saveAppState({ clocks: newClocks }, () => {
          renderClocks(newClocks);
          updateAllClocks();
        });
      });
      return;
    }

    clearDragState();
  }

  function onPointerMove(event) {
    if (!draggedContainer) {
      return;
    }

    event.preventDefault();
    draggedContainer.classList.add('is-dragging');

    const hoveredContainer = getClockContainerFromPoint(event.clientX, event.clientY);
    container.querySelectorAll('.clock-container').forEach((clockContainer) => {
      if (hoveredContainer && clockContainer === hoveredContainer && clockContainer !== draggedContainer) {
        clockContainer.classList.add('drag-over');
      } else {
        clockContainer.classList.remove('drag-over');
      }
    });
  }

  function onPointerUp(event) {
    if (!draggedContainer) {
      return;
    }

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);

    finishDrag(event.clientX, event.clientY);
  }

  container.querySelectorAll('.drag-handle').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || panelState.mode) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      draggedContainer = handle.closest('.clock-container');
      draggedTz = draggedContainer.dataset.timezone;

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    });
  });
}

function migrateClocksFromStorage(result) {
  let clocks = normalizeStoredClocks(result.clocks);

  if (result.iconClock) {
    const iconTz = migrateTimezoneValue(result.iconClock);
    clocks = clocks.filter((tz) => tz !== iconTz);
    clocks.unshift(iconTz);
  }

  return clocks;
}

function getAppState(cb) {
  chrome.storage.local.get(['clocks', 'iconClock', 'showBadgeSeconds', 'use24HourFormat'], (result) => {
    const clocks = migrateClocksFromStorage(result);
    const migrated = JSON.stringify(clocks) !== JSON.stringify(result.clocks) || Boolean(result.iconClock);

    if (migrated || !result.clocks || !Array.isArray(result.clocks) || result.clocks.length === 0) {
      chrome.storage.local.set({ clocks });
      if (result.iconClock) {
        chrome.storage.local.remove('iconClock');
      }
    }

    cb({ clocks, showBadgeSeconds: result.showBadgeSeconds, use24HourFormat: result.use24HourFormat });
  });
}

function saveAppState(state, cb) {
  const payload = {};
  if (state.clocks) {
    payload.clocks = state.clocks;
  }
  if (state.showBadgeSeconds !== undefined) {
    payload.showBadgeSeconds = state.showBadgeSeconds;
  }
  if (state.use24HourFormat !== undefined) {
    payload.use24HourFormat = state.use24HourFormat;
  }

  chrome.storage.local.set(payload, cb);
}

function syncFormatToggle() {
  const btn12 = document.getElementById('format-12h-btn');
  const btn24 = document.getElementById('format-24h-btn');

  if (btn12) {
    btn12.classList.toggle('is-active', !use24HourFormat);
    btn12.setAttribute('aria-pressed', String(!use24HourFormat));
  }
  if (btn24) {
    btn24.classList.toggle('is-active', use24HourFormat);
    btn24.setAttribute('aria-pressed', String(use24HourFormat));
  }
}

function setUse24HourFormat(nextValue) {
  use24HourFormat = nextValue;
  syncFormatToggle();
  saveAppState({ use24HourFormat }, () => {
    updateAllClocks();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('.slider');
  if (slider) {
    slider.classList.add('no-transition');
    setTimeout(() => slider.classList.remove('no-transition'), 100);
  }

  const checkbox = document.getElementById('seconds-toggle');
  const format12Btn = document.getElementById('format-12h-btn');
  const format24Btn = document.getElementById('format-24h-btn');
  const timezonePicker = document.getElementById('timezone-picker');
  const panelOkBtn = document.getElementById('panel-ok-btn');
  const panelCancelBtn = document.getElementById('panel-cancel-btn');
  const addClockBtn = document.getElementById('add-clock-btn');

  getAppState(({ clocks, showBadgeSeconds: storedSeconds, use24HourFormat: storedFormat }) => {
    if (storedSeconds !== undefined) {
      showBadgeSeconds = storedSeconds;
      if (checkbox) {
        checkbox.checked = showBadgeSeconds;
      }
    }

    if (storedFormat !== undefined) {
      use24HourFormat = storedFormat;
    }
    syncFormatToggle();

    renderClocks(clocks);
    updateAllClocks();
    updateAddButtonState(clocks);
    flashControlsHint();
  });

  if (checkbox) {
    checkbox.addEventListener('change', function() {
      showBadgeSeconds = this.checked;
      saveAppState({ showBadgeSeconds }, () => {});
    });
  }

  if (format12Btn) {
    format12Btn.addEventListener('click', () => {
      if (!use24HourFormat) {
        return;
      }
      setUse24HourFormat(false);
    });
  }

  if (format24Btn) {
    format24Btn.addEventListener('click', () => {
      if (use24HourFormat) {
        return;
      }
      setUse24HourFormat(true);
    });
  }

  if (timezonePicker) {
    timezonePicker.addEventListener('change', function() {
      const error = document.getElementById('panel-error');
      if (error) {
        error.hidden = true;
      }
      updatePanelPreview(this.value);
    });
  }

  if (panelOkBtn) {
    panelOkBtn.addEventListener('click', confirmTimezonePanel);
  }

  if (panelCancelBtn) {
    panelCancelBtn.addEventListener('click', closeTimezonePanel);
  }

  if (addClockBtn) {
    addClockBtn.addEventListener('click', () => {
      getAppState(({ clocks }) => {
        openTimezonePanel('add', { clocks });
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panelState.mode) {
      closeTimezonePanel();
    }
  });

  document.getElementById('clocks-container').addEventListener('click', (e) => {
    const clockContainer = e.target.closest('.clock-container');
    if (!clockContainer) {
      return;
    }

    const tz = clockContainer.dataset.timezone;

    if (e.target.closest('.delete-btn') && !e.target.closest('.delete-btn').disabled) {
      getAppState(({ clocks }) => {
        if (clocks.length <= 1 || clocks[0] === tz) {
          return;
        }

        const newClocks = clocks.filter((clockTz) => clockTz !== tz);
        saveAppState({ clocks: newClocks }, () => {
          renderClocks(newClocks);
          updateAllClocks();
          updateAddButtonState(newClocks);
        });
      });
    }

    if (e.target.closest('.edit-btn')) {
      getAppState(({ clocks }) => {
        openTimezonePanel('edit', { clocks, targetTz: tz });
      });
    }
  });

  setInterval(updateAllClocks, 1000);
});
