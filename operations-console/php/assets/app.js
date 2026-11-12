'use strict';

const $ = (id) => document.getElementById(id);
const fmt = (value) => Number(value || 0).toLocaleString();
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const API = '/control-room/api.php';
let timer;

function table(id, rows, leftHeading, rightHeading) {
  const body = rows.length
    ? rows.map((row) => `<tr><td>${esc(row[0])}</td><td>${fmt(row[1])}</td></tr>`).join('')
    : `<tr><td>No recorded data</td><td>—</td></tr>`;
  $(id).innerHTML = `<table><thead><tr><th>${leftHeading}</th><th>${rightHeading}</th></tr></thead><tbody>${body}</tbody></table>`;
}

async function load() {
  clearTimeout(timer);
  $('refresh').disabled = true;

  // Confirm the session before asking for any numbers, so an expired cookie
  // sends the visitor to the sign-in page instead of flashing error text.
  let session;
  try {
    session = await fetch(`${API}?action=session`, { cache: 'no-store' }).then((r) => r.json());
  } catch {
    $('status').textContent = 'Could not reach the dashboard. Check your connection.';
    $('refresh').disabled = false;
    return;
  }
  if (!session.authenticated) {
    window.location.replace('/control-room/login.html');
    return;
  }

  try {
    const response = await fetch(`${API}?action=summary&days=${$('days').value}`, { cache: 'no-store' });
    if (response.status === 401) {
      window.location.replace('/control-room/login.html');
      return;
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const sum = (key) => data.metrics.filter((row) => row.metric_key === key).reduce((total, row) => total + Number(row.metric_count), 0);
    const snapshot = (provider, key) => data.snapshots.find((row) => row.provider === provider && row.metric_key === key);

    const byDate = {};
    for (const row of data.metrics) {
      byDate[row.metric_date] ??= { views: 0, visitors: 0 };
      if (row.metric_key === 'page_view') byDate[row.metric_date].views += Number(row.metric_count);
      if (row.metric_key === 'unique_visitors') byDate[row.metric_date].visitors += Number(row.metric_count);
    }

    const confirmed = snapshot('emailoctopus', 'subscribed');
    const cards = [
      ['Confirmed subscribers', confirmed?.metric_value, 'EmailOctopus authoritative total'],
      ['Human page views', sum('page_view'), 'Document requests'],
      ['Daily unique estimates', sum('unique_visitors'), 'Rotating keyed hash'],
      ['Retailer clicks', sum('retailer_click'), 'Purchase intent, not sales'],
      ['Newsletter submits', sum('newsletter_attempt'), 'Form submits, not subscriptions'],
      ['Checklist downloads', sum('checklist_download'), 'Resource interest'],
    ];
    $('cards').innerHTML = cards
      .filter((card) => card[1] !== undefined && card[1] !== null)
      .map((card) => `<div class="card"><span>${card[0]}</span><strong>${fmt(card[1])}</strong><small>${card[2]}</small></div>`)
      .join('');

    table('daily', Object.entries(byDate).map(([date, value]) => [`${date} · ${value.visitors} unique`, value.views]), 'Date', 'Views');
    table('funnel', [
      ['Page views', sum('page_view')],
      ['Retailer clicks', sum('retailer_click')],
      ['Newsletter submits', sum('newsletter_attempt')],
      // A missing snapshot means the provider is not connected, which is an unknown
      // total, not a zero one. Printing 0 here asserted something never observed.
      ['Confirmed subscribers', confirmed ? confirmed.metric_value : 'Not connected'],
    ], 'Signal', 'Count');

    const dims = (type) => data.dims.filter((row) => row.dimension_type === type).slice(0, 10).map((row) => [row.dimension_value, row.metric_count]);
    table('pages', dims('landing_page'), 'Page', 'Landings');
    table('sources', dims('source'), 'Source', 'Visits');

    const labels = { subscribed: 'confirmed subscribers', pending: 'pending confirmation', unsubscribed: 'unsubscribed' };
    table('providers', data.snapshots.map((row) => [`EmailOctopus: ${labels[row.metric_key] || row.metric_key}`, row.metric_value]), 'Provider metric', 'Latest');

    const providerError = data.providers?.emailoctopus?.error;
    const warning = providerError ? ` · EmailOctopus refresh delayed (${providerError}); showing last verified snapshot` : '';
    $('status').textContent = `Fresh database query · ${new Date(data.generatedAt).toLocaleString()}${warning}`;
  } catch (error) {
    $('status').textContent = `Dashboard unavailable (${error.message}). No zero values have been inferred.`;
  } finally {
    $('refresh').disabled = false;
    timer = setTimeout(load, 300000);
  }
}

$('refresh').onclick = load;
$('days').onchange = load;
load();
