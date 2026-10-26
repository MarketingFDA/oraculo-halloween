// Servidor do Oráculo do Halloween (Cloudflare Worker + Durable Object).
// Guarda as cotas de DOCES/TRAVESSURAS de cada filial e as participações.
// Um único Durable Object ("principal") processa um pedido por vez, então
// duas pessoas da mesma filial nunca recebem o mesmo brinde.

const PCT_DOCES = 0.7;

// Quantidade de pessoas por filial (informada pela organização em 26/10/2026).
const FILIAIS_INICIAIS = [
  ["campinas", "Campinas", 18],
  ["curitiba", "Curitiba", 13],
  ["manaus", "Manaus", 10],
  ["pirauba", "Piraúba", 13],
  ["recife", "Recife", 11],
  ["sao-paulo", "São Paulo", 42],
  ["joinville", "Joinville", 12],
  ["brasilia", "Brasília", 14],
  ["espirito-santo", "Espírito Santo", 7],
  ["ribeirao-preto", "Ribeirão Preto", 8],
  ["rio-de-janeiro", "Rio de Janeiro", 180],
  ["belo-horizonte", "Belo Horizonte", 20],
  ["salvador", "Salvador", 24],
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS },
  });
}

function cotaDoces(total) { return Math.round(total * PCT_DOCES); }

// "  Maria  da SILVA " e "maria da silva" contam como a mesma pessoa.
function chaveNome(nome) {
  return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function limparNome(nome) { return String(nome || "").replace(/\s+/g, " ").trim().slice(0, 60); }

function gerarCodigo(seq) {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  let r = "";
  for (const b of bytes) r += letras[b % letras.length];
  return "OH-" + String(seq).padStart(4, "0") + "-" + r;
}

function sorteioJusto(restDoces, restTrav) {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  return n < restDoces / (restDoces + restTrav) ? "DOCES" : "TRAVESSURAS";
}

async function senhaConfere(recebida, esperada) {
  if (!esperada || typeof recebida !== "string") return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(recebida)),
    crypto.subtle.digest("SHA-256", enc.encode(esperada)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export class Oraculo {
  constructor(state, env) {
    this.storage = state.storage;
    this.env = env;
  }

  async config() {
    let cfg = await this.storage.get("config");
    if (!cfg) {
      cfg = {
        ativa: true,
        filiais: FILIAIS_INICIAIS.map(([id, nome, total]) => ({ id, nome, total })),
      };
      await this.storage.put("config", cfg);
    }
    return cfg;
  }

  async participacoes() {
    const mapa = await this.storage.list({ prefix: "p:" });
    return [...mapa.values()].sort((a, b) => a.seq - b.seq);
  }

  async usados(filialId) {
    const lista = await this.storage.list({ prefix: "p:" + filialId + ":" });
    let doces = 0, trav = 0;
    for (const p of lista.values()) p.resultado === "DOCES" ? doces++ : trav++;
    return { doces, trav };
  }

  async fetch(request) {
    const url = new URL(request.url);
    const corpo = request.method === "POST" ? await request.json().catch(() => ({})) : {};
    if (url.pathname === "/api/estado") return this.estado();
    if (url.pathname === "/api/participar") return this.participar(corpo);
    if (url.pathname === "/api/admin") return this.admin(corpo);
    return json({ erro: "nao_encontrado" }, 404);
  }

  async estado() {
    const cfg = await this.config();
    return json({ ativa: cfg.ativa, filiais: cfg.filiais.map((f) => ({ id: f.id, nome: f.nome })) });
  }

  async participar(corpo) {
    const cfg = await this.config();
    const nome = limparNome(corpo.nome);
    const filial = cfg.filiais.find((f) => f.id === corpo.filial);
    if (nome.length < 2) return json({ erro: "nome_invalido" }, 400);
    if (!filial) return json({ erro: "filial_invalida" }, 400);

    const chave = "p:" + filial.id + ":" + chaveNome(nome);
    const existente = await this.storage.get(chave);
    if (existente) return json({ ...existente, repetida: true });
    if (!cfg.ativa) return json({ encerrada: true });

    const usados = await this.usados(filial.id);
    const restDoces = Math.max(0, cotaDoces(filial.total) - usados.doces);
    const restTrav = Math.max(0, filial.total - cotaDoces(filial.total) - usados.trav);
    if (restDoces + restTrav === 0) return json({ esgotada: true, filialNome: filial.nome });

    const seq = ((await this.storage.get("seq")) || 0) + 1;
    const part = {
      seq,
      nome,
      filial: filial.id,
      filialNome: filial.nome,
      resultado: sorteioJusto(restDoces, restTrav),
      codigo: gerarCodigo(seq),
      criadoEm: new Date().toISOString(),
    };
    await this.storage.put({ seq, [chave]: part });
    return json(part);
  }

  async admin(corpo) {
    if (!(await senhaConfere(corpo.senha, this.env.ADMIN_SENHA))) return json({ erro: "senha" }, 401);
    const cfg = await this.config();

    if (corpo.acao === "encerrar" || corpo.acao === "reativar") {
      cfg.ativa = corpo.acao === "reativar";
      await this.storage.put("config", cfg);
    } else if (corpo.acao === "quantidades" && corpo.totais && typeof corpo.totais === "object") {
      for (const f of cfg.filiais) {
        const n = parseInt(corpo.totais[f.id], 10);
        if (Number.isFinite(n) && n >= 0 && n <= 5000) f.total = n;
      }
      await this.storage.put("config", cfg);
    } else if (corpo.acao === "remover" && typeof corpo.chave === "string" && corpo.chave.startsWith("p:")) {
      await this.storage.delete(corpo.chave);
    } else if (corpo.acao === "zerar") {
      const chaves = [...(await this.storage.list({ prefix: "p:" })).keys()];
      for (let i = 0; i < chaves.length; i += 128) await this.storage.delete(chaves.slice(i, i + 128));
      await this.storage.delete("seq");
    }

    const parts = await this.participacoes();
    const filiais = cfg.filiais.map((f) => {
      const d = cotaDoces(f.total), t = f.total - d;
      const doces = parts.filter((p) => p.filial === f.id && p.resultado === "DOCES").length;
      const trav = parts.filter((p) => p.filial === f.id && p.resultado === "TRAVESSURAS").length;
      return { id: f.id, nome: f.nome, total: f.total, cotaDoces: d, cotaTrav: t, doces, trav };
    });
    return json({
      ativa: cfg.ativa,
      filiais,
      participacoes: parts.map((p) => ({ ...p, chave: "p:" + p.filial + ":" + chaveNome(p.nome) })),
    });
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return json({ ok: true, servico: "oraculo-halloween" });
    const stub = env.ORACULO.get(env.ORACULO.idFromName("principal"));
    return stub.fetch(request);
  },
};
