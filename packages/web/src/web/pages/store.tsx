import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  Fish,
  Menu,
  Check,
  Package,
  ShieldCheck,
  Waves,
} from "lucide-react";

const products = [
  {
    id: "reel",
    name: "Molinete Black River 3000",
    category: "Molinetes",
    price: 389.9,
    old: 459.9,
    image: "reel",
    tag: "ESCOLHA DA CASA",
    description:
      "Precisão em cada recolhimento. Um molinete leve com carretel em alumínio e pegada confortável para acompanhar seus dias à beira d’água.",
    specs: ["Corpo leve e resistente", "Carretel em alumínio", "Uso em água doce"],
  },
  {
    id: "rod",
    name: "Vara Carbon Trail 6’6”",
    category: "Varas",
    price: 279.9,
    old: 329.9,
    image: "rod",
    tag: "PARA IR ALÉM",
    description:
      "Sensibilidade, equilíbrio e um cabo em cortiça que faz toda a diferença. Sua companhia para arremessos mais naturais.",
    specs: ["Acabamento em cortiça", "Construção em carbono", "Ação média rápida"],
  },
  {
    id: "lure",
    name: "Isca Silver Minnow 90",
    category: "Iscas",
    price: 49.9,
    old: 0,
    image: "lure",
    tag: "ESSENCIAL",
    description:
      "Movimento que desperta a atenção. Perfil clássico com acabamento prateado para explorar novos pontos e trabalhar diferentes recolhimentos.",
    specs: ["Perfil minnow", "Acabamento prateado", "Garatéias duplas"],
  },
  {
    id: "bag",
    name: "Bolsa Explorer Waterproof",
    category: "Acessórios",
    price: 219.9,
    old: 269.9,
    image: "bag",
    tag: "TUDO NO LUGAR",
    description:
      "Leve o essencial e deixe o excesso para trás. Compartimentos práticos e alça ajustável para manter seu equipamento por perto.",
    specs: ["Alça ajustável", "Compartimentos organizadores", "Material resistente à água"],
  },
];
type Product = (typeof products)[number];
type Cart = Record<string, number>;
const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function loadCart(): Cart {
  try {
    const data = JSON.parse(localStorage.getItem("mauricio-cart") || "{}");
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key, v]) =>
          products.some((p) => p.id === key) &&
          typeof v === "number" &&
          v > 0 &&
          Number.isInteger(v),
      ),
    );
  } catch {
    return {};
  }
}

