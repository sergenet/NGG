import fs from 'node:fs';

const input = new URL('../traffic-data/weekly-kpis.csv', import.meta.url);
const output = new URL('../traffic-data/weekly-report.md', import.meta.url);

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
};

const lines = fs.readFileSync(input, 'utf8').trim().split(/\r?\n/);
const headers = parseCsvLine(lines.shift());
const rows = lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseCsvLine(line)[index] ?? ''])));
const latest = rows.at(-1);
if (!latest) throw new Error('Add at least one weekly KPI row.');

const number = (key) => Number(latest[key] || 0);
const percent = (numerator, denominator) => denominator ? `${((numerator / denominator) * 100).toFixed(2)}%` : 'n/a';
const money = (value) => `$${value.toFixed(2)}`;

const report = `# NewGiftsAndGadgets weekly traffic report

Week starting: ${latest.week_start}

## Acquisition

| Metric | Value |
|---|---:|
| GA sessions | ${number('ga_sessions')} |
| Engaged sessions | ${number('ga_engaged_sessions')} |
| Engagement rate | ${percent(number('ga_engaged_sessions'), number('ga_sessions'))} |
| Search impressions | ${number('search_impressions')} |
| Search clicks | ${number('search_clicks')} |
| Search CTR | ${percent(number('search_clicks'), number('search_impressions'))} |
| Indexed pages | ${number('indexed_pages')} |
| Pinterest impressions | ${number('pinterest_impressions')} |
| Pinterest saves | ${number('pinterest_saves')} |
| Pinterest outbound clicks | ${number('pinterest_outbound_clicks')} |

## Conversion

| Metric | Value |
|---|---:|
| Affiliate clicks | ${number('affiliate_clicks')} |
| Affiliate CTR per session | ${percent(number('affiliate_clicks'), number('ga_sessions'))} |
| Checklist downloads | ${number('file_downloads')} |
| Email subscribers | ${number('email_subscribers')} |
| Email unsubscribes | ${number('email_unsubscribes')} |
| Amazon ordered items | ${number('amazon_ordered_items')} |
| Amazon earnings | ${money(number('amazon_earnings_usd'))} |
| Amazon earnings per affiliate click | ${number('affiliate_clicks') ? money(number('amazon_earnings_usd') / number('affiliate_clicks')) : 'n/a'} |

## Notes

${latest.notes || 'No notes entered.'}

## Decision rule

Do not scale a traffic source from impressions alone. Prioritize pages and channels that produce engaged sessions, retailer clicks, subscribers, and ordered items.
`;

fs.writeFileSync(output, report);
console.log(`Weekly report written to ${output.pathname}`);
