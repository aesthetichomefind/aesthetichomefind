// Minimal front matter parser for the YAML subset used by this project.
// No dependencies. Supports: key: value, "quoted" and 'quoted' text, true/false,
// inline lists [a, b], block lists (- item) and block text (| and >).
// Numbers and dates are kept as text on purpose (an id like 0001 must stay "0001").

class FrontMatterError extends Error {
  constructor(message, line) {
    super(message);
    this.line = line;
  }
}

function parseScalar(raw, line) {
  const s = raw.trim();
  if (s.startsWith('"')) {
    if (s.length < 2 || !s.endsWith('"')) throw new FrontMatterError('text starting with " is missing its closing "', line);
    return s.slice(1, -1).replace(/\\(["\\nt])/g, (m, c) => (c === "n" ? "\n" : c === "t" ? "\t" : c));
  }
  if (s.startsWith("'")) {
    if (s.length < 2 || !s.endsWith("'")) throw new FrontMatterError("text starting with ' is missing its closing '", line);
    return s.slice(1, -1).replace(/''/g, "'");
  }
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null" || s === "~") return null;
  return s;
}

function parseInlineList(raw, line) {
  const inner = raw.trim().slice(1, -1);
  const items = [];
  let current = "";
  let quote = null;
  for (const ch of inner) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === ",") {
      items.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (quote) throw new FrontMatterError("list has an unclosed quote", line);
  if (current.trim() !== "") items.push(current);
  return items.map((item) => parseScalar(item, line));
}

function readBlockScalar(lines, start, style) {
  const collected = [];
  let i = start;
  while (i < lines.length && (lines[i].trim() === "" || /^\s+/.test(lines[i]))) {
    collected.push(lines[i]);
    i++;
  }
  while (collected.length && collected[collected.length - 1].trim() === "") collected.pop();
  const indents = collected.filter((l) => l.trim() !== "").map((l) => l.match(/^\s*/)[0].length);
  const indent = indents.length ? Math.min(...indents) : 0;
  const stripped = collected.map((l) => l.slice(indent));
  let value;
  if (style === "|") {
    value = stripped.join("\n");
  } else {
    value = stripped
      .join("\n")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.split("\n").join(" "))
      .join("\n");
  }
  return { value: value.trim(), next: i };
}

function parseFrontMatter(input) {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = text.split("\n");
  if (lines[0].trimEnd() !== "---") {
    throw new FrontMatterError('file must start with a line containing only "---"', 1);
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trimEnd() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) throw new FrontMatterError('front matter is missing its closing "---" line', 1);

  const fm = lines.slice(1, end);
  const body = lines.slice(end + 1).join("\n").trim();
  const data = {};

  let i = 0;
  while (i < fm.length) {
    const lineNo = i + 2;
    const line = fm[i];
    if (line.trim() === "" || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const match = line.match(/^([A-Za-z_][\w-]*):(?:[ \t]+(.*))?$/);
    if (!match) {
      if (/^\s/.test(line)) throw new FrontMatterError("unexpected indentation", lineNo);
      throw new FrontMatterError('line is not in "name: value" form', lineNo);
    }
    const key = match[1];
    const rest = (match[2] || "").trim();
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      throw new FrontMatterError(`field "${key}" appears twice`, lineNo);
    }

    if (rest === "") {
      let j = i + 1;
      while (j < fm.length && fm[j].trim() === "") j++;
      if (j < fm.length && /^\s*-(\s|$)/.test(fm[j])) {
        const items = [];
        while (j < fm.length) {
          if (fm[j].trim() === "") {
            j++;
            continue;
          }
          const item = fm[j].match(/^\s*-(?:\s+(.*))?$/);
          if (!item) break;
          items.push(parseScalar(item[1] || "", j + 2));
          j++;
        }
        data[key] = items;
        i = j;
      } else {
        data[key] = null;
        i++;
      }
    } else if (/^[|>][+-]?$/.test(rest)) {
      const block = readBlockScalar(fm, i + 1, rest[0]);
      data[key] = block.value;
      i = block.next;
    } else if (rest.startsWith("[")) {
      if (!rest.endsWith("]")) throw new FrontMatterError("list is missing its closing ]", lineNo);
      data[key] = parseInlineList(rest, lineNo);
      i++;
    } else {
      data[key] = parseScalar(rest, lineNo);
      i++;
    }
  }
  return { data, body };
}

module.exports = { parseFrontMatter, FrontMatterError };