export default function Store() {
  const [cart, setCart] = useState<Cart>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [checkout, setCheckout] = useState(false);
  const overlayRef = useRef<HTMLDialogElement>(null);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
  const visible = products.filter(
    (p) =>
      (filter === "Todos" || p.category === filter) &&
      (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    localStorage.setItem("mauricio-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const open = cartOpen || !!selected || searchOpen;
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(
      () => overlayRef.current?.querySelector<HTMLElement>("button,input")?.focus(),
      0,
    );
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCartOpen(false);
        setSelected(null);
        setSearchOpen(false);
      }
      if (e.key === "Tab") {
        const els = Array.from(
          overlayRef.current?.querySelectorAll<HTMLElement>("button,input,a") || [],
        );
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [cartOpen, selected, searchOpen]);
  const add = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    setToast(`${p.name} adicionado à sacola`);
    setCheckout(false);
  };
  const update = (id: string, delta: number) =>
    setCart((c) => {
      const next = { ...c, [id]: (c[id] || 0) + delta };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  const close = () => {
    setCartOpen(false);
    setSelected(null);
    setSearchOpen(false);
  };
  const catalog = () =>
    document.getElementById("equipamentos")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="store" id="inicio">
      <div className="announcement">
        A MELHOR PARTE DO DIA COMEÇA NA ÁGUA.{" "}
        <span>
          ENCONTRE SEU EQUIPAMENTO <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Mauricio Store início">
          <Fish size={33} strokeWidth={1.4} />
          <span>
            MAURICIO<small>STORE / FISHING & OUTDOOR</small>
          </span>
        </a>
        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="#equipamentos" onClick={() => setMenuOpen(false)}>
            Equipamentos
          </a>
          <a href="#experiencia" onClick={() => setMenuOpen(false)}>
            Na natureza
          </a>
          <a href="#sobre" onClick={() => setMenuOpen(false)}>
            Nossa essência
          </a>
        </nav>
        <div className="header-actions">
          <button aria-label="Buscar produtos" onClick={() => setSearchOpen(true)}>
            <Search size={19} />
          </button>
          <button
            className="bag-button"
            aria-label={`Abrir sacola, ${count} produtos`}
            onClick={() => {
              setCartOpen(true);
              setCheckout(false);
            }}
          >
            <ShoppingBag size={18} />
            <span>Sacola</span>
            <b>{count.toString().padStart(2, "0")}</b>
          </button>
          <button
            className="menu-button"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-topline">
            <span>EQUIPAMENTO CERTO. HISTÓRIAS REAIS.</span>
            <span>
              FEITO PARA QUEM VIVE A PESCA <span className="tiny-dot" />
            </span>
          </div>
          <h1>
            VIVA A <span>PESCA.</span>
          </h1>
          <div className="hero-ring" />
          <img
            className="hero-reel"
            src="/images/reel.png"
            alt="Molinete preto com carretel de alumínio, em detalhe"
          />
          <div className="floating-tag">
            <span className="tiny-dot" /> BLACK RIVER SERIES <span>01 / 04</span>
          </div>
          <div className="hero-bottom">
            <div>
              <span className="eyebrow">MAIS QUE UM ESPORTE. UM ESTILO DE VIDA.</span>
              <p>
                O silêncio. O primeiro arremesso.
                <br />A próxima história começa aqui.
              </p>
              <a className="text-link" href="#experiencia">
                Sinta a experiência <ArrowDown size={14} />
              </a>
            </div>
            <div className="hero-product">
              <span className="eyebrow">SEU PRÓXIMO COMPANHEIRO</span>
              <h2>BLACK RIVER 3000</h2>
              <p>Leve na mão. Gigante na experiência.</p>
              <button className="button light" onClick={() => setSelected(products[0])}>
                Conhecer o molinete <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
          <div className="hero-foot">
            <span>ÁGUA DOCE. ALMA LIVRE.</span>
            <span>
              EXPLORE SEM LIMITES <ArrowDown size={13} />
            </span>
          </div>
        </section>
        <div className="benefits">
          <span>
            <Package size={18} /> Equipamentos para cada jornada
          </span>
          <span>
            <ShieldCheck size={18} /> Seleção feita com cuidado
          </span>
          <span>
            <Waves size={18} /> Da primeira à próxima pescaria
          </span>
        </div>
        <section className="catalog section" id="equipamentos">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / PREPARE SUA PRÓXIMA HISTÓRIA</span>
              <h2>
                O ESSENCIAL.
                <br />
                <span>SEM EXCESSO.</span>
              </h2>
            </div>
            <p>
              Escolhas certeiras para quem entende que
              <br />a melhor pescaria começa antes do arremesso.
            </p>
          </div>
          <div className="catalog-tools">
            <div className="filters">
              {["Todos", "Molinetes", "Varas", "Iscas", "Acessórios"].map((f) => (
                <button
                  className={filter === f ? "active" : ""}
                  onClick={() => setFilter(f)}
                  key={f}
                >
                  {f}
                </button>
              ))}
            </div>
            <label className="catalog-search">
              <Search size={16} />
              <input
                aria-label="Filtrar produtos"
                placeholder="Encontre seu equipamento"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="product-grid">
            {visible.map((p) => (
              <article className="product" key={p.id}>
                <button
                  className={`product-visual ${p.image}`}
                  onClick={() => setSelected(p)}
                  aria-label={`Ver detalhes de ${p.name}`}
                >
                  <span className="product-tag">{p.tag}</span>
                  <img src={`/images/${p.image}.png`} alt={p.name} loading="lazy" />
                  <span className="view-product">
                    <ArrowUpRight size={21} />
                  </span>
                </button>
                <div className="product-info">
                  <span className="eyebrow">{p.category}</span>
                  <button className="product-name" onClick={() => setSelected(p)}>
                    {p.name}
                  </button>
                  <div className="product-price">
                    <span>
                      {money(p.price)} {p.old > 0 && <del>{money(p.old)}</del>}
                    </span>
                    <button
                      className="add-button"
                      aria-label={`Adicionar ${p.name} à sacola`}
                      onClick={() => add(p)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <p>ou 3x de {money(p.price / 3)} sem juros*</p>
                </div>
              </article>
            ))}
          </div>
          {visible.length === 0 && (
            <div className="empty">
              <Search />
              <h3>Nenhum equipamento encontrado.</h3>
              <button
                className="text-link"
                onClick={() => {
                  setQuery("");
                  setFilter("Todos");
                }}
              >
                Limpar filtros <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="catalog-note">
            <span>MENOS DISTRAÇÕES. MAIS PESCARIA.</span>
            <span>Catálogo e condições ilustrativos. Sem venda real.</span>
          </div>
        </section>
        <section className="field-story" id="experiencia">
          <img
            src="/images/river.jpg"
            alt="Pescador lançando sua linha em um rio diante de montanhas"
            loading="lazy"
          />
          <div className="field-overlay" />
          <div className="field-top">
            <span className="eyebrow">02 / LÁ FORA É O SEU LUGAR</span>
            <span>FISHING IS A WAY OF LIFE.</span>
          </div>
          <div className="field-content">
            <span className="eyebrow">DESCONECTE DO RUÍDO. CONECTE COM O REAL.</span>
            <h2>
              ONDE A ÁGUA CORRE,
              <br />A VIDA ACONTECE.
            </h2>
            <p>
              Não é só sobre o que você leva para casa.
              <br />É sobre tudo o que encontra pelo caminho.
            </p>
            <button className="button light" onClick={catalog}>
              Encontre seu equipamento <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="field-coordinate">
            UM ARREMESSO DE CADA VEZ. <Waves size={20} />
          </div>
        </section>
        <section className="about section" id="sobre">
          <div className="about-image">
            <img
              src="/images/story.jpg"
              alt="Pescador em contato com a natureza, dentro de um rio cercado por floresta"
              loading="lazy"
            />
            <span>MENOS TELA. MAIS NATUREZA.</span>
          </div>
          <div className="about-copy">
            <span className="eyebrow">03 / A ESSÊNCIA DA MAURICIO STORE</span>
            <h2>
              A PESCA ESTÁ
              <br />
              NO NOSSO <span>DNA.</span>
            </h2>
            <p>
              Tem coisa que só quem pesca entende. A ansiedade de preparar a tralha. A calma de
              esperar. A alegria de sentir a linha ganhar vida.
            </p>
            <p>
              A Mauricio Store nasce dessa paixão. Equipamentos escolhidos para fazer parte da sua
              jornada, do primeiro arremesso àquela pescaria que você nunca vai esquecer.
            </p>
            <a className="text-link" href="#equipamentos">
              Vamos para a próxima? <ArrowUpRight size={17} />
            </a>
            <div className="signature">
              Mauricio Store<span>PESCA DE VERDADE. SEMPRE.</span>
            </div>
          </div>
        </section>
        <section className="faq section">
          <div>
            <span className="eyebrow">ANTES DO PRÓXIMO ARREMESSO</span>
            <h2>
              DÚVIDAS?
              <br />
              SEM NÓS.
            </h2>
          </div>
          <div className="faq-list">
            {[
              [
                "Como escolho meu equipamento?",
                "Comece pelo local e pelo tipo de pesca. Para água doce, combine uma vara equilibrada com um molinete confortável e iscas adequadas ao peixe que deseja buscar. Consulte os detalhes no catálogo.",
              ],
              [
                "Posso comprar por este site?",
                "Este site é uma demonstração. Você pode explorar os produtos e montar sua sacola, mas não há cobrança, pagamento ou envio de pedidos. Produtos, características e preços são ilustrativos.",
              ],
              [
                "Minha sacola fica salva?",
                "Sim. Sua seleção fica salva apenas neste navegador, sem conta e sem banco de dados. Se você apagar os dados do navegador, a sacola também será apagada.",
              ],
              [
                "Os equipamentos servem para água salgada?",
                "Cada equipamento tem uma aplicação diferente. Os produtos desta seleção ilustrativa são voltados principalmente à pesca em água doce. Confira sempre a indicação do fabricante antes de usar.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={17} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="final-cta">
          <span className="eyebrow">A NATUREZA NÃO ESPERA.</span>
          <h2>BORA PESCAR?</h2>
          <button className="button light" onClick={catalog}>
            Preparar minha próxima pescaria <ArrowUpRight size={19} />
          </button>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a href="#inicio" className="brand">
            <Fish size={34} strokeWidth={1.4} />
            <span>
              MAURICIO<small>STORE / FISHING & OUTDOOR</small>
            </span>
          </a>
          <p>Para quem carrega a pesca na alma.</p>
          <a className="text-link" href="#inicio">
            Voltar ao topo <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Mauricio Store.</span>
          <span>Site demonstrativo • Sem pagamentos reais</span>
          <a href="#sobre">Feito de paixão pela pesca.</a>
        </div>
      </footer>
      {toast && (
        <output className="toast">
          <Check size={18} />
          {toast}
          <button aria-label="Fechar aviso" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </output>
      )}
      {(cartOpen || selected || searchOpen) && (
        <div className="overlay">
          <button
            className="overlay-backdrop"
            aria-label="Fechar janela"
            onClick={close}
            tabIndex={-1}
          />
          <dialog
            open
            ref={overlayRef}
            aria-modal="true"
            aria-label={cartOpen ? "Sua sacola" : searchOpen ? "Buscar produtos" : selected?.name}
            className={cartOpen ? "drawer" : searchOpen ? "search-modal" : "product-modal"}
          >
            <button className="close-modal" aria-label="Fechar janela" onClick={close}>
              <X size={23} />
            </button>
            {searchOpen && (
              <>
                <span className="eyebrow">O PRÓXIMO ARREMESSO COMEÇA AQUI</span>
                <h2>O QUE VOCÊ PROCURA?</h2>
                <label className="large-search">
                  <Search size={23} />
                  <input
                    aria-label="Buscar no catálogo"
                    autoFocus
                    placeholder="Molinetes, varas, iscas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <div className="search-results">
                  {products
                    .filter((p) =>
                      (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSelected(p);
                        }}
                      >
                        <img src={`/images/${p.image}.png`} alt="" />
                        <span>
                          {p.name}
                          <small>{money(p.price)}</small>
                        </span>
                        <ArrowUpRight size={18} />
                      </button>
                    ))}
                  {!products.some((p) =>
                    (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase()),
                  ) && <p>Nenhum produto encontrado. Experimente outro termo.</p>}
                </div>
              </>
            )}
            {selected && (
              <>
                <div className={`modal-image ${selected.image}`}>
                  <img src={`/images/${selected.image}.png`} alt={selected.name} />
                </div>
                <div className="modal-copy">
                  <span className="eyebrow">{selected.category} / MAURICIO STORE</span>
                  <h2>{selected.name}</h2>
                  <p>{selected.description}</p>
                  <ul>
                    {selected.specs.map((s) => (
                      <li key={s}>
                        <Check size={15} />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <strong className="modal-price">{money(selected.price)}</strong>
                  <p>3x de {money(selected.price / 3)} sem juros*</p>
                  <button className="button light" onClick={() => add(selected)}>
                    Adicionar à sacola <Plus size={18} />
                  </button>
                  <small>*Produto, preço e condições ilustrativos. Não há pagamento real.</small>
                </div>
              </>
            )}
            {cartOpen && (
              <>
                <span className="eyebrow">SUA PRÓXIMA PESCARIA</span>
                <h2>
                  SACOLA <span>({count})</span>
                </h2>
                <div className="cart-items">
                  {count === 0 ? (
                    <div className="empty">
                      <ShoppingBag size={42} />
                      <h3>
                        Sua sacola está esperando
                        <br />a próxima aventura.
                      </h3>
                      <button
                        className="button light"
                        onClick={() => {
                          close();
                          catalog();
                        }}
                      >
                        Explorar equipamentos <ArrowRight size={17} />
                      </button>
                    </div>
                  ) : (
                    products
                      .filter((p) => cart[p.id])
                      .map((p) => (
                        <div className="cart-item" key={p.id}>
                          <img src={`/images/${p.image}.png`} alt={p.name} />
                          <div>
                            <h3>{p.name}</h3>
                            <span>{money(p.price)}</span>
                            <div className="quantity">
                              <button
                                aria-label={`Diminuir quantidade de ${p.name}`}
                                onClick={() => update(p.id, -1)}
                              >
                                <Minus size={14} />
                              </button>
                              <span>{cart[p.id]}</span>
                              <button
                                aria-label={`Aumentar quantidade de ${p.name}`}
                                onClick={() => update(p.id, 1)}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <button
                            className="remove-item"
                            aria-label={`Remover ${p.name}`}
                            onClick={() =>
                              setCart((c) => {
                                const next = { ...c };
                                delete next[p.id];
                                return next;
                              })
                            }
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))
                  )}
                </div>
                {count > 0 && (
                  <div className="cart-total">
                    <div>
                      <span>Subtotal</span>
                      <strong>{money(total)}</strong>
                    </div>
                    <p>Sem frete ou cobrança. Sacola demonstrativa.</p>
                    <button className="button light" onClick={() => setCheckout(true)}>
                      Concluir simulação <ArrowRight size={18} />
                    </button>
                    {checkout && (
                      <output className="checkout-message">
                        <Check size={19} />
                        <p>
                          Simulação concluída! Sua seleção permanece na sacola. Nenhum pedido foi
                          enviado e nenhum valor será cobrado.
                        </p>
                      </output>
                    )}
                  </div>
                )}
              </>
            )}
          </dialog>
        </div>
      )}
    </div>
  );
}
